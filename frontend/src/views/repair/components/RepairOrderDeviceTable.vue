<template>
  <div class="repair-detail-editor" ref="rootRef">
    <div class="repair-detail-table-region" ref="tableRegionRef" :style="regionStyle">
      <el-table :data="pageRows" border class="repair-detail-table" row-key="rowKey">
        <el-table-column type="index" label="序号" width="50" align="center" :index="indexMethod" />
        <el-table-column label="品名" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.equipmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="showModelColumn" label="型号" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.equipmentModel }}</span>
          </template>
        </el-table-column>
        <!-- 维修改造型特有列：原型号 / 改型号（行数据带值时显示，替代型号列） -->
        <el-table-column v-if="showRefitColumns" label="原型号" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.originalModel }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="showRefitColumns" label="改型号" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.refitModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="加工项目" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.processItem }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌" min-width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.manufacturer }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参数" min-width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.spec }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SN码" min-width="120" align="center">
          <template #default="scope">
            <el-input
              v-model="scope.row.sn"
              size="small"
              placeholder="填写 SN 码"
              class="cell-control"
              @blur="handleSnBlur(scope.row)"
            />
          </template>
        </el-table-column>
        <!-- 派发：未入库且管理员/董事长可选员工（change 即存，存 order_details.assignee）；已入库或其他角色只读展示员工姓名 -->
        <el-table-column label="派发" min-width="130" align="center">
          <template #default="scope">
            <el-select
              v-if="!hasInbound && (auth.isAdmin || auth.isBoss)"
              v-model="scope.row.assignee"
              size="small"
              clearable
              filterable
              placeholder="选择员工"
              class="cell-control"
              :loading="assigneeSavingId === scope.row.id"
              @change="handleAssigneeChange(scope.row)"
            >
              <el-option
                v-for="m in managers"
                :key="m.account"
                :label="m.name"
                :value="m.account"
              />
            </el-select>
            <span v-else>{{ assigneeName(scope.row.assignee) }}</span>
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

    <div class="repair-detail-editor__footer" ref="footerRef">
      <el-pagination
        v-if="detailList.length > 0"
        class="repair-detail-pagination"
        background
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
import { type RepairOrderDetail } from '@/api/repair/RepairApi'
import { deleteDetailApi, type DetailData } from '@/api/order/OrderDeviceApi'
import { getOrderManagersApi, type OrderManager } from '@/api/order/OrderApi'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
  // 维修单内联明细（来自 getOrder 返回的 details）
  details: RepairOrderDetail[]
  // 订单是否已入库：未入库可编辑派发，已入库派发列只读
  hasInbound: boolean
}>()

// 明细变更（删除）后通知父组件重新拉取订单列表，刷新内嵌 details
const emit = defineEmits<{
  (e: 'changed'): void
}>()

const { detailList, updateDetail } = useDetail()
const auth = useAuthStore()

// 删除按钮 loading 标识
const deleteLoadingId = ref<string | number | null>(null)
// 派发表单行保存中的 loading 标识（按行隔离，避免整列下拉一起转圈）
const assigneeSavingId = ref<string | number | null>(null)

// 派发员工下拉数据源：复用订单「负责人」接口（GET /client/order/manager），返回本公司 {account,name}
// 派单只能派给维修部门员工，故传 department='维修部门' 过滤；不传则返回全公司
// 存 account（与 sys_repair.account 口径一致），展示姓名；已入库的只读文本也靠它把 account 映射回姓名
const REPAIR_DEPARTMENT = '维修部门'
const managers = ref<OrderManager[]>([])
const loadManagers = async () => {
  try {
    const res = await getOrderManagersApi(REPAIR_DEPARTMENT)
    if (res.code === 200 && Array.isArray(res.data)) managers.value = res.data
  } catch (error) {
    console.error('获取员工列表失败:', error)
  }
}
const assigneeName = (account?: string) => {
  if (!account) return '未派发'
  return managers.value.find((m) => m.account === account)?.name || account
}

// 维修订单：明细随列表接口内联返回。SN 取建单/导入时录入的明细 sn（order_details.sn），
// 每条明细一行——入库手动加 SN 已下线（SN 以导入为准），不再按已扫 SN 列表展开成多行；
// 空 SN 的设备照常展示（列内渲染为「—」），否则导入未填 SN 的设备会整行消失
// 列显示（与订单详情表同口径，数据驱动）：维修单两种形态——
//   改造型（明细带 原型号/改型号 值）→ 显示 原型号/改型号，替代 型号 列
//   型号型（明细带 型号 值）→ 显示 型号 列
//   加工项目两种形态都有，恒显示
const hasRefitData = computed(() =>
  detailList.value.some(
    (r) => (r.originalModel || '').trim() || (r.refitModel || '').trim(),
  ),
)
const showRefitColumns = computed(() => hasRefitData.value)
const showModelColumn = computed(() => !hasRefitData.value)

const mapRepairDetails = (details: RepairOrderDetail[]) => {
  if (!props.order) return
  const rows: DetailData[] = []
  for (const d of details) {
    rows.push({
      id: d.id,
      projectId: props.order!.id,
      belongProject: '',
      equipmentName: d.name,
      equipmentModel: d.model,
      originalModel: d.originalModel || '',
      refitModel: d.refitModel || '',
      processItem: d.processItem || '',
      manufacturer: d.brand,
      sn: (d.sn || '').trim(),
      assignee: d.assignee || '',
      status: '',
      unitPrice: 0,
      total: 0,
      type: d.type || '',
      spec: d.spec || '',
      rowKey: `${d.id}`,
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

// 动态测量：根容器可用高度 + 实测行高/表头高 → 计算每页行数，并反推表格区精确高度
// 基准说明：不能用表格区自身高度做基准——它按内容收缩（余量沉到分页下方），
// 否则会变成「高度决定行数、行数又决定高度」的自激循环。故统一读根容器
// （高度由父弹窗 80vh 给定，稳定），减去底部分页栏后才是表格可用高度。
// 与 AddOrderDeviceTable / OrderDetailDeviceTable 保持一致。
const rootRef = ref<HTMLElement>()
const footerRef = ref<HTMLElement>()
const tableRegionRef = ref<HTMLElement>()
// 只读表不铺空白行：表格区高度按「当前页实际行数」而非 fit 容量，
// 数据不满一页时分页紧贴表格、不留大段空白
const regionH = computed<number | null>(() => {
  const n = pageRows.value.length
  if (n === 0) return null
  return HEADER_H.value + n * ROW_H.value
})
const ROW_H = ref(40) // el-table small 行高（兜底值，渲染后实测覆盖）
const HEADER_H = ref(41) // 表头高度（兜底值）

// 含 margin 的外框高度：分页栏带 margin-top，只取 rect.height 会少算
const outerH = (el: HTMLElement | undefined) => {
  if (!el) return 0
  const cs = getComputedStyle(el)
  return (
    el.getBoundingClientRect().height +
    parseFloat(cs.marginTop || '0') +
    parseFloat(cs.marginBottom || '0')
  )
}

const measure = () => {
  const root = rootRef.value
  const region = tableRegionRef.value
  if (!root || !region) return
  const h = root.clientHeight
  if (h <= 0) return // 弹窗隐藏时根容器高度为 0，跳过

  const tableEl = region.querySelector('.el-table') as HTMLElement | null
  if (tableEl) {
    const headerEl = tableEl.querySelector('.el-table__header-wrapper') as HTMLElement | null
    const firstRow = tableEl.querySelector('.el-table__row') as HTMLElement | null
    // 用 getBoundingClientRect 取亚像素值（offsetHeight 会取整，累积误差让高度算不准）
    if (headerEl) HEADER_H.value = headerEl.getBoundingClientRect().height
    if (firstRow) ROW_H.value = firstRow.getBoundingClientRect().height
  }
  const avail = h - outerH(footerRef.value)
  // 按可容纳行数（floor）决定每页行数
  const fit = Math.floor((avail - HEADER_H.value) / ROW_H.value)
  const size = Math.max(1, fit)
  pageSize.value = size
}

// 表格区高度样式：未测出前保持自适应
const regionStyle = computed(() =>
  regionH.value == null ? undefined : { height: `${regionH.value}px` },
)

let ro: ResizeObserver | null = null
// 挂载 ResizeObserver + 窗口 resize 兜底（与 AddOrderDeviceTable 同构）。
// RO 观察表格区域：父弹窗固定 80vh，区域高度随视口变化即触发重算；
// window 兜底是第二重保险，防止 observer 漏挂时缩放完全失效。
// 注：本组件是内嵌子组件、onMounted 时 ref 已就绪，故 RO 在 onMounted 挂载即可（父组件 destroy-on-close 会重新 mount）；
// 但重新打开时仍由父组件 @opened → reload() 再调一次，保证 observer 一定挂在当前 DOM 上。重复调用幂等。
const ensureResizeWatch = () => {
  measure()
  ro?.disconnect()
  ro = new ResizeObserver(() => {
    measure()
  })
  // 观察根容器而非表格区：表格区高度由 measure 反推写入，观察它会自激
  if (rootRef.value) ro.observe(rootRef.value)
  window.removeEventListener('resize', measure)
  window.addEventListener('resize', measure)
}
onMounted(() => {
  ensureResizeWatch()
  loadManagers()
})
onUnmounted(() => {
  ro?.disconnect()
  window.removeEventListener('resize', measure)
})

// 打开弹窗：映射明细后（布局就绪）重挂监听并测量每页行数
const reload = () => {
  if (props.order) mapRepairDetails(props.details)
  currentPage.value = 1
  ensureResizeWatch()
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

// 删除设备明细行（DELETE /client/order/deleteOrderDetail?id=）：移除该设备（含其 SN）
const handleRowDelete = async (row: DetailData) => {
  if (!row.id || row.id <= 0) return
  try {
    await ElMessageBox.confirm(`确定要删除设备「${row.equipmentName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const res = await deleteDetailApi(row.id)
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

// 行内保存（SN / 派发共用）：POST /client/order/updateOrderDetail。
// 后端该接口为「set name/model/brand/spec/sn/assignee/... where id」全列覆盖，
// 故两个入口都必须把本行全部字段带上——只传 sn 会把 assignee 清空，只传 assignee 也会把 sn 清空。
const saveRow = async (row: DetailData) => {
  const sn = (row.sn || '').trim()
  const ok = await updateDetail({
    id: row.id,
    order: row.projectId,
    name: row.equipmentName,
    model: row.equipmentModel,
    originalModel: row.originalModel || '',
    refitModel: row.refitModel || '',
    processItem: row.processItem || '',
    brand: row.manufacturer,
    spec: row.spec,
    sn,
    assignee: row.assignee || '',
  })
  if (ok) {
    row.sn = sn
    // 通知父组件重拉订单列表，刷新内嵌 details（打印/入库计数同步）
    emit('changed')
  }
  return ok
}

// SN 行内编辑：失焦即保存
const handleSnBlur = async (row: DetailData) => {
  const ok = await saveRow(row)
  ElMessage[ok ? 'success' : 'error'](ok ? 'SN码已保存' : 'SN码保存失败')
}

// 派发行内编辑：选中即保存（存员工 account；clearable 清空 = 取消派发）
const handleAssigneeChange = async (row: DetailData) => {
  assigneeSavingId.value = row.id
  try {
    const ok = await saveRow(row)
    ElMessage[ok ? 'success' : 'error'](ok ? '派发已保存' : '派发保存失败')
  } finally {
    assigneeSavingId.value = null
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
  justify-content: flex-start;
  height: 100%;
}

/* 表格区不再撑满（flex:1）：高度由 measure() 按「表头 + fit 行」精确回写，
   使表格底边与分页紧贴，装不下整行的余量沉到底部分页栏下方 */
.repair-detail-table-region {
  flex: none;
}

.repair-detail-table {
  width: 100%;
}

/* 行内 SN 输入框占满单元格 */
.repair-detail-table :deep(.cell-control) {
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
}

.repair-detail-pagination {
  margin: 0;
}
</style>
