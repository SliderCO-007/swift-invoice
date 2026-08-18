import { ref } from 'vue';

const isMoreDrawerOpen = ref(false);
const isQuickActionsOpen = ref(false);
const isFormDirty = ref(false);
const showUnsavedChangesDialog = ref(false);
let pendingNavigationCallback = null;

export function useMobileNav() {
  const openMoreDrawer = () => {
    isMoreDrawerOpen.value = true;
  };

  const closeMoreDrawer = () => {
    isMoreDrawerOpen.value = false;
  };

  const toggleMoreDrawer = () => {
    isMoreDrawerOpen.value = !isMoreDrawerOpen.value;
  };

  const openQuickActions = () => {
    isQuickActionsOpen.value = true;
  };

  const closeQuickActions = () => {
    isQuickActionsOpen.value = false;
  };

  const toggleQuickActions = () => {
    isQuickActionsOpen.value = !isQuickActionsOpen.value;
  };

  const setFormDirty = (val) => {
    isFormDirty.value = !!val;
  };

  const handleBackNavigation = (router, fallbackRoute = '/dashboard') => {
    if (isFormDirty.value) {
      pendingNavigationCallback = () => {
        isFormDirty.value = false;
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackRoute);
        }
      };
      showUnsavedChangesDialog.value = true;
    } else {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackRoute);
      }
    }
  };

  const confirmDiscardChanges = () => {
    showUnsavedChangesDialog.value = false;
    if (pendingNavigationCallback) {
      pendingNavigationCallback();
      pendingNavigationCallback = null;
    }
  };

  const cancelDiscardChanges = () => {
    showUnsavedChangesDialog.value = false;
    pendingNavigationCallback = null;
  };

  return {
    isMoreDrawerOpen,
    isQuickActionsOpen,
    isFormDirty,
    showUnsavedChangesDialog,
    openMoreDrawer,
    closeMoreDrawer,
    toggleMoreDrawer,
    openQuickActions,
    closeQuickActions,
    toggleQuickActions,
    setFormDirty,
    handleBackNavigation,
    confirmDiscardChanges,
    cancelDiscardChanges,
  };
}

export default useMobileNav;
