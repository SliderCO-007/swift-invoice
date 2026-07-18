<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import useProjects from '../composables/useProjects';
import { userProfile } from '../composables/useAuth';
import UpgradePrompt from './UpgradePrompt.vue';

const { mobile } = useDisplay();

const router = useRouter();
const { projects, loading } = useProjects();

// Subscription gate
const isPaidUser = computed(() =>
  userProfile.value?.subscriptionStatus === 'active'
);

const isOwner = computed(() =>
  userProfile.value?.role === 'owner'
);

const filterTab = computed({
  get: () => router.currentRoute.value.query.status || 'all',
  set: (val) => router.replace({ query: val === 'all' ? {} : { status: val } }),
});

const tabs = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived',  value: 'archived'  },
];

const filteredProjects = computed(() => {
  if (filterTab.value === 'all') return projects.value;
  return projects.value.filter(p => p.status === filterTab.value);
});

// Running totals per project (computed from top-level project doc — no live subcollection here)
const statusColor = (status) => {
  if (status === 'active')    return 'success';
  if (status === 'completed') return 'info';
  if (status === 'archived')  return 'warning';
  return 'default';
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
</script>

<template>
  <div class="projects-container">
    <div class="projects-card">

      <!-- Header -->
      <header class="projects-header">
        <div>
          <h1 class="projects-title">
            <v-icon icon="mdi-folder-multiple-outline" class="mr-2" />
            Projects
          </h1>
          <p class="projects-subtitle">Track time and expenses, then convert to an invoice.</p>
        </div>
        <div v-if="isOwner" class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column">
          <v-btn
            color="primary"
            :to="{ name: 'ProjectNew' }"
            prepend-icon="mdi-plus"
            rounded="pill"
            :size="mobile ? 'default' : 'large'"
            class="elevation-2 w-100 w-sm-auto"
          >New Project</v-btn>
        </div>
      </header>

      <!-- Free Plan Project Alert Banner -->
      <div v-if="!isPaidUser && isOwner" class="free-projects-banner mb-6">
        <v-icon icon="mdi-information-outline" color="primary" class="mr-3" />
        <div class="banner-text">
          <strong>Project tracking is fully enabled on your Free Plan!</strong> 
          Upgrade to a paid subscription to unlock direct email sending and unlimited invoicing.
        </div>
        <v-btn to="/pricing" color="primary" variant="flat" size="small" class="ml-auto rounded-pill">Upgrade</v-btn>
      </div>

      <!-- Status filter tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['filter-tab', { active: filterTab === tab.value }]"
          @click="filterTab = tab.value"
        >{{ tab.label }}</button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="project-grid">
        <v-skeleton-loader v-for="n in 4" :key="n" type="card" class="skeleton-card" />
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <v-icon icon="mdi-folder-open-outline" size="72" color="rgba(255,255,255,0.15)" />
        <p class="mt-4" style="color:#94a3b8;">No {{ filterTab === 'all' ? '' : filterTab + ' ' }}projects yet.</p>
        <v-btn
          v-if="filterTab === 'all' && isOwner"
          :to="{ name: 'ProjectNew' }"
          color="primary"
          variant="tonal"
          class="mt-4"
          prepend-icon="mdi-plus"
        >Create your first project</v-btn>
      </div>

      <!-- Project grid -->
      <div v-else class="project-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="router.push({ name: 'ProjectDetail', params: { id: project.id } })"
        >
          <div class="project-card-header">
            <div>
              <span class="project-name">{{ project.name }}</span>
              <v-chip
                :color="statusColor(project.status)"
                size="small"
                class="ml-2"
                variant="tonal"
              >{{ project.status }}</v-chip>
            </div>
            <v-icon icon="mdi-chevron-right" color="rgba(255,255,255,0.3)" />
          </div>

          <p class="project-client">
            <v-icon icon="mdi-account-outline" size="14" class="mr-1" />
            {{ project.clientName || 'No client' }}
          </p>

          <p v-if="project.description" class="project-description">
            {{ project.description }}
          </p>

          <div class="project-chips">
            <span class="info-chip">
              <v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
              {{ (project.totalHours || 0).toFixed(1) }} hrs
            </span>
            <span class="info-chip">
              <v-icon icon="mdi-receipt-outline" size="14" class="mr-1" />
              {{ formatCurrency(project.totalExpenses) }}
            </span>
            <span class="info-chip highlight" v-if="isOwner">
              <v-icon icon="mdi-currency-usd" size="14" class="mr-1" />
              {{ formatCurrency((project.totalLabor || 0) + (project.totalExpenses || 0)) }} billable
            </span>
          </div>

          <p class="project-updated">
            Updated {{ project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '—' }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.projects-container {
  padding: 2rem;
  background-color: #111d2f;
  min-height: 100vh;
  color: #f1f5f9;
}

.projects-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.projects-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.projects-subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 0.95rem;
}

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.filter-tab.active {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
  color: #93c5fd;
}

/* Project grid */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
  min-height: 180px;
}

/* Project card */
.project-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  border-color: rgba(59, 130, 246, 0.3);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.project-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: #f1f5f9;
}

.project-client {
  color: #94a3b8;
  font-size: 0.825rem;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
}

.project-description {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.info-chip {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: 0.78rem;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
}

.info-chip.highlight {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.25);
  color: #86efac;
}

.project-updated {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
}

/* Lock / empty states */
.lock-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.free-projects-banner {
  display: flex;
  align-items: center;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.banner-text {
  flex: 1;
}

@media (max-width: 640px) {
  .projects-container,
  .projects-card {
    padding: 1rem;
  }

  .projects-header {
    flex-direction: column;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }

  .free-projects-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .free-projects-banner .v-btn {
    margin-left: 0 !important;
    margin-top: 0.5rem;
    width: 100%;
  }
}
</style>
