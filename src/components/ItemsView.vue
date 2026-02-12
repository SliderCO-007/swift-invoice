<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useItems } from '../composables/useItems';

const { items, loading, error, fetchItems, addItem, updateItem, deleteItem, stopFetching } = useItems();

const dialog = ref(false);
const isEditing = ref(false);
const editedItem = ref({
  id: null,
  description: '',
  price: null,
});

const headers = [
  { title: 'Description', value: 'description', sortable: true },
  { title: 'Price', value: 'price', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false },
];

const openNewItemDialog = () => {
  isEditing.value = false;
  editedItem.value = { id: null, description: '', price: 0 };
  dialog.value = true;
};

const openEditItemDialog = (item) => {
  isEditing.value = true;
  editedItem.value = { ...item };
  dialog.value = true;
};

const confirmDeleteItem = (item) => {
  if (confirm(`Are you sure you want to delete "${item.description}"?`)) {
    deleteItem(item.id);
  }
};

const saveItem = async () => {
  if (isEditing.value) {
    await updateItem(editedItem.value.id, { 
      description: editedItem.value.description, 
      price: Number(editedItem.value.price) 
    });
  } else {
    await addItem({ 
      description: editedItem.value.description, 
      price: Number(editedItem.value.price) 
    });
  }
  dialog.value = false;
};

const formattedPrice = (price) => {
    if (typeof price !== 'number') {
        return '-';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

onMounted(() => {
  fetchItems();
});

onUnmounted(() => {
  stopFetching();
});
</script>

<template>
  <div class="items-view-container">
    <v-container fluid>
      <v-card class="items-card">
        <v-card-title class="items-card-title">
          <h1 class="headline">Manage Items</h1>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="openNewItemDialog">
            <v-icon left>mdi-plus</v-icon>
            Add New Item
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div v-if="loading" class="loading-container"> 
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          <div v-if="error" class="error-message">
             <v-alert type="error" dense outlined>{{ error.message }}</v-alert>
          </div>

          <v-data-table
            v-if="!loading && items.length > 0"
            :headers="headers"
            :items="items"
            class="elevation-1 items-table"
            item-key="id"
          >
            <template v-slot:item.price="{ item }">
                {{ formattedPrice(item.price) }}
            </template>
            <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2 action-icon" @click="openEditItemDialog(item)">mdi-pencil</v-icon>
                <v-icon small class="action-icon" @click="confirmDeleteItem(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>
          <div v-else-if="!loading" class="no-items-message">
              <p>No items found. Get started by adding a new item!</p>
          </div>
        </v-card-text>
      </v-card>

      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ isEditing ? 'Edit Item' : 'New Item' }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-text-field
                v-model="editedItem.description"
                label="Description"
                required
                variant="outlined"
                density="comfortable"
              ></v-text-field>
              <v-text-field
                v-model.number="editedItem.price"
                label="Price"
                required
                type="number"
                prefix="$"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" :disabled="!editedItem.description || editedItem.price === null" @click="saveItem">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.items-view-container {
  padding: 2rem;
  background-color: #f9fafb;
}
.items-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.items-card-title {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
}
.headline {
  font-weight: 700;
  color: #333;
}
.loading-container, .no-items-message, .error-message {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    text-align: center;
    color: #666;
}
.items-table .v-icon {
  color: #757575;
  transition: color 0.2s ease;
}
.items-table .v-icon:hover {
  color: var(--v-primary-base, #1976D2);
}
.action-icon {
    cursor: pointer;
}
</style>
