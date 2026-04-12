import { ref, watchEffect } from 'vue';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, functions } from './useFirebase'; // Import the centralized 'functions' instance
import { currentUser } from './useAuth';
import { httpsCallable } from 'firebase/functions'; // Only import httpsCallable

function getInitialSettings() {
  return {
    company: {
      name: '', email: '', address1: '', address2: '', city: '', state: '', zip: '',
      logoUrl: '', venmoQrUrl: '', venmoUsername: '', primaryColor: '#1a3a52'
    },
    taxRate: 0,
    invoiceCounter: 0,
    currency: 'USD',
  };
}

const settings = ref(getInitialSettings());
const loading = ref(true);
const error = ref(null);
let unsubscribe = null;

watchEffect(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  const user = currentUser.value;
  if (user) {
    loading.value = true;
    const docRef = doc(db, 'userSettings', user.uid);
    
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
    const user = currentUser.value;
    if (!user) {
        settings.value = getInitialSettings();
        return settings.value;
    }
    
    loading.value = true;
    try {
        const docRef = doc(db, 'userSettings', user.uid);
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
  const user = currentUser.value;
  if (!user) throw new Error("User not authenticated.");

  loading.value = true;
  error.value = null;

  try {
    const newVenmoUsername = newSettings.company.venmoUsername;

    let logoUrl = newSettings.company.logoUrl;
    if (logoFile) {
      const logoStorageRef = storageRef(storage, `logos/${user.uid}/${logoFile.name}`);
      await uploadBytes(logoStorageRef, logoFile);
      logoUrl = await getDownloadURL(logoStorageRef);
    }

    const settingsToSave = {
      ...newSettings,
      company: { ...newSettings.company, logoUrl },
    };
    
    const docRef = doc(db, 'userSettings', user.uid);
    await setDoc(docRef, settingsToSave, { merge: true });

    // If a Venmo username is present, generate the QR code.
    if (newVenmoUsername) {
      console.log('Venmo username present. Calling generateVenmoQR...');
      // Use the imported 'functions' instance directly
      const generateVenmoQR = httpsCallable(functions, 'generateVenmoQR');
      await generateVenmoQR({ venmoUsername: newVenmoUsername });
    }

  } catch (err) {
    console.error("Fatal error saving user settings: ", err);
    error.value = `Failed to save settings: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const useUserSettings = () => {
  return {
    settings,
    loading,
    error,
    saveUserSettings,
    fetchUserSettings,
  };
};

export default useUserSettings;
