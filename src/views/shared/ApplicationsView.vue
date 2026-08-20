<template>
  <div class="space-y-6">

    <!-- ═══ TENANT / CLIENT VIEW ═══ -->
    <template v-if="isTenant">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 class="font-heading text-2xl font-bold text-slate-800">My Rental Applications</h2>
          <p class="text-xs text-slate-500 mt-1">Browse available properties and track your submitted applications.</p>
        </div>
        <button @click="showApplyModal = true" class="btn-primary flex items-center gap-2 self-start sm:self-auto" id="open-apply-modal-btn">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Apply for a Property
        </button>
      </div>

      <div v-if="myApplications.length === 0" class="flex flex-col items-center justify-center min-h-[22vh] text-center space-y-3 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <svg class="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">No applications yet</h3>
          <p class="text-xs text-slate-400 mt-1">Click "Apply for a Property" to browse and apply.</p>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="app in myApplications" :key="app.id" class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex-1 min-w-0">
            <p class="font-bold text-slate-800 text-sm truncate">{{ app.listing_title || 'Property Application' }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ app.property_type || '' }}</p>
            <p class="text-[10px] text-slate-400 mt-1">Submitted: {{ app.applied_at || app.created_at || '—' }}</p>
          </div>
          <div class="shrink-0">
            <span :class="['text-[9px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full border',
              app.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              app.status === 'rejected'  ? 'bg-rose-100 text-rose-700 border-rose-200' :
              'bg-amber-100 text-amber-700 border-amber-200']">{{ app.status || 'pending' }}</span>
          </div>
        </div>
      </div>

      <!-- Apply Modal -->
      <Teleport to="body">
        <div v-if="showApplyModal" class="modal-overlay">
          <div class="modal-container max-w-lg">
            <div class="modal-header">
              <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Rental Application Form</h3>
              <button @click="showApplyModal = false" class="modal-close">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form @submit.prevent="submitApplication" class="space-y-4 p-5">
              <p class="text-[11px] text-slate-500">
                Submit your credit evaluation metrics, employment details, and occupants count to the Landlord matching engine.
              </p>

              <div>
                <label class="form-label text-[10px]">Select Available Listing <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input v-model="listingSearch" @input="searchListings" type="text" placeholder="Search listing by title or description..." class="form-input text-xs pr-8" id="apply-listing-search"/>
                  <svg class="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
                </div>
                <div v-if="listingResults.length" class="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10 relative max-h-40 overflow-y-auto">
                  <button type="button" v-for="l in listingResults" :key="l.id" @click="selectListing(l)" class="w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors">
                    <p class="text-xs font-bold text-slate-800">{{ l.title }}</p>
                    <p class="text-[9px] text-slate-400">Rent: {{ l.rent_amount?.toLocaleString() }} KES · {{ l.listing_type }}</p>
                  </button>
                </div>
                <div v-if="selectedListing" class="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <span class="text-xs font-bold text-amber-700 flex-1">{{ selectedListing.title }}</span>
                  <button type="button" @click="selectedListing = null; listingSearch = ''" class="text-amber-400 hover:text-amber-600 text-sm font-bold">✕</button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label text-[10px]">Full Name <span class="text-rose-500">*</span></label>
                  <input v-model="applyForm.tenant_name" type="text" class="form-input text-xs" placeholder="Full legal name" required id="apply-tenant-name"/>
                </div>
                <div>
                  <label class="form-label text-[10px]">Phone Number <span class="text-rose-500">*</span></label>
                  <input v-model="applyForm.phone" type="tel" class="form-input text-xs" placeholder="+254 7XX XXX XXX" required id="apply-phone"/>
                </div>
              </div>

              <div>
                <label class="form-label text-[10px]">Employment / Current Role <span class="text-rose-500">*</span></label>
                <input v-model="applyForm.employment" type="text" placeholder="e.g. Software Engineer at Safaricom" required class="form-input text-xs" id="apply-employment"/>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label text-[10px]">Monthly Income (KES) <span class="text-rose-500">*</span></label>
                  <input v-model.number="applyForm.monthly_income" type="number" required class="form-input text-xs" id="apply-monthly-income"/>
                </div>
                <div>
                  <label class="form-label text-[10px]">Credit Score (300-850) <span class="text-rose-500">*</span></label>
                  <input v-model.number="applyForm.credit_score" type="number" min="300" max="850" required class="form-input text-xs" id="apply-credit-score"/>
                </div>
              </div>

              <div>
                <label class="form-label text-[10px]">Number of Occupants <span class="text-rose-500">*</span></label>
                <input v-model.number="applyForm.occupants" type="number" min="1" required class="form-input text-xs" id="apply-occupants"/>
              </div>

              <div>
                <label class="form-label text-[10px]">Additional Notes</label>
                <textarea v-model="applyForm.notes" rows="2" class="form-input text-xs resize-none" placeholder="Anything you'd like the landlord to know..." id="apply-notes"></textarea>
              </div>

              <p v-if="applyError" class="text-xs text-rose-600 font-semibold">{{ applyError }}</p>

              <div class="flex gap-3 pt-3 border-t border-slate-100">
                <button type="button" @click="showApplyModal = false" class="btn border border-slate-200 text-slate-700 rounded-lg text-xs px-4 py-2 font-semibold flex-1">Cancel</button>
                <button type="submit" :disabled="applyLoading" class="btn bg-brand-500 hover:bg-brand-600 text-dark rounded-lg text-xs px-4 py-2 font-semibold flex-1">
                  {{ applyLoading ? 'Submitting…' : 'Submit Application' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </template>


    <!-- ═══ MANAGEMENT VIEW (landlord / agent / staff / admin) ═══ -->
    <template v-else>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 class="font-heading text-2xl font-bold text-slate-800">Tenant Applications &amp; Matching</h2>
          <p class="text-xs text-slate-500 mt-1">Review tenant profiles, credit metrics, and manage lease matching decisions.</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-xs text-slate-500 font-medium">{{ filteredApplications.length }} application{{ filteredApplications.length !== 1 ? 's' : '' }}</span>
          <select v-model="statusFilter" class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input v-model="searchQuery" type="text" placeholder="Search applicants..." class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-44 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-400"/>
        </div>
      </div>

      <div v-if="filteredApplications.length === 0" class="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">No applications found</h3>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your search or status filter.</p>
        </div>
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/70">
                <th v-for="col in columns" :key="col.key" @click="col.sortable && sortBy(col.key)"
                  :class="['px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap', col.sortable ? 'cursor-pointer hover:text-slate-600' : '']">
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
              <tr v-for="app in pagedSortedApplications" :key="app.id" @click="openModal(app)"
                class="border-b border-slate-50 last:border-none hover:bg-amber-50/30 cursor-pointer transition-colors group">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div :style="{ background: avatarColor(app.tenant_name) }" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase">{{ (app.tenant_name || '?').charAt(0) }}</div>
                    <div>
                      <p class="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{{ app.tenant_name }}</p>
                      <p class="text-[10px] text-slate-400">{{ app.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3"><p class="text-xs text-slate-700 font-semibold max-w-[180px] truncate">{{ app.listing_title }}</p><p class="text-[10px] text-slate-400">{{ app.property_type }}</p></td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div :style="{ width: (app.match_score||0)+'%' }" :class="['h-full rounded-full', (app.match_score||0)>=80?'bg-emerald-500':(app.match_score||0)>=50?'bg-amber-500':'bg-rose-500']"></div></div>
                    <span :class="['text-xs font-extrabold', (app.match_score||0)>=80?'text-emerald-600':(app.match_score||0)>=50?'text-amber-600':'text-rose-600']">{{ app.match_score||'—' }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3"><span :class="['text-xs font-bold', (app.credit_score||0)>=700?'text-emerald-600':(app.credit_score||0)>=620?'text-amber-600':'text-rose-600']">{{ app.credit_score||'—' }}</span><span v-if="app.credit_score" class="text-[10px] text-slate-400 ml-1">({{ getCreditGrade(app.credit_score) }})</span></td>
                <td class="px-4 py-3"><span :class="['text-xs font-bold', (app.income_rent_ratio||0)>=3?'text-emerald-600':'text-amber-600']">{{ app.income_rent_ratio ? app.income_rent_ratio+'x' : '—' }}</span></td>
                <td class="px-4 py-3 text-xs text-slate-600 font-medium">{{ app.occupants||'—' }}</td>
                <td class="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{{ app.applied_at||app.created_at||'—' }}</td>
                <td class="px-4 py-3">
                  <span :class="['text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full',
                    app.status==='approved'?'bg-emerald-100 text-emerald-700 border border-emerald-200':
                    app.status==='rejected'?'bg-rose-100 text-rose-700 border border-rose-200':
                    'bg-amber-100 text-amber-700 border border-amber-200']">{{ app.status||'pending' }}</span>
                </td>
                <td class="px-4 py-3"><span class="text-[10px] text-amber-500 font-semibold group-hover:text-amber-700 transition-colors">View →</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
        :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers" :page-size="pageSize"
        @prev="prevPage" @next="nextPage" @go="goToPage" @update:pageSize="pageSize = $event" class="px-4 pb-4"/>

      <!-- Detail Modal -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="selectedApp" class="modal-overlay" @click.self="closeModal">
            <div class="modal-backdrop" @click="closeModal"></div>
            <div class="modal-panel">
              <div :class="['modal-accent', (selectedApp.match_score||0)>=80?'accent-green':(selectedApp.match_score||0)>=50?'accent-amber':'accent-rose']"></div>
              <div class="p-6 space-y-6">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div :style="{ background: avatarColor(selectedApp.tenant_name) }" class="modal-avatar">{{ (selectedApp.tenant_name||'?').charAt(0) }}</div>
                    <div>
                      <h3 class="text-lg font-extrabold text-slate-800">{{ selectedApp.tenant_name }}</h3>
                      <p class="text-xs text-slate-400">{{ selectedApp.email }} · {{ selectedApp.phone }}</p>
                      <p class="text-xs font-semibold text-slate-600 mt-0.5">{{ selectedApp.employment_type || selectedApp.employment }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span v-if="selectedApp.match_score" :class="['text-[10px] font-extrabold px-2.5 py-1 rounded-lg border',
                      selectedApp.match_score>=80?'bg-emerald-50 border-emerald-200 text-emerald-700':
                      selectedApp.match_score>=50?'bg-amber-50 border-amber-200 text-amber-700':'bg-rose-50 border-rose-200 text-rose-700']">
                      🤖 {{ selectedApp.match_score }}% Match
                    </span>
                    <button @click="closeModal" class="text-slate-400 hover:text-slate-700 p-1">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>

                <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Applied For</p>
                  <p class="text-sm font-bold text-slate-800">{{ selectedApp.listing_title }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ selectedApp.property_type }} · Applied {{ selectedApp.applied_at||selectedApp.created_at||'—' }}</p>
                </div>

                <div v-if="selectedApp.match_score||selectedApp.credit_score" class="grid grid-cols-3 gap-3">
                  <div class="metric-card"><p class="metric-label">Credit Score</p><p :class="['metric-value',(selectedApp.credit_score||0)>=700?'text-emerald-600':(selectedApp.credit_score||0)>=620?'text-amber-600':'text-rose-600']">{{ selectedApp.credit_score||'—' }}</p><p class="metric-sub">{{ selectedApp.credit_score?getCreditGrade(selectedApp.credit_score):'' }}</p></div>
                  <div class="metric-card"><p class="metric-label">Income Ratio</p><p :class="['metric-value',(selectedApp.income_rent_ratio||0)>=3?'text-emerald-600':'text-amber-600']">{{ selectedApp.income_rent_ratio?selectedApp.income_rent_ratio+'x':'—' }}</p><p class="metric-sub">Income to Rent</p></div>
                  <div class="metric-card"><p class="metric-label">Match Score</p><p :class="['metric-value',(selectedApp.match_score||0)>=80?'text-emerald-600':(selectedApp.match_score||0)>=50?'text-amber-600':'text-rose-600']">{{ selectedApp.match_score?selectedApp.match_score+'%':'—' }}</p><p class="metric-sub">AI Recommendation</p></div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div class="space-y-3">
                    <h4 class="section-label">Applicant Profile</h4>
                    <div class="space-y-2">
                      <div class="profile-row"><span class="profile-key">Phone</span><span class="profile-val">{{ selectedApp.phone||'—' }}</span></div>
                      <div class="profile-row"><span class="profile-key">Employment</span><span class="profile-val">{{ selectedApp.employment_type||selectedApp.employment||'—' }}</span></div>
                      <div class="profile-row"><span class="profile-key">Occupants</span><span class="profile-val">{{ selectedApp.occupants||'—' }}</span></div>
                      <div class="profile-row"><span class="profile-key">Monthly Income</span><span class="profile-val">{{ selectedApp.monthly_income||'—' }}</span></div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <h4 class="section-label">Verification Checks</h4>
                    <div class="space-y-2.5">
                      <label class="check-row"><input type="checkbox" v-model="selectedApp.references_verified" class="check-input"/><span :class="['check-label',selectedApp.references_verified?'text-emerald-700':'text-slate-600']">{{ selectedApp.references_verified?'✓':'○' }} References Verified</span></label>
                      <label class="check-row"><input type="checkbox" v-model="selectedApp.credit_checked" class="check-input"/><span :class="['check-label',selectedApp.credit_checked?'text-emerald-700':'text-slate-600']">{{ selectedApp.credit_checked?'✓':'○' }} Credit Report Checked</span></label>
                      <label class="check-row"><input type="checkbox" v-model="selectedApp.background_cleared" class="check-input"/><span :class="['check-label',selectedApp.background_cleared?'text-emerald-700':'text-slate-600']">{{ selectedApp.background_cleared?'✓':'○' }} Background Cleared</span></label>
                      <label class="check-row"><input type="checkbox" v-model="selectedApp.id_verified" class="check-input"/><span :class="['check-label',selectedApp.id_verified?'text-emerald-700':'text-slate-600']">{{ selectedApp.id_verified?'✓':'○' }} ID / Passport Verified</span></label>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="section-label block mb-2">Notes</label>
                  <textarea v-model="selectedApp.notes" rows="2" placeholder="Add private notes about this applicant..." class="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder-slate-300"></textarea>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span :class="['text-[9px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full border',
                    selectedApp.status==='approved'?'bg-emerald-100 text-emerald-700 border-emerald-200':
                    selectedApp.status==='rejected'?'bg-rose-100 text-rose-700 border-rose-200':
                    'bg-amber-100 text-amber-700 border-amber-200']">Current status: {{ selectedApp.status||'pending' }}</span>
                  <div v-if="selectedApp.status==='pending'" class="flex gap-2">
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
    </template>
  </div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
import PaginationBar from '@/components/PaginationBar.vue';

const MANAGEMENT_ROLES = ['landlord', 'agent', 'caretaker', 'staff', 'admin', 'superadmin', 'tech_admin', 'billing_admin', 'support_admin'];

export default {
  name: 'ApplicationsView',
  components: { PaginationBar },
  setup() {
    const store = useAppStore();

    const userRole = computed(() => store.userRole || store.user?.role || '');
    const isTenant = computed(() => !MANAGEMENT_ROLES.includes(userRole.value));

    // ── TENANT SIDE ───────────────────────────────────────────────
    const myApplications   = ref([]);
    const showApplyModal   = ref(false);
    const listingSearch    = ref('');
    const listingResults   = ref([]);
    const selectedListing  = ref(null);
    const allListings      = ref([]);
    const applyForm = ref({ tenant_name: '', phone: '', employment: '', monthly_income: 0, credit_score: 650, occupants: 1, notes: '' });
    const applyLoading = ref(false);
    const applyError   = ref('');

    const prefillApplyForm = () => {
      if (store.user) {
        applyForm.value.tenant_name = store.user.name || store.user.email || '';
        applyForm.value.phone       = store.user.phone || '';
      }
    };

    const searchListings = () => {
      const q = listingSearch.value.toLowerCase().trim();
      if (!q) { listingResults.value = []; return; }
      listingResults.value = allListings.value.filter(l =>
        (l.title||'').toLowerCase().includes(q) || (l.description||'').toLowerCase().includes(q)
      ).slice(0, 6);
    };

    const selectListing = (l) => {
      selectedListing.value = l;
      listingSearch.value   = l.title;
      listingResults.value  = [];
    };

    const submitApplication = async () => {
      applyError.value = '';
      if (!selectedListing.value) { applyError.value = 'Please select a listing.'; return; }
      if (!applyForm.value.tenant_name.trim()) { applyError.value = 'Full name is required.'; return; }
      if (!applyForm.value.phone.trim())       { applyError.value = 'Phone number is required.'; return; }
      if (!applyForm.value.employment.trim())  { applyError.value = 'Employment/current role is required.'; return; }
      applyLoading.value = true;
      try {
        await store.createApplication(
          selectedListing.value.id,
          selectedListing.value.title,
          applyForm.value.tenant_name,
          store.user?.email || '',
          applyForm.value.phone,
          applyForm.value.employment,
          applyForm.value.monthly_income,
          applyForm.value.occupants,
          applyForm.value.credit_score
        );
        showApplyModal.value   = false;
        applyForm.value        = { tenant_name: '', phone: '', employment: '', monthly_income: 0, credit_score: 650, occupants: 1, notes: '' };
        selectedListing.value  = null;
        listingSearch.value    = '';
        store.success = 'Application submitted successfully!';
        await loadMyApplications();
      } catch (err) { applyError.value = err.message || 'Submission failed. Please try again.'; }
      finally  { applyLoading.value = false; }
    };

    const loadMyApplications = async () => {
      try   { const data = await store.fetchApplications(); myApplications.value = Array.isArray(data) ? data : []; }
      catch { myApplications.value = []; }
    };

    const loadListings = async () => {
      try   { await store.fetchListings(); allListings.value = store.listings || []; }
      catch { allListings.value = []; }
    };

    // ── MANAGEMENT SIDE ───────────────────────────────────────────
    const searchQuery  = ref('');
    const statusFilter = ref('');
    const sortKey      = ref('applied_at');
    const sortDir      = ref('desc');
    const selectedApp  = ref(null);

    const columns = [
      { key: 'tenant_name',      label: 'Applicant',   sortable: true  },
      { key: 'listing_title',    label: 'Listing',     sortable: false },
      { key: 'match_score',      label: 'Match Score', sortable: true  },
      { key: 'credit_score',     label: 'Credit',      sortable: true  },
      { key: 'income_rent_ratio',label: 'Inc./Rent',   sortable: true  },
      { key: 'occupants',        label: 'Occupants',   sortable: true  },
      { key: 'applied_at',       label: 'Applied',     sortable: true  },
      { key: 'status',           label: 'Status',      sortable: true  },
      { key: '_action',          label: '',            sortable: false },
    ];

    const allApplications = ref([]);

    const loadApplications = async () => {
      try   { const data = await store.fetchApplications(); allApplications.value = Array.isArray(data) ? data : []; }
      catch { allApplications.value = []; }
    };

    const filteredApplications = computed(() => {
      let list = allApplications.value;
      if (statusFilter.value) list = list.filter(a => a.status === statusFilter.value);
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(a =>
          (a.tenant_name||'').toLowerCase().includes(q) ||
          (a.email||'').toLowerCase().includes(q) ||
          (a.listing_title||'').toLowerCase().includes(q)
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

    const avatarColor = (name = '') => {
      const colors = ['#C9973F','#1C1712','#8C6B32','#4A3728','#6B4C20','#D4A853','#3D2B1F','#A07840'];
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length];
    };

    const openModal  = (app) => { selectedApp.value = { ...app }; };
    const closeModal = ()    => { selectedApp.value = null; };

    const updateStatus = async (app, status) => {
      try   { await store.apiRequest(`/api/applications/${app.id}/status`, 'POST', { status }); }
      catch { /* optimistic fallback */ }
      app.status = status;
      if (selectedApp.value?.id === app.id) selectedApp.value.status = status;
      store.success = `Application ${status}.`;
    };

    const { paginatedItems: pagedSortedApplications, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(sortedApplications);

    onMounted(async () => {
      prefillApplyForm();
      if (isTenant.value) {
        await Promise.all([loadMyApplications(), loadListings()]);
      } else {
        await loadApplications();
      }
    });

    return {
      isTenant,
      userRole,
      // tenant
      myApplications, showApplyModal, applyForm, applyLoading, applyError,
      listingSearch, listingResults, selectedListing,
      searchListings, selectListing, submitApplication,
      // management
      store, searchQuery, statusFilter, sortKey, sortDir, columns,
      filteredApplications, sortedApplications, selectedApp,
      sortBy, getCreditGrade, avatarColor, openModal, closeModal, updateStatus,
      pagedSortedApplications, currentPage, totalPages, totalItems,
      startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage,
    };
  }
};
</script>

<style scoped>
.form-label { display:block; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
.form-input  { width:100%; font-size:13px; border:1px solid #e2e8f0; border-radius:10px; padding:8px 12px; background:#f8fafc; color:#334155; outline:none; transition:border-color .15s,box-shadow .15s; }
.form-input:focus { border-color:#C9973F; box-shadow:0 0 0 3px rgba(201,151,63,.15); }
.btn-primary { background:linear-gradient(135deg,#C9973F,#8C6B32); color:#fff; font-weight:700; padding:.5rem 1.25rem; border-radius:.75rem; font-size:.75rem; box-shadow:0 1px 4px rgba(0,0,0,.12); transition:opacity .15s; border:none; cursor:pointer; }
.btn-primary:hover { opacity:.9; }
.btn-primary:disabled { opacity:.6; cursor:not-allowed; }
.btn-ghost   { background:#fff; color:#64748b; border:1px solid #e2e8f0; font-weight:600; padding:.5rem 1rem; border-radius:.75rem; font-size:.75rem; transition:background .15s; cursor:pointer; }
.btn-ghost:hover { background:#f8fafc; }
.modal-overlay  { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-backdrop { position:absolute; inset:0; background:rgba(15,23,42,.6); backdrop-filter:blur(4px); }
.modal-panel    { position:relative; background:#fff; border-radius:1.5rem; box-shadow:0 25px 50px -12px rgba(0,0,0,.25); width:100%; max-width:42rem; max-height:90vh; overflow-y:auto; }
.modal-accent   { height:6px; border-radius:1.5rem 1.5rem 0 0; }
.accent-green   { background:linear-gradient(90deg,#34d399,#0d9488); }
.accent-amber   { background:linear-gradient(90deg,#fbbf24,#f97316); }
.accent-rose    { background:linear-gradient(90deg,#f87171,#ec4899); }
.accent-gold    { background:linear-gradient(90deg,#C9973F,#8C6B32); }
.modal-avatar   { width:3.5rem; height:3.5rem; border-radius:1rem; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:1.25rem; text-transform:uppercase; box-shadow:0 4px 12px rgba(0,0,0,.15); }
.metric-card    { background:#fff; border:1px solid #f1f5f9; border-radius:1rem; padding:1rem; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,.04); }
.metric-label   { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.25rem; }
.metric-value   { font-size:1.5rem; font-weight:800; line-height:1; }
.metric-sub     { font-size:10px; color:#94a3b8; margin-top:.25rem; }
.section-label  { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
.profile-row    { display:flex; align-items:flex-start; gap:.5rem; font-size:.75rem; }
.profile-key    { color:#94a3b8; width:6rem; flex-shrink:0; }
.profile-val    { font-weight:600; color:#334155; }
.check-row      { display:flex; align-items:center; gap:.625rem; cursor:pointer; }
.check-input    { width:.875rem; height:.875rem; border-radius:.25rem; accent-color:#C9973F; }
.check-label    { font-size:.75rem; font-weight:600; }
.btn-reject     { background:#fff; color:#e11d48; border:1px solid #fda4af; font-weight:700; padding:.5rem 1rem; border-radius:.75rem; font-size:.75rem; transition:background .15s; cursor:pointer; }
.btn-reject:hover  { background:#fff1f2; }
.btn-approve    { background:linear-gradient(135deg,#10b981,#0d9488); color:#fff; font-weight:700; padding:.5rem 1rem; border-radius:.75rem; font-size:.75rem; box-shadow:0 1px 4px rgba(0,0,0,.1); transition:opacity .15s; cursor:pointer; border:none; }
.btn-approve:hover { opacity:.9; }
.btn-reset      { background:#fff; color:#d97706; border:1px solid #fde68a; font-weight:700; padding:.5rem 1rem; border-radius:.75rem; font-size:.75rem; transition:background .15s; cursor:pointer; }
.btn-reset:hover   { background:#fffbeb; }
.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity .2s ease; }
.modal-fade-enter-from,  .modal-fade-leave-to      { opacity:0; }
.modal-fade-enter-active .modal-panel, .modal-fade-leave-active .modal-panel { transition:transform .2s ease; }
.modal-fade-enter-from .modal-panel, .modal-fade-leave-to .modal-panel { transform:scale(.96) translateY(10px); }
</style>
