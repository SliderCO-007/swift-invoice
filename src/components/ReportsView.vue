<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../composables/useFirebase';
import useInvoices from '../composables/useInvoices';
import useUserSettings from '../composables/useUserSettings';
import useProjects from '../composables/useProjects';
import { useOrganization } from '../composables/useOrganization';
import { userProfile } from '../composables/useAuth.js';
import { exportToCSV } from '../utils/exportCsv';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const router = useRouter();
const { mobile } = useDisplay();

const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices();
const { settings, loading: settingsLoading } = useUserSettings();
const { projects } = useProjects();
const { teamMembers } = useOrganization();

const isInitialLoad = computed(() => invoicesLoading.value || settingsLoading.value);

// --- Reports Navigation / Tab state ---
const activeReportTab = ref('sales');

// --- Team Hours Report state ---
const selectedMemberId = ref('all');
const startDate = ref('');
const endDate = ref('');
const projectEntries = ref([]);
const loadingHours = ref(false);

const membersList = computed(() => {
  const list = [...teamMembers.value];
  const ownerProfile = userProfile.value;
  if (ownerProfile && !list.some(m => (m.uid || m.id) === ownerProfile.id)) {
    list.push({
      id: ownerProfile.id,
      uid: ownerProfile.id,
      name: ownerProfile.name || ownerProfile.email || 'Owner',
      email: ownerProfile.email,
      role: 'owner'
    });
  }
  return list.map(m => ({
    name: `${m.name || m.email || 'Unknown'} (${m.role === 'owner' ? 'Owner' : 'Member'})`,
    uid: m.uid || m.id
  })).sort((a, b) => a.name.localeCompare(b.name));
});

const fetchHoursReportData = async () => {
  loadingHours.value = true;
  try {
    const allEntries = [];
    const projectList = projects.value;
    
    const fetchPromises = projectList.map(async (project) => {
      const entriesRef = collection(db, 'projects', project.id, 'entries');
      const q = query(entriesRef, where('type', '==', 'time'));
      const snap = await getDocs(q);
      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        allEntries.push({
          id: docSnap.id,
          projectId: project.id,
          projectName: project.name,
          clientName: project.clientName || 'No Client',
          ...data,
          dateStr: data.date,
          hours: Number(data.hours) || 0,
          rate: Number(data.rate) || 0,
          billable: data.billable !== false
        });
      });
    });
    
    await Promise.all(fetchPromises);
    projectEntries.value = allEntries;
  } catch (err) {
    console.error("Error fetching hours report data:", err);
  } finally {
    loadingHours.value = false;
  }
};

watch([activeReportTab, projects], ([newTab, newProjects]) => {
  if (newTab === 'hours' && newProjects.length > 0) {
    fetchHoursReportData();
  }
}, { immediate: true });

onMounted(() => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  startDate.value = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  endDate.value = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
});

const filteredHoursEntries = computed(() => {
  return projectEntries.value.filter(entry => {
    if (selectedMemberId.value && selectedMemberId.value !== 'all') {
      if (entry.createdBy !== selectedMemberId.value) return false;
    }
    if (startDate.value && entry.dateStr < startDate.value) return false;
    if (endDate.value && entry.dateStr > endDate.value) return false;
    return true;
  }).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
});

const hoursMetrics = computed(() => {
  let totalHours = 0;
  let billableHours = 0;
  let nonBillableHours = 0;
  let totalPay = 0;
  
  filteredHoursEntries.value.forEach(entry => {
    const hours = entry.hours || 0;
    const rate = entry.rate || 0;
    totalHours += hours;
    if (entry.billable) {
      billableHours += hours;
    } else {
      nonBillableHours += hours;
    }
    totalPay += hours * rate;
  });
  
  return {
    totalHours,
    billableHours,
    nonBillableHours,
    totalPay
  };
});

const exportHoursCSV = () => {
  if (!filteredHoursEntries.value.length) {
    alert('No hours data to export.');
    return;
  }
  
  const rows = filteredHoursEntries.value.map(entry => ({
    'Date': entry.dateStr || 'N/A',
    'Team Member': entry.createdByName || 'N/A',
    'Project': entry.projectName || 'N/A',
    'Client': entry.clientName || 'N/A',
    'Description': entry.description || '',
    'Billable': entry.billable ? 'YES' : 'NO',
    'Hours': entry.hours.toFixed(2),
    'Hourly Rate': entry.rate.toFixed(2),
    'Total Pay': (entry.hours * entry.rate).toFixed(2)
  }));
  
  const selectedMember = membersList.value.find(m => m.uid === selectedMemberId.value);
  const memberName = selectedMemberId.value === 'all' 
    ? 'All_Members' 
    : (selectedMember?.name || 'Member').replace(/[^a-zA-Z0-9]/g, '_');
  
  exportToCSV(`Hours_Report_${memberName}_${startDate.value}_to_${endDate.value}.csv`, rows);
};

const hoursReportPrintArea = ref(null);

const exportHoursPDF = async () => {
  if (!filteredHoursEntries.value.length) {
    alert('No hours data to export.');
    return;
  }

  pdfLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const element = hoursReportPrintArea.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin;
    
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    const selectedMember = membersList.value.find(m => m.uid === selectedMemberId.value);
    const memberName = selectedMemberId.value === 'all' 
      ? 'All_Members' 
      : (selectedMember?.name || 'Member').replace(/[^a-zA-Z0-9]/g, '_');
      
    pdf.save(`Hours_Report_${memberName}_${startDate.value}_to_${endDate.value}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    alert("An error occurred while generating the PDF. Please try again.");
  } finally {
    pdfLoading.value = false;
  }
};


// Months constant
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Current date defaults
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const selectedMonth = ref(currentMonth);
const selectedYear = ref(currentYear);
const pdfLoading = ref(false);

// Generate year options dynamically from invoices data + current year
const yearOptions = computed(() => {
  const years = new Set([currentYear]);
  invoices.value.forEach(invoice => {
    if (invoice.issueDate) {
      const year = invoice.issueDate.getFullYear();
      if (!isNaN(year)) {
        years.add(year);
      }
    }
  });
  return Array.from(years).sort((a, b) => b - a);
});

// Month options for Vuetify select
const monthOptions = months.map((month, index) => ({
  title: month,
  value: index
}));

// Filtered invoices for the selected month and year (excluding drafts)
const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    if (!invoice.issueDate || invoice.status === 'draft') return false;
    const invoiceMonth = invoice.issueDate.getMonth();
    const invoiceYear = invoice.issueDate.getFullYear();
    return invoiceMonth === selectedMonth.value && invoiceYear === selectedYear.value;
  }).sort((a, b) => b.issueDate - a.issueDate);
});

// Helper: Calculate tax amount of a specific invoice
const getInvoiceTax = (invoice) => {
  const subtotal = (invoice.items || []).reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
  const taxableSubtotal = (invoice.items || []).reduce((acc, item) => {
    const isTaxable = item.taxable !== false;
    return acc + (isTaxable ? (item.quantity || 0) * (item.price || 0) : 0);
  }, 0);
  
  let discountAmount = 0;
  if (invoice.discount) {
    if (invoice.discountType === 'percentage') {
      discountAmount = subtotal * (Number(invoice.discount) / 100);
    } else {
      discountAmount = Number(invoice.discount);
    }
  }
  
  const rate = Number(invoice.taxRate) || 0;
  let taxAmount = 0;
  if (rate > 0 && subtotal > 0) {
    const ratio = taxableSubtotal / subtotal;
    const postDiscountTaxableSubtotal = taxableSubtotal - (discountAmount * ratio);
    taxAmount = Math.max(0, postDiscountTaxableSubtotal) * (rate / 100);
  }
  return taxAmount;
};

// Calculate key metrics
const metrics = computed(() => {
  let totalSales = 0;
  let totalTax = 0;
  let totalPaid = 0;
  let totalPending = 0;
  const count = filteredInvoices.value.length;

  filteredInvoices.value.forEach(invoice => {
    const total = invoice.total || 0;
    const tax = getInvoiceTax(invoice);
    totalSales += total;
    totalTax += tax;

    if (invoice.status === 'paid') {
      totalPaid += total;
    } else {
      totalPending += total;
    }
  });

  const averageValue = count > 0 ? totalSales / count : 0;

  return {
    totalSales,
    totalTax,
    totalPaid,
    totalPending,
    count,
    averageValue
  };
});

// Formatting Helpers
const formatInvoiceNumber = (num) => `#${num}`;
const formatCurrency = (value) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: settings.value?.currency || 'USD'
  }).format(value || 0);
};

// Chart Data (Daily breakdown of sales)
const chartData = computed(() => {
  const daysInMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate();
  const dailyTotals = Array(daysInMonth).fill(0);
  const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  filteredInvoices.value.forEach(invoice => {
    if (invoice.issueDate) {
      const day = invoice.issueDate.getDate();
      if (day >= 1 && day <= daysInMonth) {
        dailyTotals[day - 1] += (invoice.total || 0);
      }
    }
  });

  return {
    labels,
    datasets: [
      {
        label: 'Daily Sales',
        backgroundColor: '#4CAF50', // Green accent
        borderColor: '#4CAF50',
        borderRadius: 6,
        data: dailyTotals
      }
    ]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += formatCurrency(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#94a3b8'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.08)'
      },
      ticks: {
        color: '#94a3b8',
        callback: function(value) {
          return new Intl.NumberFormat(undefined, { 
            style: 'currency', 
            currency: settings.value?.currency || 'USD',
            notation: 'compact'
          }).format(value);
        }
      }
    }
  }
}));

// Export to CSV Function
const exportCSV = () => {
  if (!filteredInvoices.value.length) {
    alert('No data to export for this month.');
    return;
  }

  const rows = filteredInvoices.value.map(invoice => ({
    'Invoice Number': invoice.invoiceNumber || 'N/A',
    'Issue Date': invoice.issueDate ? invoice.issueDate.toLocaleDateString() : 'N/A',
    'Due Date': invoice.dueDate ? invoice.dueDate.toLocaleDateString() : 'N/A',
    'Client Name': invoice.client?.name || 'N/A',
    'Status': invoice.status ? invoice.status.toUpperCase() : 'PENDING',
    'Tax Rate (%)': invoice.taxRate || 0,
    'Tax Collected': getInvoiceTax(invoice).toFixed(2),
    'Total Amount': (invoice.total || 0).toFixed(2)
  }));

  const monthName = months[selectedMonth.value];
  exportToCSV(`Sales_Report_${monthName}_${selectedYear.value}.csv`, rows);
};

// Export to PDF Function using html2canvas & jsPDF
const reportPrintArea = ref(null);

const exportPDF = async () => {
  if (!filteredInvoices.value.length) {
    alert('No data to export for this month.');
    return;
  }

  pdfLoading.value = true;
  try {
    // Wait for the print template to be updated in the DOM
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const element = reportPrintArea.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = margin;
    
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    const monthName = months[selectedMonth.value];
    pdf.save(`Sales_Report_${monthName}_${selectedYear.value}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    alert("An error occurred while generating the PDF. Please try again.");
  } finally {
    pdfLoading.value = false;
  }
};

const getStatusColor = (status) => {
  const s = status ? status.toLowerCase() : 'pending';
  switch (s) {
    case 'paid': return '#4CAF50';
    case 'payment_processing': return '#3F51B5';
    case 'overdue': return '#F44336';
    case 'pending': return '#2196F3';
    case 'sent': return '#FF9800';
    default: return '#9E9E9E';
  }
};

const viewInvoice = (id) => {
  router.push(`/invoice/${id}`);
};
</script>

<template>
  <div>
    <div v-if="isInitialLoad" class="page-loading-container">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p>Loading your sales reports...</p>
    </div>

    <div v-else class="reports-container">
      <!-- Tab Header -->
      <header class="reports-header d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
        <div>
          <h1 class="page-title">{{ activeReportTab === 'sales' ? 'Sales Reports' : 'Team Hours Reports' }}</h1>
          <p class="subtitle-text">
            {{ activeReportTab === 'sales' ? 'Analyze and export your monthly sales metrics.' : 'Filter, review, and export team member logged hours.' }}
          </p>
        </div>
        <div class="d-flex align-center w-100 w-sm-auto ga-3 flex-sm-row flex-column mt-4 mt-sm-0">
          <template v-if="activeReportTab === 'sales'">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-file-pdf-box"
              class="elevation-2 w-100 w-sm-auto action-btn"
              @click="exportPDF"
              :loading="pdfLoading"
              :disabled="!filteredInvoices.length"
              :size="mobile ? 'default' : 'large'"
            >
              Download PDF
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-file-delimited-outline"
              class="elevation-2 bg-transparent w-100 w-sm-auto action-btn"
              @click="exportCSV"
              :disabled="!filteredInvoices.length"
              :size="mobile ? 'default' : 'large'"
            >
              Export CSV
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-file-pdf-box"
              class="elevation-2 w-100 w-sm-auto action-btn"
              @click="exportHoursPDF"
              :loading="pdfLoading"
              :disabled="!filteredHoursEntries.length"
              :size="mobile ? 'default' : 'large'"
            >
              Download PDF
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-file-delimited-outline"
              class="elevation-2 bg-transparent w-100 w-sm-auto action-btn"
              @click="exportHoursCSV"
              :disabled="!filteredHoursEntries.length"
              :size="mobile ? 'default' : 'large'"
            >
              Export CSV
            </v-btn>
          </template>
        </div>
      </header>

      <!-- Report Type Selector Tabs -->
      <v-tabs v-model="activeReportTab" bg-color="transparent" color="primary" class="mb-6 align-self-start" align-tabs="start">
        <v-tab value="sales" class="text-capitalize font-weight-bold">
          <v-icon start class="mr-1">mdi-chart-line</v-icon>
          Sales Report
        </v-tab>
        <v-tab value="hours" class="text-capitalize font-weight-bold">
          <v-icon start class="mr-1">mdi-clock-outline</v-icon>
          Team Hours Report
        </v-tab>
      </v-tabs>

      <!-- ── SALES REPORT TAB ────────────────────────────────────────── -->
      <div v-if="activeReportTab === 'sales'">
        <!-- Filters Section -->
        <v-card class="filter-card mb-6" flat>
          <v-card-text class="d-flex flex-column flex-sm-row gap-4 pa-4 align-center">
            <div class="filter-item flex-grow-1 w-100">
              <span class="filter-label">Report Month</span>
              <v-select
                v-model="selectedMonth"
                :items="monthOptions"
                density="compact"
                variant="outlined"
                hide-details
                class="custom-select"
              ></v-select>
            </div>
            <div class="filter-item flex-grow-1 w-100">
              <span class="filter-label">Report Year</span>
              <v-select
                v-model="selectedYear"
                :items="yearOptions"
                density="compact"
                variant="outlined"
                hide-details
                class="custom-select"
              ></v-select>
            </div>
          </v-card-text>
        </v-card>

        <!-- If no data is available for this month -->
        <div v-if="!filteredInvoices.length" class="no-data-card pa-12 text-center">
          <v-icon size="80" color="rgba(255, 255, 255, 0.1)" class="mb-4">mdi-file-chart-outline</v-icon>
          <h3 class="text-h5 font-weight-medium">No Sales Data</h3>
          <p class="text-subtitle-1 mt-2 text-medium-emphasis">
            There are no finalized invoices for {{ months[selectedMonth] }} {{ selectedYear }}.
          </p>
        </div>

        <div v-else>
          <!-- Metrics Grid -->
          <div class="metrics-grid mb-6">
            <v-card class="metric-card" flat>
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="metric-title">Total Sales</span>
                  <v-avatar color="rgba(74, 144, 226, 0.1)" size="36">
                    <v-icon color="#4A90E2" size="20">mdi-currency-usd</v-icon>
                  </v-avatar>
                </div>
                <div class="metric-value text-glow-blue">{{ formatCurrency(metrics.totalSales) }}</div>
                <div class="metric-subtitle">Excludes drafts</div>
              </v-card-text>
            </v-card>

            <v-card class="metric-card" flat>
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="metric-title">Tax Collected</span>
                  <v-avatar color="rgba(80, 227, 194, 0.1)" size="36">
                    <v-icon color="#50E3C2" size="20">mdi-percent</v-icon>
                  </v-avatar>
                </div>
                <div class="metric-value text-glow-teal">{{ formatCurrency(metrics.totalTax) }}</div>
                <div class="metric-subtitle">From taxable items</div>
              </v-card-text>
            </v-card>

            <v-card class="metric-card" flat>
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="metric-title">Average Value</span>
                  <v-avatar color="rgba(156, 39, 176, 0.1)" size="36">
                    <v-icon color="#9C27B0" size="20">mdi-calculator</v-icon>
                  </v-avatar>
                </div>
                <div class="metric-value">{{ formatCurrency(metrics.averageValue) }}</div>
                <div class="metric-subtitle">Per sales invoice</div>
              </v-card-text>
            </v-card>

            <v-card class="metric-card" flat>
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="metric-title">Total Invoices</span>
                  <v-avatar color="rgba(255, 152, 0, 0.1)" size="36">
                    <v-icon color="#FF9800" size="20">mdi-file-document-outline</v-icon>
                  </v-avatar>
                </div>
                <div class="metric-value">{{ metrics.count }}</div>
                <div class="metric-subtitle">Finalized count</div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Secondary Breakdown (Paid vs Outstanding) -->
          <div class="breakdown-grid mb-6">
            <v-card class="breakdown-card" flat>
              <v-card-text class="d-flex align-center">
                <v-avatar color="rgba(76, 175, 80, 0.1)" size="48" class="mr-4">
                  <v-icon color="#4CAF50" size="28">mdi-check-circle-outline</v-icon>
                </v-avatar>
                <div>
                  <span class="breakdown-label">Paid / Collected</span>
                  <div class="breakdown-value text-glow-green">{{ formatCurrency(metrics.totalPaid) }}</div>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="breakdown-card" flat>
              <v-card-text class="d-flex align-center">
                <v-avatar color="rgba(244, 67, 54, 0.1)" size="48" class="mr-4">
                  <v-icon color="#F44336" size="28">mdi-alert-circle-outline</v-icon>
                </v-avatar>
                <div>
                  <span class="breakdown-label">Pending / Outstanding</span>
                  <div class="breakdown-value text-glow-red">{{ formatCurrency(metrics.totalPending) }}</div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Sales Trend Chart -->
          <v-card class="chart-card mb-6" flat>
            <v-card-text>
              <h3 class="text-h6 font-weight-medium mb-4">Daily Sales Trend</h3>
              <div class="chart-container">
                <Bar :data="chartData" :options="chartOptions" />
              </div>
            </v-card-text>
          </v-card>

          <!-- Invoice Table -->
          <v-card class="table-card" flat>
            <v-card-text class="pa-0">
              <div class="d-flex justify-space-between align-center px-6 py-4">
                <h3 class="text-h6 font-weight-medium">Monthly Breakdown</h3>
              </div>
              
              <div class="table-responsive">
                <table class="reports-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Issue Date</th>
                      <th>Client</th>
                      <th>Status</th>
                      <th class="text-right">Tax</th>
                      <th class="text-right">Total</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in filteredInvoices" :key="invoice.id">
                      <td class="font-weight-bold">{{ formatInvoiceNumber(invoice.invoiceNumber) }}</td>
                      <td>{{ invoice.issueDate ? invoice.issueDate.toLocaleDateString() : 'N/A' }}</td>
                      <td>{{ invoice.client?.name || 'N/A' }}</td>
                      <td>
                        <span class="status-chip" :style="{ backgroundColor: getStatusColor(invoice.status) }">
                          {{ invoice.status }}
                        </span>
                      </td>
                      <td class="text-right">{{ formatCurrency(getInvoiceTax(invoice)) }}</td>
                      <td class="text-right font-weight-bold">{{ formatCurrency(invoice.total) }}</td>
                      <td class="text-center">
                        <v-btn
                          icon="mdi-eye-outline"
                          variant="text"
                          density="comfortable"
                          color="primary"
                          @click="viewInvoice(invoice.id)"
                          title="View Invoice"
                        ></v-btn>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- ── TEAM HOURS REPORT TAB ──────────────────────────────────── -->
      <div v-if="activeReportTab === 'hours'">
        <!-- Hours Report Filters Section -->
        <v-card class="filter-card mb-6" flat>
          <v-card-text class="d-flex flex-column flex-sm-row gap-4 pa-4 align-center">
            <div class="filter-item flex-grow-1 w-100">
              <span class="filter-label">Start Date</span>
              <v-text-field
                v-model="startDate"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                class="custom-select"
              ></v-text-field>
            </div>
            <div class="filter-item flex-grow-1 w-100">
              <span class="filter-label">End Date</span>
              <v-text-field
                v-model="endDate"
                type="date"
                density="compact"
                variant="outlined"
                hide-details
                class="custom-select"
              ></v-text-field>
            </div>
            <div class="filter-item flex-grow-1 w-100">
              <span class="filter-label">Team Member</span>
              <v-select
                v-model="selectedMemberId"
                :items="[{ name: 'All Members', uid: 'all' }, ...membersList]"
                item-title="name"
                item-value="uid"
                density="compact"
                variant="outlined"
                hide-details
                class="custom-select"
              ></v-select>
            </div>
          </v-card-text>
        </v-card>

        <!-- Hours Metrics Grid -->
        <div class="metrics-grid mb-6">
          <v-card class="metric-card" flat>
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="metric-title">Total Hours</span>
                <v-avatar color="rgba(74, 144, 226, 0.1)" size="36">
                  <v-icon color="#4A90E2" size="20">mdi-clock-outline</v-icon>
                </v-avatar>
              </div>
              <div class="metric-value text-glow-blue">{{ hoursMetrics.totalHours.toFixed(1) }} hrs</div>
              <div class="metric-subtitle">Across selected criteria</div>
            </v-card-text>
          </v-card>

          <v-card class="metric-card" flat>
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="metric-title">Billable Hours</span>
                <v-avatar color="rgba(76, 175, 80, 0.1)" size="36">
                  <v-icon color="#4CAF50" size="20">mdi-lock-clock</v-icon>
                </v-avatar>
              </div>
              <div class="metric-value text-glow-green">{{ hoursMetrics.billableHours.toFixed(1) }} hrs</div>
              <div class="metric-subtitle">To be billed to clients</div>
            </v-card-text>
          </v-card>

          <v-card class="metric-card" flat>
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="metric-title">Non-Billable Hours</span>
                <v-avatar color="rgba(244, 67, 54, 0.1)" size="36">
                  <v-icon color="#F44336" size="20">mdi-clock-alert-outline</v-icon>
                </v-avatar>
              </div>
              <div class="metric-value text-glow-red">{{ hoursMetrics.nonBillableHours.toFixed(1) }} hrs</div>
              <div class="metric-subtitle">Internal / overhead hours</div>
            </v-card-text>
          </v-card>

          <v-card class="metric-card" flat>
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="metric-title">Estimated Labor Cost</span>
                <v-avatar color="rgba(156, 39, 176, 0.1)" size="36">
                  <v-icon color="#9C27B0" size="20">mdi-currency-usd</v-icon>
                </v-avatar>
              </div>
              <div class="metric-value text-glow-purple">{{ formatCurrency(hoursMetrics.totalPay) }}</div>
              <div class="metric-subtitle">Based on member hourly rates</div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Hours Breakdown Table -->
        <v-card class="table-card" flat>
          <v-card-text class="pa-0">
            <div class="d-flex justify-space-between align-center px-6 py-4">
              <h3 class="text-h6 font-weight-medium">Hours Breakdown</h3>
            </div>
            
            <div v-if="loadingHours" class="pa-6 text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-2 text-medium-emphasis">Fetching hours data...</p>
            </div>
            
            <div v-else-if="!filteredHoursEntries.length" class="pa-12 text-center">
              <v-icon size="48" color="rgba(255, 255, 255, 0.1)" class="mb-2">mdi-clock-outline</v-icon>
              <p class="text-medium-emphasis">No hours logged matching the filters.</p>
            </div>

            <div v-else class="table-responsive">
              <table class="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Team Member</th>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Billable</th>
                    <th class="text-right">Hours</th>
                    <th class="text-right">Rate</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in filteredHoursEntries" :key="entry.id">
                    <td>{{ entry.dateStr }}</td>
                    <td class="font-weight-bold">{{ entry.createdByName }}</td>
                    <td>{{ entry.projectName }}</td>
                    <td>{{ entry.clientName }}</td>
                    <td>{{ entry.description || '—' }}</td>
                    <td>
                      <v-chip :color="entry.billable ? 'success' : 'default'" size="x-small" variant="tonal">
                        {{ entry.billable ? 'Billable' : 'Non-billable' }}
                      </v-chip>
                    </td>
                    <td class="text-right">{{ entry.hours.toFixed(2) }} hrs</td>
                    <td class="text-right">{{ formatCurrency(entry.rate) }}</td>
                    <td class="text-right font-weight-bold">{{ formatCurrency(entry.hours * entry.rate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Offscreen Print-Ready Template (White Background, Portrait Format) for Sales -->
      <div ref="reportPrintArea" class="print-report-container">
        <!-- Header -->
        <div class="print-header">
          <div>
            <h1 class="print-main-title">Sales Report</h1>
            <p class="print-period">{{ months[selectedMonth] }} {{ selectedYear }}</p>
          </div>
          <div class="print-company-details">
            <h3 class="print-company-name">{{ settings.company?.name || 'ScanGo Invoice User' }}</h3>
            <p v-if="settings.company?.email">{{ settings.company?.email }}</p>
            <p v-if="settings.company?.phone">{{ settings.company?.phone }}</p>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="print-metrics-grid">
          <div class="print-metric-box">
            <div class="print-metric-label">Total Sales</div>
            <div class="print-metric-val">{{ formatCurrency(metrics.totalSales) }}</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Tax Collected</div>
            <div class="print-metric-val">{{ formatCurrency(metrics.totalTax) }}</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Average Invoice</div>
            <div class="print-metric-val">{{ formatCurrency(metrics.averageValue) }}</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Paid / Collected</div>
            <div class="print-metric-val print-text-green">{{ formatCurrency(metrics.totalPaid) }}</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Pending / Outstanding</div>
            <div class="print-metric-val print-text-red">{{ formatCurrency(metrics.totalPending) }}</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Invoices Count</div>
            <div class="print-metric-val">{{ metrics.count }}</div>
          </div>
        </div>

        <!-- Table -->
        <h2 class="print-section-title">Invoice Breakdown</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Issue Date</th>
              <th>Client</th>
              <th>Status</th>
              <th style="text-align: right;">Tax</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filteredInvoices" :key="inv.id">
              <td style="font-family: monospace;">{{ formatInvoiceNumber(inv.invoiceNumber) }}</td>
              <td>{{ inv.issueDate ? inv.issueDate.toLocaleDateString() : 'N/A' }}</td>
              <td>{{ inv.client?.name || 'N/A' }}</td>
              <td style="text-transform: uppercase; font-weight: bold; font-size: 10px;">{{ inv.status }}</td>
              <td style="text-align: right;">{{ formatCurrency(getInvoiceTax(inv)) }}</td>
              <td style="text-align: right; font-weight: bold;">{{ formatCurrency(inv.total) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="print-footer">
          Generated on {{ new Date().toLocaleString() }} | Powered by ScanGo Invoice
        </div>
      </div>

      <!-- Offscreen Print-Ready Template (White Background, Portrait Format) for Hours -->
      <div ref="hoursReportPrintArea" class="print-report-container">
        <!-- Header -->
        <div class="print-header">
          <div>
            <h1 class="print-main-title">Team Hours Report</h1>
            <p class="print-period">{{ startDate }} to {{ endDate }}</p>
          </div>
          <div class="print-company-details">
            <h3 class="print-company-name">{{ settings.company?.name || 'ScanGo Invoice User' }}</h3>
            <p v-if="settings.company?.email">{{ settings.company?.email }}</p>
            <p v-if="settings.company?.phone">{{ settings.company?.phone }}</p>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="print-metrics-grid">
          <div class="print-metric-box">
            <div class="print-metric-label">Total Hours</div>
            <div class="print-metric-val">{{ hoursMetrics.totalHours.toFixed(1) }} hrs</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Billable Hours</div>
            <div class="print-metric-val">{{ hoursMetrics.billableHours.toFixed(1) }} hrs</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Non-Billable Hours</div>
            <div class="print-metric-val">{{ hoursMetrics.nonBillableHours.toFixed(1) }} hrs</div>
          </div>
          <div class="print-metric-box">
            <div class="print-metric-label">Estimated Labor Cost</div>
            <div class="print-metric-val print-text-purple">{{ formatCurrency(hoursMetrics.totalPay) }}</div>
          </div>
          <div class="print-metric-box" style="grid-column: span 2;">
            <div class="print-metric-label">Selected Member</div>
            <div class="print-metric-val">
              {{ selectedMemberId === 'all' ? 'All Members' : (membersList.find(m => m.uid === selectedMemberId)?.name || 'Member') }}
            </div>
          </div>
        </div>

        <!-- Table -->
        <h2 class="print-section-title">Hours Breakdown</h2>
        <table class="print-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Team Member</th>
              <th>Project</th>
              <th>Description</th>
              <th>Billable</th>
              <th style="text-align: right;">Hours</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in filteredHoursEntries" :key="entry.id">
              <td>{{ entry.dateStr }}</td>
              <td style="font-weight: bold;">{{ entry.createdByName }}</td>
              <td>{{ entry.projectName }}</td>
              <td>{{ entry.description || '—' }}</td>
              <td>{{ entry.billable ? 'Billable' : 'Non-billable' }}</td>
              <td style="text-align: right;">{{ entry.hours.toFixed(2) }} hrs</td>
              <td style="text-align: right;">{{ formatCurrency(entry.rate) }}</td>
              <td style="text-align: right; font-weight: bold;">{{ formatCurrency(entry.hours * entry.rate) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="print-footer">
          Generated on {{ new Date().toLocaleString() }} | Powered by ScanGo Invoice
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 1.5rem;
  background-color: #111d2f;
  color: #f1f5f9;
}

.reports-container {
  padding: 1.5rem;
  background-color: #111d2f;
  min-height: 100vh;
  color: #f1f5f9;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.subtitle-text {
  font-size: 1rem;
  color: #94a3b8;
}

.action-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 8px;
}

/* Glassmorphic Select Container */
.filter-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  color: #f1f5f9 !important;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.custom-select {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.no-data-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  backdrop-filter: blur(16px);
  color: #f1f5f9;
}

/* Metrics Grid styles */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.metric-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.25rem;
}

.metric-subtitle {
  font-size: 0.8rem;
  color: #64748b;
}

.text-glow-blue {
  text-shadow: 0 0 15px rgba(74, 144, 226, 0.4);
}

.text-glow-teal {
  text-shadow: 0 0 15px rgba(80, 227, 194, 0.4);
}

/* Secondary Breakdown Grid */
.breakdown-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.breakdown-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
}

.breakdown-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.breakdown-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.text-glow-green {
  text-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
}

.text-glow-red {
  text-shadow: 0 0 15px rgba(244, 67, 54, 0.4);
}

.text-glow-purple {
  text-shadow: 0 0 15px rgba(156, 39, 176, 0.4);
}

/* Chart Card */
.chart-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  color: #f1f5f9 !important;
}

.chart-container {
  height: 320px;
  position: relative;
  width: 100%;
}

/* Invoices Table Card */
.table-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  color: #f1f5f9 !important;
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.reports-table th {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.reports-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-size: 0.95rem;
}

.reports-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.status-chip {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
}

.gap-2 {
  gap: 0.5rem;
}
.gap-4 {
  gap: 1rem;
}

/* --- OFFSCREEN PRINT-READY PDF STYLING --- */
.print-report-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 700px;
  background: #ffffff;
  color: #333333;
  padding: 36px;
  box-sizing: border-box;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #2b3a4a;
  padding-bottom: 20px;
  margin-bottom: 25px;
}

.print-main-title {
  font-size: 26px;
  font-weight: bold;
  color: #1a2a3a;
  margin: 0;
}

.print-period {
  font-size: 14px;
  color: #666666;
  margin: 5px 0 0 0;
}

.print-company-details {
  text-align: right;
  font-size: 12px;
  color: #555555;
  line-height: 1.4;
}

.print-company-name {
  font-size: 16px;
  font-weight: bold;
  color: #1a2a3a;
  margin: 0 0 5px 0;
}

.print-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.print-metric-box {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  background: #f8fafc;
}

.print-metric-label {
  font-size: 10px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: bold;
}

.print-metric-val {
  font-size: 18px;
  font-weight: bold;
  color: #0f172a;
  margin-top: 4px;
}

.print-text-green {
  color: #15803d !important;
}

.print-text-red {
  color: #b91c1c !important;
}

.print-text-purple {
  color: #7e22ce !important;
}

.print-section-title {
  font-size: 16px;
  font-weight: bold;
  color: #1a2a3a;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 8px;
  margin-bottom: 12px;
  margin-top: 20px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.print-table th {
  background: #f1f5f9;
  color: #475569;
  text-align: left;
  font-weight: bold;
  padding: 8px 10px;
  border-bottom: 1.5px solid #cbd5e1;
}

.print-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.print-table tr:nth-child(even) td {
  background: #f8fafc;
}

.print-footer {
  margin-top: 40px;
  border-top: 1px solid #e2e8f0;
  padding-top: 15px;
  text-align: center;
  font-size: 9px;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .reports-container {
    padding: 0.75rem;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
  .reports-table th, .reports-table td {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
