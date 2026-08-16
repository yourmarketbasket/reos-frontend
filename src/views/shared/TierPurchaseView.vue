<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-slate-100 p-6 rounded-2xl shadow-sm">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-100 border border-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
            {{ currentTierName }}
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">Verification &amp; Subscription Tiers</h1>
        <p class="text-xs text-slate-500 mt-1">Upgrade your verification tier to unlock more property listings and listing types.</p>
      </div>
      <div class="text-right">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Usage</p>
        <p class="text-2xl font-bold text-dark mt-0.5">{{ currentUsage }} <span class="text-sm font-semibold text-slate-500">/ {{ currentCap }}</span></p>
        <p class="text-[10px] text-slate-400 mt-0.5">properties listed</p>
      </div>
    </div>

    <!-- Tier Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      <div 
        v-for="t in tiers" 
        :key="t.id" 
        :class="[
          'bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-5',
          isCurrentTier(t)
            ? 'border-brand-500/50 ring-1 ring-brand-500/20'
            : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
        ]"
      >
        <!-- Header row: level chip + status + active badge -->
        <div class="flex items-center justify-between gap-2">
          <span :class="['text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border', tierLevelClass(t.level)]">
            Level {{ t.level }}
          </span>
          <div class="flex items-center gap-1.5">
            <span v-if="isCurrentTier(t)" class="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-500 text-dark uppercase tracking-wider">
              ✓ Active
            </span>
            <span :class="['text-[9px] font-bold px-2 py-0.5 rounded-full border', t.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100']">
              {{ t.is_active ? 'Available' : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- Tier name & price -->
        <div>
          <h3 class="font-heading font-bold text-dark text-lg leading-snug">{{ t.name }}</h3>
          <div class="flex items-baseline gap-1 mt-1 text-slate-900 font-bold text-2xl">
            <span class="text-sm font-semibold text-slate-500">KES</span>
            <span>{{ formatCurrency(t.cost_amount) }}</span>
            <span v-if="t.recurring" class="text-xs text-slate-400 font-semibold">/ {{ t.recurring_period }}</span>
            <span v-else class="text-xs text-slate-400 font-semibold">one-time</span>
          </div>
        </div>

        <!-- Details -->
        <div class="space-y-3 text-xs pt-3 border-t border-slate-100 flex-1">
          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Property Limit</span>
            <span class="font-semibold text-slate-700">
              {{ t.property_cap > 0 ? t.property_cap + ' properties' : '∞ Unlimited Properties' }}
            </span>
          </div>

          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Unlocked Listing Types</span>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="type in t.unlocked_listing_types" 
                :key="type" 
                class="px-2 py-0.5 rounded-full bg-brand-100/60 text-[10px] text-brand-700 font-semibold border border-brand-200/50"
              >
                {{ type }}
              </span>
            </div>
          </div>

          <div>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">KYC Requirements</span>
            <ul class="space-y-0.5">
              <li v-for="req in t.required_kyc_documents" :key="req.doc_type" class="flex items-start gap-1.5 text-[10px] text-slate-600">
                <span class="w-1 h-1 rounded-full bg-brand-500 flex-shrink-0 mt-1.5"></span>
                {{ req.description }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Action button -->
        <button 
          v-if="isCurrentTier(t)"
          disabled
          class="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
        >
          ✓ Currently Active
        </button>
        <button 
          v-else-if="canUpgradeTo(t)"
          @click="purchaseTier(t)"
          :disabled="purchasing"
          class="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-dark transition-all disabled:opacity-60"
        >
          {{ purchasing ? 'Processing…' : `Upgrade to ${t.name}` }}
        </button>
        <button 
          v-else
          disabled
          class="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed"
        >
          Complete tier {{ t.level - 1 }} first
        </button>
      </div>
    </div>

    <!-- Info note -->
    <div class="bg-brand-50/40 border border-brand-100 rounded-2xl p-4 flex items-start gap-3">
      <div class="w-5 h-5 mt-0.5 text-brand-500 flex-shrink-0">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <p class="text-xs font-bold text-brand-700">Sequential Upgrade Policy</p>
        <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          Tiers must be purchased sequentially. Your current limits are locked-in as a snapshot and will not decrease even if configuration changes. Contact your administrator to modify tier definitions.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'TierPurchaseView',
  setup() {
    const store = useAppStore();
    const tiers = computed(() => store.tiers || []);
    const stats = computed(() => store.stats);
    const purchasing = ref(false);

    const currentTierLevel = computed(() => stats.value?.verification?.current_tier_level || 1);
    const currentCap = computed(() => {
      const cap = stats.value?.verification?.granted_snapshot?.property_cap;
      return cap > 0 ? cap : '∞';
    });
    const currentUsage = computed(() => store.properties?.length || 0);
    const currentTierName = computed(() => {
      const tier = tiers.value.find(t => t.level === currentTierLevel.value);
      return tier ? tier.name : `Tier ${currentTierLevel.value}`;
    });

    const isCurrentTier = (t) => t.level === currentTierLevel.value;

    const canUpgradeTo = (t) => {
      // Can only upgrade to exactly the next level
      return t.level === currentTierLevel.value + 1 && t.is_active;
    };

    const tierLevelClass = (level) => {
      if (level === 1) return 'bg-slate-50 text-slate-600 border-slate-200';
      if (level === 2) return 'bg-brand-100 text-brand-700 border-brand-200';
      return 'bg-purple-50 text-purple-700 border-purple-200';
    };

    const purchaseTier = async (tier) => {
      purchasing.value = true;
      store.error = null;
      try {
        await store.upgradeTier(tier.level);
        store.success = `Successfully upgraded to ${tier.name}! Your new limits are now active.`;
      } catch (e) {
        // Error captured in store
      } finally {
        purchasing.value = false;
      }
    };

    const formatCurrency = (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    onMounted(async () => {
      await store.fetchTiers();
      if (store.fetchStats) await store.fetchStats();
    });

    return {
      tiers,
      purchasing,
      currentTierLevel,
      currentCap,
      currentUsage,
      currentTierName,
      isCurrentTier,
      canUpgradeTo,
      tierLevelClass,
      purchaseTier,
      formatCurrency
    };
  }
};
</script>
