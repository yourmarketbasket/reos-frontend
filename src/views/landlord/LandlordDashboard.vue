<template>
  <div class="space-y-8 animate-fade-in pb-12">
    <!-- Header banner -->
    <div class="flex justify-between items-center bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-slate-800">Landlord Workspace</h1>
        <p class="text-xs text-slate-500 mt-1">Manage real estate inventory, publish listings, invite staff, and track verification tiers.</p>
      </div>
      <div class="flex gap-2">
        <button @click="openAddListing" class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Publish Listing
        </button>
        <button @click="navigateToAddProperty" :disabled="properties.length >= (stats?.verification?.granted_snapshot?.property_cap || 100)" class="btn border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold px-4 py-2 flex items-center gap-1.5 disabled:opacity-50">
          Add Property
        </button>
      </div>
    </div>

    <!-- Verification Tier & Capacity Ladder Card (Section 5) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center">
            <h2 class="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">Verification Level Ladder</h2>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              Tier {{ stats?.verification?.current_tier_level || 1 }} active
            </span>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Property Capacity Cap</span>
              <span class="font-semibold text-slate-700 text-xs mt-1 block">
                {{ stats?.verification?.granted_snapshot?.property_cap > 0 ? stats?.verification?.granted_snapshot?.property_cap + ' properties' : 'Unlimited' }}
              </span>
            </div>
            <div>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Portfolio Usage</span>
              <span class="font-semibold text-slate-700 text-xs mt-1 block">
                {{ properties.length }} / {{ stats?.verification?.granted_snapshot?.property_cap > 0 ? stats?.verification?.granted_snapshot?.property_cap : '∞' }}
              </span>
            </div>
            <div class="col-span-2 md:col-span-1">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Unlocked Gating Types</span>
              <span class="font-semibold text-indigo-600 text-xs mt-1 block truncate" :title="stats?.verification?.granted_snapshot?.unlocked_listing_types?.join(', ')">
                {{ stats?.verification?.granted_snapshot?.unlocked_listing_types?.join(', ') || 'rental, storage' }}
              </span>
            </div>
          </div>

          <!-- Sequential upgrade checklist -->
          <div class="mt-4 pt-3 border-t border-indigo-100 flex items-center gap-3">
            <span class="text-[10px] text-slate-500 font-medium">Upgrade Sequential Ladder:</span>
            <button 
              v-if="stats?.verification?.current_tier_level === 1" 
              @click="triggerUpgrade(2)" 
              class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded px-2.5 py-1 text-[9px] font-bold"
            >
              Unlock Tier 2 (Verified Host)
            </button>
            <button 
              v-else-if="stats?.verification?.current_tier_level === 2" 
              @click="triggerUpgrade(3)" 
              class="btn bg-purple-600 hover:bg-purple-700 text-white rounded px-2.5 py-1 text-[9px] font-bold"
            >
              Unlock Tier 3 (Full Access / Sales)
            </button>
            <span v-else class="text-[9px] text-emerald-600 font-bold">✓ Maximum Level Unlocked</span>
          </div>
        </div>
      </div>

      <!-- Landlord Portfolio usage gauge -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Property Capacity Gauge</span>
          <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
            <div 
              class="h-full bg-indigo-600 transition-all duration-500" 
              :style="{ width: stats?.verification?.granted_snapshot?.property_cap > 0 ? (properties.length / stats?.verification?.granted_snapshot?.property_cap * 100) + '%' : '10%' }"
            ></div>
          </div>
        </div>
        <p class="text-[9px] text-slate-400 leading-normal mt-3 italic">
          Config changes are forward-only and snapshot granted limits automatically (Rule 5.4).
        </p>
      </div>
    </div>

    <!-- Analytics metrics ribbon -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
        <div class="flex items-baseline gap-1 mt-2">
          <span class="text-xs text-slate-500 font-semibold">KES</span>
          <span class="text-2xl font-bold font-heading text-slate-800">{{ formatCurrency(stats?.total_revenue || 0) }}</span>
        </div>
        <p class="text-[10px] text-emerald-600 font-semibold mt-2">Cleared ledger settlements</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Tenants</span>
        <span class="text-2xl font-bold font-heading text-slate-800 mt-2 block">{{ stats?.active_tenants || 0 }}</span>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Occupied leases</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Managed Properties</span>
        <span class="text-2xl font-bold font-heading text-slate-800 mt-2 block">{{ stats?.properties_count || 0 }}</span>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Active real estate assets</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Support Staff Members</span>
        <span class="text-2xl font-bold font-heading text-indigo-600 mt-2 block">{{ stats?.staff_count || 0 }}</span>
        <p class="text-[10px] text-slate-500 font-semibold mt-2">Assigned field team members</p>
      </div>
    </div>

    <!-- Active Listings list and creation form -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 class="text-sm font-bold font-heading text-slate-800 mb-4 uppercase tracking-wider">Active Published Listings</h2>
        
        <div v-if="listings.length === 0" class="text-center py-10 text-xs text-slate-400 font-medium">
          No listings currently published. Click "Publish Listing" to register one.
        </div>
        <div v-else class="space-y-4">
          <div v-for="l in listings" :key="l.id" class="p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors flex justify-between items-center">
            <div>
              <span class="text-xs font-bold text-slate-800">Listing: {{ l.listing_type.replace('_', ' ') }}</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">Property ID: {{ l.property_id }}</span>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-slate-800 block">
                KES {{ formatCurrency(l.listing_type === 'sale' ? l.sale_details?.asking_price : (l.listing_type === 'short_stay' ? l.short_stay_details?.nightly_rate : l.rent_amount)) }}
              </span>
              <span class="badge text-[9px] badge-success mt-1 capitalize">{{ l.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Field Team management widget -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 class="font-heading font-bold text-slate-800 text-sm uppercase tracking-wider">My Field Representatives</h3>
        
        <div v-if="team.length === 0" class="text-center py-6 text-[10px] text-slate-400 font-medium">
          No team staff members invited yet.
        </div>
        <div v-else class="space-y-2">
          <div v-for="member in team" :key="member.id" class="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors flex justify-between items-center">
            <div>
              <span class="text-[11px] font-bold text-slate-800">{{ member.staff_user_id }}</span>
              <span class="text-[9px] text-slate-400 block mt-0.5">Status: {{ member.status }}</span>
            </div>
            <span class="text-[10px] text-indigo-600 font-semibold">Active</span>
          </div>
        </div>

        <button @click="showInviteStaffModal = true" class="w-full btn border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 rounded-xl text-xs">
          Invite Field Staff
        </button>
      </div>
    </div>

    <!-- Modal: Add Property -->
    <Teleport to="body">
      <div v-if="showAddPropertyModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Add New Property</h3>
            <button @click="showAddPropertyModal = false" class="modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitAddProperty" class="space-y-4">
            <div>
              <label class="form-label">Property Name</label>
              <input v-model="propertyForm.name" type="text" placeholder="e.g. Lavender Crest Complex" required class="form-input text-xs" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Latitude</label>
                <input v-model.number="propertyForm.latitude" type="number" step="any" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label">Longitude</label>
                <input v-model.number="propertyForm.longitude" type="number" step="any" required class="form-input text-xs" />
              </div>
            </div>
            <div>
              <label class="form-label">Jurisdiction Region</label>
              <select v-model="propertyForm.jurisdiction" class="form-select text-xs">
                <option value="Nairobi City County">Nairobi City County</option>
                <option value="Kiambu County">Kiambu County</option>
                <option value="Mombasa County">Mombasa County</option>
              </select>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showAddPropertyModal = false" class="btn border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs px-4 py-2 font-semibold">Cancel</button>
              <button type="submit" class="btn bg-brand-500 hover:bg-brand-600 text-dark rounded-lg text-xs px-4 py-2 font-semibold">Create Property</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Publish Listing -->
    <Teleport to="body">
      <div v-if="showAddListingModal" class="modal-overlay">
        <div class="modal-container" style="max-width: 540px;">
          <div class="modal-header">
            <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Publish Listing</h3>
            <button @click="showAddListingModal = false" class="modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitListing" class="space-y-4">
            <div>
              <label class="form-label">Target Property</label>
              <select v-model="listingForm.propertyId" required class="form-select text-xs">
                <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Listing Category Type</label>
              <select v-model="listingForm.listingType" required class="form-select text-xs">
                <option value="rental">Rental Unit</option>
                <option value="storage">Storage Space</option>
                <option value="short_stay">Short-Stay (Airbnb-style)</option>
                <option value="event_hourly">Event / Hourly Rental</option>
                <option value="sale">Property Sale</option>
              </select>
            </div>
            <div v-if="listingForm.listingType === 'rental' || listingForm.listingType === 'storage'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Monthly Rent (KES)</label>
                <input v-model.number="listingForm.rentAmount" type="number" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label">Security Deposit (KES)</label>
                <input v-model.number="listingForm.depositAmount" type="number" required class="form-input text-xs" />
              </div>
            </div>
            <div v-if="listingForm.listingType === 'short_stay'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nightly Rate (KES)</label>
                <input v-model.number="shortStayDetails.nightlyRate" type="number" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label">Min Nights</label>
                <input v-model.number="shortStayDetails.minNights" type="number" required class="form-input text-xs" />
              </div>
            </div>
            <div v-if="listingForm.listingType === 'event_hourly'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Hourly Rate (KES)</label>
                <input v-model.number="eventDetails.hourlyRate" type="number" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label">Event Type Category</label>
                <input v-model="eventDetails.eventType" type="text" placeholder="e.g. podcast studio" required class="form-input text-xs" />
              </div>
            </div>
            <div v-if="listingForm.listingType === 'sale'" class="grid grid-cols-1 gap-4">
              <div>
                <label class="form-label">Asking Sales Price (KES)</label>
                <input v-model.number="saleDetails.askingPrice" type="number" required class="form-input text-xs" />
              </div>
              <div>
                <label class="form-label">Title Deed Reference</label>
                <input v-model="saleDetails.titleDeedRef" type="text" placeholder="Ref Title Deed" required class="form-input text-xs" />
              </div>
            </div>
            <div v-if="isTierGated" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-xs font-semibold">
              Warning: The selected listing type is locked by your current verification level tier. Sequential upgrade required!
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showAddListingModal = false" class="btn border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs px-4 py-2 font-semibold">Cancel</button>
              <button type="submit" :disabled="isTierGated" class="btn bg-brand-500 hover:bg-brand-600 text-dark rounded-lg text-xs px-4 py-2 font-semibold disabled:opacity-50">Publish Listing</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Invite Staff -->
    <Teleport to="body">
      <div v-if="showInviteStaffModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Invite Field Representative Staff</h3>
            <button @click="showInviteStaffModal = false" class="modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitInviteStaff" class="space-y-4">
            <div>
              <label class="form-label">Staff Email Address</label>
              <input v-model="staffForm.email" type="email" placeholder="staff@example.com" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label">Phone Number</label>
              <input v-model="staffForm.phone" type="text" placeholder="+2547XXXXXXXX" required class="form-input text-xs" />
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="showInviteStaffModal = false" class="btn border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs px-4 py-2 font-semibold">Cancel</button>
              <button type="submit" class="btn bg-brand-500 hover:bg-brand-600 text-dark rounded-lg text-xs px-4 py-2 font-semibold">Send Invitation</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();

    const router = useRouter();

    const showAddPropertyModal = ref(false);
    const showAddListingModal = ref(false);
    const showInviteStaffModal = ref(false);

    const properties = computed(() => store.properties);
    const listings = computed(() => store.listings);
    const team = computed(() => store.team);
    const stats = computed(() => store.dashboardStats);

    const propertyForm = reactive({
      name: '',
      latitude: -1.2921,
      longitude: 36.8219,
      jurisdiction: 'Nairobi City County'
    });

    const listingForm = reactive({
      propertyId: '',
      listingType: 'rental',
      rentAmount: 30000,
      depositAmount: 30000
    });

    const shortStayDetails = reactive({
      nightlyRate: 4500,
      minNights: 2,
      maxGuests: 4,
      cleaningFee: 1500,
      cancellationPolicy: 'flexible'
    });

    const eventDetails = reactive({
      hourlyRate: 2500,
      minHours: 3,
      eventType: 'photoshoot',
      damageDeposit: 10000
    });

    const saleDetails = reactive({
      askingPrice: 8500000,
      titleDeedRef: 'NBI/REG/54321',
      landReferenceNumber: 'LR-129-NBI'
    });

    const staffForm = reactive({
      email: '',
      phone: ''
    });

    const isTierGated = computed(() => {
      const allowed = stats.value?.verification?.granted_snapshot?.unlocked_listing_types || ['rental', 'storage'];
      return !allowed.includes(listingForm.listingType);
    });

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchProperties();
      await store.fetchListings();
      await store.fetchTeam();
    };

    const submitAddProperty = async () => {
      try {
        await store.createProperty(
          propertyForm.name,
          propertyForm.latitude,
          propertyForm.longitude,
          propertyForm.jurisdiction,
          ['elevators', 'borehole'],
          ['no sub-leasing']
        );
        showAddPropertyModal.value = false;
        propertyForm.name = '';
        await loadData();
      } catch (e) {
        // error
      }
    };

    const navigateToAddProperty = () => {
      router.replace({ query: { tab: 'properties', action: 'add' } });
    };

    const openAddListing = () => {
      if (properties.value.length > 0) {
        listingForm.propertyId = properties.value[0].id;
      }
      showAddListingModal.value = true;
    };

    const submitListing = async () => {
      try {
        const payload = {
          property_id: listingForm.propertyId,
          listing_type: listingForm.listingType,
          rent_amount: listingForm.rentAmount,
          deposit_amount: listingForm.depositAmount
        };
        if (listingForm.listingType === 'short_stay') {
          payload.short_stay_details = {
            nightly_rate: shortStayDetails.nightlyRate,
            min_nights: shortStayDetails.minNights,
            max_guests: shortStayDetails.maxGuests,
            cleaning_fee: shortStayDetails.cleaningFee,
            cancellation_policy: shortStayDetails.cancellationPolicy,
            calendar: []
          };
        } else if (listingForm.listingType === 'event_hourly') {
          payload.event_rental_details = {
            hourly_rate: eventDetails.hourlyRate,
            min_hours: eventDetails.minHours,
            event_type: eventDetails.eventType,
            damage_deposit: eventDetails.damageDeposit
          };
        } else if (listingForm.listingType === 'sale') {
          payload.sale_details = {
            asking_price: saleDetails.askingPrice,
            title_deed_ref: saleDetails.titleDeedRef,
            land_reference_number: saleDetails.landReferenceNumber
          };
        }
        await store.createListing(payload);
        showAddListingModal.value = false;
        await loadData();
      } catch (e) {
        // error
      }
    };

    const submitInviteStaff = async () => {
      try {
        const pIds = properties.value.map(p => p.id);
        await store.inviteStaff(staffForm.email, staffForm.phone, pIds, ['Nairobi']);
        showInviteStaffModal.value = false;
        staffForm.email = '';
        staffForm.phone = '';
        await loadData();
      } catch (e) {
        // error
      }
    };

    const triggerUpgrade = async (targetLevel) => {
      try {
        await store.upgradeTier(targetLevel);
        await loadData();
      } catch (e) {
        // error
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    onMounted(loadData);

    return {
      stats,
      properties,
      listings,
      team,
      showAddPropertyModal,
      showAddListingModal,
      showInviteStaffModal,
      propertyForm,
      listingForm,
      shortStayDetails,
      eventDetails,
      saleDetails,
      staffForm,
      isTierGated,
      submitAddProperty,
      openAddListing,
      submitListing,
      submitInviteStaff,
      triggerUpgrade,
      formatCurrency,
      navigateToAddProperty
    };
  }
};
</script>
