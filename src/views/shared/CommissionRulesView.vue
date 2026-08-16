<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 border border-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            Financial Operations
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">Commission Rules</h1>
        <p class="text-xs text-slate-500 mt-1">Configure automated commission rates for your agents, caretakers, and staff members.</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex-shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Configure Commission
      </button>
    </div>

    <!-- Rules Table -->
    <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Commission Structures
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/60 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Member</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Role</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trigger Event</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property Scope</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="rule in pagedCommissionRules" :key="rule.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-3.5">
                <p class="text-xs font-semibold text-slate-800">{{ getStaffEmail(rule.target_id) }}</p>
                <p class="text-[9px] text-slate-400 mt-0.5">ID: {{ rule.target_id }}</p>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 capitalize">
                  {{ rule.target_role }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span class="text-xs font-bold text-slate-800">
                  {{ rule.rate }}{{ rule.rate_type === 'percentage' ? '%' : ' ' + rule.currency }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-xs text-slate-600 capitalize">
                {{ formatTrigger(rule.trigger_event) }}
              </td>
              <td class="px-4 py-3.5 text-xs text-slate-400">
                {{ getPropertyName(rule.property_id) }}
              </td>
              <td class="px-4 py-3.5">
                <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', rule.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200']">
                  {{ rule.is_active ? 'Active' : 'Paused' }}
                </span>
              </td>
              <td class="px-6 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="openEditModal(rule)" class="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors" title="Edit Rule">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button @click="confirmDelete(rule)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Rule">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="commissionRules.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-400 text-xs">
                No commission rules configured. Configure one to automate payout splits.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container max-w-md">
          <div class="modal-header">
            <div>
              <h3 class="text-base font-bold text-slate-900 font-heading">
                {{ isEdit ? 'Modify Commission Rule' : 'Configure New Commission Rule' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Commission rules automate fee splitting during key financial transaction events.
              </p>
            </div>
            <button @click="closeModal" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="saveForm" class="space-y-4">
            <div v-if="!isEdit">
              <label class="form-label">Target Team Member</label>
              <select v-model="form.target_id" required class="form-select">
                <option value="" disabled>Select team member…</option>
                <option v-for="member in teamList" :key="member.id" :value="member.staff_user_id">
                  {{ member.email || member.staff_user_id }} ({{ member.status }})
                </option>
              </select>
            </div>
            <div v-else>
              <label class="form-label">Team Member</label>
              <div class="form-input bg-slate-50 text-slate-600 font-medium">
                {{ getStaffEmail(form.target_id) }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Rate Type</label>
                <select v-model="form.rate_type" class="form-select">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat Rate</option>
                </select>
              </div>
              <div>
                <label class="form-label">Rate Value</label>
                <input v-model.number="form.rate" type="number" step="any" required placeholder="e.g. 5 or 5000" class="form-input" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Currency</label>
                <input v-model="form.currency" type="text" placeholder="KES" class="form-input uppercase" />
              </div>
              <div>
                <label class="form-label">Trigger Event</label>
                <select v-model="form.trigger_event" class="form-select">
                  <option value="lease_signed">Lease Signed</option>
                  <option value="rent_collected">Rent Collected</option>
                  <option value="sale_closed">Sale Closed</option>
                  <option value="booking_confirmed">Booking Confirmed</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label">Property Scope</label>
              <select v-model="form.property_id" class="form-select">
                <option value="">All Properties (Global)</option>
                <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <div>
              <label class="form-label">Notes</label>
              <textarea v-model="form.notes" placeholder="Optional details or terms..." rows="2" class="form-input"></textarea>
            </div>

            <div v-if="isEdit" class="flex items-center gap-2 pt-1">
              <input v-model="form.is_active" type="checkbox" id="rule-is-active" class="rounded text-brand-500 focus:ring-brand-400 h-4 w-4 border-slate-300" />
              <label for="rule-is-active" class="text-xs font-semibold text-slate-700">Rule is active</label>
            </div>

            <div v-if="formError" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <span>{{ formError }}</span>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="closeModal" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" :disabled="formLoading" class="flex-1 bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 rounded-xl text-sm transition-colors">
                {{ formLoading ? 'Saving…' : 'Save Rule' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay">
        <div class="modal-container max-w-sm text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 font-heading">Remove Rule?</h3>
          <p class="text-xs text-slate-500 mt-1.5">Are you sure you want to delete this commission rule?</p>
          <div class="flex gap-3 mt-5">
            <button @click="deleteTarget = null" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs hover:bg-slate-50">Cancel</button>
            <button @click="handleDelete" :disabled="actionLoading === deleteTarget.id" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs">Delete</button>
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
import { ref, computed, reactive, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'CommissionRulesView',
  setup() {
    const store = useAppStore();
    const showModal = ref(false);
    const isEdit = ref(false);
    const formLoading = ref(false);
    const actionLoading = ref(null);
    const formError = ref('');
    const deleteTarget = ref(null);

    const form = reactive({
      id: '',
      target_id: '',
      rate_type: 'percentage',
      rate: 0,
      currency: 'KES',
      trigger_event: 'lease_signed',
      property_id: '',
      is_active: true,
      notes: ''
    });

    const commissionRules = computed(() => store.commissionRules || []);
    const properties = computed(() => store.properties || []);
    const teamList = computed(() => store.team || []);

    const formatTrigger = (evt) => {
      return evt?.replace(/_/g, ' ') || '';
    };

    const getPropertyName = (id) => {
      if (!id) return 'Global (All)';
      const p = properties.value.find(p => p.id === id);
      return p ? p.name : 'Unknown';
    };

    const getStaffEmail = (id) => {
      const member = teamList.value.find(m => m.staff_user_id === id);
      return member?.email || id;
    };

    const openCreateModal = () => {
      isEdit.value = false;
      formError.value = '';
      form.id = '';
      form.target_id = '';
      form.rate_type = 'percentage';
      form.rate = 0;
      form.currency = 'KES';
      form.trigger_event = 'lease_signed';
      form.property_id = '';
      form.is_active = true;
      form.notes = '';
      showModal.value = true;
    };

    const openEditModal = (rule) => {
      isEdit.value = true;
      formError.value = '';
      form.id = rule.id;
      form.target_id = rule.target_id;
      form.rate_type = rule.rate_type;
      form.rate = rule.rate;
      form.currency = rule.currency || 'KES';
      form.trigger_event = rule.trigger_event;
      form.property_id = rule.property_id || '';
      form.is_active = rule.is_active;
      form.notes = rule.notes || '';
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const saveForm = async () => {
      formError.value = '';
      formLoading.value = true;
      try {
        if (isEdit.value) {
          await store.updateCommissionRule({ ...form });
        } else {
          await store.createCommissionRule({
            target_id: form.target_id,
            rate_type: form.rate_type,
            rate: form.rate,
            currency: form.currency || 'KES',
            trigger_event: form.trigger_event,
            property_id: form.property_id || '',
            notes: form.notes
          });
        }
        closeModal();
        await store.fetchCommissionRules();
      } catch (e) {
        formError.value = e.message || 'Operation failed';
      } finally {
        formLoading.value = false;
      }
    };

    const confirmDelete = (rule) => {
      deleteTarget.value = rule;
    };

    const handleDelete = async () => {
      if (!deleteTarget.value) return;
      const id = deleteTarget.value.id;
      actionLoading.value = id;
      try {
        await store.deleteCommissionRule(id);
        deleteTarget.value = null;
      } catch (e) {
        store.error = e.message || 'Delete failed';
      } finally {
        actionLoading.value = null;
      }
    };

    onMounted(async () => {
      await store.fetchProperties();
      await store.fetchTeam();
      await store.fetchCommissionRules();
    });


    // --- Pagination ---
    const { paginatedItems: pagedCommissionRules, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(commissionRules);
        return {
      showModal, isEdit, formLoading, actionLoading, formError, deleteTarget, form,
      commissionRules, properties, teamList, formatTrigger, getPropertyName, getStaffEmail,
      openCreateModal, openEditModal, closeModal, saveForm, confirmDelete, handleDelete, pagedCommissionRules, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
