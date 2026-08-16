<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight font-heading">SMS Fallback Channel Logs</h1>
      <p class="text-sm text-slate-500 mt-1">Audit log of system notifications dispatched to caretakers, tenants, and landlords via SMS fallback.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6">
      <h2 class="text-lg font-bold font-heading mb-6">SMS Dispatch History</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
              <th class="py-2.5 px-3">Log ID</th>
              <th class="py-2.5 px-3">Target Number</th>
              <th class="py-2.5 px-3">Notification Type</th>
              <th class="py-2.5 px-3">Linked Entity Ref</th>
              <th class="py-2.5 px-3">Status</th>
              <th class="py-2.5 px-3">Sent Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in pagedLogs" :key="log.id" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
              <td class="py-3 px-3 font-mono text-[10px] text-slate-400">{{ log.id }}</td>
              <td class="py-3 px-3 font-semibold text-slate-800">{{ log.phone }}</td>
              <td class="py-3 px-3 capitalize">
                <span class="badge badge-info text-[9px]">{{ log.template_type.replace('_', ' ') }}</span>
              </td>
              <td class="py-3 px-3 font-mono text-[10px] text-slate-500">{{ log.linked_entity_ref }}</td>
              <td class="py-3 px-3">
                <span class="badge badge-success text-[9px]">{{ log.status }}</span>
              </td>
              <td class="py-3 px-3 text-slate-500">{{ formatTime(log.sent_at) }}</td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="6" class="py-8 text-center text-slate-400">
                No SMS fallback notifications triggered yet.
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
import { usePagination } from '@/composables/usePagination';
import { computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();
    const logs = computed(() => store.smsLogs);

    const loadData = async () => {
      await store.fetchSMSLogs();
    };

    const formatTime = (tStr) => {
      if (!tStr) return '-';
      const d = new Date(tStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    onMounted(loadData);


    // Pagination: logs
    const { paginatedItems: pagedLogs, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(logs);
    return {
      logs,
      formatTime, pagedLogs, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
