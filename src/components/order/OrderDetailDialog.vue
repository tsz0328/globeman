<template>
  <el-dialog
    :model-value="modelValue"
    width="80vw"
    align-center
    destroy-on-close
    class="order-detail-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- 订单详情 -->
    <div class="order-detail-form" v-if="order">
      <div class="form-header">
        <div class="form-title">
          <span v-if="isRepair" class="form-title-repair">维修</span>订单详情
        </div>
      </div>
      <!-- 订单信息 -->
      <div class="form-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单名称：</span>
            <el-input
              v-if="isEditable"
              v-model="editForm.name"
              class="value"
              placeholder="请输入订单名称"
            />
            <span v-else class="value">{{ editForm.name || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">客户单位：</span>
            <el-input
              v-if="isEditable"
              v-model="editForm.customer"
              class="value"
              placeholder="请输入客户单位"
            />
            <span v-else class="value">{{ editForm.customer || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">负责人：</span>
            <el-input
              v-if="isEditable"
              v-model="editForm.manager"
              class="value"
              placeholder="请输入负责人"
            />
            <span v-else class="value">{{ editForm.manager || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">省市区：</span>
            <el-cascader
              v-if="isEditable"
              v-model="selectedRegion"
              :options="regionData"
              :props="{ value: 'label', emitPath: true }"
              class="value"
              placeholder="请选择省/市/区"
              clearable
            />
            <span v-else class="value">
              {{
                [editForm.province, editForm.city, editForm.district].filter(Boolean).join(' ') ||
                ''
              }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">收货信息：</span>
            <el-input
              v-if="isEditable"
              v-model="editForm.address"
              class="value"
              placeholder="请输入送修地址"
            />
            <span v-else class="value">{{ editForm.address || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">联系人：</span>
            <el-input
              v-if="isEditable"
              v-model="editForm.contact"
              class="value"
              placeholder="请输入联系人"
            />
            <span v-else class="value">{{ editForm.contact || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <el-input
              v-if="isEditable"
              v-model="editForm.contactPhone"
              class="value"
              placeholder="请输入联系电话"
            />
            <span v-else class="value">{{ editForm.contactPhone || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单号：</span><span class="value">{{ editForm.id || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span
            ><span class="value">{{ order.createTime || '' }}</span>
          </div>
        </div>
        <!-- 打印专用行：合同编号 / 付款条件（屏幕上隐藏，打印时显示） -->
        <div class="info-row print-only">
          <div class="info-item full">
            <span class="label">合同编号：</span><span class="value"></span>
          </div>
        </div>
        <div class="info-row print-only">
          <div class="info-item full">
            <span class="label">付款条件（盖章后有效）：</span><span class="value"></span>
          </div>
        </div>
      </div>

      <!-- 设备表格（抽出为独立子组件，内含新设备行键盘录入） -->
      <OrderDetailDeviceTable
        :model-value="modelValue"
        :order="order"
        :is-submitted="isSubmitted"
        :details="details"
        @changed="emit('details-changed')"
      />

      <!-- 打印区域 -->
      <div class="form-footer print-only">
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
      <el-button v-if="isEditable" type="primary" :loading="savingHead" @click="handleSaveHead"
        >保存</el-button
      >
      <el-button @click="printOrder">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { regionData } from '@/data/chinaArea'
import { useOrder, type Order } from '@/composables/order/useOrder'
import type { UpdateOrderHeadData } from '@/api/order/OrderApi'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import OrderDetailDeviceTable from './OrderDetailDeviceTable.vue'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
  // 维修订单：明细已随列表接口内联返回，传入后弹窗直接用、不再二次请求订单明细接口；且为只读查看
  details?: RepairOrderDetail[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'details-changed'): void
}>()

const { updateOrderHead } = useOrder()

// 订单是否已提交（锁定态）：由 props.order.status 驱动（隐藏新增设备行、只读查看）
import { SUBMITTED_STATUS, EDITING_STATUS } from '@/composables/common/useOrderStatus'
const isSubmitted = computed(() => props.order?.status === SUBMITTED_STATUS)
// 维修订单（通过 details 传入）为只读查看：不展示新增设备行、不显示「提交」按钮
const isRepair = computed(() => !!props.details && props.details.length > 0)
// 编辑中（草稿态）：设备明细行不可展开，避免在未提交时误触 SN 子表
const isEditing = computed(() => props.order?.status === EDITING_STATUS)
// 表头可编辑：编辑中且非维修订单（维修订单只读查看）
const isEditable = computed(() => isEditing.value && !isRepair.value)

// 表头编辑表单（POST /client/order/updateOrderHead）
const editForm = ref<UpdateOrderHeadData>({
  id: '',
  name: '',
  manager: '',
  customer: '',
  contact: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  address: '',
})

// 从当前订单初始化表头表单
const initEditForm = () => {
  if (!props.order) return
  editForm.value = {
    id: props.order.id,
    name: props.order.name,
    manager: props.order.leaderAccount,
    customer: props.order.customer,
    contact: props.order.contact,
    contactPhone: props.order.contactPhone,
    province: props.order.province,
    city: props.order.city,
    district: props.order.district,
    address: props.order.address,
  }
  // 同步省市区级联选择器（[省, 市, 区]）
  selectedRegion.value = [props.order.province, props.order.city, props.order.district].filter(
    Boolean,
  )
}
initEditForm()

// 省市区三级联动选择器（值与创建订单表单一致：value=label，emitPath 输出 [省, 市, 区]）
const selectedRegion = ref<string[]>([])

// 级联选择 → editForm.province/city/district
watch(selectedRegion, (val) => {
  if (val && val.length >= 1) {
    editForm.value.province = val[0] || ''
    editForm.value.city = val[1] || ''
    editForm.value.district = val[2] || ''
  } else {
    editForm.value.province = ''
    editForm.value.city = ''
    editForm.value.district = ''
  }
})

// 父组件重拉订单并同步 currentOrder 后（新对象引用），重新初始化表头表单
watch(
  () => props.order,
  () => {
    if (props.modelValue) initEditForm()
  },
)

// 保存表头（仅编辑中订单可见保存按钮）
const savingHead = ref(false)
const handleSaveHead = async () => {
  if (!props.order) return
  if (!editForm.value.name.trim()) {
    ElMessage.warning('订单名称不能为空')
    return
  }
  savingHead.value = true
  try {
    const success = await updateOrderHead(editForm.value)
    if (success) {
      ElMessage.success('保存成功')
      // 通知父组件重拉订单列表并同步 currentOrder，刷新表头展示
      emit('details-changed')
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    savingHead.value = false
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
</script>

<style scoped>
/* 付款条件 / 表单底部盖章栏：屏幕上隐藏，仅打印时显示。
   打印走隐藏 iframe（不含本组件 scoped 样式），所以这些元素在 iframe 中没有这个样式自动可见。
   用 .order-detail-form 前缀提升优先级（scoped 下为 (0,3,0)），避免被后定义的 .info-row（display:flex）按相等优先级+靠后原则覆盖 */
.order-detail-form .print-only {
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

.form-title-repair {
  font-size: 20px;
  font-weight: bold;
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

/* el-cascader 默认不带 width:100%，显式铺满单元格（与创建订单表单一致） */
.info-item :deep(.el-cascader) {
  width: 100%;
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

<style>
/* 弹窗高度控制：class 落到 .el-dialog 上，用非 scoped 样式避开 teleport 导致的 scoped 失效。
   与创建订单表单（AddOrderForm）保持一致：固定 80vh 高度、内容区内部滚动。
   垂直居中由组件上已有的 align-center 负责，无需在此覆盖 --el-dialog-margin-top。 */
.order-detail-dialog {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.order-detail-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 订单详情表单整体占满弹窗剩余高度并纵向布局，让内部设备表格能撑满而不触发整体滚动 */
.order-detail-dialog .order-detail-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 表头信息区固定高度，不挤压设备表格 */
.order-detail-dialog .form-info {
  flex: none;
}

/* 打印区固定高度 */
.order-detail-dialog .form-footer {
  flex: none;
}

/* 设备表格弹性占满弹窗剩余空间，使内部按高度动态计算每页行数（与 AddOrderForm 一致） */
.order-detail-dialog .detail-editor {
  flex: 1;
  min-height: 0;
}
</style>
