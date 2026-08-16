<template>
  <div class="equipment-repair-info-page" v-loading="loading">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="page-title">设备维修信息详情</h2>
    </div>

    <!-- 工单基础信息 -->
    <el-card>
      <template #header>
        <span class="section-title">工单基础信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{
          repairDetail.project_name
        }}</el-descriptions-item>
        <el-descriptions-item label="订单名称">{{ repairDetail.order_name }}</el-descriptions-item>
        <el-descriptions-item label="设备SN">{{ repairDetail.sn }}</el-descriptions-item>
        <el-descriptions-item label="维修员">{{ repairDetail.repairman }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ repairDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ repairDetail.model }}</el-descriptions-item>
        <el-descriptions-item label="生产厂家">{{
          repairDetail.manufacturer
        }}</el-descriptions-item>
        <el-descriptions-item label="所属公司">{{ repairDetail.company }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ repairDetail.status }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ repairDetail.time }}</el-descriptions-item>
        <el-descriptions-item label="接单时间">{{ repairDetail.take_time }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ repairDetail.done_time }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card>
      <template #header>
        <span class="section-title">故障与维修记录</span>
      </template>

      <el-form :model="form" label-width="100px" :inline="false">
        <el-form-item label="故障原因">
          <el-input
            type="textarea"
            v-model="form.faultReason"
            :readonly="isReadOnly"
            :rows="3"
            style="width: 100%"
            aria-label="故障原因"
          />
        </el-form-item>

        <el-form-item label="解决方式">
          <el-input
            type="textarea"
            v-model="form.handleMethod"
            :readonly="isReadOnly"
            :rows="4"
            style="width: 100%"
            aria-label="解决方式"
          />
        </el-form-item>

        <el-form-item label="修复结果">
          <el-input
            type="textarea"
            v-model="form.repairResult"
            placeholder="填写修复结果描述"
            :rows="3"
            style="width: 100%"
            :readonly="isReadOnly"
            aria-label="修复结果"
          />
        </el-form-item>

        <el-form-item label="修复实拍照片">
          <RepairImageUploader
            ref="repairUploaderRef"
            :repair-id="repairId"
            type="repair"
            :readonly="isReadOnly"
            size="small"
          />
        </el-form-item>

        <el-form-item label="测试结果">
          <el-input
            type="textarea"
            v-model="form.testResult"
            placeholder="填写测试结果描述"
            :rows="3"
            style="width: 100%"
            :readonly="isReadOnly"
            aria-label="测试结果"
          />
        </el-form-item>

        <el-form-item label="测试实拍照片">
          <RepairImageUploader
            ref="testUploaderRef"
            :repair-id="repairId"
            type="test"
            :readonly="isReadOnly"
            size="large"
          />
        </el-form-item>

        <el-form-item style="margin-top: 20px" v-if="!isReadOnly">
          <el-button type="primary" size="large" @click="handleSubmit" :loading="submitLoading">
            保存修改
          </el-button>
          <el-button type="primary" size="large" @click="submitWorkOrder"> 提交工单 </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import type { RepairDetailData } from '@/api/repair/RepairApi'
import { formatDateTime } from '@/utils/sort'
import RepairImageUploader from './RepairImageUploader.vue'

const { getRepairById, submitRepair, saveRepair } = useDetail()

const route = useRoute()
const repairId = ref(0)
const submitLoading = ref(false)
const loading = ref(false)

const repairUploaderRef = ref<InstanceType<typeof RepairImageUploader>>()
const testUploaderRef = ref<InstanceType<typeof RepairImageUploader>>()

const repairDetail = reactive<RepairDetailData>({
  repairman: '',
  reason: '',
  test: '',
  repairman_account: '',
  project_name: '',
  manufacturer: '',
  order_name: '',
  result: '',
  details_id: 0,
  project_id: '',
  solve: '',
  name: '',
  company: '',
  model: '',
  id: 0,
  sn: '',
  time: '',
  take_time: '',
  order_id: '',
  status: '',
  done_time: '',
})

const form = reactive({
  faultReason: '',
  handleMethod: '',
  repairResult: '',
  testResult: '',
})

const goBack = () => {
  window.close()
}

const isReadOnly = computed(() => repairDetail.status === '已完成')

// 获取详情
const fetchRepairById = async () => {
  const data = await getRepairById(repairId.value)
  if (data) {
    Object.assign(repairDetail, data)
    // 时间字段统一格式化为 "YYYY-MM-DD HH:mm:ss"（后端可能返回 ISO 带 T 格式）
    repairDetail.time = formatDateTime(data.time)
    repairDetail.take_time = formatDateTime(data.take_time)
    repairDetail.done_time = formatDateTime(data.done_time)
    form.faultReason = data.reason
    form.handleMethod = data.solve
    form.repairResult = data.result
    form.testResult = data.test
  }
}

onMounted(async () => {
  const id = route.params.id
  if (typeof id === 'string') {
    repairId.value = parseInt(id, 10)
  }
  loading.value = true
  try {
    // 先拉维修记录主数据 /client/repair/getById
    await fetchRepairById()
  } finally {
    loading.value = false
  }
})

// 保存修改
const handleSubmit = async () => {
  if (!form.repairResult.trim()) {
    ElMessage.warning('请填写修复结果')
    return
  }
  if (!form.testResult.trim()) {
    ElMessage.warning('请填写测试结果')
    return
  }
  ElMessageBox.confirm('确定要提交工单吗？提交后将无法修改', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      submitLoading.value = true
      try {
        const success = await submitRepair({
          id: repairId.value,
          reason: form.faultReason,
          solve: form.handleMethod,
          result: form.repairResult,
          test: form.testResult,
        })
        if (success) {
          ElMessage.success('工单提交成功')
          // 重新拉取最新工单状态，使表单立即进入只读、按钮立即消失（无需刷新页面）
          await fetchRepairById()
          repairUploaderRef.value?.refresh()
          testUploaderRef.value?.refresh()
        } else {
          ElMessage.error('工单提交失败')
        }
      } catch {
        ElMessage.error('工单提交失败')
      } finally {
        submitLoading.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消提交')
    })
}

// 提交工单
const submitWorkOrder = async () => {
  ElMessageBox.confirm('确定要提交工单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const success = await saveRepair(repairId.value)
        if (success) {
          ElMessage.success('提交成功')
          await fetchRepairById()
          repairUploaderRef.value?.refresh()
          testUploaderRef.value?.refresh()
        } else {
          ElMessage.error('提交失败')
        }
      } catch {
        ElMessage.error('提交失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消提交')
    })
}
</script>

<style scoped>
.equipment-repair-info-page {
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
  gap: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: auto;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
