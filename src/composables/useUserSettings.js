import { ref } from 'vue';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

// This ref will be shared across the app, ensuring consistency
const settings = ref({
  company: {
    name: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    logoUrl: ''
  },
  taxRate: 0,
  invoiceCounter: 0,
});

const useUserSettings = () => {
  const loading = ref(false);
  const error = ref(null);

  const fetchUserSettings = async () => {
    if (!auth.currentUser) return;
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'userSettings', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Deep merge fetched data, ensuring all fields are present
        settings.value = {
            ...settings.value,
            ...data,
            company: {
                ...settings.value.company,
                ...(data.company || {}),
            }
        };
      }
    } catch (err) {
      console.error("Error fetching user settings: ", err);
      error.value = 'Failed to fetch settings.';
    } finally {
      loading.value = false;
    }
  };

  const saveUserSettings = async (newSettings, logoFile) => {
    if (!auth.currentUser) return;
    loading.value = true;
    error.value = null;
    try {
      let logoUrl = newSettings.company.logoUrl;

      if (logoFile) {
        const logoStorageRef = storageRef(storage, `logos/${auth.currentUser.uid}/${logoFile.name}`);
        await uploadBytes(logoStorageRef, logoFile);
        logoUrl = await getDownloadURL(logoStorageRef);
      }

      const settingsToSave = {
        ...newSettings,
        company: {
            ...newSettings.company,
            logoUrl: logoUrl,
        }
      };

      const docRef = doc(db, 'userSettings', auth.currentUser.uid);
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
