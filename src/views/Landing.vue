<template>
  <div class="min-h-screen bg-brand-50 text-dark flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900">
    <!-- Global Header -->
    <header class="bg-white/90 backdrop-blur-md border-b border-brand-100/60 sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between transition-all duration-200 shadow-sm">
      <div class="flex items-center gap-3">
        <router-link to="/" class="flex items-center gap-3">
          <img src="/logo.png" class="w-8 h-8 object-contain flex-shrink-0" alt="REOS Logo" />
          <span class="font-heading font-bold text-xl tracking-wider text-dark uppercase">REOS</span>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <nav class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
        <a href="#philosophy" class="hover:text-brand-500 transition-colors">Philosophy</a>
        <a href="#portals" class="hover:text-brand-500 transition-colors">Portals</a>
        <a href="#offerings" class="hover:text-brand-500 transition-colors">Offerings</a>
        <a href="#features" class="hover:text-brand-500 transition-colors">Features</a>
        <router-link to="/browse" class="hover:text-brand-500 transition-colors">Browse Listings</router-link>
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-4">
        <router-link 
          v-if="!isAuthenticated" 
          to="/login" 
          class="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-500 transition-colors px-2 py-2"
        >
          Sign In
        </router-link>
        <router-link 
          v-if="!isAuthenticated" 
          to="/login?signup=true" 
          class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
        >
          Get Started
        </router-link>
        
        <router-link 
          v-if="isAuthenticated" 
          to="/dashboard" 
          class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
        >
          Dashboard
        </router-link>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-dark transition-colors px-2 py-2"
        >
          Log Out
        </button>
      </div>
    </header>

    <!-- Hero Section (Light, Elegant Cream-Champagne-Gold Gradient) -->
    <section class="bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e6] border-b border-brand-100 relative overflow-hidden py-20 px-6 sm:py-28">
      <!-- Soft ambient glows -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <!-- Hero Text -->
        <div class="lg:col-span-7 text-left space-y-6">
          <span class="inline-flex items-center text-xs uppercase font-extrabold text-brand-700 tracking-widest bg-brand-100/70 border border-brand-200/50 px-3.5 py-1.5 rounded-full">
            Rental Ecosystem Operating System
          </span>
          <h1 class="font-heading text-4xl sm:text-6xl font-extrabold text-dark tracking-tight leading-tight">
            The infrastructure layer for modern property <span class="text-brand-500">operations.</span>
          </h1>
          <p class="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed">
            REOS is the infrastructure layer for renting, long-term leasing, short-term stays, and creative studio booking. Manage residential apartments, offices, media studios (podcast/filming), event gardens, and outdoor spaces on a single, verified ledger.
          </p>
          <div class="flex flex-wrap items-center gap-4 pt-4">
            <router-link 
              to="/browse" 
              class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              Browse Verified Directory
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link 
              to="/login?signup=true&role=landlord" 
              class="border border-brand-200 hover:bg-brand-50 hover:border-brand-300 text-brand-700 font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            >
              Register Landlord Portal
            </router-link>
          </div>
        </div>

        <!-- Hero Diagram Layout -->
        <div class="lg:col-span-5 hidden lg:block">
          <div class="relative w-full max-w-md mx-auto aspect-square bg-white rounded-3xl border border-brand-100 p-8 flex items-center justify-center shadow-lg">
            <!-- Light theme lifecycle orbits -->
            <svg viewBox="0 0 400 400" class="w-full h-full relative z-10 animate-fade-in text-brand-300">
              <!-- Orbit lines -->
              <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 6" />
              <circle cx="200" cy="200" r="85" fill="none" stroke="currentColor" stroke-width="1" />
              
              <!-- Center Logo image -->
              <g transform="translate(160,160)">
                <rect width="80" height="80" rx="20" fill="#faf8f5" stroke="#ebd7af" stroke-width="2" class="shadow" />
                <image href="/logo.png" x="18" y="18" width="44" height="44" />
              </g>

              <!-- Nodes -->
              <!-- Landlord Node -->
              <g transform="translate(200, 60)" class="cursor-pointer group">
                <circle r="22" fill="#ffffff" stroke="#c9973f" stroke-width="2" class="shadow-sm" />
                <path d="M-8 -4 h16 M-8 2 h16 M-8 8 h16" stroke="#c9973f" stroke-width="2" fill="none" />
                <text x="0" y="36" font-family="Josefin Sans" font-weight="700" font-size="11" fill="#1c1712" text-anchor="middle">Landlord</text>
              </g>
              
              <!-- Tenant Node -->
              <g transform="translate(340, 200)">
                <circle r="22" fill="#ffffff" stroke="#c9973f" stroke-width="2" class="shadow-sm" />
                <path d="M-6 -6 A6 6 0 0 1 6 -6 M0 -10 A4 4 0 1 1 0 -2 A4 4 0 0 1 0 -10 Z" stroke="#c9973f" stroke-width="2" fill="none" />
                <text x="0" y="36" font-family="Josefin Sans" font-weight="700" font-size="11" fill="#1c1712" text-anchor="middle">Tenant</text>
              </g>
              
              <!-- Caretaker Node -->
              <g transform="translate(200, 340)">
                <circle r="22" fill="#ffffff" stroke="#c9973f" stroke-width="2" class="shadow-sm" />
                <path d="M-6 -4 L6 8 M-6 8 L6 -4" stroke="#c9973f" stroke-width="2" fill="none" />
                <text x="0" y="-30" font-family="Josefin Sans" font-weight="700" font-size="11" fill="#1c1712" text-anchor="middle">Caretaker</text>
              </g>

              <!-- Agent Node -->
              <g transform="translate(60, 200)">
                <circle r="22" fill="#ffffff" stroke="#c9973f" stroke-width="2" class="shadow-sm" />
                <path d="M-7 -2 A4 4 0 0 1 7 -2 L3 7 L-3 7 Z" stroke="#c9973f" stroke-width="2" fill="none" />
                <text x="0" y="-30" font-family="Josefin Sans" font-weight="700" font-size="11" fill="#1c1712" text-anchor="middle">Agent</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Philosophy Section -->
    <section id="philosophy" class="py-20 px-6 max-w-7xl mx-auto w-full">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span class="text-xs uppercase font-extrabold text-brand-700 tracking-widest bg-brand-100 px-3.5 py-1.5 rounded-full border border-brand-200/50">
          The Operating System Moat
        </span>
        <h2 class="font-heading text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
          Listings are the acquisition layer. <br class="hidden sm:inline"/>
          <span class="text-brand-600 italic">History is the real moat.</span>
        </h2>
        <p class="text-slate-500 text-sm sm:text-base leading-relaxed">
          Unlike standard classified sites where properties disappear after a lease, REOS maintains a permanent digital profile for every unit, tracking tenant reliability, maintenance cost, and transactions.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Value Prop 1 -->
        <div class="bg-white border border-brand-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-heading text-lg font-bold text-dark mb-3">Property Passport</h3>
          <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Every building and unit retains its permanent historical record: tenancy duration, renovation budgets, payment indexes, and utility records. Highly valuable for valuation and transfers.
          </p>
        </div>

        <!-- Value Prop 2 -->
        <div class="bg-white border border-brand-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="font-heading text-lg font-bold text-dark mb-3">Reliability Scoring</h3>
          <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Move past credit scores. Tenants and landlords are rated on platform behaviors: payment promptness, lease completions, maintenance request accuracy, and deposit resolution speeds.
          </p>
        </div>

        <!-- Value Prop 3 -->
        <div class="bg-white border border-brand-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="font-heading text-lg font-bold text-dark mb-3">Append-Only Money Ledger</h3>
          <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Double-entry ledger logging rent, deposits, holding reserves, and caretakers' maintenance expenses. All balances are verified instantly on-chain with M-Pesa automated transaction bindings.
          </p>
        </div>
      </div>
    </section>

    <!-- Interactive Stakeholder Portals Section -->
    <section id="portals" class="bg-[#faf8f5] py-20 px-6 border-y border-brand-100">
      <div class="max-w-7xl mx-auto w-full">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="font-heading text-3xl font-extrabold text-dark">One platform, dedicated portals.</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-2">Tailored workflows mapped to your role inside the rental lifecycle ecosystem</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-10 max-w-xl mx-auto">
          <button 
            @click="activePortalTab = 'landlord'"
            :class="[
              'px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border',
              activePortalTab === 'landlord' 
                ? 'bg-dark text-white border-dark shadow-sm' 
                : 'bg-white text-slate-600 border-brand-100 hover:bg-brand-50 hover:text-dark'
            ]"
          >
            Landlord Portal
          </button>
          <button 
            @click="activePortalTab = 'tenant'"
            :class="[
              'px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border',
              activePortalTab === 'tenant' 
                ? 'bg-dark text-white border-dark shadow-sm' 
                : 'bg-white text-slate-600 border-brand-100 hover:bg-brand-50 hover:text-dark'
            ]"
          >
            Tenant Portal
          </button>
          <button 
            @click="activePortalTab = 'caretaker'"
            :class="[
              'px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border',
              activePortalTab === 'caretaker' 
                ? 'bg-dark text-white border-dark shadow-sm' 
                : 'bg-white text-slate-600 border-brand-100 hover:bg-brand-50 hover:text-dark'
            ]"
          >
            Caretaker Portal
          </button>
          <button 
            @click="activePortalTab = 'agent'"
            :class="[
              'px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border',
              activePortalTab === 'agent' 
                ? 'bg-dark text-white border-dark shadow-sm' 
                : 'bg-white text-slate-600 border-brand-100 hover:bg-brand-50 hover:text-dark'
            ]"
          >
            Agent Portal
          </button>
        </div>

        <!-- Portal Panel Content -->
        <div class="bg-white border border-brand-100 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-sm">
          <div class="md:col-span-7 space-y-4">
            <template v-if="activePortalTab === 'landlord'">
              <span class="text-[10px] uppercase font-extrabold text-brand-600 tracking-widest">For Property Owners & Investors</span>
              <h3 class="font-heading text-2xl font-bold text-dark">Maximize yield, remove vacancy friction.</h3>
              <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Add portfolios, setup custom payment terms, and review visual dashboard summaries of real-time occupancy. Receive tenant recommendations instantly from the tenant matching engine.
              </p>
              <ul class="text-xs text-slate-600 space-y-2 pt-2">
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Assign custom commissions rules for regional property managers
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Approve tenant applications backed by verified Rental Reliability Scores
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Oversee maintenance workflows, before/after photos, and caretaker invoice logs
                </li>
              </ul>
            </template>

            <template v-if="activePortalTab === 'tenant'">
              <span class="text-[10px] uppercase font-extrabold text-brand-600 tracking-widest">For Tenants & Residents</span>
              <h3 class="font-heading text-2xl font-bold text-dark">One permanent identity. Endless mobility.</h3>
              <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Carry your rental history across properties. Apply with a pre-verified profile that highlights payment consistency and rental reviews, bypassing standard broker paperwork.
              </p>
              <ul class="text-xs text-slate-600 space-y-2 pt-2">
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Submit automated monthly rent payments via M-Pesa & Card integrations
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Submit geotagged maintenance tickets with direct photo uploads
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Secure rental deposits in platform-escrow with itemized checkout transparency
                </li>
              </ul>
            </template>

            <template v-if="activePortalTab === 'caretaker'">
              <span class="text-[10px] uppercase font-extrabold text-brand-600 tracking-widest">For Site Managers & Maintenance Staff</span>
              <h3 class="font-heading text-2xl font-bold text-dark">Ditch the logbook. Digitalize work orders.</h3>
              <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Review assigned unit reports, coordinate routine maintenance with photo verification, and execute structured move-in/move-out checks to compute deposit return breakdowns.
              </p>
              <ul class="text-xs text-slate-600 space-y-2 pt-2">
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Log unit utility metrics (meters) directly on-device at lease thresholds
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Track work tickets with instant priority markers and cost estimating
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  SMS notifications keep you aligned even without smartphone internet access
                </li>
              </ul>
            </template>

            <template v-if="activePortalTab === 'agent'">
              <span class="text-[10px] uppercase font-extrabold text-brand-600 tracking-widest">For Leasing Agents & Realtors</span>
              <h3 class="font-heading text-2xl font-bold text-dark">Accelerate leasing velocity.</h3>
              <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Manage assigned property catalogs, organize unit listings, schedule tenant viewings, and generate lease contracts using legal templates that auto-adapt to local rules.
              </p>
              <ul class="text-xs text-slate-600 space-y-2 pt-2">
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Track showing conversion rates and pending inquiries on a unified dashboard
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Automate reservation holds that collect temporary viewing fees
                </li>
                <li class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                  Track commission payouts logged directly into the system's ledger
                </li>
              </ul>
            </template>
          </div>

          <!-- Tab Visual (Mock Interface Card) -->
          <div class="md:col-span-5 bg-brand-50 border border-brand-100 rounded-2xl p-5 shadow-inner space-y-4">
            <div class="flex items-center justify-between border-b border-brand-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
                <span class="w-2.5 h-2.5 bg-slate-200 rounded-full"></span>
                <span class="w-2.5 h-2.5 bg-slate-100 rounded-full"></span>
              </div>
              <span class="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">REOS Terminal</span>
            </div>

            <!-- Custom Mock Info inside portal -->
            <div class="space-y-3 font-mono text-[11px] text-slate-700">
              <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-brand-100/50 shadow-sm">
                <span>Node Identity:</span>
                <span class="font-bold text-brand-600">reos-{{ activePortalTab }}-auth</span>
              </div>
              <div class="space-y-1">
                <div class="h-2 bg-slate-200/50 rounded w-full"></div>
                <div class="h-2 bg-slate-200/50 rounded w-11/12"></div>
                <div class="h-2 bg-slate-200/50 rounded w-9/12"></div>
              </div>
              <div class="pt-2 flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Online
                </span>
                <router-link 
                  to="/login"
                  class="bg-dark hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide"
                >
                  ACCESS PORTAL
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Property Categories Offerings Section -->
    <section id="offerings" class="py-20 px-6 max-w-7xl mx-auto w-full">
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span class="text-xs uppercase font-extrabold text-brand-700 tracking-widest bg-brand-100 px-3 py-1 rounded-full border border-brand-200/50">
          Versatile Asset Capabilities
        </span>
        <h2 class="font-heading text-3xl font-extrabold text-dark">Supported Property Offerings</h2>
        <p class="text-slate-500 text-xs sm:text-sm">REOS handles specialized workflows tailored to every major real estate segment</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        <!-- Offering 1: Residential -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Residential</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Apartments, townhomes, and private family estates with custom leases.
          </p>
        </div>

        <!-- Offering 2: Student Housing -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Student Housing</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Co-living structures with integrated student roommate profile matching.
          </p>
        </div>

        <!-- Offering 3: Commercial -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Commercial</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Offices, retail shops, and warehouses with VAT ledger configuration.
          </p>
        </div>

        <!-- Offering 4: Short-Term -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Short-Stay</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Furnished apartments and temporary lodgings with calendar availability overrides.
          </p>
        </div>

        <!-- Offering 5: Long-Term Leases -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Long-Term</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Extended residential and business leases with automated escalator index rules.
          </p>
        </div>

        <!-- Offering 6: Media Studio -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Media Studio</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Hourly bookings for podcast rooms, photography studios, and filming stages.
          </p>
        </div>

        <!-- Offering 7: Garden / Outdoor -->
        <div class="bg-white border border-brand-100 hover:border-brand-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3 border border-brand-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          <h4 class="font-heading text-xs font-bold text-dark mb-1.5">Gardens & Lawns</h4>
          <p class="text-slate-400 text-[10px] leading-relaxed">
            Event grounds, botanical lawns, and outdoor spaces with permit guidelines.
          </p>
        </div>
      </div>
    </section>

    <!-- Unique Platform Offerings Section (Light Cream & Clean Champagne Card) -->
    <section id="features" class="bg-[#faf8f5] py-20 px-6 border-b border-brand-100 relative">
      <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Text details -->
        <div class="lg:col-span-7 space-y-8">
          <div class="space-y-3">
            <span class="text-xs uppercase font-extrabold text-brand-700 tracking-widest bg-brand-100 px-3.5 py-1.5 rounded-full border border-brand-200/50">
              Built-In Compliance Features
            </span>
            <h2 class="font-heading text-3xl font-extrabold text-dark">Unique Operational Capabilities</h2>
            <p class="text-slate-500 text-xs sm:text-sm">Solving the high-friction disputes that legacy portals fail to address</p>
          </div>

          <div class="space-y-6">
            <!-- Feature Item 1 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex-shrink-0 flex items-center justify-center text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="font-heading text-base font-bold text-dark">Guided Viewing & Reservation Holds</h3>
                <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Reserve a unit with a hold fee that halts active listings. If you decline due to preference, the fee split rewards the landlord. If the unit was misrepresented, enjoy an automatic refund.
                </p>
              </div>
            </div>

            <!-- Feature Item 2 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex-shrink-0 flex items-center justify-center text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="font-heading text-base font-bold text-dark">Deposit Escrow & Itemized Claims</h3>
                <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Deposits reside in licensed escrow. Landlords can only submit itemized claims with before/after photos tagged to wear types (neglect, wear and tear, or pre-existing). Undisputed amounts settle instantly.
                </p>
              </div>
            </div>

            <!-- Feature Item 3 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex-shrink-0 flex items-center justify-center text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="font-heading text-base font-bold text-dark">Landlord Trust Ratings</h3>
                <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  A scoring system mirrors tenant history. Landlords are rated on verified title status, maintenance ticket turnaround delays, and historical deposit dispute rates. High trust raises search placement.
                </p>
              </div>
            </div>

            <!-- Feature Item 4 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex-shrink-0 flex items-center justify-center text-brand-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div class="space-y-1">
                <h3 class="font-heading text-base font-bold text-dark">SMS Fallback Notification Service</h3>
                <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Integrated via Africa's Talking. When caretakers or local landlords have no data, they get direct automated transaction messages, status logs, and warnings directly on their phone numbers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Illustration -->
        <div class="lg:col-span-5 p-8 bg-white rounded-3xl border border-brand-200 relative shadow-md">
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-brand-500 rounded-full animate-pulse"></span>
              <span class="text-xs uppercase font-extrabold tracking-widest text-brand-700">Platform Escrow Engine</span>
            </div>
            <h4 class="font-heading text-lg font-bold text-dark">Rent & Deposit Protection Shield</h4>
            
            <div class="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl space-y-4 text-xs font-mono text-slate-700">
              <div class="flex items-center justify-between text-brand-700">
                <span>Ledger entry status:</span>
                <span class="text-emerald-600 font-bold">ESCROW_HOLDING</span>
              </div>
              <div class="flex items-center justify-between border-t border-brand-100 pt-3">
                <span>Deposit Amount:</span>
                <span class="text-dark font-bold">KES 45,000.00</span>
              </div>
              <div class="flex items-center justify-between">
                <span>M-Pesa reference:</span>
                <span class="text-dark font-semibold">SHK98XJ781</span>
              </div>
              <div class="border-t border-brand-100 pt-3 space-y-2">
                <div class="text-[10px] text-slate-400 font-bold uppercase">Itemized Breakdown:</div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-600">Paint peeling (Wear & Tear)</span>
                  <span class="text-slate-500">KES 0.00 (Exempt)</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-600">Broken door frame (Neglect)</span>
                  <span class="text-brand-700 font-bold">KES 4,500.00 (Disputed)</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-600">Refundable balance</span>
                  <span class="text-emerald-600 font-bold">KES 40,500.00 (Released)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Global CTA Banner (Warm champagne backdrop) -->
    <section class="bg-brand-100/40 border-y border-brand-200/50 py-16 px-6 text-center">
      <div class="max-w-4xl mx-auto space-y-6">
        <h2 class="font-heading text-3xl sm:text-4xl font-extrabold text-dark">Join the digital rental revolution today.</h2>
        <p class="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Create your verified rental passport profile, link your properties, and automate your rental ledger balance in real-time.
        </p>
        <div class="pt-4 flex flex-wrap justify-center gap-4">
          <router-link 
            to="/login?signup=true" 
            class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm"
          >
            Create Your Account
          </router-link>
          <a 
            href="mailto:support@reos.co.ke" 
            class="border border-dark/20 hover:bg-brand-50 text-dark font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200"
          >
            Contact Integration Support
          </a>
        </div>
      </div>
    </section>

    <!-- Global Footer -->
    <footer class="bg-white border-t border-brand-100 py-16 px-6 text-slate-400 text-xs">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-brand-100 pb-12 mb-12">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img src="/logo.png" class="w-8 h-8 object-contain flex-shrink-0" alt="REOS Logo" />
            <span class="font-heading font-bold text-xl tracking-widest text-dark uppercase">REOS</span>
          </div>
          <p class="leading-relaxed text-slate-500">
            The infrastructure layer managing the complete property and tenancy transaction records across Kenyan counties.
          </p>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading text-sm font-bold text-dark uppercase tracking-wider">Product Offerings</h4>
          <ul class="space-y-2.5 text-slate-500 font-medium">
            <li><a href="#offerings" class="hover:text-brand-500">Residential Systems</a></li>
            <li><a href="#offerings" class="hover:text-brand-500">Student Housing Matching</a></li>
            <li><a href="#offerings" class="hover:text-brand-500">Commercial Operations</a></li>
            <li><a href="#offerings" class="hover:text-brand-500">Short-Term Calendars</a></li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading text-sm font-bold text-dark uppercase tracking-wider">Stakeholder Portals</h4>
          <ul class="space-y-2.5 text-slate-500 font-medium">
            <li><router-link to="/login" class="hover:text-brand-500">Landlords Portal</router-link></li>
            <li><router-link to="/login" class="hover:text-brand-500">Tenants Portal</router-link></li>
            <li><router-link to="/login" class="hover:text-brand-500">Caretakers Portal</router-link></li>
            <li><router-link to="/login" class="hover:text-brand-500">Leasing Agents Portal</router-link></li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading text-sm font-bold text-dark uppercase tracking-wider">Contact & System</h4>
          <p class="text-slate-500 leading-relaxed font-medium">
            REOS Kenya Platform<br/>
            Nairobi City County, Kenya
          </p>
          <p class="font-medium">Email: <a href="mailto:info@reos.co.ke" class="text-brand-500 hover:underline">info@reos.co.ke</a></p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p class="text-slate-500 font-medium">&copy; 2026 REOS Rental Ecosystem Operating Platform. All rights reserved.</p>
        <div class="flex gap-4 text-slate-500 font-medium">
          <a href="#" class="hover:text-brand-500">Terms of Service</a>
          <span>&middot;</span>
          <a href="#" class="hover:text-brand-500">Privacy Policy</a>
          <span>&middot;</span>
          <a href="#" class="hover:text-brand-500">Escrow Disclosures</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/store';
import { useRouter } from 'vue-router';

export default {
  name: 'LandingPage',
  setup() {
    const store = useAppStore();
    const router = useRouter();
    const activePortalTab = ref('landlord');

    const isAuthenticated = computed(() => store.isAuthenticated);

    const handleLogout = () => {
      store.logout();
      router.push('/login');
    };

    return {
      isAuthenticated,
      activePortalTab,
      handleLogout
    };
  }
};
</script>
