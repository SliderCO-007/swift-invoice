import { ref, onUnmounted } from 'vue';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function useInvoices() {
  const invoices = ref([]);
  const loading = ref(false);
  const error = ref(null);

  let unsubscribe = null;

  // Fetch user's invoices in real-time
  const fetchInvoices = () => {
    if (auth.currentUser) {
      loading.value = true;
      const q = query(collection(db, 'invoices'), where('uid', '==', auth.currentUser.uid));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        invoices.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        loading.value = false;
      }, (err) => {
        error.value = err;
        loading.value = false;
      });
    }
  };

  // Add a new invoice
  const addInvoice = async (invoiceData) => {
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'invoices'), {
          ...invoiceData,
          uid: auth.currentUser.uid
        });
      } catch (err) {
        error.value = err;
      }
    }
  };

  // Unsubscribe from the snapshot listener when the component is unmounted
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  return { invoices, loading, error, fetchInvoices, addInvoice };
}
