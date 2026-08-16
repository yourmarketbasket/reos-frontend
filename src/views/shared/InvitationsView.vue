<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 border border-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            Invitations
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">Team &amp; Invitations</h1>
        <p class="text-xs text-slate-500 mt-1">Manage invitations sent from your account — track, resend, or revoke.</p>
      </div>
      <button @click="showModal = true" class="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex-shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Send Invitation
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div v-for="s in stats" :key="s.label"
        :class="['bg-white border rounded-xl p-4 cursor-pointer transition-all', activeFilter === s.filter ? `${s.activeBorder} shadow-sm` : 'border-slate-100 hover:border-slate-200']"
        @click="activeFilter = s.filter">
        <p :class="['text-xl font-bold', s.color]">{{ s.value }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{{ s.label }}</p>
        <div v-if="activeFilter === s.filter" :class="['mt-2 h-0.5 rounded-full', s.bar]"></div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <button v-for="f in filters" :key="f.key"
            @click="activeFilter = f.key"
            :class="['text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors', activeFilter === f.key ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'text-slate-500 hover:bg-slate-50']">
            {{ f.label }} <span class="ml-0.5 opacity-60">{{ f.count }}</span>
          </button>
        </div>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="search" type="text" placeholder="Search email…" class="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 bg-slate-50 w-48" />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/60 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sent</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expires</th>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="inv in pagedFilteredInvitations" :key="inv.token" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-3.5">
                <p class="text-xs font-semibold text-slate-800">{{ inv.email }}</p>
              </td>
              <td class="px-4 py-3.5">
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', roleChip(inv.role)]">
                  {{ inv.role }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-[11px] text-slate-400">
                {{ getPropertyName(inv.property_id) }}
              </td>
              <td class="px-4 py-3.5">
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', statusChip(inv.status)]">
                  {{ inv.status }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-[11px] text-slate-400 whitespace-nowrap">{{ formatDate(inv.created_at) }}</td>
              <td class="px-4 py-3.5">
                <span :class="['text-[11px] whitespace-nowrap', isExpiringSoon(inv) ? 'text-amber-600 font-semibold' : 'text-slate-400']">
                  {{ formatDate(inv.expires_at) }}
                </span>
              </td>
              <td class="px-6 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <!-- Copy link (pending only) -->
                  <button v-if="inv.status === 'pending'" @click="copyLink(inv.token)" title="Copy invite link"
                    class="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                  <!-- Resend (not accepted) -->
                  <button v-if="inv.status !== 'accepted'" @click="handleResend(inv.token)" :disabled="actionLoading === inv.token" title="Resend invitation email"
                    class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                  <!-- Revoke (pending or expired only) -->
                  <button v-if="inv.status === 'pending' || inv.status === 'expired'" @click="confirmRevoke(inv)" title="Revoke invitation"
                    class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvitations.length === 0">
              <td colspan="7" class="px-6 py-16 text-center">
                <div class="text-slate-200 mb-3">
                  <svg class="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <p class="text-sm font-semibold text-slate-400">No invitations found</p>
                <p class="text-xs text-slate-300 mt-1">Try a different filter or send your first invitation.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Active Team Performance Tracker -->
    <div class="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-800 font-heading">Active Team Performance</h2>
        <p class="text-xs text-slate-500 mt-0.5">Real-time stats tracking assigned clients, walkthroughs, listed inventory, and commissions.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4">Member Email</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4 text-center">Assigned Leads</th>
              <th class="py-3 px-4 text-center">Walkthroughs</th>
              <th class="py-3 px-4 text-center">Deals Closed</th>
              <th class="py-3 px-4 text-center">Properties Added</th>
              <th class="py-3 px-4 text-right">Commissions Paid</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="member in teamList" :key="member.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-700">{{ member.email || member.staff_user_id }}</div>
                <div class="text-[9px] text-slate-400 mt-0.5">ID: {{ member.staff_user_id }}</div>
              </td>
              <td class="py-3 px-4">
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 border-indigo-200 text-indigo-700 capitalize">
                  {{ member.principal_type }} ({{ member.status }})
                </span>
              </td>
              <td class="py-3 px-4 text-center font-bold text-slate-600">{{ member.leads_count }}</td>
              <td class="py-3 px-4 text-center font-bold text-slate-600">{{ member.viewings_count }}</td>
              <td class="py-3 px-4 text-center font-bold text-emerald-600">{{ member.deals_closed }}</td>
              <td class="py-3 px-4 text-center font-bold text-slate-600">{{ member.properties_count }}</td>
              <td class="py-3 px-4 text-right font-bold text-slate-800">KES {{ member.total_earnings.toLocaleString() }}</td>
            </tr>
            <tr v-if="teamList.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400">
                No active team members recorded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Send Invitation Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <h3 class="text-base font-bold text-slate-900 font-heading">Send Invitation</h3>
              <p class="text-xs text-slate-500 mt-0.5">An invitation email will be delivered to the recipient.</p>
            </div>
            <button @click="closeModal" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitInvite" class="space-y-4">
            <div>
              <label class="form-label">Email Address</label>
              <input v-model="form.email" type="email" required placeholder="person@example.com" class="form-input" />
            </div>
            <div>
              <label class="form-label">Role</label>
              <select v-model="form.role" class="form-select">
                <option v-for="r in allowedRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div v-if="requiresProperty">
              <label class="form-label">Property</label>
              <select v-model="form.propertyId" required class="form-select">
                <option value="" disabled>Select property…</option>
                <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <!-- Inline error -->
            <div v-if="formError" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{{ formError }}</span>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="closeModal" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" :disabled="formLoading" class="flex-1 bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                {{ formLoading ? 'Sending…' : 'Send Invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Revoke confirm modal -->
    <Teleport to="body">
      <div v-if="revokeTarget" class="modal-overlay">
        <div class="modal-container max-w-sm">
          <div class="text-center py-2">
            <div class="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 font-heading">Revoke Invitation?</h3>
            <p class="text-xs text-slate-500 mt-1.5">The invitation for <strong>{{ revokeTarget?.email }}</strong> will be invalidated immediately. The recipient won't be able to use their link.</p>
          </div>
          <div class="flex gap-3 mt-5">
            <button @click="revokeTarget = null" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            <button @click="handleRevoke" :disabled="actionLoading" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
              {{ actionLoading ? 'Revoking…' : 'Yes, Revoke' }}
            </button>
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
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'InvitationsView',
  setup() {
    const store = useAppStore();
    const showModal = ref(false);
    const formLoading = ref(false);
    const formError = ref('');
    const actionLoading = ref(null);
    const revokeTarget = ref(null);
    const activeFilter = ref('all');
    const search = ref('');

    const form = reactive({ email: '', role: '', propertyId: '' });

    const userRole = computed(() => store.user?.role || '');
    const invitations = computed(() => store.invitations || []);
    const properties = computed(() => store.properties || []);

    const adminRoles = ['superadmin', 'technical_admin', 'support_admin', 'billing_admin'];
    const isAdmin = computed(() => adminRoles.includes(userRole.value));

    const allowedRoles = computed(() => {
      if (isAdmin.value) return [
        { value: 'technical_admin', label: 'Technical Admin' },
        { value: 'support_admin', label: 'Support Admin' },
        { value: 'billing_admin', label: 'Billing Admin' },
        { value: 'landlord', label: 'Landlord' },
        { value: 'agent', label: 'Agent' },
        { value: 'caretaker', label: 'Caretaker' },
        { value: 'tenant', label: 'Tenant' },
      ];
      if (userRole.value === 'landlord') return [
        { value: 'caretaker', label: 'Caretaker — Property Operations' },
        { value: 'agent', label: 'Agent — Rent & Listings' },
        { value: 'tenant', label: 'Tenant' },
        { value: 'staff', label: 'Staff Member' },
      ];
      // agent
      return [
        { value: 'tenant', label: 'Tenant' },
        { value: 'caretaker', label: 'Caretaker' },
        { value: 'staff', label: 'Staff' },
      ];
    });

    // Platform admins don't need a property for admin-role invites
    const requiresProperty = computed(() => {
      return form.role === 'tenant';
    });

    watch(() => allowedRoles.value, (roles) => {
      if (roles.length && !form.role) form.role = roles[0].value;
    }, { immediate: true });

    const filters = computed(() => [
      { key: 'all', label: 'All', count: invitations.value.length },
      { key: 'pending', label: 'Pending', count: invitations.value.filter(i => i.status === 'pending').length },
      { key: 'accepted', label: 'Accepted', count: invitations.value.filter(i => i.status === 'accepted').length },
      { key: 'expired', label: 'Expired', count: invitations.value.filter(i => i.status === 'expired').length },
      { key: 'revoked', label: 'Revoked', count: invitations.value.filter(i => i.status === 'revoked').length },
    ]);

    const stats = computed(() => [
      { label: 'Total', value: invitations.value.length, filter: 'all', color: 'text-slate-800', activeBorder: 'border-slate-300', bar: 'bg-slate-300' },
      { label: 'Pending', value: invitations.value.filter(i => i.status === 'pending').length, filter: 'pending', color: 'text-amber-600', activeBorder: 'border-amber-300', bar: 'bg-amber-400' },
      { label: 'Accepted', value: invitations.value.filter(i => i.status === 'accepted').length, filter: 'accepted', color: 'text-emerald-600', activeBorder: 'border-emerald-300', bar: 'bg-emerald-400' },
      { label: 'Expired', value: invitations.value.filter(i => i.status === 'expired').length, filter: 'expired', color: 'text-slate-500', activeBorder: 'border-slate-300', bar: 'bg-slate-300' },
      { label: 'Revoked', value: invitations.value.filter(i => i.status === 'revoked').length, filter: 'revoked', color: 'text-red-500', activeBorder: 'border-red-300', bar: 'bg-red-400' },
    ]);

    const filteredInvitations = computed(() => {
      let list = activeFilter.value === 'all'
        ? invitations.value
        : invitations.value.filter(i => i.status === activeFilter.value);
      if (search.value.trim()) {
        const q = search.value.toLowerCase();
        list = list.filter(i => i.email?.toLowerCase().includes(q) || i.role?.toLowerCase().includes(q));
      }
      return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });

    const getPropertyName = (id) => {
      if (!id) return '—';
      const p = properties.value.find(p => p.id === id);
      return p ? p.name : 'Platform';
    };

    const roleChip = (role) => {
      const map = {
        caretaker: 'bg-purple-50 text-purple-700 border-purple-200',
        agent: 'bg-blue-50 text-blue-700 border-blue-200',
        tenant: 'bg-brand-100 text-brand-700 border-brand-200',
        staff: 'bg-slate-50 text-slate-600 border-slate-200',
        landlord: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        technical_admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        support_admin: 'bg-sky-50 text-sky-700 border-sky-200',
        billing_admin: 'bg-violet-50 text-violet-700 border-violet-200',
      };
      return map[role] || 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const statusChip = (status) => ({
      pending:  'bg-amber-50 text-amber-700 border-amber-200',
      accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      expired:  'bg-slate-100 text-slate-500 border-slate-200',
      revoked:  'bg-red-50 text-red-600 border-red-200',
    }[status] || 'bg-slate-50 text-slate-400 border-slate-200');

    const formatDate = (dt) => {
      if (!dt) return '—';
      return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    const isExpiringSoon = (inv) => {
      if (inv.status !== 'pending' || !inv.expires_at) return false;
      return (new Date(inv.expires_at) - new Date()) < 48 * 3600 * 1000;
    };

    const copyLink = (token) => {
      const base = import.meta.env.VITE_APP_URL || window.location.origin;
      navigator.clipboard.writeText(`${base}/invite/accept?token=${token}`);
      store.success = 'Invite link copied to clipboard!';
    };

    const closeModal = () => {
      showModal.value = false;
      formError.value = '';
      form.email = '';
      form.propertyId = '';
    };

    const submitInvite = async () => {
      formError.value = '';
      formLoading.value = true;
      try {
        const propertyId = requiresProperty.value ? form.propertyId : '';
        await store.createInvitation(form.email, form.role, propertyId, '');
        closeModal();
        await store.fetchAllInvitations();
      } catch (e) {
        formError.value = e.message || 'Failed to send invitation.';
      } finally {
        formLoading.value = false;
      }
    };

    const confirmRevoke = (inv) => { revokeTarget.value = inv; };

    const handleRevoke = async () => {
      if (!revokeTarget.value) return;
      actionLoading.value = revokeTarget.value.token;
      try {
        await store.revokeInvitation(revokeTarget.value.token);
        revokeTarget.value = null;
      } catch (e) {
        store.error = e.message || 'Failed to revoke invitation.';
      } finally {
        actionLoading.value = null;
      }
    };

    const handleResend = async (token) => {
      actionLoading.value = token;
      try {
        await store.resendInvitation(token);
      } catch (e) {
        store.error = e.message || 'Failed to resend invitation.';
      } finally {
        actionLoading.value = null;
      }
    };

    onMounted(async () => {
      await store.fetchProperties();
      await store.fetchAllInvitations();
      await store.fetchTeam();
    });

    const teamList = computed(() => store.team || []);

    // --- Pagination ---
    const { paginatedItems: pagedFilteredInvitations, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(filteredInvitations);
    return {
      showModal, formLoading, formError, actionLoading, revokeTarget,
      activeFilter, search, form,
      filters, stats, filteredInvitations, properties, allowedRoles, requiresProperty,
      getPropertyName, roleChip, statusChip, formatDate, isExpiringSoon,
      copyLink, closeModal, submitInvite, confirmRevoke, handleRevoke, handleResend, pagedFilteredInvitations, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage,
      teamList
    };
  }
};
</script>
