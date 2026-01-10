import { ref } from 'vue';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Import auth to get the current user

const useInvoices = () => {
  const invoices = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const invoicesCollection = collection(db, 'invoices');

  const calculateTotal = (invoice) => {
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
    return subtotal + taxAmount;
  };

  const getInvoices = async () => {
    loading.value = true;
    error.value = null;
    try {
      const querySnapshot = await getDocs(invoicesCollection);
      invoices.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate && data.issueDate.toDate ? data.issueDate.toDate() : null,
          dueDate: data.dueDate && data.dueDate.toDate ? data.dueDate.toDate() : null,
        };
      });
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getInvoice = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          issueDate: data.issueDate && data.issueDate.toDate ? data.issueDate.toDate() : null,
          dueDate: data.dueDate && data.dueDate.toDate ? data.dueDate.toDate() : null,
        };
      } else {
        error.value = 'Invoice not found';
        return null;
      }
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async (newInvoice) => {
    loading.value = true;
    error.value = null;

    if (!auth.currentUser) {
      error.value = "User is not authenticated.";
      loading.value = false;
      throw new Error(error.value);
    }

    try {
      const userSettingsRef = doc(db, 'userSettings', auth.currentUser.uid);

      // Use a transaction to safely increment the user-specific counter
      const newInvoiceNumber = await runTransaction(db, async (transaction) => {
        const userSettingsDoc = await transaction.get(userSettingsRef);
        
        let currentCounter = 0;
        if (userSettingsDoc.exists() && userSettingsDoc.data().invoiceCounter) {
          currentCounter = userSettingsDoc.data().invoiceCounter;
        }

        const newCounter = currentCounter + 1;
        transaction.set(userSettingsRef, { invoiceCounter: newCounter }, { merge: true });
        
        return newCounter;
      });

      const invoiceNumber = String(newInvoiceNumber).padStart(8, '0');
      
      const invoiceWithTotal = {
        ...newInvoice,
        invoiceNumber, // Add the user-specific invoice number
        total: calculateTotal(newInvoice),
        createdAt: serverTimestamp(),
        status: newInvoice.status || 'pending',
        userId: auth.currentUser.uid, // Tag the invoice with the user's ID
      };

      const docRef = await addDoc(invoicesCollection, invoiceWithTotal);
      return docRef.id;

    } catch (err) {
      console.error("Error creating invoice: ", err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateInvoice = async (id, updatedInvoice) => {
    loading.value = true;
    error.value = null;
    try {
      const invoiceWithTotal = {
        ...updatedInvoice,
        total: calculateTotal(updatedInvoice),
      };
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, invoiceWithTotal);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    invoices,
    loading,
    error,
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
  };
};

export default useInvoices;
