<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="openCreateForm">创建订单</el-button>
      <el-button :loading="importLoading" @click="triggerFileSelect">导入Excel</el-button>
      <!-- 导出范围与表格勾选一致：未勾选时置灰禁用 -->
      <el-dropdown
        trigger="click"
        :disabled="selectedRows.length === 0"
        @command="handleExportCommand"
      >
        <el-button :loading="exportLoading" :disabled="selectedRows.length === 0">
          导出Excel<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="single">整合为单个文件</el-dropdown-item>
            <el-dropdown-item command="separate">多个文件（逐个下载）</el-dropdown-item>
            <el-dropdown-item command="zip">多个文件（打包 zip）</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
        >批量删除</el-button
      >
      <el-button @click="toggleFilter">{{ isFilterVisible ? '隐藏筛选' : '筛选' }}</el-button>
    </template>

    <template #filter v-if="isFilterVisible">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="订单状态">
          <el-select
            filterable
            v-model="filterForm.status"
            placeholder="全部状态"
            style="width: 150px"
          >
            <el-option label="全部状态" value="" />
            <el-option
              v-for="s in ORDER_STATUS_OPTIONS"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单类型">
          <el-select
            filterable
            v-model="filterForm.type"
            placeholder="全部类型"
            style="width: 150px"
          >
            <el-option label="全部类型" value="" />
            <el-option v-for="t in ORDER_TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单名称">
          <el-input
            v-model="filterForm.orderName"
            placeholder="请输入订单名称"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select
            filterable
            v-model="filterForm.leaderAccount"
            placeholder="全部负责人"
            style="width: 150px"
          >
            <el-option label="全部负责人" value="" />
            <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户">
          <el-select
            filterable
            v-model="filterForm.customer"
            placeholder="全部客户"
            style="width: 200px"
          >
            <el-option label="全部客户" value="" />
            <el-option
              v-for="customer in orderCustomers"
              :key="customer.name"
              :label="customer.name"
              :value="customer.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="归属公司">
          <el-select
            filterable
            v-model="filterForm.company"
            placeholder="全部公司"
            style="width: 200px"
          >
            <el-option label="全部公司" value="" />
            <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属项目">
          <el-select filterable style="width: 200px"></el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="filterForm.createTime"
            type="date"
            placeholder="选择日期"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 表格 -->
    <el-table
      :data="paginatedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-key="getRowKey"
    >
      <!-- reserve-selection：配合 row-key 跨页保留勾选，否则翻页会清空已选订单导致导出不全 -->
      <el-table-column type="selection" width="39" :reserve-selection="true"></el-table-column>
      <el-table-column prop="name" label="订单名称" show-overflow-tooltip />
      <el-table-column prop="type" label="订单类型" width="80" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="contact" label="客户联系人" />
      <el-table-column prop="leaderAccount" label="负责人" />
      <el-table-column label="执行地" show-overflow-tooltip>
        <template #default="scope">
          {{ [scope.row.province, scope.row.city, scope.row.district].filter(Boolean).join('-') }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="送修地址" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="81">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="136" />
      <el-table-column label="操作" width="205" fixed="right">
        <template #default="scope">
          <el-tooltip content="查看/编辑" placement="top">
            <el-button type="primary" size="small" icon="Edit" @click="viewOrder(scope.row)" />
          </el-tooltip>
          <el-tooltip content="关联项目" placement="top">
            <el-button
              type="success"
              size="small"
            icon="Link"
            :disabled="scope.row.status == SUBMITTED_STATUS"
            @click="openAssociateDialog(scope.row)"
          />
          </el-tooltip>
          <el-tooltip content="提交订单" placement="top">
            <el-button
              type="primary"
              size="small"
              icon="Upload"
              :loading="submitLoadingId === scope.row.id"
              :disabled="scope.row.status == SUBMITTED_STATUS"
            @click="handleSubmitBtn(scope.row)"
          />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              type="danger"
              size="small"
              icon="Delete"
              :loading="deleteLoadingId === scope.row.id"
              :disabled="scope.row.status == SUBMITTED_STATUS"
              @click="handleDeleteBtn(scope.row)"
            />
          </el-tooltip>
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
      ></el-pagination>
    </div>

    <!-- 隐藏文件选择框：点「导入Excel」时触发，用于选择设备清单 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="onFilePicked"
    />

    <!-- 新建订单弹窗（独立订单管理，不传 projectId，直接创建订单） -->
    <OrderForm
      ref="orderFormRef"
      v-model:visible="orderFormVisible"
      :user-list="managers"
      :customer-list="orderCustomers"
      @submit="handleOrderSubmit"
    />

    <!-- 订单详情弹窗 -->
    <OrderDetailDialog
      v-model="detailDialogVisible"
      :order="currentOrder"
      @details-changed="handleOrderSubmitted"
    />

    <!-- 订单关联项目弹窗 -->
    <el-dialog
      v-model="associateDialogVisible"
      title="关联项目"
      width="480px"
      @open="resetAssociateForm"
    >
      <el-form label-width="80px">
        <el-form-item label="订单名称">
          <el-input :model-value="associateOrder?.name" disabled />
        </el-form-item>
        <el-form-item label="关联项目" required>
          <el-select
            v-model="associateProjectId"
            filterable
            placeholder="请选择要关联的项目"
            style="width: 100%"
          >
            <el-option
              v-for="p in projectOptions"
              :key="p.id"
              :label="p.projectName"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="associateDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="associating"
          :disabled="!associateProjectId"
          @click="confirmAssociate"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { ElMessageBox } from 'element-plus'
import { notify } from '@/utils/message'
import WorkPage from '@/components/common/WorkPage.vue'
import { useProject } from '@/composables/project/useProject'
import { useCompany } from '@/composables/admin/useCompany'
import { useOrder, type Order } from '@/composables/order/useOrder'
import {
  getOrderManagersApi,
  getOrderCustomersApi,
  type OrderManager,
  type OrderCustomer,
} from '@/api/order/OrderApi'
import OrderForm from '@/views/order/components/AddOrderForm.vue'
import OrderDetailDialog from '@/views/order/components/OrderDetailDialog.vue'
import type { OrderSubmitPayload } from '@/api/order/types'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { ORDER_TYPES, ORDER_STATUS_OPTIONS } from '@/constants/orderEnums'
import { associateOrderToProjectApi } from '@/api/project/ProjectApi'
import { parseDeviceSheet } from '@/utils/excel'
import {
  exportOrdersToExcel,
  exportOrdersToSeparateFiles,
  exportOrdersToZip,
} from '@/views/order/utils/orderExcel'

// 关联弹窗：当前订单项目下拉选项（来自 /client/project/getProject 的 projectList）
const { projectList } = useProject()
const projectOptions = ref<{ id: string; projectName: string }[]>([])
watch(
  projectList,
  (list) => {
    projectOptions.value = list.map((p) => ({ id: p.id, projectName: p.projectName }))
  },
  { immediate: true },
)

// 订单客户列表（从 /client/order/getInfoCustomer 获取，用于筛选栏下拉和表单自动补全）
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
const { fetchProjects } = useProject()
const { companyNames, fetchCompanyNames } = useCompany()
const { orderList, createOrder, fetchOrders, deleteOrder, submitOrder } = useOrder()

// 订单负责人列表（从 /client/order/getManager 获取，用于筛选栏下拉选项）
const managers = ref<OrderManager[]>([])
const fetchOrderManagers = async () => {
  try {
    const res = await getOrderManagersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      managers.value = res.data
    }
  } catch (error) {
    console.error('获取订单负责人列表失败:', error)
  }
}

const orderFormVisible = ref(false)
const selectedRows = ref<Order[]>([])
const detailDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const isFilterVisible = ref(true)
const loading = ref(false)
const deleteLoadingId = ref<string | number | null>(null)
const submitLoadingId = ref<string | number | null>(null)

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  orderList,
  (item: Order, form) => {
    if (form.status && item.status !== form.status) return false
    if (form.type && item.type !== form.type) return false
    if (form.orderName && !item.name.includes(form.orderName)) return false
    if (form.leaderAccount && item.leaderAccount !== form.leaderAccount) return false
    if (form.customer && item.customer !== form.customer) return false
    if (form.company && item.company !== form.company) return false
    if (form.createTime) {
      const filterDate = new Date(form.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  {
    status: '',
    type: '',
    orderName: '',
    leaderAccount: '',
    customer: '',
    company: '',
    createTime: null,
  },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

const getRowKey = (row: Order) => row.id

import {
  getStatusTagType as getStatusType,
  SUBMITTED_STATUS,
} from '@/composables/common/useOrderStatus'

const handleSelectionChange = (val: Order[]) => {
  selectedRows.value = val
}

// 打开新建订单弹窗（独立订单管理，不传 projectId → 直接创建订单）
const openCreateForm = () => {
  orderFormVisible.value = true
}

const handleOrderSubmit = async (data: OrderSubmitPayload) => {
  try {
    // data.projectId 在有项目上下文时由 AddOrderForm 带上；独立页不传则省略
    // 拆分出订单数据与设备明细，避免把 details 字段误传进订单创建接口
    const { details, ...orderData } = data
    const success = await createOrder(orderData, details)
    if (success) {
      orderFormVisible.value = false
      notify({ type: 'success', message: '创建订单成功' })
      await fetchOrders()
      currentPage.value = 1
    } else {
      notify({ type: 'error', message: '创建订单失败' })
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    notify({ type: 'error', message: '创建订单失败' })
  }
}

const viewOrder = (row: Order) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

// === 订单关联项目 ===
const associateDialogVisible = ref(false)
const associateOrder = ref<Order | null>(null)
const associateProjectId = ref('')
const associating = ref(false)

const openAssociateDialog = (row: Order) => {
  associateOrder.value = row
  associateProjectId.value = ''
  associateDialogVisible.value = true
}

const resetAssociateForm = () => {
  associateProjectId.value = ''
}

// 确认关联：POST /client/project/orderProject?projectId=&orderId=
const confirmAssociate = async () => {
  if (!associateOrder.value || !associateProjectId.value) return
  associating.value = true
  try {
    const res = await associateOrderToProjectApi(associateProjectId.value, associateOrder.value.id)
    if (res.code === 200) {
      notify({ type: 'success', message: '关联成功' })
      associateDialogVisible.value = false
    } else {
      notify({ type: 'error', message: res.msg || '关联失败' })
    }
  } catch (error) {
    console.error('关联订单到项目失败:', error)
    notify({ type: 'error', message: '关联失败' })
  } finally {
    associating.value = false
  }
}

// 操作列提交订单（仅编辑中订单显示按钮）：成功后回拉列表刷新状态
const handleSubmitBtn = async (row: Order) => {
  try {
    await ElMessageBox.confirm(`确定要提交订单"${row.name}"吗？`, '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })
    submitLoadingId.value = row.id
    const success = await submitOrder(row.id)
    if (success) {
      notify({ type: 'success', message: '提交成功' })
      await fetchOrders()
    } else {
      notify({ type: 'error', message: '提交失败' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      notify({ type: 'error', message: '提交失败' })
    }
  } finally {
    submitLoadingId.value = null
  }
}

// 弹窗内提交订单成功后：回拉订单列表最新状态，并把 currentOrder 指向更新后的订单对象
const handleOrderSubmitted = async () => {
  await fetchOrders()
  if (currentOrder.value) {
    const updated = orderList.value.find((o) => o.id === currentOrder.value!.id)
    if (updated) currentOrder.value = updated
  }
}

const handleDelete = async (row: Order) => {
  try {
    await ElMessageBox.confirm(`确定要删除订单"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const success = await deleteOrder(row.id)
    if (success) {
      notify({ type: 'success', message: '删除成功' })
    } else {
      notify({ type: 'error', message: '删除失败' })
    }
  } catch (error) {
    if (error !== 'cancel') {
      notify({ type: 'error', message: '删除失败' })
    }
  } finally {
    deleteLoadingId.value = null
  }
}

const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as Order)
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    notify({ type: 'warning', message: '请先选择要删除的订单' })
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个订单吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    let successCount = 0
    for (const row of selectedRows.value) {
      const success = await deleteOrder(row.id)
      if (success) successCount++
    }
    notify({ type: 'success', message: `成功删除 ${successCount} 个订单` })
    selectedRows.value = []
  } catch (error) {
    if (error !== 'cancel') {
      notify({ type: 'error', message: '批量删除失败' })
    }
  }
}

// === 导出 Excel：订单头 + 设备明细 ===
// 导出范围 = 表格勾选的订单（selection 列开了 reserve-selection，跨页勾选会累积）。
// 未勾选任何订单时按钮已置灰，这里再兜一层防御。
const exportLoading = ref(false)

type ExportMode = 'single' | 'separate' | 'zip'

// el-dropdown 的 command 回调签名是 (command: string | number | object) => void，
// 这里按宽类型接收后再收窄，避免与组件声明的 handler 类型冲突
const handleExportCommand = async (command: string | number | object) => {
  const mode = command as ExportMode
  const rows = selectedRows.value
  if (rows.length === 0) return

  exportLoading.value = true
  try {
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    if (mode === 'single') {
      const count = await exportOrdersToExcel(rows, `订单明细_${stamp}`)
      notify({ type: 'success', message: `已导出 ${count} 个订单到单个文件` })
    } else if (mode === 'separate') {
      const count = await exportOrdersToSeparateFiles(rows)
      notify({
        type: 'success',
        message: `已导出 ${count} 个订单，共 ${count} 个文件；若浏览器拦截连续下载，请改用打包 zip`,
      })
    } else {
      const count = await exportOrdersToZip(rows, `订单明细_${stamp}`)
      notify({ type: 'success', message: `已导出 ${count} 个订单，打包为 zip` })
    }
  } catch (error) {
    console.error('导出订单失败:', error)
    notify({ type: 'error', message: '导出失败，请重试' })
  } finally {
    exportLoading.value = false
  }
}

// === 导入 Excel：解析设备清单 → 预填创建订单弹窗 → 一次 addOrder 提交「1 个订单 + N 台设备」===
// 业务形态：清单文件里只有设备（型号 / 品牌 / 参数 / 数量），订单头信息（客户、联系人、
// 地址、负责人、订单类型）不在文件内，故解析后预填能识别的部分，其余由用户手补。
const importLoading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const orderFormRef = ref<InstanceType<typeof OrderForm> | null>(null)

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const onFilePicked = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // 清空 value，保证同一个文件可以再次被选中并触发 change
  input.value = ''
  if (file) void handleImportFile(file)
}

const handleImportFile = async (file: File) => {
  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    notify({ type: 'error', message: '仅支持 .xlsx / .xls 文件' })
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    notify({ type: 'error', message: '文件大小不能超过 5MB' })
    return
  }

  importLoading.value = true
  try {
    const parsed = await parseDeviceSheet(file)
    if (parsed.rows.length === 0) {
      notify({ type: 'warning', message: '未解析到设备行，请检查清单格式' })
      return
    }

    // 订单名称优先取文件名（信息量通常大于清单标题，如「2026-08-26常德维修3台」）
    const suggestedName =
      file.name.replace(/\.(xlsx|xls)$/i, '').replace(/\+/g, ' ').trim() || parsed.title

    // 清单里的「采购人 / 发货人」是姓名，按姓名回填负责人（账号由 AddOrderForm 内部反查）
    const personName = parsed.meta['采购人'] ?? parsed.meta['发货人'] ?? ''

    // 先预填再打开弹窗：@opened 的 prefillFirstPage 只会在已有行后补空白行，不会覆盖明细
    orderFormRef.value?.prefill({
      name: suggestedName,
      managerName: personName,
      devices: parsed.rows.map((d) => ({ ...d })),
    })
    orderFormVisible.value = true

    // 反馈拆成两条：① 识别结果 + 待补全必填项 ② 忽略列 / S/N 归属提示。
    // 合并成一条时信息量太大，读不完。
    const orderCount = 1 // 当前形态：一个清单文件 = 一个订单（多订单识别后续再完善）
    const deviceCount = parsed.rows.length

    // 与 AddOrderForm 的校验保持一致：订单名称、订单类型、负责人、客户、客户联系人
    const missing: string[] = []
    if (!suggestedName) missing.push('订单名称')
    if (!personName) missing.push('负责人')
    missing.push('订单类型', '客户', '客户联系人') // 清单文件里不存在，只能手填

    const summaryMsg =
      missing.length > 0
        ? `已识别 ${orderCount} 个订单、${deviceCount} 台设备，请补全以下必填项：${missing.join('、')}`
        : `已识别 ${orderCount} 个订单、${deviceCount} 台设备`
    notify({ type: 'success', message: summaryMsg, duration: 20000, showClose: true })

    // 第二条：忽略列 + S/N 归属提示（都没内容时不弹）
    const notices: string[] = []
    if (parsed.ignoredColumns.length > 0) {
      notices.push(`已忽略列：${parsed.ignoredColumns.join('、')}`)
    }
    if (parsed.hasSnColumn) notices.push('检测到 S/N 列，序列号需在维修入库环节录入')
    if (notices.length > 0) {
      // 等第一条完成挂载再弹，否则两条的 offset 会按同一基准计算导致重叠
      await nextTick()
      notify({ type: 'warning', message: notices.join('；'), duration: 20000, showClose: true })
    }
  } catch (error) {
    console.error('解析设备清单失败:', error)
    notify({ type: 'error', message: error instanceof Error ? error.message : '解析失败，请检查文件格式' })
  } finally {
    importLoading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    // 先拉订单列表 /client/order/getOrder
    await fetchOrders()
    // 订单列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchOrderCustomers() // /client/order/customer
    await fetchProjects() // /client/project/getProject
    await fetchCompanyNames() // /client/user/getInfoCompany
    await fetchOrderManagers() // /client/order/manager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<style scoped>
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
