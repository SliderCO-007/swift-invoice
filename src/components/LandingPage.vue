<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <header class="bg-white shadow-md">
      <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <Logo class="text-blue-600" />
          <h1 class="text-2xl font-bold text-gray-800 ml-2">Swift Invoice</h1>
        </div>
        <div>
          <router-link to="/register" class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">Register</router-link>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-6 py-16 text-center">
      <h2 class="text-5xl font-extrabold mb-4 text-gray-900">Create Professional Invoices in Seconds</h2>
      <p class="text-xl text-gray-600 mb-8">Join Swift Invoice and streamline your billing process.</p>
      <div class="flex justify-center">
        <div class="w-full max-w-md bg-white rounded-lg shadow-2xl p-8 transform hover:-translate-y-2 transition-all duration-300">
          <h3 class="text-2xl font-bold mb-4">Sign Up Today</h3>
          <p class="text-gray-600 mb-6">Get started with a one-time registration fee of $50 and just $1 per invoice.</p>
          <router-link to="/register" class="w-full px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg font-semibold">Get Started</router-link>
        </div>
      </div>
    </main>

    <section class="bg-white py-20">
      <div class="container mx-auto px-6">
        <h2 class="text-4xl font-bold text-center mb-12 text-gray-900">Why Swift Invoice?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h3 class="text-2xl font-bold mb-4 text-blue-600">PDF Generation</h3>
            <p class="text-gray-700">Generate professional, beautiful PDF invoices with a single click. Customize them with your own branding.</p>
          </div>
          <div class="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h3 class="text-2xl font-bold mb-4 text-blue-600">Email Invoices</h3>
            <p class="text-gray-700">Send invoices directly to your clients from our platform. No need to download and attach files manually.</p>
          </div>
          <div class="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
            <h3 class="text-2xl font-bold mb-4 text-blue-600">Payment Tracking</h3>
            <p class="text-gray-700">Keep track of which invoices have been paid and which are overdue. Get a clear overview of your cash flow.</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-white mt-16 py-8">
      <div class="container mx-auto px-6 text-center text-gray-600">
        <p>&copy; 2024 Swift Invoice. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Logo from './Logo.vue'
</script>

<style scoped>
  .shadow-2xl {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  a:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 4px rgba(37, 99, 235, 0.2);
  }
</style>
