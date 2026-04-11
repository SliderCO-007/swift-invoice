<template>
  <v-container fluid class="pa-0">
    <v-card
      class="mb-6 upgrade-prompt-card"
      elevation="4"
      rounded="xl"
      color="primary"
    >
      <div class="d-flex flex-column flex-sm-row align-center text-center text-sm-left pa-5 pa-sm-6">
        <v-icon
          icon="mdi-rocket-launch-outline"
          size="x-large"
          color="white"
          class="mr-0 mr-sm-5 mb-4 mb-sm-0"
        ></v-icon>
        <div class="flex-grow-1 mb-5 mb-sm-0">
          <h3 class="text-h6 font-weight-bold text-white mb-1">
            Unlock Pro Features!
          </h3>
          <p class="text-body-1 text-white opacity-80">
            Enable email sending, get detailed analytics, and access premium support.
          </p>
        </div>
        <v-btn
          to="/pricing"
          color="white"
          variant="elevated"
          class="font-weight-bold text-primary px-6"
          size="large"
          rounded="pill"
          >Upgrade Now</v-btn
        >
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.upgrade-prompt-card {
  background: linear-gradient(45deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  transition: all 0.3s ease-in-out;
}
.upgrade-prompt-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg) !important;
}
.text-primary {
    color: var(--primary-color) !important;
}
.opacity-80 {
    opacity: 0.8;
}
</style>
