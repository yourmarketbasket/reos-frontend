<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <!-- Global Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg font-heading">
          R
        </div>
        <span class="font-heading font-bold text-xl tracking-tight text-slate-900">REOS</span>
      </div>

      <div class="flex items-center gap-4">
        <router-link 
          v-if="!isAuthenticated" 
          to="/login" 
          class="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign In
        </router-link>
        <router-link 
          v-if="!isAuthenticated" 
          to="/login?signup=true" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Get Started
        </router-link>
        
        <router-link 
          v-if="isAuthenticated" 
          to="/dashboard" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Go to Dashboard
        </router-link>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Log Out
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-white border-b border-slate-200 py-16 px-6 sm:py-24 text-center">
      <div class="max-w-3xl mx-auto">
        <span class="text-xs uppercase font-extrabold text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-full">
          Rental Ecosystem Operating System
        </span>
        <h1 class="font-heading text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-6 mb-6">
          Premium property management made incredibly simple.
        </h1>
        <p class="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          A unified, compliant platform for landlords, tenants, caretakers, and property agents. Discover available rental units, make seamless payments, and resolve disputes with absolute ease.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a 
            href="#listings" 
            class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            Browse Listings
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <router-link 
            to="/login?signup=true" 
            class="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Register as Landlord
          </router-link>
        </div>
      </div>
    </section>

    <!-- Listings Section -->
    <section id="listings" class="flex-grow py-16 px-6 max-w-7xl mx-auto w-full">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
        <div>
          <h2 class="font-heading text-2xl font-bold text-slate-900">Featured Properties</h2>
          <p class="text-xs text-slate-500 mt-1">Explore verified available units across various county jurisdictions</p>
        </div>
        <div class="flex gap-2">
          <span class="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            Nairobi City County
          </span>
          <span class="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            Kiambu County
          </span>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="bg-white border border-slate-200 rounded-xl p-6 animate-pulse space-y-4">
          <div class="h-6 bg-slate-200 rounded w-2/3"></div>
          <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          <div class="space-y-2 pt-4">
            <div class="h-4 bg-slate-200 rounded w-full"></div>
            <div class="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="properties.length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="font-heading text-lg font-bold text-slate-800">No properties available</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Landlords and Agents are currently updating their property catalogues. Please check back later.</p>
      </div>

      <!-- Grid of Properties -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="prop in properties" :key="prop.id" class="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <!-- Property Hero Info -->
          <div class="p-6 border-b border-slate-100 flex-grow">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                {{ prop.jurisdiction }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium">Added recently</span>
            </div>
            <h3 class="font-heading text-xl font-bold text-slate-900 mb-1">{{ prop.name }}</h3>
            <p class="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
              <!-- Location Pin Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              GPS: {{ prop.location?.coordinates?.join(', ') || 'N/A' }}
            </p>

            <!-- Amenities -->
            <div class="mb-4">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">Amenities Included</span>
              <div class="flex flex-wrap gap-1.5">
                <span 
                  v-for="amenity in prop.amenities" 
                  :key="amenity" 
                  class="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 rounded px-2 py-0.5"
                >
                  {{ amenity }}
                </span>
              </div>
            </div>

            <!-- Rules -->
            <div v-if="prop.rules && prop.rules.length > 0" class="mb-4">
              <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">Property Policy</span>
              <ul class="text-[11px] text-slate-500 space-y-1 pl-1">
                <li v-for="rule in prop.rules" :key="rule" class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  {{ rule }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Units listing sub-module -->
          <div class="bg-slate-50 p-6 border-t border-slate-100">
            <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-3">Available Space & Units</span>
            
            <div v-if="!unitsMap[prop.id] || unitsMap[prop.id].length === 0" class="text-xs text-slate-500 italic py-2 text-center">
              No units listed for this property.
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="unit in unitsMap[prop.id]" 
                :key="unit.id" 
                class="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-xs text-slate-800">{{ unit.label }}</span>
                    <span v-if="unit.building_label" class="text-[9px] text-slate-400">({{ unit.building_label }})</span>
                  </div>
                  <div class="text-[10px] text-slate-500 mt-0.5">
                    Rent: <span class="font-bold text-slate-700">KES {{ unit.rent_amount.toLocaleString() }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <!-- Unit status badges -->
                  <span 
                    v-if="unit.status === 'available'" 
                    class="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 uppercase"
                  >
                    Available
                  </span>
                  <span 
                    v-else-if="unit.status === 'under_maintenance'" 
                    class="text-[9px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded border border-orange-100 uppercase"
                  >
                    Maintenance
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
                    class="text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded transition-colors"
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

    <!-- Global Footer -->
    <footer class="bg-white border-t border-slate-200 py-12 px-6 text-center text-slate-400 text-xs">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm font-heading">
            R
          </div>
          <span class="font-heading font-bold text-base tracking-tight text-slate-800">REOS</span>
        </div>
        <p>&copy; 2026 REOS Rental Operating Platform. Nairobi, Kenya. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { useAppStore } from '@/stores/store';
import { useRouter } from 'vue-router';

export default {
  name: 'LandingPage',
  setup() {
    const store = useAppStore();
    const router = useRouter();
    
    const properties = ref([]);
    const unitsMap = ref({});
    const loading = ref(true);

    const isAuthenticated = computed(() => store.isAuthenticated);

    onMounted(async () => {
      try {
        loading.value = true;
        // Fetch properties (which supports guest access now)
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
        console.error('Error loading landing page listings:', e);
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
        // Redirect to register/login
        router.push(`/login?signup=true&role=tenant&unit_id=${unit.id}`);
      } else {
        // Redirect to dashboard home
        router.push('/dashboard');
      }
    };

    return {
      properties,
      unitsMap,
      loading,
      isAuthenticated,
      handleLogout,
      enquireUnit
    };
  }
};
</script>
