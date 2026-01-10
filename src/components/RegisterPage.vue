<script setup>
import { ref } from 'vue';
import useAuth from '../composables/useAuth';
import { useStripe } from '../composables/useStripe';
import Logo from './Logo.vue';

const name = ref('');
const email = ref('');
const password = ref('');

const { error: authError, signUp, signInWithGoogle } = useAuth();
const { redirectToCheckout, error: stripeError } = useStripe();

const error = ref(null);

const handleRegister = async () => {
  error.value = null;
  await signUp(email.value, password.value, { displayName: name.value });
  if (authError.value) {
    error.value = authError.value;
    return;
  }
  await redirectToCheckout();
  if (stripeError.value) {
    error.value = stripeError.value;
  }
};

const handleGoogleSignIn = async () => {
  error.value = null;
  await signInWithGoogle();
  if (authError.value) {
    error.value = authError.value;
    return;
  }
  await redirectToCheckout();
  if (stripeError.value) {
    error.value = stripeError.value;
  }
};
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-wrapper">
        <Logo />
      </div>

      <h1>Create Your Account</h1>
      <p class="subtitle">Join us and start managing your invoices effortlessly.</p>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" v-model="name" required placeholder="John Doe" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required placeholder="••••••••" />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="register-btn">Register & Pay ($50)</button>
      </form>

      <div class="separator"><span>or</span></div>

      <button @click="handleGoogleSignIn" class="google-btn">
        <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,36.45,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        <span>Sign up with Google</span>
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
  background-color: var(--background-color);
  padding: 2rem;
}

.register-card {
  background: var(--white-color);
  padding: 3rem;
  border-radius: 15px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem; /* Adjusted margin for the larger logo */
}

.register-card h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.register-card .subtitle {
  color: #777;
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
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
}

.error-message {
  background-color: #F8D7DA;
  color: #721C24;
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
}

.register-btn {
  background-color: var(--primary-color);
  color: var(--white-color);
}

.register-btn:hover {
  background-color: #3A80D2;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  color: #aaa;
  margin: 1.5rem 0;
}

.separator::before, .separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.separator span {
  padding: 0 1rem;
}

.google-btn {
  background-color: #f9f9f9;
  color: #555;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
}

.google-btn:hover {
  background-color: #f1f1f1;
}

.google-icon {
  margin-right: 0.75rem;
}

.login-link {
  margin-top: 2rem;
  font-size: 0.9rem;
}

.login-link a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>