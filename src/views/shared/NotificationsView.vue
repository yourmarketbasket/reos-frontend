<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <h2 class="font-heading text-2xl font-bold text-slate-800">System Notifications</h2>
        <p class="text-xs text-slate-500 mt-1">Real-time alerts, updates, and activities related to your account.</p>
      </div>
      <button 
        v-if="store.notifications.length > 0"
        @click="clearAll" 
        class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Clear All</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="store.notifications.length === 0" class="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 bg-white border border-slate-100 rounded-2xl p-8">
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 animate-pulse">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div>
        <h3 class="text-base font-bold text-slate-800">All caught up!</h3>
        <p class="text-xs text-slate-500 mt-1">No new notifications. You'll receive real-time updates when system events occur.</p>
      </div>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
      <div 
        v-for="item in store.notifications" 
        :key="item.id" 
        class="bg-white border border-slate-100 hover:border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4 transition-all hover:shadow"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-800">{{ item.title }}</h4>
            <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ item.body }}</p>
            <span class="text-[9px] font-semibold text-slate-400 mt-2 block">{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>
        <button 
          @click="removeOne(item.id)" 
          class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
          title="Remove notification"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from '@/stores/store';

export default {
  name: 'NotificationsView',
  setup() {
    const store = useAppStore();

    const clearAll = () => {
      store.notifications = [];
      store.success = 'Notifications cleared!';
    };

    const removeOne = (id) => {
      store.notifications = store.notifications.filter(n => n.id !== id);
    };

    const formatTime = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
    };

    return {
      store,
      clearAll,
      removeOne,
      formatTime
    };
  }
};
</script>
