<template>
  <div class="repair-detail-editor">
    <div class="repair-detail-table-region" ref="tableRegionRef">
      <el-table :data="pageRows" border class="repair-detail-table" row-key="rowKey">
        <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
        <el-table-column label="品名" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.equipmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="型号" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.equipmentModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" min-width="100">
          <template #default="scope">
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌" min-width="100">
          <template #default="scope">
            <span>{{ scope.row.manufacturer }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参数" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.spec }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SN码" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.sn || '—' }}</span>
          </template>
        </el-table-column>
        <!-- 操作列：维修详情可删除（与订单详情已提交禁用区分）。打印时通过 iframe 注入样式隐藏 -->
        <el-table-column label="操作" width="73" align="center" fixed="right" class-name="no-print">
          <template #default="scope">
            <el-button type="danger" size="small" :loading="deleteLoadingId === scope.row.id" @click.stop="handleRowDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="repair-detail-editor__footer">
      <el-pagination
        v-if="detailList.length > pageSize"
        class="repair-detail-pagination"
        background
        size="small"
        layout="total, prev, pager, next"
        :total="detailList.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import { type Order } from '@/composables/order/useOrder'
import { deleteSnApi, type RepairOrderDetail } from '@/api/repair/RepairApi'
import type { DetailData } from '@/api/order/OrderDeviceApi'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
  // 维修单内联明细（来自 getOrder 返回的 details）
  details: RepairOrderDetail[]
}>()

// 明细变更（删除）后通知父组件重新拉取订单列表，刷新内嵌 details
const emit = defineEmits<{
  (e: 'changed'): void
}>()

const { detailList } = useDetail()

// 删除按钮 loading 标识
const deleteLoadingId = ref<string | number | null>(null)

// 维修订单：明细与 SN 均随列表接口内联返回；按实际已扫 SN 码数量展开为多行，
// 仅展示 SN 非空的行（空 SN 不展示，扫几条 SN 就显示几行）
const mapRepairDetails = (details: RepairOrderDetail[]) => {
  if (!props.order) return
  const rows: DetailData[] = []
  for (const d of details) {
    const snList = (d.SN || [])
      .map((s) => (s || '').trim())
      .filter((s) => s)
    snList.forEach((sn, i) => {
      rows.push({
        id: d.id,
        projectId: props.order!.id,
        belongProject: '',
        equipmentName: d.name,
        equipmentModel: d.model,
        manufacturer: d.brand,
        sn: sn,
        status: '',
        quantity: d.number,
        unitPrice: 0,
        total: 0,
        type: d.type || '',
        spec: d.spec || '',
        rowKey: `${d.id}-${i}`,
      })
    })
  }
  detailList.value = rows
}

// 分页：每页行数由「弹窗可容纳行数」动态决定（与普通订单详情一致），仅按实际行数分页展示
const currentPage = ref(1)
const pageSize = ref(10)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return detailList.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：表格区域高度 + 实测行高/表头高 → 计算每页行数
const tableRegionRef = ref<HTMLElement>()
const ROW_H = ref(40) // el-table small 行高（兜底值，渲染后实测覆盖）
const HEADER_H = ref(41) // 表头高度（兜底值）

const measure = () => {
  const region = tableRegionRef.value
  if (!region) return
  const h = region.clientHeight
  if (h <= 0) return // 弹窗隐藏时区域高度为 0，跳过

  const tableEl = region.querySelector('.el-table') as HTMLElement | null
  if (tableEl) {
    const headerEl = tableEl.querySelector('.el-table__header-wrapper') as HTMLElement | null
    const firstRow = tableEl.querySelector('.el-table__row') as HTMLElement | null
    if (headerEl) HEADER_H.value = headerEl.offsetHeight
    if (firstRow) ROW_H.value = firstRow.offsetHeight
  }
  // 按可容纳行数（floor）决定每页行数
  const fit = Math.floor((h - HEADER_H.value) / ROW_H.value)
  pageSize.value = Math.max(1, fit)
}

let ro: ResizeObserver | null = null
onMounted(() => {
  ro = new ResizeObserver(() => {
    measure()
  })
  if (tableRegionRef.value) ro.observe(tableRegionRef.value)
})
onUnmounted(() => ro?.disconnect())

// 打开弹窗：映射明细后（布局就绪）测量每页行数
const reload = () => {
  if (props.order) mapRepairDetails(props.details)
  currentPage.value = 1
  measure()
}

// 暴露给父组件：父组件在 el-dialog 的 @opened（布局就绪）时调用
defineExpose({ reload })

const handlePageChange = (p: number) => {
  currentPage.value = p
}

watch(
  () => detailList.value.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(detailList.value.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  },
)

// 删除 SN 明细行（DELETE /client/repair/deleteSN，JSON body { sn, id }）
const handleRowDelete = async (row: DetailData) => {
  if (!row.id || row.id <= 0 || !row.sn) return
  try {
    await ElMessageBox.confirm(`确定要删除设备「${row.equipmentName}」的 SN「${row.sn}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const res = await deleteSnApi(row.sn, row.id)
    if (Number(res.code) === 200) {
      ElMessage.success('删除成功')
      // 通知父组件重拉订单列表，刷新内嵌 details
      emit('changed')
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoadingId.value = null
  }
}

// 监听 modelValue，当对话框打开时映射明细
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.order) {
      mapRepairDetails(props.details)
      currentPage.value = 1
    }
  },
  { immediate: true },
)

// 明细变更（删除）后父组件重拉订单并更新 order/details 引用 → 重新映射
watch(
  () => [props.order, props.details],
  () => {
    if (!props.modelValue || !props.order) return
    mapRepairDetails(props.details)
  },
)
</script>

<style scoped>
.repair-detail-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.repair-detail-table-region {
  flex: 1;
  min-height: 0;
}

.repair-detail-table {
  width: 100%;
}

.repair-detail-table :deep(.el-table),
.repair-detail-table :deep(.el-table__inner-wrapper),
.repair-detail-table :deep(table) {
  width: 100% !important;
}

.repair-detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}

/* 底部操作栏：分页高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数的反馈循环 */
.repair-detail-editor__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
}

.repair-detail-pagination {
  margin: 0;
}
</style>
