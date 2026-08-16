<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <span class="inline-flex items-center px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">Review Board</span>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-slate-800">Property &amp; Listing Approvals</h1>
        <p class="text-xs text-slate-500 mt-1">Review, approve, or reject submissions by landlords and agents.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-slate-200">
      <button @click="currentTab='properties'" :class="['px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2', currentTab==='properties'?'border-blue-500 text-blue-700':'border-transparent text-slate-400 hover:text-slate-600']">
        Properties Pending<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">{{ pendingProperties.length }}</span>
      </button>
      <button @click="currentTab='listings'" :class="['px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2', currentTab==='listings'?'border-blue-500 text-blue-700':'border-transparent text-slate-400 hover:text-slate-600']">
        Listings Pending<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">{{ pendingListings.length }}</span>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="(currentTab==='properties'&&pendingProperties.length===0)||(currentTab==='listings'&&pendingListings.length===0)" class="flex flex-col items-center justify-center min-h-[25vh] text-center space-y-3 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
      <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl">🎉</div>
      <div><h3 class="text-sm font-bold text-slate-700">All clear!</h3><p class="text-xs text-slate-400 mt-1">No {{ currentTab }} pending review. Everything is processed.</p></div>
    </div>

    <!-- Properties Table -->
    <div v-else-if="currentTab==='properties'" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead><tr class="border-b border-slate-100 bg-slate-50/70">
            <th v-for="c in propColumns" :key="c.key" @click="c.sortable&&sortBy(c.key,'prop')" :class="['px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap',c.sortable?'cursor-pointer hover:text-slate-600':'']">
              <span class="flex items-center gap-1">{{ c.label }}<span v-if="c.sortable" class="text-slate-300">{{ propSortKey===c.key?(propSortDir==='asc'?'▲':'▼'):'⇅' }}</span></span>
            </th>
          </tr></thead>
          <tbody>
            <tr v-for="p in pagedSortedProperties" :key="p.id" @click="openModal(p,'property')" class="border-b border-slate-50 last:border-none hover:bg-blue-50/40 cursor-pointer transition-colors group">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="getCoverImage(p)" class="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                  <div><p class="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{{ p.name }}</p><p class="text-[10px] text-slate-400 font-mono">{{ p.id }}</p></div>
                </div>
              </td>
              <td class="px-4 py-3"><span class="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{{ p.property_type }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ p.neighbourhood || '—' }}, {{ p.city }}</td>
              <td class="px-4 py-3 text-xs text-slate-600 font-semibold">{{ p.total_units }}</td>
              <td class="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{{ p.created_at ? new Date(p.created_at).toLocaleDateString() : '—' }}</td>
              <td class="px-4 py-3"><span class="text-[10px] text-blue-500 font-semibold group-hover:text-blue-700">Review →</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Listings Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead><tr class="border-b border-slate-100 bg-slate-50/70">
            <th v-for="c in listColumns" :key="c.key" @click="c.sortable&&sortBy(c.key,'list')" :class="['px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap',c.sortable?'cursor-pointer hover:text-slate-600':'']">
              <span class="flex items-center gap-1">{{ c.label }}<span v-if="c.sortable" class="text-slate-300">{{ listSortKey===c.key?(listSortDir==='asc'?'▲':'▼'):'⇅' }}</span></span>
            </th>
          </tr></thead>
          <tbody>
            <tr v-for="l in sortedListings" :key="l.id" @click="openModal(l,'listing')" class="border-b border-slate-50 last:border-none hover:bg-blue-50/40 cursor-pointer transition-colors group">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="getListingCover(l)" class="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                  <div><p class="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{{ l.title }}</p><p class="text-[10px] text-slate-400 font-mono">{{ l.id }}</p></div>
                </div>
              </td>
              <td class="px-4 py-3"><span class="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{{ l.listing_type }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-700 font-bold">{{ formatPrice(l) }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ l.bedrooms }} bed · {{ l.bathrooms }} bath</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ l.size_m2 ? l.size_m2 + ' m²' : '—' }}</td>
              <td class="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{{ l.created_at ? new Date(l.created_at).toLocaleDateString() : '—' }}</td>
              <td class="px-4 py-3"><span class="text-[10px] text-blue-500 font-semibold group-hover:text-blue-700">Review →</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Unified Detail + Decision Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="modalTarget" class="modal-overlay" @click.self="closeModal">
          <div class="modal-backdrop" @click="closeModal"></div>
          <div class="modal-panel">
            <div class="modal-accent accent-amber"></div>
            <div class="p-6 space-y-5">
              <!-- Header -->
              <div class="flex items-start justify-between gap-4">
                <div>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ modalType }} Submission</span>
                  <h3 class="text-lg font-extrabold text-slate-800 mt-0.5">{{ modalTarget.name || modalTarget.title }}</h3>
                  <p class="text-xs text-slate-400 font-mono mt-0.5">{{ modalTarget.id }}</p>
                </div>
                <button @click="closeModal" class="text-slate-400 hover:text-slate-700 p-1 shrink-0"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>

              <!-- Images -->
              <div v-if="(modalTarget.images||[]).length" class="grid grid-cols-3 gap-2">
                <img v-for="(img,i) in (modalTarget.images||[]).slice(0,6)" :key="i" :src="img.url||img" class="w-full h-24 object-cover rounded-xl border border-slate-100" />
              </div>
              <div v-else class="w-full h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 text-xs">No images uploaded</div>

              <!-- Description -->
              <div v-if="modalTarget.description" class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 leading-relaxed">{{ modalTarget.description }}</div>

              <!-- Property details -->
              <div v-if="modalType==='property'" class="grid grid-cols-2 gap-4 text-xs">
                <div class="space-y-2">
                  <h4 class="section-label">Location &amp; Classification</h4>
                  <div class="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div class="profile-row"><span class="profile-key">Type</span><span class="profile-val capitalize">{{ modalTarget.property_type }}</span></div>
                    <div class="profile-row"><span class="profile-key">Address</span><span class="profile-val">{{ modalTarget.address }}, {{ modalTarget.city }}</span></div>
                    <div class="profile-row"><span class="profile-key">Neighbourhood</span><span class="profile-val">{{ modalTarget.neighbourhood || '—' }}</span></div>
                    <div class="profile-row"><span class="profile-key">Total Units</span><span class="profile-val">{{ modalTarget.total_units }}</span></div>
                    <div class="profile-row"><span class="profile-key">Gated</span><span class="profile-val">{{ modalTarget.is_gated ? 'Yes' : 'No' }}</span></div>
                    <div class="profile-row"><span class="profile-key">Beachfront</span><span class="profile-val">{{ modalTarget.is_beachfront ? `Yes (${modalTarget.beach_distance_m}m)` : 'No' }}</span></div>
                  </div>
                </div>
                <div class="space-y-2">
                  <h4 class="section-label">Utilities &amp; Security</h4>
                  <div class="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div class="profile-row"><span class="profile-key">Water</span><span class="profile-val capitalize">{{ modalTarget.utilities?.water }} ({{ modalTarget.utilities?.water_status }})</span></div>
                    <div class="profile-row"><span class="profile-key">Power</span><span class="profile-val capitalize">{{ modalTarget.utilities?.electricity }} ({{ modalTarget.utilities?.electric_billing }})</span></div>
                    <div class="profile-row"><span class="profile-key">Internet</span><span class="profile-val">{{ modalTarget.utilities?.internet }} ({{ modalTarget.utilities?.internet_provider || '—' }})</span></div>
                    <div class="profile-row"><span class="profile-key">Security</span><span class="profile-val capitalize">{{ modalTarget.utilities?.security_system }}</span></div>
                  </div>
                </div>
              </div>

              <!-- Listing details -->
              <div v-if="modalType==='listing'" class="grid grid-cols-2 gap-4 text-xs">
                <div class="space-y-2">
                  <h4 class="section-label">Specifications</h4>
                  <div class="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div class="profile-row"><span class="profile-key">Type</span><span class="profile-val capitalize">{{ modalTarget.listing_type }}</span></div>
                    <div class="profile-row"><span class="profile-key">Bedrooms</span><span class="profile-val">{{ modalTarget.bedrooms }}</span></div>
                    <div class="profile-row"><span class="profile-key">Bathrooms</span><span class="profile-val">{{ modalTarget.bathrooms }}</span></div>
                    <div class="profile-row"><span class="profile-key">Size</span><span class="profile-val">{{ modalTarget.size_m2 }} m²</span></div>
                    <div class="profile-row"><span class="profile-key">Furnished</span><span class="profile-val capitalize">{{ modalTarget.furnished }}</span></div>
                  </div>
                </div>
                <div class="space-y-2">
                  <h4 class="section-label">Pricing</h4>
                  <div class="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div class="profile-row"><span class="profile-key">Price</span><span class="profile-val font-bold text-blue-700">{{ formatPrice(modalTarget) }}</span></div>
                    <div v-if="modalTarget.deposit_amount" class="profile-row"><span class="profile-key">Deposit</span><span class="profile-val">{{ modalTarget.deposit_amount }} KES</span></div>
                    <div v-if="modalTarget.service_charge" class="profile-row"><span class="profile-key">Service Charge</span><span class="profile-val">{{ modalTarget.service_charge }} KES</span></div>
                    <div v-if="modalTarget.escrow_required" class="profile-row"><span class="profile-key">Escrow</span><span class="profile-val text-amber-600 font-bold">Mandatory</span></div>
                  </div>
                </div>
              </div>

              <!-- Decision section -->
              <div class="border-t border-slate-100 pt-4 space-y-3">
                <h4 class="section-label">Review Decision</h4>
                <div v-if="!decisionMode" class="flex gap-3">
                  <button @click="decisionMode='approve'" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm">✓ Approve</button>
                  <button @click="decisionMode='reject'" class="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm">✕ Reject</button>
                </div>
                <Transition name="slide-down">
                  <div v-if="decisionMode" :class="['rounded-2xl p-4 border space-y-3', decisionMode==='approve'?'bg-emerald-50 border-emerald-100':'bg-rose-50 border-rose-100']">
                    <p class="text-xs font-bold" :class="decisionMode==='approve'?'text-emerald-700':'text-rose-700'">{{ decisionMode==='approve' ? '✓ Confirming Approval — this publishes it live immediately.' : '✕ Confirming Rejection — provide a corrective reason.' }}</p>
                    <textarea v-model="decisionNote" rows="2" :placeholder="decisionMode==='approve'?'Optional approval note...':'Required: corrective actions needed...'" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 bg-white resize-none placeholder-slate-300" :class="decisionMode==='approve'?'focus:ring-emerald-400':'focus:ring-rose-400'"></textarea>
                    <div v-if="actionError" class="bg-red-50 text-red-700 p-2 rounded-lg border border-red-200 text-xs">{{ actionError }}</div>
                    <div class="flex justify-end gap-2">
                      <button @click="decisionMode='';decisionNote='';actionError=''" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-white transition-colors">Back</button>
                      <button @click="submitDecision" :disabled="actionLoading" :class="['px-4 py-2 font-bold rounded-xl text-xs text-white shadow-sm transition-colors', decisionMode==='approve'?'bg-emerald-600 hover:bg-emerald-700':'bg-rose-600 hover:bg-rose-700']">{{ actionLoading ? 'Processing...' : (decisionMode==='approve'?'Confirm Approval':'Confirm Rejection') }}</button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  
        <PaginationBar
          :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
          :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers"
          :page-size="pageSize"
          @prev="prevPage" @next="nextPage" @go="goToPage"
          @update:pageSize="pageSize = $event"
          class="px-4 pb-4"
        />
</div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
export default {
  name: 'PropertyApprovalsView',
  setup() {
    const store = useAppStore();
    const currentTab = ref('properties');
    const modalTarget = ref(null); const modalType = ref('');
    const decisionMode = ref(''); const decisionNote = ref(''); const actionLoading = ref(false); const actionError = ref('');
    const propSortKey = ref('created_at'); const propSortDir = ref('desc');
    const listSortKey = ref('created_at'); const listSortDir = ref('desc');

    const propColumns = [
      {key:'name',label:'Property',sortable:true},{key:'property_type',label:'Type',sortable:true},
      {key:'city',label:'Location',sortable:true},{key:'total_units',label:'Units',sortable:true},
      {key:'created_at',label:'Submitted',sortable:true},{key:'_a',label:'',sortable:false}
    ];
    const listColumns = [
      {key:'title',label:'Listing',sortable:true},{key:'listing_type',label:'Type',sortable:true},
      {key:'rent_amount',label:'Price',sortable:true},{key:'bedrooms',label:'Rooms',sortable:false},
      {key:'size_m2',label:'Size',sortable:true},{key:'created_at',label:'Submitted',sortable:true},{key:'_a',label:'',sortable:false}
    ];

    const pendingProperties = computed(() => store.properties.filter(p => p.approval_status === 'pending'));
    const pendingListings = computed(() => store.listings.filter(l => l.approval_status === 'pending_review' || l.approval_status === 'pending'));

    const sortedProperties = computed(() => [...pendingProperties.value].sort((a,b) => { const av=a[propSortKey.value],bv=b[propSortKey.value]; if(av===bv)return 0; return (propSortDir.value==='asc'?1:-1)*(av>bv?1:-1); }));
    const sortedListings = computed(() => [...pendingListings.value].sort((a,b) => { const av=a[listSortKey.value],bv=b[listSortKey.value]; if(av===bv)return 0; return (listSortDir.value==='asc'?1:-1)*(av>bv?1:-1); }));

    const sortBy = (k,which) => {
      if(which==='prop'){if(propSortKey.value===k)propSortDir.value=propSortDir.value==='asc'?'desc':'asc';else{propSortKey.value=k;propSortDir.value='asc';}}
      else{if(listSortKey.value===k)listSortDir.value=listSortDir.value==='asc'?'desc':'asc';else{listSortKey.value=k;listSortDir.value='asc';}}
    };

    const getCoverImage = p => { const c=p.images?.find(i=>i.is_cover); return c?.url||'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80'; };
    const getListingCover = l => l.images?.[0]?.url||'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80';
    const formatPrice = l => { if(l.listing_type==='sale')return (l.sale_details?.asking_price||0).toLocaleString()+' KES'; if(l.listing_type==='short_stay')return (l.short_stay_details?.nightly_rate||0).toLocaleString()+' KES/night'; if(l.listing_type==='event_hourly')return (l.event_rental_details?.hourly_rate||0).toLocaleString()+' KES/hr'; return (l.rent_amount||0).toLocaleString()+' KES/mo'; };

    const openModal = (t,type) => { modalTarget.value=t; modalType.value=type; decisionMode.value=''; decisionNote.value=''; actionError.value=''; };
    const closeModal = () => { modalTarget.value=null; decisionMode.value=''; };

    const submitDecision = async () => {
      if(decisionMode.value==='reject'&&!decisionNote.value.trim()){actionError.value='Rejection reason is required';return;}
      actionLoading.value=true; actionError.value='';
      try {
        const id=modalTarget.value.id;
        if(decisionMode.value==='approve'){
          if(modalType.value==='property')await store.approveProperty(id,decisionNote.value);
          else await store.approveListing(id,decisionNote.value);
        } else {
          if(modalType.value==='property')await store.rejectProperty(id,decisionNote.value);
          else await store.rejectListing(id,decisionNote.value);
        }
        closeModal(); await store.fetchProperties(); await store.fetchListings();
        store.success=`Submission ${decisionMode.value==='approve'?'approved':'rejected'} successfully.`;
      } catch(e) { actionError.value=e.message||'Action failed'; }
      finally { actionLoading.value=false; }
    };

    onMounted(async () => { await store.fetchProperties(); await store.fetchListings(); });


    // --- Pagination ---
    const { paginatedItems: pagedSortedProperties, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(sortedProperties);
        return { store,currentTab,propColumns,listColumns,pendingProperties,pendingListings,sortedProperties,sortedListings,propSortKey,propSortDir,listSortKey,listSortDir,sortBy,getCoverImage,getListingCover,formatPrice,modalTarget,modalType,decisionMode,decisionNote,actionLoading,actionError,openModal,closeModal,submitDecision, pagedSortedProperties, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage };
  }
};
</script>

<style scoped>
.modal-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px)}
.modal-panel{position:relative;background:#fff;border-radius:1.5rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);width:100%;max-width:48rem;max-height:90vh;overflow-y:auto}
.modal-accent{height:6px;border-radius:1.5rem 1.5rem 0 0}
.accent-amber{background:linear-gradient(90deg,#fbbf24,#f97316)}
.section-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.profile-row{display:flex;align-items:flex-start;gap:.5rem;font-size:.75rem}
.profile-key{color:#94a3b8;width:6.5rem;flex-shrink:0}
.profile-val{font-weight:600;color:#334155}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s ease}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
.modal-fade-enter-active .modal-panel,.modal-fade-leave-active .modal-panel{transition:transform .2s ease}
.modal-fade-enter-from .modal-panel,.modal-fade-leave-to .modal-panel{transform:scale(.96) translateY(10px)}
.slide-down-enter-active,.slide-down-leave-active{transition:all .2s ease}
.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translateY(-8px)}
</style>
