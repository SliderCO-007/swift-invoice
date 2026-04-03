<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth, currentUser } from '../composables/useAuth.js';
import Logo from './Logo.vue';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const router = useRouter();
const route = useRoute();

// Get the global state and actions from the composable
const { loading, error, signup, googleLogin } = useAuth();

// --- Actions ---
const handleSignup = async () => {
  await signup(email.value, password.value);
};

const handleGoogleSignIn = async () => {
  await googleLogin(); // Corrected function name
};

// --- Watch for successful authentication ---
// Watch the globally shared currentUser for changes
watch(currentUser, (user) => {
  if (user) {
    if (route.query.redirect) {
      router.push(route.query.redirect);
    } else {
      router.push('/dashboard');
    }
  }
}, { immediate: true });

</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-wrapper">
        <Logo />
      </div>
      
      <h1>Create Your Account</h1>
      <p class="subtitle">Join ScanGo Invoice and start managing your invoices effortlessly.</p>

      <form @submit.prevent="handleSignup">
        <fieldset :disabled="loading" class="form-fieldset">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="you@example.com" />
          </div>
          <div class="form-group password-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" required placeholder="Minimum 8 characters" />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="register-btn">
            <span v-if="!loading">Create Account</span>
            <v-progress-circular v-else indeterminate size="24"></v-progress-circular>
          </button>
        </fieldset>
      </form>

      <div class="separator"><span>or</span></div>

      <button @click="handleGoogleSignIn" :disabled="loading" class="google-btn">
        <svg v-if="!loading" class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,36.45,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        <span v-if="!loading">Sign up with Google</span>
        <v-progress-circular v-else indeterminate size="24"></v-progress-circular>
      </button>

      <div class="login-link">
        <p>Already have an account? <router-link to="/login">Log in</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
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

.register-card {
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

.register-card h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
}

.register-card .subtitle {
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

.register-btn, .google-btn {
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
}

.register-btn {
  background-color: var(--primary-color, #1976D2);
  color: #fff;
}

.register-btn:hover:not(:disabled) {
  background-color: #1565C0;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  transform: translateY(-2px);
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  color: #64748b;
  margin: 1.5rem 0;
}

.separator::before, .separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.separator span {
  padding: 0 1rem;
}

.google-btn {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.google-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

.google-icon {
  margin-right: 0.75rem;
}

.login-link {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #94a3b8;
}

.login-link a {
  color: var(--primary-color, #64B5F6);
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
  color: #90CAF9;
}
</style>