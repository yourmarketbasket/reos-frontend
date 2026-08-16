<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Billing Admin
        </span>
        <h1 class="text-2xl font-bold text-slate-900">Finance & Billing</h1>
        <p class="text-sm text-slate-500 mt-0.5">Ledger overview, reconciliation, refunds, and deduction claims</p>
      </div>
      <button @click="showRefundModal = true" class="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-900/20">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>
        Process Refund
      </button>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="k in kpis" :key="k.label" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ k.label }}</p>
        <p class="text-3xl font-bold mt-1.5" :class="k.color">{{ k.value }}</p>
        <p class="text-[10px] text-slate-400 mt-1">{{ k.sub }}</p>
      </div>
    </div>

    <!-- Ledger + Refund Queue -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Ledger -->
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-slate-800">Ledger — Recent Transactions</h2>
          <div class="flex gap-2">
            <button v-for="t in txTypes" :key="t" @click="activeTx = t" :class="['text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors', activeTx === t ? 'bg-amber-600 text-white border-amber-600' : 'text-slate-500 border-slate-200']">{{ t }}</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-100"><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 pr-4">Ref</th><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 pr-4">Party</th><th class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2 pr-4">Type</th><th class="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-2">Amount</th></tr></thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="tx in pagedTransactions" :key="tx.ref" class="hover:bg-slate-50/50">
                <td class="py-2.5 pr-4 text-[10px] font-mono text-slate-500">{{ tx.ref }}</td>
                <td class="py-2.5 pr-4 text-xs font-medium text-slate-700">{{ tx.party }}</td>
                <td class="py-2.5 pr-4"><span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', tx.typeCls]">{{ tx.type }}</span></td>
                <td class="py-2.5 text-xs font-bold text-right" :class="tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'">{{ tx.amount > 0 ? '+' : '' }}KES {{ Math.abs(tx.amount).toLocaleString() }}</td>
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

      <!-- Refund queue -->
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-slate-800 mb-4">Refund Queue</h2>
        <div class="space-y-3">
          <div v-for="r in refundQueue" :key="r.id" class="p-3.5 border border-amber-100 bg-amber-50/30 rounded-xl">
            <p class="text-xs font-bold text-slate-700">{{ r.party }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">{{ r.reason }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm font-bold text-amber-700">KES {{ r.amount.toLocaleString() }}</span>
              <div class="flex gap-1.5">
                <button @click="processRefund(r, true)" class="text-[10px] font-bold py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors">Approve</button>
                <button @click="processRefund(r, false)" class="text-[10px] font-bold py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors">Deny</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Deduction claims -->
    <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h2 class="font-bold text-slate-800 mb-4">Deduction Claims Review</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="c in deductionClaims" :key="c.id" class="p-4 border border-slate-100 rounded-xl">
          <div class="flex items-start justify-between gap-2 mb-2">
            <p class="text-xs font-bold text-slate-700">{{ c.property }}</p>
            <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', c.statusCls]">{{ c.status }}</span>
          </div>
          <p class="text-[10px] text-slate-500 mb-2">{{ c.items }}</p>
          <p class="text-base font-bold text-slate-800">KES {{ c.amount.toLocaleString() }}</p>
          <div class="flex gap-2 mt-3">
            <button class="flex-1 text-[10px] font-bold py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">Review</button>
            <button class="flex-1 text-[10px] font-bold py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">Settle</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref } from 'vue';
import { useAppStore } from '@/stores/store';
export default {
  name: 'BillingAdminDashboard',
  setup() {
    const store = useAppStore();
    const showRefundModal = ref(false);
    const activeTx = ref('All');
    const txTypes = ['All', 'Rent', 'Deposit', 'Refund', 'Commission'];

    const kpis = [
      { label: 'GMV (MTD)', value: '—', sub: 'Gross transaction volume', color: 'text-slate-800' },
      { label: 'Pending Reconciliation', value: '—', sub: 'Unverified transactions', color: 'text-amber-600' },
      { label: 'Open Refunds', value: '—', sub: 'Awaiting approval', color: 'text-red-600' },
      { label: 'Platform Fees (MTD)', value: '—', sub: 'Service charges collected', color: 'text-emerald-600' },
    ];

    const transactions = [
      { ref: 'TX-0091', party: 'John Tenant', type: 'RENT', typeCls: 'bg-blue-50 text-blue-700 border-blue-200', amount: 35000 },
      { ref: 'TX-0090', party: 'Wanjiku Ltd', type: 'DEPOSIT', typeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200', amount: 70000 },
      { ref: 'TX-0089', party: 'Agent Kamau', type: 'COMMISSION', typeCls: 'bg-violet-50 text-violet-700 border-violet-200', amount: 5250 },
      { ref: 'TX-0088', party: 'Jane Tenant', type: 'REFUND', typeCls: 'bg-rose-50 text-rose-700 border-rose-200', amount: -15000 },
    ];

    const refundQueue = [
      { id: 1, party: 'Jane Doe', reason: 'Overpayment on Oct rent', amount: 3200 },
      { id: 2, party: 'Moses K.', reason: 'Deposit partial return', amount: 25000 },
    ];

    const deductionClaims = [
      { id: 1, property: 'Unit 3B, Kilimani Court', items: 'Broken blinds, damaged tiles', amount: 18500, status: 'PENDING', statusCls: 'bg-amber-50 text-amber-700 border-amber-200' },
      { id: 2, property: 'Unit 1A, Westlands Apt', items: 'Deep cleaning, repainting', amount: 32000, status: 'UNDER REVIEW', statusCls: 'bg-blue-50 text-blue-700 border-blue-200' },
      { id: 3, property: 'Unit 7C, Karen Estate', items: 'Broken window unit', amount: 12000, status: 'PENDING', statusCls: 'bg-amber-50 text-amber-700 border-amber-200' },
    ];

    const processRefund = (r, approved) => {
      if (approved) store.success = `Refund of KES ${r.amount.toLocaleString()} approved for ${r.party}`;
      else store.error = `Refund request for ${r.party} denied.`;
    };


    // Pagination: transactions
    const { paginatedItems: pagedTransactions, currentPage: currentPage, totalPages: totalPages, totalItems: totalItems, startItem: startItem, endItem: endItem, pageNumbers: pageNumbers, pageSize: pageSize, prevPage: prevPage, nextPage: nextPage, goToPage: goToPage } = usePagination(transactions);
    return { kpis, transactions, refundQueue, deductionClaims, showRefundModal, activeTx, txTypes, processRefund, pagedTransactions, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage };
  }
};
</script>
