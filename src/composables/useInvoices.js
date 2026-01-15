import { ref } from 'vue';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, runTransaction, serverTimestamp, query, where, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Import auth to get the current user

const useInvoices = () => {
  const invoices = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const invoicesCollection = collection(db, 'invoices');

  // Definitive date parsing helper.
  const parseFirestoreDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate(); // Firestore Timestamp
    if (date instanceof Date) return date; // Already a Date object
    const parsed = new Date(date); // Handle ISO strings or other date formats
    return isNaN(parsed) ? null : parsed; // Return null if invalid, not an "Invalid Date" object
  };

  const calculateTotal = (invoice) => {
    const subtotal = (invoice.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
    return subtotal + taxAmount;
  };

  // Re-written to ensure data integrity.
  const getInvoices = async () => {
    loading.value = true;
    error.value = null;
    if (!auth.currentUser) {
      invoices.value = [];
      error.value = "User is not authenticated.";
      loading.value = false;
      return;
    }
    try {
      const q = query(invoicesCollection, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      invoices.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Structure is critical: Spread data first, then explicitly set the ID last to prevent overwrites.
        return {
          ...data,
          issueDate: parseFirestoreDate(data.issueDate),
          dueDate: parseFirestoreDate(data.dueDate),
          id: doc.id, 
        };
      });
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Re-written to ensure data integrity.
  const getInvoice = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Add a security check to ensure the user can only access their own invoice
        if (data.userId !== auth.currentUser.uid) {
          throw new Error("You don't have permission to view this invoice.");
        }
        // Structure is critical: Spread data first, then explicitly set the ID last.
        return {
          ...data,
          issueDate: parseFirestoreDate(data.issueDate),
          dueDate: parseFirestoreDate(data.dueDate),
          id: docSnap.id,
        };
      } else {
        throw new Error('Invoice not found');
      }
    } catch (err) {
      error.value = err.message;
      throw err; 
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

      const newInvoiceNumber = await runTransaction(db, async (transaction) => {
        const userSettingsDoc = await transaction.get(userSettingsRef);
        const currentCounter = userSettingsDoc.exists() && userSettingsDoc.data().invoiceCounter ? userSettingsDoc.data().invoiceCounter : 0;
        const newCounter = currentCounter + 1;
        transaction.set(userSettingsRef, { invoiceCounter: newCounter }, { merge: true });
        return newCounter;
      });

      const invoiceNumber = String(newInvoiceNumber).padStart(8, '0');
      
      const invoiceWithTotal = {
        ...newInvoice,
        invoiceNumber,
        total: calculateTotal(newInvoice),
        createdAt: serverTimestamp(),
        status: newInvoice.status || 'pending',
        userId: auth.currentUser.uid,
      };
      delete invoiceWithTotal.id; // Ensure no phantom ID is saved in the document data.

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

  const markAsPaid = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, { status: 'Paid' });
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoice = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      await deleteDoc(docRef);
      invoices.value = invoices.value.filter(inv => inv.id !== id);
    } catch (err) { 
      error.value = err.message;
      throw err;
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
    markAsPaid,
    deleteInvoice,
  };
};

export default useInvoices;
