<template>
  <v-container fluid class="pa-0">
    <v-card
      class="mb-6 upgrade-prompt-card"
      elevation="4"
      rounded="xl"
      color="primary"
    >
      <div class="d-flex align-center pa-4">
        <v-icon
          icon="mdi-rocket-launch-outline"
          size="x-large"
          color="white"
          class="mr-4"
        ></v-icon>
        <div>
          <h3 class="text-h6 font-weight-bold text-white mb-1">
            Unlock Pro Features!
          </h3>
          <p class="text-body-1 text-white opacity-80">
            Enable email sending, get detailed analytics, and access premium support.
          </p>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          to="/pricing"
          color="white"
          variant="elevated"
          class="font-weight-bold text-primary"
          size="large"
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
