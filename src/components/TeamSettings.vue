<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useOrganization } from "../composables/useOrganization";
import { userProfile } from "../composables/useAuth.js";

const router = useRouter();
const {
  teamMembers,
  invitations,
  loading: orgLoading,
  error: orgError,
  inviteMember,
  revokeMember,
} = useOrganization();

const inviteEmail = ref("");
const inviteLoading = ref(false);
const inviteSuccess = ref("");
const inviteErr = ref("");

const isOwner = computed(() => {
  return userProfile.value?.role === "owner";
});

const isPaid = computed(() => {
  return userProfile.value?.subscriptionStatus === "active";
});

const handleInvite = async () => {
  if (!inviteEmail.value) return;
  inviteLoading.value = true;
  inviteSuccess.value = "";
  inviteErr.value = "";

  try {
    await inviteMember(inviteEmail.value);
    inviteSuccess.value = `Invitation successfully sent to ${inviteEmail.value}!`;
    inviteEmail.value = "";
    setTimeout(() => {
      inviteSuccess.value = "";
    }, 5000);
  } catch (err) {
    inviteErr.value = err.message || "Failed to send invitation.";
  } finally {
    inviteLoading.value = false;
  }
};

const handleRevoke = async (uid, name) => {
  if (
    !confirm(
      `Are you sure you want to remove ${name || "this member"} from your organization?`,
    )
  )
    return;

  try {
    await revokeMember(uid);
  } catch (err) {
    alert(`Failed to remove member: ${err.message}`);
  }
};
</script>

<template>
  <div class="settings-container">
    <div v-if="!isOwner" class="settings-card access-denied">
      <header class="settings-header">
        <div>
          <h1>Access Denied</h1>
          <p>
            You must be the organization owner to view and manage team seats.
          </p>
        </div>
        <v-btn
          @click="router.push({ name: 'Dashboard' })"
          class="back-btn"
          color="white"
          variant="flat"
        >
          &larr; Back to Dashboard
        </v-btn>
      </header>
    </div>

    <div v-else class="settings-card">
      <header class="settings-header">
        <div>
          <h1>Team Management</h1>
          <p>
            Invite team members to log project hours and scan receipts, and
            manage active seats.
          </p>
        </div>
        <v-btn
          @click="router.push({ name: 'Dashboard' })"
          class="back-btn"
          color="white"
          variant="flat"
        >
          &larr; Back to Dashboard
        </v-btn>
      </header>

      <!-- Subscription Gating Warning -->
      <div v-if="!isPaid" class="promo-banner">
        <v-icon color="amber" class="mr-2">mdi-shield-alert-outline</v-icon>
        <div>
          <h4>Upgrade to Pro to Invite Team Members</h4>
          <p>
            Multi-user seat functionality is a premium feature. Upgrade your
            subscription to start collaborating with your team.
          </p>
          <v-btn
            @click="router.push({ name: 'Pricing' })"
            class="upgrade-btn mt-2"
            color="indigo-darken-1"
            size="small"
          >
            Upgrade Now
          </v-btn>
        </div>
      </div>

      <!-- Invite Member Form -->
      <div v-if="isPaid" class="team-section invite-section">
        <h3>Invite a New Member</h3>
        <p class="section-desc">
          Invited users will receive access to log hours and expenses for your
          projects. They will not see invoicing or financial summaries.
        </p>

        <form @submit.prevent="handleInvite" class="invite-form mt-4">
          <div class="invite-input-group">
            <v-text-field
              v-model="inviteEmail"
              label="Member Email Address"
              type="email"
              required
              density="comfortable"
              variant="outlined"
              class="invite-input"
              prepend-inner-icon="mdi-email-outline"
            ></v-text-field>
            <v-btn
              type="submit"
              color="indigo-darken-3"
              :loading="inviteLoading"
              class="invite-btn"
              height="48"
            >
              Send Invitation
            </v-btn>
          </div>
        </form>
        <div v-if="inviteSuccess" class="success-notification mt-2">
          {{ inviteSuccess }}
        </div>
        <div v-if="inviteErr" class="error-notification mt-2">
          {{ inviteErr }}
        </div>
      </div>

      <!-- Active Team Members -->
      <div class="team-section mt-6">
        <h3>Active Team Members</h3>
        <div v-if="orgLoading" class="text-center py-4">
          <v-progress-circular indeterminate></v-progress-circular>
        </div>
        <div v-else-if="teamMembers.length === 0" class="empty-state py-4">
          <p>No active team members. Invite someone above!</p>
        </div>
        <div v-else class="table-responsive">
          <table class="team-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in teamMembers" :key="member.uid">
                <td>
                  <div class="member-name">
                    <v-avatar color="indigo-darken-4" size="32" class="mr-2">
                      <span class="text-caption font-weight-bold">{{
                        member.name ? member.name.charAt(0).toUpperCase() : "U"
                      }}</span>
                    </v-avatar>
                    <span>{{ member.name || "Pending User" }}</span>
                  </div>
                </td>
                <td>{{ member.email }}</td>
                <td>
                  <span class="role-badge" :class="member.role">
                    {{ member.role === "owner" ? "Owner" : "Member" }}
                  </span>
                </td>
                <td>
                  <v-btn
                    v-if="member.role !== 'owner'"
                    @click="handleRevoke(member.uid, member.name)"
                    color="red-darken-4"
                    variant="text"
                    size="small"
                    prepend-icon="mdi-account-remove-outline"
                  >
                    Remove Member
                  </v-btn>
                  <span v-else class="text-grey text-caption font-italic"
                    >Organization Creator</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Invitations -->
      <div v-if="isPaid && invitations.length > 0" class="team-section mt-6">
        <h3>Pending Invitations</h3>
        <div class="table-responsive">
          <table class="team-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Invited Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invite in invitations" :key="invite.id">
                <td>{{ invite.email }}</td>
                <td>
                  <span class="role-badge" :class="invite.status">
                    {{
                      invite.status.charAt(0).toUpperCase() +
                      invite.status.slice(1)
                    }}
                  </span>
                </td>
                <td>
                  {{
                    invite.createdAt
                      ? invite.createdAt.toLocaleDateString()
                      : "N/A"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.settings-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  padding: 2.5rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
.access-denied {
  border-color: rgba(239, 68, 68, 0.3);
}
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 1.5rem;
}
.settings-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.settings-header p {
  color: #94a3b8;
  margin-top: 0.25rem;
}
.back-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9 !important;
}
.team-section {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}
.team-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}
.section-desc {
  color: #94a3b8;
  font-size: 0.9rem;
}
.invite-form {
  max-width: 600px;
}
.invite-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.invite-input {
  flex-grow: 1;
}
.invite-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
  padding: 0 1.5rem;
  border-radius: 8px;
}
.promo-banner {
  display: flex;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.promo-banner h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}
.promo-banner p {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}
.upgrade-btn {
  text-transform: none;
  font-weight: 600;
}
.table-responsive {
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
}
.team-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.team-table th,
.team-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}
.team-table th {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.85rem;
  text-transform: uppercase;
}
.member-name {
  display: flex;
  align-items: center;
}
.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}
.role-badge.owner {
  color: #818cf8;
  background: rgba(129, 140, 248, 0.1);
}
.role-badge.member {
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}
.role-badge.pending {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}
.role-badge.accepted {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}
.success-notification {
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  font-size: 0.9rem;
}
.error-notification {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  font-size: 0.9rem;
}
.empty-state {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .settings-card {
    padding: 1.5rem;
  }
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .settings-header h1 {
    font-size: 1.8rem;
  }
  .back-btn {
    margin-top: 1rem;
    width: 100%;
    text-align: center;
  }
  .invite-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  .invite-btn {
    width: 100%;
  }
}
</style>
