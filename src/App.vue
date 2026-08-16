<template>
  <div class="min-h-screen bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e6] flex flex-col md:flex-row">
    <!-- Mobile Header -->
    <header v-if="isAuthenticated && !isInviteRoute" class="flex md:hidden items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur border-b border-slate-200/50 sticky top-0 z-[60] w-full shadow-sm">
      <button @click="sidebarOpen = !sidebarOpen" class="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Toggle Navigation Menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <img src="/logo.png" class="w-6 h-6 object-contain" alt="REOS Logo" />
        <span class="font-bold text-base text-slate-900 tracking-tight font-heading">REOS</span>
      </div>
      <div :class="['w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs uppercase', roleAccentBorder]">
        <img v-if="store.user?.profile_image" :src="store.user.profile_image" class="w-full h-full rounded-full object-cover" alt="Avatar" />
        <span v-else :class="roleAccentText">{{ userEmailPrefix }}</span>
      </div>
    </header>

    <!-- Mobile sidebar overlay (covers full viewport) -->
    <Teleport to="body">
      <div v-if="sidebarOpen && isAuthenticated && !isInviteRoute" @click="sidebarOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden"></div>
    </Teleport>

    <!-- Sidebar -->
    <aside v-if="isAuthenticated && !isInviteRoute"
      :class="['bg-[#fcfaf7] border-r border-brand-500/15 text-slate-600 flex flex-col fixed h-screen left-0 top-0 z-[50] duration-300 ease-in-out shadow-sm',
        sidebarOpen ? 'translate-x-0 w-64 transition-transform' : (sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-[72px] transition-transform' : '-translate-x-full md:translate-x-0 md:w-64 transition-transform')]">

      <!-- Brand -->
      <div :class="['border-b border-brand-500/10 flex transition-all duration-300', sidebarCollapsed ? 'p-4 justify-center flex-row' : 'px-5 py-4 flex-col gap-3']">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3 min-w-0">
            <img src="/logo.png" class="w-8 h-8 object-contain flex-shrink-0" alt="REOS Logo" />
            <div v-if="!sidebarCollapsed" class="min-w-0">
              <span class="font-bold text-lg text-slate-900 tracking-tight block leading-none font-heading">REOS</span>
              <span class="text-[9px] uppercase tracking-widest font-semibold text-brand-600 block mt-0.5">Rental OS</span>
            </div>
          </div>
          <button v-if="!sidebarCollapsed" @click="sidebarCollapsed = true" class="hidden md:flex items-center justify-center w-7 h-7 text-slate-400 hover:text-brand-600 hover:bg-brand-500/5 rounded-lg transition-colors flex-shrink-0" aria-label="Collapse Sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- User Role Badge (inline-flex elegant chip) -->
        <div v-if="!sidebarCollapsed" class="flex justify-center">
          <div :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border', roleChipClass]">
            <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" v-html="roleIconSvg"></svg>
            <span class="truncate">{{ userRole.replace(/_/g, ' ') }}</span>
          </div>
        </div>
      </div>

      <!-- Expand button when collapsed -->
      <div v-if="sidebarCollapsed" class="py-3 flex justify-center border-b border-brand-500/10">
        <button @click="sidebarCollapsed = false" class="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-brand-600 hover:bg-brand-500/5 rounded-lg transition-colors" aria-label="Expand Sidebar" title="Expand Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav :class="['flex-1 overflow-y-auto overflow-x-hidden py-3 transition-all', sidebarCollapsed ? 'px-2' : 'px-3']">

        <!-- Universal: Dashboard Home -->
        <div v-if="!sidebarCollapsed" class="px-2 mb-1.5 mt-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Main</div>
        <SidebarBtn tab="home" label="Dashboard" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
          <template #icon>
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </template>
        </SidebarBtn>

        <!-- === SUPERADMIN === -->
        <template v-if="userRole === 'superadmin'">
          <SidebarSection label="Platform Management" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="users" label="User Management" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="properties_oversight" label="Property Oversight" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></template>
          </SidebarBtn>
          <SidebarBtn tab="regions" label="Regions & Commission" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="property_approvals" label="Property Approvals" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="gateways" label="Payment Gateways" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="tiers" label="Tier Configuration" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="disputes" label="Dispute Escalations" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></template>
          </SidebarBtn>
          <SidebarBtn tab="invites" label="Invitations" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></template>
          </SidebarBtn>
          <SidebarSection label="System" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="audit_log" label="Audit Log" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></template>
          </SidebarBtn>
          <SidebarBtn tab="feature_flags" label="Feature Flags" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></template>
          </SidebarBtn>
          <SidebarBtn tab="sms" label="SMS Fallback" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></template>
          </SidebarBtn>
        </template>

        <!-- === TECHNICAL ADMIN === -->
        <template v-if="userRole === 'technical_admin'">
          <SidebarSection label="Infrastructure" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="system_health" label="System Health" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></template>
          </SidebarBtn>
          <SidebarBtn tab="integration_config" label="Integration Config" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="error_log" label="Error / Exception Log" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="feature_flags" label="Feature Flags" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></template>
          </SidebarBtn>
          <SidebarBtn tab="sms" label="SMS Gateway Config" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></template>
          </SidebarBtn>
        </template>

        <!-- === SUPPORT ADMIN === -->
        <template v-if="userRole === 'support_admin'">
          <SidebarSection label="Support Operations" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="ticket_queue" label="Ticket Queue" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="kyc_queue" label="KYC Verification" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="disputes" label="Dispute Triage" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></template>
          </SidebarBtn>
          <SidebarBtn tab="users" label="Account Actions Log" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></template>
          </SidebarBtn>
        </template>

        <!-- === BILLING ADMIN === -->
        <template v-if="userRole === 'billing_admin'">
          <SidebarSection label="Finance" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="ledger" label="Ledger Overview" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="reconciliation" label="Reconciliation" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></template>
          </SidebarBtn>
          <SidebarBtn tab="gateways" label="Gateway Finance Config" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="refund_queue" label="Refund Queue" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="deductions" label="Deduction Claims" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></template>
          </SidebarBtn>
        </template>

        <!-- === LANDLORD === -->
        <template v-if="userRole === 'landlord'">
          <SidebarSection label="Properties" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="properties" label="My Properties" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></template>
          </SidebarBtn>
          <SidebarBtn tab="commission_rules" label="Commission Config" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L15 9M9.5 9.5h.01M14.5 14.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="listings" label="Listings" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></template>
          </SidebarBtn>
          <SidebarBtn tab="applications" label="Applications" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></template>
          </SidebarBtn>
          <SidebarBtn tab="leases" label="Leases" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></template>
          </SidebarBtn>
          <SidebarSection label="Operations" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="maintenance" label="Maintenance" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="ledger" label="Financials" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="disputes" label="Disputes" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></template>
          </SidebarBtn>
          <SidebarBtn tab="invites" label="Team & Invitations" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="tiers" label="Verification & Tier" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></template>
          </SidebarBtn>
        </template>

        <!-- === AGENT === -->
        <template v-if="userRole === 'agent'">
          <SidebarSection label="Inventory" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="properties" label="Assigned Properties" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></template>
          </SidebarBtn>
          <SidebarBtn tab="commission_rules" label="Commission Config" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L15 9M9.5 9.5h.01M14.5 14.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="listings" label="Listings" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></template>
          </SidebarBtn>
          <SidebarSection label="Sales Pipeline" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="leads" label="Leads & Inquiries" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="viewings" label="Viewings" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="applications" label="Applications" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></template>
          </SidebarBtn>
          <SidebarSection label="Operations" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="maintenance" label="Maintenance" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="ledger" label="Commissions" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="invites" label="Team & Staff" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="tiers" label="Verification & Tier" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></template>
          </SidebarBtn>
        </template>

        <!-- === CARETAKER === -->
        <template v-if="userRole === 'caretaker'">
          <SidebarSection label="Field Operations" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="maintenance" label="Maintenance Tickets" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="inspections" label="Inspections" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></template>
          </SidebarBtn>
          <SidebarBtn tab="deductions" label="Deduction Claim Drafts" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></template>
          </SidebarBtn>
        </template>

        <!-- === CLIENT / TENANT === -->
        <template v-if="userRole === 'client' || userRole === 'tenant'">
          <SidebarSection label="Rental" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="search" label="Search & Browse" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="applications" label="My Applications" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></template>
          </SidebarBtn>
          <SidebarBtn tab="bookings" label="My Bookings" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="leases" label="My Lease" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></template>
          </SidebarBtn>
          <SidebarSection label="Activity" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="ledger" label="Payments" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="maintenance" label="Maintenance Requests" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="disputes" label="Disputes" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></template>
          </SidebarBtn>
        </template>

        <!-- === STAFF === -->
        <template v-if="userRole === 'staff'">
          <SidebarSection label="My Work" :collapsed="sidebarCollapsed" />
          <SidebarBtn tab="leads" label="My Leads" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="properties" label="My Properties" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></template>
          </SidebarBtn>
          <SidebarBtn tab="viewings" label="My Viewings" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="ledger" label="My Commissions" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></template>
          </SidebarBtn>
          <SidebarBtn tab="performance" label="My Performance" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></template>
          </SidebarBtn>
        </template>

        <!-- Universal: Profile & Notifications -->
        <div class="mt-2 pt-2 border-t border-brand-500/10">
          <SidebarBtn tab="notifications" label="Notifications" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon>
              <div class="relative">
                <span v-if="store.notifications && store.notifications.length > 0" class="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
            </template>
          </SidebarBtn>
          <SidebarBtn tab="profile" label="Profile & Settings" :current="currentTab" @navigate="setTab" :collapsed="sidebarCollapsed">
            <template #icon><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></template>
          </SidebarBtn>
        </div>
      </nav>

      <!-- Sidebar footer: user info + status + logout -->
      <div :class="['border-t border-brand-500/10 transition-all duration-300 p-4 flex flex-col gap-3', sidebarCollapsed ? 'items-center' : '']">
        <!-- Row 1: Name and Role -->
        <div class="flex items-center gap-2.5 min-w-0 w-full">
          <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-brand-500/10">
            <img v-if="store.user?.profile_image" :src="store.user.profile_image" class="w-full h-full object-cover" alt="Avatar" />
            <div v-else :class="['w-full h-full flex items-center justify-center font-bold text-xs uppercase bg-gradient-to-br text-white', roleGradient]">
              <span>{{ userEmailPrefix }}</span>
            </div>
          </div>
          <div v-if="!sidebarCollapsed" class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-800 truncate leading-tight">{{ userEmail }}</p>
            <p :class="['text-[9px] uppercase font-bold tracking-wider', roleAccentText]">{{ userRole.replace(/_/g, ' ') }}</p>
          </div>
        </div>

        <!-- Row 2: System Status -->
        <div class="w-full flex items-center justify-center gap-2 px-1 text-[10px] font-semibold text-slate-400">
          <span :class="['w-2 h-2 rounded-full flex-shrink-0', store.redis_status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500']" :title="sidebarCollapsed ? `System: ${store.redis_status === 'connected' ? 'Online' : 'Offline'}` : ''"></span>
          <span v-if="!sidebarCollapsed" class="text-slate-400">System: {{ store.redis_status === 'connected' ? 'Online' : 'Offline' }}</span>
        </div>

        <!-- Row 3: Logout Button -->
        <button 
          @click="handleLogout" 
          :class="['w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all font-semibold text-xs text-slate-500 hover:text-red-650 hover:bg-red-500/5 border border-transparent hover:border-red-500/10', sidebarCollapsed ? 'p-2' : '']"
          :title="sidebarCollapsed ? 'Log Out' : ''"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="!sidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main content (no transition-all to avoid creating stacking context that traps fixed modals) -->
    <main :class="['flex-grow flex flex-col min-w-0', isAuthenticated && !isInviteRoute ? (sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64') : '']"
      :style="isAuthenticated && !isInviteRoute ? { transition: 'padding-left 300ms ease-in-out' } : {}">
      <!-- Toast messages -->
      <transition name="toast">
        <div v-if="successMsg" class="fixed top-4 right-4 z-[60] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-4 max-w-sm">
          <div class="flex items-center gap-2.5">
            <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span class="text-sm font-medium">{{ successMsg }}</span>
          </div>
          <button @click="clearSuccess" class="text-emerald-200 hover:text-white flex-shrink-0"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </transition>
      <transition name="toast">
        <div v-if="errorMsg" class="fixed top-4 right-4 z-[60] bg-red-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-4 max-w-sm">
          <div class="flex items-center gap-2.5">
            <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01" /><path stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <span class="text-sm font-medium">{{ errorMsg }}</span>
          </div>
          <button @click="clearError" class="text-red-200 hover:text-white flex-shrink-0"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </transition>

      <!-- Page content -->
      <div class="flex-grow">
        <router-view v-if="!isAuthenticated || isInviteRoute" />
        <div v-else class="p-4 sm:p-6 md:p-8 min-h-screen">
          <router-view />
        </div>
      </div>
    </main>

    <!-- Global Modal Portal (ensures modals cover full viewport incl. sidebar) -->
    <div id="modal-root" class="fixed inset-0 pointer-events-none" style="z-index: 9999;"></div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, defineComponent, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/stores/store';

// Role Dashboards
import LandlordDashboard from '@/views/landlord/LandlordDashboard.vue';
import TenantDashboard from '@/views/tenant/TenantDashboard.vue';
import CaretakerDashboard from '@/views/caretaker/CaretakerDashboard.vue';
import AgentDashboard from '@/views/agent/AgentDashboard.vue';
import AdminDashboard from '@/views/admin/AdminDashboard.vue';
import TechAdminDashboard from '@/views/admin/TechAdminDashboard.vue';
import SupportAdminDashboard from '@/views/admin/SupportAdminDashboard.vue';
import BillingAdminDashboard from '@/views/admin/BillingAdminDashboard.vue';
import StaffDashboard from '@/views/staff/StaffDashboard.vue';

// Tab views
import InvitationsView from '@/views/shared/InvitationsView.vue';
import LedgerView from '@/views/shared/LedgerView.vue';
import MaintenanceView from '@/views/shared/MaintenanceView.vue';
import DisputesView from '@/views/shared/DisputesView.vue';
import GatewaysView from '@/views/admin/GatewaysView.vue';
import SystemUsersView from '@/views/admin/SystemUsersView.vue';
import SMSFallbackView from '@/views/admin/SMSFallbackView.vue';
import ProfileView from '@/views/shared/ProfileView.vue';
import TierConfigView from '@/views/admin/TierConfigView.vue';
import TierPurchaseView from '@/views/shared/TierPurchaseView.vue';
import RegionsView from '@/views/admin/RegionsView.vue';
import CommissionRulesView from '@/views/shared/CommissionRulesView.vue';
import PropertyApprovalsView from '@/views/admin/PropertyApprovalsView.vue';
import PropertiesView from '@/views/shared/PropertiesView.vue';
import ListingsView from '@/views/shared/ListingsView.vue';
import ApplicationsView from '@/views/shared/ApplicationsView.vue';
import LeasesView from '@/views/shared/LeasesView.vue';
import NotificationsView from '@/views/shared/NotificationsView.vue';

// Reusable sidebar button component
const SidebarBtn = defineComponent({
  name: 'SidebarBtn',
  props: {
    tab: String,
    label: String,
    current: String,
    collapsed: Boolean
  },
  emits: ['navigate'],
  setup(props, { emit, slots }) {
    return () => {
      const isActive = props.current === props.tab;
      const iconPath = slots.icon ? slots.icon() : [];
      const icon = h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        class: 'h-[18px] w-[18px] flex-shrink-0',
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '1.8'
      }, iconPath);

      return h('button', {
        onClick: () => emit('navigate', props.tab),
        title: props.collapsed ? props.label : '',
        'aria-label': props.label,
        class: [
          'w-full flex items-center transition-all duration-150 group',
          isActive
            ? 'bg-brand-500/10 text-brand-700 font-bold'
            : 'text-slate-500 hover:text-brand-600 hover:bg-brand-500/5',
          props.collapsed
            ? 'justify-center p-2.5 rounded-xl mb-0.5'
            : 'gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-0.5'
        ].join(' ')
      }, props.collapsed
        ? [icon]
        : [
          icon,
          h('span', { class: 'truncate' }, props.label),
        ]
      );
    };
  }
});

// Sidebar section label component
const SidebarSection = defineComponent({
  name: 'SidebarSection',
  props: { label: String, collapsed: Boolean },
  setup(props) {
    return () => props.collapsed
      ? h('div', { class: 'my-2 border-t border-brand-500/10' })
      : h('div', { class: 'px-2 mb-1 mt-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest' }, props.label);
  }
});

const TAB_LABEL_MAP = {
  home: 'Dashboard Home', profile: 'Profile & Settings', ledger: 'Financials / Ledger',
  maintenance: 'Maintenance', disputes: 'Disputes', gateways: 'Payment Gateways',
  users: 'System Users', sms: 'SMS Fallback', tiers: 'Tier Configuration',
  invites: 'Team & Invitations', properties: 'Properties', listings: 'Listings',
  applications: 'Applications', leases: 'Leases', leads: 'Leads & Inquiries',
  viewings: 'Viewings', performance: 'My Performance', inspections: 'Inspections',
  deductions: 'Deduction Claims', reconciliation: 'Reconciliation', refund_queue: 'Refund Queue',
  search: 'Search & Browse', bookings: 'My Bookings', audit_log: 'Audit Log',
  feature_flags: 'Feature Flags', system_health: 'System Health', integration_config: 'Integration Config',
  error_log: 'Error Log', properties_oversight: 'Property Oversight', ticket_queue: 'Ticket Queue',
  kyc_queue: 'KYC Verification Queue', regions: 'Regions & Commission',
  commission_rules: 'Commission Configuration', property_approvals: 'Property Approvals',
  notifications: 'System Notifications'
};

export default {
  components: {
    LandlordDashboard, TenantDashboard, CaretakerDashboard, AgentDashboard,
    AdminDashboard, TechAdminDashboard, SupportAdminDashboard, BillingAdminDashboard,
    StaffDashboard, InvitationsView, LedgerView, MaintenanceView, DisputesView,
    GatewaysView, SystemUsersView, SMSFallbackView, ProfileView, TierConfigView, TierPurchaseView,
    RegionsView, CommissionRulesView, PropertyApprovalsView, PropertiesView,
    ListingsView, ApplicationsView, LeasesView, NotificationsView,
    SidebarBtn, SidebarSection
  },
  setup() {
    const store = useAppStore();
    const router = useRouter();
    const route = useRoute();

    const profileSection = ref('general');
    const sidebarOpen = ref(false);
    const sidebarCollapsed = ref(false);

    const currentTab = computed(() => {
      const p = route.path;
      if (p === '/dashboard') return 'home';
      if (p === '/profile') return 'profile';
      if (p === '/notifications') return 'notifications';
      if (p === '/disputes') return 'disputes';
      if (p === '/properties') return 'properties';
      if (p === '/listings') return 'listings';
      if (p === '/applications') return 'applications';
      if (p === '/leases') return 'leases';
      if (p === '/ledger') return 'ledger';
      if (p === '/invites') return 'invites';
      if (p === '/tiers') return 'tiers';
      if (p === '/property-approvals') return 'property_approvals';
      if (p === '/regions') return 'regions';
      if (p === '/commission-rules') return 'commission_rules';
      if (p === '/gateways') return 'gateways';
      if (p === '/users') return 'users';
      if (p === '/sms') return 'sms';
      if (p === '/search') return 'search';
      if (p === '/leads') return 'leads';
      if (p === '/viewings') return 'viewings';
      if (p === '/performance') return 'performance';
      if (p === '/inspections') return 'inspections';
      if (p === '/deductions') return 'deductions';
      if (p === '/maintenance') return 'maintenance';
      return '';
    });

    const isAuthenticated = computed(() => store.isAuthenticated);
    const userRole = computed(() => store.userRole);
    const userEmail = computed(() => store.user?.email || store.user?.phone || 'reos_user');
    const userEmailPrefix = computed(() => {
      const e = userEmail.value;
      return e ? e.substring(0, 2).toUpperCase() : 'US';
    });
    const tabLabel = computed(() => TAB_LABEL_MAP[currentTab.value] || currentTab.value);
    const isInviteRoute = computed(() => route.path === '/invite/accept');

    const successMsg = computed(() => store.success);
    const errorMsg = computed(() => store.error);

    // Role-based styling
    const roleGradient = computed(() => {
      const g = {
        superadmin: 'from-rose-600 to-rose-800',
        technical_admin: 'from-emerald-500 to-emerald-700',
        support_admin: 'from-sky-500 to-sky-700',
        billing_admin: 'from-amber-500 to-amber-700',
        landlord: 'from-blue-600 to-indigo-700',
        agent: 'from-violet-500 to-purple-700',
        caretaker: 'from-slate-500 to-slate-700',
        client: 'from-teal-500 to-teal-700',
        tenant: 'from-teal-500 to-teal-700',
        staff: 'from-orange-500 to-orange-700',
      };
      return g[userRole.value] || 'from-blue-600 to-indigo-700';
    });

    const roleAccentText = computed(() => {
      const c = {
        superadmin: 'text-rose-700', technical_admin: 'text-emerald-700',
        support_admin: 'text-sky-700', billing_admin: 'text-amber-700',
        landlord: 'text-brand-700', agent: 'text-violet-700',
        caretaker: 'text-slate-700', client: 'text-teal-700',
        tenant: 'text-teal-700', staff: 'text-orange-700',
      };
      return c[userRole.value] || 'text-brand-700';
    });

    const roleAccentBg = computed(() => {
      const c = {
        superadmin: 'bg-rose-500', technical_admin: 'bg-emerald-500',
        support_admin: 'bg-sky-500', billing_admin: 'bg-amber-500',
        landlord: 'bg-brand-500', agent: 'bg-violet-500',
        caretaker: 'bg-slate-500', client: 'bg-teal-500',
        tenant: 'bg-teal-500', staff: 'bg-orange-500',
      };
      return c[userRole.value] || 'bg-brand-500';
    });

    const roleAccentBorder = computed(() => {
      const c = {
        superadmin: 'border-rose-200', technical_admin: 'border-emerald-200',
        support_admin: 'border-sky-200', billing_admin: 'border-amber-200',
        landlord: 'border-brand-200', agent: 'border-violet-200',
        caretaker: 'border-slate-200', client: 'border-teal-200',
        tenant: 'border-teal-200', staff: 'border-orange-200',
      };
      return c[userRole.value] || 'border-brand-200';
    });

    const roleChipClass = computed(() => {
      const c = {
        superadmin: 'bg-rose-50 border-rose-100 text-rose-700',
        technical_admin: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        support_admin: 'bg-sky-50 border-sky-100 text-sky-700',
        billing_admin: 'bg-amber-50 border-amber-100 text-amber-700',
        landlord: 'bg-brand-500/10 border-brand-500/20 text-brand-700',
        agent: 'bg-violet-50 border-violet-100 text-violet-700',
        caretaker: 'bg-slate-50 border-slate-100 text-slate-700',
        client: 'bg-teal-50 border-teal-100 text-teal-700',
        tenant: 'bg-teal-50 border-teal-100 text-teal-700',
        staff: 'bg-orange-50 border-orange-100 text-orange-700',
      };
      return c[userRole.value] || 'bg-brand-500/10 border-brand-500/20 text-brand-700';
    });

    const roleIconSvg = computed(() => {
      const icons = {
        superadmin: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />',
        technical_admin: '<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
        support_admin: '<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 0A3 3 0 1010.5 12.5l-3.536 3.536m7.072-7.072a3 3 0 014.243 4.242M10.5 12.5a3 3 0 01-4.243-4.243m4.243 4.243a3 3 0 004.242 4.243m-9.9-1.414l-3.536 3.536m3.536-3.536a3 3 0 01-4.242-4.243M9 10.5a3 3 0 014.243-4.242M9 10.5a3 3 0 004.243 4.242" />',
        billing_admin: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
        landlord: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />',
        agent: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />',
        caretaker: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />',
        client: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />',
        tenant: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />',
        staff: '<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />'
      };
      return icons[userRole.value] || '<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />';
    });

    const setTab = (tab) => {
      sidebarOpen.value = false;
      const paths = {
        home: '/dashboard',
        profile: '/profile',
        notifications: '/notifications',
        disputes: '/disputes',
        properties: '/properties',
        listings: '/listings',
        applications: '/applications',
        leases: '/leases',
        ledger: '/ledger',
        invites: '/invites',
        tiers: '/tiers',
        property_approvals: '/property-approvals',
        regions: '/regions',
        commission_rules: '/commission-rules',
        gateways: '/gateways',
        users: '/users',
        sms: '/sms',
        search: '/search',
        leads: '/leads',
        viewings: '/viewings',
        performance: '/performance',
        inspections: '/inspections',
        deductions: '/deductions',
        maintenance: '/maintenance'
      };
      const path = paths[tab] || '/dashboard';
      router.push(path);
    };

    const onProfileSectionChange = (section) => {
      profileSection.value = section;
      if (route.path === '/profile') {
        const query = {};
        if (section && section !== 'general') query.section = section;
        router.replace({ path: '/profile', query });
      }
    };

    const handleScrollToAnchor = () => {
      const hash = route.hash;
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    };

    onMounted(async () => {
      if (store.isAuthenticated) {
        await store.fetchCurrentUser();
        store.initWebSocket();
        handleScrollToAnchor();
      }
    });

    watch(() => store.token, (newVal) => {
      if (newVal) {
        store.initWebSocket();
      }
    });

    watch(() => route.hash, () => {
      handleScrollToAnchor();
    });

    watch(() => route.path, () => {
      handleScrollToAnchor();
    });

    const handleLogout = () => {
      store.logout();
      router.push('/login');
    };

    const clearSuccess = () => { store.success = null; };
    const clearError = () => { store.error = null; };

    return {
      store, isAuthenticated, sidebarOpen, sidebarCollapsed,
      userRole, userEmail, userEmailPrefix, isInviteRoute,
      currentTab, profileSection, tabLabel,
      successMsg, errorMsg,
      roleGradient, roleAccentText, roleAccentBg, roleAccentBorder,
      roleChipClass, roleIconSvg,
      setTab, onProfileSectionChange,
      handleLogout, clearSuccess, clearError
    };
  }
};
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-12px) scale(0.97); }
.toast-leave-to { opacity: 0; transform: translateY(-12px) scale(0.97); }
</style>
