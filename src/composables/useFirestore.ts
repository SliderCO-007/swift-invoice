import { ref } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export function useFirestore() {
  const clients = ref([]);
  const invoices = ref([]);
  const error = ref(null);

  const addClient = async (clientData) => {
    try {
      const docRef = await addDoc(collection(db, 'clients'), clientData);
      return docRef.id;
    } catch (e) {
      error.value = e.message;
    }
  };

  const getClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      clients.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      error.value = e.message;
    }
  };

  const addInvoice = async (invoiceData) => {
    try {
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      return docRef.id;
    } catch (e) {
      error.value = e.message;
    }
  };

  const getInvoices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'invoices'));
      invoices.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      error.value = e.message;
    }
  };

  return {
    clients,
    invoices,
    error,
    addClient,
    getClients,
    addInvoice,
    getInvoices
  };
}
