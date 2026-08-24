<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="addProject">新建项目</el-button>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </template>

    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="项目类型">
          <el-select filterable v-model="filterForm.projectType" placeholder="全部类型" style="width: 150px">
            <el-option label="全部类型" value="" />
            <el-option label="维修项目" value="维修" />
            <el-option label="销售项目" value="销售" />
            <el-option label="采购项目" value="采购" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户">
          <el-select filterable v-model="filterForm.customer" placeholder="全部客户" style="width: 150px">
            <el-option label="全部客户" value="" />
            <el-option v-for="customer in orderCustomers" :key="customer.name" :label="customer.name"
              :value="customer.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户联系人">
          <el-select filterable v-model="filterForm.contactPerson" placeholder="全部联系人" style="width: 150px">
            <el-option label="全部联系人" value="" />
            <el-option v-for="customer in orderCustomers" :key="customer.contact" :label="customer.contact"
              :value="customer.contact" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目负责人">
          <el-select filterable v-model="filterForm.projectManager" placeholder="全部负责人" style="width: 150px">
            <el-option label="全部负责人" value="" />
            <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker v-model="filterForm.createTime" type="date" placeholder="选择日期" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

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
      <el-table-column label="操作" width="133" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewProject(scope.row)">查看</el-button>
          <el-button type="danger" size="small" :loading="deleteLoadingId === scope.row.id" @click="handleDeleteBtn(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-section">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="filteredData.length" />
    </div>

    <!-- 新建项目弹窗 -->
    <ProjectForm v-model:visible="projectFormVisible" @submit="handleProjectSubmit" :user-list="managers"
      :customer-list="orderCustomers" />
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectForm from '@/components/project/AddProjectForm.vue'
import type { ProjectFormData } from '@/components/project/AddProjectForm.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import { useProject, type Project } from '@/composables/project/useProject'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { getOrderManagersApi, getOrderCustomersApi, type OrderManager, type OrderCustomer } from '@/api/order/OrderApi'

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

const projectFormVisible = ref(false)
const selectedRows = ref<Project[]>([])
const loading = ref(false)
const deleteLoadingId = ref<string | number | null>(null)

// 组件挂载时获取项目列表
const loadData = async () => {
  loading.value = true
  try {
    // 先拉项目列表 /client/project/getProject
    await fetchProjects()
    // 项目列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchOrderCustomers() // /client/order/getInfoCustomer
    await fetchOrderManagers()  // /client/order/getInfoManager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)

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
    deleteLoadingId.value = row.id
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
  } finally {
    deleteLoadingId.value = null
  }
}

// 获取行key（用于模板调用，避免类型错误）
const getRowKey = (row: Project) => row.id

// 获取状态标签类型
import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'

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

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  projectList,
  (item: Project, form) => {
    if (form.projectType && !item.projectType.includes(form.projectType)) return false
    if (form.status && item.status !== form.status) return false
    if (form.customer && item.customer !== form.customer) return false
    if (form.contactPerson && item.contactPerson !== form.contactPerson) return false
    if (form.projectManager && item.projectManager !== form.projectManager) return false
    if (form.createTime) {
      const filterDate = new Date(form.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  { projectType: '', status: '', customer: '', contactPerson: '', projectManager: '', createTime: null },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList
</script>

<style scoped>
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
