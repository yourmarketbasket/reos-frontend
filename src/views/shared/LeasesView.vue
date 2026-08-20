<template>
  <div class="space-y-6">

    <!-- ═══ TENANT / CLIENT VIEW ═══ -->
    <template v-if="isTenant">
      <div class="border-b border-slate-200 pb-4">
        <h2 class="font-heading text-2xl font-bold text-slate-800">My Lease</h2>
        <p class="text-xs text-slate-500 mt-1">View your current lease terms, rent schedule, and agreement document.</p>
      </div>

      <!-- No lease yet -->
      <div v-if="!myLease" class="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <svg class="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">No active lease found</h3>
          <p class="text-xs text-slate-400 mt-1">Contact your landlord or agent to get your lease set up.</p>
        </div>
      </div>

      <!-- Lease card -->
      <div v-else class="space-y-4">
        <!-- Status banner -->
        <div :class="['rounded-2xl p-5 border flex items-center gap-4',
          myLease.status === 'active' ? 'bg-emerald-50 border-emerald-200' :
          myLease.status === 'notice_given' ? 'bg-amber-50 border-amber-200' :
          'bg-slate-50 border-slate-200']">
          <div :class="['w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
            myLease.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
            myLease.status === 'notice_given' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500']">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div class="flex-1">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Lease ID</p>
            <p class="font-bold text-slate-800 font-mono">{{ myLease.id }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ myLease.unit_name || myLease.unit_id }}{{ myLease.property_name ? ' · ' + myLease.property_name : '' }}</p>
          </div>
          <span :class="statusBadge(myLease.status)">{{ statusLabel(myLease.status) }}</span>
        </div>

        <!-- Metric row -->
        <div class="grid grid-cols-3 gap-3">
          <div class="metric-card">
            <p class="metric-label">Monthly Rent</p>
            <p class="metric-value text-amber-700">KES {{ (myLease.rent_amount||0).toLocaleString() }}</p>
            <p class="metric-sub">per month</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">Security Deposit</p>
            <p class="metric-value text-slate-700">KES {{ (myLease.deposit_amount||0).toLocaleString() }}</p>
            <p class="metric-sub">held</p>
          </div>
          <div class="metric-card">
            <p class="metric-label">Days Remaining</p>
            <p :class="['metric-value', daysLeft(myLease.end_date) <= 30 ? 'text-rose-600' : daysLeft(myLease.end_date) <= 90 ? 'text-amber-600' : 'text-emerald-700']">
              {{ myLease.status === 'active' ? daysLeft(myLease.end_date) : '—' }}
            </p>
            <p class="metric-sub">{{ myLease.status === 'active' ? 'days left' : 'lease closed' }}</p>
          </div>
        </div>

        <!-- Term & financials -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 class="section-label">Term Timeline</h4>
            <div class="space-y-2 mt-2">
              <div class="profile-row"><span class="profile-key">Start Date</span><span class="profile-val">{{ formatDate(myLease.start_date) }}</span></div>
              <div class="profile-row"><span class="profile-key">End Date</span><span class="profile-val">{{ formatDate(myLease.end_date) }}</span></div>
              <div class="profile-row"><span class="profile-key">Duration</span><span class="profile-val">{{ leaseDuration(myLease.start_date, myLease.end_date) }}</span></div>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 class="section-label">Financials</h4>
            <div class="space-y-2 mt-2">
              <div class="profile-row"><span class="profile-key">Rent/mo</span><span class="profile-val text-amber-700">KES {{ (myLease.rent_amount||0).toLocaleString() }}</span></div>
              <div class="profile-row"><span class="profile-key">Deposit</span><span class="profile-val">KES {{ (myLease.deposit_amount||0).toLocaleString() }}</span></div>
              <div class="profile-row"><span class="profile-key">Arrears</span><span :class="['profile-val', (myLease.arrears||0) > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600']">{{ (myLease.arrears||0) > 0 ? 'KES ' + myLease.arrears.toLocaleString() : 'None' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Agreement button -->
        <button @click="openAgreementCompiler(myLease)" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
          📜 View Lease Agreement Document
        </button>
      </div>

      <!-- Agreement modal (tenant) -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="showAgreementModal" class="modal-overlay" @click.self="showAgreementModal = false">
            <div class="modal-backdrop" @click="showAgreementModal = false"></div>
            <div class="modal-panel max-w-lg">
              <div class="modal-accent bg-slate-900"></div>
              <div class="p-6 space-y-6">
                <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 class="text-base font-bold text-slate-800 font-heading">Lease Agreement Document</h3>
                  <button @click="showAgreementModal = false" class="text-slate-400 hover:text-slate-700 p-1">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-[10px] text-slate-700 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">{{ compiledAgreementText }}</div>
                <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button @click="showAgreementModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs">Close</button>
                  <button @click="() => window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5">🖨️ Print</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>


    <!-- ═══ MANAGEMENT VIEW (landlord / agent / staff / admin) ═══ -->
    <template v-else>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 class="font-heading text-2xl font-bold text-slate-800">Lease Contracts &amp; Transfers</h2>
          <p class="text-xs text-slate-500 mt-1">Monitor occupancy, generate termination notices, and process tenant transfers.</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-xs text-slate-500 font-medium">{{ filteredLeases.length }} lease{{ filteredLeases.length !== 1 ? 's' : '' }}</span>
          <select v-model="statusFilter" class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="notice_given">Under Notice</option>
            <option value="terminated">Terminated</option>
            <option value="completed">Completed</option>
          </select>
          <input v-model="searchQuery" type="text" placeholder="Search tenant, unit..." class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 w-44 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-400"/>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card"><div class="stat-icon bg-amber-50 text-amber-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div><div><p class="stat-label">Active</p><p class="stat-value text-amber-700">{{ activeLeases.length }}</p></div></div>
        <div class="stat-card"><div class="stat-icon bg-amber-50 text-amber-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><p class="stat-label">Under Notice</p><p class="stat-value text-amber-600">{{ underNoticeLeases.length }}</p></div></div>
        <div class="stat-card"><div class="stat-icon bg-rose-50 text-rose-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><p class="stat-label">Terminated</p><p class="stat-value text-rose-700">{{ terminatedLeases.length }}</p></div></div>
        <div class="stat-card"><div class="stat-icon bg-emerald-50 text-emerald-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><p class="stat-label">Monthly Rent</p><p class="stat-value text-emerald-700">KES {{ totalMonthlyRent.toLocaleString() }}</p></div></div>
      </div>

      <div v-if="filteredLeases.length === 0" class="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-4 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
        <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <div><h3 class="text-sm font-bold text-slate-800">No leases found</h3><p class="text-xs text-slate-400 mt-1">Try adjusting your search or status filter.</p></div>
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/70">
                <th v-for="col in columns" :key="col.key" @click="col.sortable && sortBy(col.key)"
                  :class="['px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap', col.sortable ? 'cursor-pointer hover:text-slate-600' : '']">
                  <span class="flex items-center gap-1">{{ col.label }}<span v-if="col.sortable" class="text-slate-300">{{ sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅' }}</span></span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in pagedSortedLeases" :key="l.id" @click="openModal(l)" class="border-b border-slate-50 last:border-none hover:bg-amber-50/30 cursor-pointer transition-colors group">
                <td class="px-4 py-3"><p class="text-xs font-bold font-mono text-slate-800 group-hover:text-amber-700 transition-colors">{{ l.id }}</p></td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div :style="{ background: avatarColor(l.tenant_name || l.tenant_id) }" class="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 uppercase">{{ (l.tenant_name || l.tenant_id || '?').charAt(0) }}</div>
                    <div><p class="text-xs font-semibold text-slate-700">{{ l.tenant_name || l.tenant_id }}</p><p class="text-[10px] text-slate-400">{{ l.tenant_email || '' }}</p></div>
                  </div>
                </td>
                <td class="px-4 py-3"><p class="text-xs font-semibold text-slate-700">{{ l.unit_name || l.unit_id }}</p><p class="text-[10px] text-slate-400">{{ l.property_name || '' }}</p></td>
                <td class="px-4 py-3"><p class="text-xs font-bold text-slate-800">KES {{ (l.rent_amount||0).toLocaleString() }}</p><p class="text-[10px] text-slate-400">/month</p></td>
                <td class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{{ formatDate(l.start_date) }}</td>
                <td class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{{ formatDate(l.end_date) }}</td>
                <td class="px-4 py-3"><span v-if="l.status === 'active'" :class="['text-xs font-bold', daysLeft(l.end_date) <= 30 ? 'text-rose-600' : daysLeft(l.end_date) <= 90 ? 'text-amber-600' : 'text-slate-600']">{{ daysLeft(l.end_date) }}d</span><span v-else class="text-xs text-slate-400">—</span></td>
                <td class="px-4 py-3"><span :class="statusBadge(l.status)">{{ statusLabel(l.status) }}</span></td>
                <td class="px-4 py-3"><span class="text-[10px] text-amber-500 font-semibold group-hover:text-amber-700 transition-colors">View →</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
        :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers" :page-size="pageSize"
        @prev="prevPage" @next="nextPage" @go="goToPage" @update:pageSize="pageSize = $event" class="px-4 pb-4"/>

      <!-- Lease detail modal -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="selectedLease" class="modal-overlay" @click.self="closeModal">
            <div class="modal-backdrop" @click="closeModal"></div>
            <div class="modal-panel">
              <div :class="['modal-accent', selectedLease.status === 'active' ? 'accent-gold' : selectedLease.status === 'notice_given' ? 'accent-amber' : 'accent-rose']"></div>
              <div class="p-6 space-y-6">
                <div class="flex items-start justify-between gap-4">
                  <div><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lease Contract</p><h3 class="text-lg font-extrabold text-slate-800 font-mono">{{ selectedLease.id }}</h3><p class="text-xs text-slate-500 mt-0.5">{{ selectedLease.unit_name || selectedLease.unit_id }}{{ selectedLease.property_name ? ' · ' + selectedLease.property_name : '' }}</p></div>
                  <div class="flex items-center gap-2 shrink-0"><span :class="statusBadge(selectedLease.status)">{{ statusLabel(selectedLease.status) }}</span><button @click="closeModal" class="text-slate-400 hover:text-slate-700 p-1"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                </div>

                <div class="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div :style="{ background: avatarColor(selectedLease.tenant_name || selectedLease.tenant_id) }" class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg uppercase shrink-0 shadow">{{ (selectedLease.tenant_name || selectedLease.tenant_id || '?').charAt(0) }}</div>
                  <div><p class="text-sm font-extrabold text-slate-800">{{ selectedLease.tenant_name || selectedLease.tenant_id }}</p><p class="text-xs text-slate-500">{{ selectedLease.tenant_email || '' }}</p><p class="text-xs text-slate-500">{{ selectedLease.tenant_phone || '' }}</p></div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div class="metric-card"><p class="metric-label">Monthly Rent</p><p class="metric-value text-amber-700">KES {{ (selectedLease.rent_amount||0).toLocaleString() }}</p><p class="metric-sub">per month</p></div>
                  <div class="metric-card"><p class="metric-label">Security Deposit</p><p class="metric-value text-slate-700">KES {{ (selectedLease.deposit_amount||0).toLocaleString() }}</p><p class="metric-sub">held</p></div>
                  <div class="metric-card"><p class="metric-label">Days Remaining</p><p :class="['metric-value', daysLeft(selectedLease.end_date) <= 30 ? 'text-rose-600' : daysLeft(selectedLease.end_date) <= 90 ? 'text-amber-600' : 'text-emerald-700']">{{ selectedLease.status === 'active' ? daysLeft(selectedLease.end_date) : '—' }}</p><p class="metric-sub">{{ selectedLease.status === 'active' ? 'days left' : 'lease closed' }}</p></div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div class="space-y-3">
                    <h4 class="section-label">Term Timeline</h4>
                    <div class="space-y-2">
                      <div class="profile-row"><span class="profile-key">Start Date</span><span class="profile-val">{{ formatDate(selectedLease.start_date) }}</span></div>
                      <div class="profile-row"><span class="profile-key">End Date</span><span class="profile-val">{{ formatDate(selectedLease.end_date) }}</span></div>
                      <div class="profile-row"><span class="profile-key">Lease Term</span><span class="profile-val">{{ leaseDuration(selectedLease.start_date, selectedLease.end_date) }}</span></div>
                      <div class="profile-row"><span class="profile-key">Unit ID</span><span class="profile-val font-mono text-[10px]">{{ selectedLease.unit_id }}</span></div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <h4 class="section-label">Financial Summary</h4>
                    <div class="space-y-2">
                      <div class="profile-row"><span class="profile-key">Rent/mo</span><span class="profile-val text-amber-700">KES {{ (selectedLease.rent_amount||0).toLocaleString() }}</span></div>
                      <div class="profile-row"><span class="profile-key">Deposit</span><span class="profile-val">KES {{ (selectedLease.deposit_amount||0).toLocaleString() }}</span></div>
                      <div class="profile-row"><span class="profile-key">Total Value</span><span class="profile-val font-bold text-slate-800">KES {{ totalLeaseValue(selectedLease).toLocaleString() }}</span></div>
                      <div class="profile-row"><span class="profile-key">Arrears</span><span :class="['profile-val', (selectedLease.arrears||0) > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600']">{{ (selectedLease.arrears||0) > 0 ? 'KES '+selectedLease.arrears.toLocaleString() : 'None' }}</span></div>
                    </div>
                  </div>
                </div>

                <div class="border-t border-slate-100 pt-4">
                  <button @click="openAgreementCompiler(selectedLease)" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2">
                    📜 View Agreement Document (Compiled)
                  </button>
                </div>

                <template v-if="selectedLease.status === 'active'">
                  <div class="border-t border-slate-100 pt-4 space-y-3">
                    <button @click="showVacateForm = !showVacateForm" class="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      {{ showVacateForm ? 'Cancel Notice' : '🚪 Issue Notice to Vacate' }}
                    </button>
                    <Transition name="slide-down">
                      <div v-if="showVacateForm" class="space-y-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Move-out Date</label><input type="date" v-model="vacateDate" class="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"/></div>
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reason</label><textarea v-model="vacateReason" rows="2" placeholder="Explain the vacate trigger..." class="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white resize-none placeholder-slate-300"></textarea></div>
                        <div class="flex justify-end gap-2"><button @click="showVacateForm = false" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-white transition-colors">Cancel</button><button @click="submitVacate" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-sm">Submit Notice</button></div>
                      </div>
                    </Transition>
                  </div>
                  <div class="border-t border-slate-100 pt-4 space-y-3">
                    <button @click="showTransferForm = !showTransferForm" class="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                      {{ showTransferForm ? 'Cancel Transfer' : '🔄 Transfer to New Unit' }}
                    </button>
                    <Transition name="slide-down">
                      <div v-if="showTransferForm" class="space-y-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <p class="text-xs text-slate-500">Select a destination unit. The current lease will be terminated and a new one generated.</p>
                        <div><label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Available Unit</label><select v-model="targetUnitId" class="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"><option value="" disabled>-- Select Unit --</option><option v-for="u in availableUnits" :key="u.id" :value="u.id">{{ u.name }} (KES {{ u.rent_amount.toLocaleString() }}/mo)</option></select></div>
                        <div class="flex justify-end gap-2"><button @click="showTransferForm = false" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-white transition-colors">Cancel</button><button @click="submitTransfer" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm">Process Transfer</button></div>
                      </div>
                    </Transition>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Agreement document modal -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="showAgreementModal" class="modal-overlay" @click.self="showAgreementModal = false">
            <div class="modal-backdrop" @click="showAgreementModal = false"></div>
            <div class="modal-panel max-w-lg">
              <div class="modal-accent bg-slate-900"></div>
              <div class="p-6 space-y-6">
                <div class="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 class="text-base font-bold text-slate-800 font-heading">Compiled Lease Contract Document</h3>
                  <button @click="showAgreementModal = false" class="text-slate-400 hover:text-slate-700 p-1"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-[10px] text-slate-700 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">{{ compiledAgreementText }}</div>
                <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button @click="showAgreementModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs">Close</button>
                  <button @click="() => window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5">🖨️ Print Agreement</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
import PaginationBar from '@/components/PaginationBar.vue';

const MANAGEMENT_ROLES = ['landlord', 'agent', 'caretaker', 'staff', 'admin', 'superadmin', 'tech_admin', 'billing_admin', 'support_admin'];

const MOCK_LEASES = [
  { id:'lease_x99a', unit_id:'unit_104', unit_name:'Apt 104 - Westlands Block B', property_name:'Westlands Heights', tenant_id:'user_t88', tenant_name:'John Kamau', tenant_email:'kamau.j@gmail.com', tenant_phone:'+254 712 345 678', landlord_id:'user_l12', rent_amount:55000, deposit_amount:55000, arrears:0, status:'active', start_date:'2026-01-01T00:00:00Z', end_date:'2026-12-31T00:00:00Z' },
  { id:'lease_k77b', unit_id:'unit_205', unit_name:'Studio 205 - Kilimani', property_name:'Kilimani Gardens', tenant_id:'user_t44', tenant_name:'Amina Omondi', tenant_email:'amina.o@outlook.com', tenant_phone:'+254 722 987 654', landlord_id:'user_l12', rent_amount:38000, deposit_amount:38000, arrears:15000, status:'notice_given', start_date:'2025-06-01T00:00:00Z', end_date:'2026-05-31T00:00:00Z' },
  { id:'lease_r21c', unit_id:'unit_310', unit_name:'Townhouse 3 - Kiambu Rd', property_name:'Kiambu Villas', tenant_id:'user_t61', tenant_name:'David Ndambuki', tenant_email:'ndambuki.d@yahoo.com', tenant_phone:'+254 733 111 222', landlord_id:'user_l12', rent_amount:75000, deposit_amount:75000, arrears:0, status:'terminated', start_date:'2025-01-01T00:00:00Z', end_date:'2025-12-31T00:00:00Z' }
];

export default {
  name: 'LeasesView',
  components: { PaginationBar },
  setup() {
    const store = useAppStore();

    const userRole = computed(() => store.userRole || store.user?.role || '');
    const isTenant = computed(() => !MANAGEMENT_ROLES.includes(userRole.value));

    // ── Shared helpers ───────────────────────────────────────────────
    const formatDate = d => d ? new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const daysLeft   = e => e ? Math.max(0, Math.ceil((new Date(e) - new Date()) / 864e5)) : 0;
    const leaseDuration = (s, e) => { if (!s || !e) return '—'; const m = Math.round((new Date(e) - new Date(s)) / (864e5 * 30)); return m >= 12 ? `${Math.floor(m/12)}yr ${m%12}mo` : `${m} months`; };
    const totalLeaseValue = l => { if (!l.start_date || !l.end_date) return 0; return (l.rent_amount || 0) * Math.round((new Date(l.end_date) - new Date(l.start_date)) / (864e5 * 30)); };
    const statusLabel = s => ({ active: 'Active', notice_given: 'Under Notice', terminated: 'Terminated', completed: 'Completed' }[s] || s);
    const statusBadge = s => {
      const b = 'text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ';
      return b + ({ active: 'bg-emerald-100 text-emerald-700 border-emerald-200', notice_given: 'bg-amber-100 text-amber-700 border-amber-200', terminated: 'bg-rose-100 text-rose-700 border-rose-200' }[s] || 'bg-slate-100 text-slate-600 border-slate-200');
    };
    const avatarColor = (n = '') => {
      const colors = ['#C9973F', '#1C1712', '#8C6B32', '#4A3728', '#6B4C20', '#D4A853', '#3D2B1F', '#A07840'];
      let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
      return colors[Math.abs(h) % colors.length];
    };

    // Agreement compiler
    const showAgreementModal = ref(false);
    const compiledAgreementText = ref('');
    const openAgreementCompiler = (lease) => {
      const start = formatDate(lease.start_date), end = formatDate(lease.end_date);
      const rent = Number(lease.rent_amount || 0).toLocaleString();
      const dep  = Number(lease.deposit_amount || 0).toLocaleString();
      compiledAgreementText.value = `RESIDENTIAL TENANCY AGREEMENT\n\nThis Agreement is made on ${start} by and between:\n\nLANDLORD: REOS Properties Management (Owner ID: ${lease.landlord_id || '—'})\nTENANT: ${lease.tenant_name || lease.tenant_id}\n\n1. PROPERTY PREMISES\nUnit: ${lease.unit_name || lease.unit_id}\nProperty: ${lease.property_name || 'REOS Assigned Property Estate'}\n\n2. TERM OF LEASE\nCommencement: ${start}\nExpiry: ${end}\n\n3. RENT & DEPOSITS\n* Monthly Rent: KES ${rent} payable on or before the 5th of each month.\n* Security Deposit: KES ${dep} held and refundable on move-out inspection.\n\n4. COVENANTS\n* Tenant shall maintain the premises in a clean and sanitary condition.\n* Tenant shall not sub-let without written consent from the Landlord.\n* Landlord reserves the right to inspect upon 24 hours notice.\n\nIN WITNESS WHEREOF, the parties have signed this Agreement.\n\nLandlord Signatory: _______________________\nTenant Signatory:   _________________________`;
      showAgreementModal.value = true;
    };

    // ── TENANT SIDE ─────────────────────────────────────────────────
    const myLease = computed(() => {
      const all = store.leases || [];
      const uid = store.user?.id;
      return all.find(l => l.tenant_id === uid && (l.status === 'active' || l.status === 'notice_given')) || all.find(l => l.tenant_id === uid) || null;
    });

    // ── MANAGEMENT SIDE ─────────────────────────────────────────────
    const searchQuery  = ref('');
    const statusFilter = ref('');
    const sortKey      = ref('start_date');
    const sortDir      = ref('desc');
    const selectedLease    = ref(null);
    const showVacateForm   = ref(false);
    const showTransferForm = ref(false);
    const vacateDate   = ref('');
    const vacateReason = ref('');
    const targetUnitId = ref('');

    const columns = [
      { key: 'id',           label: 'Lease ID',  sortable: true  },
      { key: 'tenant_name',  label: 'Tenant',    sortable: true  },
      { key: 'unit_name',    label: 'Unit',      sortable: false },
      { key: 'rent_amount',  label: 'Rent/mo',   sortable: true  },
      { key: 'start_date',   label: 'Start',     sortable: true  },
      { key: 'end_date',     label: 'End',       sortable: true  },
      { key: '_days',        label: 'Days Left', sortable: false },
      { key: 'status',       label: 'Status',    sortable: true  },
      { key: '_a',           label: '',          sortable: false },
    ];

    const availableUnits = ref([
      { id: 'unit_101', name: 'Apt 101 - Westlands Block A', rent_amount: 45000 },
      { id: 'unit_102', name: 'Apt 102 - Kilimani Heights',  rent_amount: 60000 },
      { id: 'unit_203', name: 'Apt 203 - Kiambu Road Villas', rent_amount: 75000 },
    ]);

    const leases = computed(() => store.leases || []);
    const activeLeases       = computed(() => leases.value.filter(l => l.status === 'active'));
    const underNoticeLeases  = computed(() => leases.value.filter(l => l.status === 'notice_given'));
    const terminatedLeases   = computed(() => leases.value.filter(l => l.status === 'terminated' || l.status === 'completed'));
    const totalMonthlyRent   = computed(() => activeLeases.value.reduce((s, l) => s + (l.rent_amount || 0), 0));

    const filteredLeases = computed(() => {
      let list = leases.value;
      if (statusFilter.value) list = list.filter(l => l.status === statusFilter.value);
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(l => (l.id||'').toLowerCase().includes(q) || (l.tenant_name||l.tenant_id||'').toLowerCase().includes(q) || (l.unit_name||l.unit_id||'').toLowerCase().includes(q));
      }
      return list;
    });

    const sortedLeases = computed(() =>
      [...filteredLeases.value].sort((a, b) => {
        const av = a[sortKey.value], bv = b[sortKey.value];
        if (av === bv) return 0;
        return (sortDir.value === 'asc' ? 1 : -1) * (av > bv ? 1 : -1);
      })
    );

    const sortBy = k => {
      if (sortKey.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
      else { sortKey.value = k; sortDir.value = 'asc'; }
    };

    const openModal = l => { selectedLease.value = { ...l }; showVacateForm.value = false; showTransferForm.value = false; vacateDate.value = ''; vacateReason.value = ''; targetUnitId.value = ''; };
    const closeModal = () => { selectedLease.value = null; };

    const submitVacate = async () => {
      if (!vacateDate.value || !vacateReason.value) { store.error = 'Please fill out all fields'; return; }
      try { await store.vacateLease(selectedLease.value.id, vacateReason.value, vacateDate.value); selectedLease.value.status = 'notice_given'; showVacateForm.value = false; store.success = 'Notice to vacate submitted.'; }
      catch (e) { store.error = e.message; }
    };

    const submitTransfer = async () => {
      if (!targetUnitId.value) { store.error = 'Please select a unit'; return; }
      try { const nl = await store.transferTenant(selectedLease.value.id, targetUnitId.value); selectedLease.value.status = 'terminated'; store.leases.push(nl); showTransferForm.value = false; store.success = 'Tenant transferred.'; }
      catch (e) { store.error = e.message; }
    };

    const { paginatedItems: pagedSortedLeases, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(sortedLeases);

    onMounted(() => {
      if (!store.leases || store.leases.length === 0) store.leases = MOCK_LEASES;
    });

    return {
      isTenant,
      userRole,
      // tenant
      myLease,
      // shared
      formatDate, daysLeft, leaseDuration, totalLeaseValue,
      statusLabel, statusBadge, avatarColor,
      showAgreementModal, compiledAgreementText, openAgreementCompiler,
      // management
      store, searchQuery, statusFilter, sortKey, sortDir, columns,
      leases, activeLeases, underNoticeLeases, terminatedLeases, totalMonthlyRent,
      filteredLeases, sortedLeases, selectedLease,
      showVacateForm, showTransferForm, vacateDate, vacateReason, targetUnitId, availableUnits,
      sortBy, openModal, closeModal, submitVacate, submitTransfer,
      pagedSortedLeases, currentPage, totalPages, totalItems,
      startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage,
    };
  }
};
</script>

<style scoped>
.stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:.75rem;padding:.875rem;display:flex;align-items:center;gap:.75rem}
.stat-icon{width:2.25rem;height:2.25rem;border-radius:.5rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.stat-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.stat-value{font-size:1rem;font-weight:800;line-height:1.2}
.modal-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px)}
.modal-panel{position:relative;background:#fff;border-radius:1.5rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);width:100%;max-width:44rem;max-height:90vh;overflow-y:auto}
.modal-accent{height:6px;border-radius:1.5rem 1.5rem 0 0}
.accent-gold{background:linear-gradient(90deg,#C9973F,#8C6B32)}
.accent-amber{background:linear-gradient(90deg,#fbbf24,#f97316)}
.accent-rose{background:linear-gradient(90deg,#f87171,#ec4899)}
.metric-card{background:#fff;border:1px solid #f1f5f9;border-radius:1rem;padding:1rem;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.metric-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.25rem}
.metric-value{font-size:1.35rem;font-weight:800;line-height:1}
.metric-sub{font-size:10px;color:#94a3b8;margin-top:.25rem}
.section-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.profile-row{display:flex;align-items:flex-start;gap:.5rem;font-size:.75rem}
.profile-key{color:#94a3b8;width:6rem;flex-shrink:0}
.profile-val{font-weight:600;color:#334155}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s ease}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
.modal-fade-enter-active .modal-panel,.modal-fade-leave-active .modal-panel{transition:transform .2s ease}
.modal-fade-enter-from .modal-panel,.modal-fade-leave-to .modal-panel{transform:scale(.96) translateY(10px)}
.slide-down-enter-active,.slide-down-leave-active{transition:all .2s ease}
.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translateY(-8px)}
</style>
