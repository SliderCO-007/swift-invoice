<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4">
          <v-card-title class="text-h4 font-weight-bold text-center mb-4">Login to Swift Invoice</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field v-model="email" label="Email" type="email" required variant="outlined" class="mb-4"></v-text-field>
              <v-text-field v-model="password" label="Password" type="password" required variant="outlined" class="mb-4"></v-text-field>
              <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
              <v-btn type="submit" color="primary" block x-large>Login</v-btn>
            </v-form>
            <v-btn @click="handleGoogleSignIn" color="red" block x-large class="mt-4">Sign in with Google</v-btn>
            <div class="text-center mt-4">
              <span>Don't have an account? </span>
              <router-link to="/register">Register here</router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useAuth from '../composables/useAuth';

const email = ref('');
const password = ref('');
const error = ref(null);

const { login, signInWithGoogle, error: authError } = useAuth();
const router = useRouter();

const handleLogin = async () => {
  error.value = null; // Reset error

  // Attempt to log in
  await login(email.value, password.value);

  // If there's an error, display it
  if (authError.value) {
    error.value = authError.value;
    return;
  }

  // Redirect to the dashboard on successful login
  router.push('/dashboard');
};

const handleGoogleSignIn = async () => {
  error.value = null; // Reset error

  // Attempt to sign in with Google
  await signInWithGoogle();

  // If there's an error, display it
  if (authError.value) {
    error.value = authError.value;
    return;
  }

  // Redirect to the dashboard on successful login
  router.push('/dashboard');
};
</script>
