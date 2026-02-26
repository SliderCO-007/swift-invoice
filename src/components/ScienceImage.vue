<template>
    <!-- The background container -->
    <div ref="bgContainer" class="atomic-bg">
      <canvas ref="canvasRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const canvasRef = ref(null);
  const bgContainer = ref(null);
  let animationFrame = null;
  
  const properties = {
    bgColor: 'rgb(255, 255, 255)',
    particleColor: 'rgba(42, 127, 240, 0.59)',
    lineColor: 'rgba(148, 163, 184, 0.2)',
    particleRadius: 3,
    particleCount: 200,
    maxVelocity: 0.5,
    lineLength: 150,
  };
  
  let particles = [];
  
  class Particle {
    constructor(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * properties.maxVelocity;
      this.vy = (Math.random() - 0.5) * properties.maxVelocity;
    }
  
    update(w, h) {
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
      this.x += this.vx;
      this.y += this.vy;
    }
  }
  
  const draw = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = properties.bgColor;
    ctx.fillRect(0, 0, w, h);
  
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update(w, h);
  
      // Draw lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
  
        if (dist < properties.lineLength) {
          ctx.beginPath();
          ctx.lineWidth = 1;
          // Fade lines based on distance
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 * (1 - dist / properties.lineLength)})`;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
  
      // Draw particle
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, properties.particleRadius, 0, Math.PI * 2);
      ctx.fillStyle = properties.particleColor;
      ctx.fill();
    }
  
    animationFrame = requestAnimationFrame(() => draw(ctx, w, h));
  };
  
  onMounted(() => {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
  
    window.addEventListener('resize', resize);
    resize();
  
    // Initialize particles
    particles = Array.from({ length: properties.particleCount }, () => new Particle(canvas.width, canvas.height));
  
    draw(ctx, canvas.width, canvas.height);
  });
  
  onUnmounted(() => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', () => {});
  });
  </script>
  
  <style scoped>
  .atomic-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1; /* Sits behind your content */
    overflow: hidden;
  }
  </style>
  