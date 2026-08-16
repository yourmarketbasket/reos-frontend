<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Field Operations
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Field Representative Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage assigned leads, schedule property viewings, and review monthly conversion stats.</p>
      </div>
      <div>
        <span class="text-xs text-slate-400 font-semibold font-mono">Staff Console</span>
      </div>
    </div>

    <!-- Active Navigation Tabs -->
    <div class="flex gap-2 border-b border-slate-200 pb-3">
      <button 
        v-for="tab in ['leads', 'viewings', 'performance']" 
        :key="tab" 
        @click="activeTab = tab"
        :class="['text-xs font-bold px-4 py-2 rounded-xl transition-all capitalize', activeTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50']"
      >
        {{ tab === 'leads' ? 'Assigned Leads' : tab === 'viewings' ? 'Logged Viewings' : 'Performance & Vouchers' }}
      </button>
    </div>

    <!-- 1. Assigned Leads Tab -->
    <div v-if="activeTab === 'leads'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h2 class="font-bold text-slate-800 text-base">Client Leads Directory</h2>
        <p class="text-xs text-slate-500">Respond to customer inquiries and schedule walk-through viewings.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">Lead ID</th>
              <th class="py-2.5 px-4">Listing Ref</th>
              <th class="py-2.5 px-4">Source Channel</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4">Last Activity</th>
              <th class="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="lead in leads" :key="lead.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-mono font-semibold text-slate-700">{{ lead.id }}</td>
              <td class="py-3 px-4 font-mono">{{ lead.listing_id }}</td>
              <td class="py-3 px-4 text-slate-500 capitalize">{{ lead.source }}</td>
              <td class="py-3 px-4">
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-700 capitalize">
                  {{ lead.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-500">{{ formatDate(lead.last_activity_at) }}</td>
              <td class="py-3 px-4 text-right">
                <button 
                  @click="openViewingModal(lead)"
                  class="bg-indigo-55 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                >
                  Log Viewing
                </button>
              </td>
            </tr>
            <tr v-if="leads.length === 0">
              <td colspan="6" class="text-center py-12 text-slate-400 text-xs">
                No active leads currently assigned to you.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Logged Viewings Tab -->
    <div v-if="activeTab === 'viewings'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h2 class="font-bold text-slate-800 text-base">Logged Property Walkthroughs</h2>
        <p class="text-xs text-slate-500">View historic viewing events scheduled or completed with clients.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">Viewing ID</th>
              <th class="py-2.5 px-4">Lead ID</th>
              <th class="py-2.5 px-4">Scheduled Date</th>
              <th class="py-2.5 px-4">Caretaker / Agent Notes</th>
              <th class="py-2.5 px-4">Logged At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="v in viewings" :key="v.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-mono font-semibold text-slate-700">{{ v.id }}</td>
              <td class="py-3 px-4 font-mono">{{ v.lead_id }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">{{ new Date(v.scheduled).toLocaleDateString() }} - {{ new Date(v.scheduled).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</td>
              <td class="py-3 px-4 text-slate-600 max-w-sm truncate" :title="v.notes">{{ v.notes }}</td>
              <td class="py-3 px-4 text-slate-500">{{ new Date(v.logged_at).toLocaleDateString() }}</td>
            </tr>
            <tr v-if="viewings.length === 0">
              <td colspan="5" class="text-center py-12 text-slate-400 text-xs">
                No viewings scheduled yet. Click "Log Viewing" in the leads tab.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. Performance & Vouchers Tab -->
    <div v-if="activeTab === 'performance'" class="space-y-6">
      <!-- Performance summary cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Satisfaction Rating</span>
          <span class="text-2xl font-black text-amber-500 mt-2 block">★ 4.8 / 5.0</span>
          <span class="text-[9px] text-slate-400 mt-2 block font-semibold">Based on 15 settled clients</span>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Commissions Earned</span>
          <span class="text-2xl font-black text-emerald-600 mt-2 block">KES {{ formatCurrency(stats?.commissions_earned || 24000) }}</span>
          <span class="text-[9px] text-slate-400 mt-2 block font-semibold">Paid out directly to bank wallet</span>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Draft Properties Submitted</span>
          <span class="text-2xl font-black text-slate-800 mt-2 block">{{ stats?.properties_submitted || 2 }} Properties</span>
          <span class="text-[9px] text-slate-400 mt-2 block font-semibold">Awaiting principal admin listing check</span>
        </div>
      </div>

      <!-- Commissions detail table -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 class="font-bold text-slate-800 text-base">Your Commissions Ledger</h2>
          <p class="text-xs text-slate-500">Audit report of all referral commissions paid or pending approval.</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-2.5 px-4">Voucher ID</th>
                <th class="py-2.5 px-4">Listing Ref</th>
                <th class="py-2.5 px-4">Earned Amount</th>
                <th class="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="c in commissions" :key="c.id" class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-mono font-semibold text-slate-700">{{ c.id }}</td>
                <td class="py-3 px-4 font-mono">{{ c.listing_id }}</td>
                <td class="py-3 px-4 font-bold text-slate-800">KES {{ formatCurrency(c.amount) }}</td>
                <td class="py-3 px-4">
                  <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', c.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
                    {{ c.status }}
                  </span>
                </td>
              </tr>
              <tr v-if="commissions.length === 0">
                <td colspan="4" class="text-center py-12 text-slate-400 text-xs">
                  No commissions ledger recorded.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Log Property Viewing -->
    <Teleport to="body">
      <div v-if="showViewingModal" class="modal-overlay">
        <div class="modal-backdrop" @click="showViewingModal = false"></div>
        <div class="modal-panel max-w-md">
          <div class="modal-header border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold text-slate-900 font-heading">Schedule / Log Viewing</h3>
            <button @click="showViewingModal = false" class="text-slate-400 hover:text-slate-700 p-1">
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
              <button type="button" @click="showViewingModal = false" class="btn border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs">Cancel</button>
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

export default {
  name: 'StaffDashboard',
  setup() {
    const store = useAppStore();
    const activeTab = ref('leads');
    const showViewingModal = ref(false);
    const selectedLead = ref(null);
    const submitting = ref(false);

    const viewingForm = reactive({
      notes: '',
      scheduled: ''
    });

    const stats = computed(() => store.dashboardStats);
    const leads = computed(() => store.leads);
    const viewings = computed(() => store.viewings);
    const commissions = computed(() => store.commissions);

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchLeads();
      await store.fetchCommissions();
      await store.fetchViewings();
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
        await store.fetchViewings();
      } catch (err) {
        alert(err.message);
      } finally {
        submitting.value = false;
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatDate = (dStr) => {
      if (!dStr) return '';
      const date = new Date(dStr);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    onMounted(loadData);

    return {
      activeTab,
      showViewingModal,
      selectedLead,
      viewingForm,
      submitting,
      stats,
      leads,
      viewings,
      commissions,
      openViewingModal,
      submitViewing,
      formatCurrency,
      formatDate
    };
  }
};
</script>
