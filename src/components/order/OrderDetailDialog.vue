<template>
  <el-dialog :model-value="modelValue" width="70vw" align-center destroy-on-close class="order-detail-dialog"
    @update:model-value="emit('update:modelValue', $event)">
    <!-- 订单详情 -->
    <div class="order-detail-form" v-if="order">
      <div class="form-header">
        <h2 class="form-title">维修订单</h2>
      </div>
      <div class="form-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">客户单位：</span><span class="value">{{ order.customer || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单号：</span><span class="value">{{ order.id || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">合同编号：</span><span class="value"></span>
          </div>
          <div class="info-item">
            <span class="label">入库时间：</span><span class="value">{{ order.createTime || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item full">
            <span class="label">付款条件（盖章后有效）：</span><span class="value"></span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单名称：</span><span class="value">{{ order.name || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item full">
            <span class="label">收货信息：</span><span class="value">{{ order.address || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">联系人：</span><span class="value">{{ order.contact || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span><span class="value">{{ order.contactPhone || '' }}</span>
          </div>
        </div>
      </div>

      <!-- 设备表格（抽出为独立子组件，内含新设备行键盘录入与 SN 子表） -->
      <OrderDeviceTable :model-value="modelValue" :order="order" :is-submitted="isSubmitted"
        :is-repair="isRepair" :is-editing="isEditing" :details="details" />

      <!-- 表单底部 -->
      <div class="form-footer">
        <div class="footer-row">
          <div class="footer-item">
            <div><span class="label">采购单位（甲方盖章）：</span></div>
            <div><span class="label">代表人（签名）：</span></div>
            <div><span class="label">日期：</span></div>
          </div>
          <div class="footer-item">
            <div><span class="label">供应单位（甲方盖章）：</span></div>
            <div><span class="label">代表人（签名）：</span></div>
            <div><span class="label">日期：</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表单底部 -->
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button v-if="!isRepair" type="primary" :loading="submitting" :disabled="isSubmitted" @click="handleSubmitOrder">提交</el-button>
      <el-button @click="printOrder">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useOrder, type Order } from '@/composables/order/useOrder'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import OrderDeviceTable from './OrderDeviceTable.vue'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
  // 维修订单：明细已随列表接口内联返回，传入后弹窗直接用、不再二次请求订单明细接口；且为只读查看
  details?: RepairOrderDetail[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted'): void
}>()

const { submitOrder } = useOrder()

// 订单是否已提交（锁定态）：成功后本地乐观置位 + 父组件回拉最新 status 后由 props.order.status 驱动
// 状态为 "已提交" 时：禁用「提交」按钮、隐藏新增设备行
import { SUBMITTED_STATUS, EDITING_STATUS } from '@/composables/common/useOrderStatus'
const submittedFlag = ref(false)
const isSubmitted = computed(() => submittedFlag.value || props.order?.status === SUBMITTED_STATUS)
// 维修订单（通过 details 传入）为只读查看：不展示新增设备行、不显示「提交」按钮
const isRepair = computed(() => !!props.details && props.details.length > 0)
// 编辑中（草稿态）：设备明细行不可展开，避免在未提交时误触 SN 子表
const isEditing = computed(() => props.order?.status === EDITING_STATUS)

// 提交订单（PUT /client/order/submit?id=）
const submitting = ref(false)
const handleSubmitOrder = async () => {
  if (!props.order) return
  submitting.value = true
  try {
    const success = await submitOrder(props.order.id)
    if (success) {
      ElMessage.success('订单提交成功')
      // 乐观锁定：立即禁用提交 / 隐藏新增行，同时通知父组件回拉最新 status
      submittedFlag.value = true
      emit('submitted')
    } else {
      ElMessage.error('订单提交失败')
    }
  } finally {
    submitting.value = false
  }
}

// 打印订单：用隐藏 iframe 承载打印内容，避免操作 document.body.innerHTML 导致页面状态丢失
const printOrder = () => {
  const printContent = document.querySelector('.order-detail-form') as HTMLElement | null
  if (!printContent) return
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
  doc.write(
    '<!DOCTYPE html><html><head><title>打印订单</title>' +
      '<link rel="stylesheet" href="/element-plus/index.css" />' +
      '<style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;}</style>' +
      '</head><body>' +
      printContent.outerHTML +
      '</body></html>',
  )
  doc.close()
  // 等待样式与图片加载后再打印
  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    // 打印（或取消）后移除 iframe，不刷新页面
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 300)
  }, 250)
}

// 监听 modelValue，当对话框打开时复位锁定态（设备明细与 SN 的加载由 OrderDeviceTable 自身负责）
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.order) {
      // 重新打开时复位锁定态（若订单本身已是"已提交"，由 props.order.status 重新驱动）
      submittedFlag.value = false
    }
  },
)
</script>

<style scoped>
.form-header {
  text-align: center;
  margin-bottom: 16px;
}

.form-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 4px;
}

.form-info {
  border: 1px solid #dcdfe6;
  border-bottom: none;
  margin-bottom: 0;
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

@media print {

  .order-detail-dialog :deep(.el-dialog__header),
  .order-detail-dialog :deep(.el-dialog__footer) {
    display: none !important;
  }

  .order-detail-dialog :deep(.el-dialog__body) {
    padding: 0 !important;
  }
}
</style>
