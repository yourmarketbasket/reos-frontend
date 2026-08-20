<template>
  <div class="min-h-screen bg-[#faf8f5] text-dark flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900">

    <!-- ===== STICKY HEADER ===== -->
    <header class="bg-white/90 backdrop-blur-md border-b border-brand-100/60 sticky top-0 z-50 w-full px-6 py-3.5 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3">
          <img src="/logo.png" class="w-7 h-7 object-contain flex-shrink-0" alt="REOS Logo" />
          <span class="font-heading font-bold text-lg tracking-wider text-dark uppercase">REOS</span>
        </router-link>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <a href="#featured" class="hover:text-brand-500 transition-colors">Featured</a>
        <a href="#residential" class="hover:text-brand-500 transition-colors">Residential</a>
        <a href="#short-stay" class="hover:text-brand-500 transition-colors">Short Stay</a>
        <a href="#commercial" class="hover:text-brand-500 transition-colors">Commercial</a>
        <a href="#all" class="hover:text-brand-500 transition-colors">All Listings</a>
      </nav>
      <div class="flex items-center gap-3">
        <router-link v-if="!isAuthenticated" to="/login" class="text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-brand-500 transition-colors">Sign In</router-link>
        <router-link v-if="!isAuthenticated" to="/login?signup=true" class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-sm">Get Started</router-link>
        <router-link v-if="isAuthenticated" to="/dashboard" class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-sm">Dashboard</router-link>
        <button v-if="isAuthenticated" @click="handleLogout" class="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-dark transition-colors">Log Out</button>
      </div>
    </header>

    <!-- ===== HERO FEATURED CAROUSEL ===== -->
    <section id="featured" class="relative overflow-hidden bg-slate-900" style="height:520px">
      <div class="relative w-full h-full">
        <div v-for="(l, idx) in featuredListings" :key="l.id" class="absolute inset-0 transition-opacity duration-700"
          :style="{ opacity: idx === heroIndex ? 1 : 0, zIndex: idx === heroIndex ? 1 : 0 }">
          <img :src="l.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80'" class="w-full h-full object-cover" :alt="l.title" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div class="max-w-3xl">
              <div class="flex items-center gap-3 mb-3">
                <span class="bg-brand-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">⭐ Featured</span>
                <span class="text-white/70 text-xs font-semibold uppercase tracking-wider">{{ l.listing_type?.replace(/_/g,' ') }}</span>
              </div>
              <h2 class="text-3xl md:text-4xl font-bold font-heading text-white leading-tight mb-2">{{ l.title }}</h2>
              <p class="text-white/70 text-sm leading-relaxed mb-6 max-w-xl line-clamp-2">{{ l.description }}</p>
              <div class="flex items-center gap-4 flex-wrap">
                <button @click="openApply(l)" class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg">Apply Now</button>
                <span class="text-white/60 text-xs font-semibold">KES {{ l.rent_amount?.toLocaleString() || l.deposit_amount?.toLocaleString() || 'Contact for Price' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="featuredListings.length === 0" class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <img src="/logo.png" class="w-16 h-16 object-contain opacity-20 mb-4" alt="REOS" />
          <p class="text-white/30 text-sm font-semibold">Featured listings coming soon</p>
        </div>
      </div>
      <template v-if="featuredListings.length > 1">
        <button @click="prevHero" class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-all z-10">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button @click="nextHero" class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white flex items-center justify-center transition-all z-10">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
        <div class="absolute bottom-4 right-8 flex gap-2 z-10">
          <button v-for="(_,i) in featuredListings" :key="i" @click="heroIndex=i"
            :class="['h-2 rounded-full transition-all bg-white/50', i===heroIndex ? 'w-5 bg-brand-400' : 'w-2']"></button>
        </div>
      </template>
    </section>

    <!-- ===== FILTER & SEARCH BAR ===== -->
    <section class="bg-white border-b border-slate-100 sticky top-[57px] z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Search by title, description, location…" class="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 bg-slate-50" />
        </div>
        <select v-model="filterType" class="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-brand-400">
          <option value="">All Types</option>
          <option value="rent">For Rent</option>
          <option value="sale">For Sale</option>
          <option value="short_stay">Short Stay</option>
          <option value="event_hourly">Event Spaces</option>
        </select>
        <div class="flex items-center gap-2 text-xs">
          <span class="text-slate-500 font-semibold whitespace-nowrap">Max KES</span>
          <input v-model.number="filterMaxPrice" type="number" placeholder="Any" min="0" class="w-24 border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-brand-400" />
        </div>
        <select v-model="filterFurnished" class="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-brand-400">
          <option value="">Any Furnishing</option>
          <option value="furnished">Furnished</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi_furnished">Semi-Furnished</option>
        </select>
        <select v-model="sortBy" class="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-brand-400">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <button v-if="hasFilters" @click="resetFilters" class="text-[11px] font-bold text-brand-600 hover:text-brand-800 transition-colors">Clear filters</button>
      </div>
    </section>

    <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-10 space-y-16">

      <!-- Residential -->
      <section id="residential" v-if="residentialListings.length">
        <div class="flex items-center justify-between mb-5">
          <div><h2 class="text-xl font-bold font-heading text-dark">🏠 Residential</h2><p class="text-xs text-slate-500 mt-0.5">Homes, apartments, and residential spaces</p></div>
          <span class="text-[11px] font-semibold text-slate-400">{{ residentialListings.length }} listings</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <property-card v-for="l in residentialListings.slice(0,8)" :key="l.id" :property="l" @apply="openApply(l)" />
        </div>
      </section>

      <!-- Short Stay -->
      <section id="short-stay" v-if="shortStayListings.length">
        <div class="flex items-center justify-between mb-5">
          <div><h2 class="text-xl font-bold font-heading text-dark">🌴 Short Stay &amp; Holiday</h2><p class="text-xs text-slate-500 mt-0.5">Holiday homes, rooms, serviced apartments</p></div>
          <span class="text-[11px] font-semibold text-slate-400">{{ shortStayListings.length }} listings</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <property-card v-for="l in shortStayListings.slice(0,8)" :key="l.id" :property="l" @apply="openApply(l)" />
        </div>
      </section>

      <!-- Commercial -->
      <section id="commercial" v-if="commercialListings.length">
        <div class="flex items-center justify-between mb-5">
          <div><h2 class="text-xl font-bold font-heading text-dark">🏢 Commercial &amp; Event</h2><p class="text-xs text-slate-500 mt-0.5">Offices, warehouses, workspaces</p></div>
          <span class="text-[11px] font-semibold text-slate-400">{{ commercialListings.length }} listings</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <property-card v-for="l in commercialListings.slice(0,8)" :key="l.id" :property="l" @apply="openApply(l)" />
        </div>
      </section>

      <!-- All Listings -->
      <section id="all">
        <div class="flex items-center justify-between mb-5">
          <div><h2 class="text-xl font-bold font-heading text-dark">All Listings</h2>
          <p class="text-xs text-slate-500 mt-0.5">{{ filteredListings.length }} listings match your search</p></div>
        </div>
        <div v-if="loading" class="flex items-center justify-center py-20">
          <span class="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
        <div v-else-if="filteredListings.length === 0" class="text-center py-20">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
          </div>
          <p class="text-sm font-semibold text-slate-500">No listings match your filters</p>
          <button @click="resetFilters" class="mt-3 text-xs font-bold text-brand-600 hover:underline">Clear all filters</button>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <property-card v-for="l in paginatedListings" :key="l.id" :property="l" @apply="openApply(l)" />
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
          <button @click="currentPage--" :disabled="currentPage === 1" class="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-50 disabled:opacity-40 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button v-for="p in totalPages" :key="p" @click="currentPage=p"
            :class="['w-9 h-9 rounded-xl border text-xs font-bold transition-all', currentPage===p ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 text-slate-600 hover:bg-brand-50']">{{ p }}</button>
          <button @click="currentPage++" :disabled="currentPage===totalPages" class="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-50 disabled:opacity-40 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>
    </main>

    <!-- APPLICATION MODAL -->
    <Teleport to="body">
      <div v-if="applyModal.open" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="applyModal.open=false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="modal-header">
            <div>
              <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Rental Application Form</h3>
              <p class="text-amber-600 text-[11px] font-semibold mt-0.5">{{ applyModal.listing?.title }}</p>
            </div>
            <button @click="applyModal.open=false" class="modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <!-- Auth gate -->
          <div v-if="!isAuthenticated" class="p-8 text-center">
            <div class="w-14 h-14 bg-brand-55 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <p class="text-sm font-bold text-slate-800 mb-1">Authentication Required</p>
            <p class="text-xs text-slate-500 mb-5">Create a free account or sign in to submit your evaluation metrics.</p>
            <div class="flex gap-3 justify-center">
              <router-link to="/login?signup=true&role=tenant&next=/browse" @click="applyModal.open=false" class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all">Create Account</router-link>
              <router-link to="/login?next=/browse" @click="applyModal.open=false" class="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-5 py-2.5 rounded-xl text-xs transition-all">Sign In</router-link>
            </div>
          </div>
          <!-- Form -->
          <form v-else @submit.prevent="submitApplication" class="p-6 space-y-4">
            <p class="text-[11px] text-slate-500">
              Submit your credit evaluation metrics, employment details, and occupants count to the Landlord matching engine.
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="form-label text-[10px]">Your Name</label><input v-model="applyForm.tenant_name" type="text" required class="form-input text-xs" placeholder="Full name" /></div>
              <div><label class="form-label text-[10px]">Phone Number</label><input v-model="applyForm.phone" type="tel" required class="form-input text-xs" placeholder="+2547XXXXXXXX" /></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="form-label text-[10px]">Employment / Current Role</label><input v-model="applyForm.employment" type="text" required class="form-input text-xs" placeholder="e.g. Engineer at Safaricom" /></div>
              <div><label class="form-label text-[10px]">Monthly Income (KES)</label><input v-model.number="applyForm.monthly_income" type="number" min="0" class="form-input text-xs" placeholder="e.g. 80000" /></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="form-label text-[10px]">Credit Score (300-850)</label><input v-model.number="applyForm.credit_score" type="number" min="300" max="850" class="form-input text-xs" /></div>
              <div><label class="form-label text-[10px]">Number of Occupants</label><input v-model.number="applyForm.occupants" type="number" min="1" max="20" class="form-input text-xs" /></div>
            </div>
            <div><label class="form-label text-[10px]">Additional Notes (optional)</label><textarea v-model="applyForm.notes" rows="2" class="form-input text-xs" placeholder="Tell the landlord anything relevant…"></textarea></div>
            <div v-if="applyError" class="text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded-lg">{{ applyError }}</div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="applyModal.open=false" class="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" :disabled="applyLoading" class="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all disabled:opacity-50">{{ applyLoading ? 'Submitting…' : 'Submit Application' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <footer class="border-t border-slate-100 bg-white py-6 px-6 text-center text-[11px] text-slate-400 font-semibold">
      © {{ new Date().getFullYear() }} REOS · Rental OS Platform · All rights reserved
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/store';

const PropertyCard = {
  name: 'PropertyCard',
  props: { property: Object },
  emits: ['apply'],
  template: `
    <div class="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        <div class="relative overflow-hidden h-44 bg-slate-100 flex-shrink-0">
          <img v-if="property.images?.[0]?.url" :src="property.images[0].url" :alt="property.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div v-else class="w-full h-full flex items-center justify-center bg-slate-50">
            <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
          </div>
          <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span class="bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{{ property.listing_type?.replace(/_/g,' ') }}</span>
          </div>
        </div>
        <div class="p-4 space-y-1">
          <h3 class="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{{ property.title }}</h3>
          <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{{ property.description }}</p>
        </div>
      </div>
      <div class="p-4 pt-0">
        <div class="flex items-center justify-between pt-3 border-t border-slate-100">
          <span class="text-xs font-extrabold text-indigo-600">KES {{ property.rent_amount?.toLocaleString() || property.deposit_amount?.toLocaleString() || 'Contact' }}</span>
          <button @click="$emit('apply', property)" class="bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all">Apply</button>
        </div>
      </div>
    </div>
  `
};

export default {
  name: 'BrowseView',
  components: { PropertyCard },
  setup() {
    const store = useAppStore();
    const router = useRouter();
    const loading = ref(true);
    const isAuthenticated = computed(() => store.isAuthenticated);

    const searchQuery = ref('');
    const filterType = ref('');
    const filterMaxPrice = ref(null);
    const filterFurnished = ref('');
    const sortBy = ref('newest');
    const currentPage = ref(1);
    const PAGE_SIZE = 12;

    const hasFilters = computed(() => searchQuery.value || filterType.value || filterMaxPrice.value || filterFurnished.value);
    const resetFilters = () => { searchQuery.value=''; filterType.value=''; filterMaxPrice.value=null; filterFurnished.value=''; sortBy.value='newest'; currentPage.value=1; };

    const allListings = computed(() => store.listings || []);
    const featuredListings = computed(() => allListings.value.slice(0, 3));

    const applyFilter = (list) => {
      let r = [...list];
      const q = searchQuery.value.toLowerCase().trim();
      if (q) r = r.filter(l => [l.title,l.description].some(f => f?.toLowerCase().includes(q)));
      if (filterType.value) r = r.filter(l => l.listing_type === filterType.value);
      if (filterMaxPrice.value) r = r.filter(l => (l.rent_amount||l.deposit_amount||0) <= filterMaxPrice.value);
      if (filterFurnished.value) r = r.filter(l => l.furnished === filterFurnished.value);
      if (sortBy.value==='newest') r.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      else if (sortBy.value==='price_asc') r.sort((a,b)=>(a.rent_amount||0)-(b.rent_amount||0));
      else if (sortBy.value==='price_desc') r.sort((a,b)=>(b.rent_amount||0)-(a.rent_amount||0));
      return r;
    };

    const residentialListings = computed(()=>applyFilter(allListings.value.filter(l=>l.listing_type === 'rent' || l.listing_type === 'sale')));
    const shortStayListings   = computed(()=>applyFilter(allListings.value.filter(l=>l.listing_type === 'short_stay')));
    const commercialListings  = computed(()=>applyFilter(allListings.value.filter(l=>l.listing_type === 'event_hourly')));
    const filteredListings    = computed(()=>applyFilter(allListings.value));
    const totalPages = computed(()=>Math.max(1,Math.ceil(filteredListings.value.length/PAGE_SIZE)));
    const paginatedListings = computed(()=>{ const s=(currentPage.value-1)*PAGE_SIZE; return filteredListings.value.slice(s,s+PAGE_SIZE); });
    watch(filteredListings,()=>{ currentPage.value=1; });

    const heroIndex = ref(0);
    let heroTimer = null;
    const nextHero=()=>{ heroIndex.value=(heroIndex.value+1)%Math.max(1,featuredListings.value.length); };
    const prevHero=()=>{ heroIndex.value=(heroIndex.value-1+Math.max(1,featuredListings.value.length))%Math.max(1,featuredListings.value.length); };
    const startAutoPlay=()=>{ heroTimer=setInterval(()=>{ if(featuredListings.value.length>1)nextHero(); },5000); };

    const applyModal = reactive({ open: false, listing: null });
    const applyForm = reactive({ tenant_name:'', phone:'', employment:'', monthly_income:null, credit_score:650, occupants:1, notes:'' });
    const applyLoading = ref(false);
    const applyError = ref('');

    const openApply = (l) => {
      applyModal.listing = l;
      applyModal.open = true;
      applyError.value = '';
      if (store.user) { applyForm.tenant_name = store.user.name||store.user.email||''; applyForm.phone = store.user.phone||''; }
    };

    const submitApplication = async () => {
      applyError.value=''; applyLoading.value=true;
      try {
        await store.createApplication(
          applyModal.listing?.id,
          applyModal.listing?.title,
          applyForm.tenant_name,
          store.user?.email || '',
          applyForm.phone,
          applyForm.employment,
          applyForm.monthly_income || 0,
          applyForm.occupants || 1,
          applyForm.credit_score || 650
        );
        applyModal.open=false;
      } catch(e) { applyError.value=e?.message||'Failed to submit. Please try again.'; }
      finally { applyLoading.value=false; }
    };

    const handleLogout = () => { store.logout(); router.push('/'); };

    onMounted(async()=>{ loading.value=true; await store.fetchListings(); loading.value=false; startAutoPlay(); });
    onUnmounted(()=>{ if(heroTimer)clearInterval(heroTimer); });

    return { loading, isAuthenticated, searchQuery, filterType, filterMaxPrice, filterFurnished, sortBy, hasFilters, resetFilters, allListings, featuredListings, residentialListings, shortStayListings, commercialListings, filteredListings, paginatedListings, currentPage, totalPages, heroIndex, nextHero, prevHero, applyModal, applyForm, applyLoading, applyError, openApply, submitApplication, handleLogout };
  }
};
</script>
