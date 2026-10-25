<template>
  <LandingPage variant="receipt_rescue" />
</template>

<script setup>
import { onMounted } from 'vue'
import LandingPage from './LandingPage.vue'

onMounted(() => {
  sessionStorage.setItem('signup_source', 'lp_receipt_rescue')
})
</script>
