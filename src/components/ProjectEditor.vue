<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useProjects from '../composables/useProjects';
import { useCustomers } from '../composables/useCustomers';

const router = useRouter();
const route  = useRoute();
const { createProject, updateProject, getProject } = useProjects();
const { customers } = useCustomers();

const isEdit   = computed(() => !!route.params.id);
const pageTitle = computed(() => isEdit.value ? 'Edit Project' : 'New Project');

const form = ref({
  name:        '',
  clientName:  '',
  clientId:    null,
  description: '',
  defaultRate: 0,
  status:      'active',
});

const selectedCustomer = ref(null);
const isProcessing = ref(false);
const formError    = ref(null);

// Pre-fill client fields from customer picker
watch(selectedCustomer, (c) => {
  if (c) {
    form.value.clientName = c.name || '';
    form.value.clientId   = c.id   || null;
  }
});

// Load existing project in edit mode
onMounted(async () => {
  if (isEdit.value) {
    try {
      const project = await getProject(route.params.id);
      Object.assign(form.value, project);
    } catch (err) {
      formError.value = 'Could not load project.';
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    formError.value = 'Project name is required.';
    return;
  }
  isProcessing.value = true;
  formError.value = null;

  try {
    if (isEdit.value) {
      await updateProject(route.params.id, form.value);
      router.push({ name: 'ProjectDetail', params: { id: route.params.id } });
    } else {
      const id = await createProject(form.value);
      router.push({ name: 'ProjectDetail', params: { id } });
    }
  } catch (err) {
    formError.value = err.message || 'An error occurred.';
  } finally {
    isProcessing.value = false;
  }
};

const cancel = () => {
  if (isEdit.value) {
    router.push({ name: 'ProjectDetail', params: { id: route.params.id } });
  } else {
    router.push({ name: 'Projects' });
  }
};
</script>

<template>
  <div class="editor-container">
    <div class="editor-card">

      <header class="editor-header">
        <h1>{{ pageTitle }}</h1>
        <v-btn @click="cancel" color="white" variant="flat" class="text-indigo-darken-4 font-weight-bold">
          Cancel
        </v-btn>
      </header>

      <v-alert v-if="formError" type="error" class="mb-4" closable @click:close="formError = null">
        {{ formError }}
      </v-alert>

      <div class="form-body">

        <!-- Name -->
        <div class="field-group">
          <label class="field-label">Project Name <span class="required">*</span></label>
          <v-text-field
            v-model="form.name"
            variant="solo"
            density="comfortable"
            placeholder="e.g. Website Redesign"
            hide-details
          />
        </div>

        <!-- Client -->
        <div class="field-group">
          <label class="field-label">Client</label>
          <v-autocomplete
            v-model="selectedCustomer"
            :items="customers"
            item-title="name"
            return-object
            label="Select a customer…"
            variant="solo"
            density="comfortable"
            clearable
            hide-details
            class="mb-2"
          />
          <v-text-field
            v-model="form.clientName"
            variant="solo"
            density="comfortable"
            placeholder="Or type a client name"
            hide-details
          />
        </div>

        <!-- Description -->
        <div class="field-group">
          <label class="field-label">Description</label>
          <v-textarea
            v-model="form.description"
            variant="solo"
            density="comfortable"
            rows="3"
            placeholder="Optional project notes…"
            hide-details
          />
        </div>

        <!-- Default hourly rate -->
        <div class="field-group field-half">
          <label class="field-label">Default Hourly Rate ($)</label>
          <v-text-field
            v-model.number="form.defaultRate"
            type="number"
            variant="solo"
            density="comfortable"
            min="0"
            hide-details
          />
        </div>

        <!-- Status (edit only) -->
        <div v-if="isEdit" class="field-group">
          <label class="field-label">Status</label>
          <v-radio-group v-model="form.status" inline hide-details>
            <v-radio label="Active"    value="active"    />
            <v-radio label="Completed" value="completed" />
            <v-radio label="Archived"  value="archived"  />
          </v-radio-group>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <v-btn @click="cancel" variant="outlined" color="white" class="mr-2">Cancel</v-btn>
          <v-btn
            @click="handleSubmit"
            color="primary"
            :loading="isProcessing"
            size="large"
            rounded="pill"
          >
            {{ isEdit ? 'Save Changes' : 'Create Project' }}
          </v-btn>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.editor-container {
  padding: 2rem;
  background-color: #111d2f;
  min-height: 100vh;
  color: #f1f5f9;
}

.editor-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  padding: 2rem;
  max-width: 680px;
  margin: 0 auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.editor-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-half {
  max-width: 220px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
}

.required {
  color: #f87171;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.v-list) { background: #fff !important; color: #1e293b !important; }
:deep(.v-list-item) { color: #1e293b !important; }

@media (max-width: 640px) {
  .editor-container, .editor-card { padding: 1rem; }
  .field-half { max-width: 100%; }
}
</style>
