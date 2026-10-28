<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';
import { useCustomers } from '../composables/useCustomers';
import { exportToCSV } from '../utils/exportCsv';

const { mobile } = useDisplay();
const route = useRoute();
const { customers, loading, addCustomer, updateCustomer, addCustomerNote, deleteCustomer } = useCustomers();

onMounted(() => {
  if (route.query.action === 'new') {
    openDialog();
  }
});

const dialog = ref(false);
const deleting = ref(false);
const itemToDelete = ref(null);

// Dedicated Notes Log Modal State
const notesDialog = ref(false);
const activeNotesCustomerId = ref(null);
const quickNoteText = ref('');
const addingQuickNote = ref(false);

// Form Note Input for Add/Edit Customer Dialog
const formNewNote = ref('');
const savingCustomer = ref(false);

const defaultItem = {
  id: null,
  name: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  notes: []
};
const editedItem = ref({ ...defaultItem });
const editedIndex = ref(-1);

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Customer' : 'Edit Customer'));

// Keep active customer reactive with Firestore snapshot updates
const activeNotesCustomer = computed(() => {
  if (!activeNotesCustomerId.value) return null;
  return customers.value.find(c => c.id === activeNotesCustomerId.value) || null;
});

// Return notes sorted newest-first for display
const getSortedNotes = (customer) => {
  if (!customer || !Array.isArray(customer.notes)) return [];
  return [...customer.notes].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

const getLatestNote = (customer) => {
  const sorted = getSortedNotes(customer);
  return sorted.length ? sorted[0] : null;
};

const formatNoteTimestamp = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Address', key: 'address', sortable: false },
  { title: 'Notes Log', key: 'notes', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const getFormattedAddress = (item) => {
  const parts = [item.address1, item.address2, item.city, item.state, item.zip];
  return parts.filter(p => p).join(', ');
};

function openDialog() {
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem, notes: [] };
  formNewNote.value = '';
  dialog.value = true;
}

function editItem(item) {
  editedIndex.value = customers.value.findIndex(c => c.id === item.id);
  editedItem.value = Object.assign({}, defaultItem, item);
  formNewNote.value = '';
  dialog.value = true;
}

function openNotesDialog(item) {
  activeNotesCustomerId.value = item.id;
  quickNoteText.value = '';
  notesDialog.value = true;
}

function closeNotesDialog() {
  notesDialog.value = false;
  activeNotesCustomerId.value = null;
  quickNoteText.value = '';
}

async function handleAddQuickNote() {
  if (!activeNotesCustomerId.value || !quickNoteText.value.trim()) return;
  addingQuickNote.value = true;
  try {
    await addCustomerNote(activeNotesCustomerId.value, quickNoteText.value);
    quickNoteText.value = '';
  } finally {
    addingQuickNote.value = false;
  }
}

function confirmDelete(item) {
  itemToDelete.value = item;
  deleting.value = true;
}

async function deleteItemConfirm() {
  if (itemToDelete.value) {
    await deleteCustomer(itemToDelete.value.id);
  }
  closeDelete();
}

function closeDelete() {
  deleting.value = false;
  itemToDelete.value = null;
}

function close() {
  dialog.value = false;
  formNewNote.value = '';
}

async function save() {
  savingCustomer.value = true;
  try {
    const dataToSave = { ...editedItem.value };
    delete dataToSave.id;

    if (editedIndex.value > -1 && editedItem.value.id) {
      await updateCustomer(editedItem.value.id, dataToSave, formNewNote.value);
    } else {
      await addCustomer(dataToSave, formNewNote.value);
    }
    close();
  } finally {
    savingCustomer.value = false;
  }
}

const exportCustomersOutput = () => {
  const data = customers.value.map(c => {
    const sortedNotes = getSortedNotes(c);
    const formattedNotes = sortedNotes
      .map(n => `[${formatNoteTimestamp(n.createdAt)}] ${n.text}`)
      .join(' | ');

    return {
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      'Address Line 1': c.address1,
      'Address Line 2': c.address2,
      City: c.city,
      State: c.state,
      Zip: c.zip,
      'Notes History': formattedNotes
    };
  });
  exportToCSV('customers_export.csv', data);
};
</script>

<template>
  <div class="customers-view pa-4 pa-md-6">
    <header class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <h1 class="text-h5 text-sm-h4 font-weight-bold mb-0">Manage Your Customers</h1>
      <div class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column">
        <v-btn 
          color="primary" 
          @click="openDialog" 
          :size="mobile ? 'default' : 'large'" 
          class="elevation-2 w-100 w-sm-auto"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Customer
        </v-btn>
        <v-btn 
          color="primary" 
          variant="outlined" 
          @click="exportCustomersOutput" 
          :size="mobile ? 'default' : 'large'" 
          class="elevation-2 bg-transparent w-100 w-sm-auto" 
          :disabled="!customers.length || loading"
        >
          <v-icon start>mdi-download</v-icon>
          Export CSV
        </v-btn>
      </div>
    </header>

    <p class="text-subtitle-1 mb-6">Keep all your client information and timestamped activity notes organized in one place.</p>

    <!-- Desktop View: Data Table -->
    <v-card class="elevation-2" v-if="!mobile">
      <v-data-table
        :headers="headers"
        :items="customers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.address="{ item }">
          <span>{{ getFormattedAddress(item) }}</span>
        </template>

        <template v-slot:item.notes="{ item }">
          <div class="d-flex align-center py-2">
            <v-btn
              size="small"
              :variant="getSortedNotes(item).length ? 'tonal' : 'outlined'"
              :color="getSortedNotes(item).length ? 'primary' : 'grey-lighten-1'"
              class="text-none notes-trigger-btn"
              @click="openNotesDialog(item)"
            >
              <v-icon start size="16">mdi-notebook-outline</v-icon>
              <span v-if="getSortedNotes(item).length">
                {{ getSortedNotes(item).length }} {{ getSortedNotes(item).length === 1 ? 'Note' : 'Notes' }}
              </span>
              <span v-else>Add Note</span>
            </v-btn>
            <span
              v-if="getLatestNote(item)"
              class="ms-3 text-caption text-medium-emphasis latest-note-snippet text-truncate"
              :title="getLatestNote(item).text"
            >
              {{ getLatestNote(item).text }}
            </span>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="me-3" @click="openNotesDialog(item)" color="primary">mdi-note-plus-outline</v-icon>
            </template>
            <span>View / Add Notes</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="me-3" @click="editItem(item)" color="grey-darken-1">mdi-pencil</v-icon>
            </template>
            <span>Edit Customer</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="confirmDelete(item)" color="grey-darken-1">mdi-delete</v-icon>
            </template>
            <span>Delete Customer</span>
          </v-tooltip>
        </template>

        <template v-slot:no-data>
          <div class="d-flex flex-column align-center justify-center pa-10 text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
            <h3 class="text-h6 mb-2">No Customers Yet</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">Click the button below to add your first client.</p>
            <v-btn color="primary" @click="openDialog">Add First Customer</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Mobile View: Card List -->
    <div v-else>
      <v-card v-for="item in customers" :key="item.id" class="mb-4 elevation-2">
        <v-card-title class="pt-4 px-4 pb-2 d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold text-white text-truncate">{{ item.name }}</span>
          <v-chip
            v-if="getSortedNotes(item).length"
            size="small"
            color="primary"
            variant="tonal"
            @click="openNotesDialog(item)"
          >
            <v-icon start size="14">mdi-notebook-outline</v-icon>
            {{ getSortedNotes(item).length }}
          </v-chip>
        </v-card-title>
        
        <v-card-text class="px-4 py-2">
          <div v-if="item.email" class="d-flex align-center mb-2">
            <v-icon color="grey-darken-1" class="me-3">mdi-email-outline</v-icon>
            <a :href="'mailto:' + item.email" class="text-decoration-none text-body-1">{{ item.email }}</a>
          </div>
          <div v-if="item.phone" class="d-flex align-center mb-2">
            <v-icon color="grey-darken-1" class="me-3">mdi-phone-outline</v-icon>
            <a :href="'tel:' + item.phone" class="text-decoration-none text-body-1">{{ item.phone }}</a>
          </div>
          <div v-if="getFormattedAddress(item)" class="d-flex align-start mb-2">
            <v-icon color="grey-darken-1" class="me-3 mt-1">mdi-map-marker-outline</v-icon>
            <span class="text-body-1">{{ getFormattedAddress(item) }}</span>
          </div>

          <!-- Latest Note Preview on Mobile Card -->
          <div
            v-if="getLatestNote(item)"
            class="mobile-note-preview mt-3 pa-3 rounded"
            @click="openNotesDialog(item)"
          >
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption font-weight-bold text-primary d-flex align-center">
                <v-icon size="14" class="me-1" color="primary">mdi-clock-outline</v-icon>
                Latest Note
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ formatNoteTimestamp(getLatestNote(item).createdAt) }}
              </span>
            </div>
            <p class="text-body-2 mb-0 note-preview-text">{{ getLatestNote(item).text }}</p>
          </div>
        </v-card-text>

        <v-divider class="border-opacity-10"></v-divider>

        <v-card-actions class="px-4 py-2 d-flex justify-end ga-2 flex-wrap">
          <v-btn
            variant="text"
            size="small"
            color="info"
            @click="openNotesDialog(item)"
            prepend-icon="mdi-notebook-outline"
          >
            Notes ({{ getSortedNotes(item).length }})
          </v-btn>
          <v-btn variant="text" size="small" color="primary" @click="editItem(item)" prepend-icon="mdi-pencil">
            Edit
          </v-btn>
          <v-btn variant="text" size="small" color="red-lighten-2" @click="confirmDelete(item)" prepend-icon="mdi-delete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>

      <div v-if="!customers.length && !loading" class="text-center pa-10">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
        <h3 class="text-h6 mb-2">No Customers Yet</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">Click the button below to add your first client.</p>
        <v-btn color="primary" @click="openDialog">Add First Customer</v-btn>
      </div>
    </div>

    <!-- Dedicated Append-Only Customer Notes Log Dialog -->
    <v-dialog v-model="notesDialog" max-width="640px">
      <v-card v-if="activeNotesCustomer" class="notes-dialog-card">
        <v-card-title class="pa-4 bg-primary d-flex justify-space-between align-center flex-wrap ga-2">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="white">mdi-notebook-check-outline</v-icon>
            <span class="text-h6 font-weight-bold">{{ activeNotesCustomer.name }} — Notes Log</span>
          </div>
          <v-chip size="x-small" color="white" variant="outlined" class="rim-badge">
            <v-icon start size="12">mdi-shield-lock-outline</v-icon>
            Append-Only Audit Log
          </v-chip>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- Append New Note Form -->
          <div class="append-note-box mb-5">
            <v-textarea
              v-model="quickNoteText"
              label="Add a new timestamped note..."
              placeholder="e.g., Gate code #4821, prefers text before arrival, spoke about spring maintenance..."
              variant="solo"
              rows="3"
              auto-grow
              hide-details="auto"
              @keydown.ctrl.enter.prevent="handleAddQuickNote"
              @keydown.meta.enter.prevent="handleAddQuickNote"
            ></v-textarea>
            <div class="d-flex justify-space-between align-center mt-2 flex-wrap ga-2">
              <span class="text-caption text-medium-emphasis d-flex align-center">
                <v-icon size="14" class="me-1">mdi-information-outline</v-icon>
                Entries are permanent and timestamped for RIM compliance.
              </span>
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                :disabled="!quickNoteText.trim()"
                :loading="addingQuickNote"
                @click="handleAddQuickNote"
              >
                <v-icon start size="16">mdi-plus-circle-outline</v-icon>
                Append Note
              </v-btn>
            </div>
          </div>

          <v-divider class="border-opacity-15 mb-4"></v-divider>

          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-subtitle-2 font-weight-bold text-uppercase tracking-wider text-medium-emphasis">
              Chronological History ({{ getSortedNotes(activeNotesCustomer).length }})
            </span>
          </div>

          <!-- Notes History Timeline -->
          <div v-if="getSortedNotes(activeNotesCustomer).length" class="notes-history-list">
            <div
              v-for="note in getSortedNotes(activeNotesCustomer)"
              :key="note.id || note.createdAt"
              class="note-history-entry pa-3 mb-3 rounded"
            >
              <div class="d-flex justify-space-between align-center mb-1 flex-wrap ga-2">
                <span class="text-caption font-weight-bold text-primary d-flex align-center">
                  <v-icon size="14" class="me-1" color="primary">mdi-clock-check-outline</v-icon>
                  {{ formatNoteTimestamp(note.createdAt) }}
                </span>
                <span v-if="note.authorName" class="text-caption text-medium-emphasis">
                  Added by {{ note.authorName }}
                </span>
              </div>
              <div class="text-body-2 note-entry-body">{{ note.text }}</div>
            </div>
          </div>

          <div v-else class="text-center py-6 text-medium-emphasis">
            <v-icon size="40" class="mb-2 opacity-60">mdi-notebook-outline</v-icon>
            <p class="text-body-2 mb-0">No notes recorded for this customer yet. Add the first entry above.</p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="grey-lighten-1" variant="text" @click="closeNotesDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit/Add Customer Dialog -->
    <v-dialog v-model="dialog" max-width="640px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary">
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-container>
            <v-form @submit.prevent="save">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.name" label="Full Name" variant="solo" required hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.email" label="Email Address" variant="solo" required type="email" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.phone" label="Phone Number" variant="solo" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.address1" label="Address Line 1" variant="solo" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.address2" label="Address Line 2 (Optional)" variant="solo" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="editedItem.city" label="City" variant="solo" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="editedItem.state" label="State" variant="solo" hide-details="auto"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                  <v-text-field v-model="editedItem.zip" label="Zip Code" variant="solo" hide-details="auto"></v-text-field>
                </v-col>

                <!-- Append-Only Note Entry Section inside Add/Edit Dialog -->
                <v-col cols="12" class="mt-2">
                  <v-divider class="border-opacity-15 mb-4"></v-divider>
                  <div class="d-flex justify-space-between align-center mb-2 flex-wrap ga-2">
                    <span class="text-subtitle-2 font-weight-bold d-flex align-center">
                      <v-icon size="18" class="me-1" color="primary">mdi-notebook-plus-outline</v-icon>
                      {{ editedIndex === -1 ? 'Initial Customer Note (Optional)' : 'Append New Customer Note (Optional)' }}
                    </span>
                    <span class="text-caption text-medium-emphasis">
                      <v-icon size="12" class="me-1">mdi-shield-lock-outline</v-icon>
                      Append-only log
                    </span>
                  </div>
                  <v-textarea
                    v-model="formNewNote"
                    :label="editedIndex === -1 ? 'Add an initial timestamped note...' : 'Write a new timestamped note to append on save...'"
                    variant="solo"
                    rows="2"
                    auto-grow
                    hide-details="auto"
                  ></v-textarea>

                  <!-- Existing Notes Read-Only Log when editing a customer -->
                  <div v-if="editedIndex > -1 && getSortedNotes(editedItem).length" class="mt-4">
                    <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-2">
                      Existing Notes History ({{ getSortedNotes(editedItem).length }})
                    </div>
                    <div class="notes-history-list compact-history">
                      <div
                        v-for="note in getSortedNotes(editedItem)"
                        :key="note.id || note.createdAt"
                        class="note-history-entry pa-2 mb-2 rounded"
                      >
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="text-caption font-weight-bold text-primary">
                            {{ formatNoteTimestamp(note.createdAt) }}
                          </span>
                          <span v-if="note.authorName" class="text-caption text-medium-emphasis">
                            {{ note.authorName }}
                          </span>
                        </div>
                        <div class="text-body-2 note-entry-body">{{ note.text }}</div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingCustomer" @click="save">Save Customer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleting" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5 text-center pt-6">Are you sure?</v-card-title>
        <v-card-text class="text-center">
          This action will permanently delete the customer. Do you want to proceed?
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
          <v-btn color="red-darken-1" variant="flat" @click="deleteItemConfirm">Delete</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
.customers-view {
  min-height: 100vh;
  background-color: #111d2f;
  color: #f1f5f9;
}

:deep(.v-card) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  color: #f1f5f9 !important;
}

.notes-dialog-card,
:deep(.v-dialog .v-card) {
  background: #16243a !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}

:deep(.v-data-table) {
  background: transparent !important;
  color: #f1f5f9 !important;
}

:deep(.v-data-table-header__content) {
  color: #94a3b8 !important;
  font-weight: 600 !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
}

.latest-note-snippet {
  max-width: 240px;
  display: inline-block;
}

.mobile-note-preview {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: background 0.2s ease;
}

.mobile-note-preview:hover {
  background: rgba(255, 255, 255, 0.07);
}

.note-preview-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #e2e8f0;
}

.notes-history-list {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.notes-history-list.compact-history {
  max-height: 180px;
}

.note-history-entry {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.note-entry-body {
  white-space: pre-wrap;
  word-break: break-word;
  color: #f1f5f9;
}

:deep(.text-h4), :deep(.text-h5), :deep(.text-h6), :deep(.v-card-title) { color: #fff !important; }
:deep(.text-subtitle-1), :deep(.text-body-1), :deep(.v-card-text) { color: #e2e8f0 !important; }
:deep(.text-medium-emphasis) { color: #94a3b8 !important; }
:deep(.v-icon) { color: #94a3b8 !important; }
:deep(a.text-decoration-none) { color: #64B5F6 !important; }

@media (max-width: 959px) {
  .customers-view {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
  }
}
</style>
