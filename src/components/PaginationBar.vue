<template>
  <div v-if="totalPages > 1 || showAlways" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-3 border-t border-slate-100">
    <!-- Info -->
    <p class="text-xs text-slate-400 shrink-0">
      Showing <span class="font-bold text-slate-600">{{ startItem }}–{{ endItem }}</span> of <span class="font-bold text-slate-600">{{ totalItems }}</span>
    </p>

    <div class="flex items-center gap-2">
      <!-- Rows per page -->
      <div class="flex items-center gap-1.5 mr-2">
        <span class="text-[10px] text-slate-400 font-medium">Rows</span>
        <select
          :value="pageSize"
          @change="$emit('update:pageSize', Number($event.target.value))"
          class="text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option v-for="s in pageSizeOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Prev -->
      <button
        @click="$emit('prev')"
        :disabled="currentPage <= 1"
        class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Page numbers -->
      <div class="flex items-center gap-1">
        <template v-for="(p, i) in pageNumbers" :key="i">
          <span v-if="p === '…'" class="text-xs text-slate-300 px-1">…</span>
          <button
            v-else
            @click="$emit('go', p)"
            :class="[
              'w-7 h-7 rounded-lg text-xs font-bold transition-all',
              currentPage === p
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
            ]"
          >{{ p }}</button>
        </template>
      </div>

      <!-- Next -->
      <button
        @click="$emit('next')"
        :disabled="currentPage >= totalPages"
        class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaginationBar',
  props: {
    currentPage:     { type: Number, required: true },
    totalPages:      { type: Number, required: true },
    totalItems:      { type: Number, required: true },
    startItem:       { type: Number, required: true },
    endItem:         { type: Number, required: true },
    pageNumbers:     { type: Array,  required: true },
    pageSize:        { type: Number, required: true },
    pageSizeOptions: { type: Array,  default: () => [10, 25, 50, 100] },
    showAlways:      { type: Boolean, default: false },
  },
  emits: ['prev', 'next', 'go', 'update:pageSize'],
};
</script>
