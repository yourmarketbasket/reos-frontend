<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h2 class="font-heading text-2xl font-bold text-slate-800">Properties & Units Listings</h2>
        <p class="text-xs text-slate-500 mt-1">Manage public advertising, pricing, commissions, and rental offerings.</p>
      </div>
      <div class="flex items-center gap-2">
        <button 
          v-if="isLandlord"
          @click="createNewListing"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Listing</span>
        </button>
      </div>
    </div>

    <!-- Filters & Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Listings</span>
          <span class="text-lg font-extrabold text-slate-800">{{ filteredListings.length }}</span>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Active Published</span>
          <span class="text-lg font-extrabold text-slate-800">{{ countStatus('approved') }}</span>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Pending Review</span>
          <span class="text-lg font-extrabold text-slate-800">{{ countStatus('pending_review') }}</span>
        </div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Draft / Rejected</span>
          <span class="text-lg font-extrabold text-slate-800">{{ countStatus('draft') + countStatus('rejected') }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredListings.length === 0" class="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-800">No Listings Found</h3>
        <p class="text-xs text-slate-500 mt-1">Get started by creating your first listing to advertise to prospective clients.</p>
      </div>
    </div>

    <!-- Listings Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in filteredListings" 
        :key="item.id" 
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow relative"
      >
        <!-- Status Label badge -->
        <span 
          :class="['absolute top-3 left-3 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-sm z-10', 
            item.status === 'approved' ? 'bg-emerald-500 text-white' : 
            item.status === 'pending_review' ? 'bg-amber-500 text-white' : 
            item.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white']"
        >
          {{ item.status }}
        </span>

        <!-- Cover Image -->
        <div class="h-44 w-full bg-slate-100 relative">
          <img 
            v-if="item.cover_image" 
            :src="item.cover_image" 
            class="w-full h-full object-cover" 
            alt="Listing Cover" 
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>

        <div class="p-5 flex-grow flex flex-col justify-between">
          <div class="space-y-2">
            <h3 class="font-heading font-bold text-slate-800 text-base line-clamp-1">{{ item.title }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            
            <div class="flex items-center gap-3 text-xs text-slate-600 font-semibold pt-1">
              <span>🛏️ {{ item.bedrooms || 1 }} Bed</span>
              <span>🚿 {{ item.bathrooms || 1 }} Bath</span>
              <span class="text-slate-300">|</span>
              <span class="text-indigo-600 uppercase tracking-wider text-[10px] font-bold">{{ item.property_type }}</span>
            </div>

            <!-- Price & Markup info -->
            <div class="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
              <div>
                <span class="text-[9px] text-slate-400 font-bold uppercase block">Owner Price</span>
                <span class="text-xs text-slate-500 font-bold">KES {{ formatPrice(item.base_rent) }}/mo</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-slate-400 font-bold uppercase block">Advertised Price (VAT/WHT)</span>
                <span class="text-sm text-emerald-600 font-extrabold">KES {{ formatPrice(item.rent_amount) }}/mo</span>
              </div>
            </div>

            <!-- Auto publish timer for review stage -->
            <div v-if="item.status === 'pending_review' && item.submitted_for_review_at" class="bg-amber-50 rounded-xl p-2.5 text-[10px] text-amber-700 font-semibold mt-3 flex items-center gap-1.5 border border-amber-100/50">
              <svg class="w-3.5 h-3.5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Auto-approving soon (In review)</span>
            </div>
            
            <div v-if="item.rejection_reason" class="bg-rose-50 rounded-xl p-2.5 text-[10px] text-rose-700 font-semibold mt-3 border border-rose-100/50">
              <span class="font-bold block uppercase mb-0.5">Rejection reason:</span>
              <p class="leading-relaxed font-normal">{{ item.rejection_reason }}</p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <!-- Landlord Edit -->
            <button 
              v-if="isLandlord"
              @click="editListing(item)" 
              class="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              📝 Edit
            </button>

            <!-- Support Admin / Superadmin Controls -->
            <button 
              v-if="isSupport && item.status === 'approved'"
              @click="promptUnpublish(item)" 
              class="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
            >
              🛑 Unpublish
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unpublish Modal overlay -->
    <div v-if="showUnpublishModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 class="font-heading text-lg font-bold text-slate-800">Unpublish Listing</h3>
        <p class="text-xs text-slate-500 leading-relaxed">Specify the exact reason for unpublishing this listing. The landlord will receive an automatic notification containing this explanation.</p>
        
        <textarea 
          v-model="unpublishReason" 
          rows="3" 
          placeholder="E.g. Pricing violation, copyright issue with cover photo, missing details..." 
          class="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        ></textarea>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showUnpublishModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50">Cancel</button>
          <button @click="submitUnpublish" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-xs shadow-sm">Confirm Unpublish</button>
        </div>
      </div>
    </div>

    <!-- Create Listing Modal overlay -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 class="font-heading text-lg font-bold text-slate-800">Create Public Listing</h3>
        <p class="text-xs text-slate-500 leading-relaxed">Select property and advertising option to create a public listing.</p>
        
        <div class="space-y-3">
          <div>
            <label class="form-label text-[10px]">Select Property</label>
            <select v-model="createForm.propertyId" required class="form-select text-xs">
              <option value="" disabled>Select property…</option>
              <option v-for="p in myProperties" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="form-label text-[10px]">Listing Type</label>
            <select v-model="createForm.listingType" required class="form-select text-xs">
              <option value="rent">Long-term rent</option>
              <option value="sale">Outright sale</option>
              <option value="short_stay">Short stay booking</option>
              <option value="event_hourly">Hourly event venue</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showCreateModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50">Cancel</button>
          <button @click="submitCreateListing" :disabled="!createForm.propertyId || !createForm.listingType" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm">Create Draft</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'ListingsView',
  setup() {
    const store = useAppStore();
    const showUnpublishModal = ref(false);
    const unpublishReason = ref('');
    const targetListing = ref(null);

    const showCreateModal = ref(false);
    const createForm = reactive({
      propertyId: '',
      listingType: 'rent'
    });

    const isLandlord = computed(() => ['landlord', 'agent', 'staff', 'caretaker'].includes(store.userRole));
    const isSupport = computed(() => store.userRole === 'support_admin' || store.userRole === 'superadmin');

    const myProperties = computed(() => store.properties || []);

    const filteredListings = computed(() => {
      const list = store.listings || [];
      if (isLandlord.value) {
        const propIDs = myProperties.value.map(p => p.id);
        return list.filter(l => l.landlord_id === store.user?.id || propIDs.includes(l.property_id));
      }
      return list;
    });

    const countStatus = (status) => {
      return filteredListings.value.filter(l => l.status === status).length;
    };

    const formatPrice = (val) => {
      if (!val) return '0';
      return val.toLocaleString();
    };

    const createNewListing = () => {
      createForm.propertyId = myProperties.value.length > 0 ? myProperties.value[0].id : '';
      createForm.listingType = 'rent';
      showCreateModal.value = true;
    };

    const submitCreateListing = async () => {
      if (!createForm.propertyId || !createForm.listingType) return;
      try {
        const res = await store.apiRequest('/api/listings/create', 'POST', {
          property_id: createForm.propertyId,
          listing_type: createForm.listingType,
          title: 'New Advertised Listing',
          description: 'Provide details about bedrooms, bathrooms, and features.',
          base_rent: 15000,
          rent_amount: 15000,
          status: 'draft'
        });
        if (store.listings) {
          store.listings.push(res);
        } else {
          store.listings = [res];
        }
        store.success = 'Draft listing created!';
        showCreateModal.value = false;
      } catch (err) {
        store.error = err.message || 'Failed to create listing';
      }
    };

    const editListing = (listing) => {
      const newTitle = prompt('Enter new listing title:', listing.title);
      if (newTitle) {
        store.apiRequest('/api/listings/update', 'POST', {
          ...listing,
          title: newTitle
        }).then((res) => {
          const idx = store.listings.findIndex(l => l.id === res.id);
          if (idx !== -1) store.listings[idx] = res;
          store.success = 'Listing updated successfully!';
        });
      }
    };

    const promptUnpublish = (listing) => {
      targetListing.value = listing;
      unpublishReason.value = '';
      showUnpublishModal.value = true;
    };

    const submitUnpublish = async () => {
      if (!unpublishReason.value) {
        alert('Reason is required');
        return;
      }
      try {
        await store.unpublishListing(targetListing.value.id, unpublishReason.value);
        showUnpublishModal.value = false;
      } catch (err) {
        alert(err.message);
      }
    };

    onMounted(async () => {
      await store.fetchProperties();
      await store.fetchListings();
    });

    return {
      store,
      isLandlord,
      isSupport,
      filteredListings,
      countStatus,
      formatPrice,
      createNewListing,
      editListing,
      promptUnpublish,
      showUnpublishModal,
      unpublishReason,
      submitUnpublish,
      showCreateModal,
      createForm,
      myProperties,
      submitCreateListing
    };
  }
};
</script>
