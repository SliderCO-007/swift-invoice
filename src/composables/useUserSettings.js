import { ref } from 'vue';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './useFirebase'; // CORRECT: Import from the single source of truth
import { useAuth } from './useAuth'; // CORRECT: Use this for auth status

// Define the initial, empty state for user settings
const getInitialSettings = () => ({
  company: {
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    logoUrl: '',
    venmoQrUrl: ''
  },
  taxRate: 0,
  invoiceCounter: 0,
});

const settings = ref(getInitialSettings());

export const resetUserSettings = () => {
  settings.value = getInitialSettings();
};

const useUserSettings = () => {
  const loading = ref(false);
  const error = ref(null);
  const { user } = useAuth(); // Get the reactive user object

  const fetchUserSettings = async () => {
    // CORRECT: Check the reactive user ref
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    try {
      // CORRECT: Use the user ref's uid
      const docRef = doc(db, 'userSettings', user.value.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        settings.value = {
            ...getInitialSettings(),
            ...data,
            company: {
                ...getInitialSettings().company,
                ...(data.company || {}),
            }
        };
      } else {
        resetUserSettings();
      }
    } catch (err) {
      console.error("Error fetching user settings: ", err);
      error.value = 'Failed to fetch settings.';
    } finally {
      loading.value = false;
    }
  };

  const saveUserSettings = async (newSettings, logoFile, venmoQrFile) => {
    // CORRECT: Check the reactive user ref
    if (!user.value) return;
    loading.value = true;
    error.value = null;
    try {
      let logoUrl = newSettings.company.logoUrl;
      let venmoQrUrl = newSettings.company.venmoQrUrl;

      if (logoFile) {
        // CORRECT: Use the user ref's uid
        const logoStorageRef = storageRef(storage, `logos/${user.value.uid}/${logoFile.name}`);
        await uploadBytes(logoStorageRef, logoFile);
        logoUrl = await getDownloadURL(logoStorageRef);
      }

      if (venmoQrFile) {
        // CORRECT: Use the user ref's uid
        const qrStorageRef = storageRef(storage, `qrcodes/${user.value.uid}/${venmoQrFile.name}`);
        await uploadBytes(qrStorageRef, venmoQrFile);
        venmoQrUrl = await getDownloadURL(qrStorageRef);
      }

      const settingsToSave = {
        ...newSettings,
        company: {
            ...newSettings.company,
            logoUrl: logoUrl,
            venmoQrUrl: venmoQrUrl,
        }
      };

      // CORRECT: Use the user ref's uid
      const docRef = doc(db, 'userSettings', user.value.uid);
      await setDoc(docRef, settingsToSave, { merge: true });
      
      settings.value = settingsToSave;

    } catch (err) {
      console.error("Error saving user settings: ", err);
      error.value = `Failed to save settings: ${err.message}`;
    } finally {
      loading.value = false;
    }
  };

  return { settings, loading, error, fetchUserSettings, saveUserSettings };
};

export default useUserSettings;
