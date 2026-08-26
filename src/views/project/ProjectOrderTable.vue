<script setup lang="ts">
import { getStatusTagType as getStatusType, isOrderLocked } from '@/composables/common/useOrderStatus'
import type { Order } from '@/composables/order/useOrder'

defineProps<{
  orders: Order[]
}>()

const emit = defineEmits<{
  (e: 'view', id: string): void
  (e: 'detail', row: Order): void
  (e: 'submit', row: Order): void
  (e: 'delete', row: Order): void
  (e: 'selection-change', rows: Order[]): void
}>()

const getRowKey = (row: Order) => row.id

// 已锁定（已确认）的订单不允许勾选
const isRowSelectable = (row: Order) => {
  return !isOrderLocked(row.status)
}
</script>

<template>
  <el-table
    :data="orders"
    border
    style="width: 100%"
    @selection-change="(val: Order[]) => emit('selection-change', val)"
    :row-key="getRowKey"
  >
    <el-table-column type="selection" width="39" :selectable="isRowSelectable" />
    <el-table-column prop="name" label="订单名称" />
    <el-table-column prop="type" label="订单类型" width="81" />
    <el-table-column prop="customer" label="客户" />
    <el-table-column prop="contact" label="客户联系人" />
    <el-table-column prop="contactPhone" label="联系人电话" width="111" />
    <el-table-column prop="leaderAccount" label="负责人" />
    <el-table-column prop="province" label="执行省份" />
    <el-table-column prop="city" label="执行市" />
    <el-table-column prop="district" label="执行区" />
    <el-table-column prop="address" label="送修地址" />
    <el-table-column prop="status" label="状态" width="81">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">
          {{ scope.row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" width="160" />
    <el-table-column label="操作" width="300" fixed="right">
      <template #default="scope">
        <div class="action-buttons">
          <el-button type="primary" size="small" @click="emit('view', scope.row.id)">查看</el-button>
          <el-button size="small" @click="emit('detail', scope.row)">详情</el-button>
          <el-button
            type="success"
            size="small"
            @click="emit('submit', scope.row)"
            :disabled="scope.row.status === '已确认'"
          >提交</el-button>
          <el-button
            type="danger"
            size="small"
            @click="emit('delete', scope.row)"
            :disabled="scope.row.status === '已确认'"
          >删除</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.action-buttons {
  display: flex;
}
</style>
