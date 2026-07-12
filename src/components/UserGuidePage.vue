<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const router = useRouter();
const { mobile } = useDisplay();
const searchQuery = ref('');

const sections = [
  {
    id: 'invoices',
    title: 'How to Create an Invoice',
    icon: 'mdi-file-document-edit-outline',
    color: '#4A90E2', // Blue accent
    steps: [
      {
        title: 'Start a New Invoice',
        desc: 'Log in and navigate to the **Dashboard**. Click the floating **`+` (Plus)** button in the bottom-right corner, or click **"Create Your First Invoice"** if you are new to the platform.'
      },
      {
        title: 'Select or Enter Client Information',
        desc: 'In the **Client Details** section, type a customer name. If the client is already saved in your directory, select them from the dropdown list to auto-fill their email, phone, and address. If they are new, fill in their details manually; they will save to your directory when you save the invoice.'
      },
      {
        title: 'Add Line Items',
        desc: 'In the **Invoice Items** list, click **"Add Item"**. Type or select a product/service from your catalog and specify the **Quantity** and **Price**. Use the **Tax** checkbox next to each item price to choose whether that specific item is taxable (useful for separating service labor from physical products).'
      },
      {
        title: 'Apply Discounts and Tax',
        desc: 'Enter a discount amount in the **Discount** field, and choose whether it is a flat rate or percentage. Set the **Tax Rate** percentage to apply to taxable items. Select an **Issue Date** and a **Due Date** (defaults to 30 days from issue).'
      },
      {
        title: 'Choose a Design Template',
        desc: 'Scroll to the **Template Selection** section and choose from one of the 6 premium styles (e.g. Classic, Tech Grid, Creative Sidebar) and pick your brand accent color. Non-taxable items will display a subtle **(No Tax)** indicator on the generated invoice.'
      },
      {
        title: 'Save or Preview',
        desc: 'Click **"Preview"** to see how the invoice looks. Click **"Save Invoice"** to finalize the record. (Free plan allows up to 5 finalized invoices).'
      }
    ]
  },
  {
    id: 'settings',
    title: 'How to Update Your Business Information',
    icon: 'mdi-cog-outline',
    color: '#9C27B0', // Purple accent
    steps: [
      {
        title: 'Access Settings',
        desc: 'Click the **User Menu** (top-right avatar) and select **Settings** or navigate to **Onboarding** directly.'
      },
      {
        title: 'Onboarding Wizard',
        desc: 'New users are automatically routed to a single-step **Onboarding Wizard** (`/onboarding`) upon registration to set up their initial company profile.'
      },
      {
        title: 'Step 1: Company Profile Details',
        desc: 'Fill in your official trading **Company Name**, **Contact Details** (email, phone), and physical **Address** (Street, City, State, Zip). Select your default transaction **Currency** (e.g. USD, EUR, GBP).'
      },
      {
        title: 'Upload Brand Logo',
        desc: 'Click on the logo section under Company Info, select an image file from your device, and upload it to display on your outgoing invoices.'
      },
      {
        title: 'Choose Accent Color',
        desc: 'Use the primary color picker to select your brand\'s signature color. This color dynamically themes button accents and tables on your selected templates.'
      },
      {
        title: 'Save Changes',
        desc: 'Click **"Save Settings"** or **"Save & Continue"** to apply changes across the system.'
      }
    ]
  },
  {
    id: 'customers-items',
    title: 'How to Create Customers, Products, and Expense Categories',
    icon: 'mdi-account-group-outline',
    color: '#50E3C2', // Teal accent
    steps: [
      {
        title: 'Manage Customers',
        desc: 'Navigate to the **Customers** page from the navigation menu. Click **"New Customer"** in the top bar to add client names, emails, phones, and addresses. Click **"Save"**. You can search, edit, or delete customers from this table at any time.'
      },
      {
        title: 'Manage Products / Services',
        desc: 'Navigate to the **Items** page from the navigation menu and click the **Invoice Items** tab. Click **"Add Item"** in the top bar. Provide an **Item Name**, **Default Price**, and check whether the item is **Taxable** by default. Click **"Save"**. These products will now instantly autocomplete when building new invoices.'
      },
      {
        title: 'Manage Expense Categories (Owners Only)',
        desc: 'Navigate to the **Items** page and select the **Expense Categories** tab. Click **"Add Category"** to create custom categories (e.g., "Materials", "Travel"). You can edit or delete them; deleting a category will not affect historical expense logs. Team members cannot create categories.'
      }
    ]
  },
  {
    id: 'exporting',
    title: 'How to Export Invoice Data',
    icon: 'mdi-download',
    color: '#FF9800', // Orange accent
    steps: [
      {
        title: 'Export the Invoices List (CSV Spreadsheet)',
        desc: 'Go to your **Dashboard**. Make sure you are on the **Invoices** tab. Click the **"Export CSV"** button located at the top-right of your invoices table. A `.csv` file containing details (Invoice #, Client, Issue Date, Due Date, Total, and Status) for all invoices will be downloaded to your device.'
      },
      {
        title: 'Export a Specific Invoice (PDF)',
        desc: 'In your Dashboard invoice list, click the **"View" (eye icon)** next to the invoice you want to download. On the invoice preview page, click **"Download PDF"** in the top bar. A clean, styled PDF copy of the invoice will be compiled and downloaded.'
      }
    ]
  },
  {
    id: 'reports',
    title: 'How to View and Generate Reports',
    icon: 'mdi-file-chart-outline',
    color: '#4CAF50', // Green accent
    steps: [
      {
        title: 'Access the Reports Page',
        desc: 'Click on the **Reports** option in the top navigation bar.'
      },
      {
        title: 'Apply Month and Year Filters',
        desc: 'Use the dropdown selectors at the top to filter data for a specific **Month** and **Year**.'
      },
      {
        title: 'Review Sales Metrics',
        desc: 'Analyze core indicators: **Total Sales** (excludes drafts), **Tax Collected** (tax collected from taxable items), **Average Value** (average invoice size), **Total Invoices** (count of invoices), and **Paid vs. Pending** status breakdowns.'
      },
      {
        title: 'Analyze the Daily Sales Trend',
        desc: 'Check the **Daily Sales Trend** bar graph to visualize day-by-day sales peaks.'
      },
      {
        title: 'Export the Sales Report',
        desc: 'Click **"Export CSV"** to download a spreadsheet table of that specific month\'s invoice breakdown. Click **"Download PDF"** to generate and download a clean, print-friendly portrait PDF report.'
      },
      {
        title: 'Team Hours Report (Owners Only)',
        desc: 'Switch to the **Team Hours Report** tab. Filter logged entries by **Date Range** and **Team Member** to review **Total Hours**, **Billable/Non-Billable Splits**, and **Estimated Labor Costs**. Export as CSV for payroll or download a print-friendly PDF.'
      }
    ]
  },
  {
    id: 'stripe-connect',
    title: 'How to Set Up Stripe Connect & Accept Payments',
    icon: 'mdi-credit-card-outline',
    color: '#6772E5', // Stripe purple
    steps: [
      {
        title: 'Connect Stripe Account',
        desc: 'Click the **"Connect with Stripe"** banner on your Dashboard or under Settings. You will be securely redirected to Stripe to create or link your merchant account.'
      },
      {
        title: 'Profile Auto-Sync',
        desc: 'Upon completing Stripe registration and returning to the app, your company name, email, address, state, city, and zip code are automatically synced to your settings profile to save time.'
      },
      {
        title: 'Stripe Scan-to-Pay QR Code',
        desc: 'Once your Stripe account is verified, a custom "Scan to Pay" QR code is dynamically rendered on all invoice templates (Classic, Tech Grid, Creative Sidebar) so your clients can scan and pay on the spot.'
      },
      {
        title: 'Online Payment Options',
        desc: 'Clients opening invoice links can pay securely using credit cards, Apple Pay, Google Pay, or direct ACH bank transfers.'
      }
    ]
  },
  {
    id: 'project-tracking',
    title: 'How to Use Project & Time/Expense Tracking',
    icon: 'mdi-folder-clock-outline',
    color: '#00BFA6', // Bright teal
    steps: [
      {
        title: 'Create a New Project',
        desc: 'Navigate to the **Projects** page (fully unlocked for all users) and click **"New Project"**. Specify customer name, description, and **Default Hourly Rate**.'
      },
      {
        title: 'Log Hours (Time Entries)',
        desc: 'Inside a project details page, click **"Log Hours"** to enter date, activity description, and duration. Check **"Billable"** to flag the time for invoicing.'
      },
      {
        title: 'Log Expenses & Receipts',
        desc: 'Click **"Add Expense"**, select an **Expense Category**, enter the amount, and optionally upload a **Receipt Photo** which will save securely.'
      },
      {
        title: 'Cascading Deletion (Owners Only)',
        desc: 'To delete a project, click Edit Project and select Delete. Confirm deletion by typing the project name exactly inside the safety modal to permanently remove the project and all its logged time/expense entries.'
      },
      {
        title: 'Convert Project to Invoice',
        desc: 'Click **"Convert to Invoice"** inside the project. By default, it maps each entry to a separate line item (e.g. Labor: 5 hours @ $80/hr, Materials: Copper Pipes) with automated tax application. Check the **"Combine entries..."** switch if you prefer to consolidate all items into single "Labor" and "Expenses" line items. Click **"Convert"** to generate the draft.'
      }
    ]
  },
  {
    id: 'team-collaboration',
    title: 'How to Manage Team Seats & Collaboration',
    icon: 'mdi-account-multiple-plus-outline',
    color: '#E65100', // Deep orange
    steps: [
      {
        title: 'Invite Team Members',
        desc: 'Organization Owners can navigate to **Team Settings** under the User Menu and invite members via email address.'
      },
      {
        title: 'Manage Invitations',
        desc: 'View active and pending team members in Team Settings. Owners can cancel/revoke any sent pending invitations instantly with the "Cancel Invite" action.'
      },
      {
        title: 'Member Role Restrictions',
        desc: 'Invited team members register as **Members** who inherit your organization ID but are locked out of sensitive billing details. They only see the **Projects** and **Guide** pages, cannot access invoices, settings, reports, or Stripe connections, and cannot see or adjust hourly rates, billing totals, or create custom expense categories.'
      },
      {
        title: 'Owner Role Permissions',
        desc: 'The organization creator holds the **Owner** role, granting full administrative access to invoices, client billing, Stripe configurations, reports, team invitations, rates modifications, and project deletions.'
      }
    ]
  }
];

// Computed property to filter sections based on search query
const filteredSections = computed(() => {
  if (!searchQuery.value) return sections;
  const query = searchQuery.value.toLowerCase();
  
  return sections.filter(sec => {
    const titleMatch = sec.title.toLowerCase().includes(query);
    const stepsMatch = sec.steps.some(step => 
      step.title.toLowerCase().includes(query) || 
      step.desc.toLowerCase().includes(query)
    );
    return titleMatch || stepsMatch;
  });
});

// Auto-expand panels matching search query
const activePanels = ref(sections.map(s => s.id));

// Watch search query to auto-expand matching panels
watch(searchQuery, (newQuery) => {
  if (!newQuery) {
    activePanels.value = sections.map(s => s.id);
    return;
  }
  const query = newQuery.toLowerCase();
  activePanels.value = sections
    .filter(sec => 
      sec.title.toLowerCase().includes(query) || 
      sec.steps.some(step => 
        step.title.toLowerCase().includes(query) || 
        step.desc.toLowerCase().includes(query)
      )
    )
    .map(s => s.id);
});

const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
};

const navigateHome = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="guide-page-container">
    <div class="guide-wrapper">
      <header class="guide-header mb-6">
        <div class="d-flex align-center mb-2">
          <v-btn icon="mdi-arrow-left" variant="text" color="primary" class="mr-2" @click="navigateHome"></v-btn>
          <span class="text-subtitle-1 text-primary font-weight-bold uppercase">Help Center</span>
        </div>
        <h1 class="page-title">User Guide & Documentation</h1>
        <p class="subtitle-text">Find step-by-step guides on how to make the most of ScanGo Invoice.</p>
      </header>

      <!-- Search Section -->
      <v-card class="search-card mb-6" flat>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search topics (e.g. Stripe, CSV, tax...)"
            variant="outlined"
            hide-details
            clearable
            class="custom-search"
          ></v-text-field>
        </v-card-text>
      </v-card>

      <!-- If no results match search query -->
      <div v-if="!filteredSections.length" class="no-results-card pa-12 text-center">
        <v-icon size="80" color="rgba(255, 255, 255, 0.1)" class="mb-4">mdi-help-circle-outline</v-icon>
        <h3 class="text-h5 font-weight-medium">No Guides Found</h3>
        <p class="text-subtitle-1 mt-2 text-medium-emphasis">
          We couldn't find any guides matching "{{ searchQuery }}". Try searching for other keywords like "CSV" or "Settings".
        </p>
      </div>

      <!-- Expansion Panels -->
      <v-expansion-panels v-else v-model="activePanels" multiple class="custom-panels">
        <v-expansion-panel
          v-for="(section, idx) in filteredSections"
          :key="section.id"
          :value="section.id"
          class="guide-panel mb-4"
        >
          <v-expansion-panel-title class="panel-title py-4">
            <template v-slot:default="{ expanded }">
              <div class="d-flex align-center">
                <v-avatar :color="section.color + '1D'" size="40" class="mr-4">
                  <v-icon :color="section.color" size="22">{{ section.icon }}</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-bold" :style="{ color: expanded ? '#fff' : '#e2e8f0' }">
                    {{ section.title }}
                  </h3>
                </div>
              </div>
            </template>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text class="panel-text pt-2 pb-4">
            <div class="steps-timeline">
              <div v-for="(step, sIdx) in section.steps" :key="sIdx" class="step-item d-flex mb-6">
                <div class="step-badge mr-4">
                  <span class="step-number" :style="{ backgroundColor: section.color }">{{ sIdx + 1 }}</span>
                </div>
                <div class="step-content">
                  <h4 class="step-title text-subtitle-1 font-weight-bold mb-1">{{ step.title }}</h4>
                  <p class="step-desc text-body-2 text-medium-emphasis" v-html="renderMarkdown(step.desc)"></p>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<style scoped>
.guide-page-container {
  padding: 1.5rem;
  background-color: #111d2f;
  min-height: 100vh;
  color: #f1f5f9;
}

.guide-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.guide-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1.5rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.subtitle-text {
  font-size: 1.05rem;
  color: #94a3b8;
}

.uppercase {
  text-transform: uppercase;
}

/* Glassmorphic Search Card */
.search-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  color: #f1f5f9 !important;
}

.custom-search {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.no-results-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(16px);
  color: #f1f5f9;
}

/* Custom Expansion Panels */
.custom-panels {
  background: transparent !important;
}

.guide-panel {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  color: #f1f5f9 !important;
  overflow: hidden;
  transition: border-color 0.3s ease;
}

.guide-panel:hover {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.panel-title {
  background: transparent !important;
  color: #f1f5f9 !important;
}

.panel-text {
  background: rgba(0, 0, 0, 0.15) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Step Timeline styles */
.steps-timeline {
  display: flex;
  flex-direction: column;
}

.step-item {
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 32px;
  left: 15px;
  width: 2px;
  height: calc(100% - 10px);
  background: rgba(255, 255, 255, 0.08);
}

.step-badge {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
}

.step-content {
  flex-grow: 1;
}

.step-title {
  color: #fff;
}

.step-desc {
  color: #94a3b8;
  line-height: 1.5;
}

.step-desc :deep(strong) {
  color: #fff;
  font-weight: 600;
}

@media (max-width: 600px) {
  .guide-page-container {
    padding: 0.75rem;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }
  .step-item:not(:last-child)::after {
    top: 28px;
    left: 13px;
  }
}
</style>
