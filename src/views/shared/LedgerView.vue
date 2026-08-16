<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight font-heading">Financial Ledger</h1>
      <p class="text-sm text-slate-500 mt-1">Append-only immutable record of rent collections, escrow deposits, and platform fees.</p>
    </div>

    <!-- Ledger Table Card -->
    <div class="bg-white border border-slate-200 rounded-xl p-6">
      <h2 class="text-lg font-bold font-heading mb-6">Ledger Audit History</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
              <th class="py-2.5 px-3">Entry ID</th>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3">Lease / Tenant ID</th>
              <th class="py-2.5 px-3">Amount</th>
              <th class="py-2.5 px-3">Gateway</th>
              <th class="py-2.5 px-3">Transaction Code</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Date Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in pagedLedger" :key="l.id" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
              <!-- Expandable details trigger on click -->
              <td class="py-3.5 px-3">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-[10px] text-slate-400">{{ l.id }}</span>
                  <button @click="toggleDetails(l.id)" class="text-blue-600 hover:underline text-[10px] font-semibold">
                    [Logs]
                  </button>
                </div>
              </td>
              <td class="py-3.5 px-3">
                <span :class="['badge text-[9px]', l.type === 'deposit' ? 'badge-info' : l.type === 'rent' ? 'badge-success' : 'badge-warning']">
                  {{ l.type }}
                </span>
              </td>
              <td class="py-3.5 px-3">
                <span class="text-slate-500 font-medium block">Lease: {{ l.lease_id }}</span>
                <span class="text-[10px] text-slate-400 block mt-0.5">Tenant: {{ l.tenant_id }}</span>
              </td>
              <td class="py-3.5 px-3 font-semibold text-slate-900">
                KES {{ formatCurrency(l.amount) }}
              </td>
              <td class="py-3.5 px-3 capitalize font-medium text-slate-500">{{ l.gateway_used }}</td>
              <td class="py-3.5 px-3 font-mono text-[10px] text-slate-700">{{ l.gateway_transaction_id }}</td>
              <td class="py-3.5 px-3">
                <span :class="['badge text-[9px]', getStatusBadgeClass(l.status)]">
                  {{ l.status }}
                </span>
              </td>
              <td class="py-3.5 px-3 text-slate-500">{{ formatDate(l.created_at) }}</td>
            </tr>
            <tr v-if="ledger.length === 0">
              <td colspan="8" class="py-8 text-center text-slate-400">
                No ledger logs found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Ledger Entry Audit Logs -->
    <Teleport to="body">
      <div v-if="activeDetailsID" class="modal-overlay">
      <div class="modal-container max-w-lg">
        <div class="modal-header">
          <h3 class="text-lg font-bold font-heading">Ledger Status History</h3>
          <button @click="activeDetailsID = null" class="modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p class="text-xs text-slate-500 mb-4">
          Append-only state logs for Ledger Entry: <strong class="font-mono text-slate-800">{{ activeDetailsID }}</strong>
        </p>

        <div class="space-y-4">
          <div 
            v-for="(h, idx) in activeHistory" 
            :key="idx" 
            class="p-4 border border-slate-100 rounded-lg bg-slate-50 relative pl-8"
          >
            <!-- Timeline dot -->
            <div class="absolute left-3 top-5 w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
            
            <div class="flex justify-between text-xs font-semibold text-slate-700">
              <span>Status: <span class="capitalize text-blue-600">{{ h.status }}</span></span>
              <span class="text-slate-400">{{ formatDate(h.changed_at) }}</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">
              Reason: {{ h.reason }}
            </p>
            <div class="flex justify-between text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1">
              <span>Actor: {{ h.changed_by }}</span>
              <span>Source IP: {{ h.source_ip }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  
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
import { usePagination } from '@/composables/usePagination';
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();
    const activeDetailsID = ref(null);

    const ledger = computed(() => store.ledger);

    const activeHistory = computed(() => {
      if (!activeDetailsID.value) return [];
      const entry = ledger.value.find(l => l.id === activeDetailsID.value);
      return entry ? entry.status_history : [];
    });

    const loadData = async () => {
      await store.fetchLedger();
    };

    const toggleDetails = (id) => {
      activeDetailsID.value = id;
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'confirmed': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'failed': return 'badge-danger';
        default: return 'badge-danger';
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatDate = (dStr) => {
      if (!dStr) return '-';
      const d = new Date(dStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    onMounted(loadData);


    // --- Pagination ---
    const { paginatedItems: pagedLedger, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(ledger);
        return {
      ledger,
      activeDetailsID,
      activeHistory,
      toggleDetails,
      getStatusBadgeClass,
      formatCurrency,
      formatDate, pagedLedger, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
