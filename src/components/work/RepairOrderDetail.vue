<template>
  <div class="order-detail">
    <div class="detail-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">订单详情</h2>
    </div>

    <div class="equipment-section">
      <h3 class="section-title">订单名称：{{ orderName }}</h3>
      <el-table :data="paginatedData" border style="width: 100%">
        <el-table-column prop="equipmentName" label="设备名称" width="150">
          <template #default="scope">
            <template v-if="scope.row.isEditing">
              <input
                v-model="scope.row.equipmentName"
                class="edit-input"
                @keydown.enter.prevent="handleCellEnter"
              />
            </template>
            <template v-else>
              {{ scope.row.equipmentName }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="equipmentModel" label="设备型号" width="150">
          <template #default="scope">
            <template v-if="scope.row.isEditing">
              <input
                v-model="scope.row.equipmentModel"
                class="edit-input"
                @keydown.enter.prevent="handleCellEnter"
              />
            </template>
            <template v-else>
              {{ scope.row.equipmentModel }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家">
          <template #default="scope">
            <template v-if="scope.row.isEditing">
              <input
                v-model="scope.row.manufacturer"
                class="edit-input"
                @keydown.enter.prevent="handleCellEnter"
              />
            </template>
            <template v-else>
              {{ scope.row.manufacturer }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100">
          <template #default="scope">
            <template v-if="scope.row.isEditing">
              <input
                v-model="scope.row.quantity"
                class="edit-input"
                @keydown.enter.prevent="handleCellEnter"
              />
            </template>
            <template v-else>
              {{ scope.row.quantity }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="150">
          <template #default="scope">
            <template v-if="scope.row.isEditing">
              <input
                v-model="scope.row.unitPrice"
                class="edit-input"
                @keydown.enter.prevent="handleTotalEnter"
              />
            </template>
            <template v-else>
              {{ scope.row.unitPrice }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总价" width="150">
          <template #default="scope">
            {{ scope.row.total || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="133">
          <template #default="scope">
            <el-button type="info" size="small" @click="handleDetail(scope.row)"> 查看 </el-button>
            <el-button type="primary" size="small" @click="handleAdd(scope.row)"> 提交 </el-button>
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

    <el-dialog v-model="detailDialogVisible" title="设备详情" width="600px">
      <div v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{
            detailData.equipmentName
          }}</el-descriptions-item>
          <el-descriptions-item label="设备型号">{{
            detailData.equipmentModel
          }}</el-descriptions-item>
          <el-descriptions-item label="生产厂家">{{
            detailData.manufacturer
          }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ detailData.quantity }}</el-descriptions-item>
          <el-descriptions-item label="单价">{{ detailData.unitPrice }}</el-descriptions-item>
          <el-descriptions-item label="总价">{{ detailData.total }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { useDetail } from '@/composables/useDetail'
import request from '@/utile/request'

const route = useRoute()
const { createDetail, fetchDetails, detailList } = useDetail()

const orderId = ref(0)
const orderName = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isAdding = ref(false)
const editRows = ref<EditableDetailData[]>([])
const isProjectIdValid = ref(true)
const detailDialogVisible = ref(false)
const detailData = ref<EditableDetailData | null>(null)

const parseProjectId = (id: unknown): number => {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10)
    return !isNaN(parsed) && parsed > 0 ? parsed : 0
  }
  return 0
}

interface EditableDetailData {
  id: number
  projectId: number
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  quantity: string | number
  unitPrice: string | number
  total: string | number
  isEditing: boolean
}

const displayData = computed(() => {
  const baseData = detailList.value.map((item) => ({ ...item, isEditing: false }))
  return [...baseData, ...editRows.value]
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return displayData.value.slice(start, end)
})

const goBack = () => {
  window.close()
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
    isEditing: true,
  }
  editRows.value.push(newRow)

  const totalPages = Math.ceil(displayData.value.length / pageSize.value)
  currentPage.value = totalPages
}

const handleDetail = async (row: EditableDetailData) => {
  if (!row.id) {
    ElMessage.error('无效的数据ID')
    return
  }

  try {
    const response = await request.get(`/repair/get`, {
      params: { id: row.id },
    })
    const res = response.data

    if (res && (res.code === 200 || res.code === '200')) {
      detailData.value = {
        ...row,
        ...res.data,
      }
      detailDialogVisible.value = true
    } else if (res && typeof res === 'object' && !res.code) {
      detailData.value = {
        ...row,
        ...res,
      }
      detailDialogVisible.value = true
    } else {
      ElMessage.error('获取详情失败')
      console.error('响应数据:', res)
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
    console.error('获取详情失败:', error)
  }
}

const handleAdd = async (row: EditableDetailData) => {
  if (!row.id) {
    ElMessage.error('无效的数据ID')
    return
  }

  try {
    const sn = await ElMessageBox.prompt('请输入SN码', '提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    if (!sn.value) {
      return
    }

    await request.put(`/repair/add`, null, {
      params: {
        sn: sn.value,
        id: row.id,
      },
    })
    ElMessage.success('提交成功')
    await fetchDetails(orderId.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
      console.error('提交失败:', error)
    }
  }
}

const handleCellEnter = () => {
  const allInputs = document.querySelectorAll('.edit-input')
  const activeInput = document.activeElement as HTMLInputElement

  for (let i = 0; i < allInputs.length; i++) {
    if (allInputs[i] === activeInput && i < allInputs.length - 1) {
      ;(allInputs[i + 1] as HTMLInputElement).focus()
      break
    }
  }
}

const handleTotalEnter = () => {
  for (const row of editRows.value) {
    if (!row.equipmentName) {
      ElMessage.warning('请输入设备名称')
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
    await submitEditRow(row, -1)
  }

  editRows.value = []
  isAdding.value = false
}

const submitEditRow = async (row: EditableDetailData, editIndex: number) => {
  const orderIdValue = parseProjectId(route.params.id)

  if (orderIdValue === 0) {
    ElMessage.error('无效的订单ID')
    return
  }

  const submitData = {
    name: row.equipmentName,
    model: row.equipmentModel,
    manufacturer: row.manufacturer,
    orderId: orderIdValue,
    number: String(row.quantity),
    price: String(row.unitPrice),
  }

  const success = await createDetail(submitData)
  if (success) {
    await fetchDetails(orderIdValue)
    if (editIndex >= 0) {
      editRows.value.splice(editIndex, 1)
    }
    ElMessage.success('创建设备成功')

    if (isAdding.value && editRows.value.length === 0) {
      addEditRow()
    }
  } else {
    ElMessage.error('创建设备失败')
  }
}

onMounted(() => {
  const id = parseProjectId(route.params.id)

  if (id === 0) {
    isProjectIdValid.value = false
    ElMessage.error('无效的订单ID')
    return
  }

  orderId.value = id

  const nameParam = route.query.name as string
  if (nameParam) {
    orderName.value = decodeURIComponent(nameParam)
  }

  fetchDetails(id)
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
  background-color: white;
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

.edit-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  text-align: inherit;
  cursor: text;
}
</style>
