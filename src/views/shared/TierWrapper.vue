<template>
  <div class="w-full">
    <TierConfigView v-if="userRole === 'superadmin'" />
    <TierPurchaseView v-else />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useAppStore } from '@/stores/store';
import TierConfigView from '@/views/admin/TierConfigView.vue';
import TierPurchaseView from '@/views/shared/TierPurchaseView.vue';

export default {
  name: 'TierWrapper',
  components: { TierConfigView, TierPurchaseView },
  setup() {
    const store = useAppStore();
    const userRole = computed(() => store.user?.role || '');
    return { userRole };
  }
};
</script>
