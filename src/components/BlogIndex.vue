<template>
  <div class="blog-index-page">
    <main class="page-content">
      <!-- Hero Section -->
      <section class="blog-hero">
        <v-container class="hero-container px-4 py-2">
          <div class="hero-badge">
            <v-icon size="16" class="mr-1">mdi-book-open-page-variant-outline</v-icon>
            <span>ScanGo Resource Hub</span>
          </div>
          <h1 class="hero-title">Guides & Insights for Modern Businesses</h1>
          <p class="hero-subtitle">
            Actionable cash-flow blueprints, confident pricing frameworks, and practical invoicing tips for trade contractors, independent operators, and female entrepreneurs.
          </p>

          <!-- Category Filter Bar -->
          <div class="category-filters">
            <button
              v-for="cat in categories"
              :key="cat"
              class="filter-pill"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
        </v-container>
      </section>

      <!-- Main Content Grid -->
      <section class="articles-section">
        <v-container class="articles-container px-4 py-2">
          <!-- Featured Post (Shown when on "All" or matching category) -->
          <div
            v-if="featuredPost && (selectedCategory === 'All' || featuredPost.category === selectedCategory)"
            class="featured-card-wrapper mb-10"
          >
            <div class="featured-card" @click="navigateToPost(featuredPost.slug)">
              <div class="featured-card-content">
                <div class="card-meta mb-3">
                  <span class="category-tag featured-tag">Featured Guide</span>
                  <span class="category-tag">{{ featuredPost.category }}</span>
                  <span class="meta-item">
                    <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                    {{ featuredPost.readTime }}
                  </span>
                </div>
                <h2 class="featured-title">{{ featuredPost.title }}</h2>
                <p class="featured-subtitle">{{ featuredPost.subtitle }}</p>
                <div class="card-footer">
                  <div class="author-info">
                    <img :src="featuredPost.author.avatar" alt="ScanGo" class="author-avatar" />
                    <div>
                      <div class="author-name">{{ featuredPost.author.name }}</div>
                      <div class="author-role">{{ featuredPost.author.role }}</div>
                    </div>
                  </div>
                  <span class="read-link">
                    Read Complete Guide
                    <v-icon size="18" class="ml-1">mdi-arrow-right</v-icon>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Articles Grid -->
          <div class="articles-grid">
            <article
              v-for="post in filteredPosts"
              :key="post.slug"
              class="article-card"
              @click="navigateToPost(post.slug)"
            >
              <div class="card-meta mb-3">
                <span class="category-tag">{{ post.category }}</span>
                <span class="meta-item">
                  <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                  {{ post.readTime }}
                </span>
              </div>
              <h3 class="card-title">{{ post.title }}</h3>
              <p class="card-excerpt">{{ post.subtitle }}</p>
              
              <div class="card-footer">
                <div class="author-info">
                  <div class="author-name">{{ post.author.name }}</div>
                  <div class="post-date">{{ formatDate(post.publishedAt) }}</div>
                </div>
                <span class="read-link-simple">
                  Read Guide
                  <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                </span>
              </div>
            </article>
          </div>

          <!-- Empty State if filter yields nothing -->
          <div v-if="filteredPosts.length === 0" class="empty-state text-center py-12">
            <v-icon size="48" color="rgba(255,255,255,0.4)" class="mb-3">mdi-file-document-outline</v-icon>
            <h3 class="text-white">No articles found in this category yet.</h3>
            <p class="text-white-50">Check back soon or explore our other guides.</p>
            <v-btn color="primary" class="mt-4" @click="selectedCategory = 'All'">View All Guides</v-btn>
          </div>

          <!-- In-Feed Conversion CTA -->
          <div class="blog-cta-banner mt-16">
            <div class="cta-inner">
              <div class="cta-text">
                <span class="cta-badge">Get Started Free</span>
                <h3 class="cta-title">Turn Tracked Work into Paid Invoices in 60 Seconds</h3>
                <p class="cta-desc">
                  Start sending on-site invoices with built-in Apple Pay, Google Pay, and Stripe QR codes. Includes 3 free invoices per month and unlimited projects.
                </p>
              </div>
              <div class="cta-actions">
                <v-btn
                  color="primary"
                  size="x-large"
                  to="/register"
                  class="cta-btn"
                  elevation="3"
                >
                  Create Free Account
                  <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
                <div class="cta-note">No credit card required</div>
              </div>
            </div>
          </div>
        </v-container>
      </section>
    </main>

    <!-- Page Footer -->
    <footer class="blog-footer">
      <v-container class="text-center">
        <p class="footer-links">
          &copy; 2026 ScanGo Invoice. All rights reserved. |
          <router-link to="/">Home</router-link> |
          <router-link to="/features">Features</router-link> |
          <router-link to="/pricing">Pricing</router-link> |
          <router-link to="/about">About Us</router-link> |
          <router-link to="/privacy">Privacy</router-link> |
          <router-link to="/terms">Terms</router-link>
        </p>
      </v-container>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';
import { getAllPosts, getCategories, getFeaturedPost } from '../data/blogPosts.js';

const router = useRouter();
const selectedCategory = ref('All');

const posts = getAllPosts();
const categories = getCategories();
const featuredPost = getFeaturedPost();

const filteredPosts = computed(() => {
  let list = posts;
  if (selectedCategory.value !== 'All') {
    list = list.filter((p) => p.category === selectedCategory.value);
  }
  // If the featured post is currently rendered in the top hero spotlight, exclude it from the grid below
  if (selectedCategory.value === 'All' && featuredPost) {
    list = list.filter((p) => p.id !== featuredPost.id);
  }
  return list;
});

const navigateToPost = (slug) => {
  router.push(`/blog/${slug}`);
};

const formatDate = (dateStr) => {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

useHead({
  title: 'Guides & Resources for Contractors & Small Businesses | ScanGo Invoice',
  meta: [
    {
      name: 'description',
      content: 'Practical cash-flow strategies, confident pricing blueprints, and mobile invoicing tips for trade contractors, freelancers, and female entrepreneurs.'
    },
    {
      property: 'og:title',
      content: 'Small Business & Contractor Resource Hub | ScanGo Invoice'
    },
    {
      property: 'og:description',
      content: 'Practical cash-flow strategies, confident pricing blueprints, and mobile invoicing tips for trade contractors, freelancers, and female entrepreneurs.'
    },
    {
      property: 'og:url',
      content: 'https://scangoinvoice.com/blog'
    }
  ]
});
</script>

<style scoped>
.blog-index-page {
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.page-content {
  padding-top: 24px;
  padding-bottom: 60px;
}

/* Hero Section */
.blog-hero {
  padding: 16px 0 20px;
  text-align: center;
}

.hero-container {
  max-width: 900px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(13, 71, 161, 0.25);
  border: 1px solid rgba(13, 71, 161, 0.5);
  color: #60a5fa;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 9999px;
  margin-bottom: 20px;
}

.hero-title {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.15rem;
  line-height: 1.6;
  color: #94a3b8;
  max-width: 720px;
  margin: 0 auto 32px;
}

/* Category Filter Pills */
.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.filter-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  padding: 8px 18px;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}

.filter-pill.active {
  background: #0d47a1;
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
}

/* Articles Section */
.articles-section {
  padding: 30px 0 60px;
}

.articles-container {
  max-width: 1120px;
  margin: 0 auto;
}

/* Featured Card */
.featured-card-wrapper {
  margin-bottom: 40px;
}

.featured-card {
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.2) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 20px;
  padding: 36px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.featured-card:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 0.7);
  box-shadow: 0 16px 40px rgba(13, 71, 161, 0.35);
}

.card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.category-tag {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #93c5fd;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
}

.featured-tag {
  background: #0d47a1;
  color: #ffffff;
  border-color: #3b82f6;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.featured-title {
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 14px;
  line-height: 1.25;
}

.featured-subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 24px;
  max-width: 900px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.author-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #ffffff;
}

.author-role {
  font-size: 0.8rem;
  color: #94a3b8;
}

.read-link {
  display: inline-flex;
  align-items: center;
  color: #60a5fa;
  font-weight: 700;
  font-size: 0.95rem;
}

/* Articles Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.article-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s ease;
}

.article-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.35;
  margin-bottom: 12px;
}

.card-excerpt {
  font-size: 0.95rem;
  line-height: 1.55;
  color: #94a3b8;
  margin-bottom: 24px;
  flex-grow: 1;
}

.post-date {
  font-size: 0.8rem;
  color: #64748b;
}

.read-link-simple {
  display: inline-flex;
  align-items: center;
  color: #60a5fa;
  font-weight: 600;
  font-size: 0.9rem;
}

/* CTA Banner */
.blog-cta-banner {
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.35) 0%, rgba(30, 41, 59, 0.7) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.cta-badge {
  display: inline-block;
  background: #3b82f6;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.cta-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
  margin-bottom: 10px;
}

.cta-desc {
  font-size: 1.05rem;
  color: #cbd5e1;
  max-width: 600px;
  line-height: 1.5;
  margin-bottom: 0;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.cta-btn {
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  border-radius: 12px !important;
}

.cta-note {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Footer */
.blog-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 30px 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  margin: 0 6px;
  transition: color 0.15s;
}

.footer-links a:hover {
  color: #ffffff;
}

@media (max-width: 860px) {
  .page-content {
    padding-top: 4px;
    padding-bottom: 36px;
  }
  .blog-hero {
    padding: 6px 0 10px;
  }
  .hero-badge {
    margin-bottom: 10px;
    padding: 4px 12px;
    font-size: 0.78rem;
  }
  .hero-title {
    font-size: 1.75rem;
    margin-bottom: 10px;
  }
  .hero-subtitle {
    font-size: 0.95rem;
    margin-bottom: 18px;
    padding: 0 8px;
  }
  .category-filters {
    margin-top: 2px;
    gap: 6px;
  }
  .filter-pill {
    padding: 6px 14px;
    font-size: 0.8rem;
  }
  .articles-section {
    padding: 16px 0 36px;
  }
  .cta-inner {
    flex-direction: column;
    text-align: center;
  }
  .cta-actions {
    width: 100%;
  }
  .cta-btn {
    width: 100%;
  }
  .featured-card {
    padding: 20px;
  }
  .blog-cta-banner {
    padding: 24px 18px;
  }
}
</style>
