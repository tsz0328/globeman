import { ref, computed, type Ref, type ComputedRef } from 'vue'

/**
 * 通用表格「筛选 + 前端切片分页」组合式。
 * 用于消除各管理视图中重复手写的 filteredData / paginatedData / handleSearch / handleReset。
 *
 * 入参：
 * - source：原始全量数据（ref 或计算属性）
 * - filterFn：各视图自有的筛选谓词（保留各业务不同的字段匹配逻辑）
 * - initialForm：筛选表单初始值（重置时回填）
 * - pageSize：每页条数，默认 10
 *
 * 返回：
 * - filterForm / currentPage / pageSize（双向绑定用）
 * - filteredList：筛选后的全量结果
 * - pagedList：当前页切片（直接绑 el-table :data）
 * - total：筛选后总数（绑 el-pagination :total）
 * - handleSearch / handleReset
 */
export function useTableQuery<T>(
  source: Ref<T[]> | ComputedRef<T[]>,
  filterFn: (item: T, form: any) => boolean,
  initialForm: Record<string, unknown>,
  pageSize = 10,
) {
  const filterForm = ref<Record<string, unknown>>({ ...initialForm })
  const currentPage = ref(1)
  const page = ref(pageSize)

  const filteredList = computed<T[]>(() =>
    source.value.filter((item) => filterFn(item, filterForm.value)),
  )

  const pagedList = computed<T[]>(() => {
    const start = (currentPage.value - 1) * page.value
    return filteredList.value.slice(start, start + page.value)
  })

  const total = computed(() => filteredList.value.length)

  const handleSearch = () => {
    currentPage.value = 1
  }

  const handleReset = () => {
    filterForm.value = { ...initialForm }
    currentPage.value = 1
  }

  return {
    filterForm,
    currentPage,
    pageSize: page,
    filteredList,
    pagedList,
    total,
    handleSearch,
    handleReset,
  }
}
