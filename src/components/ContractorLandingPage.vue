<template>
  <LandingPage variant="contractor" />
</template>

<script setup>
import { onMounted } from 'vue'
import LandingPage from './LandingPage.vue'

onMounted(() => {
  sessionStorage.setItem('signup_source', 'lp_contractor')
})
</script>
