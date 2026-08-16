<template>
  <el-table :data="rows" border size="small" class="sn-sub-table">
    <el-table-column label="序号" type="index" width="50" align="center" />
    <el-table-column label="SN码" width="220">
      <template #default="snScope">
        <span v-if="isRepair">{{ snScope.row.sn }}</span>
        <el-input v-else v-model="snScope.row.sn" size="small"
          :placeholder="snScope.row.isBlank ? '输入SN，失焦提交新增' : (snScope.row.committed ? '' : '编辑SN，回车提交')" aria-label="SN码"
          :readonly="!!snScope.row.committed || (!snScope.row.isBlank && (snScope.row.status === '维修中' || snScope.row.status === '待维修'))"
          @keyup.enter.prevent="emit('blur', snScope.row)" @blur="emit('blur', snScope.row)" />
      </template>
    </el-table-column>
    <el-table-column label="状态" width="90" align="center">
      <template #default="snScope">
        <el-tag :type="getSnStatusType(snScope.row.status)" size="small">
          {{ snScope.row.status || '---' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { SnRow } from './SnRow'

const props = defineProps<{
  rows: SnRow[]
  isRepair: boolean
}>()

const emit = defineEmits<{
  (e: 'blur', row: SnRow): void
}>()

// SN 状态标签颜色
const getSnStatusType = (
  status: string,
): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  if (status === '待维修') return 'primary'
  if (status === '维修中') return 'warning'
  return 'info'
}
</script>

<style scoped>
.sn-sub-table {
  margin: 4px 0;
}
</style>
