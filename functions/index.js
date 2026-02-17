const { onCall, HttpsError } = require("firebase-functions/v2/https")
const { onRequest } = require("firebase-functions/v2/https")
const admin = require("firebase-admin")
const { defineString } = require("firebase-functions/params")
const { Resend } = require("resend")

admin.initializeApp()
const db = admin.firestore()

// Define secrets as parameters for security
const stripeSecretKey = defineString("STRIPE_SECRET_KEY")
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET")
const resendApiKey = defineString("RESEND_API_KEY")

/**
 * Creates a Stripe Checkout session for a subscription plan.
 */
exports.createCheckoutSession = onCall({ enforceAppCheck: false }, async (request) => {
  const { auth, data } = request

  // Ensure the user is authenticated
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.')
  }

  const stripe = require("stripe")(stripeSecretKey.value())
  const { priceId, successUrl, cancelUrl } = data

  // Validate required parameters
  if (!priceId) {
    throw new HttpsError('invalid-argument', 'A price ID is required to create a checkout session.')
  }
  if (!successUrl || !cancelUrl) {
    throw new HttpsError('invalid-argument', 'Both a success and cancel URL are required.')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      client_reference_id: auth.uid,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: auth.token.email,
    })

    return { id: session.id, url: session.url }

  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error.message)
    throw new HttpsError('internal', 'An error occurred while creating the checkout session.')
  }
})


/**
 * Handles incoming webhooks from Stripe to update user subscription status in Firestore.
 */
exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = require("stripe")(stripeSecretKey.value())
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret.value())
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }
  
  const handleCheckoutSessionCompleted = async (session) => {
    const uid = session.client_reference_id
    if (!uid) {
      console.error("Webhook received checkout.session.completed without a client_reference_id (uid).")
      return
    }
    try {
      await db.collection('users').doc(uid).update({
        subscriptionStatus: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription
      })
    } catch (dbError) {
      console.error(`Database error activating subscription for user ${uid}:`, dbError)
    }
  }

  const handleSubscriptionDeleted = async (subscription) => {
    const stripeCustomerId = subscription.customer
    const usersQuery = db.collection('users').where('stripeCustomerId', '==', stripeCustomerId)
    const userSnapshot = await usersQuery.get()
    if (userSnapshot.empty) {
      console.error(`Could not find user with Stripe customer ID: ${stripeCustomerId}`)
      return
    }
    userSnapshot.forEach(async (doc) => {
      await doc.ref.update({ subscriptionStatus: 'free' })
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
    }
    res.status(200).json({ received: true })
  } catch(err) {
      console.error('Error handling webhook event:', err)
      res.status(500).send(`Webhook handler failed: ${err.message}`)
  }
})

/**
 * Attaches a client-generated PDF to an email and sends it.
 */
exports.sendInvoiceEmail = onCall({ enforceAppCheck: false }, async (request) => {
    const { auth, data } = request

    // 1. Authentication & Authorization
    if (!auth) {
        throw new HttpsError('unauthenticated', 'Authentication is required.')
    }
    const userDoc = await db.collection('users').doc(auth.uid).get()
    if (!userDoc.exists || userDoc.data().subscriptionStatus === 'free') {
        throw new HttpsError('permission-denied', 'A Pro or Business plan is required to send invoices.')
    }

    // 2. Data Validation
    const { invoiceId, recipientEmail, subject, message, pdfBase64 } = data
    if (!invoiceId || !recipientEmail || !subject || !message || !pdfBase64) {
        throw new HttpsError('invalid-argument', 'Required fields (invoiceId, recipientEmail, subject, message, pdfBase64) are missing.')
    }

    try {
        // 3. Fetch Invoice for Validation and Filename
        const invoiceRef = db.collection('invoices').doc(invoiceId)
        const invoiceDoc = await invoiceRef.get()

        if (!invoiceDoc.exists) {
            throw new HttpsError('not-found', 'Invoice not found.')
        }
        const invoiceData = invoiceDoc.data()
        if (invoiceData.userId !== auth.uid) {
            throw new HttpsError('permission-denied', 'You do not have permission to send this invoice.')
        }

        // 4. Convert Base64 PDF to a Buffer
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        // 5. Send Email with the PDF Attachment
        const resend = new Resend(resendApiKey.value())
        await resend.emails.send({
            from: 'no-reply@swiftinvoice.biz',
            to: recipientEmail,
            subject: subject,
            html: message, // Message is already HTML formatted from the client
            attachments: [{
                filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
                content: pdfBuffer,
            }],
        })

        return { success: true, message: `Invoice sent to ${recipientEmail}` }

    } catch (error) {
        console.error("Error sending invoice email:", error)
        if (error instanceof HttpsError) throw error
        throw new HttpsError('internal', 'An unexpected error occurred while sending the email.')
    }
})
