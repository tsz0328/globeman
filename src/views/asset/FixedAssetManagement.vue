<template>
  <div class="fixed-asset-management" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">固定资产管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="openAddForm">新增固定资产</el-button>
        <el-button >导入Excel</el-button>
        <el-button >导出Excel</el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-item">
        <label for="fa-name">名称：</label>
        <el-input id="fa-name" v-model="filterForm.name" placeholder="资产名称" clearable style="width: 150px" />
      </div>
      <div class="filter-item">
        <label for="fa-model">型号：</label>
        <el-input id="fa-model" v-model="filterForm.model" placeholder="型号" clearable style="width: 150px" />
      </div>
      <div class="filter-item">
        <label for="fa-sn">SN码：</label>
        <el-input id="fa-sn" v-model="filterForm.sn" placeholder="SN码" clearable style="width: 150px" />
      </div>
      <div class="filter-item">
        <label for="fa-account">使用人：</label>
        <el-select filterable id="fa-account" v-model="filterForm.account" placeholder="全部使用人" clearable
          style="width: 150px">
          <el-option label="全部使用人" value="" />
          <el-option v-for="m in managerOptions" :key="m.account" :label="m.name" :value="m.account" />
        </el-select>
      </div>
      <div class="filter-item">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 新增/修改固定资产弹窗 -->
    <AddAssetForm v-model:visible="addVisible" :edit-data="editData" @submit="fetchAssets" />

    <!-- 表格 -->
    <div class="table-section">
      <!-- 统计信息行：资产总数 + 资产总价值 -->
      <div class="summary-row">
        <span class="summary-item">资产总数：<b>{{ totalCount }}</b> 条</span>
        <span class="summary-item">资产总价值：<b>{{ formatPrice(totalAmount) }}</b></span>
      </div>
      <el-table :data="pagedList" style="width: 100%" :row-key="getRowKey" border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="model" label="型号" min-width="120" />
        <el-table-column prop="type" label="类型" min-width="100" />
        <el-table-column prop="price" label="价格" min-width="110">
          <template #default="scope">
            {{ formatPrice(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="sn" label="SN码" min-width="140" />
        <el-table-column prop="account" label="使用人" min-width="110" />
        <el-table-column prop="location" label="放置位置" min-width="130" />
        <el-table-column label="创建时间" width="136">
          <template #default="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="register" label="登记人" min-width="100" />
        <el-table-column label="操作" width="193" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">修改</el-button>
            <el-button size="small" type="warning" @click="handleScrap(scope.row)">报废</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="totalCount" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddAssetForm from '@/components/asset/AddAssetForm.vue'
import {
  getAssetListApi,
  deleteAssetsApi,
  scrapAssetsApi,
  type AssetItem,
} from '@/api/asset/AssetApi'
import { getOrderManagersApi, type OrderManager } from '@/api/order/OrderApi'
import { useTableQuery } from '@/composables/common/useTableQuery'

const loading = ref(false)
const assetList = ref<AssetItem[]>([]) // 固定资产列表（后端全量返回）

// === 筛选 ===
// 使用人下拉选项（复用订单负责人接口）
const managerOptions = ref<OrderManager[]>([])
const fetchManagerOptions = async () => {
  if (managerOptions.value.length > 0) return // 已加载则不重复请求
  const res = await getOrderManagersApi()
  if (res.code === 200 && res.data) managerOptions.value = res.data
}

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, total: totalCount, handleSearch, handleReset } = useTableQuery(
  assetList,
  (item: AssetItem, form) => {
    const kw = (s: string) => (s ?? '').trim().toLowerCase()
    const name = kw(form.name)
    const model = kw(form.model)
    const sn = kw(form.sn)
    const account = kw(form.account)
    return (
      (!name || String(item.name ?? '').toLowerCase().includes(name)) &&
      (!model || String(item.model ?? '').toLowerCase().includes(model)) &&
      (!sn || String(item.sn ?? '').toLowerCase().includes(sn)) &&
      (!account || String(item.account ?? '').toLowerCase() === account)
    )
  },
  { name: '', model: '', sn: '', account: '' },
  10,
)

// 统计行：资产总价值基于筛选结果实时计算
const totalAmount = computed(() =>
  filteredList.value.reduce((sum, item) => sum + Number(item.price ?? 0), 0),
)


// 新增/修改固定资产弹窗：editData 为 null 表示新增，否则为编辑行
const addVisible = ref(false)
const editData = ref<AssetItem | null>(null)
const openAddForm = () => {
  editData.value = null
  addVisible.value = true
}
const handleEdit = (row: AssetItem) => {
  editData.value = row
  addVisible.value = true
}

// 删除（二次确认）
const handleDelete = async (row: AssetItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资产「${row.name}」（SN: ${row.sn}）吗？`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    const res = await deleteAssetsApi(String(row.id ?? ''))
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchAssets()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除资产失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 报废（二次确认；语义待后端确认）
const handleScrap = async (row: AssetItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要将资产「${row.name}」（SN: ${row.sn}）标记为报废吗？`,
      '报废确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    const res = await scrapAssetsApi(row.sn)
    if (res.code === 200) {
      ElMessage.success('已报废')
      fetchAssets()
    } else {
      ElMessage.error(res.msg || '报废失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报废资产失败:', error)
      ElMessage.error('报废失败')
    }
  }
}

// 行唯一键：优先 id，其次 sn，再次 name
const getRowKey = (row: AssetItem): string => String(row.id ?? row.sn ?? row.name)

// 价格格式化（¥ + 两位小数）
const formatPrice = (price: number | string): string => {
  if (price === '' || price === null || price === undefined) return '-'
  const num = typeof price === 'string' ? Number(price) : price
  if (Number.isNaN(num)) return String(price)
  return '¥' + num.toFixed(2)
}

// 时间格式化：兼容字符串与 LocalDateTime 数组 [y, m, d, h, min, s]
const pad = (n: number) => String(n).padStart(2, '0')
const formatTime = (t: unknown): string => {
  if (t === null || t === undefined || t === '') return '-'
  if (Array.isArray(t)) {
    const [y = 0, m = 0, d = 0, hh = 0, mm = 0, ss = 0] = t as number[]
    return `${y}-${pad(m)}-${pad(d)} ${pad(hh)}:${pad(mm)}:${pad(ss)}`
  }
  // 字符串：兼容 ISO "2026-08-13T16:16:09" 与 "2026-08-13 16:16:09"
  const s = String(t)
  return s.replace('T', ' ').replace(/\.\d+$/, '')
}

// 接入固定资产列表接口 GET /client/assets/getAssets
const fetchAssets = async () => {
  loading.value = true
  try {
    const res = await getAssetListApi()
    if (res.code === 200 && res.data) {
      assetList.value = res.data.assets ?? []
      // 数据量变化（新增/删除后）确保当前页不越界，避免表格空白
      const maxPage = Math.max(1, Math.ceil(filteredList.value.length / pageSize.value))
      if (currentPage.value > maxPage) currentPage.value = maxPage
    } else {
      assetList.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAssets()
  fetchManagerOptions()
})
</script>

<style scoped>
.fixed-asset-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
  padding-bottom: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.table-section {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.summary-row {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}

.summary-row .summary-item b {
  color: #303133;
  font-weight: 600;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
</style>
