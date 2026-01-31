<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToSettings = () => {
  router.push('/settings');
};
</script>

<template>
  <div class="prompt-container">
    <div class="prompt-content">
      <div class="prompt-icon">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z"/></svg>
      </div>
      <div class="prompt-text">
        <h4>Complete Your Company Profile</h4>
        <p>Before you can create invoices, please add your company's details, logo, and default tax rate.</p>
      </div>
      <button @click="goToSettings" class="prompt-action-btn">Go to Settings</button>
    </div>
  </div>
</template>

<style scoped>
.prompt-container {
  background-color: #E3F2FD; /* Light blue background */
  border: 1px solid #90CAF9; /* Softer blue border */
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.prompt-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
}

.prompt-icon {
  color: #1976D2; /* Primary blue color */
  flex-shrink: 0;
}

.prompt-icon svg {
    width: 32px;
    height: 32px;
}

.prompt-text {
  flex-grow: 1;
}

.prompt-text h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1A237E;
}

.prompt-text p {
  margin: 0;
  color: #455A64;
}

.prompt-action-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: #1976D2;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.prompt-action-btn:hover {
  background-color: #1565C0;
}

@media (max-width: 768px) {
    .prompt-content {
        flex-direction: column;
        align-items: flex-start;
        text-align: center;
    }
    .prompt-icon,
    .prompt-text {
        align-self: center;
    }

    .prompt-text {
        margin-bottom: 1rem;
    }
}
</style>
