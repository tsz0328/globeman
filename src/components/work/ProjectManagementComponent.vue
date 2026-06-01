<template>
  <div class="project-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">项目管理</h2>
      <div class="action-buttons">
        <el-button type="primary">+新建项目</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger">批量删除</el-button>
      </div>
    </div>
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>项目类型：</label>
          <el-select v-model="filterForm.projectType" placeholder="全部类型" style="width: 150px">
            <el-option label="全部类型" value="" />
            <el-option label="维修项目" value="维修" />
            <el-option label="开发项目" value="开发" />
            <el-option label="测试项目" value="测试" />
          </el-select>
        </div>
        <div class="filter-item">
          <label>合作单位：</label>
          <el-select
            v-model="filterForm.cooperativeUnit"
            placeholder="全部单位"
            style="width: 150px"
          >
            <el-option label="全部单位" value="" />
            <el-option label="建设集团有限公司" value="建设集团" />
            <el-option label="科技有限公司" value="科技" />
            <el-option label="信息技术公司" value="信息" />
          </el-select>
        </div>
        <div class="filter-item">
          <label>项目负责人：</label>
          <el-select
            v-model="filterForm.projectManager"
            placeholder="全部负责人"
            style="width: 150px"
          >
            <el-option label="全部负责人" value="" />
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
          </el-select>
        </div>
        <div class="filter-item">
          <label>项目状态：</label>
          <el-select v-model="filterForm.status" placeholder="全部" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="进行中" value="进行中" />
            <el-option label="待启动" value="待启动" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <label>创建时间：</label>
          <el-date-picker
            v-model="filterForm.createTime"
            type="date"
            placeholder="选择日期"
            style="width: 150px"
          />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table :data="paginatedData" border style="width: 100%">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column prop="cooperativeUnit" label="合作单位" />
        <el-table-column prop="projectManager" label="项目负责人" width="100" />
        <el-table-column prop="projectType" label="项目类型" width="100" />
        <el-table-column prop="contactPerson" label="合作联系人" width="100" />
        <el-table-column prop="projectCode" label="项目编号" width="120" />
        <el-table-column prop="status" label="项目状态" width="90">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140" />
        <el-table-column label="操作" width="193">
          <template #default>
            <div class="action-buttons">
              <el-button type="primary" size="small">查看</el-button>
              <el-button type="warning" size="small">编辑</el-button>
              <el-button type="danger" size="small">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="filteredData.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Project {
  id: number
  projectName: string
  cooperativeUnit: string
  projectManager: string
  projectType: string
  contactPerson: string
  projectCode: string
  status: string
  statusClass: string
  createTime: string
}

const currentPage = ref(1)
const pageSize = ref(8)

// 筛选后的数据
const filteredData = computed(() => {
  return projectList.value.filter((item) => {
    if (filterForm.value.projectType && !item.projectType.includes(filterForm.value.projectType)) {
      return false
    }
    if (
      filterForm.value.cooperativeUnit &&
      !item.cooperativeUnit.includes(filterForm.value.cooperativeUnit)
    ) {
      return false
    }
    if (
      filterForm.value.projectManager &&
      item.projectManager !== filterForm.value.projectManager
    ) {
      return false
    }
    if (filterForm.value.status && item.status !== filterForm.value.status) {
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
  cooperativeUnit: '',
  projectManager: '',
  status: '',
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
    cooperativeUnit: '',
    projectManager: '',
    status: '',
    createTime: null,
  }
  currentPage.value = 1
}

// 获取状态标签类型
const getTagType = (status: string): string => {
  switch (status) {
    case '进行中':
      return 'success'
    case '待启动':
      return 'warning'
    case '已完成':
      return 'info'
    default:
      return 'default'
  }
}

const projectList = ref<Project[]>([
  {
    id: 1,
    projectName: '办公楼设备维修',
    cooperativeUnit: '建设集团有限公司',
    projectManager: '张三',
    projectType: '维修项目',
    contactPerson: '赵六',
    projectCode: 'XM2025001',
    status: '进行中',
    statusClass: 'status-in-progress',
    createTime: '2025-12-01 09:30',
  },
  {
    id: 2,
    projectName: '管理系统开发',
    cooperativeUnit: '科技有限公司',
    projectManager: '李四',
    projectType: '开发项目',
    contactPerson: '孙七',
    projectCode: 'XM2025002',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-02 01:15',
  },
  {
    id: 3,
    projectName: '软件功能测试',
    cooperativeUnit: '信息技术公司',
    projectManager: '王五',
    projectType: '测试项目',
    contactPerson: '周八',
    projectCode: 'XM2025003',
    status: '已完成',
    statusClass: 'status-completed',
    createTime: '2025-11-25 14:20',
  },
  {
    id: 4,
    projectName: '数据库优化',
    cooperativeUnit: '数据库公司',
    projectManager: '赵六',
    projectType: '维修项目',
    contactPerson: '王二',
    projectCode: 'XM2025004',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-03 10:45',
  },
  {
    id: 5,
    projectName: '项目A',
    cooperativeUnit: 'A公司',
    projectManager: 'A负责人',
    projectType: '开发项目',
    contactPerson: 'A联系人',
    projectCode: 'XM2025005',
    status: '进行中',
    statusClass: 'status-in-progress',
    createTime: '2025-12-04 12:00',
  },
  {
    id: 6,
    projectName: '项目B',
    cooperativeUnit: 'B公司',
    projectManager: 'B负责人',
    projectType: '开发项目',
    contactPerson: 'B联系人',
    projectCode: 'XM2025006',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-05 14:30',
  },
  {
    id: 7,
    projectName: '项目C',
    cooperativeUnit: 'C公司',
    projectManager: 'C负责人',
    projectType: '开发项目',
    contactPerson: 'C联系人',
    projectCode: 'XM2025007',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-06 16:00',
  },
  {
    id: 8,
    projectName: '项目D',
    cooperativeUnit: 'D公司',
    projectManager: 'D负责人',
    projectType: '测试项目',
    contactPerson: 'D联系人',
    projectCode: 'XM2025008',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-07 18:30',
  },
  {
    id: 9,
    projectName: '项目E',
    cooperativeUnit: 'E公司',
    projectManager: 'E负责人',
    projectType: '测试项目',
    contactPerson: 'E联系人',
    projectCode: 'XM2025009',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-08 20:00',
  },
  {
    id: 10,
    projectName: '项目F',
    cooperativeUnit: 'F公司',
    projectManager: 'F负责人',
    projectType: '维修项目',
    contactPerson: 'F联系人',
    projectCode: 'XM2025010',
    status: '待启动',
    statusClass: 'status-pending',
    createTime: '2025-12-09 22:30',
  },
])
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
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 表格区域 */
.table-section {
  background-color: white;
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

.total {
  font-size: 14px;
  color: #666;
}

.pagination {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #ccc;
}
</style>
