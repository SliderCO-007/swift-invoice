<template>
    <!-- TrustBox widget container -->
    <div 
      ref="trustbox" 
      class="trustpilot-widget" 
      data-locale="en-US" 
      data-template-id="56278e9abfbbba0bdcd568bc" 
      data-businessunit-id="69a9732af09a47296725e587"
      data-token="5dfcd411-0873-4375-b52e-ec09bb9201dc" 
      data-style-height="52px" 
      data-style-width="100%" 
      data-theme="dark"
    >
      <a href="https://www.trustpilot.com/review/scangoinvoice.com" target="_blank" rel="noopener">
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
  