import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '@/stores/store';
import Login from '@/views/Login.vue';
import InviteAccept from '@/views/InviteAccept.vue';
import Landing from '@/views/Landing.vue';
import VerifyOTP from '@/views/VerifyOTP.vue';
import AdminAuth from '@/views/AdminAuth.vue';
import SuperadminAuth from '@/views/SuperadminAuth.vue';

// Dashboard and Tab View Components
import DashboardWrapper from '@/views/shared/DashboardWrapper.vue';
import ProfileView from '@/views/shared/ProfileView.vue';
import NotificationsView from '@/views/shared/NotificationsView.vue';
import DisputesView from '@/views/shared/DisputesView.vue';
import PropertiesView from '@/views/shared/PropertiesView.vue';
import ListingsView from '@/views/shared/ListingsView.vue';
import ApplicationsView from '@/views/shared/ApplicationsView.vue';
import LeasesView from '@/views/shared/LeasesView.vue';
import LedgerView from '@/views/shared/LedgerView.vue';
import InvitationsView from '@/views/shared/InvitationsView.vue';
import TierWrapper from '@/views/shared/TierWrapper.vue';
import PropertyApprovalsView from '@/views/admin/PropertyApprovalsView.vue';
import RegionsView from '@/views/admin/RegionsView.vue';
import CommissionRulesView from '@/views/shared/CommissionRulesView.vue';
import GatewaysView from '@/views/admin/GatewaysView.vue';
import SystemUsersView from '@/views/admin/SystemUsersView.vue';
import SMSFallbackView from '@/views/admin/SMSFallbackView.vue';
import SearchBrowseView from '@/views/shared/SearchBrowseView.vue';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: Landing
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/admin/auth',
    name: 'admin-auth',
    component: AdminAuth,
    meta: { requiresGuest: true }
  },
  {
    path: '/superadmin/auth',
    name: 'superadmin-auth',
    component: SuperadminAuth,
    meta: { requiresGuest: true }
  },
  {
    path: '/register/superadmin-setup',
    redirect: '/superadmin/auth'
  },
  {
    path: '/verify-otp',
    name: 'verify-otp',
    component: VerifyOTP,
    meta: { requiresGuest: true }
  },
  {
    path: '/invite/accept',
    name: 'invite-accept',
    component: InviteAccept
  },
  
  // Authenticated routes mapped to traditional page paths
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardWrapper,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/disputes',
    name: 'disputes',
    component: DisputesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/properties',
    name: 'properties',
    component: PropertiesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchBrowseView,
    meta: { requiresAuth: true }
  },
  {
    path: '/listings',
    name: 'listings',
    component: ListingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/applications',
    name: 'applications',
    component: ApplicationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/leases',
    name: 'leases',
    component: LeasesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/ledger',
    name: 'ledger',
    component: LedgerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/invites',
    name: 'invites',
    component: InvitationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tiers',
    name: 'tiers',
    component: TierWrapper,
    meta: { requiresAuth: true }
  },
  {
    path: '/property-approvals',
    name: 'property-approvals',
    component: PropertyApprovalsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/regions',
    name: 'regions',
    component: RegionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/commission-rules',
    name: 'commission-rules',
    component: CommissionRulesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/gateways',
    name: 'gateways',
    component: GatewaysView,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: SystemUsersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/sms',
    name: 'sms',
    component: SMSFallbackView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const store = useAppStore();

  // If token is stored but user is not fetched, try fetching user first
  if (store.token && !store.user) {
    try {
      await store.fetchCurrentUser();
    } catch (e) {
      store.logout();
    }
  }

  const authenticated = store.isAuthenticated;

  if (to.meta.requiresAuth && !authenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
