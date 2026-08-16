<template>
  <div>
    <!-- List Mode -->
    <div v-if="mode === 'list'" class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">My Properties</h1>
          <p class="text-xs text-slate-500 mt-1">Manage your real estate portfolios, upload images, and manage building units.</p>
        </div>
        <button @click="openAddProperty" class="bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md">
          + Add Property
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Portfolios</span>
          <span class="text-xl font-bold font-heading text-slate-800 mt-1 block">{{ properties.length }}</span>
        </div>
        <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Approved Portfolios</span>
          <span class="text-xl font-bold font-heading text-emerald-600 mt-1 block">{{ approvedCount }}</span>
        </div>
        <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
          <span class="text-xl font-bold font-heading text-amber-500 mt-1 block">{{ pendingCount }}</span>
        </div>
        <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Managed Capacity Units</span>
          <span class="text-xl font-bold font-heading text-brand-600 mt-1 block">{{ totalUnitsCount }}</span>
        </div>
      </div>

      <!-- Properties Table -->
      <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-3 px-5">Property</th>
                <th class="py-3 px-5">Type</th>
                <th class="py-3 px-5">Location</th>
                <th class="py-3 px-5">Capacity Units</th>
                <th class="py-3 px-5">Status</th>
                <th class="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prop in pagedProperties" :key="prop.id" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td class="py-3.5 px-5 flex items-center gap-3">
                  <img :src="getCoverImage(prop)" class="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                  <div>
                    <span class="font-bold text-slate-800 block text-xs">{{ prop.name }}</span>
                    <span class="text-[9px] text-slate-400 font-mono">ID: {{ prop.id.substring(0, 8) }}...</span>
                  </div>
                </td>
                <td class="py-3.5 px-5">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-brand-50 border border-brand-100 text-brand-700">
                    {{ prop.property_type || 'Standard' }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-slate-600 font-medium">📍 {{ formatLocation(prop) }}</td>
                <td class="py-3.5 px-5 text-slate-600 font-semibold">{{ prop.total_units }} units</td>
                <td class="py-3.5 px-5">
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border', getStatusClass(prop.approval_status)]">
                    {{ prop.approval_status || 'Pending' }}
                  </span>
                </td>
                <td class="py-3.5 px-5 text-right space-x-2">
                  <button v-if="prop.approval_status === 'pending' && canApprove" @click="handleApprove(prop.id)" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-colors">
                    Approve
                  </button>
                  <button v-if="prop.approval_status === 'pending' && canApprove" @click="handleReject(prop.id)" class="bg-red-500 hover:bg-red-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-colors">
                    Reject
                  </button>
                  <button @click="openEditProperty(prop.id)" class="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-3 py-1.5 rounded-lg text-[10px]">
                    Edit Specs
                  </button>
                  <button @click="openManageUnits(prop)" class="bg-brand-500 hover:bg-brand-600 text-dark font-black px-3 py-1.5 rounded-lg text-[10px]">
                    Manage Units
                  </button>
                </td>
              </tr>
              <tr v-if="properties.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                  🏠 No properties registered yet. Click "Add Property" to begin.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Form Mode (Property creation wizard) -->
    <div v-else-if="mode === 'form'">
      <PropertyFormView :propertyId="selectedPropertyId" @save="onPropertySaved" @back="goBackFromForm" />
    </div>

    <!-- Units Management Mode -->
    <div v-else-if="mode === 'units'" class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <button @click="mode = 'list'" class="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg mb-2 inline-flex items-center gap-1">
            ← Back to Properties
          </button>
          <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">
            Manage Units: {{ selectedProperty?.name }}
          </h1>
          <p class="text-xs text-slate-500 mt-1">Add building labels, unit labels, rental prices, and view/upload unit image assets.</p>
        </div>
        <button @click="showAddUnitModal = true" class="bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2 rounded-xl text-xs">
          + Add Unit
        </button>
      </div>

      <!-- Units list -->
      <div v-if="unitsList.length === 0" class="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 text-xs shadow-sm">
        🏢 No units registered for this property yet. Click "Add Unit" to begin.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="unit in unitsList" :key="unit.id" class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  {{ unit.building_label || 'Main Block' }}
                </span>
                <h3 class="text-base font-bold text-slate-800 font-heading">{{ unit.label }}</h3>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-emerald-50 text-emerald-700 border border-emerald-100">
                {{ unit.status }}
              </span>
            </div>

            <!-- Unit Images Thumbnail list -->
            <div v-if="unit.images && unit.images.length > 0" class="grid grid-cols-3 gap-1">
              <img v-for="(img, idx) in unit.images.slice(0,3)" :key="idx" :src="img.url" class="w-full h-12 object-cover rounded border border-slate-100" />
            </div>
            <div v-else class="bg-slate-50 border border-slate-100 rounded p-3 text-center text-[10px] text-slate-400 italic">
              No unit images uploaded
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span class="text-[9px] text-slate-400 block uppercase font-bold">Monthly Rent</span>
                <span class="font-bold text-slate-700">{{ unit.rent_amount.toLocaleString() }} KES</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 block uppercase font-bold">Deposit</span>
                <span class="font-bold text-slate-700">{{ unit.deposit_amount.toLocaleString() }} KES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Unit Modal -->
      <Teleport to="body">
        <div v-if="showAddUnitModal" class="modal-overlay">
          <div class="modal-container max-w-lg">
            <div class="modal-header">
              <h3 class="text-base font-bold text-slate-900 font-heading">Add New Unit</h3>
              <button @click="closeAddUnitModal" class="modal-close">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form @submit.prevent="submitAddUnit" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Building / Block Label</label>
                  <input v-model="unitForm.building_label" type="text" placeholder="e.g. Block A" class="form-input text-xs" />
                </div>
                <div>
                  <label class="form-label">Unit Number / Label</label>
                  <input v-model="unitForm.label" type="text" placeholder="e.g. Unit 101" required class="form-input text-xs" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Monthly Rent (KES)</label>
                  <input v-model.number="unitForm.rent_amount" type="number" required class="form-input text-xs" />
                </div>
                <div>
                  <label class="form-label">Security Deposit (KES)</label>
                  <input v-model.number="unitForm.deposit_amount" type="number" required class="form-input text-xs" />
                </div>
              </div>

              <!-- Unit Image Uploads -->
              <div class="border-t border-slate-100 pt-3">
                <label class="form-label mb-2">Unit Image Assets</label>
                
                <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative cursor-pointer mb-3">
                  <input type="file" multiple accept="image/*" @change="uploadUnitFiles" class="absolute inset-0 opacity-0 cursor-pointer" />
                  <p class="text-xs font-bold text-slate-600">Click to upload unit images</p>
                  <p class="text-[9px] text-slate-400 mt-0.5">PNG, JPG up to 10MB each</p>
                </div>

                <div v-if="unitUploading" class="text-center text-xs text-brand-600 font-semibold mb-2">
                  Uploading image assets…
                </div>

                <!-- Unit images preview -->
                <div class="grid grid-cols-3 gap-2">
                  <div v-for="(img, idx) in unitForm.images" :key="idx" class="relative group border border-slate-100 rounded-lg overflow-hidden">
                    <img :src="img.url" class="w-full h-16 object-cover" />
                    <button type="button" @click="removeUnitImage(idx)" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow opacity-80 group-hover:opacity-100">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-3 border-t border-slate-100">
                <button type="button" @click="closeAddUnitModal" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs">Cancel</button>
                <button type="submit" :disabled="unitUploading" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs disabled:opacity-50">Create Unit</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/store';
import { usePagination } from '@/composables/usePagination';
import PropertyFormView from '@/views/landlord/PropertyFormView.vue';

export default {
  name: 'PropertiesView',
  components: { PropertyFormView },
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const router = useRouter();

    const mode = ref('list'); // list | form | units
    const selectedPropertyId = ref('');
    const selectedProperty = ref(null);

    const showAddUnitModal = ref(false);
    const unitUploading = ref(false);
    const unitsList = ref([]);

    const properties = computed(() => store.properties);

    const unitForm = reactive({
      building_label: '',
      label: '',
      rent_amount: 25000,
      deposit_amount: 25000,
      images: []
    });

    const approvedCount = computed(() => 
      properties.value.filter(p => p.approval_status === 'approved').length
    );

    const pendingCount = computed(() => 
      properties.value.filter(p => p.approval_status === 'pending').length
    );

    const totalUnitsCount = computed(() => 
      properties.value.reduce((sum, p) => sum + (p.total_units || 0), 0)
    );

    const getCoverImage = (prop) => {
      const cover = prop.images?.find(i => i.is_cover);
      return cover?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80';
    };

    const getStatusClass = (status) => {
      if (status === 'approved') return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      if (status === 'rejected') return 'bg-red-50 border-red-100 text-red-700';
      return 'bg-amber-50 border-amber-100 text-amber-700';
    };

    const openAddProperty = () => {
      selectedPropertyId.value = '';
      mode.value = 'form';
    };

    const openEditProperty = (id) => {
      selectedPropertyId.value = id;
      mode.value = 'form';
    };

    const onPropertySaved = async () => {
      await store.fetchProperties();
      selectedPropertyId.value = '';
      mode.value = 'list';
      router.replace({ query: { tab: 'properties' } });
    };

    const goBackFromForm = () => {
      selectedPropertyId.value = '';
      mode.value = 'list';
      router.replace({ query: { tab: 'properties' } });
    };

    const openManageUnits = async (property) => {
      selectedProperty.value = property;
      unitsList.value = [];
      mode.value = 'units';
      try {
        const list = await store.fetchUnits(property.id);
        unitsList.value = list || [];
      } catch (e) {
        console.error(e);
      }
    };

    const closeAddUnitModal = () => {
      showAddUnitModal.value = false;
      unitForm.building_label = '';
      unitForm.label = '';
      unitForm.rent_amount = 25000;
      unitForm.deposit_amount = 25000;
      unitForm.images = [];
    };

    const uploadUnitFiles = async (event) => {
      const files = event.target.files;
      if (!files.length) return;
      unitUploading.value = true;
      try {
        for (let i = 0; i < files.length; i++) {
          const url = await store.uploadImage(files[i]);
          unitForm.images.push({
            url,
            category: 'interior',
            caption: '',
            is_cover: unitForm.images.length === 0,
            sort_order: unitForm.images.length
          });
        }
      } catch (e) {
        store.error = e.message || 'Unit image upload failed';
      } finally {
        unitUploading.value = false;
      }
    };

    const removeUnitImage = (idx) => {
      unitForm.images.splice(idx, 1);
    };

    const submitAddUnit = async () => {
      if (!selectedProperty.value) return;
      try {
        await store.createUnit(
          selectedProperty.value.id,
          unitForm.building_label,
          unitForm.label,
          unitForm.rent_amount,
          unitForm.deposit_amount,
          unitForm.images
        );
        showAddUnitModal.value = false;
        closeAddUnitModal();
        // Refresh list
        const list = await store.fetchUnits(selectedProperty.value.id);
        unitsList.value = list || [];
      } catch (e) {
        // error handled in store
      }
    };

    const handleQueryAction = () => {
      if (route.query.action === 'add') {
        selectedPropertyId.value = '';
        mode.value = 'form';
      } else {
        mode.value = 'list';
      }
    };

    onMounted(async () => {
      await store.fetchProperties();
      handleQueryAction();
    });

    watch(() => route.query.action, () => {
      handleQueryAction();
    });

    const formatLocation = (prop) => {
      if (prop.city && prop.country) {
        return `${prop.city}, ${prop.country}`;
      }
      if (prop.address) {
        return prop.address;
      }
      return prop.jurisdiction || 'Nairobi, Kenya';
    };


    const userRole = computed(() => store.user?.role || '');
    const canApprove = computed(() => ['landlord', 'agent'].includes(userRole.value));

    const handleApprove = async (id) => {
      try {
        await store.approveProperty(id, 'Approved by team lead');
        await store.fetchProperties();
      } catch (err) {
        store.error = err.message || 'Approval failed';
      }
    };

    const handleReject = async (id) => {
      try {
        await store.rejectProperty(id, 'Rejected by team lead');
        await store.fetchProperties();
      } catch (err) {
        store.error = err.message || 'Rejection failed';
      }
    };

    // --- Pagination ---
    const { paginatedItems: pagedProperties, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(properties);
    return {
      mode, selectedPropertyId, selectedProperty, showAddUnitModal, unitUploading, unitsList, properties, unitForm,
      approvedCount, pendingCount, totalUnitsCount,
      getCoverImage, getStatusClass, openAddProperty, openEditProperty, onPropertySaved, openManageUnits,
      closeAddUnitModal, uploadUnitFiles, removeUnitImage, submitAddUnit, goBackFromForm, formatLocation, pagedProperties, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage,
      canApprove, handleApprove, handleReject
    };
  }
};
</script>
