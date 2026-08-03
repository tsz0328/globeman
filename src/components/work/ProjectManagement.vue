<template>
  <div class="project-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">项目管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addProject">新建项目</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
      </div>
    </div>
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-item">
        <label for="projectType">项目类型：</label>
        <el-select id="projectType" aria-label="项目类型" v-model="filterForm.projectType" placeholder="全部类型"
          style="width: 150px">
          <el-option label="全部类型" value="" />
          <el-option label="维修项目" value="维修" />
          <el-option label="销售项目" value="销售" />
          <el-option label="采购项目" value="采购" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customer">客户：</label>
        <el-select id="customer" aria-label="客户" v-model="filterForm.customer" placeholder="全部客户" style="width: 150px">
          <el-option label="全部客户" value="" />
          <el-option v-for="customer in orderCustomers" :key="customer.name" :label="customer.name"
            :value="customer.name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customerContact">客户联系人：</label>
        <el-select id="customerContact" aria-label="客户联系人" v-model="filterForm.contactPerson" placeholder="全部联系人"
          style="width: 150px">
          <el-option label="全部联系人" value="" />
          <el-option v-for="customer in orderCustomers" :key="customer.contact" :label="customer.contact"
            :value="customer.contact" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="projectLeader">项目负责人：</label>
        <el-select id="projectLeader" aria-label="项目负责人" v-model="filterForm.projectManager" placeholder="全部负责人"
          style="width: 150px">
          <el-option label="全部负责人" value="" />
          <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">创建时间:</label>
        <el-date-picker id="createTime" aria-label="创建时间" v-model="filterForm.createTime" type="date" placeholder="选择日期"
          style="width: 150px" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDblclick" :row-key="getRowKey">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column prop="customer" label="客户" width="120" />
        <el-table-column prop="contactPerson" label="客户联系人" width="100" />
        <el-table-column prop="projectManager" label="负责人" width="100" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="projectType" label="项目类型" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="cooperativeUnit" label="归属公司" />
        <el-table-column label="操作" width="133">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewProject(scope.row)">查看</el-button>
              <el-button type="danger" size="small" @click="handleDeleteBtn(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="filteredData.length" />
      </div>
    </div>

    <!-- 新建项目弹窗 -->
    <ProjectForm v-model:visible="projectFormVisible" @submit="handleProjectSubmit" :user-list="managers"
      :customer-list="orderCustomers" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectForm from './AddProjectForm.vue'
import type { ProjectFormData } from './AddProjectForm.vue'
import { useProject, type Project } from '@/composables/useProject'
import { getOrderManagersApi, getOrderCustomersApi, type OrderManager, type OrderCustomer } from '@/api/OrderApi'

const { projectList, fetchProjects, createProject, deleteProject, batchDeleteProjects } =
  useProject()
const orderCustomers = ref<OrderCustomer[]>([])
const fetchOrderCustomers = async () => {
  try {
    const res = await getOrderCustomersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      orderCustomers.value = res.data
    }
  } catch (error) {
    console.error('获取订单客户列表失败:', error)
  }
}

const managers = ref<OrderManager[]>([])
const fetchOrderManagers = async () => {
  try {
    const res = await getOrderManagersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      managers.value = res.data
    }
  } catch (error) {
    console.error('获取负责人列表失败:', error)
  }
}

const currentPage = ref(1)
const pageSize = ref(8)
const projectFormVisible = ref(false)
const selectedRows = ref<Project[]>([])

// 组件挂载时获取项目列表
onMounted(() => {
  Promise.all([fetchProjects(), fetchOrderCustomers(), fetchOrderManagers()])
})

// 新增项目
const addProject = () => {
  projectFormVisible.value = true
}

// 查看项目详情
const viewProject = (row: Project) => {
  window.open(`/project-order/${row.id}`, '_blank')
}

// 双击当前行 = 点击「查看」按钮
const handleRowDblclick = (row: Project) => {
  viewProject(row)
}

// 项目表单提交
const handleProjectSubmit = async (data: ProjectFormData) => {
  try {
    const success = await createProject(data)
    if (success) {
      projectFormVisible.value = false
      // 清空筛选并回到首页，确保新建项目（已置顶）立即可见
      handleReset()
      ElMessage.success('创建成功')
    }
  } catch (error) {
    console.error('提交项目失败:', error)
  }
}

// 删除项目
const handleDelete = async (row: Project) => {
  try {
    await ElMessageBox.confirm(`确定要删除项目"${row.projectName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await deleteProject(row.id)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 获取行key（用于模板调用，避免类型错误）
const getRowKey = (row: Project) => row.id

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '编辑中':
      return 'primary'
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}

// 删除按钮点击（用于模板调用，避免类型错误）
const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as Project)
}

// 多选事件
const handleSelectionChange = (val: Project[]) => {
  selectedRows.value = val
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的项目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个项目吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const ids = selectedRows.value.map((row) => row.id)
    const success = await batchDeleteProjects(ids)

    if (success) {
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个项目`)
      selectedRows.value = []
    } else {
      ElMessage.error('批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 筛选后的数据
const filteredData = computed(() => {
  return projectList.value.filter((item) => {
    if (filterForm.value.projectType && !item.projectType.includes(filterForm.value.projectType)) {
      return false
    }
    if (filterForm.value.status && item.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.customer && item.customer !== filterForm.value.customer) {
      return false
    }
    if (filterForm.value.contactPerson && item.contactPerson !== filterForm.value.contactPerson) {
      return false
    }
    if (
      filterForm.value.projectManager &&
      item.projectManager !== filterForm.value.projectManager
    ) {
      return false
    }
    if (filterForm.value.createTime) {
      const filterDate = new Date(filterForm.value.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) {
        return false
      }
    }
    return true
  })
})

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 筛选表单数据
const filterForm = ref({
  projectType: '',
  status: '',
  customer: '',
  contactPerson: '',
  projectManager: '',
  createTime: null,
})

// 查询
const handleSearch = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  filterForm.value = {
    projectType: '',
    status: '',
    customer: '',
    contactPerson: '',
    projectManager: '',
    createTime: null,
  }
  currentPage.value = 1
}
</script>

<style scoped>
.project-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.action-buttons {
  display: flex;
}

/* 筛选区域 */
.filter-section {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 表格区域 */
.table-section {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
</style>
