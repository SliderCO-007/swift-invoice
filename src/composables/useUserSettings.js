import { ref, watchEffect } from 'vue';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, functions } from './useFirebase';
import { httpsCallable } from 'firebase/functions';
import { currentUser, userProfile } from './useAuth';

function getInitialSettings() {
  return {
    company: {
      name: '', email: '', phone: '', address1: '', address2: '', city: '', state: '', zip: '',
      logoUrl: '/Logo.png', primaryColor: '#1a3a52'
    },
    taxRate: 0,
    defaultDiscount: 0,
    defaultDiscountType: 'percentage',
    invoiceCounter: 0,
    currency: 'USD',
    reminderSettings: {
      enabled: true,
      triggers: ['3_days_before', 'on_due_date', '7_days_overdue']
    }
  };
}


const settings = ref(getInitialSettings());
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;

watchEffect(() => {
  error.value = null;
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const profile = userProfile.value;
  if (profile) {
    loading.value = true;
    const orgId = profile.orgId || profile.id;
    const docRef = doc(db, 'userSettings', orgId);
    
    unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        settings.value = { 
            ...getInitialSettings(), 
            ...data, 
            company: { ...getInitialSettings().company, ...(data.company || {}) }
        };
      } else {
        settings.value = getInitialSettings();
      }
      loading.value = false;
    }, (err) => {
      console.error("Error fetching user settings with snapshot:", err);
      error.value = 'Failed to fetch settings.';
      settings.value = getInitialSettings();
      loading.value = false;
    });
  } else {
    settings.value = getInitialSettings();
    loading.value = false;
  }
});

const fetchUserSettings = async () => {
    error.value = null;
    const profile = userProfile.value;
    if (!profile) {
        settings.value = getInitialSettings();
        return settings.value;
    }
    
    const orgId = profile.orgId || profile.id;
    loading.value = true;
    try {
        const docRef = doc(db, 'userSettings', orgId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const loadedSettings = { 
                ...getInitialSettings(), 
                ...data, 
                company: { ...getInitialSettings().company, ...(data.company || {}) }
            };
            settings.value = loadedSettings;
            return loadedSettings;
        } else {
            const initial = getInitialSettings();
            await setDoc(docRef, initial);
            settings.value = initial;
            return initial;
        }
    } catch (err) {
        console.error("Error during initial fetch of user settings:", err);
        error.value = 'Failed to initialize settings.';
        settings.value = getInitialSettings();
        return settings.value;
    } finally {
        loading.value = false;
    }
};

const saveUserSettings = async (newSettings, logoFile) => {
  const profile = userProfile.value;
  if (!profile) throw new Error("User not authenticated.");
  if (profile.role !== 'owner') throw new Error("Unauthorized: Only organization owners can edit settings.");

  const orgId = profile.orgId || profile.id;
  loading.value = true;
  error.value = null;

  try {
    let logoUrl = newSettings.company.logoUrl;
    if (logoFile) {
      const logoStorageRef = storageRef(storage, `logos/${orgId}/${logoFile.name}`);
      await uploadBytes(logoStorageRef, logoFile);
      logoUrl = await getDownloadURL(logoStorageRef);
    }

    const settingsToSave = {
      ...newSettings,
      company: { ...newSettings.company, logoUrl },
    };
    
    // Strip invoiceCounter to prevent overwriting or resetting the incrementing invoice counter sequence
    delete settingsToSave.invoiceCounter;
    
    const docRef = doc(db, 'userSettings', orgId);
    await setDoc(docRef, settingsToSave, { merge: true });

  } catch (err) {
    console.error("Fatal error saving user settings: ", err);
    error.value = `Failed to save settings: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const sendPreviewEmail = async (recipientEmail) => {
  try {
    const sendPreviewFn = httpsCallable(functions, 'sendPreviewReport');
    const response = await sendPreviewFn({ recipientEmail });
    return response.data.message;
  } catch (err) {
    console.error("Error sending preview email:", err);
    throw err;
  }
};

const useUserSettings = () => {
  return {
    settings,
    loading,
    error,
    saveUserSettings,
    fetchUserSettings,
    sendPreviewEmail,
  };
};

export default useUserSettings;
