<template>
  <div class="space-y-6">
    <div class="border-b border-slate-200 pb-4">
      <h1 class="text-2xl font-bold tracking-tight font-heading text-slate-800">Payment Gateway Router Config</h1>
      <p class="text-xs text-slate-500 mt-1">Control active transaction processors and failover priorities platform-wide.</p>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-3">
      <div class="stat-card"><div class="stat-icon bg-emerald-50 text-emerald-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><p class="stat-label">Active Gateways</p><p class="stat-value text-emerald-700">{{ activeGateways }}</p></div></div>
      <div class="stat-card"><div class="stat-icon bg-rose-50 text-rose-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></div><div><p class="stat-label">Disabled</p><p class="stat-value text-rose-700">{{ disabledGateways }}</p></div></div>
      <div class="stat-card"><div class="stat-icon bg-blue-50 text-blue-600"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div><div><p class="stat-label">Total Gateways</p><p class="stat-value text-blue-700">{{ allGateways.length }}</p></div></div>
    </div>

    <!-- Empty state -->
    <div v-if="allGateways.length === 0" class="flex flex-col items-center justify-center min-h-[25vh] bg-white border border-slate-200 rounded-2xl p-10 text-center">
      <p class="text-xs text-slate-400">No gateway configuration loaded.</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/70">
              <th class="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gateway</th>
              <th class="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Description</th>
              <th class="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">Priority</th>
              <th class="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status</th>
              <th class="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="g in allGateways"
              :key="g.name"
              @click="openModal(g)"
              class="border-b border-slate-50 last:border-none hover:bg-blue-50/40 cursor-pointer transition-colors group"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div :class="['w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0', gatewayColor(g.name)]">
                    {{ g.name.charAt(0).toUpperCase() }}
                  </div>
                  <p class="text-sm font-bold text-slate-800 capitalize group-hover:text-blue-700 transition-colors">{{ g.name }}</p>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-xs text-slate-500 max-w-xs">{{ getGatewayDescription(g.name) }}</p>
              </td>
              <td class="px-4 py-4 text-center">
                <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">P{{ g.priority }}</span>
              </td>
              <td class="px-4 py-4">
                <span :class="['text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border', g.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200']">
                  {{ g.is_active ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="text-[10px] text-blue-500 font-semibold group-hover:text-blue-700 transition-colors">Configure →</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail / Config Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedGateway" class="modal-overlay" @click.self="closeModal">
          <div class="modal-backdrop" @click="closeModal"></div>
          <div class="modal-panel">
            <div :class="['modal-accent', selectedGateway.is_active ? 'accent-green' : 'accent-rose']"></div>
            <div class="p-6 space-y-6">
              <!-- Header -->
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow', gatewayColor(selectedGateway.name)]">
                    {{ selectedGateway.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-xl font-extrabold text-slate-800 capitalize">{{ selectedGateway.name }} Gateway</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Router Priority: P{{ selectedGateway.priority }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span :class="['text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border', selectedGateway.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200']">{{ selectedGateway.is_active ? 'Active' : 'Disabled' }}</span>
                  <button @click="closeModal" class="text-slate-400 hover:text-slate-700 p-1"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
              </div>

              <!-- Description -->
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                {{ getGatewayDescription(selectedGateway.name) }}
              </div>

              <!-- 3-metric scorecard -->
              <div class="grid grid-cols-3 gap-3">
                <div class="metric-card">
                  <p class="metric-label">Router Priority</p>
                  <p class="metric-value text-blue-700">P{{ selectedGateway.priority }}</p>
                  <p class="metric-sub">failover order</p>
                </div>
                <div class="metric-card">
                  <p class="metric-label">Supported Methods</p>
                  <p class="metric-value text-slate-700 text-base">{{ getGatewaySupportedMethods(selectedGateway.name) }}</p>
                  <p class="metric-sub">payment channels</p>
                </div>
                <div class="metric-card">
                  <p class="metric-label">Region</p>
                  <p class="metric-value text-slate-700 text-base">{{ getGatewayRegion(selectedGateway.name) }}</p>
                  <p class="metric-sub">coverage</p>
                </div>
              </div>

              <!-- Config details -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-3">
                  <h4 class="section-label">Gateway Details</h4>
                  <div class="space-y-2">
                    <div class="profile-row"><span class="profile-key">Name</span><span class="profile-val capitalize">{{ selectedGateway.name }}</span></div>
                    <div class="profile-row"><span class="profile-key">Priority</span><span class="profile-val">P{{ selectedGateway.priority }}</span></div>
                    <div class="profile-row"><span class="profile-key">Status</span><span :class="['profile-val font-bold', selectedGateway.is_active?'text-emerald-600':'text-rose-600']">{{ selectedGateway.is_active ? 'Active' : 'Disabled' }}</span></div>
                    <div class="profile-row"><span class="profile-key">Region</span><span class="profile-val">{{ getGatewayRegion(selectedGateway.name) }}</span></div>
                  </div>
                </div>
                <div class="space-y-3">
                  <h4 class="section-label">Supported Channels</h4>
                  <div class="space-y-1.5">
                    <div v-for="ch in getGatewayChannels(selectedGateway.name)" :key="ch" class="flex items-center gap-2 text-xs">
                      <span class="text-emerald-500">✓</span>
                      <span class="text-slate-700 font-medium">{{ ch }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Toggle action -->
              <div class="border-t border-slate-100 pt-4 flex items-center justify-between">
                <p class="text-xs text-slate-400">{{ selectedGateway.is_active ? 'Disabling will stop routing transactions through this gateway.' : 'Enabling will allow transactions to route through this gateway.' }}</p>
                <button
                  @click="toggleGateway(selectedGateway.name, !selectedGateway.is_active)"
                  :class="['font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm', selectedGateway.is_active ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white']"
                >
                  {{ selectedGateway.is_active ? 'Disable Gateway' : 'Enable Gateway' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';
export default {
  name: 'GatewaysView',
  setup() {
    const store = useAppStore();
    const stats = computed(() => store.dashboardStats);
    const selectedGateway = ref(null);

    const allGateways = computed(() => stats.value?.gateways || []);
    const activeGateways = computed(() => allGateways.value.filter(g => g.is_active).length);
    const disabledGateways = computed(() => allGateways.value.filter(g => !g.is_active).length);

    const getGatewayDescription = name => {
      const d = {
        daraja: 'Best for Kenya mobile money (M-Pesa STK push prompts). Highest local conversion rate. Integrated with Safaricom business paybill and buy goods services.',
        paystack: 'Optimal card settlements. Strong cross-border payments across Nigerian Naira corridors. Supports Visa, Mastercard, and Verve cards.',
        intasend: 'Aggregator gateway supporting card, bank transfers, and M-Pesa fallback settlements. Ideal for mixed-channel routing.',
        pesapal: 'Pesapal aggregation supporting East African mobile wallet and credit card channels. Covers Kenya, Uganda, Tanzania, Rwanda.'
      };
      return d[name] || 'Third-party payment processor supporting multiple channels across supported regions.';
    };
    const getGatewaySupportedMethods = name => ({ daraja: 'M-Pesa STK', paystack: 'Card / Bank', intasend: 'Card / M-Pesa', pesapal: 'Multi-wallet' }[name] || 'Multi');
    const getGatewayRegion = name => ({ daraja: 'Kenya', paystack: 'Pan-Africa', intasend: 'Kenya / EA', pesapal: 'East Africa' }[name] || 'Global');
    const getGatewayChannels = name => {
      const ch = {
        daraja: ['M-Pesa STK Push', 'Paybill', 'Buy Goods', 'C2B'],
        paystack: ['Visa / Mastercard', 'Bank Transfer', 'USSD', 'QR Code'],
        intasend: ['M-Pesa', 'Visa / Mastercard', 'Bank Transfer'],
        pesapal: ['M-Pesa', 'Airtel Money', 'Visa', 'Mastercard', 'Bank']
      };
      return ch[name] || ['Card', 'Mobile Money'];
    };
    const gatewayColor = name => ({ daraja: 'bg-green-100 text-green-700', paystack: 'bg-blue-100 text-blue-700', intasend: 'bg-purple-100 text-purple-700', pesapal: 'bg-orange-100 text-orange-700' }[name] || 'bg-slate-100 text-slate-700');

    const openModal = g => { selectedGateway.value = { ...g }; };
    const closeModal = () => { selectedGateway.value = null; };

    const toggleGateway = async (name, isActive) => {
      try {
        await store.updateGatewayConfig(name, isActive);
        await store.fetchDashboardStats();
        if (selectedGateway.value) selectedGateway.value.is_active = isActive;
        store.success = `${name} gateway ${isActive ? 'enabled' : 'disabled'}.`;
      } catch (e) { store.error = e.message; }
    };

    onMounted(() => store.fetchDashboardStats());

    return { stats, allGateways, activeGateways, disabledGateways, selectedGateway, getGatewayDescription, getGatewaySupportedMethods, getGatewayRegion, getGatewayChannels, gatewayColor, openModal, closeModal, toggleGateway };
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
.modal-panel{position:relative;background:#fff;border-radius:1.5rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);width:100%;max-width:40rem;max-height:90vh;overflow-y:auto}
.modal-accent{height:6px;border-radius:1.5rem 1.5rem 0 0}
.accent-green{background:linear-gradient(90deg,#34d399,#059669)}
.accent-rose{background:linear-gradient(90deg,#f87171,#ec4899)}
.metric-card{background:#fff;border:1px solid #f1f5f9;border-radius:1rem;padding:1rem;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.metric-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.25rem}
.metric-value{font-size:1.35rem;font-weight:800;line-height:1}
.metric-sub{font-size:10px;color:#94a3b8;margin-top:.25rem}
.section-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.profile-row{display:flex;align-items:flex-start;gap:.5rem;font-size:.75rem}
.profile-key{color:#94a3b8;width:5rem;flex-shrink:0}
.profile-val{font-weight:600;color:#334155}
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .2s ease}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
.modal-fade-enter-active .modal-panel,.modal-fade-leave-active .modal-panel{transition:transform .2s ease}
.modal-fade-enter-from .modal-panel,.modal-fade-leave-to .modal-panel{transform:scale(.96) translateY(10px)}
</style>

