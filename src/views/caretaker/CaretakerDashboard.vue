<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>Operations Console
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Caretaker Control Panel</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage tasks, perform move-in/out checklists, and submit repair details.</p>
      </div>
      <div>
        <span class="text-xs text-slate-400 font-semibold font-mono">Caretaker Account</span>
      </div>
    </div>

    <!-- Stats summary card row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Repair Tasks</span>
          <span class="text-2xl font-extrabold text-slate-800">{{ stats?.assigned_tickets || 0 }}</span>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Inspections Completed</span>
          <span class="text-2xl font-extrabold text-slate-800">{{ inspections.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deduction Claims Drafted</span>
          <span class="text-2xl font-extrabold text-slate-800">{{ deductions.length }}</span>
        </div>
      </div>
    </div>

    <!-- Active tabs for oversight areas -->
    <div class="flex gap-2 border-b border-slate-200 pb-3">
      <button 
        v-for="tab in ['maintenance', 'inspections', 'deductions']" 
        :key="tab" 
        @click="activeTab = tab"
        :class="['text-xs font-bold px-4 py-2 rounded-xl transition-all capitalize', activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50']"
      >
        {{ tab === 'maintenance' ? 'Maintenance Tasks' : tab === 'inspections' ? 'Inspections & Checklists' : 'Deduction Claim Drafts' }}
      </button>
    </div>

    <!-- 1. Maintenance Tasks Tab -->
    <div v-if="activeTab === 'maintenance'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="font-bold text-slate-800 text-base">Assigned Maintenance Tasks</h2>
          <p class="text-xs text-slate-500">Record diagnostics, costs, and upload progress status of issues.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">Unit ID</th>
              <th class="py-2.5 px-4">Issue Type</th>
              <th class="py-2.5 px-4">Description</th>
              <th class="py-2.5 px-4">Priority</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4">Estimate</th>
              <th class="py-2.5 px-4">Final Cost</th>
              <th class="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="t in pagedMaintenance" :key="t.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-semibold text-slate-700">{{ t.unit_id }}</td>
              <td class="py-3 px-4 capitalize font-semibold text-slate-700">{{ t.issue_type }}</td>
              <td class="py-3 px-4 max-w-[200px] truncate" :title="t.description">{{ t.description }}</td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', t.priority === 'high' ? 'bg-rose-50 border-rose-200 text-rose-700' : t.priority === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500']">
                  {{ t.priority }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', getStatusBadgeClass(t.status)]">
                  {{ t.status.replace('_', ' ') }}
                </span>
              </td>
              <td class="py-3 px-4 font-semibold text-slate-700">KES {{ formatCurrency(t.cost_estimate) }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">KES {{ formatCurrency(t.final_cost) }}</td>
              <td class="py-3 px-4 text-right">
                <button 
                  v-if="t.status !== 'completed'" 
                  @click="openUpdateModal(t)"
                  class="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-600 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                >
                  Update
                </button>
                <span v-else class="text-slate-400 italic text-[10px]">Closed</span>
              </td>
            </tr>
            <tr v-if="maintenance.length === 0">
              <td colspan="8" class="text-center py-12 text-slate-400 text-xs">
                No active maintenance tickets assigned.
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

    <!-- 2. Inspections & Checklists Tab -->
    <div v-if="activeTab === 'inspections'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="font-bold text-slate-800 text-base">Move-In &amp; Move-Out Inspections</h2>
          <p class="text-xs text-slate-500">Record digital checklists, meter logs, and photos during transitions.</p>
        </div>
        <button 
          @click="showInspectionModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all"
        >
          New Inspection
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">Lease ID</th>
              <th class="py-2.5 px-4">Inspection Type</th>
              <th class="py-2.5 px-4">Meter Reading</th>
              <th class="py-2.5 px-4">Logged At</th>
              <th class="py-2.5 px-4">Checklist details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="insp in inspections" :key="insp.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-semibold text-slate-700">{{ insp.lease_id }}</td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', insp.type === 'move_in' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700']">
                  {{ insp.type.replace('_', ' ') }}
                </span>
              </td>
              <td class="py-3 px-4 font-mono">{{ insp.meter_readings }} kWh</td>
              <td class="py-3 px-4 text-slate-500">{{ new Date(insp.logged_at).toLocaleDateString() }}</td>
              <td class="py-3 px-4 text-slate-600 max-w-[240px] truncate" :title="insp.checklist_json">{{ insp.checklist_json }}</td>
            </tr>
            <tr v-if="inspections.length === 0">
              <td colspan="5" class="text-center py-12 text-slate-400 text-xs">
                No inspections logged yet. Click "New Inspection" to start.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. Deduction Claim Drafts Tab -->
    <div v-if="activeTab === 'deductions'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="font-bold text-slate-800 text-base">Security Deposit Deductions</h2>
          <p class="text-xs text-slate-500">Draft itemized repair costs against tenant security deposits for landlord approval.</p>
        </div>
        <button 
          @click="showDeductionModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all"
        >
          Draft Claim
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">Draft ID</th>
              <th class="py-2.5 px-4">Lease ID</th>
              <th class="py-2.5 px-4">Description</th>
              <th class="py-2.5 px-4">Proposed Amount</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4">Created At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="d in deductions" :key="d.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-mono">{{ d.id }}</td>
              <td class="py-3 px-4 font-semibold text-slate-700">{{ d.lease_id }}</td>
              <td class="py-3 px-4 max-w-[200px] truncate" :title="d.description">{{ d.description }}</td>
              <td class="py-3 px-4 font-extrabold text-rose-600">KES {{ formatCurrency(d.amount) }}</td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase', d.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700']">
                  {{ d.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-slate-500">{{ new Date(d.created_at).toLocaleDateString() }}</td>
            </tr>
            <tr v-if="deductions.length === 0">
              <td colspan="6" class="text-center py-12 text-slate-400 text-xs">
                No deduction claim drafts logged. Click "Draft Claim" to start.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Update Maintenance Ticket -->
    <Teleport to="body">
      <div v-if="showUpdateModal" class="modal-overlay">
        <div class="modal-backdrop" @click="showUpdateModal = false"></div>
        <div class="modal-panel max-w-md">
          <div class="modal-header border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold text-slate-900">Update Maintenance Ticket</h3>
            <button @click="showUpdateModal = false" class="text-slate-400 hover:text-slate-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitUpdate" class="space-y-4 pt-3">
            <div>
              <label class="form-label">Status</label>
              <select v-model="updateForm.status" class="form-select text-xs">
                <option value="reported">Reported</option>
                <option value="reviewed">Reviewed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed (Mark Closed)</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Priority</label>
                <select v-model="updateForm.priority" class="form-select text-xs">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label class="form-label">Cost Estimate (KES)</label>
                <input v-model.number="updateForm.costEstimate" type="number" class="form-input text-xs" />
              </div>
            </div>
            <div v-if="updateForm.status === 'completed'">
              <label class="form-label">Final Actual Cost (KES)</label>
              <input v-model.number="updateForm.finalCost" type="number" required class="form-input text-xs" />
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" @click="showUpdateModal = false" class="btn border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs">Cancel</button>
              <button type="submit" :disabled="submitting" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50">Update Ticket</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: New Inspection -->
    <Teleport to="body">
      <div v-if="showInspectionModal" class="modal-overlay">
        <div class="modal-backdrop" @click="showInspectionModal = false"></div>
        <div class="modal-panel max-w-md">
          <div class="modal-header border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold text-slate-900">Record Move-In/Out Inspection</h3>
            <button @click="showInspectionModal = false" class="text-slate-400 hover:text-slate-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitInspection" class="space-y-4 pt-3">
            <div>
              <label class="form-label">Active Lease</label>
              <select v-model="inspectionForm.leaseID" required class="form-select text-xs">
                <option value="" disabled>Select active lease...</option>
                <option v-for="l in store.leases" :key="l.id" :value="l.id">
                  Unit: {{ l.unit_id }} · Tenant ID: {{ l.tenant_id.substring(0,8) }}...
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Transition Type</label>
                <select v-model="inspectionForm.type" class="form-select text-xs">
                  <option value="move_in">Move In Inspection</option>
                  <option value="move_out">Move Out Inspection</option>
                </select>
              </div>
              <div>
                <label class="form-label">Utility Meter Log (kWh)</label>
                <input v-model.number="inspectionForm.meterReadings" type="number" step="any" required class="form-input text-xs" />
              </div>
            </div>

            <!-- Checklist questions -->
            <div class="space-y-2 border-t border-slate-100 pt-3">
              <h4 class="text-xs font-bold text-slate-800">Transitions Checklist</h4>
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="form-label">Paint Condition</label>
                  <select v-model="inspectionForm.checklist.paint" class="form-select text-xs">
                    <option value="OK">OK</option>
                    <option value="Dirty">Dirty</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Plumbing &amp; Pipes</label>
                  <select v-model="inspectionForm.checklist.plumbing" class="form-select text-xs">
                    <option value="OK">OK</option>
                    <option value="Leaking">Leaking</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Electrical fixtures</label>
                  <select v-model="inspectionForm.checklist.electrical" class="form-select text-xs">
                    <option value="OK">OK</option>
                    <option value="Shorting">Shorting</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Cleanliness</label>
                  <select v-model="inspectionForm.checklist.cleanliness" class="form-select text-xs">
                    <option value="OK">OK</option>
                    <option value="Dirty">Dirty</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label">Attached Photo URL (optional)</label>
              <input v-model="inspectionForm.photoUrl" type="text" placeholder="https://..." class="form-input text-xs" />
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" @click="showInspectionModal = false" class="btn border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs">Cancel</button>
              <button type="submit" :disabled="submitting" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50">Log Inspection</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: New Deduction Draft -->
    <Teleport to="body">
      <div v-if="showDeductionModal" class="modal-overlay">
        <div class="modal-backdrop" @click="showDeductionModal = false"></div>
        <div class="modal-panel max-w-md">
          <div class="modal-header border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold text-slate-900">Draft Deduction Claim</h3>
            <button @click="showDeductionModal = false" class="text-slate-400 hover:text-slate-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitDeduction" class="space-y-4 pt-3">
            <div>
              <label class="form-label">Target Lease ID</label>
              <select v-model="deductionForm.leaseID" required class="form-select text-xs">
                <option value="" disabled>Select active lease...</option>
                <option v-for="l in store.leases" :key="l.id" :value="l.id">
                  Unit: {{ l.unit_id }} · Tenant ID: {{ l.tenant_id.substring(0,8) }}...
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">Proposed Deduction Amount (KES)</label>
              <input v-model.number="deductionForm.amount" type="number" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Claim Reason &amp; Itemization</label>
              <textarea v-model="deductionForm.description" required placeholder="Describe damaged items or utility bill arrears details..." class="form-input h-24 resize-none text-xs"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" @click="showDeductionModal = false" class="btn border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs">Cancel</button>
              <button type="submit" :disabled="submitting" class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50">Generate Draft</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'CaretakerDashboard',
  setup() {
    const store = useAppStore();
    const activeTab = ref('maintenance');
    const showUpdateModal = ref(false);
    const showInspectionModal = ref(false);
    const showDeductionModal = ref(false);
    const submitting = ref(false);

    const stats = computed(() => store.dashboardStats);
    const maintenance = computed(() => store.maintenance);
    const inspections = computed(() => store.inspections);
    const deductions = computed(() => store.deductions);

    const updateForm = reactive({
      id: '',
      status: '',
      priority: '',
      costEstimate: 0,
      finalCost: 0
    });

    const inspectionForm = reactive({
      leaseID: '',
      type: 'move_in',
      meterReadings: 0,
      checklist: {
        paint: 'OK',
        plumbing: 'OK',
        electrical: 'OK',
        cleanliness: 'OK'
      },
      photoUrl: ''
    });

    const deductionForm = reactive({
      leaseID: '',
      amount: 0,
      description: ''
    });

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchMaintenance();
      await store.fetchLeases();
      await store.fetchDeductions();
    };

    const openUpdateModal = (ticket) => {
      updateForm.id = ticket.id;
      updateForm.status = ticket.status;
      updateForm.priority = ticket.priority;
      updateForm.costEstimate = ticket.cost_estimate;
      updateForm.finalCost = ticket.final_cost || ticket.cost_estimate;
      showUpdateModal.value = true;
    };

    const submitUpdate = async () => {
      submitting.value = true;
      try {
        await store.updateMaintenanceStatus(
          updateForm.id,
          updateForm.status,
          updateForm.priority,
          store.user?.id, // caretakerID
          updateForm.costEstimate,
          updateForm.status === 'completed' ? updateForm.finalCost : 0
        );
        showUpdateModal.value = false;
        await loadData();
      } catch (e) {
        console.error(e);
      } finally {
        submitting.value = false;
      }
    };

    const submitInspection = async () => {
      submitting.value = true;
      try {
        const lease = store.leases.find(l => l.id === inspectionForm.leaseID);
        const unitId = lease ? lease.unit_id : '';
        await store.createInspection(
          inspectionForm.leaseID,
          unitId,
          inspectionForm.type,
          JSON.stringify(inspectionForm.checklist),
          inspectionForm.meterReadings,
          inspectionForm.photoUrl ? [inspectionForm.photoUrl] : []
        );
        showInspectionModal.value = false;
        inspectionForm.leaseID = '';
        inspectionForm.meterReadings = 0;
        inspectionForm.photoUrl = '';
        await store.fetchInspections(''); // update list
      } catch (err) {
        alert(err.message);
      } finally {
        submitting.value = false;
      }
    };

    const submitDeduction = async () => {
      submitting.value = true;
      try {
        await store.createDeduction(
          deductionForm.leaseID,
          deductionForm.amount,
          deductionForm.description
        );
        showDeductionModal.value = false;
        deductionForm.leaseID = '';
        deductionForm.amount = 0;
        deductionForm.description = '';
        await store.fetchDeductions();
      } catch (err) {
        alert(err.message);
      } finally {
        submitting.value = false;
      }
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'reported': return 'bg-amber-50 border-amber-200 text-amber-700';
        case 'reviewed': return 'bg-sky-50 border-sky-200 text-sky-700';
        case 'in_progress': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'completed': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        default: return 'bg-rose-50 border-rose-200 text-rose-700';
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(async () => {
      await loadData();
      if (store.leases.length > 0) {
        await store.fetchInspections(store.leases[0].id);
      }
    });

    const { paginatedItems: pagedMaintenance, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(maintenance);

    return {
      stats,
      maintenance,
      inspections,
      deductions,
      activeTab,
      showUpdateModal,
      showInspectionModal,
      showDeductionModal,
      submitting,
      updateForm,
      inspectionForm,
      deductionForm,
      openUpdateModal,
      submitUpdate,
      submitInspection,
      submitDeduction,
      getStatusBadgeClass,
      formatCurrency,
      store,
      pagedMaintenance,
      currentPage,
      totalPages,
      totalItems,
      startItem,
      endItem,
      pageNumbers,
      pageSize,
      prevPage,
      nextPage,
      goToPage
    };
  }
};
</script>
