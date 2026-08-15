<template>
  <LandingPage variant="no_paywall" />
</template>

<script setup>
import { onMounted } from 'vue'
import LandingPage from './LandingPage.vue'

onMounted(() => {
  sessionStorage.setItem('signup_source', 'lp_no_paywall')
})
</script>
