<template>
  <v-card class="chart-card" flat>
    <v-card-text>
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h6 font-weight-medium">Cash Flow Projection</h3>
      </div>
      <div class="chart-container">
        <Bar v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
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
import { startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, format } from 'date-fns';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  invoices: {
    type: Array,
    default: () => []
  }
});

// Calculate the 6 week intervals
const weeks = computed(() => {
  const intervals = [];
  const now = new Date();
  
  // Start from previous week
  let currentStart = startOfWeek(subWeeks(now, 1));
  
  for (let i = 0; i < 6; i++) {
    const start = addWeeks(currentStart, i);
    const end = endOfWeek(start);
    intervals.push({
      start,
      end,
      label: i === 0 ? 'Last Week' : i === 1 ? 'This Week' : format(start, 'MMM d')
    });
  }
  return intervals;
});

const chartData = computed(() => {
  const pendingData = [];
  const paidData = [];
  const labels = [];

  weeks.value.forEach(week => {
    labels.push(week.label);
    
    let pendingSum = 0;
    let paidSum = 0;

    props.invoices.forEach(invoice => {
      const status = invoice.status ? invoice.status.toLowerCase() : 'pending';
      // group by Due Date
      let invoiceDate = null;
      if (invoice.dueDate) {
        invoiceDate = typeof invoice.dueDate.toDate === 'function' ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
      }
      
      if (invoiceDate && !isNaN(invoiceDate.getTime()) && isWithinInterval(invoiceDate, { start: week.start, end: week.end })) {
        if (status === 'paid') {
          paidSum += (invoice.total || 0);
        } else if (status === 'pending' || status === 'overdue') { // Treat overdue as pending for cash flow expectations
          pendingSum += (invoice.total || 0);
        }
      }
    });

    pendingData.push(pendingSum);
    paidData.push(paidSum);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Pending',
        backgroundColor: '#2196F3', // Blue
        borderRadius: 4,
        data: pendingData
      },
      {
        label: 'Paid',
        backgroundColor: '#4CAF50', // Green
        borderRadius: 4,
        data: paidData
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#f1f5f9'
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      stacked: false, // Grouped bar chart
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8'
      }
    },
    y: {
      stacked: false,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        callback: function(value, index, values) {
          if (value >= 1000) {
            return '$' + value / 1000 + 'k';
          }
          return '$' + value;
        }
      }
    }
  }
};
</script>

<style scoped>
.chart-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(16px);
  border-radius: 16px !important;
  margin-bottom: 24px;
  color: #f1f5f9 !important;
}

.chart-container {
  height: 300px;
  position: relative;
  width: 100%;
}
</style>
