<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Superadmin
          </span>
        </div>
        <h1 class="text-2xl font-bold text-dark">Platform Control Center</h1>
        <p class="text-sm text-slate-500 mt-0.5">System-wide oversight, configurations, and platform operations</p>
      </div>
      <button @click="showInviteModal = true" class="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-dark font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/10">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
        Invite Admin
      </button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in metrics" :key="card.label" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ card.label }}</p>
            <p class="text-3xl font-bold mt-1.5" :class="card.color">{{ card.value }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ card.sub }}</p>
          </div>
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', card.bg]">
            <component :is="card.icon" class="w-5 h-5" :class="card.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Gateway Status -->
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-800">Payment Gateway Health</h2>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Status</span>
        </div>
        <div class="space-y-3">
          <div v-for="gw in gateways" :key="gw.name" class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3">
              <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', gw.active ? 'bg-emerald-500' : 'bg-slate-300']"></span>
              <div>
                <p class="text-sm font-bold text-slate-700">{{ gw.name }}</p>
                <p class="text-[10px] text-slate-400">{{ gw.region }} · {{ gw.method }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 text-right">
              <div>
                <p class="text-xs font-semibold text-slate-600">{{ gw.uptime }}</p>
                <p class="text-[10px] text-slate-400">uptime</p>
              </div>
              <span :class="['text-[10px] font-bold px-2 py-1 rounded-full', gw.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200']">{{ gw.active ? 'ACTIVE' : 'INACTIVE' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Invitation Stats card -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-800">Admin Invitations</h2>
          <button @click="showInviteModal = true" class="text-[11px] font-bold text-brand-600 hover:text-brand-800 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors">+ Invite</button>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-semibold text-slate-600">Total Sent</span>
            <span class="text-sm font-bold text-dark">{{ invitations.length }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span class="text-xs font-semibold text-amber-700">Pending</span>
            <span class="text-sm font-bold text-amber-700">{{ pendingInviteCount }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="text-xs font-semibold text-emerald-700">Accepted</span>
            <span class="text-sm font-bold text-emerald-700">{{ acceptedInviteCount }}</span>
          </div>
        </div>
        <!-- Recent invites -->
        <div class="mt-4 space-y-2">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent</p>
          <div v-for="inv in recentInvitations" :key="inv.id" class="flex items-center justify-between">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-700 truncate">{{ inv.email }}</p>
              <p class="text-[10px] text-slate-400 capitalize">{{ inv.role }}</p>
            </div>
            <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ml-2', inv.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : inv.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200']">{{ inv.status }}</span>
          </div>
          <p v-if="recentInvitations.length === 0" class="text-[11px] text-slate-300 text-center py-3">No invitations yet</p>
        </div>
      </div>
    </div>

    <!-- Audit log preview -->
    <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-slate-800">Recent Audit Events</h2>
        <button class="text-xs font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2">View Full Log</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Action</th>
              <th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Actor</th>
              <th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Target</th>
              <th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="log in pagedAuditLog" :key="log.id" class="hover:bg-slate-50/50">
              <td class="py-2.5 pr-4">
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md', log.actionClass]">{{ log.action }}</span>
              </td>
              <td class="py-2.5 pr-4 text-xs text-slate-600 font-medium">{{ log.actor }}</td>
              <td class="py-2.5 pr-4 text-xs text-slate-500">{{ log.target }}</td>
              <td class="py-2.5 text-[10px] text-slate-400">{{ log.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invite Admin Modal -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <div>
              <h3 class="text-base font-bold text-slate-900 font-heading">Invite System Administrator</h3>
              <p class="text-xs text-slate-500 mt-0.5">An invitation email will be sent to the recipient</p>
            </div>
            <button @click="showInviteModal = false" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="sendAdminInvite" class="space-y-4">
            <div>
              <label class="form-label">Email Address</label>
              <input v-model="inviteForm.email" type="email" required class="form-input" placeholder="admin@example.com" />
            </div>
            <div>
              <label class="form-label">Admin Role</label>
              <select v-model="inviteForm.role" required class="form-select">
                <option value="">Select admin role…</option>
                <option value="technical_admin">Technical Admin</option>
                <option value="support_admin">Support Admin</option>
                <option value="billing_admin">Billing Admin</option>
              </select>
            </div>
            <!-- Inline error -->
            <div v-if="inviteError" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{{ inviteError }}</span>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showInviteModal = false" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" :disabled="inviteLoading" class="flex-1 bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                {{ inviteLoading ? 'Sending…' : 'Send Invitation' }}
              </button>
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
import { ref, h, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

const IconUsers = (_, ctx) => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.8', ...ctx.attrs }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })]);
const IconBuilding = (_, ctx) => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.8', ...ctx.attrs }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })]);
const IconCash = (_, ctx) => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.8', ...ctx.attrs }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })]);
const IconAlert = (_, ctx) => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.8', ...ctx.attrs }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })]);

export default {
  name: 'AdminDashboard',
  setup() {
    const store = useAppStore();
    const showInviteModal = ref(false);
    const inviteLoading = ref(false);
    const inviteError = ref('');
    const inviteForm = ref({ email: '', role: '' });

    const metrics = [
      { label: 'Total Users', value: '—', sub: 'All roles combined', color: 'text-slate-800', bg: 'bg-brand-100/40', icon: IconUsers, iconColor: 'text-brand-500' },
      { label: 'Active Properties', value: '—', sub: 'Across all landlords', color: 'text-slate-800', bg: 'bg-brand-100/40', icon: IconBuilding, iconColor: 'text-brand-500' },
      { label: 'GMV (30d)', value: '—', sub: 'Gross transaction value', color: 'text-slate-800', bg: 'bg-brand-100/40', icon: IconCash, iconColor: 'text-brand-500' },
      { label: 'Open Disputes', value: '—', sub: 'Awaiting resolution', color: 'text-red-600', bg: 'bg-red-50', icon: IconAlert, iconColor: 'text-red-500' },
    ];

    const gateways = [
      { name: 'Daraja (M-Pesa)', region: 'KE', method: 'Mobile Money', active: true, uptime: '99.8%' },
      { name: 'Paystack', region: 'NG / KE', method: 'Card', active: true, uptime: '99.5%' },
      { name: 'Pesapal', region: 'EA', method: 'Card / Mobile', active: false, uptime: '97.2%' },
      { name: 'IntaSend', region: 'KE', method: 'Aggregator', active: true, uptime: '98.9%' },
    ];

    const disputes = [
      { id: 1, type: 'Deposit Claim', parties: 'John O. vs Landlord K.', status: 'ESCALATED', urgentClass: 'bg-red-50 text-red-700 border-red-200' },
      { id: 2, type: 'Payment Dispute', parties: 'Tenant A. vs Agent B.', status: 'UNDER REVIEW', urgentClass: 'bg-amber-50 text-amber-700 border-amber-200' },
      { id: 3, type: 'Maintenance', parties: 'Unit 4B, Westlands', status: 'OPEN', urgentClass: 'bg-purple-50 text-purple-700 border-purple-200' },
    ];

    const auditLog = [
      { id: 1, action: 'USER_SUSPENDED', actor: 'Superadmin', target: 'user@email.com', time: '2 min ago', actionClass: 'bg-red-50 text-red-700 border border-red-200' },
      { id: 2, action: 'GATEWAY_TOGGLED', actor: 'Superadmin', target: 'Pesapal → inactive', time: '14 min ago', actionClass: 'bg-amber-50 text-amber-700 border border-amber-200' },
      { id: 3, action: 'TIER_CONFIG_EDIT', actor: 'Superadmin', target: 'Tier 2 cap 500→600', time: '1h ago', actionClass: 'bg-purple-50 text-purple-700 border border-purple-200' },
      { id: 4, action: 'DISPUTE_RESOLVED', actor: 'Support Admin', target: 'DIS-0047', time: '3h ago', actionClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    ];

    const sendAdminInvite = async () => {
      inviteError.value = '';
      try {
        inviteLoading.value = true;
        await store.createInvitation(inviteForm.value.email, inviteForm.value.role, null);
        store.success = `Admin invitation email sent to ${inviteForm.value.email}`;
        inviteForm.value = { email: '', role: '' };
        showInviteModal.value = false;
        await store.fetchAllInvitations();
      } catch (e) {
        inviteError.value = e.message || 'Failed to send invitation. Please try again.';
      } finally {
        inviteLoading.value = false;
      }
    };

    const invitations = computed(() => store.invitations);
    const pendingInviteCount = computed(() => invitations.value.filter(i => i.status === 'pending').length);
    const acceptedInviteCount = computed(() => invitations.value.filter(i => i.status === 'accepted').length);
    const recentInvitations = computed(() => invitations.value.slice(-5).reverse());

    onMounted(() => store.fetchAllInvitations());


    // Pagination: auditLog
    const { paginatedItems: pagedAuditLog, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(auditLog);
    return { metrics, gateways, disputes, auditLog, showInviteModal, inviteForm, inviteLoading, inviteError, sendAdminInvite, invitations, pendingInviteCount, acceptedInviteCount, recentInvitations, pagedAuditLog, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage };
  }
};
</script>
