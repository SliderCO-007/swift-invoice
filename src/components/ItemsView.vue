<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useDisplay } from 'vuetify';
import { useItems } from '../composables/useItems';
import useUserSettings from '../composables/useUserSettings';
import { exportToCSV } from '../utils/exportCsv';

const { mobile } = useDisplay();
const { settings } = useUserSettings();
const { items, loading, error, fetchItems, addItem, updateItem, deleteItem, stopFetching } = useItems();

const dialog = ref(false);
const deleting = ref(false);
const isEditing = ref(false);
const itemToDelete = ref(null);
const activeTab = ref('items'); // 'items' | 'categories'

const defaultItem = {
  id: null,
  description: '',
  price: null,
  name: '',
  type: undefined,
};
const editedItem = ref({ ...defaultItem });

const standardItems = computed(() => items.value.filter(i => i.type !== 'expense-category'));
const expenseCategories = computed(() => items.value.filter(i => i.type === 'expense-category'));

const formTitle = computed(() => {
  if (editedItem.value.type === 'expense-category') {
    return isEditing.value ? 'Edit Expense Category' : 'New Expense Category';
  }
  return isEditing.value ? 'Edit Item' : 'New Item';
});

const headers = [
  { title: 'Description', key: 'description' },
  { title: 'Price', key: 'price' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const categoryHeaders = [
  { title: 'Category Name', key: 'name' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const formattedPrice = (price) => {
  if (typeof price !== 'number') {
    return '-';
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.value?.currency || 'USD' }).format(price);
};

const openNewItemDialog = () => {
  isEditing.value = false;
  if (activeTab.value === 'categories') {
    editedItem.value = { ...defaultItem, type: 'expense-category' };
  } else {
    editedItem.value = { ...defaultItem, type: undefined };
  }
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
  if (editedItem.value.type === 'expense-category') {
    if (!editedItem.value.name?.trim()) return;
    const dataToSave = {
      name: editedItem.value.name.trim(),
      type: 'expense-category',
    };
    if (isEditing.value) {
      await updateItem(editedItem.value.id, dataToSave);
    } else {
      await addItem(dataToSave);
    }
  } else {
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
  }
  dialog.value = false;
};

onMounted(() => {
  fetchItems();
});

onUnmounted(() => {
  stopFetching();
});

const exportItemsOutput = () => {
  if (activeTab.value === 'categories') {
    const data = expenseCategories.value.map(c => ({
      'Category Name': c.name
    }));
    exportToCSV('expense_categories_export.csv', data);
  } else {
    const data = standardItems.value.map(i => ({
      Description: i.description,
      Price: i.price
    }));
    exportToCSV('items_export.csv', data);
  }
};
</script>

<template>
  <div class="items-view pa-4 pa-md-6">
    <header class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <h1 class="text-h5 text-sm-h4 font-weight-bold mb-0">
        {{ activeTab === 'categories' ? 'Manage Expense Categories' : 'Manage Your Items' }}
      </h1>
      <div class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column">
        <v-btn 
          color="primary" 
          @click="openNewItemDialog" 
          :size="mobile ? 'default' : 'large'" 
          class="elevation-2 w-100 w-sm-auto"
        >
          <v-icon start>mdi-plus</v-icon>
          {{ activeTab === 'categories' ? 'Add Category' : 'Add Item' }}
        </v-btn>
        <v-btn 
          color="primary" 
          variant="outlined" 
          @click="exportItemsOutput" 
          :size="mobile ? 'default' : 'large'" 
          class="elevation-2 bg-transparent w-100 w-sm-auto" 
          :disabled="(activeTab === 'categories' ? !expenseCategories.length : !standardItems.length) || loading"
        >
          <v-icon start>mdi-download</v-icon>
          Export CSV
        </v-btn>
      </div>
    </header>

    <p class="text-subtitle-1 mb-6">
      {{ activeTab === 'categories'
        ? 'Create and manage reusable categories to log project expenses even faster.'
        : 'Create and manage reusable items to build invoices even faster.'
      }}
    </p>

    <!-- Tabs -->
    <div class="tabs-row mb-6">
      <button :class="['tab-btn', { active: activeTab === 'items' }]" @click="activeTab = 'items'">
        <v-icon icon="mdi-list-box-outline" size="16" class="mr-1" />Invoice Items
      </button>
      <button :class="['tab-btn', { active: activeTab === 'categories' }]" @click="activeTab = 'categories'">
        <v-icon icon="mdi-tag-outline" size="16" class="mr-1" />Expense Categories
      </button>
    </div>

    <!-- Desktop View: Data Table -->
    <v-card class="elevation-2" v-if="!mobile">
      <v-data-table
        :headers="activeTab === 'categories' ? categoryHeaders : headers"
        :items="activeTab === 'categories' ? expenseCategories : standardItems"
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
            <span>{{ activeTab === 'categories' ? 'Edit Category' : 'Edit Item' }}</span>
          </v-tooltip>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="confirmDelete(item)" color="grey-darken-1">mdi-delete</v-icon>
            </template>
            <span>{{ activeTab === 'categories' ? 'Delete Category' : 'Delete Item' }}</span>
          </v-tooltip>
        </template>
        <template v-slot:no-data>
          <div class="d-flex flex-column align-center justify-center pa-10 text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              {{ activeTab === 'categories' ? 'mdi-tag-outline' : 'mdi-list-box-outline' }}
            </v-icon>
            <h3 class="text-h6 mb-2">
              {{ activeTab === 'categories' ? 'No Categories Yet' : 'No Items Yet' }}
            </h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              {{ activeTab === 'categories'
                ? 'Click the button below to add your first expense category.'
                : 'Click the button below to add your first item.'
              }}
            </p>
            <v-btn color="primary" @click="openNewItemDialog">
              {{ activeTab === 'categories' ? 'Add First Category' : 'Add First Item' }}
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Mobile View: Card List -->
    <div v-else>
        <v-card v-for="item in (activeTab === 'categories' ? expenseCategories : standardItems)" :key="item.id" class="mb-4 elevation-2">
            <v-card-text>
                <div class="d-flex justify-space-between align-center">
                    <span class="text-h6 font-weight-bold">
                      {{ activeTab === 'categories' ? item.name : item.description }}
                    </span>
                    <div>
                        <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" class="me-2" @click="openEditItemDialog(item)" color="grey-darken-1">mdi-pencil</v-icon>
                            </template>
                            <span>{{ activeTab === 'categories' ? 'Edit Category' : 'Edit Item' }}</span>
                        </v-tooltip>
                        <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" @click="confirmDelete(item)" color="grey-darken-1">mdi-delete</v-icon>
                            </template>
                            <span>{{ activeTab === 'categories' ? 'Delete Category' : 'Delete Item' }}</span>
                        </v-tooltip>
                    </div>
                </div>
                <div v-if="activeTab !== 'categories'" class="d-flex align-center mt-2">
                    <v-icon color="grey-darken-1" class="me-3">mdi-currency-usd</v-icon>
                    <span class="text-body-1 font-weight-medium">{{ formattedPrice(item.price) }}</span>
                </div>
            </v-card-text>
        </v-card>
        <div v-if="!(activeTab === 'categories' ? expenseCategories.length : standardItems.length) && !loading" class="text-center pa-10">
             <v-icon size="64" color="grey-lighten-1" class="mb-4">
               {{ activeTab === 'categories' ? 'mdi-tag-outline' : 'mdi-list-box-outline' }}
             </v-icon>
             <h3 class="text-h6 mb-2">
               {{ activeTab === 'categories' ? 'No Categories Yet' : 'No Items Yet' }}
             </h3>
             <p class="text-body-1 text-medium-emphasis mb-4">
               {{ activeTab === 'categories'
                 ? 'Click the button below to add your first expense category.'
                 : 'Click the button below to add your first item.'
               }}
             </p>
             <v-btn color="primary" @click="openNewItemDialog">
               {{ activeTab === 'categories' ? 'Add First Category' : 'Add First Item' }}
             </v-btn>
        </div>
    </div>

    <!-- Edit/Add Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card style="background:#1e2d42; color:#f1f5f9;">
        <v-card-title class="pa-4 bg-primary d-flex align-center">
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-container>
            <v-form @submit.prevent="saveItem">
              <template v-if="editedItem.type === 'expense-category'">
                <v-text-field
                  v-model="editedItem.name"
                  label="Category Name"
                  variant="solo"
                  required
                  hide-details
                  class="mb-3"
                ></v-text-field>
              </template>
              <template v-else>
                <v-text-field
                  v-model="editedItem.description"
                  label="Description"
                  variant="solo"
                  required
                  hide-details
                  class="mb-3"
                ></v-text-field>
                <v-text-field
                  v-model.number="editedItem.price"
                  label="Price"
                  type="number"
                  prefix="$"
                  variant="solo"
                  required
                  hide-details
                  class="mb-3"
                ></v-text-field>
              </template>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="white" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveItem">
            {{ editedItem.type === 'expense-category' ? 'Save Category' : 'Save Item' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleting" max-width="500px" persistent>
        <v-card style="background:#1e2d42; color:#f1f5f9;">
            <v-card-title class="text-h5 text-center pt-6">Are you sure?</v-card-title>
            <v-card-text class="text-center">
                This action will permanently delete the {{ itemToDelete?.type === 'expense-category' ? 'expense category' : 'item' }}
                <strong>{{ itemToDelete?.type === 'expense-category' ? itemToDelete?.name : itemToDelete?.description }}</strong>.
                Do you want to proceed?
            </v-card-text>
            <v-card-actions class="pb-4">
                <v-spacer></v-spacer>
                <v-btn color="white" variant="text" @click="closeDelete">Cancel</v-btn>
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

/* Tabs */
.tabs-row {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding-bottom: 0;
}
.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #94a3b8;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
  margin-bottom: -1px;
}
.tab-btn:hover {
  color: #e2e8f0;
}
.tab-btn.active {
  color: #93c5fd;
  border-bottom-color: #3b82f6;
}
</style>
