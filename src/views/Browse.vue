<template>
  <div class="min-h-screen bg-brand-50 text-dark flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900">
    <!-- Global Header -->
    <header class="bg-white/90 backdrop-blur-md border-b border-brand-100/60 sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between transition-all duration-200 shadow-sm">
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3">
          <img src="/logo.png" class="w-8 h-8 object-contain flex-shrink-0" alt="REOS Logo" />
          <span class="font-heading font-bold text-xl tracking-wider text-dark uppercase">REOS</span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <nav class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
        <router-link to="/#philosophy" class="hover:text-brand-500 transition-colors">Philosophy</router-link>
        <router-link to="/#portals" class="hover:text-brand-500 transition-colors">Portals</router-link>
        <router-link to="/#offerings" class="hover:text-brand-500 transition-colors">Offerings</router-link>
        <router-link to="/#features" class="hover:text-brand-500 transition-colors">Features</router-link>
        <router-link to="/browse" class="text-brand-500 transition-colors">Browse Listings</router-link>
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-4">
        <router-link 
          v-if="!isAuthenticated" 
          to="/login" 
          class="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-500 transition-colors px-2 py-2"
        >
          Sign In
        </router-link>
        <router-link 
          v-if="!isAuthenticated" 
          to="/login?signup=true" 
          class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
        >
          Get Started
        </router-link>
        
        <router-link 
          v-if="isAuthenticated" 
          to="/dashboard" 
          class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
        >
          Dashboard
        </router-link>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-dark transition-colors px-2 py-2"
        >
          Log Out
        </button>
      </div>
    </header>

    <!-- Browse Hero Section -->
    <section class="bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e6] border-b border-brand-100 py-16 px-6 text-center relative">
      <div class="max-w-4xl mx-auto space-y-6 relative z-10">
        <span class="inline-flex items-center text-xs uppercase font-extrabold text-brand-700 tracking-widest bg-brand-100 px-3.5 py-1.5 rounded-full border border-brand-200/50">
          Verified Property Directory
        </span>
        <h1 class="font-heading text-4xl sm:text-5xl font-extrabold text-dark tracking-tight leading-tight">
          Find your next verified space.
        </h1>
        <p class="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Search real-time listings for renting, leasing, short-stay bookings, event gardens, and media studios (podcast/filming) with digital passports and M-Pesa escrow safeguards.
        </p>

        <!-- Search Bar and Jurisdiction Filters Combined -->
        <div class="max-w-2xl mx-auto space-y-4 pt-4">
          <div class="relative shadow-sm rounded-xl">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by building name, county, or specific location..."
              class="w-full bg-white border border-brand-200 rounded-xl pl-12 pr-5 py-3.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200/50 transition-all text-slate-800"
            />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Quick Filters -->
          <div class="flex flex-wrap items-center justify-center gap-2">
            <span class="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mr-2">Filter County:</span>
            <button 
              @click="toggleJurisdiction('Nairobi City County')"
              :class="[
                'text-xs font-bold px-4 py-2 rounded-xl transition-all border shadow-sm flex items-center gap-1.5',
                selectedJurisdiction === 'Nairobi City County'
                  ? 'bg-dark text-white border-dark'
                  : 'bg-white text-slate-600 border-brand-100 hover:bg-brand-50'
              ]"
            >
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Nairobi
            </button>
            <button 
              @click="toggleJurisdiction('Kiambu County')"
              :class="[
                'text-xs font-bold px-4 py-2 rounded-xl transition-all border shadow-sm flex items-center gap-1.5',
                selectedJurisdiction === 'Kiambu County'
                  ? 'bg-dark text-white border-dark'
                  : 'bg-white text-slate-600 border-brand-100 hover:bg-brand-50'
              ]"
            >
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Kiambu
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Listings Body -->
    <section class="flex-grow py-16 px-6 max-w-7xl mx-auto w-full">
      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
        <div v-for="i in 3" :key="i" class="bg-white border border-brand-100 rounded-2xl p-6 space-y-6 shadow-sm">
          <div class="space-y-3">
            <div class="h-6 bg-slate-100 rounded w-2/3"></div>
            <div class="h-4 bg-slate-100 rounded w-1/3"></div>
          </div>
          <div class="space-y-2 pt-4">
            <div class="h-4 bg-slate-100 rounded w-full"></div>
            <div class="h-4 bg-slate-100 rounded w-5/6"></div>
          </div>
          <div class="h-20 bg-brand-50/50 rounded-xl"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProperties.length === 0" class="text-center py-20 bg-white border border-brand-100 rounded-3xl p-8 max-w-xl mx-auto shadow-sm animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-slate-300 mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="font-heading text-lg font-bold text-dark">No matching properties</h3>
        <p class="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          We couldn't find any verified properties matching your current filter settings. Try adjusting your search query or selecting a different county.
        </p>
      </div>

      <!-- Grid of Properties -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
        <div v-for="prop in filteredProperties" :key="prop.id" class="bg-white border border-brand-100 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-1">
          <!-- Property Hero Info -->
          <div class="p-6 flex-grow space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg border border-brand-100">
                {{ prop.jurisdiction }}
              </span>
              <span class="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                Verified
              </span>
            </div>
            
            <div class="space-y-1.5">
              <h3 class="font-heading text-xl font-bold text-dark group-hover:text-brand-600 transition-colors">{{ prop.name }}</h3>
              <p class="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Coordinates: {{ prop.location?.coordinates?.join(', ') || 'N/A' }}
              </p>
            </div>

            <!-- Amenities -->
            <div class="space-y-2">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Amenities Offered</span>
              <div class="flex flex-wrap gap-1.5">
                <span 
                  v-for="amenity in prop.amenities" 
                  :key="amenity" 
                  class="text-[10px] font-bold bg-brand-50 text-slate-600 border border-brand-100 rounded px-2.5 py-1"
                >
                  {{ amenity }}
                </span>
              </div>
            </div>

            <!-- Rules -->
            <div v-if="prop.rules && prop.rules.length > 0" class="space-y-2">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Property Policy Rules</span>
              <ul class="text-[11px] text-slate-500 space-y-1.5 pl-1 font-medium">
                <li v-for="rule in prop.rules" :key="rule" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full flex-shrink-0"></span>
                  {{ rule }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Units listing sub-module -->
          <div class="bg-brand-50/50 p-6 border-t border-brand-100">
            <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-3">Available Space & Units</span>
            
            <div v-if="!unitsMap[prop.id] || unitsMap[prop.id].length === 0" class="text-xs text-slate-400 italic py-3 text-center bg-white rounded-xl border border-brand-100/50">
              No units listed for this property.
            </div>

            <div v-else class="space-y-2.5">
              <div 
                v-for="unit in unitsMap[prop.id]" 
                :key="unit.id" 
                class="bg-white border border-brand-100 rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm hover:border-brand-200 transition-colors"
              >
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-xs text-dark">{{ unit.label }}</span>
                    <span v-if="unit.building_label" class="text-[9px] font-semibold text-slate-400">({{ unit.building_label }})</span>
                  </div>
                  <div class="text-[10px] text-slate-500 mt-1 font-medium">
                    Rent: <span class="font-bold text-dark">KES {{ unit.rent_amount.toLocaleString() }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <!-- Unit status badges -->
                  <span 
                    v-if="unit.status === 'available'" 
                    class="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 uppercase"
                  >
                    Available
                  </span>
                  <span 
                    v-else-if="unit.status === 'under_maintenance'" 
                    class="text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 uppercase"
                  >
                    Repair
                  </span>
                  <span 
                    v-else 
                    class="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase"
                  >
                    Occupied
                  </span>

                  <!-- Enquire trigger action -->
                  <button 
                    @click="enquireUnit(unit)"
                    class="text-[10px] bg-dark hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Verification Safety Guide -->
    <section class="bg-white py-20 px-6 border-y border-brand-100">
      <div class="max-w-5xl mx-auto">
        <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span class="text-xs uppercase font-extrabold text-brand-700 tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-200/50">
            Tenant Guidance Details
          </span>
          <h2 class="font-heading text-3xl font-extrabold text-dark">How to Secure a Unit via REOS</h2>
          <p class="text-slate-500 text-xs sm:text-sm">We enforce strict platform safety rules to completely eliminate renting scams</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Step 1 -->
          <div class="space-y-4">
            <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-heading font-extrabold text-base">1</div>
            <h3 class="font-heading text-base font-bold text-dark">Select & Verify</h3>
            <p class="text-slate-500 text-xs leading-relaxed">
              Explore listings. Each property contains GPS coordinates and verified title credentials to prove active landlord ownership.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="space-y-4">
            <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-heading font-extrabold text-base">2</div>
            <h3 class="font-heading text-base font-bold text-dark">Reserve Hold</h3>
            <p class="text-slate-500 text-xs leading-relaxed">
              Submit a hold fee to delist the unit for a viewing window. Refunding checks protect you if the property description was misrepresented.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="space-y-4">
            <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-heading font-extrabold text-base">3</div>
            <h3 class="font-heading text-base font-bold text-dark">Sign Digital Lease</h3>
            <p class="text-slate-500 text-xs leading-relaxed">
              A legally-binding lease agreement is generated automatically based on regional county policies. Sign directly inside the tenant portal.
            </p>
          </div>

          <!-- Step 4 -->
          <div class="space-y-4">
            <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-heading font-extrabold text-base">4</div>
            <h3 class="font-heading text-base font-bold text-dark">Deposit Escrow</h3>
            <p class="text-slate-500 text-xs leading-relaxed">
              Pay your deposit via automated M-Pesa locks. Funds are held in escrow, preventing unilateral landlord deduction withholding at move-out.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Global CTA Banner (Warm champagne backdrop) -->
    <section class="bg-brand-100/40 border-b border-brand-200/50 py-16 px-6 text-center">
      <div class="max-w-4xl mx-auto space-y-6">
        <h2 class="font-heading text-3xl sm:text-4xl font-extrabold text-dark">Join the digital rental revolution today.</h2>
        <p class="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Create your verified rental passport profile, link your properties, and automate your rental ledger balance in real-time.
        </p>
        <div class="pt-4 flex flex-wrap justify-center gap-4">
          <router-link 
            to="/login?signup=true" 
            class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm"
          >
            Create Your Account
          </router-link>
          <a 
            href="mailto:support@reos.co.ke" 
            class="border border-dark/20 hover:bg-brand-50 text-dark font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200"
          >
            Contact Integration Support
          </a>
        </div>
      </div>
    </section>

    <!-- Global Footer -->
    <footer class="bg-white border-t border-brand-100 py-16 px-6 text-slate-400 text-xs">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-brand-100 pb-12 mb-12">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img src="/logo.png" class="w-8 h-8 object-contain flex-shrink-0" alt="REOS Logo" />
            <span class="font-heading font-bold text-xl tracking-widest text-dark uppercase">REOS</span>
          </div>
          <p class="leading-relaxed text-slate-500">
            The infrastructure layer managing the complete property and tenancy transaction records across Kenyan counties.
          </p>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading text-sm font-bold text-dark uppercase tracking-wider">Product Offerings</h4>
          <ul class="space-y-2.5 text-slate-500 font-medium">
            <li><router-link to="/#offerings" class="hover:text-brand-500">Residential Systems</router-link></li>
            <li><router-link to="/#offerings" class="hover:text-brand-500">Student Housing Matching</router-link></li>
            <li><router-link to="/#offerings" class="hover:text-brand-500">Commercial Operations</router-link></li>
            <li><router-link to="/#offerings" class="hover:text-brand-500">Short-Term Calendars</router-link></li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading text-sm font-bold text-dark uppercase tracking-wider">Stakeholder Portals</h4>
          <ul class="space-y-2.5 text-slate-500 font-medium">
            <li><router-link to="/login" class="hover:text-brand-500">Landlords Portal</router-link></li>
            <li><router-link to="/login" class="hover:text-brand-500">Tenants Portal</router-link></li>
            <li><router-link to="/login" class="hover:text-brand-500">Caretakers Portal</router-link></li>
            <li><router-link to="/login" class="hover:text-brand-500">Leasing Agents Portal</router-link></li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading text-sm font-bold text-dark uppercase tracking-wider">Contact & System</h4>
          <p class="text-slate-500 leading-relaxed font-medium">
            REOS Kenya Platform<br/>
            Nairobi City County, Kenya
          </p>
          <p class="font-medium">Email: <a href="mailto:info@reos.co.ke" class="text-brand-500 hover:underline">info@reos.co.ke</a></p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p class="text-slate-500 font-medium">&copy; 2026 REOS Rental Ecosystem Operating Platform. All rights reserved.</p>
        <div class="flex gap-4 text-slate-500 font-medium">
          <a href="#" class="hover:text-brand-500">Terms of Service</a>
          <span>&middot;</span>
          <a href="#" class="hover:text-brand-500">Privacy Policy</a>
          <span>&middot;</span>
          <a href="#" class="hover:text-brand-500">Escrow Disclosures</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { useAppStore } from '@/stores/store';
import { useRouter } from 'vue-router';

export default {
  name: 'BrowseListingsPage',
  setup() {
    const store = useAppStore();
    const router = useRouter();
    
    const properties = ref([]);
    const unitsMap = ref({});
    const loading = ref(true);
    
    const searchQuery = ref('');
    const selectedJurisdiction = ref('');

    const isAuthenticated = computed(() => store.isAuthenticated);

    onMounted(async () => {
      try {
        loading.value = true;
        // Fetch properties (supports guest access)
        await store.fetchProperties();
        properties.value = store.properties;

        // Fetch units for each property
        for (const prop of properties.value) {
          try {
            const units = await store.apiRequest(`/api/units/list?property_id=${prop.id}`);
            unitsMap.value[prop.id] = units || [];
          } catch (err) {
            console.error(`Failed to load units for property ${prop.id}:`, err);
          }
        }
      } catch (e) {
        console.error('Error loading public listings:', e);
      } finally {
        loading.value = false;
      }
    });

    const handleLogout = () => {
      store.logout();
      router.push('/login');
    };

    const enquireUnit = (unit) => {
      if (!isAuthenticated.value) {
        // Redirect to register/login with query params
        router.push(`/login?signup=true&role=tenant&unit_id=${unit.id}`);
      } else {
        // Redirect to dashboard home
        router.push('/dashboard');
      }
    };

    const filteredProperties = computed(() => {
      return properties.value.filter(prop => {
        const matchesSearch = prop.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              (prop.jurisdiction && prop.jurisdiction.toLowerCase().includes(searchQuery.value.toLowerCase()));
        const matchesJurisdiction = !selectedJurisdiction.value || prop.jurisdiction === selectedJurisdiction.value;
        return matchesSearch && matchesJurisdiction;
      });
    });

    const toggleJurisdiction = (jur) => {
      if (selectedJurisdiction.value === jur) {
        selectedJurisdiction.value = '';
      } else {
        selectedJurisdiction.value = jur;
      }
    };

    return {
      properties,
      unitsMap,
      loading,
      searchQuery,
      selectedJurisdiction,
      filteredProperties,
      toggleJurisdiction,
      isAuthenticated,
      handleLogout,
      enquireUnit
    };
  }
};
</script>
