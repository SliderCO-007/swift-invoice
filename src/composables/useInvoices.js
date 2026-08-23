import { ref, watch } from 'vue';
import {
  collection, getDocs, doc, getDoc, updateDoc, serverTimestamp,
  query, where, deleteDoc, runTransaction, setDoc, deleteField, onSnapshot
} from 'firebase/firestore';
import { db, functions } from './useFirebase';
import { httpsCallable } from 'firebase/functions';
import { currentUser, userProfile } from './useAuth.js';

const invoices = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;
let activeOrgId = null;

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

const setupInvoiceListener = (orgId) => {
  if (!orgId) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    activeOrgId = null;
    invoices.value = [];
    loading.value = false;
    return;
  }

  // Prevent teardown and re-subscription loop if already listening to the same orgId
  if (activeOrgId === orgId && unsubscribe) {
    return;
  }

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  activeOrgId = orgId;
  loading.value = true;
  error.value = null;

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
    loading.value = false;
  }, (err) => {
    error.value = 'Failed to fetch invoices in real-time.';
    console.error(err);
    loading.value = false;
  });
};

// Module-level watcher: runs once upon module load rather than per composable instantiation
watch(userProfile, (newProfile) => {
  error.value = null;
  const orgId = newProfile ? (newProfile.orgId || newProfile.id) : null;
  setupInvoiceListener(orgId);
}, { immediate: true });

const useInvoices = () => {
  const fetchInvoices = async (orgId) => {
    const targetOrgId = orgId || (userProfile.value ? (userProfile.value.orgId || userProfile.value.id) : null);
    setupInvoiceListener(targetOrgId);
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

        const currentMonthKey = new Date().toISOString().slice(0, 7);
        let invoiceCount = 0;
        let subscriptionStatus = 'free';

        if (userDoc.exists()) {
          const userData = userDoc.data();
          subscriptionStatus = userData.subscriptionStatus || 'free';
          if (userData.invoiceCountMonth === currentMonthKey) {
            invoiceCount = userData.invoiceCount || 0;
          } else {
            invoiceCount = 0; // New month rollover
          }
        }

        if (subscriptionStatus === 'free' && invoiceCount >= 3) {
          throw new Error("Invoice limit reached for free plan (3 invoices per month). Please upgrade to Pro.");
        }

        const settingsData = settingsDoc.data() || {};
        let currentCounter = settingsData.invoiceCounter || 0;

        const newInvoiceCounter = currentCounter + 1;
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
            invoiceCountMonth: currentMonthKey,
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
          const currentMonthKey = new Date().toISOString().slice(0, 7);
          const userData = userDoc.data();
          const currentCount = userData.invoiceCountMonth === currentMonthKey ? (userData.invoiceCount || 0) : 0;
          transaction.update(userRef, { 
            invoiceCount: Math.max(0, currentCount - 1),
            invoiceCountMonth: currentMonthKey
          });
        }
      });
    } catch (err) {
      error.value = `Failed to delete invoice: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendInvoiceSms = async (invoiceId, clientPhone = '') => {
    loading.value = true;
    error.value = null;
    try {
      const sendSmsFn = httpsCallable(functions, 'sendSmsInvoice');
      const response = await sendSmsFn({ invoiceId, clientPhone });
      return response.data;
    } catch (err) {
      console.error('Error sending SMS invoice:', err);
      error.value = err.message || 'Failed to send SMS invoice.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSmsLogs = async (invoiceId) => {
    try {
      const logsRef = collection(db, 'invoices', invoiceId, 'smsLogs');
      const snapshot = await getDocs(logsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate(),
      })).sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));
    } catch (err) {
      console.error('Error fetching SMS logs:', err);
      return [];
    }
  };

  return { invoices, loading, error, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus, sendInvoiceSms, getSmsLogs };
};

export default useInvoices;
