<template>
  <div class="space-y-8 animate-fade-in pb-12">
    <!-- Header banner -->
    <div class="flex justify-between items-center bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-slate-800">Client Hub</h1>
        <p class="text-xs text-slate-500 mt-1">Book short-stays, reserve hourly studios, buy properties, or manage your active lease.</p>
      </div>
      <div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Client Portal Active
        </span>
      </div>
    </div>

    <!-- Active Lease Section (shown if occupied) -->
    <div v-if="stats?.current_lease" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <!-- Lease Info Card -->
        <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 class="text-sm font-bold font-heading text-slate-800 mb-4 uppercase tracking-wider">Active Lease Details</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <span class="text-slate-400 font-bold block uppercase text-[9px]">Property Name</span>
              <span class="font-medium text-slate-800 mt-1 block">{{ stats?.property?.name || 'Lavender Crest' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block uppercase text-[9px]">Unit Label</span>
              <span class="font-semibold text-indigo-600 mt-1 block">{{ stats?.unit?.label || 'A-12' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block uppercase text-[9px]">Monthly Rent</span>
              <span class="font-medium text-slate-800 mt-1 block">KES {{ formatCurrency(stats?.current_lease?.rent_amount || 30000) }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block uppercase text-[9px]">Lease Status</span>
              <span class="badge badge-success text-[9px] mt-1 inline-block">Active</span>
            </div>
          </div>
        </div>

        <!-- Rent Payment Card -->
        <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 class="text-sm font-bold font-heading text-slate-800 mb-2 uppercase tracking-wider">Rent Payment Prompt</h2>
          <p class="text-xs text-slate-500 mb-4">Pay outstanding balance via M-Pesa push prompt instant notification.</p>

          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-grow space-y-1">
              <label class="form-label text-[10px]">Payment Amount (KES)</label>
              <input v-model.number="paymentForm.amount" type="number" required class="form-input text-xs" />
            </div>
            <div class="space-y-1">
              <label class="form-label text-[10px]">Phone Number</label>
              <input v-model="paymentForm.phone" type="text" placeholder="+2547XXXXXXXX" required class="form-input text-xs" />
            </div>
            <button @click="initiatePayment" :disabled="paying" class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs px-6 py-2.5 font-semibold shrink-0">
              {{ paying ? 'Sending STK Push...' : 'Initiate Payment' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Outstanding balance / Maintenance sidebar -->
      <div class="space-y-6">
        <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Rent Balance</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-xs text-slate-400">KES</span>
            <span class="text-2xl font-bold font-heading text-slate-800">{{ formatCurrency(stats?.outstanding_balance || 0) }}</span>
          </div>
        </div>

        <!-- Open Maintenance Ticket -->
        <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 class="font-heading font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Submit Maintenance Request</h3>
          <form @submit.prevent="submitMaintenance" class="space-y-3">
            <div>
              <label class="form-label text-[9px]">Category</label>
              <select v-model="maintForm.issueType" required class="form-select text-xs">
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Structural">Structural</option>
              </select>
            </div>
            <div>
              <label class="form-label text-[9px]">Describe Issue</label>
              <textarea v-model="maintForm.description" placeholder="Details..." required class="form-input text-xs h-16 resize-none"></textarea>
            </div>
            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs">
              File Ticket
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Available Listings Search & Booking desk -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 class="text-sm font-bold font-heading text-slate-800 mb-6 uppercase tracking-wider">Available Listings</h2>
        
        <div v-if="listings.length === 0" class="text-center py-10 text-xs text-slate-400 font-medium">
          No listings currently published. Check back later!
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="l in listings" :key="l.id" class="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300 space-y-4">
            <div>
              <div class="flex justify-between items-center">
                <span class="px-2 py-0.5 rounded bg-slate-50 text-[10px] text-slate-600 font-bold uppercase border border-slate-100">
                  {{ l.listing_type.replace('_', ' ') }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">{{ l.id.slice(0, 8) }}</span>
              </div>
              <h4 class="font-heading font-bold text-slate-800 text-sm mt-3">Property Reference: {{ l.property_id.slice(0, 8) }}</h4>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-slate-50">
              <span class="text-xs font-bold text-slate-800">
                KES {{ formatCurrency(l.listing_type === 'sale' ? l.sale_details?.asking_price : (l.listing_type === 'short_stay' ? l.short_stay_details?.nightly_rate : l.rent_amount)) }}
                <span v-if="l.listing_type === 'short_stay'" class="text-[10px] text-slate-400 font-medium">/ night</span>
                <span v-else-if="l.listing_type === 'event_hourly'" class="text-[10px] text-slate-400 font-medium">/ hour</span>
                <span v-else class="text-[10px] text-slate-400 font-medium">/ month</span>
              </span>

              <button @click="openBookingModal(l)" class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded px-2.5 py-1 text-[10px] font-bold">
                Book / Reserve
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Bookings list -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 class="font-heading font-bold text-slate-800 text-sm uppercase tracking-wider">My Reservations</h3>

        <div v-if="bookings.length === 0" class="text-center py-6 text-[10px] text-slate-400 font-medium">
          No bookings logged. Browse listings to reserve.
        </div>
        <div v-else class="space-y-3">
          <div v-for="b in bookings" :key="b.id" class="p-3 border border-slate-100 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between items-center">
              <span class="font-bold text-slate-800">Booking Reference</span>
              <span class="badge text-[9px] badge-info capitalize">{{ b.status }}</span>
            </div>
            <div class="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-50">
              <div>Type: {{ b.booking_type }}</div>
              <div>From: {{ formatDate(b.start_date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal Dialog -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-sm font-bold font-heading text-slate-800 uppercase">Confirm Reservation Booking</h3>
          <button @click="showBookingModal = false" class="modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form @submit.prevent="submitBooking" class="space-y-4">
          <div class="text-xs text-slate-600 bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
            Booking listing ID: <strong>{{ activeListing?.id }}</strong>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label text-[10px]">Start Date</label>
              <input v-model="bookingForm.startDate" type="date" required class="form-input text-xs" />
            </div>
            <div>
              <label class="form-label text-[10px]">End Date</label>
              <input v-model="bookingForm.endDate" type="date" required class="form-input text-xs" />
            </div>
          </div>

          <!-- Dynamic Pricing Computation -->
          <div class="border-t border-slate-100 pt-3 flex justify-between text-xs font-bold text-slate-800">
            <span>Estimated Total cost:</span>
            <span>KES {{ formatCurrency(computedTotalCost) }}</span>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showBookingModal = false" class="btn border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs px-4 py-2 font-semibold">Cancel</button>
            <button type="submit" class="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs px-4 py-2 font-semibold">Confirm Booking</button>
          </div>
        </form>
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

    const paying = ref(false);
    const showBookingModal = ref(false);
    const activeListing = ref(null);

    const stats = computed(() => store.dashboardStats);
    const listings = computed(() => store.listings);
    const bookings = computed(() => store.bookings);

    const paymentForm = reactive({
      amount: 0,
      phone: ''
    });

    const maintForm = reactive({
      issueType: 'Plumbing',
      description: ''
    });

    const bookingForm = reactive({
      startDate: '',
      endDate: ''
    });

    const computedTotalCost = computed(() => {
      if (!activeListing.value || !bookingForm.startDate || !bookingForm.endDate) return 0;
      const start = new Date(bookingForm.startDate);
      const end = new Date(bookingForm.endDate);
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      if (activeListing.value.listing_type === 'short_stay') {
        return days * (activeListing.value.short_stay_details?.nightly_rate || 4500);
      }
      return days * 1000; // fallback standard rate computation
    });

    const loadData = async () => {
      await store.fetchDashboardStats();
      await store.fetchListings();
      await store.fetchBookings();
      if (stats.value?.current_lease) {
        paymentForm.amount = stats.value.outstanding_balance || stats.value.current_lease.rent_amount;
        paymentForm.phone = store.user?.phone || '';
      }
    };

    const initiatePayment = async () => {
      paying.value = true;
      try {
        await store.payRent(stats.value.current_lease.id, paymentForm.amount, `rent_${Date.now()}`);
        await loadData();
      } catch (e) {
        // error
      } finally {
        paying.value = false;
      }
    };

    const submitMaintenance = async () => {
      try {
        await store.reportMaintenance(stats.value.unit.id, maintForm.issueType, maintForm.description, 'medium');
        maintForm.description = '';
      } catch (e) {
        // error
      }
    };

    const openBookingModal = (l) => {
      activeListing.value = l;
      bookingForm.startDate = new Date().toISOString().split('T')[0];
      bookingForm.endDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      showBookingModal.value = true;
    };

    const submitBooking = async () => {
      try {
        const payload = {
          listing_id: activeListing.value.id,
          booking_type: activeListing.value.listing_type,
          start_date: new Date(bookingForm.startDate).toISOString(),
          end_date: new Date(bookingForm.endDate).toISOString(),
          client_notes: 'Checking in late afternoon.'
        };
        await store.createBooking(payload);
        showBookingModal.value = false;
        await loadData();
      } catch (e) {
        // error
      }
    };

    const formatCurrency = (val) => {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatDate = (dStr) => {
      if (!dStr) return '';
      const date = new Date(dStr);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    onMounted(loadData);

    return {
      stats,
      listings,
      bookings,
      paying,
      showBookingModal,
      activeListing,
      paymentForm,
      maintForm,
      bookingForm,
      computedTotalCost,
      initiatePayment,
      submitMaintenance,
      openBookingModal,
      submitBooking,
      formatCurrency,
      formatDate
    };
  }
};
</script>
