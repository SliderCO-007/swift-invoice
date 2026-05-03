<template>
  <div class="reviews-page">
    <main class="pt-16">
      <div class="container mt-10">
        <div class="text-center mb-12">
          <h1 class="text-h3 font-weight-bold mb-4">What Our Customers Say</h1>
          <p class="text-h6 text-grey-lighten-1">Join 20,000+ businesses using ScanGo Invoice.</p>
        </div>
        
        <div class="reviews-grid">
          <div
            v-for="(review, index) in reviews"
            :key="index"
            class="review-card"
          >
            <div class="review-header">
              <v-avatar color="primary" size="48" class="mr-3 text-h6 font-weight-bold text-white">
                {{ review.name.charAt(0) }}
              </v-avatar>
              <div>
                <h4 class="reviewer-name">{{ review.name }}</h4>
                <p class="reviewer-business">{{ review.business }}</p>
              </div>
            </div>
            <div class="review-stars">
              <v-icon color="warning" size="small" v-for="n in 5" :key="n">mdi-star</v-icon>
            </div>
            <p class="review-text">"{{ review.review }}"</p>
          </div>
        </div>
        
        <div class="mt-16 text-center">
          <div class="cta-card text-center mx-auto pa-8 mb-8" style="max-width: 800px;">
            <h2 class="text-h4 font-weight-bold text-white mb-4">Ready to simplify your invoicing?</h2>
            <p class="text-body-1 text-grey-lighten-1 mb-6">
              Join thousands of businesses getting paid faster with ScanGo Invoice.
            </p>
            <div class="d-flex flex-column flex-sm-row justify-center ga-4">
              <v-btn @click="handleGoogleSignIn" :loading="loading" color="white" class="text-black font-weight-bold px-8 cta-btn" size="x-large" rounded="xl">
                Start Free with Google
              </v-btn>
              <v-btn to="/register" variant="outlined" color="white" class="font-weight-bold px-8 cta-btn" size="x-large" rounded="xl">
                Continue with Email
              </v-btn>
            </div>
          </div>
          <v-btn to="/" variant="text" color="primary" class="font-weight-bold text-none" size="large" prepend-icon="mdi-arrow-left">
            Return to Home
          </v-btn>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import reviewsData from '../assets/reviews.json';

const reviews = ref(reviewsData);
const { loading, googleLogin } = useAuth();

const handleGoogleSignIn = async () => {
  await googleLogin();
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.reviews-page {
  font-family: 'Poppins', sans-serif;
  color: #f1f5f9;
  min-height: 100vh;
  background-color: #111d2f;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem 2rem;
}

.reviews-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .reviews-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .reviews-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.review-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.reviewer-name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.reviewer-business {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  margin-top: 0.2rem;
}

.review-stars {
  margin-bottom: 0.8rem;
  display: flex;
  gap: 2px;
}

.review-text {
  font-size: 0.95rem;
  color: #e2e8f0;
  line-height: 1.5;
  font-style: italic;
}

.cta-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.cta-btn {
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(255, 255, 255, 0.2) !important;
}
</style>
