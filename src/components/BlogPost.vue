<template>
  <div class="blog-post-page">
    <main class="page-content" v-if="post">
      <!-- Article Header & Breadcrumbs -->
      <header class="article-header">
        <v-container class="article-header-container px-4 py-2">
          <nav class="breadcrumb-nav mb-3" aria-label="Breadcrumb">
            <router-link to="/">Home</router-link>
            <span class="separator">/</span>
            <router-link to="/blog">Blog & Resources</router-link>
            <span class="separator">/</span>
            <span class="current-crumb">{{ post.category }}</span>
          </nav>

          <div class="article-meta-top mb-4">
            <span class="category-badge">{{ post.category }}</span>
            <span class="read-time-badge">
              <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
              {{ post.readTime }}
            </span>
          </div>

          <h1 class="article-title">{{ post.title }}</h1>
          <p class="article-subtitle">{{ post.subtitle }}</p>

          <!-- Author and Share Toolbar -->
          <div class="author-share-bar">
            <div class="author-details">
              <img :src="post.author.avatar" alt="ScanGo" class="author-avatar" />
              <div>
                <div class="author-name">{{ post.author.name }}</div>
                <div class="author-meta">{{ post.author.role }} &bull; {{ formattedDate }}</div>
              </div>
            </div>

            <div class="share-actions">
              <button
                class="share-btn native-share-btn"
                @click="handleShare"
                :title="isShareSupported ? 'Share this guide' : 'Copy link to share'"
                aria-label="Share guide"
              >
                <v-icon size="18" class="mr-1">mdi-share-variant</v-icon>
                <span>Share Guide</span>
              </button>

              <button
                class="share-btn copy-btn"
                @click="copyArticleLink"
                :title="copied ? 'Copied to clipboard!' : 'Copy link'"
                aria-label="Copy link"
              >
                <v-icon size="18" :color="copied ? '#4ade80' : undefined">
                  {{ copied ? 'mdi-check' : 'mdi-link-variant' }}
                </v-icon>
                <span class="ml-1 text-caption" :class="{ 'copied-text': copied }">
                  {{ copied ? 'Copied!' : 'Copy Link' }}
                </span>
              </button>
            </div>
          </div>
        </v-container>
      </header>

      <!-- Article Body -->
      <article class="article-body-wrapper">
        <v-container class="article-body-container">
          <div class="article-content" v-html="post.content"></div>

          <!-- Tags -->
          <div class="article-tags mt-10">
            <span class="tags-label">Tags:</span>
            <span v-for="tag in post.tags" :key="tag" class="tag-pill">
              #{{ tag }}
            </span>
          </div>

          <!-- End of Article Conversion Card -->
          <div class="article-cta-box mt-12">
            <div class="cta-box-glow"></div>
            <div class="cta-box-content">
              <div class="cta-icon-wrapper">
                <v-icon size="36" color="#3b82f6">mdi-qrcode-scan</v-icon>
              </div>
              <div class="cta-box-text">
                <h3>Start Invoicing On-Site with ScanGo</h3>
                <p>
                  Create agency-quality invoices, log jobsite hours & expenses, and collect payments on-the-spot via Apple Pay, Google Pay, and Stripe QR codes.
                </p>
                <div class="cta-perks">
                  <span><v-icon size="16" color="#3b82f6" class="mr-1">mdi-check-circle</v-icon> 3 free invoices / month</span>
                  <span><v-icon size="16" color="#3b82f6" class="mr-1">mdi-check-circle</v-icon> Unlimited projects</span>
                  <span><v-icon size="16" color="#3b82f6" class="mr-1">mdi-check-circle</v-icon> No credit card required</span>
                </div>
              </div>
              <div class="cta-box-action">
                <v-btn
                  color="primary"
                  size="x-large"
                  to="/register"
                  elevation="3"
                  class="register-btn"
                >
                  Create Free Account
                  <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Related Posts Section -->
          <section v-if="relatedPosts.length > 0" class="related-section mt-16">
            <h2 class="related-title">Related Guides & Resources</h2>
            <div class="related-grid">
              <div
                v-for="rel in relatedPosts"
                :key="rel.slug"
                class="related-card"
                @click="navigateToPost(rel.slug)"
              >
                <div class="related-cat">{{ rel.category }}</div>
                <h4 class="related-card-title">{{ rel.title }}</h4>
                <p class="related-card-desc">{{ rel.subtitle }}</p>
                <span class="related-link">
                  Read Guide <v-icon size="14" class="ml-1">mdi-arrow-right</v-icon>
                </span>
              </div>
            </div>
          </section>

          <!-- Back to Blog Button -->
          <div class="back-link-wrapper mt-12 text-center">
            <v-btn
              variant="outlined"
              color="primary"
              to="/blog"
              prepend-icon="mdi-arrow-left"
            >
              Back to All Articles
            </v-btn>
          </div>
        </v-container>
      </article>
    </main>

    <!-- 404 Not Found State -->
    <main class="page-content" v-else>
      <v-container class="text-center py-16">
        <v-icon size="64" color="rgba(255,255,255,0.4)" class="mb-4">mdi-file-question-outline</v-icon>
        <h1 class="text-h4 font-weight-bold text-white mb-3">Article Not Found</h1>
        <p class="text-white-50 mb-6">The guide you are looking for may have been moved or updated.</p>
        <v-btn color="primary" to="/blog" size="large">Browse All Guides</v-btn>
      </v-container>
    </main>

    <!-- Footer -->
    <footer class="blog-footer">
      <v-container class="text-center">
        <p class="footer-links">
          &copy; 2026 ScanGo Invoice. All rights reserved. |
          <router-link to="/">Home</router-link> |
          <router-link to="/blog">Blog</router-link> |
          <router-link to="/features">Features</router-link> |
          <router-link to="/pricing">Pricing</router-link> |
          <router-link to="/privacy">Privacy</router-link>
        </p>
      </v-container>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';
import { getPostBySlug, getRelatedPosts } from '../data/blogPosts.js';

const route = useRoute();
const router = useRouter();

const post = computed(() => getPostBySlug(route.params.slug));
const relatedPosts = computed(() => (post.value ? getRelatedPosts(post.value.slug, 2) : []));

const copied = ref(false);

const formattedDate = computed(() => {
  if (!post.value?.publishedAt) return '';
  try {
    const [year, month, day] = post.value.publishedAt.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return post.value.publishedAt;
  }
});

const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

const handleShare = async () => {
  if (!post.value) return;
  const shareData = {
    title: post.value.title,
    text: post.value.subtitle,
    url: window.location.href,
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        await copyArticleLink();
      }
    }
  } else {
    await copyArticleLink();
  }
};

const copyArticleLink = async () => {
  try {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {
    // Fallback
  }
};

const navigateToPost = (slug) => {
  router.push(`/blog/${slug}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Reactively update meta tags whenever slug / post changes
watch(
  post,
  (currentPost) => {
    if (currentPost) {
      useHead({
        title: `${currentPost.title} | ScanGo Invoice Blog`,
        meta: [
          { name: 'description', content: currentPost.metaDescription },
          { property: 'og:title', content: `${currentPost.title} | ScanGo Invoice` },
          { property: 'og:description', content: currentPost.metaDescription },
          { property: 'og:type', content: 'article' },
          { property: 'og:url', content: `https://scangoinvoice.com/blog/${currentPost.slug}` },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: currentPost.title },
          { name: 'twitter:description', content: currentPost.metaDescription }
        ]
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.blog-post-page {
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.page-content {
  padding-top: 24px;
  padding-bottom: 60px;
}

/* Header Section */
.article-header {
  padding: 16px 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.article-header-container {
  max-width: 860px;
  margin: 0 auto;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #94a3b8;
}

.breadcrumb-nav a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb-nav a:hover {
  color: #60a5fa;
}

.separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.2);
}

.current-crumb {
  color: #cbd5e1;
}

.article-meta-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-badge {
  background: #0d47a1;
  border: 1px solid #3b82f6;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 6px;
}

.read-time-badge {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.article-title {
  font-size: clamp(2rem, 3.8vw, 2.9rem);
  font-weight: 800;
  line-height: 1.2;
  color: #ffffff;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.article-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #cbd5e1;
  margin-bottom: 28px;
}

.author-share-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.author-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.author-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 1rem;
}

.author-meta {
  font-size: 0.8rem;
  color: #94a3b8;
}

.share-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #cbd5e1;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.28);
}

.native-share-btn {
  background: rgba(13, 71, 161, 0.35);
  border-color: rgba(59, 130, 246, 0.45);
  color: #93c5fd;
  font-weight: 600;
}

.native-share-btn:hover {
  background: #0d47a1;
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.35);
}

.copied-text {
  color: #4ade80 !important;
  font-weight: 600;
}

/* Article Body */
.article-body-wrapper {
  padding: 40px 0;
}

.article-body-container {
  max-width: 860px;
  margin: 0 auto;
}

/* Deep styling for rendered article content */
:deep(.article-content) {
  font-size: 1.12rem;
  line-height: 1.8;
  color: #e2e8f0;
}

:deep(.article-content .lead) {
  font-size: 1.25rem;
  line-height: 1.7;
  color: #f1f5f9;
  font-weight: 400;
  margin-bottom: 28px;
}

:deep(.article-content h2) {
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin-top: 44px;
  margin-bottom: 16px;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

:deep(.article-content h3) {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  margin-top: 32px;
  margin-bottom: 12px;
}

:deep(.article-content p) {
  margin-bottom: 22px;
}

:deep(.article-content ul),
:deep(.article-content ol) {
  margin-bottom: 26px;
  padding-left: 24px;
}

:deep(.article-content li) {
  margin-bottom: 10px;
}

:deep(.article-content blockquote) {
  background: rgba(13, 71, 161, 0.15);
  border-left: 4px solid #3b82f6;
  border-radius: 0 12px 12px 0;
  padding: 18px 24px;
  margin: 28px 0;
  font-style: italic;
  color: #93c5fd;
}

/* Pro Tip Callout */
:deep(.article-content .pro-tip-box) {
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.25) 0%, rgba(30, 58, 138, 0.15) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 14px;
  padding: 24px;
  margin: 32px 0;
}

:deep(.article-content .pro-tip-header) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #ffffff;
  font-size: 1.05rem;
}

:deep(.article-content .pro-tip-badge) {
  background: #3b82f6;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

:deep(.article-content .pro-tip-box p) {
  margin-bottom: 0;
  color: #cbd5e1;
}

/* Summary Card */
:deep(.article-content .article-summary-card) {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 24px;
  margin: 36px 0;
}

:deep(.article-content .article-summary-card h3) {
  margin-top: 0;
  color: #60a5fa;
  font-size: 1.2rem;
}

:deep(.article-content .article-summary-card p) {
  margin-bottom: 0;
}

/* Comparison Table */
:deep(.article-content .comparison-table-wrapper) {
  overflow-x: auto;
  margin: 32px 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.article-content .comparison-table) {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

:deep(.article-content .comparison-table th) {
  background: rgba(13, 71, 161, 0.3);
  padding: 14px 18px;
  color: #ffffff;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

:deep(.article-content .comparison-table td) {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

:deep(.article-content .comparison-table tr:last-child td) {
  border-bottom: none;
}

/* Tags */
.article-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.tags-label {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 600;
  margin-right: 4px;
}

.tag-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 9999px;
}

/* Article CTA Box */
.article-cta-box {
  position: relative;
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.35) 0%, rgba(17, 29, 47, 0.85) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.cta-box-content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.cta-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cta-box-text {
  flex-grow: 1;
  min-width: 260px;
}

.cta-box-text h3 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}

.cta-box-text p {
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.cta-perks {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.85rem;
  color: #93c5fd;
  font-weight: 500;
}

.cta-box-action {
  flex-shrink: 0;
}

.register-btn {
  font-weight: 700 !important;
  text-transform: none !important;
  border-radius: 12px !important;
}

/* Related Posts */
.related-section {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 36px;
}

.related-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 20px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.related-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 22px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(59, 130, 246, 0.4);
}

.related-cat {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #60a5fa;
  margin-bottom: 8px;
}

.related-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.35;
  margin-bottom: 8px;
}

.related-card-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-link {
  display: inline-flex;
  align-items: center;
  color: #60a5fa;
  font-size: 0.85rem;
  font-weight: 600;
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

@media (max-width: 768px) {
  .page-content {
    padding-top: 4px;
    padding-bottom: 36px;
  }
  .article-header {
    padding: 8px 0 14px;
  }
  .breadcrumb-nav {
    margin-bottom: 10px !important;
    font-size: 0.8rem;
  }
  .article-meta-top {
    margin-bottom: 10px !important;
  }
  .article-title {
    font-size: 1.75rem;
    margin-bottom: 10px;
    line-height: 1.25;
  }
  .article-subtitle {
    font-size: 1rem;
    margin-bottom: 18px;
    line-height: 1.5;
  }
  .article-body-wrapper {
    padding: 24px 0 36px;
  }
  .author-share-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-top: 14px;
  }
  .share-actions {
    width: 100%;
    justify-content: flex-start;
  }
  .cta-box-content {
    flex-direction: column;
    text-align: center;
  }
  .cta-icon-wrapper {
    margin: 0 auto;
  }
  .cta-perks {
    justify-content: center;
  }
  .cta-box-action {
    width: 100%;
  }
  .register-btn {
    width: 100%;
  }
}
</style>
