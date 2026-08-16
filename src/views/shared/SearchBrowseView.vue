<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          Marketplace Search
        </span>
        <h1 class="text-2xl font-bold text-slate-900 font-heading">Find Your Perfect Property</h1>
        <p class="text-sm text-slate-500 mt-0.5">Explore active rentals, properties for sale, event spaces, and short stays.</p>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
      <div>
        <label class="form-label text-[10px]">Search Term</label>
        <input 
          v-model="filters.query" 
          type="text" 
          placeholder="e.g. Westlands Executive Studio..." 
          class="form-input text-xs w-full mt-1"
        />
      </div>
      <div>
        <label class="form-label text-[10px]">Listing Category</label>
        <select v-model="filters.type" class="form-select text-xs w-full mt-1">
          <option value="">All Categories</option>
          <option value="rental">Rentals</option>
          <option value="sale">For Sale</option>
          <option value="short_stay">Short Stays</option>
          <option value="event_hourly">Event Spaces</option>
        </select>
      </div>
      <div>
        <label class="form-label text-[10px]">Max Price (KES)</label>
        <input 
          v-model.number="filters.maxPrice" 
          type="number" 
          placeholder="No limit" 
          class="form-input text-xs w-full mt-1"
        />
      </div>
      <div class="flex gap-2">
        <button 
          @click="resetFilters" 
          class="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2 rounded-xl text-xs transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Listings Grid -->
    <div v-if="pagedListings.length === 0" class="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mx-auto mb-4">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-slate-800">No properties match your filter</h3>
      <p class="text-xs text-slate-400 mt-1">Try broadening your search term or selecting another category.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="item in pagedListings" 
        :key="item.id" 
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <!-- Cover placeholder -->
          <div class="h-44 w-full bg-slate-150 relative">
            <img 
              v-if="item.cover_image" 
              :src="item.cover_image" 
              class="w-full h-full object-cover" 
              alt="Cover Image" 
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
              <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span class="absolute top-3 left-3 bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm z-10">
              {{ item.listing_type.replace('_', ' ') }}
            </span>
          </div>

          <div class="p-5 space-y-2.5">
            <h3 class="font-bold text-slate-800 text-base line-clamp-1">{{ item.title }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            
            <div class="flex items-center gap-3 text-xs text-slate-600 font-semibold pt-1">
              <span>🛏️ {{ item.bedrooms || 1 }} Bed</span>
              <span>🚿 {{ item.bathrooms || 1 }} Bath</span>
              <span class="text-slate-200">|</span>
              <span class="text-indigo-600 font-extrabold uppercase text-[9px]">{{ item.listing_type }}</span>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center rounded-b-2xl">
          <div class="text-left">
            <span class="text-[9px] text-slate-400 font-bold uppercase block">Price</span>
            <span class="text-base font-extrabold text-indigo-600">KES {{ formatPrice(getDisplayPrice(item)) }}</span>
          </div>
          <button 
            @click="openDetails(item)"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs shadow-sm transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <PaginationBar
      v-if="pagedListings.length > 0"
      :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
      :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers"
      :page-size="pageSize"
      @prev="prevPage" @next="nextPage" @go="goToPage"
      @update:pageSize="pageSize = $event"
      class="pt-4"
    />

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="selectedListing" class="modal-overlay">
        <div class="modal-backdrop" @click="selectedListing = null"></div>
        <div class="modal-panel max-w-lg">
          <div class="modal-header border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold text-slate-900 font-heading">Listing Specifications</h3>
            <button @click="selectedListing = null" class="text-slate-400 hover:text-slate-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="space-y-4 pt-3 text-xs leading-relaxed text-slate-600">
            <div class="h-48 w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
              <img 
                v-if="selectedListing.cover_image" 
                :src="selectedListing.cover_image" 
                class="w-full h-full object-cover" 
                alt="Modal Cover" 
              />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>

            <div>
              <h4 class="font-extrabold text-slate-800 text-sm mb-1">{{ selectedListing.title }}</h4>
              <p class="text-slate-600 leading-relaxed">{{ selectedListing.description }}</p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Bedrooms</span>
                <span class="font-bold text-slate-800">{{ selectedListing.bedrooms || 1 }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Bathrooms</span>
                <span class="font-bold text-slate-800">{{ selectedListing.bathrooms || 1 }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Furnished</span>
                <span class="font-bold text-slate-800 capitalize">{{ selectedListing.furnished || 'unfurnished' }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Pricing Type</span>
                <span class="font-bold text-slate-800 uppercase">{{ selectedListing.listing_type }}</span>
              </div>
            </div>

            <!-- Apply / Reserve prompt actions -->
            <div class="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-4">
              <div>
                <span class="text-slate-400 font-bold block uppercase text-[9px]">Price Rate</span>
                <span class="text-lg font-black text-indigo-600">KES {{ formatPrice(getDisplayPrice(selectedListing)) }}</span>
              </div>

              <!-- Only show Apply button if listing type is rental (or if tenant) -->
              <button 
                v-if="selectedListing.listing_type === 'rental' || selectedListing.listing_type === 'coworking' || selectedListing.listing_type === 'storage'"
                @click="startApplication(selectedListing)"
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all"
              >
                Apply for Lease
              </button>
              <button 
                v-else
                @click="startBooking(selectedListing)"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all"
              >
                Reserve Space / Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Application Form Modal -->
    <Teleport to="body">
      <div v-if="showApplyModal" class="modal-overlay">
        <div class="modal-backdrop" @click="showApplyModal = false"></div>
        <div class="modal-panel max-w-md">
          <div class="modal-header border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 class="text-base font-bold text-slate-900 font-heading">Rental Application</h3>
            <button @click="showApplyModal = false" class="text-slate-400 hover:text-slate-700 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitApplication" class="space-y-4 pt-3">
            <p class="text-xs text-slate-500">
              Submit your credit evaluation metrics, employment details, and occupants count to the Landlord matching engine.
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label text-[10px]">Your Name</label>
                <input v-model="applyForm.tenantName" type="text" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label text-[10px]">Contact Phone</label>
                <input v-model="applyForm.phone" type="text" required class="form-input text-xs" />
              </div>
            </div>
            <div>
              <label class="form-label text-[10px]">Employment / Current Role</label>
              <input v-model="applyForm.employment" type="text" placeholder="e.g. Accountant at Safaricom" required class="form-input text-xs" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label text-[10px]">Monthly Income (KES)</label>
                <input v-model.number="applyForm.monthlyIncome" type="number" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label text-[10px]">Credit Score (300-850)</label>
                <input v-model.number="applyForm.creditScore" type="number" min="300" max="850" required class="form-input text-xs" />
              </div>
            </div>
            <div>
              <label class="form-label text-[10px]">Number of Occupants</label>
              <input v-model.number="applyForm.occupants" type="number" min="1" required class="form-input text-xs" />
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" @click="showApplyModal = false" class="btn border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs">Cancel</button>
              <button type="submit" :disabled="submitting" class="btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-50">Submit Application</button>
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
  name: 'SearchBrowseView',
  setup() {
    const store = useAppStore();
    const selectedListing = ref(null);
    const showApplyModal = ref(false);
    const submitting = ref(false);

    const filters = reactive({
      query: '',
      type: '',
      maxPrice: null
    });

    const applyForm = reactive({
      listingId: '',
      listingTitle: '',
      tenantName: '',
      email: '',
      phone: '',
      employment: '',
      monthlyIncome: 0,
      occupants: 1,
      creditScore: 650
    });

    const activeListings = computed(() => {
      // Filter list to published/approved listings
      const list = store.listings || [];
      return list.filter(l => l.status === 'approved' || l.status === 'published');
    });

    const filteredListings = computed(() => {
      let list = activeListings.value;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        list = list.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
      }
      if (filters.type) {
        list = list.filter(l => l.listing_type === filters.type);
      }
      if (filters.maxPrice) {
        list = list.filter(l => getDisplayPrice(l) <= filters.maxPrice);
      }
      return list;
    });

    const getDisplayPrice = (l) => {
      if (!l) return 0;
      if (l.listing_type === 'sale' && l.sale_details) {
        return l.sale_details.asking_price;
      }
      if (l.listing_type === 'short_stay' && l.short_stay_details) {
        return l.short_stay_details.nightly_rate;
      }
      if (l.listing_type === 'event_hourly' && l.event_rental_details) {
        return l.event_rental_details.hourly_rate;
      }
      return l.rent_amount || l.base_rent;
    };

    const loadData = async () => {
      await store.fetchListings();
      // Auto-prefill applicant details
      if (store.user) {
        applyForm.tenantName = store.user.name || '';
        applyForm.email = store.user.email || '';
        applyForm.phone = store.user.phone || '';
      }
    };

    const resetFilters = () => {
      filters.query = '';
      filters.type = '';
      filters.maxPrice = null;
    };

    const openDetails = (item) => {
      selectedListing.value = item;
    };

    const startApplication = (item) => {
      applyForm.listingId = item.id;
      applyForm.listingTitle = item.title;
      selectedListing.value = null;
      showApplyModal.value = true;
    };

    const submitApplication = async () => {
      submitting.value = true;
      try {
        await store.createApplication(
          applyForm.listingId,
          applyForm.listingTitle,
          applyForm.tenantName,
          applyForm.email,
          applyForm.phone,
          applyForm.employment,
          applyForm.monthlyIncome,
          applyForm.occupants,
          applyForm.creditScore
        );
        showApplyModal.value = false;
      } catch (err) {
        alert(err.message);
      } finally {
        submitting.value = false;
      }
    };

    const startBooking = async (item) => {
      // Direct booking reservation details
      const confirmBooking = confirm(`Would you like to initiate booking reservation for ${item.title}?`);
      if (!confirmBooking) return;
      try {
        // Mock reserve booking
        alert("Booking request sent! Landlord notified for validation.");
        selectedListing.value = null;
      } catch (e) {
        console.error(e);
      }
    };

    const formatPrice = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(loadData);

    const { paginatedItems: pagedListings, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(filteredListings);

    return {
      filters,
      selectedListing,
      showApplyModal,
      applyForm,
      submitting,
      resetFilters,
      openDetails,
      getDisplayPrice,
      startApplication,
      submitApplication,
      startBooking,
      formatPrice,
      store,
      pagedListings,
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
