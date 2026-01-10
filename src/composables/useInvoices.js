import { ref } from 'vue';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const useInvoices = () => {
  const invoices = ref([]);
  const invoice = ref(null);
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
          issueDate: data.issueDate ? data.issueDate : null,
          dueDate: data.dueDate ? data.dueDate : null,
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
        invoice.value = {
          id: docSnap.id,
          ...data,
          issueDate: data.issueDate ? data.issueDate : null,
          dueDate: data.dueDate ? data.dueDate : null,
        };
      } else {
        error.value = 'Invoice not found';
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async (newInvoice) => {
    loading.value = true;
    error.value = null;
    try {
      const invoiceWithTotal = {
        ...newInvoice,
        total: calculateTotal(newInvoice),
      };
      const docRef = await addDoc(invoicesCollection, invoiceWithTotal);
      return docRef.id;
    } catch (err) {
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
    invoice,
    loading,
    error,
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
  };
};

export default useInvoices;
