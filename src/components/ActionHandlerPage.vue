<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import Logo from './Logo.vue';

const route = useRoute();
const router = useRouter();

const mode = ref('');
const actionCode = ref('');

const newPassword = ref('');
const verifyPassword = ref('');
const showPassword = ref(false);
const showVerifyPassword = ref(false);
const successMessage = ref('');
const codeError = ref('');

const { loading, error, verifyResetCode, confirmReset } = useAuth();

onMounted(async () => {
  mode.value = route.query.mode || '';
  actionCode.value = route.query.oobCode || '';

  if (mode.value === 'resetPassword' && actionCode.value) {
    try {
      // Verify the code is still valid
      await verifyResetCode(actionCode.value);
    } catch (err) {
      codeError.value = "The password reset link is invalid or has expired. Please try resetting your password again.";
    }
  } else {
    codeError.value = "Invalid action link.";
  }
});

const handlePasswordReset = async () => {
  error.value = null;
  
  if (newPassword.value !== verifyPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  if (newPassword.value.length < 6) {
    error.value = "Password should be at least 6 characters.";
    return;
  }

  try {
    await confirmReset(actionCode.value, newPassword.value);
    successMessage.value = "Your password has been changed successfully. Redirecting to login...";
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err) {
    // Handled by composable but we catch it just in case we wanted extra parsing
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-wrapper">
        <Logo />
      </div>
      
      <h1>Set New Password</h1>

      <div v-if="codeError">
        <div class="error-message">{{ codeError }}</div>
        <div class="register-link" style="margin-top: 1rem;">
          <router-link to="/reset-password">Request New Reset Link</router-link>
        </div>
      </div>
      
      <div v-else-if="successMessage">
        <div class="success-message">{{ successMessage }}</div>
      </div>

      <div v-else>
        <p class="subtitle">Please enter your new password below.</p>

        <form @submit.prevent="handlePasswordReset">
          <fieldset :disabled="loading" class="form-fieldset">
            <div class="form-group password-group">
              <label for="newPassword">New Password</label>
              <div class="input-wrapper">
                <input :type="showPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword" required placeholder="••••••••" />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>
            
            <div class="form-group password-group">
              <label for="verifyPassword">Confirm New Password</label>
              <div class="input-wrapper">
                <input :type="showVerifyPassword ? 'text' : 'password'" id="verifyPassword" v-model="verifyPassword" required placeholder="••••••••" />
                <button type="button" class="toggle-password" @click="showVerifyPassword = !showVerifyPassword" tabindex="-1">
                  <svg v-if="showVerifyPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>
            
            <div v-if="error" class="error-message">{{ error }}</div>

            <button type="submit" class="login-btn">
              <span v-if="!loading">Update Password</span>
              <v-progress-circular v-else indeterminate size="24"></v-progress-circular>
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
  padding: 2rem;
}

.form-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.login-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  padding: 3rem;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  width: 100%;
  max-width: 450px;
  text-align: center;
  color: #f1f5f9;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem; 
}

.login-card h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
}

.login-card .subtitle {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.form-group {
  text-align: left;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #e2e8f0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.toggle-password:hover {
  color: #f1f5f9;
}

.eye-icon {
  width: 20px;
  height: 20px;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 2.5rem 0.8rem 1rem;
  background: #fff;
  border: 1px solid #ccc;
  color: #1e293b;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color, #1976D2);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.3);
}

.error-message {
  background-color: rgba(220, 53, 69, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(220, 53, 69, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.success-message {
  background-color: rgba(76, 175, 80, 0.1);
  color: #81C784;
  border: 1px solid rgba(76, 175, 80, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 0.9rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px; 
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary-color, #1976D2);
  color: #fff;
}

.login-btn:hover:not(:disabled) {
  background-color: #1565C0;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  transform: translateY(-2px);
}

.register-link a {
  color: var(--primary-color, #64B5F6);
  font-weight: 600;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
  color: #90CAF9;
}
</style>
