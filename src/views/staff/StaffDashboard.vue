<template>
  <div class="space-y-8 animate-fade-in pb-12">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Field Operations
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Field Representative Dashboard</h1>
        <p class="text-xs text-slate-500 mt-0.5">Manage assigned leads, schedule property viewings, and review monthly conversion stats.</p>
        <p v-if="stats?.principal_name" class="text-xs text-indigo-600 font-semibold mt-1.5 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          Assigned Principal: <span class="capitalize font-extrabold text-slate-800">{{ stats.principal_type }}</span> ({{ stats.principal_name }})
        </p>
      </div>
      <div>
        <span class="text-xs text-slate-400 font-semibold font-mono">Staff Console</span>
      </div>
    </div>

    <!-- Quick Action / Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Leads</span>
          <span class="text-2xl font-black text-slate-850 mt-1 block">{{ leads.length }}</span>
        </div>
        <router-link to="/leads" class="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold mt-4 flex items-center gap-1">
          Open Directory →
        </router-link>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Logged Viewings</span>
          <span class="text-2xl font-black text-slate-850 mt-1 block">{{ viewings.length }}</span>
        </div>
        <router-link to="/viewings" class="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold mt-4 flex items-center gap-1">
          Open Tour Logs →
        </router-link>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Earnings</span>
          <span class="text-2xl font-black text-emerald-600 mt-1 block">KES {{ formatCurrency(stats?.commissions_earned || 24000) }}</span>
        </div>
        <router-link to="/performance" class="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold mt-4 flex items-center gap-1">
          View Ledger →
        </router-link>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Satisfaction Rating</span>
          <span class="text-2xl font-black text-amber-500 mt-1 block">★ 4.8 / 5.0</span>
        </div>
        <span class="text-[9px] text-slate-400 font-medium block mt-4">Based on client feedback</span>
      </div>
    </div>

    <!-- Dual Summary Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Assigned Leads Column -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="font-bold text-slate-800 text-sm font-heading">Recent Leads</h2>
            <p class="text-[10px] text-slate-400">Your most recently assigned client intake requests.</p>
          </div>
          <router-link to="/leads" class="text-[10px] text-slate-500 hover:text-indigo-600 font-bold">
            View All
          </router-link>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="lead in recentLeads" :key="lead.id" class="py-3 flex items-center justify-between text-xs">
            <div>
              <p class="font-semibold text-slate-800 font-mono">{{ lead.id }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Listing: {{ lead.listing_id }} | Source: <span class="capitalize">{{ lead.source }}</span></p>
            </div>
            <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', lead.status === 'converted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
              {{ lead.status }}
            </span>
          </div>
          <div v-if="recentLeads.length === 0" class="text-center py-8 text-slate-400 text-xs">
            No leads currently assigned.
          </div>
        </div>
      </div>

      <!-- Recent Viewings Column -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="font-bold text-slate-800 text-sm font-heading">Upcoming &amp; Recent Viewings</h2>
            <p class="text-[10px] text-slate-400">Scheduled walkthroughs logged with prospective clients.</p>
          </div>
          <router-link to="/viewings" class="text-[10px] text-slate-500 hover:text-indigo-600 font-bold">
            View All
          </router-link>
        </div>

        <div class="divide-y divide-slate-100">
          <div v-for="v in recentViewings" :key="v.id" class="py-3 flex justify-between items-center text-xs">
            <div class="min-w-0 pr-3">
              <p class="font-semibold text-slate-800 truncate" :title="v.notes">{{ v.notes }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Lead: {{ v.lead_id }} | Logged: {{ new Date(v.logged_at).toLocaleDateString() }}</p>
            </div>
            <span class="text-[10px] font-semibold text-indigo-600 whitespace-nowrap bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
              {{ new Date(v.scheduled).toLocaleDateString() }}
            </span>
          </div>
          <div v-if="recentViewings.length === 0" class="text-center py-8 text-slate-400 text-xs">
            No viewings scheduled yet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'StaffDashboard',
  setup() {
    const store = useAppStore();

    const stats = computed(() => store.dashboardStats);
    const leads = computed(() => store.leads || []);
    const viewings = computed(() => store.viewings || []);

    const recentLeads = computed(() => {
      return [...leads.value].slice(0, 3);
    });

    const recentViewings = computed(() => {
      return [...viewings.value].slice(0, 3);
    });

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchLeads();
      await store.fetchCommissions();
      await store.fetchViewings();
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(loadData);

    return {
      stats, leads, viewings, recentLeads, recentViewings,
      formatCurrency
    };
  }
};
</script>
