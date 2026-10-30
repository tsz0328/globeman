<template>
  <WorkPage :loading="loading">
    <!-- 快速接单 -->
    <template #actions>
      <div class="quick-order">
        <span class="quick-order__label">快速接单：</span>
        <el-input
          v-model="snCode"
          placeholder="请输入SN码"
          style="width: 250px"
          @keyup.enter="handleTakeOrder"
        />
        <el-button type="primary" @click="handleTakeOrder">接单</el-button>
      </div>
    </template>

    <!-- 筛选条件 -->
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="状态">
          <el-select
            filterable
            v-model="filterForm.status"
            placeholder="全部状态"
            style="width: 150px"
          >
            <el-option label="全部状态" value="" />
            <el-option
              v-for="s in REPAIR_STATUS_OPTIONS"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单名称">
          <el-input
            v-model="filterForm.headName"
            placeholder="请输入工单名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input
            v-model="filterForm.model"
            placeholder="请输入设备型号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="SN码">
          <el-input
            v-model="filterForm.sn"
            placeholder="请输入SN码"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 表格数据 -->
    <el-table
      :data="paginatedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-key="getRowKey"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="headName" label="工单名称" :min-width="colWidths.headName" show-overflow-tooltip />
      <el-table-column prop="name" label="名称" :min-width="colWidths.name" show-overflow-tooltip />
      <el-table-column prop="brand" label="品牌" :min-width="colWidths.brand" show-overflow-tooltip />
      <el-table-column prop="model" label="设备型号" :min-width="colWidths.model" show-overflow-tooltip />
      <el-table-column prop="type" label="类型" :min-width="colWidths.type" />
      <el-table-column prop="spec" label="参数" :min-width="colWidths.spec" show-overflow-tooltip />
      <el-table-column prop="sn" label="SN码" :min-width="colWidths.sn" />
      <el-table-column prop="status" label="状态" width="81">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="使用人" :min-width="colWidths.account" />
      <el-table-column label="时间" min-width="137" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.time || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="接单时间" min-width="137" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.takeTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="73" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewRepair(scope.row)">查看</el-button>
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
  </WorkPage>

  <!-- 同 SN 选单弹窗：列出该 SN 全部工单（含待接单/维修中/已完成），员工选择要接的那条 -->
  <el-dialog
    v-model="selectVisible"
    title="选择要接的工单"
    width="760px"
    :close-on-click-modal="false"
  >
    <el-table :data="snTickets" border size="small" style="width: 100%">
      <el-table-column prop="orderName" label="订单名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="seq" label="序号" width="70" align="center" />
      <el-table-column prop="sn" label="SN" min-width="130" />
      <el-table-column label="派发" width="110" align="center">
        <template #default="scope">
          {{ scope.row.assigneeName || '未派发' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" align="center">
        <template #default="scope">
          <el-button
            v-if="canAccept(scope.row)"
            type="primary"
            size="small"
            :loading="acceptingId === scope.row.id"
            @click="acceptOne(scope.row)"
          >
            接单
          </el-button>
          <el-tag v-else-if="scope.row.status === REPAIR_STATUS.PENDING" type="info" size="small">
            已派发
          </el-tag>
          <el-tag
            v-else
            :type="scope.row.status === REPAIR_STATUS.COMPLETED ? 'success' : 'warning'"
            size="small"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="selectVisible = false">取消</el-button>
    </template>
  </el-dialog>

  <!-- 无可接时的分组明细提示：按「已接过 / 已派发他人 / 已被他人接走」分组列出全部工单 -->
  <el-dialog
    v-model="tipsVisible"
    title="接单提示"
    width="820px"
    :close-on-click-modal="false"
  >
    <div v-for="(g, idx) in tipsGroups" :key="idx" class="tips-group">
      <div class="tips-group__title">{{ g.title }}</div>
      <el-table :data="g.list" border size="small" style="width: 100%">
        <el-table-column prop="orderName" label="订单名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="seq" label="序号" width="64" align="center" />
        <el-table-column prop="sn" label="SN" min-width="120" />
        <el-table-column label="派发" width="92" align="center">
          <template #default="scope">
            {{ scope.row.assigneeName || '未派发' }}
          </template>
        </el-table-column>
        <el-table-column label="接单人" width="92" align="center">
          <template #default="scope">
            {{
              scope.row.status === REPAIR_STATUS.PENDING
                ? '—'
                : scope.row.accountName || scope.row.account || '—'
            }}
          </template>
        </el-table-column>
        <el-table-column label="工单状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <el-button type="primary" @click="tipsVisible = false">知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getAllAcceptInfoApi,
  getAllRepairTicketsApi,
  getSameSnTicketsApi,
  acceptTicketApi,
  type RepairAcceptItem,
  type SameSnTicket,
} from '@/api/repair/RepairApi'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { toTimeStamp } from '@/utils/sort'
import { computeColumnWidths, type ColSpec } from '@/views/order/utils/autoColumnWidth'
import { REPAIR_STATUS, REPAIR_STATUS_OPTIONS } from '@/constants/orderEnums'
import { useAuthStore } from '@/stores/auth'
import WorkPage from '@/components/common/WorkPage.vue'

type TakenDetail = RepairAcceptItem

const auth = useAuthStore()
const takenList = ref<TakenDetail[]>([])
const selectedRows = ref<TakenDetail[]>([])
const loading = ref(false)
const snCode = ref('')

// === 自动列宽（Excel 式按内容自适应）===
// 状态 / 时间 / 接单时间 / 操作 是固定列（不参与测量）；其余列按「表头与最长单元格」取宽，
// 由 canvas measureText 估算，故不会出现省略号截断。「参数」作弹性列用 min-width 绑定，
// 宽屏时吸收剩余空间撑满、窄屏时按内容保底，既不换行也不留大片空白。
const COL_SPECS: ColSpec[] = [
  { key: 'headName', label: '工单名称' },
  { key: 'name', label: '名称' },
  { key: 'brand', label: '品牌' },
  { key: 'model', label: '设备型号' },
  { key: 'type', label: '类型' },
  { key: 'spec', label: '参数', flex: true },
  { key: 'sn', label: 'SN码' },
  { key: 'account', label: '使用人' },
]
// 用全量列表（非当前页）测量：翻页/筛选时列宽稳定不跳变
const colWidths = computed(() => computeColumnWidths(takenList.value, COL_SPECS))

// 管理员查看本公司「已接单」的工单（维修中/已完成，后端已排除待接单）；
// 普通用户只看自己已接的单（getAllAcceptInfo 按当前账号返回）。
const fetchTakenDetails = async () => {
  try {
    const api = auth.isAdmin ? getAllRepairTicketsApi : getAllAcceptInfoApi
    const response = await api()
    if (response.code === 200) {
      const list = Array.isArray(response.data) ? response.data : []
      // 按接单时间降序（最新接的单在最上）；未接单（takeTime 为空）的行按登记时间降序沉底，
      // 让最近登记的待接单工单也排前面，避免空接单时间行之间乱序（原来保持后端返回顺序）
      takenList.value = [...list].sort((a, b) => {
        const ta = toTimeStamp(a.takeTime)
        const tb = toTimeStamp(b.takeTime)
        if (ta !== tb) return tb - ta
        return toTimeStamp(b.time) - toTimeStamp(a.time)
      })
    }
  } catch (error) {
    console.error('获取接单列表失败:', error)
  }
}

// === 快速接单：输入 SN → 查同 SN 全部工单 → 无/单条/多条分别处理 ===
// 弹窗选单状态：同 SN 有多条可接工单时弹出，列出全部工单由员工选
const selectVisible = ref(false)
const snTickets = ref<SameSnTicket[]>([])
const acceptingId = ref<number | null>(null)

// 无可接时的分组明细提示：把同 SN 全部工单按「已接过 / 已派发他人 / 已被他人接走」分组列全，
// 让员工看清每一台设备的去向，而不是一句笼统的「你已接过」。
const tipsVisible = ref(false)
const tipsGroups = ref<{ title: string; list: SameSnTicket[] }[]>([])

// 按工单状态 + 负责人账号，把「无可接」的工单分成三类（互斥、覆盖除未派发外的全部情况）
const buildTipsGroups = (tickets: SameSnTicket[]) => {
  const mine = tickets.filter(
    (t) => t.status !== REPAIR_STATUS.PENDING && t.account === auth.account,
  )
  const assigned = tickets.filter(
    (t) => t.status === REPAIR_STATUS.PENDING && !!t.account && t.account !== auth.account,
  )
  const taken = tickets.filter(
    (t) => t.status !== REPAIR_STATUS.PENDING && t.account !== auth.account,
  )
  const groups: { title: string; list: SameSnTicket[] }[] = []
  if (mine.length) groups.push({ title: '你已经接过该设备', list: mine })
  if (assigned.length) groups.push({ title: '该设备已派发给其他人', list: assigned })
  if (taken.length) groups.push({ title: '该设备已被其他人接单', list: taken })
  return groups
}

// 某条工单是否可被当前员工接：待接单 且（未派发 或 派给本人）
const canAccept = (t: SameSnTicket) =>
  t.status === REPAIR_STATUS.PENDING && (!t.account || t.account === auth.account)

// 重查同 SN 工单，刷新弹窗列表（接单失败后反映最新状态）
const refreshTickets = async () => {
  const sn = snCode.value.trim()
  if (!sn) return
  try {
    const res = await getSameSnTicketsApi(sn)
    if (res.code === 200) snTickets.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('查询同SN工单失败:', error)
  }
}

// 按工单 id 精确接单（弹窗里点某条「接单」/ 单条直接接）
const acceptOne = async (ticket: SameSnTicket) => {
  acceptingId.value = ticket.id
  try {
    const res = await acceptTicketApi(ticket.id)
    if (res.code === 200) {
      ElMessage.success('接单成功')
      selectVisible.value = false
      snCode.value = ''
      fetchTakenDetails()
    } else {
      ElMessage.error(res.msg || '接单失败，请稍后重试')
      // 接单失败（如被抢先接走/已派给别人）后刷新弹窗列表，反映最新状态
      refreshTickets()
    }
  } catch {
    ElMessage.error('接单失败，请稍后重试')
  } finally {
    acceptingId.value = null
  }
}

// 快速接单主流程
const handleTakeOrder = async () => {
  const sn = snCode.value.trim()
  if (!sn) {
    ElMessage.warning('请输入SN码')
    return
  }
  try {
    const res = await getSameSnTicketsApi(sn)
    if (res.code !== 200) {
      ElMessage.error(res.msg || '查询失败，请稍后重试')
      return
    }
    const tickets = Array.isArray(res.data) ? res.data : []
    const acceptable = tickets.filter(canAccept)

    // 无工单
    if (tickets.length === 0) {
      ElMessage.error('该SN无对应维修工单')
      return
    }
    // 无可接：弹出分组明细，把「已接过 / 已派发他人 / 已被他人接走」全部列清楚
    if (acceptable.length === 0) {
      tipsGroups.value = buildTipsGroups(tickets)
      tipsVisible.value = true
      return
    }
    // 单条可接：直接接
    if (acceptable.length === 1 && acceptable[0]) {
      await acceptOne(acceptable[0])
      return
    }
    // 多条可接：弹窗列出全部工单供员工选
    snTickets.value = tickets
    selectVisible.value = true
  } catch {
    ElMessage.error('查询失败，请稍后重试')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await fetchTakenDetails()
  } finally {
    loading.value = false
  }
})

const getRowKey = (row: TakenDetail) => String(row.id)

// 查看：跳转到设备维修信息详情页（/repair-device-detail/:id，依赖接单列表补充的 id 字段）
const viewRepair = (row: TakenDetail) => {
  window.open(`/repair-device-detail/${row.id}`, '_blank')
}

import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'

const handleSelectionChange = (val: TakenDetail[]) => {
  selectedRows.value = val
}

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  takenList,
  (item: TakenDetail, form) => {
    if (form.status && item.status !== form.status) return false
    if (form.headName && !item.headName.includes(form.headName)) return false
    if (form.model && !item.model.includes(form.model)) return false
    if (form.sn && !item.sn.includes(form.sn)) return false
    return true
  },
  { status: '', headName: '', model: '', sn: '' },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList
</script>

<style scoped>
/* 快速接单：落在内容白卡顶部，纯行内块，不另起卡片/阴影 */
.quick-order {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-order__label {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-700);
  white-space: nowrap;
}

/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 接单提示分组：每组一个标题 + 小表，组间留白 */
.tips-group {
  margin-bottom: 20px;
}

.tips-group:last-child {
  margin-bottom: 0;
}

.tips-group__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--brand-700);
  margin-bottom: 8px;
}
</style>
