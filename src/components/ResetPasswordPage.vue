<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import Logo from './Logo.vue';

const email = ref('');
const router = useRouter();
const successMessage = ref(null);

// Get the global state and actions from the composable
const { loading, error, resetPassword } = useAuth();

// --- Actions ---
const handleResetPassword = async () => {
  error.value = null;
  successMessage.value = null;
  
  if (!email.value) {
    error.value = 'Please enter your email address.';
    return;
  }
  
  try {
    await resetPassword(email.value);
    successMessage.value = 'A password reset link has been sent to your email address.';
    email.value = ''; // clear the input after sending
  } catch (err) {
    // Error is handled by the composable but we can do extra stuff here if needed
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-wrapper">
        <Logo />
      </div>
      
      <h1>Reset Password</h1>
      <p class="subtitle">Enter your email and we'll send you a link to reset your password.</p>

      <form @submit.prevent="handleResetPassword">
        <fieldset :disabled="loading" class="form-fieldset">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="you@example.com" />
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

          <button type="submit" class="login-btn">
            <span v-if="!loading">Send Reset Link</span>
            <v-progress-circular v-else indeterminate size="24"></v-progress-circular>
          </button>
        </fieldset>
      </form>

      <div class="register-link">
        <p>Remember your password? <router-link to="/login">Back to Login</router-link></p>
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

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
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

.register-link {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #94a3b8;
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

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  .login-card {
    padding: 2rem 1.5rem;
  }
  .login-card h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0.5rem;
  }
  .login-card {
    padding: 1.5rem 1rem;
  }
}
</style>
