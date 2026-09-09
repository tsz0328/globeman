<template>
  <el-dialog
    :model-value="modelValue"
    width="80vw"
    align-center
    destroy-on-close
    class="repair-inbound-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="onDialogOpened"
  >
    <template #header>
      <div class="inbound-dialog__title">
        <span class="inbound-dialog__title-text">维修入库 · 设备清单</span>
        <span v-if="orderName" class="inbound-dialog__order">订单：{{ orderName }}</span>
      </div>
    </template>

    <div class="inbound-dialog__body" ref="rootRef">
      <!-- 设备清单：只读展示该订单全部设备，支持添加 SN 码 / 删除 -->
      <!-- 表格按内容自适应高度（弹窗 max-height:80vh 封顶），数据少时弹窗随之收缩 -->
      <div class="inbound-table-wrap" ref="tableRegionRef">
        <el-table :data="displayRows" border style="width: 100%" row-key="rowKey">
          <el-table-column type="index" label="序号" width="50" :index="indexMethod" align="center" />
          <el-table-column label="设备名称" min-width="140" align="center">
            <template #default="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="品牌" width="120" align="center">
            <template #default="scope">
              <span>{{ scope.row.brand }}</span>
            </template>
          </el-table-column>
          <el-table-column label="型号" width="150" align="center">
            <template #default="scope">
              <span>{{ scope.row.model }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数" min-width="140" align="center">
            <template #default="scope">
              <span>{{ scope.row.spec }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template #default="scope">
              <span>{{ scope.row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="80" align="center">
            <template #default="scope">
              <span>{{ scope.row.number }}</span>
            </template>
          </el-table-column>
          <el-table-column label="已录 SN" width="110" align="center">
            <template #default="scope">
              <span class="inbound-dialog__count"
                >{{ scope.row.SN?.length || 0 }} / {{ scope.row.number }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="162" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="openSnForm(scope.row)">
                添加SN码
              </el-button>
              <el-button type="danger" size="small" @click="deleteOrderDevice(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="inbound-dialog__footer" ref="footerRef">
        <el-pagination
          v-if="props.details.length > 0"
          class="inbound-pagination"
          background
          layout="total, prev, pager, next"
          :total="props.details.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
        />
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleInbound">确定入库</el-button>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
    </template>

    <!-- 添加 SN 码：弹窗外壳、提示、分页、提交全部在 AddSnCodeDialog 内部，这里只给显隐与目标设备 -->
    <AddSnCodeDialog
      v-model="snFormVisible"
      :device="snFormDetail"
      @submitted="emit('refresh')"
      @closed="snFormDetail = null"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import AddSnCodeDialog from './AddSnCodeDialog.vue'
import { deleteDetailApi } from '@/api/order/OrderDeviceApi'

const props = defineProps<{
  modelValue: boolean
  orderName?: string
  details: RepairOrderDetail[]
  orderId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}>()

// 添加 SN 码弹窗状态：只保留显隐与目标设备，SN 行数据由 AddSnCodeDialog 内部管理
const snFormVisible = ref(false)
const snFormDetail = ref<RepairOrderDetail | null>(null)

// 点「添加SN码」：记录目标设备后打开弹窗，已存在 SN 由 AddSnCodeDialog 从 device 自行解析
const openSnForm = (detail: TableRow) => {
  snFormDetail.value = detail
  snFormVisible.value = true
}

// 删除已有设备明细行（DELETE /client/order/deleteOrderDetail?id=）
const deleteOrderDevice = async (row: TableRow) => {
  if (!row.id || row.id <= 0) return
  try {
    await ElMessageBox.confirm(`确定要删除设备「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteDetailApi(Number(row.id))
    if (Number(res.code) === 200) {
      ElMessage.success('删除成功')
      emit('refresh')
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 入库：接口待定，先放置占位处理（点击不报错，便于后续对接真实接口）。
// TODO: 接口确认后，这里传入 props.orderId 与当前设备明细，调用对应的入库接口。
const handleInbound = () => {
  ElMessage.info('入库功能待对接（接口待定）')
}

// 表格行类型：维修订单明细 + 稳定行 key（避免分页行状态串扰）
type TableRow = RepairOrderDetail & { rowKey: string }

// 维修入库弹窗定位为只读设备清单（添加 SN 码 / 删除走操作列与子弹窗），
// 原录入行相关的键盘导航 / 失焦提交逻辑已移除。

// 分页：每页行数按弹窗可用高度动态测量（不生成空白录入行，纯只读分页展示）
const currentPage = ref(1)
const pageSize = ref(10) // 兜底值，弹窗打开后由 measure 覆盖为实际可容纳行数

// 表格区域容器 ref，用于测量行高/表头高
const rootRef = ref<HTMLElement>()
const footerRef = ref<HTMLElement>()
const tableRegionRef = ref<HTMLElement>()

// 实测行高 / 表头高（首次用兜底值，渲染后实测覆盖）
const ROW_H = ref(40)
const HEADER_H = ref(41)

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

// 测量可用高度 → 计算每页可容纳行数（floor）。仅用于分页，不铺空白录入行。
// 基准说明：弹窗高度改为内容自适应（height:auto; max-height:80vh）后，
// root.clientHeight 随内容收缩，不能再做基准（高度决定行数、行数又决定高度的自激循环）。
// 故基准固定为「80vh 视口高 − 弹窗固定部分」：标题栏、底部按钮栏、body 上下 padding。
// 这些尺寸不随数据行数变化，测量稳定；数据少时弹窗自然收缩，数据多时弹窗到 80vh 封顶。
const measure = () => {
  const root = rootRef.value
  const region = tableRegionRef.value
  if (!root || !region) return

  const tableEl = region.querySelector('.el-table') as HTMLElement | null
  if (tableEl) {
    const headerEl = tableEl.querySelector('.el-table__header-wrapper') as HTMLElement | null
    const firstRow = tableEl.querySelector('.el-table__row') as HTMLElement | null
    // 仅在元素已连接文档时更新：内容重建/隐藏瞬间可能查到已脱离文档的节点，
    // getBoundingClientRect 会返回 0，把 ROW_H 污染成 0 → fit=Infinity → 整单塞进一页
    const headerH = headerEl?.isConnected ? headerEl.getBoundingClientRect().height : 0
    const rowH = firstRow?.isConnected ? firstRow.getBoundingClientRect().height : 0
    // 用 getBoundingClientRect 取亚像素值（offsetHeight 会取整，累积误差让高度算不准）
    if (headerH > 0) HEADER_H.value = headerH
    if (rowH > 0) ROW_H.value = rowH
  }
  if (ROW_H.value <= 0) return // 行高无效时不算页长，避免 fit=Infinity

  // 固定基准：80vh 减去弹窗固定 chrome（隐藏时 offsetHeight 为 0，跳过）
  const dialogEl = root.closest('.repair-inbound-dialog') as HTMLElement | null
  if (!dialogEl || dialogEl.offsetHeight === 0) return
  const dHeader = dialogEl.querySelector('.el-dialog__header') as HTMLElement | null
  const dFooter = dialogEl.querySelector('.el-dialog__footer') as HTMLElement | null
  const bodyEl = root.parentElement // .el-dialog__body
  const bodyPad = bodyEl
    ? parseFloat(getComputedStyle(bodyEl).paddingTop || '0') +
      parseFloat(getComputedStyle(bodyEl).paddingBottom || '0')
    : 0
  // chrome 高度用 offsetHeight：不受打开/关闭动画 transform 影响，且跨次开关稳定
  const chromeH = (dHeader?.offsetHeight ?? 0) + (dFooter?.offsetHeight ?? 0) + bodyPad
  cachedFooterH.value = outerH(footerRef.value)
  if (chromeH > 0) cachedChromeH.value = chromeH

  const avail = window.innerHeight * 0.8 - cachedChromeH.value - cachedFooterH.value
  const fit = Math.floor((avail - HEADER_H.value) / ROW_H.value)
  const next = Math.max(1, fit)
  pageSize.value = next
  // 行数变化后修正当前页，避免停留在已不存在的页
  const maxPage = Math.max(1, Math.ceil(props.details.length / next))
  if (currentPage.value > maxPage) currentPage.value = maxPage
}

// 缓存上一次成功测量的固定尺寸（弹窗 chrome + 分页栏外框），组件实例跨次开关保留：
// destroy-on-close 只重建 DOM 不重置脚本状态，缓存值在下次打开时仍然准确，
// 可在打开动画期间（@opened 之前）先行估算 pageSize
const cachedChromeH = ref(0)
const cachedFooterH = ref(0)

// 打开瞬间先用缓存尺寸预置 pageSize（纯算术、不读 DOM）：
// destroy-on-close 重建内容后、@opened（动画结束）之前，表格会以「上一次的 pageSize」
// 渲染首帧——若上一次残留值偏大，重开数据多的订单时会先整单挤在一页、分页被挤出
// 视口（body 滚动），动画结束才被 measure 纠正，出现"先没分页、过一瞬才有分页"的闪现。
// nextTick 在首帧绘制前运行，提前把 pageSize 修正为本单的正确值，消除闪现。
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    nextTick(() => {
      currentPage.value = 1 // 新订单从头看
      // 首次打开还没有缓存（chromeH=0），保持兜底 pageSize，等 @opened 实测
      if (cachedChromeH.value <= 0 || ROW_H.value <= 0) return
      const avail = window.innerHeight * 0.8 - cachedChromeH.value - cachedFooterH.value
      const fit = Math.floor((avail - HEADER_H.value) / ROW_H.value)
      if (fit >= 1) pageSize.value = fit
    })
  },
)

// 弹窗打开动画结束、布局就绪后测量一次（此时高度最准确）；
// 并重新挂 ResizeObserver + 窗口 resize 监听，保证窗口缩放时每页行数实时重算。
// 注：原逻辑在 onMounted 挂载 ResizeObserver，但本弹窗 destroy-on-close，
// 挂载时内容可能尚未渲染、tableRegionRef 为 null → observer 漏挂，窗口缩放不触发，
// 只能靠重新打开弹窗（@opened 手动 measure）才生效。故改在 @opened 处挂载。
let ro: ResizeObserver | null = null
const onDialogOpened = () => {
  measure()
  ro?.disconnect()
  if (rootRef.value) {
    ro = new ResizeObserver(() => measure())
    // 观察根容器而非表格区：表格区高度由 measure 反推写入，观察它会自激
    ro.observe(rootRef.value)
  }
  // 兜底：窗口尺寸变化直接重测（仅依赖 RO 时在窗口缩放下偶发不触发）
  window.addEventListener('resize', measure)
}

// 关闭后 destroy-on-close 会销毁内容，RO 观察的旧节点已失效：断开避免残留回调，
// 下次 @opened 会对新节点重新 observe
const onDialogClosed = () => {
  ro?.disconnect()
}

onUnmounted(() => {
  ro?.disconnect()
  window.removeEventListener('resize', measure)
})

const displayRows = computed<TableRow[]>(() => {
  const all = props.details.map((d) => ({ ...d, rowKey: `detail-${d.id}` }))
  const start = (currentPage.value - 1) * pageSize.value
  return all.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1
</script>

<style scoped>
.inbound-dialog__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.inbound-dialog__title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-700);
}

.inbound-dialog__order {
  font-size: 13px;
  color: #909399;
}

.inbound-dialog__count {
  font-variant-numeric: tabular-nums;
  color: #606266;
}

/* 底部操作栏：分页高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数的反馈循环（与 AddOrderDeviceTable 一致） */
.inbound-dialog__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.inbound-pagination {
  margin: 0;
}
</style>

<style>
/* 维修入库主弹窗：高度随内容自适应，80vh 封顶。
   数据少时弹窗收缩到内容高度（消除表格下方大片空白）；数据多时到 80vh，
   每页行数由 measure() 按 80vh 固定基准反推，body 的 overflow:auto 兜底滚动 */
.repair-inbound-dialog {
  height: auto;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.repair-inbound-dialog .el-dialog__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 中间层容器同样纵向 flex：内容不足时收缩（弹窗随之变矮），
   内容达到 fit 行时正好占满 80vh 上限 */
.repair-inbound-dialog .inbound-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0;
}

/* 表格区按内容自适应（不再精确回写高度）：弹窗高度本身随内容伸缩，
   无需再做「表头 + fit 行」的余量控制；fit 行时整体恰好贴近 80vh 上限 */
.repair-inbound-dialog .inbound-table-wrap {
  flex: none;
}
</style>
