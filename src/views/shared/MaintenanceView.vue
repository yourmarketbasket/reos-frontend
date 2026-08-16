<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight font-heading">Maintenance Requests</h1>
      <p class="text-sm text-slate-500 mt-1">Operational tracker for property maintenance, repair estimates, and caretaker actions.</p>
    </div>

    <!-- Maintenance Tickets list -->
    <div class="bg-white border border-slate-200 rounded-xl p-6">
      <h2 class="text-lg font-bold font-heading mb-6">Repair Work Orders</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
              <th class="py-2.5 px-3">Ticket ID</th>
              <th class="py-2.5 px-3">Unit Label</th>
              <th class="py-2.5 px-3">Category</th>
              <th class="py-2.5 px-3">Description</th>
              <th class="py-2.5 px-3">Urgency</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Cost Estimate</th>
              <th class="py-2.5 px-3">Final Cost</th>
              <th class="py-2.5 px-3">Date Reported</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in pagedTickets" :key="t.id" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
              <td class="py-3 px-3 font-mono text-[10px] text-slate-400">{{ t.id }}</td>
              <td class="py-3 px-3 font-semibold text-slate-800">{{ t.unit_id }}</td>
              <td class="py-3 px-3 font-medium text-slate-900">{{ t.issue_type }}</td>
              <td class="py-3 px-3 text-slate-500 max-w-[200px] truncate" :title="t.description">{{ t.description }}</td>
              <td class="py-3 px-3">
                <span :class="['badge text-[9px]', t.priority === 'high' ? 'badge-danger' : t.priority === 'medium' ? 'badge-warning' : 'badge-info']">
                  {{ t.priority }}
                </span>
              </td>
              <td class="py-3 px-3">
                <span :class="['badge text-[9px]', getStatusBadgeClass(t.status)]">
                  {{ t.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="py-3 px-3 font-semibold text-slate-700">
                {{ t.cost_estimate > 0 ? `KES ${formatCurrency(t.cost_estimate)}` : '-' }}
              </td>
              <td class="py-3 px-3 font-bold text-slate-900">
                {{ t.final_cost > 0 ? `KES ${formatCurrency(t.final_cost)}` : '-' }}
              </td>
              <td class="py-3 px-3 text-slate-400 font-medium">{{ formatDate(t.created_at) }}</td>
            </tr>
            <tr v-if="tickets.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-400">
                No maintenance tickets logged.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  
        <PaginationBar
          :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
          :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers"
          :page-size="pageSize"
          @prev="prevPage" @next="nextPage" @go="goToPage"
          @update:pageSize="pageSize = $event"
          class="px-4 pb-4"
        />
</div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
import { usePagination } from '@/composables/usePagination';

export default {
  setup() {
    const store = useAppStore();
    const tickets = computed(() => store.maintenance);

    const loadData = async () => {
      await store.fetchMaintenance();
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'reported': return 'badge-warning';
        case 'reviewed': return 'badge-info';
        case 'in_progress': return 'badge-warning';
        case 'completed': return 'badge-success';
        default: return 'badge-danger';
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatDate = (dStr) => {
      if (!dStr) return '-';
      const d = new Date(dStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    onMounted(loadData);


    // --- Pagination ---
    const { paginatedItems: pagedTickets, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(tickets);
        return {
      tickets,
      getStatusBadgeClass,
      formatCurrency,
      formatDate, pagedTickets, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
