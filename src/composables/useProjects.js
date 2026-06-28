import { ref, watch } from 'vue';
import {
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, where, onSnapshot
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './useFirebase';
import { currentUser, userProfile } from './useAuth.js';
import { useCustomers } from './useCustomers';

// --- Module-level singleton state ---
const projects = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;

const useProjects = () => {

  // ---------------------------------------------------------------
  // Project listener (mirrors useInvoices pattern)
  // ---------------------------------------------------------------
  const setupProjectListener = (profile) => {
    if (unsubscribe) unsubscribe();

    const orgId = profile.orgId || profile.id;
    let q;

    if (profile.role === 'member') {
      q = query(
        collection(db, 'projects'),
        where('orgId', '==', orgId),
        where('assignedMembers', 'array-contains', profile.id)
      );
    } else {
      q = query(
        collection(db, 'projects'),
        where('orgId', '==', orgId)
      );
    }

    unsubscribe = onSnapshot(q, (snapshot) => {
      projects.value = snapshot.docs
        .map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate(),
          updatedAt: d.data().updatedAt?.toDate(),
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      loading.value = false;
    }, (err) => {
      error.value = 'Failed to fetch projects in real-time.';
      console.error(err);
      loading.value = false;
    });
  };

  watch(userProfile, (newProfile) => {
    if (newProfile) {
      loading.value = true;
      setupProjectListener(newProfile);
    } else {
      if (unsubscribe) unsubscribe();
      projects.value = [];
      loading.value = false;
    }
  }, { immediate: true });

  // ---------------------------------------------------------------
  // Project CRUD
  // ---------------------------------------------------------------
  const createProject = async (data) => {
    const profile = userProfile.value;
    if (!profile) throw new Error('Authentication required.');
    if (profile.role !== 'owner') {
      throw new Error('Unauthorized: Only organization owners can create projects.');
    }
    const orgId = profile.orgId || profile.id;
    const userId = profile.id;

    const docRef = await addDoc(collection(db, 'projects'), {
      ...data,
      userId: userId, // Creator
      orgId: orgId,   // Organization
      status: data.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const updateProject = async (id, data) => {
    await updateDoc(doc(db, 'projects', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProject = async (id) => {
    const profile = userProfile.value;
    if (!profile) throw new Error('Authentication required.');
    if (profile.role !== 'owner') {
      throw new Error('Unauthorized: Only organization owners can delete projects.');
    }
    const orgId = profile.orgId || profile.id;
    const snap = await getDoc(doc(db, 'projects', id));
    if (snap.exists() && (snap.data().orgId || snap.data().userId) === orgId) {
      await deleteDoc(doc(db, 'projects', id));
    } else {
      throw new Error('Permission denied or project not found.');
    }
  };

  const getProject = async (id) => {
    const snap = await getDoc(doc(db, 'projects', id));
    if (!snap.exists()) throw new Error('Project not found.');
    const data = snap.data();
    const profile = userProfile.value;
    const orgId = profile?.orgId || profile?.id;
    const projOrgId = data.orgId || data.userId;
    if (projOrgId !== orgId && data.userId !== currentUser.value?.uid) {
      throw new Error('Permission denied.');
    }
    return { id: snap.id, ...data };
  };

  // ---------------------------------------------------------------
  // Entry CRUD (time + expense share one subcollection)
  // ---------------------------------------------------------------

  /**
   * Returns a reactive { entries, loading } object for one project.
   * Caller is responsible for calling stopEntries() on unmount.
   */
  const getEntries = (projectId) => {
    const entries = ref([]);
    const entriesLoading = ref(true);

    const q = query(
      collection(db, 'projects', projectId, 'entries')
    );

    // Safely convert a value that may be a Firestore Timestamp, a date string,
    // a JS Date, or null into a JS Date (or null).
    const toJsDate = (val) => {
      if (!val) return null;
      if (typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
      if (typeof val === 'string' && val.length === 10 && val.includes('-')) return val; // Keep YYYY-MM-DD as string
      return new Date(val); // fallback for other formats
    };

    const stopEntries = onSnapshot(q, (snapshot) => {
      entries.value = snapshot.docs
        .map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            date: toJsDate(data.date),
            createdAt: toJsDate(data.createdAt),
          };
        })
        .sort((a, b) => {
          const aTime = a.date instanceof Date ? a.date.getTime() : (typeof a.date === 'string' ? new Date(a.date).getTime() : 0);
          const bTime = b.date instanceof Date ? b.date.getTime() : (typeof b.date === 'string' ? new Date(b.date).getTime() : 0);
          return bTime - aTime;
        });
      entriesLoading.value = false;
    }, (err) => {
      console.error('Failed to fetch entries:', err);
      entriesLoading.value = false;
    });

    return { entries, entriesLoading, stopEntries };
  };

  /**
   * Add a time or expense entry.
   * If receiptFile is provided, uploads it to Storage and sets receiptUrl.
   */
  const addEntry = async (projectId, entryData, receiptFile = null) => {
    const userId = currentUser.value?.uid;
    if (!userId) throw new Error('Authentication required.');

    let receiptUrl = null;
    if (receiptFile) {
      const fileRef = storageRef(
        storage,
        `receipts/${userId}/${projectId}/${Date.now()}_${receiptFile.name}`
      );
      await uploadBytes(fileRef, receiptFile);
      receiptUrl = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, 'projects', projectId, 'entries'), {
      ...entryData,
      receiptUrl,
      createdAt: serverTimestamp(),
    });
  };

  const updateEntry = async (projectId, entryId, data) => {
    await updateDoc(doc(db, 'projects', projectId, 'entries', entryId), data);
  };

  const deleteEntry = async (projectId, entryId) => {
    await deleteDoc(doc(db, 'projects', projectId, 'entries', entryId));
  };

  // ---------------------------------------------------------------
  // Invoice bridge
  // ---------------------------------------------------------------

  /**
   * Converts a project + its entries into a pre-filled invoice payload.
   * Labor is rolled into one line item; expenses into another.
   */
  const buildInvoicePayload = (project, entries) => {
    const billableTime     = entries.filter(e => e.type === 'time'    && e.billable);
    const billableExpenses = entries.filter(e => e.type === 'expense' && e.billable);

    const totalHours    = billableTime.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
    const laborTotal    = billableTime.reduce((sum, e) => sum + (Number(e.hours) || 0) * (Number(e.rate) || 0), 0);
    const expensesTotal = billableExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const lineItems = [];
    if (laborTotal > 0) {
      lineItems.push({
        description: `Labor — ${totalHours.toFixed(2)} hrs @ ${project.name}`,
        quantity: 1,
        price: laborTotal,
        taxable: false,
      });
    }
    if (expensesTotal > 0) {
      lineItems.push({
        description: `Expenses — ${project.name}`,
        quantity: 1,
        price: expensesTotal,
        taxable: true,
      });
    }

    const { customers } = useCustomers();
    const customer = project.clientId ? customers.value.find(c => c.id === project.clientId) : null;

    const clientPayload = customer ? {
      name: customer.name || project.clientName || '',
      email: customer.email || '',
      address1: customer.address1 || '',
      address2: customer.address2 || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      phone: customer.phone || ''
    } : { name: project.clientName || '' };

    return {
      client: clientPayload,
      items: lineItems,
      notes: `Project: ${project.name}`,
      status: 'pending',
    };
  };

  return {
    // State
    projects,
    loading,
    error,
    // Project CRUD
    createProject,
    updateProject,
    deleteProject,
    getProject,
    // Entry CRUD
    getEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    // Invoice bridge
    buildInvoicePayload,
  };
};

export default useProjects;
