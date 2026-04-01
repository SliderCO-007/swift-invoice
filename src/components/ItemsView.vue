<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useDisplay } from 'vuetify';
import { useItems } from '../composables/useItems';

const { mobile } = useDisplay();
const { items, loading, error, fetchItems, addItem, updateItem, deleteItem, stopFetching } = useItems();

const dialog = ref(false);
const deleting = ref(false);
const isEditing = ref(false);
const itemToDelete = ref(null);

const defaultItem = {
  id: null,
  description: '',
  price: null,
};
const editedItem = ref({ ...defaultItem });

const formTitle = computed(() => (isEditing.value ? 'Edit Item' : 'New Item'));

const headers = [
  { title: 'Description', key: 'description' },
  { title: 'Price', key: 'price' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const formattedPrice = (price) => {
  if (typeof price !== 'number') {
    return '-';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const openNewItemDialog = () => {
  isEditing.value = false;
  editedItem.value = { ...defaultItem };
  dialog.value = true;
};

const openEditItemDialog = (item) => {
  isEditing.value = true;
  editedItem.value = { ...item };
  dialog.value = true;
};

const confirmDelete = (item) => {
  itemToDelete.value = item;
  deleting.value = true;
};

const deleteItemConfirm = async () => {
  if (itemToDelete.value) {
    await deleteItem(itemToDelete.value.id);
  }
  closeDelete();
};

const closeDelete = () => {
  deleting.value = false;
  itemToDelete.value = null;
};

const saveItem = async () => {
  if (!editedItem.value.description || editedItem.value.price === null) {
      return;
  }
  const dataToSave = { 
      description: editedItem.value.description, 
      price: Number(editedItem.value.price) 
  };

  if (isEditing.value) {
    await updateItem(editedItem.value.id, dataToSave);
  } else {
    await addItem(dataToSave);
  }
  dialog.value = false;
};

onMounted(() => {
  fetchItems();
});

onUnmounted(() => {
  stopFetching();
});
</script>

<template>
  <div class="items-view pa-4 pa-md-6">
    <header class="d-flex justify-space-between align-center mb-4 flex-wrap">
      <h1 class="text-h4 font-weight-bold mb-2 mb-sm-0">Manage Your Items</h1>
      <v-btn color="primary" @click="openNewItemDialog" size="large" class="elevation-2">
        <v-icon start>mdi-plus</v-icon>
        Add Item
      </v-btn>
    </header>

    <p class="text-subtitle-1 mb-6">Create and manage reusable items to build invoices even faster.</p>

    <!-- Desktop View: Data Table -->
    <v-card class="elevation-2" v-if="!mobile">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        item-value="id"
        class="elevation-0"
        :items-per-page="10"
      >
        <template v-slot:item.price="{ item }">
          <span>{{ formattedPrice(item.price) }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" class="me-2" @click="openEditItemDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
            </template>
            <span>Edit Item</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="confirmDelete(item)" color="grey-darken-1">mdi-delete</v-icon>
            </template>
            <span>Delete Item</span>
          </v-tooltip>
        </template>
        <template v-slot:no-data>
          <div class="d-flex flex-column align-center justify-center pa-10 text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-list-box-outline</v-icon>
            <h3 class="text-h6 mb-2">No Items Yet</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">Click the button below to add your first item.</p>
            <v-btn color="primary" @click="openNewItemDialog">Add First Item</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Mobile View: Card List -->
    <div v-else>
        <v-card v-for="item in items" :key="item.id" class="mb-4 elevation-2">
            <v-card-text>
                <div class="d-flex justify-space-between align-center">
                    <span class="text-h6 font-weight-bold">{{ item.description }}</span>
                    <div>
                        <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" class="me-2" @click="openEditItemDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
                            </template>
                            <span>Edit Item</span>
                        </v-tooltip>
                        <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" @click="confirmDelete(item)" color="grey-darken-1">mdi-delete</v-icon>
                            </template>
                            <span>Delete Item</span>
                        </v-tooltip>
                    </div>
                </div>
                <div class="d-flex align-center mt-2">
                    <v-icon color="grey-darken-1" class="me-3">mdi-currency-usd</v-icon>
                    <span class="text-body-1 font-weight-medium">{{ formattedPrice(item.price) }}</span>
                </div>
            </v-card-text>
        </v-card>
        <div v-if="!items.length && !loading" class="text-center pa-10">
             <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-list-box-outline</v-icon>
            <h3 class="text-h6 mb-2">No Items Yet</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">Click the button below to add your first item.</p>
            <v-btn color="primary" @click="openNewItemDialog">Add First Item</v-btn>
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
            <v-form @submit.prevent="saveItem">
              <v-text-field
                v-model="editedItem.description"
                label="Description"
                variant="solo"
                required
              ></v-text-field>
              <v-text-field
                v-model.number="editedItem.price"
                label="Price"
                type="number"
                prefix="$"
                variant="solo"
                required
              ></v-text-field>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveItem">Save Item</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleting" max-width="500px" persistent>
        <v-card>
            <v-card-title class="text-h5 text-center pt-6">Are you sure?</v-card-title>
            <v-card-text class="text-center">
                This action will permanently delete the item. Do you want to proceed?
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
.items-view {
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
</style>
