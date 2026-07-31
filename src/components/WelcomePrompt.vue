<template>
  <v-container fluid class="pa-0">
    <v-card
      class="mb-6 welcome-prompt-card"
      elevation="4"
      rounded="xl"
    >
      <div class="d-flex flex-column flex-md-row align-center justify-space-between pa-5 pa-sm-6 ga-4">
        <div class="d-flex flex-column flex-sm-row align-center text-center text-sm-left ga-4">
          <div class="welcome-icon-wrapper">
            <v-icon
              icon="mdi-rocket-launch-outline"
              size="large"
              color="#14b8a6"
            ></v-icon>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold text-white mb-1 d-flex align-center justify-center justify-sm-start ga-2">
              Welcome to Swift Invoice! 🚀
            </h3>
            <p class="text-body-2 text-grey-lighten-1 mb-0" style="max-width: 540px; line-height: 1.5;">
              Create & send professional invoices in seconds, log project hours and receipts, and accept online credit card payments instantly.
            </p>
          </div>
        </div>

        <div class="d-flex flex-column flex-sm-row ga-3 w-100 w-md-auto align-stretch align-sm-center">
          <v-btn
            to="/invoice/new"
            color="primary"
            variant="flat"
            class="font-weight-bold px-5 rounded-pill shadow-glow"
            size="large"
            prepend-icon="mdi-plus"
          >
            Create First Invoice
          </v-btn>
          <v-btn
            to="/onboarding"
            variant="outlined"
            color="teal-lighten-3"
            class="font-weight-bold px-4 rounded-pill"
            size="large"
            prepend-icon="mdi-domain"
          >
            Company Profile
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
</script>

<style scoped>
.welcome-prompt-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(20, 184, 166, 0.25);
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 20px rgba(20, 184, 166, 0.08);
  transition: all 0.3s ease-in-out;
}

.welcome-prompt-card:hover {
  border-color: rgba(20, 184, 166, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 30px rgba(20, 184, 166, 0.15);
}

.welcome-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(20, 184, 166, 0.12);
  border: 1px solid rgba(20, 184, 166, 0.3);
  display: flex;
  align-center: center;
  justify-content: center;
  flex-shrink: 0;
}

.shadow-glow {
  box-shadow: 0 0 16px rgba(20, 184, 166, 0.35);
}
</style>
