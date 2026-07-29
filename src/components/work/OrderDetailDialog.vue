<template>
  <el-dialog :model-value="modelValue" width="1000px" align-center destroy-on-close class="order-detail-dialog"
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
            <span class="label">项目名称：</span><span class="value">{{ order.name || '' }}</span>
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
      <!-- 表格 -->
      <el-table :data="detailTableData" border class="detail-table" max-height="400">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="品名" min-width="120">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.equipmentName" aria-label="品名" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.equipmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="型号" min-width="120">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.equipmentModel" aria-label="型号" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.equipmentModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="序列号" min-width="120">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.serialNo" aria-label="序列号" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.serialNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单位" width="80" align="center">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.unit" aria-label="单位" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" align="center">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.quantity" aria-label="数量" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100" align="right">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.unitPrice" aria-label="单价" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.unitPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="scope">
            <span v-if="scope.row.isNew">
              {{ (Number(scope.row.quantity) || 0) * (Number(scope.row.unitPrice) || 0) }}
            </span>
            <span v-else>{{ scope.row.total }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="120">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.remark" aria-label="备注" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
      </el-table>
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

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button type="primary" @click="printOrder">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDetail } from '@/composables/useDetail'
import type { Order } from '@/composables/useOrder'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { fetchDetails, detailList, createDetail } = useDetail()

interface DetailTableRow {
  isNew?: boolean
  equipmentName: string
  equipmentModel: string
  serialNo: string
  unit: string
  quantity: number | string
  unitPrice: number | string
  total: number
  remark: string
}

//创建一个空白行对象
const createBlankRow = (): DetailTableRow => ({
  isNew: true,
  equipmentName: '',
  equipmentModel: '',
  serialNo: '',
  unit: '',
  quantity: '',
  unitPrice: '',
  total: 0,
  remark: '',
})

const newRow = ref<DetailTableRow>(createBlankRow())

// 计算表格数据，包括已有的明细和新添加的空白行
const detailTableData = computed<DetailTableRow[]>(() => {
  return [
    ...detailList.value.map((item) => ({
      equipmentName: item.equipmentName,
      equipmentModel: item.equipmentModel,
      serialNo: item.sn || '',
      unit: '台',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      remark: '',
    })),
    newRow.value,
  ]
})

// 处理新行保存逻辑
const handleNewRowSave = async (row: DetailTableRow) => {
  if (!row.isNew) return
  if (
    !row.equipmentName &&
    !row.equipmentModel &&
    !row.serialNo &&
    !row.quantity &&
    !row.unitPrice &&
    !row.remark
  ) {
    return
  }
  if (!row.equipmentName) {
    ElMessage.warning('请输入品名')
    return
  }
  if (!row.equipmentModel) {
    ElMessage.warning('请输入型号')
    return
  }
  const quantity = Number(row.quantity)
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    ElMessage.warning('数量必须为正整数')
    return
  }
  const unitPrice = Number(row.unitPrice)
  if (isNaN(unitPrice) || unitPrice <= 0) {
    ElMessage.warning('单价必须为正数')
    return
  }
  if (!props.order) return

  const success = await createDetail({
    orderId: props.order.id,
    name: row.equipmentName,
    model: row.equipmentModel,
    manufacturer: props.order.company || '',
    number: String(quantity),
    price: String(unitPrice),
  })
  if (success) {
    ElMessage.success('添加设备成功')
    newRow.value = createBlankRow()
    await fetchDetails(props.order.id)
  } else {
    ElMessage.error('添加设备失败')
  }
}

// 打印订单
const printOrder = () => {
  const printContent = document.querySelector('.order-detail-form') as HTMLElement | null
  if (!printContent) return
  const originalBody = document.body.innerHTML
  document.body.innerHTML = printContent.outerHTML
  window.print()
  document.body.innerHTML = originalBody
  window.location.reload()
}

// 监听 modelValue，当对话框打开时，获取订单明细
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.order) {
      fetchDetails(props.order.id)
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

.detail-table {
  margin: 16px 0;
}

.detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
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
