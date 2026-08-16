<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Tour Logs
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Property Walkthroughs Log</h1>
        <p class="text-xs text-slate-500 mt-0.5">Historic audit of viewings scheduled and logged for all assigned clients.</p>
      </div>
      <div>
        <button @click="loadData" class="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Logs
        </button>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Logged Walkthroughs</span>
        <span class="text-lg font-black text-slate-800 mt-1 block">{{ viewings.length }}</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Upcoming Scheduled</span>
        <span class="text-lg font-black text-indigo-600 mt-1 block">{{ countUpcoming() }}</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Feedback Logged</span>
        <span class="text-lg font-black text-emerald-600 mt-1 block">{{ countFeedback() }}</span>
      </div>
    </div>

    <!-- Search/Toolbar -->
    <div class="flex justify-end items-center bg-white p-4 border border-slate-200 rounded-xl">
      <div class="relative w-full sm:w-48">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input v-model="search" type="text" placeholder="Search lead ID..." class="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 w-full" />
      </div>
    </div>

    <!-- Listings Table -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-6">Viewing ID</th>
              <th class="py-3.5 px-4">Lead ID</th>
              <th class="py-3.5 px-4">Scheduled Date</th>
              <th class="py-3.5 px-4">Caretaker / Agent Notes</th>
              <th class="py-3.5 px-6">Logged At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="v in pagedViewings" :key="v.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-3 px-6 font-mono font-semibold text-slate-700">{{ v.id }}</td>
              <td class="py-3 px-4 font-mono text-slate-500">{{ v.lead_id }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">{{ formatDateTime(v.scheduled) }}</td>
              <td class="py-3 px-4 text-slate-600 max-w-sm truncate font-medium" :title="v.notes">{{ v.notes }}</td>
              <td class="py-3 px-6 text-slate-400 font-medium">{{ formatDate(v.logged_at) }}</td>
            </tr>
            <tr v-if="filteredViewings.length === 0">
              <td colspan="5" class="text-center py-16 text-slate-400">
                <div class="mb-2"><svg class="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div>
                No property walkthroughs logged.
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
  name: 'ViewingsView',
  setup() {
    const store = useAppStore();
    const search = ref('');

    const viewings = computed(() => store.viewings || []);

    const filteredViewings = computed(() => {
      let list = viewings.value;
      if (search.value.trim()) {
        const q = search.value.toLowerCase();
        list = list.filter(v => v.lead_id?.toLowerCase().includes(q));
      }
      return [...list].sort((a, b) => new Date(b.scheduled) - new Date(a.scheduled));
    });

    const countUpcoming = () => {
      const now = new Date();
      return viewings.value.filter(v => new Date(v.scheduled) > now).length;
    };

    const countFeedback = () => {
      return viewings.value.filter(v => v.notes?.trim().length > 0).length;
    };

    const loadData = async () => {
      await store.fetchViewings();
    };

    const formatDateTime = (dtStr) => {
      if (!dtStr) return '';
      const d = new Date(dtStr);
      return d.toLocaleDateString() + ' - ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dStr) => {
      if (!dStr) return '';
      const date = new Date(dStr);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    onMounted(loadData);

    const { paginatedItems: pagedViewings, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(filteredViewings);

    return {
      viewings, filteredViewings, search,
      countUpcoming, countFeedback, loadData, formatDateTime, formatDate,
      pagedViewings, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
