<template>
  <div class="w-full">
    <!-- Handle caretaker maintenance routing internally, other roles use MaintenanceView component -->
    <CaretakerDashboard v-if="userRole === 'caretaker'" />
    <MaintenanceView v-else-if="isMaintenancePath" />
    <LandlordDashboard v-else-if="userRole === 'landlord'" />
    <TenantDashboard v-else-if="userRole === 'client' || userRole === 'tenant'" />
    <AgentDashboard v-else-if="userRole === 'agent'" />
    <AdminDashboard v-else-if="userRole === 'superadmin'" />
    <TechAdminDashboard v-else-if="userRole === 'technical_admin'" />
    <SupportAdminDashboard v-else-if="userRole === 'support_admin'" />
    <BillingAdminDashboard v-else-if="userRole === 'billing_admin'" />
    <StaffDashboard v-else-if="userRole === 'staff'" />
    <div v-else class="text-center py-12 text-slate-400 text-xs">
      Unknown dashboard role classification.
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/store';
import LandlordDashboard from '@/views/landlord/LandlordDashboard.vue';
import TenantDashboard from '@/views/tenant/TenantDashboard.vue';
import CaretakerDashboard from '@/views/caretaker/CaretakerDashboard.vue';
import AgentDashboard from '@/views/agent/AgentDashboard.vue';
import AdminDashboard from '@/views/admin/AdminDashboard.vue';
import TechAdminDashboard from '@/views/admin/TechAdminDashboard.vue';
import SupportAdminDashboard from '@/views/admin/SupportAdminDashboard.vue';
import BillingAdminDashboard from '@/views/admin/BillingAdminDashboard.vue';
import StaffDashboard from '@/views/staff/StaffDashboard.vue';
import MaintenanceView from '@/views/shared/MaintenanceView.vue';

export default {
  name: 'DashboardWrapper',
  components: {
    LandlordDashboard, TenantDashboard, CaretakerDashboard, AgentDashboard,
    AdminDashboard, TechAdminDashboard, SupportAdminDashboard, BillingAdminDashboard,
    StaffDashboard, MaintenanceView
  },
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const userRole = computed(() => store.user?.role || '');
    const isMaintenancePath = computed(() => route.path === '/maintenance');

    return { userRole, isMaintenancePath };
  }
};
</script>
