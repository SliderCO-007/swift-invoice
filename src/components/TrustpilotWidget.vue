<template>
    <!-- TrustBox widget container -->
    <div 
      ref="trustbox" 
      class="trustpilot-widget" 
      data-locale="en-US" 
      data-template-id="56278e9abfbbba0bdcd568bc" 
      data-businessunit-id="698e2b5c9111479251cad222"
      data-token="9f2743be-431e-4092-aaea-3c7e748fe407" 
      data-style-height="52px" 
      data-style-width="100%" 
      data-theme="light"
    >
      <a href="https://www.trustpilot.com/review/swiftinvoice.biz" target="_blank" rel="noopener">
        Trustpilot
      </a>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  
  const trustbox = ref(null);
  
  onMounted(() => {
  // 1. If script isn't on the page yet, add it dynamically
  if (!document.getElementById('trustpilot-script')) {
    const script = document.createElement('script');
    script.id = 'trustpilot-script';
    script.type = 'text/javascript';
    script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
    script.async = true;
    document.head.appendChild(script);

    // Wait for script to load before initializing
    script.onload = () => {
      if (window.Trustpilot) {
        window.Trustpilot.loadFromElement(trustbox.value);
      }
    };
  } else if (window.Trustpilot) {
    // 2. If script exists, just trigger the load for this specific element
    window.Trustpilot.loadFromElement(trustbox.value);
  }
});
  </script>
  