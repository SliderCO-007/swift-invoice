import { ref } from 'vue';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

const useUserSettings = () => {
  const settings = ref({
    companyName: '',
    address: '',
    phoneNumber: '',
    logoUrl: '',
  });

  const loading = ref(false);
  const error = ref(null);
  const success = ref(false);

  const fetchUserSettings = async () => {
    loading.value = true;
    error.value = null;
    success.value = false;

    if (!auth.currentUser) {
      error.value = 'You must be logged in to manage settings.';
      loading.value = false;
      return;
    }

    try {
      const docRef = doc(db, 'userSettings', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        settings.value = { ...settings.value, ...docSnap.data() };
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const saveUserSettings = async (logoFile) => {
    loading.value = true;
    error.value = null;
    success.value = false;

    if (!auth.currentUser) {
      error.value = 'You must be logged in to save settings.';
      loading.value = false;
      return;
    }

    try {
      let logoUrl = settings.value.logoUrl;

      if (logoFile) {
        const logoStorageRef = storageRef(storage, `logos/${auth.currentUser.uid}/${logoFile.name}`);
        await uploadBytes(logoStorageRef, logoFile);
        logoUrl = await getDownloadURL(logoStorageRef);
      }

      const userSettings = {
        companyName: settings.value.companyName,
        address: settings.value.address,
        phoneNumber: settings.value.phoneNumber,
        logoUrl: logoUrl,
      };

      const docRef = doc(db, 'userSettings', auth.currentUser.uid);
      await setDoc(docRef, userSettings, { merge: true });
      settings.value = { ...settings.value, ...userSettings };
      success.value = true;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return { settings, loading, error, success, fetchUserSettings, saveUserSettings };
};

export default useUserSettings;
