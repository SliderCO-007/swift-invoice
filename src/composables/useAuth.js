import { ref } from 'vue';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch, collection, query, where, getDocs, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db, auth } from './useFirebase.js';
import { event } from 'vue-gtag';

// --- SHARED SINGLETON STATE ---
const currentUser = ref(null);
const userProfile = ref(null);
const error = ref(null);
const loading = ref(false);

// Create a promise that resolves when auth is ready
let authReadyResolver;
const isAuthReady = new Promise(resolve => {
  authReadyResolver = resolve;
});


// --- DECOUPLED HELPER FUNCTIONS ---

const fetchUserProfile = async (userId) => {
  if (!userId) {
    userProfile.value = null;
    return null;
  }
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const profile = { id: docSnap.id, ...docSnap.data() };
      
      // Legacy user migration check: if they don't have orgId or role, migrate them!
      if (!profile.orgId || !profile.role) {
        console.log("Migrating legacy user to organization model...", userId);
        const orgId = userId;
        const role = 'owner';
        
        // 1. Create organizations/{userId} doc
        const orgRef = doc(db, 'organizations', orgId);
        await setDoc(orgRef, {
          ownerId: userId,
          members: [userId],
          createdAt: serverTimestamp()
        }, { merge: true });
        
        // 2. Update user document
        await updateDoc(userRef, {
          orgId,
          role
        });
        
        // 3. Migrate old invoices: query where userId == userId and update them with orgId = userId
        try {
          const invoicesColl = collection(db, 'invoices');
          const invoicesQ = query(invoicesColl, where('userId', '==', userId));
          const invoicesSnap = await getDocs(invoicesQ);
          const migrateBatch = writeBatch(db);
          invoicesSnap.forEach(d => {
            if (!d.data().orgId) {
              migrateBatch.update(d.ref, { orgId: userId });
            }
          });
          
          // Migrate old projects
          const projectsColl = collection(db, 'projects');
          const projectsQ = query(projectsColl, where('userId', '==', userId));
          const projectsSnap = await getDocs(projectsQ);
          projectsSnap.forEach(d => {
            if (!d.data().orgId) {
              migrateBatch.update(d.ref, { orgId: userId });
            }
          });
          
          await migrateBatch.commit();
        } catch (migErr) {
          console.error("Error migrating user documents during org setup:", migErr);
        }
        
        profile.orgId = orgId;
        profile.role = role;
      }
      
      // Ensure organization and settings exist for owners (e.g. if they were recently revoked and became standalone owners)
      if (profile.role === 'owner') {
        const orgRef = doc(db, 'organizations', userId);
        const orgSnap = await getDoc(orgRef);
        
        const settingsRef = doc(db, 'userSettings', userId);
        const settingsSnap = await getDoc(settingsRef);
        
        if (!orgSnap.exists() || !settingsSnap.exists()) {
          console.log("Initializing missing owner documents for:", userId);
          const initBatch = writeBatch(db);
          
          if (!orgSnap.exists()) {
            initBatch.set(orgRef, {
              ownerId: userId,
              members: [userId],
              createdAt: serverTimestamp()
            });
          }
          
          if (!settingsSnap.exists()) {
            initBatch.set(settingsRef, {
              company: { name: '', address: '', email: '', phone: '' },
              invoiceSettings: { defaultDueDateDays: 30, defaultTaxRate: 0 },
              updatedAt: serverTimestamp(),
              invoiceCounter: 0
            });
          }
          
          await initBatch.commit();
        }
      }
      
      userProfile.value = profile;
      return profile;
    } else {
      userProfile.value = null;
      return null;
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    userProfile.value = null;
    return null;
  }
};

const createInitialUserData = async (user) => {
  if (!user) return;

  try {
    // Check if there is an active, pending invitation for this email
    const invitationsColl = collection(db, 'invitations');
    const q = query(invitationsColl, where('email', '==', user.email), where('status', '==', 'pending'));
    const inviteSnapshot = await getDocs(q);

    let orgId = user.uid;
    let role = 'owner';
    let inviteDocId = null;

    if (!inviteSnapshot.empty) {
      // Find the first pending invitation
      const inviteDoc = inviteSnapshot.docs[0];
      const inviteData = inviteDoc.data();
      orgId = inviteData.orgId;
      role = inviteData.role || 'member';
      inviteDocId = inviteDoc.id;
    }

    const batch = writeBatch(db);
    const userRef = doc(db, 'users', user.uid);
    
    // Determine user name, default to email username or email if name not provided
    const userName = registeredName.value.trim() || user.displayName || user.email;
    registeredName.value = ''; // Reset after use
    
    // Retrieve sign up source from session storage to trace back marketing campaigns
    let signupSource = 'lp_standard';
    try {
      signupSource = sessionStorage.getItem('signup_source') || 'lp_standard';
    } catch (e) {
      console.error("sessionStorage is not available for signupSource:", e);
    }

    // Create the user profile
    batch.set(userRef, {
      uid: user.uid,
      email: user.email,
      name: userName,
      phone: registeredPhone.value.trim() || null,
      smsOptIn: registeredSmsOptIn.value || false,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      subscriptionStatus: role === 'owner' ? 'free' : 'member', // members inherit owner's sub status dynamically
      invoiceCount: 0,
      orgId,
      role,
      signupSource
    });

    const userPhone = registeredPhone.value.trim();
    registeredName.value = ''; // Reset after use
    registeredPhone.value = '';
    registeredSmsOptIn.value = false;

    if (role === 'owner') {
      // Create settings doc for the owner (since orgSettings is userSettings/{orgId})
      const settingsRef = doc(db, "userSettings", user.uid);
      batch.set(settingsRef, {
        company: {
            name: '',
            address: '',
            email: '',
            phone: userPhone || '',
        },
        invoiceSettings: {
            defaultDueDateDays: 30,
            defaultTaxRate: 0,
        },
        updatedAt: serverTimestamp(),
        invoiceCounter: 0, 
      });

      // Create the organization document
      const orgRef = doc(db, 'organizations', user.uid);
      batch.set(orgRef, {
        ownerId: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp()
      });
    } else if (inviteDocId) {
      // Update invitation document to accept it
      const inviteRef = doc(db, 'invitations', inviteDocId);
      batch.update(inviteRef, {
        status: 'accepted',
        acceptedBy: user.uid,
        acceptedAt: serverTimestamp()
      });

      // Add user to organization members list
      const orgRef = doc(db, 'organizations', orgId);
      batch.update(orgRef, {
        members: arrayUnion(user.uid)
      });
    }

    await batch.commit();
    await fetchUserProfile(user.uid);

    // Fire Meta Pixel registration event for tracking ad conversions
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration');
    }

    // Fire Google Analytics registration event
    try {
      const method = user.providerData && user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
      event('sign_up', { method });
    } catch (e) {
      console.warn("Failed to fire GA signup event:", e);
    }
  } catch (err) {
    console.error("Error creating initial user data:", err);
  }
};


// --- AUTH ACTIONS ---

const registeredName = ref('');
const registeredPhone = ref('');
const registeredSmsOptIn = ref(false);

const signup = async (email, password, name = '', phone = '', smsOptIn = false) => {
  loading.value = true;
  error.value = null;
  registeredName.value = name;
  registeredPhone.value = phone;
  registeredSmsOptIn.value = smsOptIn;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    registeredName.value = '';
    registeredPhone.value = '';
    registeredSmsOptIn.value = false;
    error.value = err.message;
    throw err; 
  } finally {
    loading.value = false;
  }
};

const login = async (email, password) => {
  loading.value = true;
  error.value = null;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  // Crucial: Call signInWithPopup synchronously in the main execution thread of the click
  // to prevent mobile pop-up blockers from aggressively closing the authentication window.
  const authPromise = signInWithPopup(auth, provider);
  
  loading.value = true;
  error.value = null;
  try {
    await authPromise;
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    error.value = err.message;
  }
};

const resetPassword = async (email) => {
  loading.value = true;
  error.value = null;
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const verifyResetCode = async (code) => {
  error.value = null;
  loading.value = true;
  try {
    return await verifyPasswordResetCode(auth, code);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const confirmReset = async (code, newPassword) => {
  error.value = null;
  loading.value = true;
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (err) {
    error.value = err.message;
    throw err;
  } finally {
    loading.value = false;
  }
};

// --- Auth State Change Listener ---
onAuthStateChanged(auth, async (user) => {
  currentUser.value = user;
  if (user) {
    const profile = await fetchUserProfile(user.uid);
    if (!profile) {
      await createInitialUserData(user);
    }
  } else {
    userProfile.value = null;
  }
  
  if (authReadyResolver) {
    authReadyResolver();
    authReadyResolver = null;
  }
});


// --- COMPOSABLE EXPORT ---
const useAuth = () => {
  return {
    currentUser,
    userProfile,
    error,
    loading,
    signup,
    login,
    logout,
    googleLogin,
    resetPassword,
    verifyResetCode,
    confirmReset,
    isAuthReady, 
  };
};

export { useAuth, currentUser, userProfile, isAuthReady };
