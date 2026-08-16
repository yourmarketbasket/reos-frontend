<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Technical Admin
          </span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">System Health Center</h1>
        <p class="text-sm text-slate-500 mt-0.5">Infrastructure monitoring, integrations, and background jobs</p>
      </div>
      <button @click="showJobModal = true" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Re-trigger Job
      </button>
    </div>

    <!-- Service status grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="svc in services" :key="svc.name" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ svc.name }}</p>
          <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5', svc.ok ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]']"></span>
        </div>
        <p class="text-2xl font-bold text-slate-800">{{ svc.value }}</p>
        <p class="text-[10px] text-slate-400 mt-1">{{ svc.sub }}</p>
      </div>
    </div>

    <!-- Two columns -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Integration Config -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-slate-800 mb-4">Integration Config</h2>
        <div class="space-y-3">
          <div v-for="itg in integrations" :key="itg.name" class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p class="text-sm font-semibold text-slate-700">{{ itg.name }}</p>
              <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ itg.url }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', itg.env === 'production' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200']">{{ itg.env.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error / exception log -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-800">Recent Exceptions</h2>
          <span class="text-[10px] font-bold text-slate-400 uppercase">Last 24 h</span>
        </div>
        <div class="space-y-2.5">
          <div v-for="err in errors" :key="err.id" class="p-3 rounded-xl border font-mono text-xs" :class="err.cls">
            <p class="font-bold">{{ err.code }}</p>
            <p class="text-[10px] mt-0.5 opacity-70">{{ err.path }} · {{ err.time }}</p>
          </div>
          <div class="text-center py-3 text-xs text-slate-400">No other exceptions in the last 24 hours</div>
        </div>
      </div>
    </div>

    <!-- Background jobs -->
    <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h2 class="font-bold text-slate-800 mb-4">Background Jobs</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-100"><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Job</th><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Status</th><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Last Run</th><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Next Run</th></tr></thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="job in pagedJobs" :key="job.name" class="hover:bg-slate-50/50">
              <td class="py-2.5 pr-4 text-xs font-semibold text-slate-700">{{ job.name }}</td>
              <td class="py-2.5 pr-4"><span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', job.statusCls]">{{ job.status }}</span></td>
              <td class="py-2.5 pr-4 text-xs text-slate-500">{{ job.lastRun }}</td>
              <td class="py-2.5 text-xs text-slate-500">{{ job.nextRun }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Re-trigger job modal -->
    <Teleport to="body">
      <div v-if="showJobModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 380px;">
          <div class="modal-header">
            <h3 class="text-sm font-bold font-heading text-slate-900 uppercase">Re-trigger Background Job</h3>
            <button @click="showJobModal = false" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <select v-model="selectedJob" class="form-select text-xs mb-4">
            <option v-for="job in jobs" :key="job.name" :value="job.name">{{ job.name }}</option>
          </select>
          <div class="flex gap-3">
            <button @click="showJobModal = false" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            <button @click="triggerJob" class="flex-1 bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 rounded-xl text-sm transition-colors">Trigger Now</button>
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
import { ref } from 'vue';
import { useAppStore } from '@/stores/store';
export default {
  name: 'TechAdminDashboard',
  setup() {
    const store = useAppStore();
    const showJobModal = ref(false);
    const selectedJob = ref('');

    const services = [
      { name: 'MongoDB', value: 'OK', sub: 'Primary cluster · 4ms avg', ok: true },
      { name: 'Redis', value: 'OK', sub: '128 MB used · 2ms ping', ok: true },
      { name: 'WebSocket Hub', value: '—', sub: 'Active connections', ok: true },
      { name: 'API Latency', value: '—', sub: 'P95 response time', ok: true },
    ];

    const integrations = [
      { name: 'Daraja Webhook', url: '/api/payments/daraja/callback', env: 'production' },
      { name: 'Pesapal IPN', url: '/api/payments/pesapal/ipn', env: 'sandbox' },
      { name: 'Africa\'s Talking SMS', url: 'at://sms.gateway', env: 'production' },
      { name: 'IntaSend Webhook', url: '/api/payments/intasend/callback', env: 'production' },
    ];

    const errors = [
      { id: 1, code: 'ERR_WEBHOOK_VERIFY_FAILED', path: 'POST /api/payments/pesapal/ipn', time: '3 min ago', cls: 'bg-red-50 border-red-200 text-red-800' },
      { id: 2, code: 'ERR_MONGO_CURSOR_TIMEOUT', path: 'GET /api/properties?page=5', time: '47 min ago', cls: 'bg-amber-50 border-amber-200 text-amber-800' },
    ];

    const jobs = [
      { name: 'Payment Reconciliation', status: 'OK', statusCls: 'bg-emerald-50 text-emerald-700 border-emerald-200', lastRun: '5 min ago', nextRun: 'In 55 min' },
      { name: 'Arrears Reminder', status: 'OK', statusCls: 'bg-emerald-50 text-emerald-700 border-emerald-200', lastRun: '1h ago', nextRun: 'Tomorrow 08:00' },
      { name: 'Redis Cache Flush', status: 'PENDING', statusCls: 'bg-amber-50 text-amber-700 border-amber-200', lastRun: '6h ago', nextRun: 'In 6h' },
      { name: 'Score Recalculation', status: 'ERROR', statusCls: 'bg-red-50 text-red-700 border-red-200', lastRun: 'Failed', nextRun: 'Manual' },
    ];

    const triggerJob = () => {
      store.success = `Job "${selectedJob.value}" re-triggered successfully.`;
      showJobModal.value = false;
    };


    // Pagination: jobs
    const { paginatedItems: pagedJobs, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(jobs);
    return { services, integrations, errors, jobs, showJobModal, selectedJob, triggerJob, pagedJobs, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage };
  }
};
</script>
