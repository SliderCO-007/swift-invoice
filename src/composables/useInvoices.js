import { ref, watch } from 'vue';
import {
  collection, getDocs, doc, getDoc, updateDoc, serverTimestamp,
  query, where, deleteDoc, runTransaction, setDoc, deleteField, onSnapshot
} from 'firebase/firestore';
import { db } from './useFirebase';
import { currentUser, userProfile } from './useAuth.js';

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;

const useInvoices = () => {

  const setupInvoiceListener = (orgId) => {
    if (unsubscribe) {
      unsubscribe();
    }
    const invoicesCollection = collection(db, 'invoices');
    const q = query(invoicesCollection, where('orgId', '==', orgId));

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      invoices.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
          paidAt: data.paidAt?.toDate(),
          total: calculateTotal(data),
        };
      });
    }, (err) => {
      error.value = 'Failed to fetch invoices in real-time.';
      console.error(err);
    });
  };

  const fetchInvoices = async (orgId) => {
    loading.value = true;
    error.value = null;
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    if (!orgId) {
      invoices.value = [];
      loading.value = false;
      return;
    }

    try {
      const invoicesCollection = collection(db, 'invoices');
      const q = query(invoicesCollection, where('orgId', '==', orgId));
      const querySnapshot = await getDocs(q);
      invoices.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
          paidAt: data.paidAt?.toDate(),
          total: calculateTotal(data),
        };
      });
      setupInvoiceListener(orgId);
    } catch (err) {
      error.value = 'Failed to fetch invoices.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  watch(userProfile, (newProfile) => {
    error.value = null;
    if (newProfile) {
      fetchInvoices(newProfile.orgId || newProfile.id);
    } else {
      invoices.value = [];
    }
  }, { immediate: true });

  const calculateTotal = (invoice) => {
    const subtotal = (invoice.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const taxableSubtotal = (invoice.items || []).reduce((acc, item) => {
      const isTaxable = item.taxable !== false;
      return acc + (isTaxable ? (item.quantity || 0) * (item.price || 0) : 0);
    }, 0);
    
    let discountAmount = 0;
    if (invoice.discount) {
      if (invoice.discountType === 'percentage') {
        discountAmount = subtotal * (Number(invoice.discount) / 100);
      } else {
        discountAmount = Number(invoice.discount);
      }
    }
    
    const postDiscountSubtotal = subtotal - discountAmount;
    
    const rate = Number(invoice.taxRate) || 0;
    let taxAmount = 0;
    if (rate > 0 && subtotal > 0) {
      const ratio = taxableSubtotal / subtotal;
      const postDiscountTaxableSubtotal = taxableSubtotal - (discountAmount * ratio);
      taxAmount = Math.max(0, postDiscountTaxableSubtotal) * (rate / 100);
    }
    
    return postDiscountSubtotal + taxAmount;
  };

  const getInvoice = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'invoices', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile = userProfile.value;
        const orgId = profile?.orgId || profile?.id;
        const invOrgId = data.orgId || data.userId;
        
        if (invOrgId === orgId || data.userId === currentUser.value?.uid) {
          return {
            id: docSnap.id,
            ...data,
            issueDate: data.issueDate?.toDate(),
            dueDate: data.dueDate?.toDate(),
            paidAt: data.paidAt?.toDate(),
          };
        }
      }
      throw new Error('Invoice not found or permission denied');
    } catch (err) {
      error.value = `Failed to fetch invoice: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async (invoiceData) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("Authentication required.");
    if (profile.role !== 'owner') {
      throw new Error("Unauthorized: Only organization owners can create invoices.");
    }
    const orgId = profile.orgId || profile.id;
    const userId = profile.id;

    loading.value = true;
    error.value = null;

    try {
      const newInvoiceId = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", orgId);
        const settingsRef = doc(db, "userSettings", orgId);

        const userDoc = await transaction.get(userRef);
        const settingsDoc = await transaction.get(settingsRef);

        let invoiceCount = 0;
        let subscriptionStatus = 'free';

        if (userDoc.exists()) {
          const userData = userDoc.data();
          invoiceCount = userData.invoiceCount || 0;
          subscriptionStatus = userData.subscriptionStatus || 'free';
        }

        if (subscriptionStatus === 'free' && invoiceCount >= 5) {
          throw new Error("Invoice limit reached for free plan. Please upgrade.");
        }

        const newInvoiceCounter = (settingsDoc.data()?.invoiceCounter || 0) + 1;
        const invoiceNumber = String(newInvoiceCounter).padStart(6, '0');

        const newInvoiceRef = doc(collection(db, 'invoices'));
        transaction.set(newInvoiceRef, {
          ...invoiceData,
          invoiceNumber,
          userId: userId, // Creator
          orgId: orgId,   // Organization
          createdAt: serverTimestamp(),
          svcFeePaid: false,
        });

        const newInvoiceCount = invoiceCount + 1;

        if (userDoc.exists()) {
          transaction.update(userRef, { 
            invoiceCount: newInvoiceCount,
            subscriptionStatus: subscriptionStatus
          });
        }

        if (settingsDoc.exists()) {
          transaction.update(settingsRef, { invoiceCounter: newInvoiceCounter });
        } else {
          transaction.set(settingsRef, {
            invoiceCounter: newInvoiceCounter,
            company: { name: '', address: '', email: '', phone: '' },
            invoiceSettings: { defaultDueDateDays: 30, defaultTaxRate: 0 },
            updatedAt: serverTimestamp(),
          });
        }

        return newInvoiceRef.id;
      });

      return newInvoiceId;
    } catch (err) {
      console.error("Error in createInvoice transaction:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };


  const updateInvoice = async (id, invoiceData) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      error.value = 'Failed to update invoice.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    loading.value = true;
    try {
      const docRef = doc(db, 'invoices', id);
      const updateData = { status, updatedAt: serverTimestamp() };
      if (status === 'paid') {
        updateData.paidAt = serverTimestamp();
      } else {
        updateData.paidAt = deleteField();
      }
      await updateDoc(docRef, updateData);
    } catch (err) {
      error.value = 'Failed to update status.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoice = async (id) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("Authentication required.");
    if (profile.role !== 'owner') {
      throw new Error("Unauthorized: Only organization owners can delete invoices.");
    }
    const orgId = profile.orgId || profile.id;

    loading.value = true;
    try {
      await runTransaction(db, async (transaction) => {
        const invoiceRef = doc(db, 'invoices', id);
        const userRef = doc(db, 'users', orgId);

        const invoiceDoc = await transaction.get(invoiceRef);
        const userDoc = await transaction.get(userRef);

        const data = invoiceDoc.data();
        const invOrgId = data?.orgId || data?.userId;

        if (!invoiceDoc.exists() || invOrgId !== orgId) {
          throw new Error("Invoice not found or permission denied.");
        }

        transaction.delete(invoiceRef);
        
        if (userDoc.exists()) {
            const currentCount = userDoc.data().invoiceCount || 0;
            transaction.update(userRef, { invoiceCount: Math.max(0, currentCount - 1) });
        }
      });
    } catch (err) {
      error.value = `Failed to delete invoice: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { invoices, loading, error, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus };
};

export default useInvoices;
