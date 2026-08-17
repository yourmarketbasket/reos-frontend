import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '@/stores/store';

// Eagerly loaded (tiny, needed immediately on page load)
import Login from '@/views/Login.vue';
import Landing from '@/views/Landing.vue';
import VerifyOTP from '@/views/VerifyOTP.vue';

// All other views are lazy-loaded per route to minimize initial bundle
const InviteAccept        = () => import('@/views/InviteAccept.vue');
const Browse              = () => import('@/views/Browse.vue');
const AdminAuth           = () => import('@/views/AdminAuth.vue');
const SuperadminAuth      = () => import('@/views/SuperadminAuth.vue');
const DashboardWrapper    = () => import('@/views/shared/DashboardWrapper.vue');
const ProfileView         = () => import('@/views/shared/ProfileView.vue');
const NotificationsView   = () => import('@/views/shared/NotificationsView.vue');
const DisputesView        = () => import('@/views/shared/DisputesView.vue');
const PropertiesView      = () => import('@/views/shared/PropertiesView.vue');
const ListingsView        = () => import('@/views/shared/ListingsView.vue');
const ApplicationsView    = () => import('@/views/shared/ApplicationsView.vue');
const LeasesView          = () => import('@/views/shared/LeasesView.vue');
const LedgerView          = () => import('@/views/shared/LedgerView.vue');
const InvitationsView     = () => import('@/views/shared/InvitationsView.vue');
const TierWrapper         = () => import('@/views/shared/TierWrapper.vue');
const PropertyApprovalsView = () => import('@/views/admin/PropertyApprovalsView.vue');
const RegionsView         = () => import('@/views/admin/RegionsView.vue');
const CommissionRulesView = () => import('@/views/shared/CommissionRulesView.vue');
const GatewaysView        = () => import('@/views/admin/GatewaysView.vue');
const SystemUsersView     = () => import('@/views/admin/SystemUsersView.vue');
const SMSFallbackView     = () => import('@/views/admin/SMSFallbackView.vue');
const SearchBrowseView    = () => import('@/views/shared/SearchBrowseView.vue');
const MaintenanceView     = () => import('@/views/shared/MaintenanceView.vue');
const LeadsView           = () => import('@/views/staff/LeadsView.vue');
const ViewingsView        = () => import('@/views/staff/ViewingsView.vue');
const PerformanceView     = () => import('@/views/staff/PerformanceView.vue');

const routes = [
  {
    path: '/',
    name: 'landing',
    component: Landing
  },
  {
    path: '/browse',
    name: 'browse',
    component: Browse
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
  },
  {
    path: '/leads',
    name: 'leads',
    component: LeadsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/viewings',
    name: 'viewings',
    component: ViewingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/performance',
    name: 'performance',
    component: PerformanceView,
    meta: { requiresAuth: true }
  },
  {
    path: '/inspections',
    name: 'inspections',
    component: DashboardWrapper,
    meta: { requiresAuth: true }
  },
  {
    path: '/deductions',
    name: 'deductions',
    component: DashboardWrapper,
    meta: { requiresAuth: true }
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: MaintenanceView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Mappings of authenticated routes to roles authorized to access them
const routeRolePermissions = {
  '/dashboard': ['superadmin', 'technical_admin', 'support_admin', 'billing_admin', 'landlord', 'agent', 'caretaker', 'client', 'tenant', 'staff'],
  '/profile': ['superadmin', 'technical_admin', 'support_admin', 'billing_admin', 'landlord', 'agent', 'caretaker', 'client', 'tenant', 'staff'],
  '/notifications': ['superadmin', 'technical_admin', 'support_admin', 'billing_admin', 'landlord', 'agent', 'caretaker', 'client', 'tenant', 'staff'],
  '/disputes': ['superadmin', 'support_admin', 'billing_admin', 'landlord', 'client', 'tenant'],
  '/properties': ['landlord', 'agent', 'staff', 'superadmin'],
  '/search': ['client', 'tenant'],
  '/listings': ['landlord', 'agent'],
  '/applications': ['landlord', 'agent', 'client', 'tenant'],
  '/leases': ['landlord', 'agent', 'client', 'tenant'],
  '/ledger': ['landlord', 'billing_admin', 'client', 'tenant', 'superadmin', 'staff', 'agent'],
  '/invites': ['superadmin', 'landlord', 'agent'],
  '/tiers': ['superadmin', 'landlord', 'agent'],
  '/property-approvals': ['superadmin'],
  '/regions': ['superadmin'],
  '/commission-rules': ['superadmin', 'landlord', 'agent', 'staff', 'caretaker'],
  '/gateways': ['superadmin', 'billing_admin'],
  '/users': ['superadmin', 'support_admin'],
  '/sms': ['superadmin', 'technical_admin'],
  '/leads': ['staff', 'agent'],
  '/viewings': ['staff', 'agent'],
  '/performance': ['staff'],
  '/inspections': ['caretaker'],
  '/deductions': ['caretaker'],
  '/maintenance': ['superadmin', 'landlord', 'agent', 'caretaker', 'tenant', 'client', 'staff']
};

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
  const userRole = store.user?.role || '';

  if (authenticated) {
    // Logged-in users should not navigate outside the dashboard zone
    if (to.meta.requiresAuth) {
      // Verify role-based routing permissions
      const allowedRoles = routeRolePermissions[to.path];
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        next('/dashboard');
      } else {
        next();
      }
    } else {
      // Special exceptions: invite flow. Otherwise force back to dashboard.
      if (to.path === '/invite/accept') {
        next();
      } else {
        next('/dashboard');
      }
    }
  } else {
    // Guests can only navigate to non-authenticated pages
    if (to.meta.requiresAuth) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
