<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useProjects from '../composables/useProjects';
import { useItems } from '../composables/useItems';
import { currentUser, userProfile } from '../composables/useAuth';
import { useOrganization } from '../composables/useOrganization';
import ReceiptViewer from './ReceiptViewer.vue';

const isOwner = computed(() => userProfile.value?.role === 'owner');
const { teamMembers } = useOrganization();

const assignedMembersNames = computed(() => {
  if (!project.value?.assignedMembers || !teamMembers.value.length) return [];
  return project.value.assignedMembers.map(uid => {
    const member = teamMembers.value.find(m => (m.uid || m.id) === uid);
    return member ? (member.name || member.email) : 'Unknown User';
  });
});

const router = useRouter();
const route  = useRoute();
const projectId = route.params.id;

const { getProject, updateProject, deleteProject, getEntries, addEntry, updateEntry, deleteEntry, buildInvoicePayload } = useProjects();
const { items, fetchItems, stopFetching: stopItems } = useItems();

// ── State ─────────────────────────────────────────────────────────
const project       = ref(null);
const projectError  = ref(null);
const activeTab     = ref('time');

const { entries, entriesLoading, stopEntries } = getEntries(projectId);

// ── Computed summaries ─────────────────────────────────────────────
const totalHours    = computed(() => entries.value.filter(e => e.type === 'time').reduce((s, e) => s + (Number(e.hours) || 0), 0));
const totalLabor    = computed(() => entries.value.filter(e => e.type === 'time' && e.billable).reduce((s, e) => s + (Number(e.hours) || 0) * (Number(e.rate) || 0), 0));
const totalExpenses = computed(() => entries.value.filter(e => e.type === 'expense' && e.billable).reduce((s, e) => s + (Number(e.amount) || 0), 0));
const totalBillable = computed(() => totalLabor.value + totalExpenses.value);
const timeEntries   = computed(() => entries.value.filter(e => e.type === 'time'));
const expEntries    = computed(() => entries.value.filter(e => e.type === 'expense'));

// ── Expense category typeahead ─────────────────────────────────────
const expenseCategories = computed(() => items.value.filter(i => i.type === 'expense-category').map(i => i.name));
const { addItem: addItemFn } = useItems();

// ── Entry form state ───────────────────────────────────────────────
const showTimeForm    = ref(false);
const showExpenseForm = ref(false);
const isSubmitting    = ref(false);
const entryError      = ref(null);
const receiptViewer   = ref({ show: false, url: '' });

const todayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
};

function freshTimeEntry() {
  return { date: todayStr(), hours: null, rate: Number(project.value?.defaultRate) || 0, description: '', billable: true };
}
function freshExpenseEntry() {
  return { date: todayStr(), amount: null, category: '', description: '', billable: true };
}

const timeForm    = ref(freshTimeEntry());
const expenseForm = ref(freshExpenseEntry());
const receiptFile = ref(null);
const receiptPreviewUrl = ref(null);

// ── Receipt file handling ──────────────────────────────────────────
const onReceiptChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  receiptFile.value = file;
  receiptPreviewUrl.value = URL.createObjectURL(file);
};

// ── Edit state ─────────────────────────────────────────────────────
const editingEntry  = ref(null);
const editForm      = ref({});
const showEditModal = ref(false);

const openEdit = (entry) => {
  editingEntry.value = entry;
  
  let dStr = todayStr();
  if (entry.date) {
    if (typeof entry.date === 'string' && entry.date.length === 10) {
      dStr = entry.date;
    } else {
      dStr = new Date(entry.date).toISOString().slice(0, 10);
    }
  }
  
  editForm.value = {
    ...entry,
    date: dStr,
  };
  showEditModal.value = true;
};

const saveEdit = async () => {
  isSubmitting.value = true;
  try {
    const { id, ...data } = editForm.value;
    await updateEntry(projectId, editingEntry.value.id, data);
    showEditModal.value = false;
  } catch (err) {
    entryError.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
};

// ── Submit time entry ──────────────────────────────────────────────
const openTimeForm = () => {
  // Reset with current defaultRate now that project is loaded
  timeForm.value = freshTimeEntry();
  showTimeForm.value = true;
};

const submitTimeEntry = async () => {
  if (!timeForm.value.hours || timeForm.value.hours <= 0) {
    entryError.value = 'Hours must be greater than 0.'; return;
  }
  isSubmitting.value = true;
  entryError.value = null;
  try {
    await addEntry(projectId, { type: 'time', ...timeForm.value });
    timeForm.value = freshTimeEntry();
    showTimeForm.value = false;
    await syncProjectTotals();
  } catch (err) {
    entryError.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
};

// ── Submit expense entry ───────────────────────────────────────────
const submitExpenseEntry = async () => {
  if (!expenseForm.value.amount || expenseForm.value.amount <= 0) {
    entryError.value = 'Amount must be greater than 0.'; return;
  }
  isSubmitting.value = true;
  entryError.value = null;
  try {
    // Auto-save new expense category
    if (expenseForm.value.category && !expenseCategories.value.includes(expenseForm.value.category)) {
      await addItemFn({ name: expenseForm.value.category, type: 'expense-category' });
    }
    await addEntry(projectId, { type: 'expense', ...expenseForm.value }, receiptFile.value);
    expenseForm.value = freshExpenseEntry();
    receiptFile.value = null;
    receiptPreviewUrl.value = null;
    showExpenseForm.value = false;
    await syncProjectTotals();
  } catch (err) {
    entryError.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
};

// ── Delete entry ───────────────────────────────────────────────────
const removeEntry = async (entryId) => {
  if (!confirm('Delete this entry?')) return;
  await deleteEntry(projectId, entryId);
  await syncProjectTotals();
};

// ── Sync denormalized totals on project doc ────────────────────────
const syncProjectTotals = async () => {
  await updateProject(projectId, {
    totalHours:    totalHours.value,
    totalLabor:    totalLabor.value,
    totalExpenses: totalExpenses.value,
  });
};

// ── Invoice conversion ─────────────────────────────────────────────
const convertToInvoice = () => {
  const payload = buildInvoicePayload(project.value, entries.value);
  router.push({ name: 'InvoiceNew', state: { invoicePrefill: payload } });
};

// ── Status helpers ─────────────────────────────────────────────────
const statusColor = (s) => ({ active: 'success', completed: 'info', archived: 'warning' }[s] || 'default');
const fmt$  = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);
const fmtDate = (d) => {
  if (!d) return '—';
  if (typeof d === 'string' && d.length === 10 && d.includes('-')) {
    const parts = d.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString();
  }
  return new Date(d).toLocaleDateString();
};

// ── Init ───────────────────────────────────────────────────────────
const init = async () => {
  try {
    project.value = await getProject(projectId);
    fetchItems();
  } catch (err) {
    projectError.value = 'Project not found.';
  }
};
init();

onUnmounted(() => { stopEntries(); stopItems(); });
</script>

<template>
  <div class="detail-container">
    <div class="detail-card">

      <!-- Error -->
      <div v-if="projectError" class="empty-state">
        <v-icon icon="mdi-alert-circle-outline" size="64" color="#f87171" />
        <p class="mt-4" style="color:#f87171;">{{ projectError }}</p>
        <v-btn :to="{ name: 'Projects' }" class="mt-4" variant="tonal">Back to Projects</v-btn>
      </div>

      <template v-else-if="project">
        <!-- Header -->
        <header class="detail-header">
          <div class="header-left">
            <div class="header-top-row">
              <v-btn :to="{ name: 'Projects' }" variant="text" color="white" size="small" prepend-icon="mdi-arrow-left" class="mr-2 back-btn">Projects</v-btn>
            </div>
            <h1 class="detail-title">{{ project.name }}</h1>
            <div class="header-meta">
              <v-chip :color="statusColor(project.status)" size="small" variant="tonal" class="mr-2">{{ project.status }}</v-chip>
              <span class="client-name" v-if="project.clientName">
                <v-icon icon="mdi-account-outline" size="14" class="mr-1" />{{ project.clientName }}
              </span>
              <span v-if="assignedMembersNames.length" class="client-name ml-4">
                <v-icon icon="mdi-account-group-outline" size="14" class="mr-1" />
                Assigned: {{ assignedMembersNames.join(', ') }}
              </span>
            </div>
          </div>
          <div class="header-actions" v-if="isOwner">
            <v-btn :to="{ name: 'ProjectEdit', params: { id: projectId } }" variant="outlined" color="white" size="small" prepend-icon="mdi-pencil" class="mr-2">Edit</v-btn>
            <v-btn @click="convertToInvoice" color="primary" size="small" prepend-icon="mdi-file-document-arrow-right" rounded="pill">Convert to Invoice</v-btn>
          </div>
        </header>

        <!-- Summary chips -->
        <div class="summary-row">
          <div class="summary-chip">
            <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
            <span>{{ totalHours.toFixed(1) }} hrs logged</span>
          </div>
          <div class="summary-chip">
            <v-icon icon="mdi-receipt-outline" size="16" class="mr-1" />
            <span>{{ fmt$(totalExpenses) }} expenses</span>
          </div>
          <div class="summary-chip highlight">
            <v-icon icon="mdi-currency-usd" size="16" class="mr-1" />
            <span>{{ fmt$(totalBillable) }} total billable</span>
          </div>
        </div>

        <!-- Error alert -->
        <v-alert v-if="entryError" type="error" closable class="mb-4" @click:close="entryError = null">{{ entryError }}</v-alert>

        <!-- Tabs -->
        <div class="tabs-row">
          <button :class="['tab-btn', { active: activeTab === 'time' }]" @click="activeTab = 'time'">
            <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />Time
          </button>
          <button :class="['tab-btn', { active: activeTab === 'expenses' }]" @click="activeTab = 'expenses'">
            <v-icon icon="mdi-receipt-outline" size="16" class="mr-1" />Expenses
          </button>
        </div>

        <!-- ── TIME TAB ──────────────────────────────────────────── -->
        <div v-if="activeTab === 'time'">
          <div class="tab-action-bar">
            <v-btn @click="openTimeForm" color="primary" variant="tonal" prepend-icon="mdi-plus" size="small">Log Hours</v-btn>
          </div>

          <!-- Inline time form -->
          <div v-if="showTimeForm" class="inline-form">
            <div class="form-grid-4">
              <div>
                <label class="field-label">Date</label>
                <v-text-field v-model="timeForm.date" type="date" variant="solo" density="compact" hide-details />
              </div>
              <div>
                <label class="field-label">Hours</label>
                <v-text-field v-model.number="timeForm.hours" type="number" min="0" step="0.25" variant="solo" density="compact" hide-details placeholder="0.00" />
              </div>
              <div>
                <label class="field-label">Rate ($/hr)</label>
                <v-text-field v-model.number="timeForm.rate" type="number" min="0" variant="solo" density="compact" hide-details />
              </div>
              <div class="billable-toggle">
                <label class="field-label">Billable</label>
                <v-switch v-model="timeForm.billable" color="primary" hide-details inset density="compact" />
              </div>
            </div>
            <div class="mt-3">
              <label class="field-label">Description</label>
              <v-text-field v-model="timeForm.description" variant="solo" density="compact" hide-details placeholder="What did you work on?" />
            </div>
            <div class="form-actions mt-3">
              <v-btn @click="showTimeForm = false" variant="text" size="small">Cancel</v-btn>
              <v-btn @click="submitTimeEntry" color="primary" size="small" :loading="isSubmitting">Save Entry</v-btn>
            </div>
          </div>

          <!-- Time entries list -->
          <div v-if="entriesLoading" class="loading-placeholder">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="timeEntries.length === 0" class="empty-tab">
            <v-icon icon="mdi-clock-plus-outline" size="48" color="rgba(255,255,255,0.15)" />
            <p class="mt-2">No time logged yet.</p>
          </div>
          <div v-else class="entry-list">
            <div v-for="entry in timeEntries" :key="entry.id" class="entry-row">
              <div class="entry-main">
                <span class="entry-date">{{ fmtDate(entry.date) }}</span>
                <span class="entry-desc">{{ entry.description || '—' }}</span>
              </div>
              <div class="entry-right">
                <span class="entry-stat">{{ Number(entry.hours).toFixed(2) }} hrs</span>
                <span class="entry-stat">@ {{ fmt$(entry.rate) }}</span>
                <span class="entry-subtotal">{{ fmt$(entry.hours * entry.rate) }}</span>
                <v-chip :color="entry.billable ? 'success' : 'default'" size="x-small" variant="tonal">{{ entry.billable ? 'Billable' : 'Non-billable' }}</v-chip>
                <v-btn icon size="x-small" variant="text" @click="openEdit(entry)"><v-icon icon="mdi-pencil" size="16" /></v-btn>
                <v-btn icon size="x-small" variant="text" color="red-lighten-3" @click="removeEntry(entry.id)"><v-icon icon="mdi-delete-outline" size="16" /></v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- ── EXPENSES TAB ──────────────────────────────────────── -->
        <div v-if="activeTab === 'expenses'">
          <div class="tab-action-bar">
            <v-btn @click="showExpenseForm = !showExpenseForm" color="primary" variant="tonal" prepend-icon="mdi-plus" size="small">Add Expense</v-btn>
          </div>

          <!-- Inline expense form -->
          <div v-if="showExpenseForm" class="inline-form">
            <div class="form-grid-4">
              <div>
                <label class="field-label">Date</label>
                <v-text-field v-model="expenseForm.date" type="date" variant="solo" density="compact" hide-details />
              </div>
              <div>
                <label class="field-label">Amount ($)</label>
                <v-text-field v-model.number="expenseForm.amount" type="number" min="0" step="0.01" variant="solo" density="compact" hide-details placeholder="0.00" />
              </div>
              <div>
                <label class="field-label">Category</label>
                <v-combobox v-model="expenseForm.category" :items="expenseCategories" variant="solo" density="compact" hide-details placeholder="e.g. Materials" />
              </div>
              <div class="billable-toggle">
                <label class="field-label">Billable</label>
                <v-switch v-model="expenseForm.billable" color="primary" hide-details inset density="compact" />
              </div>
            </div>
            <div class="mt-3">
              <label class="field-label">Description</label>
              <v-text-field v-model="expenseForm.description" variant="solo" density="compact" hide-details placeholder="What was this for?" />
            </div>
            <!-- Receipt upload -->
            <div class="mt-3">
              <label class="field-label">Receipt (optional)</label>
              <label class="receipt-upload-btn">
                <v-icon icon="mdi-camera-outline" class="mr-1" />
                {{ receiptFile ? receiptFile.name : 'Upload / Take Photo' }}
                <input type="file" accept="image/*" capture="environment" class="hidden-input" @change="onReceiptChange" />
              </label>
              <div v-if="receiptPreviewUrl" class="receipt-preview" @click="receiptViewer = { show: true, url: receiptPreviewUrl }">
                <img :src="receiptPreviewUrl" alt="Receipt preview" />
              </div>
            </div>
            <div class="form-actions mt-3">
              <v-btn @click="showExpenseForm = false" variant="text" size="small">Cancel</v-btn>
              <v-btn @click="submitExpenseEntry" color="primary" size="small" :loading="isSubmitting">Save Expense</v-btn>
            </div>
          </div>

          <!-- Expense entries list -->
          <div v-if="entriesLoading" class="loading-placeholder"><v-progress-circular indeterminate color="primary" /></div>
          <div v-else-if="expEntries.length === 0" class="empty-tab">
            <v-icon icon="mdi-receipt-text-plus-outline" size="48" color="rgba(255,255,255,0.15)" />
            <p class="mt-2">No expenses logged yet.</p>
          </div>
          <div v-else class="entry-list">
            <div v-for="entry in expEntries" :key="entry.id" class="entry-row">
              <div class="entry-main">
                <span class="entry-date">{{ fmtDate(entry.date) }}</span>
                <span class="entry-desc">{{ entry.category ? `[${entry.category}] ` : '' }}{{ entry.description || '—' }}</span>
              </div>
              <div class="entry-right">
                <span class="entry-subtotal">{{ fmt$(entry.amount) }}</span>
                <v-chip :color="entry.billable ? 'success' : 'default'" size="x-small" variant="tonal">{{ entry.billable ? 'Billable' : 'Non-billable' }}</v-chip>
                <v-btn v-if="entry.receiptUrl" icon size="x-small" variant="text" color="blue-lighten-3" @click="receiptViewer = { show: true, url: entry.receiptUrl }">
                  <v-icon icon="mdi-image-outline" size="16" />
                </v-btn>
                <v-btn icon size="x-small" variant="text" @click="openEdit(entry)"><v-icon icon="mdi-pencil" size="16" /></v-btn>
                <v-btn icon size="x-small" variant="text" color="red-lighten-3" @click="removeEntry(entry.id)"><v-icon icon="mdi-delete-outline" size="16" /></v-btn>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- Edit entry modal -->
    <v-dialog v-model="showEditModal" max-width="500">
      <v-card style="background:#1e2d42; color:#f1f5f9;">
        <v-card-title class="pa-4">Edit Entry</v-card-title>
        <v-card-text>
          <v-text-field label="Date" type="date" v-model="editForm.date" variant="solo" density="comfortable" class="mb-3" hide-details />
          <template v-if="editForm.type === 'time'">
            <v-text-field label="Hours" type="number" v-model.number="editForm.hours" min="0" step="0.25" variant="solo" density="comfortable" class="mb-3" hide-details />
            <v-text-field label="Rate ($/hr)" type="number" v-model.number="editForm.rate" min="0" variant="solo" density="comfortable" class="mb-3" hide-details />
          </template>
          <template v-else>
            <v-text-field label="Amount ($)" type="number" v-model.number="editForm.amount" min="0" variant="solo" density="comfortable" class="mb-3" hide-details />
            <v-text-field label="Category" v-model="editForm.category" variant="solo" density="comfortable" class="mb-3" hide-details />
          </template>
          <v-text-field label="Description" v-model="editForm.description" variant="solo" density="comfortable" class="mb-3" hide-details />
          <v-switch label="Billable" v-model="editForm.billable" color="primary" inset hide-details />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="showEditModal = false" variant="text">Cancel</v-btn>
          <v-btn @click="saveEdit" color="primary" :loading="isSubmitting">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Receipt lightbox -->
    <ReceiptViewer v-model="receiptViewer.show" :receipt-url="receiptViewer.url" />
  </div>
</template>

<style scoped>
.detail-container { padding: 2rem; background-color: #111d2f; min-height: 100vh; color: #f1f5f9; }
.detail-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); padding: 2rem; max-width: 1100px; margin: 0 auto; }

/* Header */
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem; margin-bottom: 1.25rem; }
.header-top-row { margin-bottom: 0.25rem; }
.back-btn { opacity: 0.6; }
.detail-title { font-size: 1.8rem; font-weight: 700; color: #fff; margin: 0.25rem 0; }
.header-meta { display: flex; align-items: center; gap: 0.5rem; }
.client-name { color: #94a3b8; font-size: 0.85rem; display: flex; align-items: center; }
.header-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

/* Summary chips */
.summary-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; }
.summary-chip { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 0.35rem 1rem; font-size: 0.85rem; color: #94a3b8; display: inline-flex; align-items: center; }
.summary-chip.highlight { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.25); color: #86efac; font-weight: 600; }

/* Tabs */
.tabs-row { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0; }
.tab-btn { background: none; border: none; border-bottom: 2px solid transparent; color: #94a3b8; padding: 0.6rem 1.1rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; transition: all 0.2s; margin-bottom: -1px; }
.tab-btn:hover { color: #e2e8f0; }
.tab-btn.active { color: #93c5fd; border-bottom-color: #3b82f6; }

/* Tab action bar */
.tab-action-bar { display: flex; justify-content: flex-end; margin: 1rem 0 0.75rem; }

/* Inline form */
.inline-form { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 1.25rem; margin-bottom: 1.25rem; }
.form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.field-label { font-size: 0.78rem; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.04em; }
.billable-toggle { display: flex; flex-direction: column; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }

/* Receipt upload */
.receipt-upload-btn { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.07); border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.85rem; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
.receipt-upload-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }
.hidden-input { display: none; }
.receipt-preview { margin-top: 0.75rem; }
.receipt-preview img { max-height: 120px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); }

/* Entry list */
.entry-list { display: flex; flex-direction: column; gap: 0.5rem; }
.entry-row { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.entry-main { display: flex; flex-direction: column; gap: 0.15rem; }
.entry-date { font-size: 0.78rem; color: #94a3b8; }
.entry-desc { font-size: 0.9rem; color: #e2e8f0; }
.entry-right { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.entry-stat { font-size: 0.82rem; color: #94a3b8; }
.entry-subtotal { font-size: 0.9rem; font-weight: 600; color: #f1f5f9; }

/* Empty / loading */
.empty-tab { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; text-align: center; color: #94a3b8; }
.loading-placeholder { display: flex; justify-content: center; padding: 3rem; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; }

:deep(.v-list) { background: #fff !important; color: #1e293b !important; }
:deep(.v-list-item) { color: #1e293b !important; }

@media (max-width: 640px) {
  .detail-container, .detail-card { padding: 1rem; }
  .form-grid-4 { grid-template-columns: 1fr 1fr; }
  .entry-right { justify-content: flex-end; }
}
</style>
