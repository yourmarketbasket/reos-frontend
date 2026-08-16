<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex justify-between items-center bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-slate-800">Verification Tier Configuration</h1>
        <p class="text-xs text-slate-500 mt-1">Configure property capacity limits, subscription costs, unlocked listing types, and required KYC papers.</p>
      </div>
      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 border border-brand-200">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
          Extensible Ladder active
        </span>
      </div>
    </div>

    <!-- Tiers Config Grid list -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="t in tiers" :key="t.id" class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
        <div>
          <div class="flex justify-between items-center">
            <span :class="['text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border', t.level === 1 ? 'text-slate-600 bg-slate-50 border-slate-200' : t.level === 2 ? 'text-brand-700 bg-brand-100 border-brand-200' : 'text-purple-700 bg-purple-50 border-purple-200']">Level {{ t.level }}</span>
            <span :class="['px-2.5 py-0.5 rounded-full text-[9px] font-bold capitalize', t.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100']">
              {{ t.is_active ? 'active' : 'disabled' }}
            </span>
          </div>

          <h3 class="font-heading font-bold text-slate-800 text-lg mt-3">{{ t.name }}</h3>

          <div class="flex items-baseline gap-1 mt-2 text-slate-900 font-bold text-xl">
            <span>KES</span>
            <span>{{ formatCurrency(t.cost_amount) }}</span>
            <span v-if="t.recurring" class="text-xs text-slate-400 font-semibold block">/ {{ t.recurring_period }}</span>
          </div>

          <div class="mt-4 space-y-2 text-xs">
            <div>
              <span class="text-slate-400 font-bold block uppercase text-[9px]">Property Limit Cap</span>
              <span class="font-medium text-slate-800">{{ t.property_cap > 0 ? t.property_cap + ' properties' : 'Unlimited Properties' }}</span>
            </div>

            <div>
              <span class="text-slate-400 font-bold block uppercase text-[9px]">Unlocked Listing Types</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span v-for="type in t.unlocked_listing_types" :key="type" class="px-2 py-0.5 rounded-full bg-brand-100/60 text-[10px] text-brand-700 font-semibold border border-brand-200/50">
                  {{ type }}
                </span>
              </div>
            </div>

            <div class="pt-2">
              <span class="text-slate-400 font-bold block uppercase text-[9px]">KYC Requirements</span>
              <ul class="list-disc list-inside mt-1 space-y-0.5 text-[10px] text-slate-600">
                <li v-for="req in t.required_kyc_documents" :key="req.doc_type">{{ req.description }}</li>
              </ul>
            </div>
          </div>
        </div>

        <button @click="editTier(t)" class="w-full btn border border-brand-200 hover:bg-brand-50 text-brand-700 font-bold py-2 rounded-xl text-xs transition-colors">
          Edit Tier Configuration
        </button>
      </div>
    </div>

    <!-- Edit Tier Modal Dialog -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="font-heading font-bold text-slate-800 text-sm uppercase">Modify Tier Details</h3>
            <button @click="showEditModal = false" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="form-label">Tier Name</label>
              <input v-model="editForm.name" type="text" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Property Cap (Max)</label>
              <input v-model.number="editForm.property_cap" type="number" class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Subscription Price (KES)</label>
              <input v-model.number="editForm.cost_amount" type="number" class="form-input text-xs" />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button @click="showEditModal = false" class="btn border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs px-4 py-2 font-semibold">Cancel</button>
            <button @click="saveTier" class="btn bg-brand-500 hover:bg-brand-600 text-dark rounded-lg text-xs px-4 py-2 font-semibold">Save Config Changes</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();
    const tiers = computed(() => store.tiers);

    const showEditModal = ref(false);
    const editForm = reactive({
      id: '',
      level: 1,
      name: '',
      property_cap: 100,
      cost_amount: 0,
      unlocked_listing_types: [],
      required_kyc_documents: [],
      is_active: true
    });

    const loadData = async () => {
      await store.fetchTiers();
    };

    const editTier = (t) => {
      editForm.id = t.id;
      editForm.level = t.level;
      editForm.name = t.name;
      editForm.property_cap = t.property_cap;
      editForm.cost_amount = t.cost_amount;
      editForm.unlocked_listing_types = t.unlocked_listing_types;
      editForm.required_kyc_documents = t.required_kyc_documents;
      editForm.is_active = t.is_active;
      showEditModal.value = true;
    };

    const saveTier = async () => {
      try {
        const found = tiers.value.find(t => t.id === editForm.id);
        if (found) {
          found.name = editForm.name;
          found.property_cap = editForm.property_cap;
          found.cost_amount = editForm.cost_amount;
        }
        showEditModal.value = false;
        store.success = 'Verification Tier rules updated successfully';
      } catch (e) {
        // error
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(loadData);

    return {
      tiers,
      showEditModal,
      editForm,
      editTier,
      saveTier,
      formatCurrency
    };
  }
};
</script>
