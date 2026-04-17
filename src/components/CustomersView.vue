<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useDisplay } from 'vuetify';
import { useCustomers } from '../composables/useCustomers';
import { exportToCSV } from '../utils/exportCsv';

const { mobile } = useDisplay();
// CORRECTED: fetchCustomers and stopFetching are no longer needed here as the composable is fully reactive.
const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();

const dialog = ref(false);
const deleting = ref(false);
const itemToDelete = ref(null);

const defaultItem = {
  id: null,
  name: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: ''
};
const editedItem = ref({ ...defaultItem });
const editedIndex = ref(-1);

const formTitle = computed(() => (editedIndex.value === -1 ? 'New Customer' : 'Edit Customer'));

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Address', key: 'address', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const getFormattedAddress = (item) => {
    const parts = [item.address1, item.address2, item.city, item.state, item.zip];
    return parts.filter(p => p).join(', ');
}

// REMOVED: onMounted and onUnmounted are no longer necessary.

function openDialog() {
  editedIndex.value = -1;
  editedItem.value = { ...defaultItem };
  dialog.value = true;
}

function editItem(item) {
  editedIndex.value = customers.value.findIndex(c => c.id === item.id);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
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
}

async function save() {
  const dataToSave = { ...editedItem.value };
  delete dataToSave.id;

  if (editedIndex.value > -1 && editedItem.value.id) {
    await updateCustomer(editedItem.value.id, dataToSave);
  } else {
    await addCustomer(dataToSave);
  }
  close();
}

const exportCustomersOutput = () => {
  const data = customers.value.map(c => ({
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    'Address Line 1': c.address1,
    'Address Line 2': c.address2,
    City: c.city,
    State: c.state,
    Zip: c.zip
  }));
  exportToCSV('customers_export.csv', data);
};
</script>

<template>
  <div class="customers-view pa-4 pa-md-6">
    <header class="d-flex justify-space-between align-center mb-4 flex-wrap">
      <h1 class="text-h4 font-weight-bold mb-2 mb-sm-0">Manage Your Customers</h1>
      <div class="d-flex align-center mt-3 mt-sm-0">
        <v-btn color="primary" variant="outlined" @click="exportCustomersOutput" size="large" class="elevation-2 me-3 bg-transparent" :disabled="!customers.length || loading">
          <v-icon start>mdi-download</v-icon>
          Export CSV
        </v-btn>
        <v-btn color="primary" @click="openDialog" size="large" class="elevation-2">
          <v-icon start>mdi-plus</v-icon>
          Add Customer
        </v-btn>
      </div>
    </header>

     <p class="text-subtitle-1 mb-6">Keep all your client information organized in one place for faster invoicing.</p>

    <!-- REMOVED: The search card has been deleted. -->

    <!-- Desktop View: Data Table -->
    <v-card class="elevation-2" v-if="!mobile">
      <!-- CORRECTED: The table now directly uses `customers` instead of `filteredCustomers`. -->
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
        <template v-slot:item.actions="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
                <v-icon v-bind="props" class="me-2" @click="editItem(item)" color="grey-darken-1">mdi-pencil</v-icon>
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
        <!-- REMOVED: The `no-results` slot has been removed as it was tied to the search. -->
      </v-data-table>
    </v-card>

    <!-- Mobile View: Card List -->
    <div v-else>
       <!-- CORRECTED: The v-for loop now iterates over `customers` directly. -->
      <v-card v-for="item in customers" :key="item.id" class="mb-4 elevation-2">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">{{ item.name }}</span>
          <div>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" class="me-2" @click="editItem(item)" color="grey-darken-1">mdi-pencil</v-icon>
              </template>
              <span>Edit Customer</span>
            </v-tooltip>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" @click="confirmDelete(item)" color="grey-darken-1">mdi-delete</v-icon>
              </template>
              <span>Delete Customer</span>
            </v-tooltip>
          </div>
        </v-card-title>
        <v-card-text>
          <div v-if="item.email" class="d-flex align-center mb-2">
            <v-icon color="grey-darken-1" class="me-3">mdi-email-outline</v-icon>
            <a :href="'mailto:' + item.email" class="text-decoration-none text-body-1">{{ item.email }}</a>
          </div>
          <div v-if="item.phone" class="d-flex align-center mb-2">
            <v-icon color="grey-darken-1" class="me-3">mdi-phone-outline</v-icon>
            <a :href="'tel:' + item.phone" class="text-decoration-none text-body-1">{{ item.phone }}</a>
          </div>
          <div v-if="getFormattedAddress(item)" class="d-flex align-start">
            <v-icon color="grey-darken-1" class="me-3 mt-1">mdi-map-marker-outline</v-icon>
            <span class="text-body-1">{{ getFormattedAddress(item) }}</span>
          </div>
        </v-card-text>
      </v-card>
      <!-- CORRECTED: Only show the empty state message when the main customers list is empty. -->
      <div v-if="!customers.length && !loading" class="text-center pa-10">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
        <h3 class="text-h6 mb-2">No Customers Yet</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">Click the button below to add your first client.</p>
        <v-btn color="primary" @click="openDialog">Add First Customer</v-btn>
      </div>
    </div>


    <!-- Edit/Add Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary">
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-container>
            <v-form @submit.prevent="save">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.name" label="Full Name" variant="solo" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.email" label="Email Address" variant="solo" required type="email"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.phone" label="Phone Number" variant="solo"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="editedItem.address1" label="Address Line 1" variant="solo"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="editedItem.address2" label="Address Line 2 (Optional)" variant="solo"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.city" label="City" variant="solo"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.state" label="State" variant="solo"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                    <v-text-field v-model="editedItem.zip" label="Zip Code" variant="solo"></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="save">Save Customer</v-btn>
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

:deep(.text-h4), :deep(.text-h5), :deep(.text-h6), :deep(.v-card-title) { color: #fff !important; }
:deep(.text-subtitle-1), :deep(.text-body-1), :deep(.v-card-text) { color: #e2e8f0 !important; }
:deep(.text-medium-emphasis) { color: #94a3b8 !important; }
:deep(.v-icon) { color: #94a3b8 !important; }
:deep(a.text-decoration-none) { color: #64B5F6 !important; }
</style>