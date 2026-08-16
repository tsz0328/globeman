<script setup lang="ts">
import { computed } from 'vue'
import type { OrderManager, OrderCustomer } from '@/api/order/OrderApi'

// 与父组件 useTableQuery 的 filterForm 字段一一对应（父侧为 Record<string, unknown>，此处做编译期定型）
interface ProjectOrderFilterForm {
  status: string
  type: string
  orderName: string
  leaderAccount: string
  customer: string
  createTime: string | null | Date
}

const props = defineProps<{
  filterForm: Record<string, unknown>
  managers: OrderManager[]
  customers: OrderCustomer[]
}>()

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
}>()

// 把父组件下传的 Record<string, unknown> 定型为具体结构，供 v-model 绑定（运行时仍为同一对象引用，直接写回父表单）
const f = computed(() => props.filterForm as unknown as ProjectOrderFilterForm)
</script>

<template>
  <div class="filter-section">
    <div class="filter-item">
      <label for="orderName">订单名称：</label>
      <el-input
        id="orderName"
        aria-label="订单名称"
        v-model="f.orderName"
        placeholder="请输入订单名称"
        style="width: 150px"
      />
    </div>

    <div class="filter-item">
      <label for="orderType">订单类型：</label>
      <el-select
        filterable
        id="orderType"
        aria-label="订单类型"
        v-model="f.type"
        placeholder="全部类型"
        style="width: 150px"
      >
        <el-option label="全部类型" value="" />
        <el-option label="销售订单" value="销售" />
        <el-option label="采购订单" value="采购" />
        <el-option label="维修订单" value="维修" />
      </el-select>
    </div>

    <div class="filter-item">
      <label for="orderStatus">订单状态：</label>
      <el-select
        filterable
        id="orderStatus"
        aria-label="订单状态"
        v-model="f.status"
        placeholder="全部状态"
        style="width: 150px"
      >
        <el-option label="全部状态" value="" />
        <el-option label="编辑中" value="编辑中" />
        <el-option label="已确认" value="已确认" />
      </el-select>
    </div>

    <div class="filter-item">
      <label for="leader">负责人：</label>
      <el-select
        filterable
        id="leader"
        aria-label="负责人"
        v-model="f.leaderAccount"
        placeholder="全部负责人"
        style="width: 150px"
      >
        <el-option label="全部负责人" value="" />
        <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
      </el-select>
    </div>

    <div class="filter-item">
      <label for="customer">客户：</label>
      <el-select
        filterable
        id="customer"
        aria-label="客户"
        v-model="f.customer"
        placeholder="全部客户"
        style="width: 200px"
      >
        <el-option label="全部客户" value="" />
        <el-option
          v-for="customer in customers"
          :key="customer.name"
          :label="customer.name"
          :value="customer.name"
        />
      </el-select>
    </div>

    <div class="filter-item">
      <label for="createTime">创建时间:</label>
      <el-date-picker
        id="createTime"
        aria-label="创建时间"
        v-model="f.createTime"
        type="date"
        placeholder="选择日期"
        style="width: 150px"
      />
      <el-button type="primary" @click="emit('search')">查询</el-button>
      <el-button @click="emit('reset')">重置</el-button>
    </div>
  </div>
</template>

<style scoped>
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
</style>
