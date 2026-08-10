import { ref, watch } from 'vue';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, where, onSnapshot
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './useFirebase';
import { currentUser, userProfile } from './useAuth.js';
import { useCustomers } from './useCustomers';

// --- Module-level singleton state ---
const projects = ref([]);
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;
let activeProjectsOrgId = null;

const setupProjectListener = (profile) => {
  const orgId = profile?.orgId || profile?.id || null;

  if (!orgId) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    activeProjectsOrgId = null;
    projects.value = [];
    loading.value = false;
    return;
  }

  // Prevent teardown and re-subscription loop if already listening to the same orgId
  if (activeProjectsOrgId === orgId && unsubscribe) {
    return;
  }

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  activeProjectsOrgId = orgId;
  loading.value = true;
  error.value = null;

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

// Module-level watcher: runs once upon module load rather than per composable instantiation
watch(userProfile, (newProfile) => {
  setupProjectListener(newProfile);
}, { immediate: true });

const useProjects = () => {

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

  const deleteReceiptStorageFile = async (receiptUrl) => {
    if (!receiptUrl) return;
    try {
      const fileRef = storageRef(storage, receiptUrl);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn('Could not delete storage receipt image:', err);
    }
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
      // 1. Cascading delete of all subcollection entries and receipt images
      const entriesSnap = await getDocs(collection(db, 'projects', id, 'entries'));
      const deletePromises = entriesSnap.docs.map(async (entryDoc) => {
        const data = entryDoc.data();
        if (data.receiptUrl) {
          await deleteReceiptStorageFile(data.receiptUrl);
        }
        await deleteDoc(entryDoc.ref);
      });
      await Promise.all(deletePromises);

      // 2. Delete parent project document
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
   * If receiptFile is provided, uploads it to Storage and sets receiptUrl & receiptName.
   */
  const addEntry = async (projectId, entryData, receiptFile = null, customFileName = null) => {
    const userId = currentUser.value?.uid;
    if (!userId) throw new Error('Authentication required.');

    let receiptUrl = null;
    let receiptName = null;

    if (receiptFile) {
      // Extract original extension if available
      const origName = receiptFile.name || 'receipt.jpg';
      const extMatch = origName.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? `.${extMatch[1]}` : '';

      let rawName = (customFileName && customFileName.trim()) ? customFileName.trim() : origName;
      // If user typed a custom name without extension, append original extension
      if (ext && !rawName.toLowerCase().endsWith(ext.toLowerCase())) {
        if (!/\.[a-zA-Z0-9]+$/.test(rawName)) {
          rawName += ext;
        }
      }

      // Sanitize for storage path
      const sanitizedStorageName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(
        storage,
        `receipts/${userId}/${projectId}/${Date.now()}_${sanitizedStorageName}`
      );
      await uploadBytes(fileRef, receiptFile);
      receiptUrl = await getDownloadURL(fileRef);
      receiptName = rawName;
    }

    await addDoc(collection(db, 'projects', projectId, 'entries'), {
      ...entryData,
      receiptUrl,
      receiptName: receiptName || entryData.receiptName || null,
      createdBy: userId,
      createdByName: userProfile.value?.name || userProfile.value?.email || 'Unknown',
      createdAt: serverTimestamp(),
    });
  };

  const updateEntry = async (projectId, entryId, data) => {
    await updateDoc(doc(db, 'projects', projectId, 'entries', entryId), data);
  };

  const deleteEntry = async (projectId, entryId, receiptUrl = null) => {
    let urlToDelete = receiptUrl;
    if (!urlToDelete) {
      try {
        const snap = await getDoc(doc(db, 'projects', projectId, 'entries', entryId));
        if (snap.exists()) {
          urlToDelete = snap.data().receiptUrl || null;
        }
      } catch (e) {
        // ignore fetch error
      }
    }
    if (urlToDelete) {
      await deleteReceiptStorageFile(urlToDelete);
    }
    await deleteDoc(doc(db, 'projects', projectId, 'entries', entryId));
  };

  // ---------------------------------------------------------------
  // Invoice bridge
  // ---------------------------------------------------------------

  /**
   * Converts a project + its entries into a pre-filled invoice payload.
   * Labor is rolled into one line item; expenses into another.
   */
  const buildInvoicePayload = (project, entries, options = {}) => {
    const { groupEntries = false } = options;
    const billableTime     = entries.filter(e => e.type === 'time'    && e.billable);
    const billableExpenses = entries.filter(e => e.type === 'expense' && e.billable);

    const lineItems = [];

    if (groupEntries) {
      const totalHours    = billableTime.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
      const laborTotal    = billableTime.reduce((sum, e) => sum + (Number(e.hours) || 0) * (Number(e.rate) || 0), 0);
      const expensesTotal = billableExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

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
    } else {
      // Individual entries behavior (default)
      billableTime.forEach(e => {
        const hours = Number(e.hours) || 0;
        const rate = Number(e.rate) || 0;
        const lineTotal = hours * rate;
        
        if (lineTotal > 0) {
          lineItems.push({
            description: `Labor: ${e.description || 'Time Entry'} (${e.date}) - ${hours} hours @ $${rate}/hr`,
            quantity: 1,
            price: lineTotal,
            taxable: false,
          });
        }
      });

      billableExpenses.forEach(e => {
        const amount = Number(e.amount) || 0;
        
        if (amount > 0) {
          const category = e.category || 'Expense';
          const description = e.description || 'Unspecified';
          lineItems.push({
            description: `${category}: ${description} (${e.date})`,
            quantity: 1,
            price: amount,
            taxable: true,
          });
        }
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
    deleteReceiptStorageFile,
    // Invoice bridge
    buildInvoicePayload,
  };
};

export default useProjects;
