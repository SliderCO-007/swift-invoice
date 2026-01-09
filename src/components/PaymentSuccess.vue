<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="success" dark flat>
            <v-toolbar-title>Payment Successful!</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p class="text-h6">Thank you for your payment.</p>
            <p>Your registration is complete. You will receive a confirmation email shortly.</p>
            <p>You can now proceed to your dashboard.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" to="/dashboard">Go to Dashboard</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
</script>

<style scoped>
</style>
