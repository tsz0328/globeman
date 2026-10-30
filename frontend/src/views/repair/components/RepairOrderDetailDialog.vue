<template>
  <el-dialog
    :model-value="modelValue"
    width="80vw"
    align-center
    destroy-on-close
    class="repair-detail-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="onDialogOpened"
  >
    <!-- 维修订单详情（只读查看） -->
    <div class="repair-detail-form" v-if="order">
      <div class="form-header">
        <div class="form-title">维修订单详情</div>
      </div>
      <!-- 订单信息（只读展示，不可编辑） -->
      <div class="form-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单名称：</span><span class="value">{{ order.name || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">客户单位：</span
            ><span class="value">{{ order.customer || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">负责人：</span
            ><span class="value">{{ order.leaderAccount || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">省市区：</span>
            <span class="value">
              {{ [order.province, order.city, order.district].filter(Boolean).join(' ') || '' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">收货信息：</span
            ><span class="value">{{ order.address || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">联系人：</span><span class="value">{{ order.contact || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span
            ><span class="value">{{ order.contactPhone || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单号：</span><span class="value">{{ order.id || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span
            ><span class="value">{{ order.createTime || '' }}</span>
          </div>
        </div>
      </div>

      <!-- 设备表格（维修专用：SN 展示 + 可删除 + 分页） -->
      <RepairOrderDeviceTable
        ref="deviceTableRef"
        :model-value="modelValue"
        :order="order"
        :details="details"
        :has-inbound="hasInbound"
        @changed="emit('details-changed')"
      />
    </div>

    <!-- 表单底部 -->
    <template #footer>
      <div class="repair-detail-dialog__footer-actions">
        <span v-if="unfilledSnCount > 0" class="repair-detail-dialog__sn-warn">
          <el-icon><WarningFilled /></el-icon>
          存在 {{ unfilledSnCount }} 台设备未录入 SN 码，请先在上方表格填写后再入库
        </span>
        <span class="repair-detail-dialog__footer-btns">
          <el-button @click="emit('update:modelValue', false)">关闭</el-button>
          <el-button type="primary" :disabled="!canInbound" @click="handleInbound">{{ hasInbound ? '已入库' : '确定入库' }}</el-button>
          <el-button @click="printOrder">打印</el-button>
        </span>
      </div>
    </template>
  </el-dialog>

  <!-- SN 重复提示弹窗：入库前发现与其他订单已入库工单重复的 SN，由用户决定取消或仍然入库 -->
  <el-dialog
    v-model="duplicateVisible"
    title="SN 重复提示"
    width="680px"
    align-center
    append-to-body
    :close-on-click-modal="false"
  >
    <p class="duplicate-dialog__tip">
      发现 {{ duplicateList.length }} 处 SN 重复，请确认是否仍要入库：
    </p>
    <el-table :data="duplicateList" border size="small" max-height="360" style="width: 100%">
      <el-table-column label="订单名称" min-width="160">
        <template #default="scope">
          <template v-if="scope.row.kind === 'same_order' || scope.row.kind === 'cross_self'">本订单</template>
          <template v-else>{{ scope.row.orderName || scope.row.orderId }}</template>
        </template>
      </el-table-column>
      <el-table-column label="序号" width="80" align="center">
        <template #default="scope">
          {{ scope.row.seq ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="sn" label="SN" min-width="170" />
      <el-table-column label="工单状态" width="90" align="center">
        <template #default="scope">
          {{ scope.row.status || '—' }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="duplicateVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmForceInbound">仍然要入库</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { type Order } from '@/composables/order/useOrder'
import {
  inboundRepairApi,
  checkDuplicateSnApi,
  type DuplicateSnInfo,
  type RepairOrderDetail,
} from '@/api/repair/RepairApi'
import RepairOrderDeviceTable from './RepairOrderDeviceTable.vue'
// 打印模板：结构 + 内嵌排版样式都在同一个文件里维护，渲染成完整文档后写入 iframe
import {
  renderRepairOrderPrintDocument,
  type PrintableRepairOrder,
  type PrintableRepairDetail,
} from '@/views/repair/utils/RepairOrderPrintTemplate.ts'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
  // 维修单明细：已随列表接口内联返回，传入后弹窗直接用
  details: RepairOrderDetail[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'details-changed'): void
}>()

// 设备表格引用：弹窗 @opened（布局就绪）时触发其映射明细 + 测量每页行数
const deviceTableRef = ref<InstanceType<typeof RepairOrderDeviceTable>>()

// 弹窗打开动画结束、布局就绪后再加载，避免首开过渡未结束导致测量行数偏小
const onDialogOpened = () => {
  nextTick(() => deviceTableRef.value?.reload())
}

// 打印维修单：用隐藏 iframe 承载打印内容。内容使用独立模板按当前数据生成，
// 不复用弹窗 DOM（el-table / scoped 样式 / fixed 列在 iframe 里有一连串兼容问题）。
// 明细每条一行（SN 取导入录入的明细 sn，空 SN 留空），与屏幕表格口径一致。
const printOrder = () => {
  if (!props.order) return
  const printableDetails: PrintableRepairDetail[] = []
  for (const d of props.details) {
    printableDetails.push({
      name: d.name,
      model: d.model,
      brand: d.brand || '',
      spec: d.spec || '',
      sn: (d.sn || '').trim(),
    })
  }
  const printableOrder: PrintableRepairOrder = {
    id: props.order.id,
    name: props.order.name || '',
    type: props.order.type || '',
    manager: props.order.leaderAccount || '',
    customer: props.order.customer || '',
    contact: props.order.contact || '',
    contactPhone: props.order.contactPhone || '',
    province: props.order.province || '',
    city: props.order.city || '',
    district: props.order.district || '',
    address: props.order.address || '',
    createTime: props.order.createTime,
    details: printableDetails,
  }
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(renderRepairOrderPrintDocument(printableOrder))
  doc.close()
  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 300)
  }, 150)
}

// 未录入 SN 码的设备数量：任意一台 order_details.sn 为空即视为未填，禁用「确定入库」
const unfilledSnCount = computed(
  () => (props.details?.filter((d) => !(d.sn && d.sn.trim())).length ?? 0),
)
// 已入库标记：跟随当前订单的 inbound；入库成功后本地置 true。
// ⚠ 本弹窗由 v-model 控制显隐（组件实例常驻、setup 只执行一次），destroy-on-close 只销毁弹窗内容、
//   不会重建组件实例。若不在此重算，上一个订单入库后残留的 true 会把下一个未入库订单也显示成「已入库」。
const hasInbound = ref(props.order?.inbound ?? false)
watch(
  () => [props.modelValue, props.order?.id],
  () => {
    // 打开（或切换订单）时，一律按当前订单最新的 inbound 重新初始化
    if (props.modelValue) hasInbound.value = props.order?.inbound ?? false
  },
  { immediate: true },
)
const canInbound = computed(() => !hasInbound.value && unfilledSnCount.value === 0)

// SN 重复提示弹窗状态
const duplicateVisible = ref(false)
const duplicateList = ref<DuplicateSnInfo[]>([])

// 真正执行入库：按订单批量登记维修工单到 sys_repair（每台设备一条，status='待接单'），
// 恢复维修接单 / 诊断 / 完成链路。成功后通知父组件刷新列表（已录SN/总数）。
const doInbound = async () => {
  if (!props.order?.id) return
  try {
    const res = await inboundRepairApi(props.order.id)
    if (res.code === 200) {
      ElMessage.success(res.msg || '入库成功')
      hasInbound.value = true
      emit('details-changed')
    } else {
      ElMessage.error(res.msg || '入库失败')
    }
  } catch {
    ElMessage.error('入库失败')
  }
}

// 入库入口：先查 SN 是否与其他订单已入库工单重复；有重复则弹窗提示（取消 / 仍然要入库），无重复直接入库。
const handleInbound = async () => {
  if (!props.order?.id) return
  try {
    const res = await checkDuplicateSnApi(props.order.id)
    if (res.code !== 200) {
      ElMessage.error(res.msg || '检查重复 SN 失败')
      return
    }
    const dups = res.data ?? []
    if (dups.length > 0) {
      duplicateList.value = dups
      duplicateVisible.value = true
      return
    }
    await doInbound()
  } catch {
    ElMessage.error('检查重复 SN 失败')
  }
}

// 重复提示弹窗里点「仍然要入库」
const confirmForceInbound = async () => {
  duplicateVisible.value = false
  await doInbound()
}
</script>

<style scoped>
/* 付款条件 / 表单底部盖章栏：仅打印时显示。
   打印走隐藏 iframe（不含本组件 scoped 样式），所以这些元素在 iframe 中没有这个样式自动可见。
   用 .repair-detail-form 前缀提升优先级（scoped 下为 (0,3,0)），避免被后定义的 .info-row（display:flex）按相等优先级+靠后原则覆盖 */
.repair-detail-form .print-only {
  display: none;
}

.form-header {
  text-align: center;
  margin-bottom: 16px;
}

.form-title {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 4px;
}

.form-info {
  border: 1px solid #dcdfe6;
  border-bottom: none;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-right: 1px solid #dcdfe6;
}

.info-item:last-child {
  border-right: none;
}

.info-item.full {
  flex: none;
  width: 100%;
  border-right: none;
}

.info-item .label {
  white-space: nowrap;
  font-weight: 500;
}

.info-item .value {
  min-width: 80px;
  flex: 1;
  margin-left: 4px;
  min-height: 18px;
}

/* 底部操作栏：左提示 + 右按钮，未录 SN 时禁用「确定入库」并提示先填 SN */
.repair-detail-dialog__footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.repair-detail-dialog__footer-btns {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.repair-detail-dialog__sn-warn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
  font-size: 13px;
  line-height: 1.4;
}

/* SN 重复提示弹窗顶部说明文字 */
.duplicate-dialog__tip {
  margin: 0 0 12px;
  color: #e6a23c;
  font-size: 14px;
  line-height: 1.5;
}

.form-footer {
  border: 1px solid #dcdfe6;
}

.footer-row {
  display: flex;
}

.footer-item {
  flex: 1;
  padding: 12px;
  border-right: 1px solid #dcdfe6;
}

.footer-item:last-child {
  border-right: none;
}

.footer-item div {
  margin-bottom: 8px;
}

.footer-item div:last-child {
  margin-bottom: 0;
}

/* 打印样式 */
@media print {
  .repair-detail-dialog :deep(.el-dialog__header),
  .repair-detail-dialog :deep(.el-dialog__footer) {
    display: none !important;
  }

  .repair-detail-dialog :deep(.el-dialog__body) {
    padding: 0 !important;
  }
}
</style>

<style>
/* 弹窗高度控制：class 落到 .el-dialog 上，用非 scoped 样式避开 teleport 导致的 scoped 失效。
   与订单详情弹窗保持一致：固定 80vh 高度、内容区内部滚动。 */
.repair-detail-dialog {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.repair-detail-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 维修订单详情表单整体占满弹窗剩余高度并纵向布局，让内部设备表格能撑满而不触发整体滚动 */
.repair-detail-dialog .repair-detail-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 表头信息区固定高度，不挤压设备表格 */
.repair-detail-dialog .form-info {
  flex: none;
}

/* 打印区固定高度 */
.repair-detail-dialog .form-footer {
  flex: none;
}

/* 设备表格弹性占满弹窗剩余空间，使内部按高度动态计算每页行数 */
.repair-detail-dialog .repair-detail-editor {
  flex: 1;
  min-height: 0;
}
</style>
