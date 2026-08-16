<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 border border-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            Team Management
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">Invited Parties</h1>
        <p class="text-xs text-slate-500 mt-1">Invite and manage agents, caretakers, and tenants for your properties.</p>
      </div>
      <!-- Stats pills -->
      <div class="flex items-center gap-3">
        <div class="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <p class="text-xl font-bold text-dark">{{ invitations.length }}</p>
          <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Sent</p>
        </div>
        <div class="text-center px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
          <p class="text-xl font-bold text-amber-700">{{ pendingCount }}</p>
          <p class="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Pending</p>
        </div>
        <div class="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <p class="text-xl font-bold text-emerald-700">{{ acceptedCount }}</p>
          <p class="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Accepted</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Create Invite Form -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
        <h2 class="text-sm font-bold font-heading text-dark mb-1">Send New Invitation</h2>
        <p class="text-[11px] text-slate-400 mb-5">The recipient will receive an elegant email with their acceptance link.</p>

        <form @submit.prevent="submitInvite" class="space-y-4">
          <div>
            <label class="form-label">Email Address</label>
            <input v-model="form.email" type="email" placeholder="person@example.com" required class="form-input" />
          </div>

          <div>
            <label class="form-label">Role Type</label>
            <select v-model="form.role" class="form-select">
              <option value="caretaker">Caretaker — Property Operations</option>
              <option value="agent">Agent — Rent &amp; Listings</option>
              <option value="tenant">Tenant</option>
              <option value="staff">Staff Member</option>
            </select>
          </div>

          <div>
            <label class="form-label">Target Property</label>
            <select v-model="form.propertyId" required class="form-select">
              <option value="" disabled>Select a property…</option>
              <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div v-if="form.role === 'tenant'" class="bg-brand-50/60 border border-brand-100 rounded-xl p-3 text-[11px] text-brand-700 leading-relaxed">
            💡 For tenants, you can also invite directly from the unit row on the Dashboard to pre-link the lease automatically.
          </div>

          <button type="submit" :disabled="loading || !form.propertyId" class="w-full bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 px-4 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm">
            {{ loading ? 'Sending invitation…' : 'Send Invitation Email' }}
          </button>

          <!-- Inline error -->
          <div v-if="formError" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{{ formError }}</span>
          </div>
        </form>
      </div>

      <!-- Invitations Table -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold font-heading text-dark">Sent Invitations</h2>
          <button @click="loadData" class="text-[11px] text-slate-500 hover:text-brand-600 font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th class="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th class="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                <th class="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th class="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="inv in pagedInvitations" :key="inv.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="py-3 pr-3">
                  <span class="text-xs font-semibold text-slate-800">{{ inv.email }}</span>
                </td>
                <td class="py-3 pr-3">
                  <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', roleChipClass(inv.role)]">
                    {{ inv.role }}
                  </span>
                </td>
                <td class="py-3 pr-3 text-[11px] text-slate-500">{{ getPropertyName(inv.property_id) }}</td>
                <td class="py-3 pr-3">
                  <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', statusChipClass(inv.status)]">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="py-3">
                  <button
                    v-if="inv.status === 'pending'"
                    @click="copyInviteLink(inv.token)"
                    title="Copy invite link"
                    class="flex items-center gap-1 text-[11px] text-brand-600 hover:text-brand-800 font-semibold hover:bg-brand-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy Link
                  </button>
                  <span v-else class="text-[10px] text-slate-300 font-medium">—</span>
                </td>
              </tr>
              <tr v-if="invitations.length === 0">
                <td colspan="5" class="py-12 text-center">
                  <div class="text-slate-300 mb-2">
                    <svg class="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <p class="text-xs font-semibold text-slate-400">No invitations sent yet</p>
                  <p class="text-[11px] text-slate-300 mt-0.5">Use the form on the left to invite your team.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { usePagination } from '@/composables/usePagination';
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'LandlordInvites',
  setup() {
    const store = useAppStore();
    const loading = ref(false);
    const formError = ref('');

    const properties = computed(() => store.properties);
    const invitations = computed(() => store.invitations);
    const pendingCount = computed(() => invitations.value.filter(i => i.status === 'pending').length);
    const acceptedCount = computed(() => invitations.value.filter(i => i.status === 'accepted').length);

    const form = reactive({
      email: '',
      role: 'caretaker',
      propertyId: ''
    });

    const loadData = async () => {
      await store.fetchProperties();
      if (properties.value.length > 0 && !form.propertyId) {
        form.propertyId = properties.value[0].id;
      }
      await store.fetchAllInvitations();
    };

    const submitInvite = async () => {
      loading.value = true;
      formError.value = '';
      try {
        await store.createInvitation(form.email, form.role, form.propertyId, '');
        form.email = '';
        await store.fetchAllInvitations();
      } catch (e) {
        formError.value = e.message || 'Failed to send invitation. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    const getPropertyName = (id) => {
      const p = properties.value.find(prop => prop.id === id);
      return p ? p.name : id ? 'Platform' : '—';
    };

    const roleChipClass = (role) => {
      const map = {
        caretaker: 'bg-purple-50 text-purple-700 border-purple-200',
        agent:     'bg-blue-50 text-blue-700 border-blue-200',
        tenant:    'bg-brand-100 text-brand-700 border-brand-200',
        staff:     'bg-slate-50 text-slate-600 border-slate-200',
      };
      return map[role] || 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const statusChipClass = (status) => {
      switch (status) {
        case 'pending':  return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'expired':  return 'bg-red-50 text-red-600 border-red-200';
        default:         return 'bg-slate-50 text-slate-500 border-slate-200';
      }
    };

    const copyInviteLink = (token) => {
      const base = import.meta.env.VITE_APP_URL || window.location.origin;
      const link = `${base}/invite/accept?token=${token}`;
      navigator.clipboard.writeText(link);
      store.success = 'Invite link copied to clipboard!';
    };

    onMounted(loadData);


    // Pagination: invitations
    const { paginatedItems: pagedInvitations, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(invitations);
    return {
      properties, invitations, pendingCount, acceptedCount,
      form, loading, formError,
      submitInvite, loadData,
      getPropertyName, roleChipClass, statusChipClass, copyInviteLink,  pagedInvitations, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
