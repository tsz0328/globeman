<template>
  <div class="order-detail" v-loading="loading">
    <div class="detail-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">项目订单详情</h2>
      <el-button type="primary" @click="toggleAddMode" :disabled="isLocked">
        {{ isAdding ? '确定' : '添加设备' }}
      </el-button>
    </div>

    <div class="equipment-section">
      <h3 class="section-title">订单名称：{{ orderName }}</h3>
      <el-table :data="paginatedData" border style="width: 100%">
        <el-table-column prop="equipmentName" label="设备名称" width="150">
          <template #default="scope">
            <span v-if="scope.row.id > 0">{{ scope.row.equipmentName }}</span>
            <el-input
              v-else
              v-model="scope.row.equipmentName"
              aria-label="设备名称"
              @keydown.enter.prevent="handleCellEnter"
            />
          </template>
        </el-table-column>
        <el-table-column prop="equipmentModel" label="设备型号" width="150">
          <template #default="scope">
            <span v-if="scope.row.id > 0">{{ scope.row.equipmentModel }}</span>
            <el-input
              v-else
              v-model="scope.row.equipmentModel"
              aria-label="设备型号"
              @keydown.enter.prevent="handleCellEnter"
            />
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家">
          <template #default="scope">
            <span v-if="scope.row.id > 0">{{ scope.row.manufacturer }}</span>
            <el-input
              v-else
              v-model="scope.row.manufacturer"
              aria-label="生产厂家"
              @keydown.enter.prevent="handleCellEnter"
            />
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100">
          <template #default="scope">
            <span v-if="scope.row.id > 0">{{ scope.row.quantity }}</span>
            <el-input
              v-else
              v-model="scope.row.quantity"
              aria-label="数量"
              @keydown.enter.prevent="handleCellEnter"
            />
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="150">
          <template #default="scope">
            <span v-if="scope.row.id > 0">{{ scope.row.unitPrice }}</span>
            <el-input
              v-else
              v-model="scope.row.unitPrice"
              aria-label="单价"
              @keydown.enter.prevent="handleTotalEnter"
            />
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总价" width="150">
          <template #default="scope">
            {{ scope.row.total || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="73">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              :disabled="isLocked"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="displayData.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import { useOrder } from '@/composables/order/useOrder'
import { isOrderLocked } from '@/composables/common/useOrderStatus'
import { useTableQuery } from '@/composables/common/useTableQuery'

const route = useRoute()
const { createDetail, fetchDetails, detailList, deleteDetail } = useDetail()
const { fetchOrders, orderList } = useOrder()

const orderId = ref('')
const orderName = ref('')
const isAdding = ref(false)
const editRows = ref<EditableDetailData[]>([])
const orderStatus = ref('')

// 订单状态是否锁定（已确认，无法修改）
const isLocked = computed(() => {
  if (!orderStatus.value) {
    return true
  }
  return isOrderLocked(orderStatus.value)
})

const parseProjectId = (id: unknown): string => {
  if (typeof id === 'string') return id
  if (typeof id === 'number') return String(id)
  return ''
}

interface EditableDetailData {
  id: number
  projectId: string
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  quantity: string | number
  unitPrice: string | number
  total: string | number
}

const displayData = computed(() => {
  const baseData = detailList.value.map((item) => ({ ...item }))
  return [...baseData, ...editRows.value]
})

// 前端切片分页（统一 useTableQuery，本页无筛选，仅做分页）
const { currentPage, pageSize, pagedList } = useTableQuery(displayData, () => true, {}, 8)
// 兼容原模板绑定名
const paginatedData = pagedList

const goBack = () => {
  window.close()
}

const toggleAddMode = () => {
  if (isAdding.value) {
    handleConfirm()
  } else {
    isAdding.value = true
    addEditRow()
  }
}

const addEditRow = () => {
  const newRow: EditableDetailData = {
    id: 0,
    projectId: parseProjectId(route.params.id),
    belongProject: `订单${orderId.value}`,
    equipmentName: '',
    equipmentModel: '',
    manufacturer: '',
    quantity: '',
    unitPrice: '',
    total: '',
  }
  editRows.value.push(newRow)

  const totalPages = Math.ceil(displayData.value.length / pageSize.value)
  currentPage.value = totalPages
}

const handleDelete = async (row: EditableDetailData) => {
  const editIndex = editRows.value.indexOf(row)
  if (editIndex !== -1) {
    editRows.value.splice(editIndex, 1)
    if (editRows.value.length === 0) {
      isAdding.value = false
    }
    return
  }

  if (row.id > 0) {
    try {
      await ElMessageBox.confirm('确定要删除这条记录吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      const success = await deleteDetail(row.id)
      if (success) {
        ElMessage.success('删除成功')
      } else {
        ElMessage.error('删除失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }
}

const handleCellEnter = () => {
  const allInputs = Array.from(
    document.querySelectorAll('.equipment-section input.el-input__inner'),
  ) as HTMLInputElement[]
  const activeInput = document.activeElement as HTMLInputElement
  const idx = allInputs.indexOf(activeInput)
  if (idx !== -1 && idx < allInputs.length - 1) {
    const nextInput = allInputs[idx + 1]
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleTotalEnter = () => {
  for (const row of editRows.value) {
    if (!row.equipmentName) {
      ElMessage.warning('请输入设备名称')
      return
    }
    if (!row.equipmentModel) {
      ElMessage.warning('请输入设备型号')
      return
    }
    if (!row.manufacturer) {
      ElMessage.warning('请输入生产厂家')
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
  }

  handleConfirm()
}

const handleConfirm = async () => {
  if (editRows.value.length === 0) {
    isAdding.value = false
    return
  }

  for (const row of editRows.value) {
    if (!row.equipmentName) {
      ElMessage.warning('请输入设备名称')
      return
    }
    if (!row.equipmentModel) {
      ElMessage.warning('请输入设备型号')
      return
    }
    if (!row.manufacturer) {
      ElMessage.warning('请输入生产厂家')
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
    await submitEditRow(row)
  }

  editRows.value = []
  isAdding.value = false
}

const submitEditRow = async (row: EditableDetailData) => {
  const orderIdValue = parseProjectId(route.params.id)

  if (!orderIdValue) {
    ElMessage.error('无效的订单ID')
    return
  }

  const submitData = {
    order: orderIdValue,
    name: row.equipmentName,
    model: row.equipmentModel,
    type: '',
    brand: row.manufacturer,
    spec: '',
    number: Number(row.quantity),
  }

  const success = await createDetail(submitData)
  if (success) {
    await fetchDetails(orderIdValue)
    ElMessage.success('创建设备成功')

    if (isAdding.value && editRows.value.length === 0) {
      addEditRow()
    }
  } else {
    ElMessage.error('创建设备失败')
  }
}

const loading = ref(false)

onMounted(async () => {
  const id = parseProjectId(route.params.id)

  if (!id) {
    ElMessage.error('无效的订单ID')
    return
  }

  orderId.value = id

  const nameParam = route.query.name as string
  if (nameParam) {
    orderName.value = decodeURIComponent(nameParam)
  }

  loading.value = true
  try {
    const projectIdParam = route.query.projectId as string
    if (projectIdParam) {
      await fetchOrders(projectIdParam)
      const order = orderList.value.find((o) => o.id === id)
      if (order) {
        orderStatus.value = order.status
        if (!orderName.value) {
          orderName.value = order.name
        }
      }
    }
    await fetchDetails(id)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid black;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.equipment-section {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
</style>
