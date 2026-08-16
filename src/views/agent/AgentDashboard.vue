<template>
  <div class="space-y-8 animate-fade-in pb-12">
    <!-- Header banner -->
    <div class="flex justify-between items-center bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-slate-800">Agent Workspace</h1>
        <p class="text-xs text-slate-500 mt-1">Manage assigned property portfolios, inbound client inquiries, viewings, and staff invitations.</p>
      </div>
      <div class="flex gap-2">
        <button @click="showInviteStaffModal = true" class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-md">
          Invite Field Staff
        </button>
      </div>
    </div>

    <!-- Agent Telemetry Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Properties</span>
        <span class="text-2xl font-bold font-heading text-slate-800 mt-2 block">{{ stats?.assigned_properties || 0 }}</span>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Active portfolio scope</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inbound Inquiries</span>
        <span class="text-2xl font-bold font-heading text-indigo-600 mt-2 block">{{ stats?.inquiries_count || 0 }}</span>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Lease interest leads logged</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Viewings Logged</span>
        <span class="text-2xl font-bold font-heading text-slate-800 mt-2 block">{{ stats?.viewings_logged || 0 }}</span>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Logged physical tours</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Commission Earnings</span>
        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-xs text-slate-500 font-semibold">KES</span>
          <span class="text-2xl font-bold font-heading text-emerald-600">{{ formatCurrency(stats?.commissions_earned || 0) }}</span>
        </div>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Pending final clearance</p>
      </div>
    </div>

    <!-- Assigned Listings and Leads layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 class="text-sm font-bold font-heading text-slate-800 mb-6 uppercase tracking-wider flex justify-between items-center">
          <span>Assigned Properties & Status</span>
        </h2>

        <div v-if="properties.length === 0" class="text-center py-10 text-xs text-slate-400 font-medium">
          No properties currently assigned to your scope.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <th class="pb-3 font-semibold">Property Name</th>
                <th class="pb-3 font-semibold">Jurisdiction County</th>
                <th class="pb-3 font-semibold text-right">Default Commission Rate</th>
                <th class="pb-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs">
              <tr v-for="prop in pagedAgentProperties" :key="prop.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="py-3.5 font-bold text-slate-800">{{ prop.name }}</td>
                <td class="py-3.5 text-slate-500">{{ prop.jurisdiction }}</td>
                <td class="py-3.5 text-right font-semibold text-slate-700">5.0% on sign</td>
                <td class="py-3.5 text-center">
                  <span class="badge text-[9px] badge-success">Active Listing</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inquiries/Leads desk widget -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 class="font-heading font-bold text-slate-800 text-sm uppercase tracking-wider">Client Inquiries Pool</h3>
        
        <div v-if="leads.length === 0" class="text-center py-6 text-[10px] text-slate-400 font-medium">
          No client inquiries logged yet.
        </div>
        <div v-else class="space-y-3">
          <div v-for="lead in leads" :key="lead.id" class="p-3.5 border border-slate-100 rounded-xl space-y-2 hover:border-slate-200 transition-colors">
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold text-slate-800">Lead: {{ lead.id.slice(0, 8) }}</span>
              <span class="badge text-[9px] badge-warning capitalize">{{ lead.status }}</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium">Source channel: {{ lead.source }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Invite Staff -->
    <Teleport to="body">
      <div v-if="showInviteStaffModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Invite Field Representative Staff</h3>
          <button @click="showInviteStaffModal = false" class="modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form @submit.prevent="submitInviteStaff" class="space-y-4">
          <div>
            <label class="form-label">Staff Email Address</label>
            <input v-model="staffForm.email" type="email" placeholder="staff@example.com" required class="form-input text-xs" />
          </div>
          <div>
            <label class="form-label">Phone Number</label>
            <input v-model="staffForm.phone" type="text" placeholder="+2547XXXXXXXX" required class="form-input text-xs" />
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showInviteStaffModal = false" class="btn border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs px-4 py-2 font-semibold">Cancel</button>
            <button type="submit" class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs px-4 py-2 font-semibold">Send Invitation</button>
          </div>
        </form>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();

    const showInviteStaffModal = ref(false);

    const properties = computed(() => store.properties);
    const leads = computed(() => store.leads);
    const stats = computed(() => store.dashboardStats);

    const staffForm = reactive({
      email: '',
      phone: ''
    });

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchProperties();
      await store.fetchLeads();
    };

    const submitInviteStaff = async () => {
      try {
        const pIds = properties.value.map(p => p.id);
        await store.inviteStaff(staffForm.email, staffForm.phone, pIds, ['Nairobi']);
        showInviteStaffModal.value = false;
        staffForm.email = '';
        staffForm.phone = '';
        await loadData();
      } catch (e) {
        // error
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(loadData);


    // Pagination: properties
    const { paginatedItems: pagedAgentProperties, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(properties);
    return {
      stats,
      properties,
      leads,
      showInviteStaffModal,
      staffForm,
      submitInviteStaff,
      formatCurrency, pagedAgentProperties, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
