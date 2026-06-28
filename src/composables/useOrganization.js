import { ref, watch } from 'vue';
import { 
  collection, query, where, onSnapshot, doc, addDoc, 
  writeBatch, serverTimestamp, arrayRemove, updateDoc 
} from 'firebase/firestore';
import { db } from './useFirebase';
import { userProfile } from './useAuth';

const teamMembers = ref([]);
const invitations = ref([]);
const loading = ref(false);
const error = ref(null);

let membersUnsubscribe = null;
let invitesUnsubscribe = null;

const setupOrgListeners = (orgId) => {
  if (membersUnsubscribe) membersUnsubscribe();
  if (invitesUnsubscribe) invitesUnsubscribe();

  if (!orgId) {
    teamMembers.value = [];
    invitations.value = [];
    return;
  }

  loading.value = true;

  // 1. Listen to team members in the users collection
  const usersColl = collection(db, 'users');
  const membersQ = query(usersColl, where('orgId', '==', orgId));
  membersUnsubscribe = onSnapshot(membersQ, (snap) => {
    teamMembers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    loading.value = false;
  }, (err) => {
    console.error("Error listening to team members:", err);
    error.value = "Failed to load team members.";
    loading.value = false;
  });

  // 2. Listen to invitations for this organization
  const invitesColl = collection(db, 'invitations');
  const invitesQ = query(invitesColl, where('orgId', '==', orgId));
  invitesUnsubscribe = onSnapshot(invitesQ, (snap) => {
    invitations.value = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
      acceptedAt: d.data().acceptedAt?.toDate(),
    })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, (err) => {
    console.error("Error listening to invitations:", err);
  });
};

// Auto-listen when user profile loads or changes
watch(userProfile, (newProfile) => {
  if (newProfile && newProfile.role === 'owner') {
    setupOrgListeners(newProfile.orgId || newProfile.id);
  } else {
    setupOrgListeners(null);
  }
}, { immediate: true });

export const useOrganization = () => {

  const inviteMember = async (email) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("Not authenticated.");
    if (profile.role !== 'owner') throw new Error("Only organization owners can invite members.");

    const orgId = profile.orgId || profile.id;
    const formattedEmail = email.toLowerCase().trim();

    try {
      loading.value = true;
      error.value = null;

      // Add to invitations collection
      const invitesColl = collection(db, 'invitations');
      await addDoc(invitesColl, {
        email: formattedEmail,
        orgId,
        invitedBy: profile.id,
        role: 'member',
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error inviting member:", err);
      error.value = `Failed to invite member: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const revokeMember = async (memberUid) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("Not authenticated.");
    if (profile.role !== 'owner') throw new Error("Only organization owners can revoke members.");
    if (profile.id === memberUid) throw new Error("Cannot revoke yourself from your own organization.");

    const orgId = profile.orgId || profile.id;

    try {
      loading.value = true;
      error.value = null;

      const batch = writeBatch(db);

      // 1. Remove memberUid from organizations/{orgId} members array
      const orgRef = doc(db, 'organizations', orgId);
      batch.update(orgRef, {
        members: arrayRemove(memberUid)
      });

      // 2. Revert the member back to their own owner profile and free plan
      const memberUserRef = doc(db, 'users', memberUid);
      batch.update(memberUserRef, {
        orgId: memberUid,
        role: 'owner',
        subscriptionStatus: 'free'
      });

      await batch.commit();
    } catch (err) {
      console.error("Error revoking member:", err);
      error.value = `Failed to revoke member: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateMember = async (memberUid, name, email) => {
    const profile = userProfile.value;
    if (!profile) throw new Error("Not authenticated.");
    if (profile.role !== 'owner') throw new Error("Only organization owners can update member profiles.");

    try {
      loading.value = true;
      error.value = null;

      const memberUserRef = doc(db, 'users', memberUid);
      await updateDoc(memberUserRef, {
        name: name.trim(),
        email: email.toLowerCase().trim()
      });
    } catch (err) {
      console.error("Error updating member profile:", err);
      error.value = `Failed to update member profile: ${err.message}`;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    teamMembers,
    invitations,
    loading,
    error,
    inviteMember,
    revokeMember,
    updateMember
  };
};
