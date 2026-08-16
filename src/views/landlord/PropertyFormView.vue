<template>
  <div class="w-full space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">
          {{ isEdit ? 'Edit Property Details' : 'Add New Property Portfolio' }}
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Provide complete classification, utilities, features, and geographic assets.
        </p>
      </div>
      <button @click="goBack" class="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
        Cancel &amp; Back
      </button>
    </div>

    <!-- Tab Navigation -->
    <div class="flex border-b border-slate-200">
      <button v-for="tab in tabs" :key="tab.key"
        @click="currentTab = tab.key"
        :class="['px-4 py-2.5 text-xs font-bold border-b-2 transition-all', currentTab === tab.key ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-400 hover:text-slate-600']">
        {{ tab.label }}
      </button>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="submitForm" class="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      
      <!-- TAB 1: BASIC INFO -->
      <div v-if="currentTab === 'basic'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">Basic Classification</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Property Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Royal Crest Towers" class="form-input" />
          </div>
          <div>
            <label class="form-label">Slug Identifier (URL friendly)</label>
            <input v-model="form.slug" type="text" placeholder="e.g. royal-crest-towers" class="form-input" />
          </div>
        </div>

        <div>
          <label class="form-label">Description</label>
          <textarea v-model="form.description" rows="4" required placeholder="Describe the property architecture, location features, environment..." class="form-input"></textarea>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="form-label">Property Type</label>
            <select v-model="form.property_type" class="form-select">
              <option value="apartment">Apartment / Flat</option>
              <option value="bungalow">Bungalow</option>
              <option value="villa">Villa</option>
              <option value="townhouse">Townhouse</option>
              <option value="maisonette">Maisonette</option>
              <option value="duplex">Duplex</option>
              <option value="penthouse">Penthouse</option>
              <option value="studio">Studio Apartment</option>
              <option value="bedsitter">Bedsitter</option>
              <option value="commercial">Commercial Space</option>
              <option value="office">Office Block</option>
              <option value="warehouse">Warehouse</option>
              <option value="land">Land Plot</option>
              <option value="holiday_home">Holiday Home</option>
              <option value="hostel">Student Hostel</option>
            </select>
          </div>
          <div>
            <label class="form-label">Ownership Structure</label>
            <select v-model="form.ownership_type" class="form-select">
              <option value="freehold">Freehold</option>
              <option value="leasehold">Leasehold</option>
              <option value="sectional_title">Sectional Title</option>
            </select>
          </div>
          <div>
            <label class="form-label">Year Built</label>
            <input v-model.number="form.year_built" type="number" placeholder="2024" class="form-input" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Total Units</label>
            <input v-model.number="form.total_units" type="number" min="1" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Total Floors</label>
            <input v-model.number="form.total_floors" type="number" min="1" class="form-input" />
          </div>
        </div>
      </div>

      <!-- TAB 2: GEOGRAPHIC LOCATION -->
      <div v-if="currentTab === 'location'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">Operational Region &amp; Location</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">System Region</label>
            <select v-model="form.region_id" required class="form-select">
              <option value="" disabled>Select active region…</option>
              <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name }} ({{ r.country }})</option>
            </select>
          </div>
          <div>
            <label class="form-label">Jurisdiction Code</label>
            <input v-model="form.jurisdiction" type="text" placeholder="e.g. KE-NBI" class="form-input" />
          </div>
        </div>

        <div>
          <label class="form-label">Physical Address</label>
          <input v-model="form.address" type="text" required placeholder="Street address, block number..." class="form-input" />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="form-label">Neighbourhood</label>
            <input v-model="form.neighbourhood" type="text" placeholder="e.g. Kilimani" class="form-input" />
          </div>
          <div>
            <label class="form-label">City</label>
            <input v-model="form.city" type="text" required placeholder="Nairobi" class="form-input" />
          </div>
          <div>
            <label class="form-label">Country</label>
            <input v-model="form.country" type="text" required placeholder="Kenya" class="form-input" />
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4 space-y-3">
          <h4 class="text-xs font-bold text-slate-700 mb-1">Search &amp; Pin Location on Map</h4>
          <p class="text-[10px] text-slate-400">
            Type location names (e.g., "westlands nairobi" or "uthiru kikuyu") to accurately locate and auto-fill address specs.
          </p>
          <div class="flex gap-2">
            <input 
              v-model="locationSearchQuery" 
              type="text" 
              placeholder="e.g. Westlands Nairobi or Uthiru Kikuyu..." 
              class="form-input text-xs flex-grow"
              @keyup.enter="searchLocation"
            />
            <button 
              type="button" 
              @click="searchLocation" 
              :disabled="searchingLocation"
              class="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs disabled:opacity-50 shrink-0"
            >
              {{ searchingLocation ? 'Searching...' : 'Find on Map' }}
            </button>
          </div>

          <!-- Search Results Dropdown -->
          <div v-if="locationSearchResults.length > 0" class="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto text-xs divide-y divide-slate-100 relative z-25">
            <div 
              v-for="res in locationSearchResults" 
              :key="res.place_id" 
              @click="selectSearchResult(res)"
              class="p-2.5 hover:bg-indigo-50/50 cursor-pointer transition-colors"
            >
              <div class="font-semibold text-slate-800">{{ res.display_name }}</div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">Coords: {{ res.lat }}, {{ res.lon }}</div>
            </div>
          </div>
          <div v-else-if="noLocationResults" class="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
            No locations found in Kenya matching your query.
          </div>

          <div id="property-map" class="h-64 rounded-xl border border-slate-200 mt-1 relative z-10"></div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Latitude</label>
              <input v-model.number="latitude" type="number" step="any" required readonly class="form-input bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <label class="form-label">Longitude</label>
              <input v-model.number="longitude" type="number" step="any" required readonly class="form-input bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="flex items-center gap-2">
            <input v-model="form.is_gated" type="checkbox" id="prop-is-gated" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
            <label for="prop-is-gated" class="text-xs font-semibold text-slate-700">Located in a gated community</label>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.is_beachfront" type="checkbox" id="prop-is-beach" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
            <label for="prop-is-beach" class="text-xs font-semibold text-slate-700">Beachfront property</label>
          </div>
        </div>

        <div v-if="form.is_beachfront" class="grid grid-cols-2 gap-4 animate-slide-down">
          <div>
            <label class="form-label">Distance to Beach (meters)</label>
            <input v-model.number="form.beach_distance_m" type="number" placeholder="50" class="form-input" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="flex items-center gap-2">
            <input v-model="form.is_waterfront" type="checkbox" id="prop-is-waterfront" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
            <label for="prop-is-waterfront" class="text-xs font-semibold text-slate-700">Waterfront (lake / river)</label>
          </div>
          <div>
            <label class="form-label" v-if="form.is_waterfront">Water body name</label>
            <input v-if="form.is_waterfront" v-model="form.lake_river_name" type="text" placeholder="e.g. River Tana" class="form-input" />
          </div>
        </div>
      </div>

      <!-- TAB 3: UTILITIES & INFRASTRUCTURE -->
      <div v-if="currentTab === 'utilities'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">Utility Infrastructure</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Water Source</label>
            <select v-model="form.utilities.water" class="form-select">
              <option value="borehole">Borehole Water</option>
              <option value="municipal">Municipal / Council Water</option>
              <option value="shared_tank">Shared Tank Delivery</option>
              <option value="rainwater">Rainwater Harvesting</option>
              <option value="none">No Supply</option>
            </select>
          </div>
          <div>
            <label class="form-label">Water Reliability Status</label>
            <select v-model="form.utilities.water_status" class="form-select">
              <option value="available">Always Available (24/7)</option>
              <option value="intermittent">Intermittent / Rationed</option>
              <option value="unavailable">Unavailable / Dry</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Electricity Source</label>
            <select v-model="form.utilities.electricity" class="form-select">
              <option value="grid">National Grid (KPLC)</option>
              <option value="solar">Solar Power Plant</option>
              <option value="generator">Diesel Generator Backed</option>
              <option value="hybrid">Hybrid Solar/Grid</option>
            </select>
          </div>
          <div>
            <label class="form-label">Power Billing / Metering</label>
            <select v-model="form.utilities.electric_billing" class="form-select">
              <option value="prepaid_token">Prepaid Tokens (Own Meter)</option>
              <option value="meter">Postpaid Meter</option>
              <option value="shared">Shared Building Bill</option>
              <option value="included">Included in Rent</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Internet Infrastructure</label>
            <select v-model="form.utilities.internet" class="form-select">
              <option value="fibre">Fibre Optic Wired</option>
              <option value="dsl">DSL / Copper Line</option>
              <option value="satellite">Satellite (e.g. Starlink)</option>
              <option value="none">No Internet</option>
            </select>
          </div>
          <div v-if="form.utilities.internet !== 'none'">
            <label class="form-label">Default ISP Provider</label>
            <input v-model="form.utilities.internet_provider" type="text" placeholder="Safaricom, Zuku, Starlink..." class="form-input" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="form-label">Sewerage System</label>
            <select v-model="form.utilities.sewerage" class="form-select">
              <option value="municipal">Main Municipal Sewer</option>
              <option value="septic_tank">Septic Tank</option>
              <option value="biodigester">Biodigester Plant</option>
            </select>
          </div>
          <div>
            <label class="form-label">Garbage Disposal</label>
            <select v-model="form.utilities.garbage" class="form-select">
              <option value="private">Private Service Provider</option>
              <option value="municipal">Municipal Collection</option>
              <option value="self">Self Disposal</option>
            </select>
          </div>
          <div>
            <label class="form-label">Security System</label>
            <select v-model="form.utilities.security_system" class="form-select">
              <option value="manned_gate">Manned Gates Only</option>
              <option value="cctv">Manned + CCTV Cameras</option>
              <option value="alarm">Armed Response Alarm</option>
              <option value="electric_fence">Electric Fenced Boundary</option>
              <option value="combination">All Systems Integrated</option>
              <option value="none">Basic Locks Only</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TAB 4: AMENITIES & nearby -->
      <div v-if="currentTab === 'amenities'" class="space-y-6">
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-800">Building Infrastructure</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="flex items-center gap-2">
              <input v-model="form.has_elevator" type="checkbox" id="prop-elevator" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
              <label for="prop-elevator" class="text-xs font-semibold text-slate-700">Passenger Elevator</label>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.has_gym" type="checkbox" id="prop-gym" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
              <label for="prop-gym" class="text-xs font-semibold text-slate-700">Fitness Center / Gym</label>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.has_pool" type="checkbox" id="prop-pool" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
              <label for="prop-pool" class="text-xs font-semibold text-slate-700">Swimming Pool</label>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.has_rooftop" type="checkbox" id="prop-rooftop" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
              <label for="prop-rooftop" class="text-xs font-semibold text-slate-700">Accessible Rooftop terrace</label>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.has_backup_power" type="checkbox" id="prop-power" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
              <label for="prop-power" class="text-xs font-semibold text-slate-700">Automatic Backup Generator</label>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.has_child_play_area" type="checkbox" id="prop-play" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
              <label for="prop-play" class="text-xs font-semibold text-slate-700">Child Play Area</label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label class="form-label">Parking Spaces Available</label>
            <input v-model.number="form.parking_spaces" type="number" min="0" class="form-input" />
          </div>
          <div>
            <label class="form-label">Parking Facility Type</label>
            <select v-model="form.parking_type" class="form-select">
              <option value="basement">Basement Secured Parking</option>
              <option value="open">Open Yard Parking</option>
              <option value="street">Street Side Parking</option>
              <option value="none">No Parking Available</option>
            </select>
          </div>
        </div>

        <!-- Nearby facilities -->
        <div class="border-t border-slate-100 pt-4 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-700">Nearby Facility Landmarks</h4>
            <button type="button" @click="addNearby" class="text-[11px] font-bold text-brand-700 hover:underline">+ Add Facility</button>
          </div>
          
          <div v-for="(fac, idx) in form.nearby_facilities" :key="idx" class="flex gap-2 items-center animate-fade-in">
            <input v-model="fac.name" type="text" required placeholder="Facility name (e.g. Nairobi Hospital)" class="form-input text-xs" />
            <select v-model="fac.type" class="form-select text-xs w-40">
              <option value="school">School</option>
              <option value="hospital">Hospital / Clinic</option>
              <option value="mall">Shopping Mall</option>
              <option value="beach">Beach / Ocean</option>
              <option value="lake">Lake / River</option>
              <option value="highway">Major Highway</option>
              <option value="airport">Airport</option>
              <option value="gym">Gymnasium</option>
            </select>
            <input v-model.number="fac.distance_km" type="number" step="any" required placeholder="Km" class="form-input text-xs w-20" />
            <button type="button" @click="removeNearby(idx)" class="text-red-500 hover:text-red-700 p-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 5: MEDIA & UPLOADS -->
      <div v-if="currentTab === 'media'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">Property Image Assets</h3>

        <!-- File upload container -->
        <div class="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative cursor-pointer">
          <input type="file" multiple accept="image/*" @change="uploadFiles" class="absolute inset-0 opacity-0 cursor-pointer" />
          <svg class="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16j-1.5-1.5M16 11V7a4 4 0 00-8 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v4m-2-2h4" /></svg>
          <p class="text-xs font-bold text-slate-600">Drag &amp; drop images or click to browse</p>
          <p class="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG, WebP up to 10MB each</p>
        </div>

        <div v-if="uploading" class="flex items-center gap-2 text-xs text-brand-600 font-semibold justify-center">
          <span class="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          Uploading image assets to Nisoko Object Storage…
        </div>

        <!-- Render property images -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div v-for="(img, idx) in form.images" :key="idx" class="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex gap-3 relative">
            <img :src="img.url" class="w-20 h-20 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
            <div class="flex-grow space-y-2">
              <div class="flex items-center justify-between">
                <select v-model="img.category" class="form-select text-[11px] py-1 px-2 w-full max-w-[120px]">
                  <option value="exterior">Exterior</option>
                  <option value="interior">Interior</option>
                  <option value="floor_plan">Floor Plan</option>
                  <option value="amenity">Amenity</option>
                  <option value="neighbourhood">Neighborhood</option>
                  <option value="drone">Drone Shots</option>
                </select>
                <button type="button" @click="removeImage(idx)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
              <input v-model="img.caption" type="text" placeholder="Add image caption..." class="form-input text-xs py-1" />
              <div class="flex items-center gap-1.5">
                <input type="radio" :id="'cover-'+idx" :value="idx" :checked="img.is_cover" @change="setCover(idx)" class="text-brand-500 focus:ring-brand-400 h-3 w-3" />
                <label :for="'cover-'+idx" class="text-[10px] font-semibold text-slate-500">Set as Cover Image</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-between border-t border-slate-100 pt-4">
        <button type="button" @click="prevTab" :disabled="currentTabIndex === 0" class="border border-slate-200 text-slate-500 font-semibold px-4 py-2 rounded-xl text-xs disabled:opacity-40">
          Previous Step
        </button>
        
        <div class="flex gap-3">
          <button v-if="currentTabIndex < tabs.length - 1" type="button" @click="nextTab" class="bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2 rounded-xl text-xs">
            Next Step
          </button>
          <button v-else type="submit" :disabled="formLoading" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs disabled:opacity-55">
            {{ formLoading ? 'Submitting property…' : 'Submit Property for Approval' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'PropertyFormView',
  props: {
    propertyId: { type: String, default: '' }
  },
  emits: ['save', 'back'],
  setup(props, { emit }) {
    const store = useAppStore();
    const currentTab = ref('basic');
    const formLoading = ref(false);
    const uploading = ref(false);

    const isEdit = computed(() => !!props.propertyId);

    const tabs = [
      { key: 'basic', label: '1. Basic Details' },
      { key: 'location', label: '2. Location & Regions' },
      { key: 'utilities', label: '3. Utilities' },
      { key: 'amenities', label: '4. Amenities' },
      { key: 'media', label: '5. Image Gallery' }
    ];

    const currentTabIndex = computed(() => tabs.findIndex(t => t.key === currentTab.value));

    const form = reactive({
      id: '',
      name: '',
      slug: '',
      description: '',
      property_type: 'apartment',
      ownership_type: 'freehold',
      year_built: new Date().getFullYear(),
      total_units: 1,
      total_floors: 1,
      region_id: '',
      jurisdiction: '',
      address: '',
      neighbourhood: '',
      city: '',
      country: '',
      is_gated: false,
      is_beachfront: false,
      beach_distance_m: 0,
      is_waterfront: false,
      lake_river_name: '',
      altitude_m: 0,
      utilities: {
        water: 'borehole',
        water_status: 'available',
        electricity: 'grid',
        electric_billing: 'prepaid_token',
        gas: 'cylinder',
        internet: 'fibre',
        internet_provider: '',
        sewerage: 'municipal',
        garbage: 'private',
        security_system: 'cctv'
      },
      parking_spaces: 0,
      parking_type: 'open',
      has_elevator: false,
      has_gym: false,
      has_pool: false,
      has_rooftop: false,
      has_backup_power: false,
      has_child_play_area: false,
      has_conference_room: false,
      has_serviced_units: false,
      amenities: [],
      rules: [],
      nearby_facilities: [],
      images: [],
      location: {
        type: 'Point',
        coordinates: [36.8219, -1.2921] // default Nairobi
      }
    });

    const regions = computed(() => store.regions || []);

    // Leaflet map setup
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

    const initMap = async () => {
      const L = await loadLeaflet();
      const mapContainer = document.getElementById('property-map');
      if (!mapContainer) return;

      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }

      const defaultCenter = [-1.2921, 36.8219];
      const initialCenter = [latitude.value || -1.2921, longitude.value || 36.8219];

      mapInstance = L.map('property-map').setView(initialCenter, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      markersLayer = L.layerGroup().addTo(mapInstance);

      if (latitude.value && longitude.value) {
        L.marker([latitude.value, longitude.value]).addTo(markersLayer);
      }

      // Draw active region
      drawRegionBoundary(L);

      mapInstance.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        latitude.value = lat;
        longitude.value = lng;
        markersLayer.clearLayers();
        L.marker([lat, lng]).addTo(markersLayer);
      });
    };

    const drawRegionBoundary = (L) => {
      if (!mapInstance) return;
      if (polygonInstance) {
        polygonInstance.remove();
        polygonInstance = null;
      }

      const reg = regions.value.find(r => r.id === form.region_id);
      if (reg && reg.boundary_points && reg.boundary_points.length >= 3) {
        polygonInstance = L.polygon(reg.boundary_points, {
          color: '#4f46e5',
          fillColor: '#818cf8',
          fillOpacity: 0.25
        }).addTo(mapInstance);
        mapInstance.fitBounds(polygonInstance.getBounds());
      }
    };

    // Watch tab change to load map when location tab becomes active
    watch(() => currentTab.value, (newTab) => {
      if (newTab === 'location') {
        import('vue').then(({ nextTick }) => {
          nextTick(() => initMap());
        });
      }
    });

    // Watch region change to update boundary polygon and zoom
    watch(() => form.region_id, (newRegId) => {
      if (currentTab.value === 'location') {
        loadLeaflet().then((L) => {
          drawRegionBoundary(L);
        });
      }
    });

    const nextTab = () => {
      if (currentTabIndex.value < tabs.length - 1) {
        currentTab.value = tabs[currentTabIndex.value + 1].key;
      }
    };

    const prevTab = () => {
      if (currentTabIndex.value > 0) {
        currentTab.value = tabs[currentTabIndex.value - 1].key;
      }
    };

    const addNearby = () => {
      form.nearby_facilities.push({ name: '', type: 'school', distance_km: 0.1 });
    };

    const removeNearby = (idx) => {
      form.nearby_facilities.splice(idx, 1);
    };

    const setCover = (idx) => {
      form.images.forEach((img, i) => {
        img.is_cover = i === idx;
      });
    };

    const removeImage = (idx) => {
      form.images.splice(idx, 1);
    };

    const uploadFiles = async (event) => {
      const files = event.target.files;
      if (!files.length) return;
      uploading.value = true;
      try {
        for (let i = 0; i < files.length; i++) {
          const url = await store.uploadImage(files[i]);
          form.images.push({
            url,
            category: 'exterior',
            caption: '',
            is_cover: form.images.length === 0,
            sort_order: form.images.length
          });
        }
      } catch (e) {
        store.error = e.message || 'Image upload failed';
      } finally {
        uploading.value = false;
      }
    };

    const goBack = () => {
      emit('back');
    };

    const submitForm = async () => {
      formLoading.value = true;
      try {
        if (isEdit.value) {
          await store.updateProperty({ ...form });
        } else {
          await store.createPropertyDetailed({ ...form });
        }
        emit('save');
      } catch (e) {
        store.error = e.message || 'Failed to submit property portfolio';
      } finally {
        formLoading.value = false;
      }
    };

    const latitude = computed({
      get: () => form.location?.coordinates?.[1] ?? 0,
      set: (val) => {
        if (!form.location) {
          form.location = { type: 'Point', coordinates: [36.8219, -1.2921] };
        }
        if (!form.location.coordinates) {
          form.location.coordinates = [36.8219, -1.2921];
        }
        form.location.coordinates[1] = val;
      }
    });

    const longitude = computed({
      get: () => form.location?.coordinates?.[0] ?? 0,
      set: (val) => {
        if (!form.location) {
          form.location = { type: 'Point', coordinates: [36.8219, -1.2921] };
        }
        if (!form.location.coordinates) {
          form.location.coordinates = [36.8219, -1.2921];
        }
        form.location.coordinates[0] = val;
      }
    });

    const locationSearchQuery = ref('');
    const locationSearchResults = ref([]);
    const searchingLocation = ref(false);
    const noLocationResults = ref(false);

    const searchLocation = async () => {
      if (!locationSearchQuery.value.trim()) return;
      searchingLocation.value = true;
      noLocationResults.value = false;
      locationSearchResults.value = [];
      try {
        const query = encodeURIComponent(locationSearchQuery.value.trim());
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5&countrycodes=ke`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            locationSearchResults.value = data;
          } else {
            noLocationResults.value = true;
          }
        } else {
          noLocationResults.value = true;
        }
      } catch (err) {
        console.error('Geocoding search failed:', err);
        noLocationResults.value = true;
      } finally {
        searchingLocation.value = false;
      }
    };

    const selectSearchResult = (res) => {
      const lat = parseFloat(res.lat);
      const lon = parseFloat(res.lon);
      latitude.value = lat;
      longitude.value = lon;

      const addr = res.address || {};
      form.address = addr.road || addr.suburb || res.display_name;
      form.neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.village || '';
      form.city = addr.city || addr.town || addr.county || addr.city_district || 'Nairobi';
      form.country = addr.country || 'Kenya';

      if (!form.name) {
        form.name = addr.road || addr.suburb || 'Property ' + res.display_name.split(',')[0];
      }
      if (!form.slug) {
        form.slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      if (regions.value && regions.value.length > 0) {
        const match = regions.value.find(r => 
          r.name.toLowerCase().includes(form.city.toLowerCase()) || 
          form.city.toLowerCase().includes(r.name.toLowerCase())
        );
        if (match) {
          form.region_id = match.id;
        } else {
          form.region_id = regions.value[0].id;
        }
      }

      if (mapInstance && window.L) {
        mapInstance.setView([lat, lon], 15);
        markersLayer.clearLayers();
        window.L.marker([lat, lon]).addTo(markersLayer);
        drawRegionBoundary(window.L);
      }

      locationSearchResults.value = [];
      locationSearchQuery.value = '';
    };

    onMounted(async () => {
      await store.fetchRegions(true);
      if (isEdit.value) {
        const prop = store.properties.find(p => p.id === props.propertyId);
        if (prop) {
          const copy = JSON.parse(JSON.stringify(prop));
          if (!copy.location) {
            copy.location = { type: 'Point', coordinates: [36.8219, -1.2921] };
          } else if (!copy.location.coordinates || copy.location.coordinates.length < 2) {
            copy.location.coordinates = [36.8219, -1.2921];
          }
          if (!copy.utilities) {
            copy.utilities = {
              water: 'borehole',
              water_status: 'available',
              electricity: 'grid',
              electric_billing: 'prepaid_token',
              gas: 'cylinder',
              internet: 'fibre',
              internet_provider: '',
              sewerage: 'municipal',
              garbage: 'private',
              security_system: 'cctv'
            };
          }
          if (!copy.images) copy.images = [];
          if (!copy.amenities) copy.amenities = [];
          if (!copy.rules) copy.rules = [];
          if (!copy.nearby_facilities) copy.nearby_facilities = [];
          
          Object.assign(form, copy);
        }
      }
    });

    return {
      currentTab, formLoading, uploading, isEdit, tabs, currentTabIndex, form, regions,
      latitude, longitude,
      nextTab, prevTab, addNearby, removeNearby, setCover, removeImage, uploadFiles, goBack, submitForm,
      locationSearchQuery, locationSearchResults, searchingLocation, noLocationResults,
      searchLocation, selectSearchResult
    };
  }
};
</script>
