<template>
  <div class="not-found-page">
    <!-- Visual background glow elements -->
    <div class="bg-glow glow-teal"></div>
    <div class="bg-glow glow-red"></div>

    <div class="error-card">
      <!-- Interactive Scanner Visual -->
      <div class="scanner-box">
        <!-- Viewfinder corner lines -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        
        <!-- Blinking scan laser beam -->
        <div class="laser"></div>
        
        <!-- Document outline / failed invoice SVG -->
        <div class="document-container">
          <svg class="invoice-icon" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Paper page -->
            <path d="M6 4C6 1.79086 7.79086 0 10 0H42L58 16V76C58 78.2091 56.2091 80 54 80H10C7.79086 80 6 78.2091 6 76V4Z" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2"/>
            <!-- Folded corner fold -->
            <path d="M42 0V12C42 14.2091 43.7909 16 46 16H58" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2"/>
            <!-- Invoice lines -->
            <line x1="14" y1="28" x2="38" y2="28" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" stroke-linecap="round"/>
            <line x1="14" y1="40" x2="50" y2="40" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" stroke-linecap="round"/>
            <line x1="14" y1="52" x2="44" y2="52" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" stroke-linecap="round"/>
            <!-- Scan Error Overlay Badge -->
            <circle cx="32" cy="40" r="16" fill="#0f172a" stroke="#ef4444" stroke-width="2" class="error-badge-bg"/>
            <path d="M32 30V42M32 48H32.01" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Error Text Info -->
      <span class="error-code">Error 404</span>
      <h1 class="error-title">Page Not Found</h1>
      <p class="error-desc">
        Seems we <strong>Scan't Go</strong> to that page right now. Try back later.
      </p>

      <!-- Action Buttons -->
      <div class="actions-wrapper">
        <v-btn
          v-if="currentUser"
          to="/dashboard"
          class="font-weight-bold px-8 cta-btn cta-btn-primary mb-4"
          size="large"
          rounded="xl"
          block
        >
          <v-icon left class="mr-2">mdi-view-dashboard-outline</v-icon>
          Go to Dashboard
        </v-btn>
        <v-btn
          v-else
          to="/"
          class="font-weight-bold px-8 cta-btn cta-btn-primary mb-4"
          size="large"
          rounded="xl"
          block
        >
          <v-icon left class="mr-2">mdi-home-outline</v-icon>
          Go to Homepage
        </v-btn>

        <!-- Secondary options -->
        <div class="mt-4">
          <router-link
            v-if="currentUser"
            to="/"
            class="text-link"
          >
            <v-icon size="16" class="mr-1">mdi-home-outline</v-icon>
            Back to Homepage
          </router-link>
          <router-link
            v-else
            to="/login"
            class="text-link"
          >
            <v-icon size="16" class="mr-1">mdi-login</v-icon>
            Log In to Your Account
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { currentUser } from '../composables/useAuth.js';
import { useMeta } from '../composables/useMeta.js';

useMeta(
  '404 - Page Not Found | ScanGo Invoice',
  "Seems we Scan't Go to that page right now. Try back later."
);
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background-color: #111d2f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

/* Background glows for premium look */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}
.glow-teal {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
  top: 10%;
  left: 15%;
  filter: blur(60px);
}
.glow-red {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%);
  bottom: 10%;
  right: 15%;
  filter: blur(80px);
}

/* Glassmorphism Card styling */
.error-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 24px !important;
  padding: 3rem 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(239, 68, 68, 0.03) !important;
  position: relative;
  z-index: 2;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.error-card:hover {
  border-color: rgba(239, 68, 68, 0.2) !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(239, 68, 68, 0.12) !important;
  transform: translateY(-4px);
}

/* Scanner Viewfinder Styles */
.scanner-box {
  position: relative;
  width: 160px;
  height: 180px;
  margin: 0 auto 2rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.7);
}

/* Corner markers */
.corner {
  width: 16px;
  height: 16px;
  border-color: rgba(255, 255, 255, 0.25);
  border-style: solid;
  position: absolute;
  transition: border-color 0.3s ease;
}
.scanner-box:hover .corner {
  border-color: rgba(239, 68, 68, 0.7);
}
.corner-tl {
  top: 12px;
  left: 12px;
  border-width: 2.5px 0 0 2.5px;
  border-top-left-radius: 4px;
}
.corner-tr {
  top: 12px;
  right: 12px;
  border-width: 2.5px 2.5px 0 0;
  border-top-right-radius: 4px;
}
.corner-bl {
  bottom: 12px;
  left: 12px;
  border-width: 0 0 2.5px 2.5px;
  border-bottom-left-radius: 4px;
}
.corner-br {
  bottom: 12px;
  right: 12px;
  border-width: 0 2.5px 2.5px 0;
  border-bottom-right-radius: 4px;
}

/* Laser animation */
.laser {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #ef4444, transparent);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4);
  z-index: 3;
  animation: scan 3s ease-in-out infinite;
}
@keyframes scan {
  0%, 100% {
    top: 14px;
  }
  50% {
    top: calc(100% - 17px);
  }
}

/* Floating Doc & SVG icon styling */
.document-container {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.invoice-icon {
  width: 64px;
  height: 80px;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.5));
}
.error-badge-bg {
  animation: pulse 2s infinite alternate;
}
@keyframes pulse {
  0% {
    fill: #0f172a;
    stroke: #ef4444;
  }
  100% {
    fill: rgba(239, 68, 68, 0.2);
    stroke: #ff6b6b;
  }
}

/* Typography styles */
.error-code {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
  display: block;
}
.error-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
  color: #ffffff;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 30%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.error-desc {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 2.5rem;
}
.error-desc strong {
  color: #06b6d4;
  font-weight: 700;
}

/* Action Button overrides */
.actions-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.cta-btn {
  font-weight: 700 !important;
  letter-spacing: -0.2px !important;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  text-transform: none !important;
}
.cta-btn-primary {
  background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%) !important;
  color: #0f172a !important;
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.3), 0 0 15px rgba(74, 222, 128, 0.15) !important;
}
.cta-btn-primary:hover {
  background: linear-gradient(135deg, #34d399 0%, #22d3ee 100%) !important;
  box-shadow: 0 12px 35px rgba(6, 182, 212, 0.5), 0 0 20px rgba(74, 222, 128, 0.25) !important;
  transform: translateY(-2px) !important;
}
.text-link {
  color: #94a3b8 !important;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.text-link:hover {
  color: #ffffff !important;
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.4) !important;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .error-card {
    padding: 2rem 1.5rem;
  }
  .error-title {
    font-size: 1.85rem;
  }
  .error-desc {
    font-size: 0.95rem;
    margin-bottom: 2rem;
  }
}
</style>
