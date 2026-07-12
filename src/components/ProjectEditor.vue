<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useProjects from '../composables/useProjects';
import { useCustomers } from '../composables/useCustomers';
import { useOrganization } from '../composables/useOrganization';
import { userProfile } from '../composables/useAuth';

const router = useRouter();
const route  = useRoute();
const { createProject, updateProject, getProject, deleteProject } = useProjects();
const { customers } = useCustomers();

const isEdit   = computed(() => !!route.params.id);
const pageTitle = computed(() => isEdit.value ? 'Edit Project' : 'New Project');
const isOwner   = computed(() => userProfile.value?.role === 'owner');

const { teamMembers } = useOrganization();

const form = ref({
  name:        '',
  clientName:  '',
  clientId:    null,
  description: '',
  defaultRate: 0,
  status:      'active',
  assignedMembers: []
});

const teamMembersList = computed(() => {
  return teamMembers.value
    .filter(m => m.role !== 'owner')
    .map(m => ({
      name: m.name || m.email,
      uid: m.uid || m.id
    }));
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
      Object.assign(form.value, {
        assignedMembers: [],
        ...project
      });
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

const showDeleteConfirm = ref(false);
const deleteConfirmName = ref('');

const handleDelete = async () => {
  if (deleteConfirmName.value !== form.value.name) return;
  isProcessing.value = true;
  formError.value = null;
  try {
    await deleteProject(route.params.id);
    showDeleteConfirm.value = false;
    router.push({ name: 'Projects' });
  } catch (err) {
    formError.value = err.message || 'Failed to delete project.';
    showDeleteConfirm.value = false;
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
        <div v-if="isOwner" class="field-group field-half">
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

        <!-- Team Assignment -->
        <div class="field-group mt-4">
          <label class="field-label">Assign Team Members</label>
          <v-select
            v-model="form.assignedMembers"
            :items="teamMembersList"
            item-title="name"
            item-value="uid"
            multiple
            chips
            closable-chips
            clearable
            placeholder="Select team members to assign"
            variant="solo"
            density="comfortable"
            hide-details
          />
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <v-btn
            v-if="isEdit && isOwner"
            @click="showDeleteConfirm = true; deleteConfirmName = '';"
            color="error"
            variant="outlined"
            class="mr-auto"
          >
            Delete Project
          </v-btn>
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

    <!-- Delete Project Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="500">
      <v-card style="background:#1e2d42; color:#f1f5f9; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px);">
        <v-card-title class="pa-4 d-flex align-center" style="color: #f87171;">
          <v-icon icon="mdi-alert-outline" class="mr-2" color="error" />
          Delete Project?
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <p class="mb-4" style="color: #cbd5e1; font-size: 0.95rem;">
            This will permanently delete the project <strong>{{ form.name }}</strong> and all associated time and expense entries. This action cannot be undone.
          </p>
          <p class="mb-2" style="color: #94a3b8; font-size: 0.85rem;">
            To confirm, please type the project name below:
          </p>
          <v-text-field
            v-model="deleteConfirmName"
            variant="solo"
            density="comfortable"
            :placeholder="form.name"
            hide-details
            class="mb-2"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="showDeleteConfirm = false" variant="text" color="white">Cancel</v-btn>
          <v-btn
            @click="handleDelete"
            color="error"
            variant="elevated"
            rounded="pill"
            :disabled="deleteConfirmName !== form.name"
            :loading="isProcessing"
          >
            Permanently Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 0.75rem;
  }
  .form-actions .v-btn {
    width: 100% !important;
    margin: 0 !important;
  }
}
</style>
