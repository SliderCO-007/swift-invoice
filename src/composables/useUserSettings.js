import { ref } from 'vue';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './useFirebase';
import { currentUser } from './useAuth.js';

// --- SHARED SINGLETON STATE ---
const settings = ref(getInitialSettings());
const loading = ref(false);
const error = ref(null);

// --- HELPER FUNCTIONS ---
function getInitialSettings() {
  return {
    company: { name: '', email: '', address1: '', address2: '', city: '', state: '', zip: '', logoUrl: '', venmoQrUrl: '' },
    taxRate: 0,
    invoiceCounter: 0,
  };
}

// --- EXPLICIT, SIMPLE DATA-FETCHING FUNCTIONS ---

// One-time fetch. No listeners. This is the robust pattern.
const fetchUserSettings = async () => {
  if (!currentUser.value) {
    settings.value = getInitialSettings();
    console.warn("Cannot fetch settings, no user is authenticated.");
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const docRef = doc(db, 'userSettings', currentUser.value.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Deep merge to ensure all fields are present, even if not in Firestore
      settings.value = { 
        ...getInitialSettings(), 
        ...data, 
        company: { ...getInitialSettings().company, ...(data.company || {}) } 
      };
    } else {
      // This case handles a brand new user who might not have a settings doc yet.
      settings.value = getInitialSettings();
      console.log("No user settings document found. Initializing with defaults.");
    }
  } catch (err) {
    console.error("Fatal error fetching user settings: ", err);
    error.value = 'Failed to fetch settings. Please try again later.';
    // In case of error, revert to safe defaults
    settings.value = getInitialSettings();
  } finally {
    loading.value = false;
  }
};

const saveUserSettings = async (newSettings, logoFile, venmoQrFile) => {
  if (!currentUser.value) throw new Error("User not authenticated. Cannot save settings.");
  loading.value = true;
  error.value = null;
  try {
    let logoUrl = newSettings.company.logoUrl;
    let venmoQrUrl = newSettings.company.venmoQrUrl;

    // Upload new logo if provided
    if (logoFile) {
      const logoStorageRef = storageRef(storage, `logos/${currentUser.value.uid}/${logoFile.name}`);
      await uploadBytes(logoStorageRef, logoFile);
      logoUrl = await getDownloadURL(logoStorageRef);
    }

    // Upload new Venmo QR code if provided
    if (venmoQrFile) {
      const qrStorageRef = storageRef(storage, `qrcodes/${currentUser.value.uid}/${venmoQrFile.name}`);
      await uploadBytes(qrStorageRef, venmoQrFile);
      venmoQrUrl = await getDownloadURL(qrStorageRef);
    }

    // Create the final object to save to Firestore
    const settingsToSave = { 
      ...newSettings, 
      company: { ...newSettings.company, logoUrl, venmoQrUrl } 
    };
    
    const docRef = doc(db, 'userSettings', currentUser.value.uid);
    // Use setDoc with merge:true to create or update the document
    await setDoc(docRef, settingsToSave, { merge: true });

    // After a successful save, update the local state to match
    settings.value = JSON.parse(JSON.stringify(settingsToSave));

  } catch (err) { 
    console.error("Fatal error saving user settings: ", err);
    error.value = `Failed to save settings: ${err.message}`;
    // Re-throw the error so the component knows the save failed
    throw err;
  } finally {
    loading.value = false;
  }
};


// --- MAIN COMPOSABLE HOOK ---
const useUserSettings = () => {
  return {
    settings,
    loading,
    error,
    fetchUserSettings,
    saveUserSettings,
  };
};

export default useUserSettings;
