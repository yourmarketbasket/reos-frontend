<template>
  <div class="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">
          {{ isEdit ? 'Edit Marketing Listing' : 'Publish New Listing' }}
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Complete the details below to market your units/properties to renters and buyers.
        </p>
      </div>
      <button @click="goBack" class="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
        Cancel &amp; Back
      </button>
    </div>

    <!-- Wizard Steps Indicator -->
    <div class="flex justify-between items-center bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
      <div v-for="(step, idx) in steps" :key="step.key" class="flex items-center gap-2">
        <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all', currentStepIndex >= idx ? 'bg-brand-500 text-dark font-black' : 'bg-slate-100 text-slate-400']">
          {{ idx + 1 }}
        </div>
        <span :class="['text-xs font-semibold', currentStepIndex === idx ? 'text-brand-700 font-bold' : 'text-slate-400']">
          {{ step.label }}
        </span>
        <span v-if="idx < steps.length - 1" class="text-slate-200 ml-2 font-light">/</span>
      </div>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="submitForm" class="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      
      <!-- STEP 1: GENERAL INFO -->
      <div v-show="currentStep === 'info'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">1. Listing Classification</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Property Portfolio</label>
            <select v-model="form.property_id" required class="form-select" @change="onPropertyChange">
              <option value="" disabled>Select property…</option>
              <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Unit / Space (Optional)</label>
            <select v-model="form.unit_id" class="form-select" @change="onUnitChange">
              <option value="">Whole Property Listing (No Unit)</option>
              <option v-for="u in units" :key="u.id" :value="u.id">{{ u.building_label ? u.building_label + ' - ' : '' }}{{ u.label }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">Listing Listing Type</label>
          <select v-model="form.listing_type" class="form-select">
            <option value="rental">Long-Term Rental</option>
            <option value="sale">Outright Purchase / Sale</option>
            <option value="short_stay">Short Stay (Nightly)</option>
            <option value="event_hourly">Hourly Event Space</option>
            <option value="storage">Storage Unit</option>
            <option value="coworking">Coworking Space</option>
          </select>
        </div>

        <div>
          <label class="form-label">Listing Title</label>
          <input v-model="form.title" type="text" required placeholder="e.g. Stunning 2 Bedroom Apartment in Kilimani" class="form-input" />
        </div>

        <div>
          <label class="form-label">Public Description</label>
          <textarea v-model="form.description" rows="4" required placeholder="Outline key highlights, amenities, location, terms, and guidelines for visitors..." class="form-input"></textarea>
        </div>
      </div>

      <!-- STEP 2: PHYSICAL SPECS -->
      <div v-show="currentStep === 'specs'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">2. Space Specifications</h3>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="form-label">Bedrooms</label>
            <input v-model.number="form.bedrooms" type="number" min="0" class="form-input" />
          </div>
          <div>
            <label class="form-label">Bathrooms</label>
            <input v-model.number="form.bathrooms" type="number" min="0" class="form-input" />
          </div>
          <div>
            <label class="form-label">Size (sq. meters)</label>
            <input v-model.number="form.size_m2" type="number" min="0" step="any" class="form-input" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="form-label">Furnishing</label>
            <select v-model="form.furnished" class="form-select">
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-Furnished</option>
              <option value="furnished">Fully Furnished</option>
            </select>
          </div>
          <div>
            <label class="form-label">Parking Spaces</label>
            <input v-model.number="form.parking_spaces" type="number" min="0" class="form-input" />
          </div>
          <div>
            <label class="form-label">Floor Number</label>
            <input v-model.number="form.floor" type="number" class="form-input" />
          </div>
        </div>

        <div class="pt-2">
          <div class="flex items-center gap-2">
            <input v-model="form.pet_friendly" type="checkbox" id="list-pet" class="rounded text-brand-500 h-4 w-4 border-slate-300" />
            <label for="list-pet" class="text-xs font-semibold text-slate-700">Pets are allowed / Pet-friendly</label>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-4">
          <label class="form-label">Special Amenities List (Comma-separated)</label>
          <input v-model="amenitiesText" type="text" placeholder="e.g. WiFi, Backup Generator, Garden, Rooftop Pool" class="form-input" />
        </div>
      </div>

      <!-- STEP 3: PRICING & DETAILS -->
      <div v-show="currentStep === 'pricing'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">3. Pricing &amp; Terms</h3>

        <!-- Rental / Storage / Coworking -->
        <div v-if="['rental', 'storage', 'coworking'].includes(form.listing_type)" class="grid grid-cols-3 gap-4 animate-fade-in">
          <div>
            <label class="form-label">Monthly Rent Amount (KES)</label>
            <input v-model.number="form.rent_amount" type="number" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Deposit Required (KES)</label>
            <input v-model.number="form.deposit_amount" type="number" class="form-input" />
          </div>
          <div>
            <label class="form-label">Monthly Service Charge (KES)</label>
            <input v-model.number="form.service_charge" type="number" class="form-input" />
          </div>
        </div>

        <!-- Sale -->
        <div v-if="form.listing_type === 'sale'" class="space-y-4 animate-fade-in">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Asking Price (KES)</label>
              <input v-model.number="form.sale_details.asking_price" type="number" required class="form-input" />
            </div>
            <div>
              <label class="form-label">Booking Fee / Reservation (KES)</label>
              <input v-model.number="form.sale_details.booking_fee_amount" type="number" class="form-input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Title Deed Reference</label>
              <input v-model="form.sale_details.title_deed_ref" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">Land Reference Number (L.R.)</label>
              <input v-model="form.sale_details.land_reference_number" type="text" class="form-input" />
            </div>
          </div>
          <div class="flex items-center gap-4 pt-2">
            <div class="flex items-center gap-2">
              <input v-model="form.sale_details.requires_licensed_agent" type="checkbox" id="sale-agent" class="rounded text-brand-500 h-4 w-4" />
              <label for="sale-agent" class="text-xs font-semibold text-slate-700">Requires Licensed Agent</label>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="form.sale_details.escrow_enabled" type="checkbox" id="sale-escrow" class="rounded text-brand-500 h-4 w-4" />
              <label for="sale-escrow" class="text-xs font-semibold text-slate-700">Escrow payments enabled</label>
            </div>
          </div>
        </div>

        <!-- Short Stay -->
        <div v-if="form.listing_type === 'short_stay'" class="grid grid-cols-4 gap-4 animate-fade-in">
          <div>
            <label class="form-label">Nightly Rate (KES)</label>
            <input v-model.number="form.short_stay_details.nightly_rate" type="number" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Cleaning Fee (KES)</label>
            <input v-model.number="form.short_stay_details.cleaning_fee" type="number" class="form-input" />
          </div>
          <div>
            <label class="form-label">Min Nights</label>
            <input v-model.number="form.short_stay_details.min_nights" type="number" min="1" class="form-input" />
          </div>
          <div>
            <label class="form-label">Max Guests</label>
            <input v-model.number="form.short_stay_details.max_guests" type="number" min="1" class="form-input" />
          </div>
        </div>

        <!-- Event Hourly -->
        <div v-if="form.listing_type === 'event_hourly'" class="grid grid-cols-3 gap-4 animate-fade-in">
          <div>
            <label class="form-label">Hourly Rate (KES)</label>
            <input v-model.number="form.event_rental_details.hourly_rate" type="number" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Min Hours Bookable</label>
            <input v-model.number="form.event_rental_details.min_hours" type="number" min="1" class="form-input" />
          </div>
          <div>
            <label class="form-label">Damage Deposit (KES)</label>
            <input v-model.number="form.event_rental_details.damage_deposit" type="number" class="form-input" />
          </div>
        </div>
      </div>

      <!-- STEP 4: IMAGES & CROPPING -->
      <div v-show="currentStep === 'images'" class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800">4. Interactive Image Cropping &amp; Category Selection</h3>

        <!-- File Select -->
        <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 relative cursor-pointer">
          <input type="file" accept="image/*" @change="onFileSelect" class="absolute inset-0 opacity-0 cursor-pointer" />
          <svg class="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p class="text-xs font-bold text-slate-600">Select Image to Crop &amp; Upload</p>
        </div>

        <!-- Dynamic self-contained HTML5 Canvas Cropper widget -->
        <div v-if="cropSrc" class="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-4 animate-slide-down">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-700">Image Editor (16:9 Aspect Ratio)</h4>
            <div class="flex gap-2">
              <button type="button" @click="cancelCrop" class="text-[10px] bg-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-semibold">Discard</button>
              <button type="button" @click="performCrop" class="text-[10px] bg-brand-500 px-2.5 py-1.5 rounded-lg text-dark font-black">Crop &amp; Upload</button>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center bg-slate-900 rounded-lg p-2 relative overflow-hidden h-72">
            <img ref="cropImgRef" :src="cropSrc" @load="initCropCanvas" class="hidden" />
            <canvas ref="cropCanvasRef" class="border border-slate-700 max-h-full max-w-full rounded shadow-md"></canvas>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label class="form-label">Position Horizontal Offset</label>
              <input type="range" min="-100" max="100" v-model="cropX" @input="drawCrop" class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500" />
            </div>
            <div>
              <label class="form-label">Position Vertical Offset</label>
              <input type="range" min="-100" max="100" v-model="cropY" @input="drawCrop" class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500" />
            </div>
            <div class="col-span-2">
              <label class="form-label">Scale Zoom Factor</label>
              <input type="range" min="10" max="250" v-model="cropScale" @input="drawCrop" class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500" />
            </div>
          </div>
        </div>

        <div v-if="uploading" class="flex items-center gap-2 text-xs text-brand-600 font-semibold justify-center">
          <span class="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          Uploading cropped image file…
        </div>

        <!-- Render Listing Images -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div v-for="(img, idx) in form.images" :key="idx" class="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex gap-3 relative">
            <img :src="img.url" class="w-20 h-20 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
            <div class="flex-grow space-y-2">
              <div class="flex items-center justify-between">
                <select v-model="img.category" class="form-select text-[11px] py-1 px-2 w-full max-w-[120px]">
                  <option value="exterior">Exterior Aspect</option>
                  <option value="interior">Interior View</option>
                  <option value="floor_plan">Floor Plan Layout</option>
                  <option value="amenity">Amenity Detail</option>
                </select>
                <button type="button" @click="removeImage(idx)" class="text-red-500 hover:text-red-700 text-xs">Remove</button>
              </div>
              <input v-model="img.caption" type="text" placeholder="Caption..." class="form-input text-xs py-1" />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center justify-between border-t border-slate-100 pt-4">
        <button type="button" @click="prevStep" :disabled="currentStepIndex === 0" class="border border-slate-200 text-slate-500 font-semibold px-4 py-2 rounded-xl text-xs disabled:opacity-40">
          Previous
        </button>
        
        <div class="flex gap-3">
          <button v-if="currentStepIndex < steps.length - 1" type="button" @click="nextStep" class="bg-brand-500 hover:bg-brand-600 text-dark font-bold px-4 py-2 rounded-xl text-xs">
            Continue
          </button>
          <button v-else type="submit" :disabled="formLoading" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs disabled:opacity-55">
            {{ formLoading ? 'Submitting…' : 'Submit Listing for Review' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'ListingFormView',
  props: {
    listingId: { type: String, default: '' }
  },
  emits: ['save', 'back'],
  setup(props, { emit }) {
    const store = useAppStore();
    const currentStep = ref('info');
    const formLoading = ref(false);
    const uploading = ref(false);
    const amenitiesText = ref('');

    // HTML5 Cropper state
    const cropSrc = ref(null);
    const cropX = ref(0);
    const cropY = ref(0);
    const cropScale = ref(100);
    const cropImgRef = ref(null);
    const cropCanvasRef = ref(null);
    const selectFileName = ref('cropped_listing.png');

    const steps = [
      { key: 'info', label: '1. Classify' },
      { key: 'specs', label: '2. Specs' },
      { key: 'pricing', label: '3. Pricing' },
      { key: 'images', label: '4. Media' }
    ];

    const currentStepIndex = computed(() => steps.findIndex(s => s.key === currentStep.value));
    const isEdit = computed(() => !!props.listingId);

    const properties = computed(() => store.properties || []);
    const units = ref([]);

    const form = reactive({
      id: '',
      property_id: '',
      unit_id: '',
      listing_type: 'rental',
      title: '',
      description: '',
      bedrooms: 0,
      bathrooms: 0,
      size_m2: 0,
      furnished: 'unfurnished',
      pet_friendly: false,
      parking_spaces: 0,
      floor: 0,
      rent_amount: 0,
      deposit_amount: 0,
      service_charge: 0,
      sale_details: {
        asking_price: 0,
        title_deed_ref: '',
        land_reference_number: '',
        booking_fee_amount: 0,
        requires_licensed_agent: false,
        escrow_enabled: false
      },
      short_stay_details: {
        nightly_rate: 0,
        min_nights: 1,
        max_guests: 2,
        cleaning_fee: 0
      },
      event_rental_details: {
        hourly_rate: 0,
        min_hours: 1,
        damage_deposit: 0
      },
      images: [],
      amenities: [],
      region_id: ''
    });

    const onPropertyChange = async () => {
      form.unit_id = '';
      units.value = [];
      if (form.property_id) {
        const u = await store.fetchUnits(form.property_id);
        units.value = u || [];
        
        // auto-set region from property
        const p = properties.value.find(prop => prop.id === form.property_id);
        if (p) {
          form.region_id = p.region_id;
        }
      }
    };

    const onUnitChange = () => {
      if (form.unit_id) {
        const u = units.value.find(unit => unit.id === form.unit_id);
        if (u) {
          form.rent_amount = u.rent_amount;
          form.deposit_amount = u.deposit_amount;
        }
      }
    };

    const nextStep = () => {
      if (currentStepIndex.value < steps.length - 1) {
        currentStep.value = steps[currentStepIndex.value + 1].key;
      }
    };

    const prevStep = () => {
      if (currentStepIndex.value > 0) {
        currentStep.value = steps[currentStepIndex.value - 1].key;
      }
    };

    // Canvas image operations
    const onFileSelect = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      selectFileName.value = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        cropSrc.value = e.target.result;
        cropX.value = 0;
        cropY.value = 0;
        cropScale.value = 100;
      };
      reader.readAsDataURL(file);
    };

    const initCropCanvas = () => {
      const canvas = cropCanvasRef.value;
      if (!canvas) return;
      // 16:9 fixed crop resolution
      canvas.width = 640;
      canvas.height = 360;
      drawCrop();
    };

    const drawCrop = () => {
      const canvas = cropCanvasRef.value;
      const img = cropImgRef.value;
      if (!canvas || !img) return;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1c1712'; // charcoal background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const baseScale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const scale = (cropScale.value / 100) * baseScale;

      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      const x = (canvas.width - w) / 2 + (cropX.value * 3);
      const y = (canvas.height - h) / 2 + (cropY.value * 3);

      ctx.drawImage(img, x, y, w, h);
    };

    const cancelCrop = () => {
      cropSrc.value = null;
    };

    const performCrop = () => {
      const canvas = cropCanvasRef.value;
      if (!canvas) return;
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        uploading.value = true;
        cropSrc.value = null;
        try {
          const file = new File([blob], selectFileName.value, { type: 'image/png' });
          const url = await store.uploadImage(file);
          form.images.push({
            url,
            category: 'interior',
            caption: '',
            sort_order: form.images.length
          });
        } catch (e) {
          store.error = e.message || 'Crop upload failed';
        } finally {
          uploading.value = false;
        }
      }, 'image/png');
    };

    const removeImage = (idx) => {
      form.images.splice(idx, 1);
    };

    const goBack = () => {
      emit('back');
    };

    const submitForm = async () => {
      formLoading.value = true;
      form.amenities = amenitiesText.value.split(',').map(s => s.trim()).filter(Boolean);
      try {
        if (isEdit.value) {
          await store.updateListing({ ...form });
        } else {
          await store.createListing({ ...form });
        }
        emit('save');
      } catch (e) {
        store.error = e.message || 'Operation failed';
      } finally {
        formLoading.value = false;
      }
    };

    onMounted(async () => {
      await store.fetchProperties();
      if (isEdit.value) {
        const listing = store.listings.find(l => l.id === props.listingId);
        if (listing) {
          Object.assign(form, JSON.parse(JSON.stringify(listing)));
          amenitiesText.value = form.amenities?.join(', ') || '';
          if (form.property_id) {
            const u = await store.fetchUnits(form.property_id);
            units.value = u || [];
          }
        }
      }
    });

    return {
      currentStep, formLoading, uploading, amenitiesText, isEdit, steps, currentStepIndex, form,
      properties, units, onPropertyChange, onUnitChange, nextStep, prevStep,
      cropSrc, cropX, cropY, cropScale, cropImgRef, cropCanvasRef,
      onFileSelect, initCropCanvas, drawCrop, cancelCrop, performCrop, removeImage, goBack, submitForm
    };
  }
};
</script>
