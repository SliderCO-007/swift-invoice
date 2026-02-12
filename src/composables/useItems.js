import { ref, onUnmounted } from 'vue';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser as user } from './useAuth';

export const useItems = () => {
  const items = ref([]);
  const loading = ref(true);
  const error = ref(null);
  let unsubscribe = null;

  const itemsCollection = user.value ? collection(db, 'users', user.value.uid, 'items') : null;

  const fetchItems = () => {
    if (!itemsCollection) {
      error.value = new Error("User not authenticated.");
      loading.value = false;
      return;
    }

    loading.value = true;
    const q = query(itemsCollection);

    unsubscribe = onSnapshot(q, (snapshot) => {
      items.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loading.value = false;
    }, (err) => {
      console.error("Error fetching items:", err);
      error.value = err;
      loading.value = false;
    });
  };

  const addItem = async (item) => {
    if (!itemsCollection) return;
    try {
      await addDoc(itemsCollection, item);
    } catch (err) {
      console.error("Error adding item:", err);
      error.value = err;
    }
  };

  const updateItem = async (id, data) => {
    if (!itemsCollection) return;
    try {
      const itemDoc = doc(itemsCollection, id);
      await updateDoc(itemDoc, data);
    } catch (err) {
      console.error("Error updating item:", err);
      error.value = err;
    }
  };

  const deleteItem = async (id) => {
    if (!itemsCollection) return;
    try {
      const itemDoc = doc(itemsCollection, id);
      await deleteDoc(itemDoc);
    } catch (err) {
      console.error("Error deleting item:", err);
      error.value = err;
    }
  };

  const stopFetching = () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };

  onUnmounted(stopFetching);

  return { items, loading, error, fetchItems, addItem, updateItem, deleteItem, stopFetching };
};
