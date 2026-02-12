<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCustomers } from '../composables/useCustomers';

const { customers, loading, addCustomer, updateCustomer, deleteCustomer, fetchCustomers, stopFetching } = useCustomers();

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

onMounted(() => {
  fetchCustomers();
});

onUnmounted(() => {
    stopFetching();
});

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
    // Update existing customer
    await updateCustomer(editedItem.value.id, dataToSave);
  } else {
    // Add new customer
    await addCustomer(dataToSave);
  }
  close();
}
</script>

<template>
  <div class="customers-view pa-4 pa-md-6">
    <header class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4 font-weight-bold">Manage Your Customers</h1>
      <v-btn color="primary" @click="openDialog" size="large" class="elevation-2">
        <v-icon start>mdi-plus</v-icon>
        Add Customer
      </v-btn>
    </header>

     <p class="text-subtitle-1 mb-6">Keep all your client information organized in one place for faster invoicing.</p>

    <v-card class="elevation-2">
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
      </v-data-table>
    </v-card>

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
                  <v-text-field v-model="editedItem.name" label="Full Name" variant="outlined" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.email" label="Email Address" variant="outlined" required type="email"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.phone" label="Phone Number" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="editedItem.address1" label="Address Line 1" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="editedItem.address2" label="Address Line 2 (Optional)" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.city" label="City" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.state" label="State" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12" sm="12" md="4">
                    <v-text-field v-model="editedItem.zip" label="Zip Code" variant="outlined"></v-text-field>
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