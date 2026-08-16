<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h2 class="font-heading text-2xl font-bold text-slate-800">Tenant Applications &amp; Matching</h2>
        <p class="text-xs text-slate-500 mt-1">Review tenant profiles, credit metrics, and manage lease matching decisions.</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-xs text-slate-500 font-medium">{{ filteredApplications.length }} application{{ filteredApplications.length !== 1 ? 's' : '' }}</span>
        <select v-model="statusFilter" class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search applicants..."
          class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-44 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredApplications.length === 0" class="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
      <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-slate-800">No applications found</h3>
        <p class="text-xs text-slate-400 mt-1">Try adjusting your search or status filter.</p>
      </div>
    </div>

    <!-- Applications Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/70">
              <th
                v-for="col in columns"
                :key="col.key"
                @click="col.sortable && sortBy(col.key)"
                :class="['px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap', col.sortable ? 'cursor-pointer hover:text-slate-600' : '']"
              >
                <span class="flex items-center gap-1">
                  {{ col.label }}
                  <span v-if="col.sortable" class="text-slate-300">
                    <span v-if="sortKey === col.key">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                    <span v-else>⇅</span>
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="app in pagedSortedApplications"
              :key="app.id"
              @click="openModal(app)"
              class="border-b border-slate-50 last:border-none hover:bg-blue-50/40 cursor-pointer transition-colors group"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    :style="{ background: avatarColor(app.tenant_name) }"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase"
                  >{{ app.tenant_name.charAt(0) }}</div>
                  <div>
                    <p class="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{{ app.tenant_name }}</p>
                    <p class="text-[10px] text-slate-400">{{ app.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="text-xs text-slate-700 font-semibold max-w-[180px] truncate">{{ app.listing_title }}</p>
                <p class="text-[10px] text-slate-400">{{ app.property_type }}</p>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      :style="{ width: app.match_score + '%' }"
                      :class="['h-full rounded-full', app.match_score >= 80 ? 'bg-emerald-500' : app.match_score >= 50 ? 'bg-amber-500' : 'bg-rose-500']"
                    ></div>
                  </div>
                  <span :class="['text-xs font-extrabold', app.match_score >= 80 ? 'text-emerald-600' : app.match_score >= 50 ? 'text-amber-600' : 'text-rose-600']">{{ app.match_score }}%</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['text-xs font-bold', app.credit_score >= 700 ? 'text-emerald-600' : app.credit_score >= 620 ? 'text-amber-600' : 'text-rose-600']">{{ app.credit_score }}</span>
                <span class="text-[10px] text-slate-400 ml-1">({{ getCreditGrade(app.credit_score) }})</span>
              </td>
              <td class="px-4 py-3">
                <span :class="['text-xs font-bold', app.income_rent_ratio >= 3 ? 'text-emerald-600' : 'text-amber-600']">{{ app.income_rent_ratio }}x</span>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600 font-medium">{{ app.occupants }}</td>
              <td class="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{{ app.applied_at }}</td>
              <td class="px-4 py-3">
                <span
                  :class="['text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full',
                    app.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    app.status === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    'bg-amber-100 text-amber-700 border border-amber-200']"
                >{{ app.status }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-[10px] text-blue-500 font-semibold group-hover:text-blue-700 transition-colors">View →</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="selectedApp"
          class="modal-overlay"
          @click.self="closeModal"
        >
          <div class="modal-backdrop" @click="closeModal"></div>
          <div class="modal-panel">
            <!-- Top accent bar -->
            <div :class="['modal-accent', selectedApp.match_score >= 80 ? 'accent-green' : selectedApp.match_score >= 50 ? 'accent-amber' : 'accent-rose']"></div>

            <div class="p-6 space-y-6">
              <!-- Header row -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div
                    :style="{ background: avatarColor(selectedApp.tenant_name) }"
                    class="modal-avatar"
                  >{{ selectedApp.tenant_name.charAt(0) }}</div>
                  <div>
                    <h3 class="text-lg font-extrabold text-slate-800">{{ selectedApp.tenant_name }}</h3>
                    <p class="text-xs text-slate-400">{{ selectedApp.email }} · {{ selectedApp.phone }}</p>
                    <p class="text-xs font-semibold text-slate-600 mt-0.5">{{ selectedApp.employment }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span :class="['text-[10px] font-extrabold px-2.5 py-1 rounded-lg border',
                    selectedApp.match_score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    selectedApp.match_score >= 50 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-rose-50 border-rose-200 text-rose-700']"
                  >🤖 {{ selectedApp.match_score }}% Match</span>
                  <button @click="closeModal" class="text-slate-400 hover:text-slate-700 transition-colors p-1">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Applied for banner -->
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Applied For</p>
                <p class="text-sm font-bold text-slate-800">{{ selectedApp.listing_title }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ selectedApp.property_type }} · {{ selectedApp.occupants }} occupant{{ selectedApp.occupants !== 1 ? 's' : '' }} · Applied {{ selectedApp.applied_at }}</p>
              </div>

              <!-- 3-metric scorecard -->
              <div class="grid grid-cols-3 gap-3">
                <div class="metric-card">
                  <p class="metric-label">Credit Score</p>
                  <p :class="['metric-value', selectedApp.credit_score >= 700 ? 'text-emerald-600' : selectedApp.credit_score >= 620 ? 'text-amber-600' : 'text-rose-600']">{{ selectedApp.credit_score }}</p>
                  <p class="metric-sub">{{ getCreditGrade(selectedApp.credit_score) }}</p>
                </div>
                <div class="metric-card">
                  <p class="metric-label">Income Ratio</p>
                  <p :class="['metric-value', selectedApp.income_rent_ratio >= 3 ? 'text-emerald-600' : 'text-amber-600']">{{ selectedApp.income_rent_ratio }}x</p>
                  <p class="metric-sub">Income to Rent</p>
                </div>
                <div class="metric-card">
                  <p class="metric-label">Match Score</p>
                  <p :class="['metric-value', selectedApp.match_score >= 80 ? 'text-emerald-600' : selectedApp.match_score >= 50 ? 'text-amber-600' : 'text-rose-600']">{{ selectedApp.match_score }}%</p>
                  <p class="metric-sub">AI Recommendation</p>
                </div>
              </div>

              <!-- Profile + Verification grid -->
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-3">
                  <h4 class="section-label">Applicant Profile</h4>
                  <div class="space-y-2">
                    <div class="profile-row"><span class="profile-key">Phone</span><span class="profile-val">{{ selectedApp.phone }}</span></div>
                    <div class="profile-row"><span class="profile-key">Employment</span><span class="profile-val">{{ selectedApp.employment }}</span></div>
                    <div class="profile-row"><span class="profile-key">Occupants</span><span class="profile-val">{{ selectedApp.occupants }} people</span></div>
                    <div class="profile-row"><span class="profile-key">Monthly Income</span><span class="profile-val">{{ selectedApp.monthly_income || '—' }}</span></div>
                    <div class="profile-row"><span class="profile-key">Nationality</span><span class="profile-val">{{ selectedApp.nationality || '—' }}</span></div>
                  </div>
                </div>
                <div class="space-y-3">
                  <h4 class="section-label">Verification Checks</h4>
                  <div class="space-y-2.5">
                    <label class="check-row">
                      <input type="checkbox" v-model="selectedApp.references_verified" class="check-input" />
                      <span :class="['check-label', selectedApp.references_verified ? 'text-emerald-700' : 'text-slate-600']">{{ selectedApp.references_verified ? '✓' : '○' }} Employer &amp; References Verified</span>
                    </label>
                    <label class="check-row">
                      <input type="checkbox" v-model="selectedApp.credit_checked" class="check-input" />
                      <span :class="['check-label', selectedApp.credit_checked ? 'text-emerald-700' : 'text-slate-600']">{{ selectedApp.credit_checked ? '✓' : '○' }} Metropol Credit Report Confirmed</span>
                    </label>
                    <label class="check-row">
                      <input type="checkbox" v-model="selectedApp.background_cleared" class="check-input" />
                      <span :class="['check-label', selectedApp.background_cleared ? 'text-emerald-700' : 'text-slate-600']">{{ selectedApp.background_cleared ? '✓' : '○' }} Background Check Cleared</span>
                    </label>
                    <label class="check-row">
                      <input type="checkbox" v-model="selectedApp.id_verified" class="check-input" />
                      <span :class="['check-label', selectedApp.id_verified ? 'text-emerald-700' : 'text-slate-600']">{{ selectedApp.id_verified ? '✓' : '○' }} National ID / Passport Verified</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="section-label block mb-2">Landlord Notes</label>
                <textarea
                  v-model="selectedApp.notes"
                  rows="2"
                  placeholder="Add private notes about this applicant..."
                  class="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-300"
                ></textarea>
              </div>

              <!-- Footer actions -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <span :class="['text-[9px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full border',
                  selectedApp.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  selectedApp.status === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                  'bg-amber-100 text-amber-700 border-amber-200']">Current status: {{ selectedApp.status }}</span>
                <div v-if="selectedApp.status === 'pending'" class="flex gap-2">
                  <button @click="updateStatus(selectedApp, 'rejected')" class="btn-reject">Reject</button>
                  <button @click="updateStatus(selectedApp, 'approved')" class="btn-approve">Approve &amp; Proceed to Lease</button>
                </div>
                <div v-else class="flex gap-2">
                  <button @click="updateStatus(selectedApp, 'pending')" class="btn-reset">Reset to Pending</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
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
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'ApplicationsView',
  setup() {
    const store = useAppStore();
    const searchQuery = ref('');
    const statusFilter = ref('');
    const sortKey = ref('applied_at');
    const sortDir = ref('desc');
    const selectedApp = ref(null);

    const columns = [
      { key: 'tenant_name', label: 'Applicant', sortable: true },
      { key: 'listing_title', label: 'Listing', sortable: false },
      { key: 'match_score', label: 'Match Score', sortable: true },
      { key: 'credit_score', label: 'Credit', sortable: true },
      { key: 'income_rent_ratio', label: 'Inc./Rent', sortable: true },
      { key: 'occupants', label: 'Occupants', sortable: true },
      { key: 'applied_at', label: 'Applied', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: '_action', label: '', sortable: false },
    ];

    const mockApplications = ref([
      {
        id: 'app_1', tenant_name: 'John Kamau', listing_title: 'Stunning 2BR Apartment - Kilimani',
        property_type: 'Apartment', status: 'pending', phone: '+254 712 345 678', email: 'kamau.j@gmail.com',
        occupants: 2, employment: 'Senior Engineer at Safaricom', monthly_income: 'KES 280,000',
        nationality: 'Kenyan', match_score: 94, income_rent_ratio: 4.2, credit_score: 710,
        references_verified: true, credit_checked: true, background_cleared: true, id_verified: true,
        applied_at: 'Aug 14, 2026', notes: ''
      },
      {
        id: 'app_2', tenant_name: 'Amina Omondi', listing_title: 'Sleek Executive Studio - Westlands',
        property_type: 'Studio', status: 'pending', phone: '+254 722 987 654', email: 'amina.o@outlook.com',
        occupants: 1, employment: 'Consultant at Deloitte', monthly_income: 'KES 190,000',
        nationality: 'Kenyan', match_score: 78, income_rent_ratio: 2.8, credit_score: 640,
        references_verified: false, credit_checked: false, background_cleared: true, id_verified: false,
        applied_at: 'Aug 13, 2026', notes: ''
      },
      {
        id: 'app_3', tenant_name: 'David Ndambuki', listing_title: 'Cozy 1BR Townhouse - Kiambu Rd',
        property_type: 'Townhouse', status: 'approved', phone: '+254 733 111 222', email: 'ndambuki.d@yahoo.com',
        occupants: 3, employment: 'Marketing Director', monthly_income: 'KES 350,000',
        nationality: 'Kenyan', match_score: 85, income_rent_ratio: 3.5, credit_score: 680,
        references_verified: true, credit_checked: true, background_cleared: true, id_verified: true,
        applied_at: 'Aug 11, 2026', notes: 'Long-term tenant prospect. Confirmed 2-year lease intent.'
      },
      {
        id: 'app_4', tenant_name: 'Grace Muthoni', listing_title: 'Modern 3BR Penthouse - Lavington',
        property_type: 'Penthouse', status: 'rejected', phone: '+254 744 555 888', email: 'grace.m@gmail.com',
        occupants: 4, employment: 'Freelance Designer', monthly_income: 'KES 95,000',
        nationality: 'Kenyan', match_score: 42, income_rent_ratio: 1.4, credit_score: 520,
        references_verified: false, credit_checked: false, background_cleared: false, id_verified: true,
        applied_at: 'Aug 10, 2026', notes: 'Income insufficient for unit rent. Referred to affordable options.'
      }
    ]);

    const filteredApplications = computed(() => {
      let list = mockApplications.value;
      if (statusFilter.value) list = list.filter(a => a.status === statusFilter.value);
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(a =>
          a.tenant_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.listing_title.toLowerCase().includes(q)
        );
      }
      return list;
    });

    const sortedApplications = computed(() => {
      return [...filteredApplications.value].sort((a, b) => {
        const av = a[sortKey.value], bv = b[sortKey.value];
        if (av === bv) return 0;
        const cmp = av < bv ? -1 : 1;
        return sortDir.value === 'asc' ? cmp : -cmp;
      });
    });

    const sortBy = (key) => {
      if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
      else { sortKey.value = key; sortDir.value = 'asc'; }
    };

    const getCreditGrade = (score) => {
      if (score >= 700) return 'Excellent';
      if (score >= 620) return 'Good';
      if (score >= 550) return 'Fair';
      return 'Poor';
    };

    const avatarColor = (name) => {
      const colors = [
        'linear-gradient(135deg,#6366f1,#8b5cf6)',
        'linear-gradient(135deg,#0ea5e9,#2563eb)',
        'linear-gradient(135deg,#10b981,#059669)',
        'linear-gradient(135deg,#f59e0b,#d97706)',
        'linear-gradient(135deg,#ec4899,#be185d)',
        'linear-gradient(135deg,#14b8a6,#0d9488)',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    };

    const openModal = (app) => { selectedApp.value = app; };
    const closeModal = () => { selectedApp.value = null; };

    const updateStatus = (app, status) => {
      app.status = status;
      store.success = `Application status updated to: ${status}`;
    };


    // --- Pagination ---
    const { paginatedItems: pagedSortedApplications, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(sortedApplications);
        return {
      store, searchQuery, statusFilter, sortKey, sortDir, columns,
      mockApplications, filteredApplications, sortedApplications,
      selectedApp, sortBy, getCreditGrade, avatarColor,
      openModal, closeModal, updateStatus,  pagedSortedApplications, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-backdrop {
  position: absolute; inset: 0;
  background: rgba(15,23,42,0.6);
  backdrop-filter: blur(4px);
}
.modal-panel {
  position: relative;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  width: 100%; max-width: 42rem;
  max-height: 90vh; overflow-y: auto;
}
.modal-accent { height: 6px; border-radius: 1.5rem 1.5rem 0 0; }
.accent-green { background: linear-gradient(90deg,#34d399,#0d9488); }
.accent-amber { background: linear-gradient(90deg,#fbbf24,#f97316); }
.accent-rose  { background: linear-gradient(90deg,#f87171,#ec4899); }
.modal-avatar {
  width: 3.5rem; height: 3.5rem; border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 1.25rem;
  text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.metric-card {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 1rem; padding: 1rem; text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.metric-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
.metric-value { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.metric-sub   { font-size: 10px; color: #94a3b8; margin-top: 0.25rem; }
.section-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.profile-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.75rem; }
.profile-key { color: #94a3b8; width: 6rem; flex-shrink: 0; }
.profile-val { font-weight: 600; color: #334155; }
.check-row { display: flex; align-items: center; gap: 0.625rem; cursor: pointer; }
.check-input { width: 0.875rem; height: 0.875rem; border-radius: 0.25rem; color: #2563eb; }
.check-label { font-size: 0.75rem; font-weight: 600; }
.btn-reject  { background:#fff; color:#e11d48; border:1px solid #fda4af; font-weight:700; padding:0.5rem 1rem; border-radius:0.75rem; font-size:0.75rem; transition:background 0.15s; }
.btn-reject:hover { background:#fff1f2; }
.btn-approve { background:linear-gradient(135deg,#10b981,#0d9488); color:#fff; font-weight:700; padding:0.5rem 1rem; border-radius:0.75rem; font-size:0.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.1); transition:opacity 0.15s; }
.btn-approve:hover { opacity:0.9; }
.btn-reset   { background:#fff; color:#d97706; border:1px solid #fde68a; font-weight:700; padding:0.5rem 1rem; border-radius:0.75rem; font-size:0.75rem; transition:background 0.15s; }
.btn-reset:hover { background:#fffbeb; }

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-panel, .modal-fade-leave-active .modal-panel { transition: transform 0.2s ease; }
.modal-fade-enter-from .modal-panel, .modal-fade-leave-to .modal-panel { transform: scale(0.96) translateY(10px); }
</style>
