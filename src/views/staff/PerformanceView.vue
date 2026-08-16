<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Ledger
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Performance &amp; Commissions Ledger</h1>
        <p class="text-xs text-slate-500 mt-0.5">Track your satisfaction score, properties submitted, and earned commission payments.</p>
      </div>
      <div>
        <button @click="loadData" class="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Ledger
        </button>
      </div>
    </div>

    <!-- Performance Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Satisfaction Rating</span>
        <span class="text-2xl font-black text-amber-500 mt-2 block">★ 4.8 / 5.0</span>
        <span class="text-[9px] text-slate-400 mt-2 block font-semibold">Based on 15 settled clients</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Commissions Earned</span>
        <span class="text-2xl font-black text-emerald-600 mt-2 block">KES {{ formatCurrency(stats?.commissions_earned || totalSum) }}</span>
        <span class="text-[9px] text-slate-400 mt-2 block font-semibold">Paid out directly to bank wallet</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Draft Properties Submitted</span>
        <span class="text-2xl font-black text-slate-800 mt-2 block">{{ stats?.properties_submitted || 2 }} Properties</span>
        <span class="text-[9px] text-slate-400 mt-2 block font-semibold">Awaiting principal admin listing check</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl">
      <div class="flex gap-2">
        <button v-for="f in ['all', 'paid', 'pending']" :key="f"
          @click="activeFilter = f"
          :class="['text-[10px] font-bold px-3 py-1.5 rounded-lg capitalize border', activeFilter === f ? 'bg-indigo-55 border-indigo-200 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 border-transparent']">
          {{ f }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-6">Voucher ID</th>
              <th class="py-3.5 px-4">Listing Ref</th>
              <th class="py-3.5 px-4">Earned Amount</th>
              <th class="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in pagedCommissions" :key="c.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-3 px-6 font-mono font-semibold text-slate-700">{{ c.id }}</td>
              <td class="py-3 px-4 font-mono text-slate-500">{{ c.listing_id }}</td>
              <td class="py-3 px-4 font-bold text-slate-800">KES {{ formatCurrency(c.amount) }}</td>
              <td class="py-3 px-6">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', c.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
                  {{ c.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredCommissions.length === 0">
              <td colspan="4" class="text-center py-16 text-slate-400">
                <div class="mb-2"><svg class="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                No commissions ledger recorded.
              </td>
            </tr>
          </tbody>
        </table>
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
import { usePagination } from '@/composables/usePagination';

export default {
  name: 'PerformanceView',
  setup() {
    const store = useAppStore();
    const activeFilter = ref('all');

    const stats = computed(() => store.dashboardStats);
    const commissions = computed(() => store.commissions || []);

    const filteredCommissions = computed(() => {
      let list = commissions.value;
      if (activeFilter.value !== 'all') {
        list = list.filter(c => c.status === activeFilter.value);
      }
      return list;
    });

    const totalSum = computed(() => {
      return commissions.value.reduce((acc, c) => acc + (c.amount || 0), 0);
    });

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchCommissions();
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(loadData);

    const { paginatedItems: pagedCommissions, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(filteredCommissions);

    return {
      stats, commissions, filteredCommissions, activeFilter, totalSum,
      loadData, formatCurrency, pagedCommissions, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
