<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>Support Operations
        </span>
        <h1 class="text-2xl font-bold text-slate-900">Support Admin Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">Control landlords, verify KYC queues, resolve escalated disputes, and manage listings.</p>
      </div>
    </div>

    <!-- Active tabs for oversight areas -->
    <div class="flex gap-2 border-b border-slate-200 pb-3">
      <button 
        v-for="tab in ['kyc', 'users', 'listings']" 
        :key="tab" 
        @click="activeTab = tab"
        :class="['text-xs font-bold px-4 py-2 rounded-xl transition-all capitalize', activeTab === tab ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50']"
      >
        {{ tab === 'kyc' ? 'KYC Review Queue' : tab === 'users' ? 'User Oversight' : 'Listing Oversight' }}
      </button>
    </div>

    <!-- 1. KYC Verification Queue -->
    <div v-if="activeTab === 'kyc'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 class="font-bold text-slate-800 text-base">Pending KYC Verifications</h2>
      <p class="text-xs text-slate-500">Review submitted landlord license registries, identity files, and tax documentation.</p>

      <div v-if="kycQueue.length === 0" class="text-center py-12 text-slate-400 text-xs">
        🎉 All KYC documents have been reviewed and approved.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="k in kycQueue" :key="k.id" class="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-extrabold text-slate-700">{{ k.name }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ k.docType }} · Landlord ID: {{ k.userID }}</p>
            </div>
            <span class="text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">PENDING</span>
          </div>

          <div class="border-t border-slate-200/60 pt-2 text-[10px] text-slate-600">
            <span class="font-bold block uppercase mb-1">Attached Document Reference:</span>
            <a :href="k.docUrl" target="_blank" class="text-sky-600 font-semibold hover:underline block truncate">{{ k.docUrl }}</a>
          </div>

          <div class="flex gap-2 pt-1">
            <button @click="verifyKYC(k.id, 'rejected')" class="flex-1 text-[10px] font-bold py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors">Reject</button>
            <button @click="verifyKYC(k.id, 'approved')" class="flex-1 text-[10px] font-bold py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm">Approve Host</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. User Oversight / Suspensions -->
    <div v-if="activeTab === 'users'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 class="font-bold text-slate-800 text-base">Active System Users</h2>
      <p class="text-xs text-slate-500">Suspend accounts violating platform policies, or activate accounts following resolution.</p>

      <div class="flex gap-2 max-w-md">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search users by email or role..." 
          class="flex-grow border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-sky-600"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">User ID</th>
              <th class="py-2.5 px-4">Email</th>
              <th class="py-2.5 px-4">Role</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in pagedFilteredUsers" :key="u.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-mono">{{ u.id }}</td>
              <td class="py-3 px-4 font-semibold text-slate-700">{{ u.email }}</td>
              <td class="py-3 px-4"><span class="uppercase font-bold text-[9px] text-slate-500">{{ u.role }}</span></td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', u.status === 'suspended' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700']">
                  {{ u.status || 'active' }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button 
                  v-if="u.status !== 'suspended'"
                  @click="toggleUserStatus(u.id, 'suspended')" 
                  class="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold px-2.5 py-1 rounded-lg text-[10px]"
                >
                  Suspend Account
                </button>
                <button 
                  v-else
                  @click="toggleUserStatus(u.id, 'active')" 
                  class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-sm"
                >
                  Activate Account
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. Listing Oversight -->
    <div v-if="activeTab === 'listings'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 class="font-bold text-slate-800 text-base">Platform Listings Registry</h2>
      <p class="text-xs text-slate-500">Unpublish fraudulent listings, copyright-violating content, or duplicates.</p>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-2.5 px-4">Listing ID</th>
              <th class="py-2.5 px-4">Title</th>
              <th class="py-2.5 px-4">Base Rent</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="l in pagedSupportListings" :key="l.id" class="hover:bg-slate-50/50">
              <td class="py-3 px-4 font-mono">{{ l.id.substring(0, 8) }}...</td>
              <td class="py-3 px-4 font-semibold text-slate-700">{{ l.title }}</td>
              <td class="py-3 px-4">KES {{ l.base_rent.toLocaleString() }}</td>
              <td class="py-3 px-4">
                <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', l.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500']">
                  {{ l.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button 
                  v-if="l.status === 'approved'"
                  @click="unpublish(l.id)" 
                  class="bg-rose-500 hover:bg-rose-600 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow-sm"
                >
                  Unpublish
                </button>
                <span v-else class="text-slate-400 italic text-[10px]">No Actions</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        <PaginationBar
          :current-page="currentPagesfx2" :total-pages="totalPagessfx2" :total-items="totalItemssfx2"
          :start-item="startItemsfx2" :end-item="endItemsfx2" :page-numbers="pageNumberssfx2"
          :page-size="pageSizesfx2"
          @prev="prevPagesfx2" @next="nextPagesfx2" @go="goToPagesfx2"
          @update:pageSize="pageSizesfx2 = $event"
          class="px-4 pb-4"
        />
    </div>
  </div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'SupportAdminDashboard',
  setup() {
    const store = useAppStore();
    const activeTab = ref('kyc');
    const searchQuery = ref('');

    // Prepopulate some default mock data for operations oversight
    const kycQueue = ref([
      { id: 'ver_1', name: 'Moses Kamau', docType: 'Business License', userID: 'user_l12', docUrl: 'https://storage.nisoko.co.ke/reos-assets/licenses/moses.pdf' },
      { id: 'ver_2', name: 'Wanjiku Realty Ltd', docType: 'Title Deed Registry', userID: 'user_l45', docUrl: 'https://storage.nisoko.co.ke/reos-assets/deeds/wanjiku.pdf' }
    ]);

    const filteredUsers = computed(() => {
      const list = store.systemUsers || [];
      if (!searchQuery.value) return list;
      const query = searchQuery.value.toLowerCase();
      return list.filter(u => u.email.toLowerCase().includes(query) || u.role.toLowerCase().includes(query));
    });

    const verifyKYC = async (verId, status) => {
      const reason = status === 'rejected' ? prompt('Provide reason for KYC rejection:') : 'Approved';
      if (status === 'rejected' && !reason) return;
      
      try {
        await store.verifyKYC(verId, status, reason);
        kycQueue.value = kycQueue.value.filter(k => k.id !== verId);
      } catch (err) {
        alert(err.message);
      }
    };

    const toggleUserStatus = async (userId, newStatus) => {
      try {
        await store.suspendUser(userId, newStatus);
      } catch (err) {
        alert(err.message);
      }
    };

    const unpublish = async (listingId) => {
      const reason = prompt('Specify unpublishing reason:');
      if (!reason) return;
      try {
        await store.unpublishListing(listingId, reason);
      } catch (err) {
        alert(err.message);
      }
    };

    onMounted(async () => {
      if (store.systemUsers.length === 0) {
        store.systemUsers = [
          { id: 'user_l12', email: 'moses.kamau@landlord.com', role: 'landlord', status: 'active' },
          { id: 'user_a44', email: 'john.realty@agent.co.ke', role: 'agent', status: 'active' },
          { id: 'user_t77', email: 'peter.tenant@gmail.com', role: 'tenant', status: 'active' }
        ];
      }
      if (store.listings.length === 0) {
        store.listings = [
          { id: 'list_991', title: 'Westlands Executive Suite', base_rent: 40000, rent_amount: 40000, status: 'approved' }
        ];
      }
    });


    // Pagination: filteredUsers
    const { paginatedItems: pagedFilteredUsers, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(filteredUsers);

    // Pagination: store.listings
    const { paginatedItems: pagedSupportListings, currentPage: currentPagesfx2, totalPages: totalPagessfx2, totalItems: totalItemssfx2, startItem: startItemsfx2, endItem: endItemsfx2, pageNumbers: pageNumberssfx2, pageSize: pageSizesfx2, prevPage: prevPagesfx2, nextPage: nextPagesfx2, goToPage: goToPagesfx2 } = usePagination(store.listings);
    return {
      store,
      activeTab,
      searchQuery,
      kycQueue,
      filteredUsers,
      verifyKYC,
      toggleUserStatus,
      unpublish, pagedFilteredUsers, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage, pagedSupportListings, currentPagesfx2, totalPagessfx2, totalItemssfx2, startItemsfx2, endItemsfx2, pageNumberssfx2, pageSizesfx2, prevPagesfx2, nextPagesfx2, goToPagesfx2
    };
  }
};
</script>
