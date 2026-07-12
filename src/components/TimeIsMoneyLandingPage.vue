<template>
  <LandingPage variant="time_is_money" />
</template>

<script setup>
import { onMounted } from 'vue'
import LandingPage from './LandingPage.vue'

onMounted(() => {
  sessionStorage.setItem('signup_source', 'lp_time_is_money')

  // Custom Meta Pixel tracking to identify visitors driven by the Facebook Reel promotion
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', 'ViewTimeIsMoneyReelPromotion', {
      source: 'facebook_reel',
      campaign: 'time_is_money'
    })
  }
})
</script>

<style scoped>
/* Scoped styles if needed. Layout is inherited from LandingPage. */
</style>
