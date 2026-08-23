const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

/**
 * Scheduled Cloud Function running on the 1st of every month at 00:00 UTC.
 * Resets the monthly invoice count for all Free Starter plan users and sets the current billing month.
 */
exports.resetMonthlyInvoiceCounts = onSchedule("0 0 1 * *", async (event) => {
  const db = admin.firestore();
  const currentMonthKey = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  console.log(`[MonthlyReset] Starting monthly invoice reset job for cycle: ${currentMonthKey}...`);

  try {
    const usersSnap = await db.collection("users")
      .where("subscriptionStatus", "==", "free")
      .get();

    if (usersSnap.empty) {
      console.log("[MonthlyReset] No free tier users found to process.");
      return;
    }

    let batch = db.batch();
    let count = 0;
    let totalUpdated = 0;

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      // Reset if user has created invoices or if their month marker is outdated
      if (data.invoiceCount > 0 || data.invoiceCountMonth !== currentMonthKey) {
        batch.update(doc.ref, {
          invoiceCount: 0,
          invoiceCountMonth: currentMonthKey
        });
        count++;
        totalUpdated++;

        // Firestore maximum batch write limit is 500 operations
        if (count >= 400) {
          await batch.commit();
          batch = db.batch();
          count = 0;
        }
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    console.log(`[MonthlyReset] Finished reset. Successfully updated ${totalUpdated} user records.`);
  } catch (error) {
    console.error("[MonthlyReset] Error executing monthly invoice count reset:", error);
  }
});
