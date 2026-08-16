<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight font-heading">System User Management</h1>
      <p class="text-sm text-slate-500 mt-1">Audit, modify roles, and verify permanent digital identities platform-wide.</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6">
      <h2 class="text-lg font-bold font-heading mb-6">User Database</h2>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead>
            <tr class="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
              <th class="py-2.5 px-3">User ID</th>
              <th class="py-2.5 px-3">Email Address</th>
              <th class="py-2.5 px-3">Phone Number</th>
              <th class="py-2.5 px-3">Role</th>
              <th class="py-2.5 px-3">Verification</th>
              <th class="py-2.5 px-3">Created Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in pagedUsers" :key="u.id" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
              <td class="py-3 px-3 font-mono text-slate-400 text-[10px]">{{ u.id }}</td>
              <td class="py-3 px-3 font-semibold text-slate-800">{{ u.email || '-' }}</td>
              <td class="py-3 px-3 text-slate-700 font-medium">{{ u.phone || '-' }}</td>
              <td class="py-3 px-3">
                <span class="badge badge-info text-[9px] capitalize">{{ u.role }}</span>
              </td>
              <td class="py-3 px-3">
                <span :class="['badge text-[9px]', u.identity_verification === 'verified' ? 'badge-success' : 'badge-warning']">
                  {{ u.identity_verification }}
                </span>
              </td>
              <td class="py-3 px-3 text-slate-500">{{ formatDate(u.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

        <PaginationBar
          :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
          :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers"
          :page-size="pageSize"
          @prev="prevPage" @next="nextPage" @go="goToPage"
          @update:pageSize="pageSize = $event"
          class="px-4 pb-4"
        />
    </div>
  </div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  setup() {
    const store = useAppStore();
    const users = computed(() => store.systemUsers);

    const loadData = async () => {
      await store.fetchSystemUsers();
    };

    const formatDate = (dStr) => {
      if (!dStr) return '-';
      const d = new Date(dStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    onMounted(loadData);


    // Pagination: users
    const { paginatedItems: pagedUsers, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(users);
    return {
      users,
      formatDate, pagedUsers, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
