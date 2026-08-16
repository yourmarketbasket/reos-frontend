import { ref, computed, watch } from 'vue';

/**
 * usePagination — client-side pagination composable.
 *
 * @param {import('vue').ComputedRef<Array>|import('vue').Ref<Array>} sourceRef  Reactive array to paginate (already filtered/sorted)
 * @param {number} defaultPageSize  Rows per page (default 10)
 * @returns pagination state and helpers
 */
export function usePagination(sourceRef, defaultPageSize = 10) {
  const currentPage = ref(1);
  const pageSize = ref(defaultPageSize);

  // Reset to page 1 whenever the source list changes (e.g. filter applied)
  watch(sourceRef, () => { currentPage.value = 1; });
  // Reset to page 1 when page size changes
  watch(pageSize, () => { currentPage.value = 1; });

  const totalItems = computed(() => (sourceRef.value || []).length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)));

  // Clamp current page if source shrinks
  watch(totalPages, (tp) => { if (currentPage.value > tp) currentPage.value = tp; });

  const paginatedItems = computed(() => {
    const src = sourceRef.value || [];
    const start = (currentPage.value - 1) * pageSize.value;
    return src.slice(start, start + pageSize.value);
  });

  // Visible page numbers with ellipsis — always show first, last, and window around current
  const pageNumbers = computed(() => {
    const tp = totalPages.value;
    const cp = currentPage.value;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

    const pages = new Set([1, tp]);
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.add(i);

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
      result.push(sorted[i]);
    }
    return result;
  });

  const startItem = computed(() => totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1);
  const endItem   = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value));

  function goToPage(p) {
    if (typeof p !== 'number') return;
    currentPage.value = Math.max(1, Math.min(p, totalPages.value));
  }
  function prevPage() { goToPage(currentPage.value - 1); }
  function nextPage() { goToPage(currentPage.value + 1); }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    pageNumbers,
    startItem,
    endItem,
    goToPage,
    prevPage,
    nextPage,
  };
}
