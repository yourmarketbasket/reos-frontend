<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 border border-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            Platform Configuration
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">Regions Management</h1>
        <p class="text-xs text-slate-500 mt-1">Configure and manage geographic operations, markets, and regional jurisdictions.</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex-shrink-0">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Region
      </button>
    </div>

    <!-- Regions Grid/Table -->
    <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Operational Jurisdictions
        </div>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="search" type="text" placeholder="Search region or country…" class="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 bg-slate-50 w-64" />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/60 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region Name</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jurisdiction Code</th>
              <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="reg in filteredRegions" :key="reg.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-3.5">
                <p class="text-xs font-semibold text-slate-800">{{ reg.name }}</p>
              </td>
              <td class="px-4 py-3.5 text-xs text-slate-600">{{ reg.country }}</td>
              <td class="px-4 py-3.5">
                <span class="inline-flex items-center bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded">
                  {{ reg.jurisdiction }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <button @click="handleToggle(reg)" :disabled="actionLoading === reg.id" class="focus:outline-none">
                  <span :class="['text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer', reg.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100']">
                    {{ reg.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </button>
              </td>
              <td class="px-6 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="openEditModal(reg)" class="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors" title="Edit Region">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button @click="confirmDelete(reg)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Region">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRegions.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400 text-xs">
                No regions found. Click "Add Region" to populate geographic locations.
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
                {{ isEdit ? 'Update Geographic Region' : 'Add New Region' }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Define the geographic context for listing categorization and property settings.
              </p>
            </div>
            <button @click="closeModal" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="saveForm" class="space-y-4">
            <div>
              <label class="form-label">Region Name</label>
              <input v-model="form.name" type="text" required placeholder="e.g. Nairobi Area" class="form-input" />
            </div>
            <div>
              <label class="form-label">Country</label>
              <input v-model="form.country" type="text" required placeholder="e.g. Kenya" class="form-input" />
            </div>
            <div>
              <label class="form-label">Jurisdiction Code</label>
              <input v-model="form.jurisdiction" type="text" required placeholder="e.g. KE-NBI" class="form-input font-mono" />
            </div>
            <!-- Jurisdiction Boundary Map -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="form-label mb-0">Operational Region Boundary</label>
                <button type="button" @click="clearBoundary" class="text-[10px] font-bold text-red-500 hover:underline">Clear Points</button>
              </div>
              <p class="text-[10px] text-slate-400">Click on the map to define the boundary corners of this region. Placing at least 3 pins will form the operational polygon.</p>
              <div id="region-map" class="h-48 rounded-xl border border-slate-200 mt-1 relative z-10"></div>
              <div class="text-[10px] text-slate-500 font-mono" v-if="boundaryPoints.length > 0">
                Nodes defined: {{ boundaryPoints.length }} nodes
              </div>
            </div>
            <div v-if="isEdit" class="flex items-center gap-2 pt-1">
              <input v-model="form.is_active" type="checkbox" id="region-is-active" class="rounded text-brand-500 focus:ring-brand-400 h-4 w-4 border-slate-300" />
              <label for="region-is-active" class="text-xs font-semibold text-slate-700">Region is active for operations</label>
            </div>
            <div v-if="formError" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <span>{{ formError }}</span>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="closeModal" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" :disabled="formLoading" class="flex-1 bg-brand-500 hover:bg-brand-600 text-dark font-bold py-2.5 rounded-xl text-sm transition-colors">
                {{ formLoading ? 'Saving…' : 'Save Region' }}
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
          <h3 class="text-base font-bold text-slate-900 font-heading">Delete Region?</h3>
          <p class="text-xs text-slate-500 mt-1.5">Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>? This action cannot be undone.</p>
          <div class="flex gap-3 mt-5">
            <button @click="deleteTarget = null" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs hover:bg-slate-50">Cancel</button>
            <button @click="handleDelete" :disabled="actionLoading === deleteTarget.id" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'RegionsView',
  setup() {
    const store = useAppStore();
    const search = ref('');
    const showModal = ref(false);
    const isEdit = ref(false);
    const formLoading = ref(false);
    const actionLoading = ref(null);
    const formError = ref('');
    const deleteTarget = ref(null);

    const form = reactive({
      id: '',
      name: '',
      country: '',
      jurisdiction: '',
      is_active: true
    });

    const boundaryPoints = ref([]);
    let mapInstance = null;
    let markersLayer = null;
    let polygonInstance = null;

    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) {
          resolve(window.L);
          return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    const initMap = async (existingPoints = []) => {
      const L = await loadLeaflet();
      const mapContainer = document.getElementById('region-map');
      if (!mapContainer) return;

      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }

      boundaryPoints.value = existingPoints ? JSON.parse(JSON.stringify(existingPoints)) : [];

      const defaultCenter = [-1.2921, 36.8219];
      const initialCenter = boundaryPoints.value.length > 0 ? boundaryPoints.value[0] : defaultCenter;

      mapInstance = L.map('region-map').setView(initialCenter, 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      markersLayer = L.layerGroup().addTo(mapInstance);

      // Redraw existing
      redrawMapElements(L);

      mapInstance.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        boundaryPoints.value.push([lat, lng]);
        redrawMapElements(L);
      });
    };

    const redrawMapElements = (L) => {
      if (!markersLayer || !mapInstance) return;
      markersLayer.clearLayers();

      if (polygonInstance) {
        polygonInstance.remove();
        polygonInstance = null;
      }

      boundaryPoints.value.forEach(pt => {
        L.marker(pt).addTo(markersLayer);
      });

      if (boundaryPoints.value.length >= 3) {
        polygonInstance = L.polygon(boundaryPoints.value, {
          color: '#4f46e5',
          fillColor: '#818cf8',
          fillOpacity: 0.35
        }).addTo(mapInstance);
      }
    };

    const clearBoundary = () => {
      boundaryPoints.value = [];
      if (markersLayer) markersLayer.clearLayers();
      if (polygonInstance) {
        polygonInstance.remove();
        polygonInstance = null;
      }
    };

    const regions = computed(() => store.regions || []);

    const filteredRegions = computed(() => {
      if (!search.value.trim()) return regions.value;
      const q = search.value.toLowerCase();
      return regions.value.filter(r => 
        r.name?.toLowerCase().includes(q) || 
        r.country?.toLowerCase().includes(q) ||
        r.jurisdiction?.toLowerCase().includes(q)
      );
    });

    const openCreateModal = () => {
      isEdit.value = false;
      formError.value = '';
      form.id = '';
      form.name = '';
      form.country = '';
      form.jurisdiction = '';
      form.is_active = true;
      boundaryPoints.value = [];
      showModal.value = true;
      import('vue').then(({ nextTick }) => {
        nextTick(() => initMap([]));
      });
    };

    const openEditModal = (reg) => {
      isEdit.value = true;
      formError.value = '';
      form.id = reg.id;
      form.name = reg.name;
      form.country = reg.country;
      form.jurisdiction = reg.jurisdiction;
      form.is_active = reg.is_active;
      boundaryPoints.value = reg.boundary_points || [];
      showModal.value = true;
      import('vue').then(({ nextTick }) => {
        nextTick(() => initMap(reg.boundary_points || []));
      });
    };

    const closeModal = () => {
      showModal.value = false;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };

    const saveForm = async () => {
      formError.value = '';
      formLoading.value = true;
      try {
        if (isEdit.value) {
          await store.updateRegion({ ...form, boundary_points: boundaryPoints.value });
        } else {
          await store.createRegion({
            name: form.name,
            country: form.country,
            jurisdiction: form.jurisdiction,
            boundary_points: boundaryPoints.value
          });
        }
        closeModal();
        await store.fetchRegions();
      } catch (e) {
        formError.value = e.message || 'Operation failed';
      } finally {
        formLoading.value = false;
      }
    };

    const handleToggle = async (reg) => {
      actionLoading.value = reg.id;
      try {
        await store.toggleRegion(reg.id);
      } catch (e) {
        store.error = e.message || 'Toggle failed';
      } finally {
        actionLoading.value = null;
      }
    };

    const confirmDelete = (reg) => {
      deleteTarget.value = reg;
    };

    const handleDelete = async () => {
      if (!deleteTarget.value) return;
      const id = deleteTarget.value.id;
      actionLoading.value = id;
      try {
        await store.deleteRegion(id);
        deleteTarget.value = null;
      } catch (e) {
        store.error = e.message || 'Delete failed';
      } finally {
        actionLoading.value = null;
      }
    };

    onMounted(async () => {
      await store.fetchRegions();
    });

    return {
      search, showModal, isEdit, formLoading, actionLoading, formError, deleteTarget, form,
      boundaryPoints, clearBoundary,
      filteredRegions, openCreateModal, openEditModal, closeModal, saveForm, handleToggle, confirmDelete, handleDelete
    };
  }
};
</script>
