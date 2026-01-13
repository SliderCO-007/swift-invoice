<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';
import Logo from './Logo.vue';

const email = ref('');
const password = ref('');

const { signup, error: authError } = useAuth();
const router = useRouter();

const handleSignup = async () => {
  await signup(email.value, password.value);
  if (!authError.value) {
    router.push('/dashboard');
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
      <p class="subtitle">Join Swift Invoice and start managing your invoices effortlessly.</p>

      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required placeholder="Minimum 8 characters" />
        </div>

        <div v-if="authError" class="error-message">{{ authError }}</div>

        <button type="submit" class="register-btn">Create Account</button>
      </form>

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
  margin-bottom: 3rem;
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

.register-btn {
  width: 100%;
  padding: 0.9rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background-color: var(--primary-color);
  color: var(--white-color);
  transition: all 0.3s ease;
}

.register-btn:hover {
  background-color: #3A80D2;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
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