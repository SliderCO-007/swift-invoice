<template>
  <v-container fluid class="pa-0">
    <v-app-bar app color="white" flat>
      <v-container class="py-0 fill-height">
        <Logo class="text-blue-600" />
        <v-toolbar-title class="font-weight-bold ml-2">Swift Invoice</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn to="/register" color="primary" large rounded>Register</v-btn>
      </v-container>
    </v-app-bar>

    <v-main style="background-color: #f0f2f5;">
      <v-container class="text-center py-16">
        <h1 class="text-h2 font-weight-bold mb-4">Create Professional Invoices in Seconds</h1>
        <p class="text-h5 text-grey-darken-1 mb-8">Join Swift Invoice and streamline your billing process.</p>
        <v-row justify="center">
          <v-col cols="12" md="6">
            <v-card class="pa-4" elevation="4">
              <v-card-title class="justify-center text-h4 font-weight-bold">Sign Up Today</v-card-title>
              <v-card-text class="text-h6 text-grey-darken-1">
                Get started with a one-time registration fee of $50 and just $1 per invoice.
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn to="/register" color="green" x-large rounded class="white--text">Get Started</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-sheet class="py-16">
        <v-container>
          <h2 class="text-h3 font-weight-bold text-center mb-12">Why Swift Invoice?</h2>
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="pa-4" elevation="2" height="100%">
                <v-card-title class="text-h5 font-weight-bold text-primary">
                  <v-icon left>mdi-file-pdf-box</v-icon>
                  PDF Generation
                </v-card-title>
                <v-card-text>
                  Generate professional, beautiful PDF invoices with a single click. Customize them with your own branding.
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-4" elevation="2" height="100%">
                <v-card-title class="text-h5 font-weight-bold text-primary">
                  <v-icon left>mdi-email-send</v-icon>
                  Email Invoices
                </v-card-title>
                <v-card-text>
                  Send invoices directly to your clients from our platform. No need to download and attach files manually.
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-4" elevation="2" height="100%">
                <v-card-title class="text-h5 font-weight-bold text-primary">
                  <v-icon left>mdi-chart-line</v-icon>
                  Payment Tracking
                </v-card-title>
                <v-card-text>
                  Keep track of which invoices have been paid and which are overdue. Get a clear overview of your cash flow.
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-main>

    <v-footer color="white" class="py-4">
      <v-container class="text-center text-grey-darken-1">
        &copy; 2024 Swift Invoice. All rights reserved.
      </v-container>
    </v-footer>
  </v-container>
</template>

<script setup>
import Logo from './Logo.vue'
</script>

<style scoped>
.white--text /deep/ .v-btn__content {
  color: white;
}
</style>
