<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const createInvoice = () => {
  router.push('/invoice/new');
};

const goToSettings = () => {
  router.push('/onboarding');
};
</script>

<template>
  <div class="prompt-container">
    <div class="prompt-content">
      <div class="prompt-icon">
        <v-icon
          icon="mdi-rocket-launch-outline"
          size="28"
          color="#4facfe"
        ></v-icon>
      </div>
      <div class="prompt-text">
        <div class="badge-row">
          <span class="step-badge">🚀 Quick Start</span>
          <span class="completion-pill">ScanGo Invoice</span>
        </div>
        <h4>Welcome to ScanGo Invoice!</h4>
        <p>Create & send professional invoices in seconds, log project hours and receipts, and accept online payments instantly.</p>
      </div>
      <div class="prompt-actions">
        <button @click="createInvoice" class="prompt-action-btn primary-btn">
          <span>Create First Invoice</span>
          <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
        </button>
        <button @click="goToSettings" class="prompt-action-btn secondary-btn">Company Profile</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prompt-container {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(79, 172, 254, 0.25);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 20px rgba(79, 172, 254, 0.08);
}

.prompt-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.prompt-icon {
  color: #4facfe;
  flex-shrink: 0;
  background: rgba(79, 172, 254, 0.12);
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.prompt-text {
  flex-grow: 1;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.step-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4facfe;
  background: rgba(79, 172, 254, 0.15);
  padding: 2px 8px;
  border-radius: 20px;
}

.completion-pill {
  font-size: 0.75rem;
  font-weight: 600;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.1);
  padding: 2px 8px;
  border-radius: 20px;
}

.prompt-text h4 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.2rem 0;
  color: #f1f5f9;
}

.prompt-text p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.prompt-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.prompt-action-btn {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.primary-btn {
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: #0f172a;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.45);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

@media (max-width: 768px) {
  .prompt-content {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .prompt-actions {
    width: 100%;
    flex-direction: column;
  }

  .prompt-action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
