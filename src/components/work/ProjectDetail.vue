<template>
  <div class="project-detail">
    <div class="detail-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">项目详情</h2>
      <el-button type="primary" @click="toggleAddMode">
        {{ isAdding ? '确定' : '添加设备' }}
      </el-button>
    </div>

    <div class="equipment-section">
      <h3 class="section-title">项目归属：{{ projectName }}</h3>
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
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
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
import { useProject } from '@/composables/useProject'
import { useDetail } from '@/composables/useDetail'

const route = useRoute()
const { projectList, fetchProjects } = useProject()
const { createDetail, fetchDetails, detailList, deleteDetail } = useDetail()

const projectName = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isAdding = ref(false)
const editRows = ref<EditableDetailData[]>([])
const isProjectIdValid = ref(true)

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
    belongProject: projectName.value,
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
  const projectId = parseProjectId(route.params.id)

  if (projectId === 0) {
    ElMessage.error('无效的项目ID')
    return
  }

  const submitData = {
    projectName: projectName.value,
    name: row.equipmentName,
    model: row.equipmentModel,
    manufacturer: row.manufacturer,
    number: String(row.quantity),
    price: String(row.unitPrice),
    id: String(projectId),
  }

  const success = await createDetail(submitData)
  if (success) {
    await fetchDetails(projectId)
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
  const projectId = parseProjectId(route.params.id)

  if (projectId === 0) {
    isProjectIdValid.value = false
    ElMessage.error('无效的项目ID')
    return
  }

  Promise.all([fetchProjects(), fetchDetails(projectId)]).then(() => {
    const project = projectList.value.find((p) => p.id === projectId)
    if (project) {
      projectName.value = project.projectName
      detailList.value.forEach((item) => {
        item.belongProject = project.projectName
      })
    }
  })
})
</script>

<style scoped>
.project-detail {
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
