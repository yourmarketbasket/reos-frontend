<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Client Intake
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Assigned Leads Directory</h1>
        <p class="text-xs text-slate-500 mt-0.5">Manage and track client inquiries, sources, and log viewing feedback.</p>
      </div>
      <div>
        <button @click="loadData" class="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Leads
        </button>
      </div>
    </div>

    <!-- Stats summary strip -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Leads</span>
        <span class="text-lg font-black text-slate-800 mt-1 block">{{ leads.length }}</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">New / Pending</span>
        <span class="text-lg font-black text-amber-600 mt-1 block">{{ countStatus('pending') + countStatus('new') }}</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Contacted</span>
        <span class="text-lg font-black text-blue-600 mt-1 block">{{ countStatus('contacted') }}</span>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Converted</span>
        <span class="text-lg font-black text-emerald-600 mt-1 block">{{ countStatus('converted') + countStatus('closed') }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 border border-slate-200 rounded-xl">
      <div class="flex gap-2">
        <button v-for="f in ['all', 'pending', 'contacted']" :key="f"
          @click="activeFilter = f"
          :class="['text-[10px] font-bold px-3 py-1.5 rounded-lg capitalize border', activeFilter === f ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-500 hover:bg-slate-50 border-transparent']">
          {{ f }}
        </button>
      </div>
      <div class="relative w-full sm:w-48">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input v-model="search" type="text" placeholder="Search listing ID..." class="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 w-full" />
      </div>
    </div>

    <!-- Table Directory -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-6">Lead ID</th>
              <th class="py-3.5 px-4">Listing Ref</th>
              <th class="py-3.5 px-4">Source Channel</th>
              <th class="py-3.5 px-4">Status</th>
              <th class="py-3.5 px-4">Last Activity</th>
              <th class="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="lead in pagedLeads" :key="lead.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-3 px-6 font-mono font-semibold text-slate-700">{{ lead.id }}</td>
              <td class="py-3 px-4 font-mono text-slate-500">{{ lead.listing_id }}</td>
              <td class="py-3 px-4 text-slate-500 capitalize font-medium">{{ lead.source }}</td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', lead.status === 'converted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : lead.status === 'contacted' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
                  {{ lead.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-400 font-medium">{{ formatDate(lead.last_activity_at) }}</td>
              <td class="py-3 px-6 text-right">
                <button 
                  @click="openViewingModal(lead)"
                  class="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1 rounded-xl text-[10px] shadow-sm transition-all"
                >
                  Log Viewing
                </button>
              </td>
            </tr>
            <tr v-if="filteredLeads.length === 0">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <div class="mb-2"><svg class="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
                No active leads currently assigned.
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

    <!-- Modal: Log Property Viewing -->
    <Teleport to="body">
      <div v-if="showViewingModal" class="modal-overlay">
        <div class="modal-container max-w-md">
          <div class="modal-header border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-slate-900 font-heading">Schedule &amp; Log Viewing</h3>
              <p class="text-xs text-slate-500">Record a walkthrough session or schedule one with the client.</p>
            </div>
            <button @click="showViewingModal = false" class="modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitViewing" class="space-y-4 pt-3">
            <div>
              <label class="form-label text-[10px]">Lead ID</label>
              <input :value="selectedLead?.id" type="text" disabled class="form-input text-xs bg-slate-50" />
            </div>
            <div>
              <label class="form-label text-[10px]">Scheduled Date &amp; Time</label>
              <input v-model="viewingForm.scheduled" type="datetime-local" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label text-[10px]">Staff Field Notes</label>
              <textarea v-model="viewingForm.notes" required placeholder="Enter walk-through feedback, client requirements, or details..." class="form-input h-24 text-xs resize-none"></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" @click="showViewingModal = false" class="btn border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs hover:bg-slate-50">Cancel</button>
              <button type="submit" :disabled="submitting" class="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50">Log Viewing</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
import { usePagination } from '@/composables/usePagination';

export default {
  name: 'LeadsView',
  setup() {
    const store = useAppStore();
    const showViewingModal = ref(false);
    const selectedLead = ref(null);
    const submitting = ref(false);
    const activeFilter = ref('all');
    const search = ref('');

    const viewingForm = reactive({
      notes: '',
      scheduled: ''
    });

    const leads = computed(() => store.leads || []);

    const filteredLeads = computed(() => {
      let list = leads.value;
      if (activeFilter.value === 'pending') {
        list = list.filter(l => l.status === 'pending' || l.status === 'new');
      } else if (activeFilter.value === 'contacted') {
        list = list.filter(l => l.status === 'contacted');
      }

      if (search.value.trim()) {
        const q = search.value.toLowerCase();
        list = list.filter(l => l.listing_id?.toLowerCase().includes(q));
      }
      return list;
    });

    const countStatus = (status) => {
      return leads.value.filter(l => l.status === status).length;
    };

    const loadData = async () => {
      await store.fetchLeads();
    };

    const openViewingModal = (lead) => {
      selectedLead.value = lead;
      viewingForm.notes = '';
      viewingForm.scheduled = '';
      showViewingModal.value = true;
    };

    const submitViewing = async () => {
      submitting.value = true;
      try {
        await store.createViewing(
          selectedLead.value.id,
          viewingForm.notes,
          viewingForm.scheduled ? new Date(viewingForm.scheduled) : new Date()
        );
        showViewingModal.value = false;
        store.success = 'Viewing logged successfully!';
      } catch (err) {
        store.error = err.message || 'Failed to log viewing';
      } finally {
        submitting.value = false;
      }
    };

    const formatDate = (dStr) => {
      if (!dStr) return '';
      const date = new Date(dStr);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    onMounted(loadData);

    const { paginatedItems: pagedLeads, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(filteredLeads);

    return {
      leads, filteredLeads, activeFilter, search,
      showViewingModal, selectedLead, submitting, viewingForm,
      countStatus, loadData, openViewingModal, submitViewing, formatDate,
      pagedLeads, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
