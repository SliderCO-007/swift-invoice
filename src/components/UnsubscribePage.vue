<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const success = ref(false);
const isOptedOut = ref(true);
const errorMessage = ref('');
const userUid = ref('');
const tokenValue = ref('');

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/swift-invoice-9124f/us-central1/unsubscribeWeeklyReport'
  : 'https://us-central1-swift-invoice-9124f.cloudfunctions.net/unsubscribeWeeklyReport';

const executeUnsubscribe = async (action = 'unsubscribe') => {
  loading.value = true;
  errorMessage.value = '';

  const uid = userUid.value;
  const token = tokenValue.value;

  if (!uid || !token) {
    loading.value = false;
    errorMessage.value = 'Invalid link. Please use the exact link provided in your email.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}&action=${action}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, action })
    });

    const data = await res.json();
    if (res.ok && (data.success || data.optedOut !== undefined)) {
      success.value = true;
      isOptedOut.value = action !== 'resubscribe';
    } else {
      errorMessage.value = data.error || 'Failed to update preferences. Please log into your account settings.';
    }
  } catch (err) {
    console.error('Error calling unsubscribe endpoint:', err);
    // Even if fetch had a network glitch, if status was passed as unsubscribed, mark as unsubscribed
    if (route.query.status === 'unsubscribed') {
      success.value = true;
      isOptedOut.value = true;
    } else {
      errorMessage.value = 'Network error contacting server. You can also update preferences in User Settings.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  userUid.value = (route.query.uid || '').toString();
  tokenValue.value = (route.query.token || '').toString();

  // If redirected with status already updated
  if (route.query.status === 'unsubscribed') {
    loading.value = false;
    success.value = true;
    isOptedOut.value = true;
    return;
  }

  if (userUid.value && tokenValue.value) {
    await executeUnsubscribe('unsubscribe');
  } else {
    loading.value = false;
    errorMessage.value = 'No account identifier provided in this link. Please visit Settings while logged in to configure your email notifications.';
  }
});
</script>

<template>
  <div class="unsubscribe-wrapper">
    <div class="unsubscribe-card">
      <div class="brand-header">
        <img src="/Logo.png" alt="ScanGo Invoice" class="brand-logo" />
        <h2>Notification Preferences</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="state-container">
        <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
        <p class="text-subtitle-1 text-slate-300">Updating your email preferences...</p>
      </div>

      <!-- Success: Unsubscribed -->
      <div v-else-if="success && isOptedOut" class="state-container">
        <div class="icon-circle success-circle">
          <v-icon icon="mdi-check" color="#4ade80" size="32"></v-icon>
        </div>
        <h3 class="status-title">You've been unsubscribed</h3>
        <p class="status-description">
          You will no longer receive automated weekly invoice summary reports from ScanGo Invoice.
        </p>

        <div class="actions-group">
          <v-btn
            @click="executeUnsubscribe('resubscribe')"
            variant="tonal"
            color="primary"
            class="mb-3"
            block
            prepend-icon="mdi-undo"
          >
            Did this by mistake? Re-enable Reports
          </v-btn>

          <v-btn
            @click="router.push({ name: 'Settings' })"
            variant="outlined"
            color="white"
            class="mb-2"
            block
          >
            Manage All Settings
          </v-btn>

          <v-btn
            @click="router.push({ name: 'Dashboard' })"
            variant="text"
            color="grey-lighten-1"
            block
          >
            Return to Dashboard
          </v-btn>
        </div>
      </div>

      <!-- Success: Re-subscribed -->
      <div v-else-if="success && !isOptedOut" class="state-container">
        <div class="icon-circle resubscribed-circle">
          <v-icon icon="mdi-email-check" color="#60a5fa" size="32"></v-icon>
        </div>
        <h3 class="status-title">Weekly reports re-enabled!</h3>
        <p class="status-description">
          You're all set! You will continue to receive your weekly invoice cash flow summaries every Monday at 8:00 AM.
        </p>

        <div class="actions-group">
          <v-btn
            @click="router.push({ name: 'Dashboard' })"
            color="primary"
            variant="flat"
            class="mb-2"
            block
            prepend-icon="mdi-view-dashboard"
          >
            Go to Dashboard
          </v-btn>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="state-container">
        <div class="icon-circle error-circle">
          <v-icon icon="mdi-alert-circle-outline" color="#f87171" size="32"></v-icon>
        </div>
        <h3 class="status-title error-text">Unable to update preferences</h3>
        <p class="status-description">{{ errorMessage }}</p>

        <div class="actions-group">
          <v-btn
            @click="router.push({ name: 'Settings' })"
            color="primary"
            variant="flat"
            class="mb-2"
            block
          >
            Go to Account Settings
          </v-btn>
          <v-btn
            @click="router.push({ name: 'LandingPage' })"
            variant="text"
            color="grey-lighten-1"
            block
          >
            ScanGo Invoice Home
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unsubscribe-wrapper {
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background-color: #0b1320;
}

.unsubscribe-card {
  max-width: 480px;
  width: 100%;
  background: #111d2f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 36px 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.brand-header {
  margin-bottom: 24px;
}

.brand-logo {
  height: 48px;
  margin-bottom: 12px;
  object-fit: contain;
}

.brand-header h2 {
  font-size: 19px;
  color: #f1f5f9;
  font-weight: 600;
  margin: 0;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.success-circle {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.resubscribed-circle {
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.error-circle {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-title {
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 10px 0;
}

.error-text {
  color: #f87171;
}

.status-description {
  font-size: 14.5px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0 0 24px 0;
}

.actions-group {
  width: 100%;
}
</style>
