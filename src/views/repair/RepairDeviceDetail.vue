<template>
  <div class="equipment-repair-info-page">
    <div class="page-header">
      <el-button @click="goBack" type="primary" size="large" icon="arrow-left" style="font-size: 16px;">返回</el-button>
      <h2 class="page-title">设备维修信息详情</h2>
    </div>

    <!-- 工单基础信息：仅本卡片在拉取接单信息时显示加载圈 -->
    <el-card v-loading="loading">
      <template #header>
        <span class="section-title">工单基础信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ repairDetail.project_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单名称">{{ acceptInfo?.headName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ acceptInfo?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生产厂家">{{ acceptInfo?.brand || '-' }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ acceptInfo?.model || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ acceptInfo?.type || '-' }}</el-descriptions-item>
        <el-descriptions-item label="参数">{{ acceptInfo?.spec || '-' }}</el-descriptions-item>
        <el-descriptions-item label="设备SN">{{ acceptInfo?.sn || '-' }}</el-descriptions-item>
        <el-descriptions-item label="维修员">{{ acceptInfo?.account || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ acceptInfo?.status || '-' }}</el-descriptions-item>
        <el-descriptions-item label="登记时间">{{ acceptInfo?.time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="接单时间">{{ acceptInfo?.takeTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ repairDetail.done_time }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-loading="loading">
      <template #header>
        <span class="section-title">故障与维修记录</span>
      </template>

      <el-form :model="form" label-width="100px" :inline="false">
        <el-form-item label="故障描述">
          <el-input
            type="textarea"
            v-model="form.description"
            :readonly="isReadOnly"
            :rows="3"
            style="width: 100%"
            aria-label="故障描述"
          />
        </el-form-item>

        <el-form-item label="解决方式">
          <el-input
            type="textarea"
            v-model="form.diagnosis"
            :readonly="isReadOnly"
            :rows="4"
            style="width: 100%"
            aria-label="解决方式"
          />
        </el-form-item>

        <el-form-item label="修复结果">
          <el-input
            type="textarea"
            v-model="form.dispose"
            placeholder="填写修复结果描述"
            :rows="3"
            style="width: 100%"
            :readonly="isReadOnly"
            aria-label="修复结果"
          />
        </el-form-item>

        <el-form-item label="修复实拍照片">
          <RepairImageUploader
            :repair-id="repairId"
            type="repair"
            :images="beforeImages"
            :readonly="isReadOnly"
            size="small"
            @changed="fetchImages"
          />
        </el-form-item>

        <el-form-item label="测试结果">
          <el-input
            type="textarea"
            v-model="form.result"
            placeholder="填写测试结果描述"
            :rows="3"
            style="width: 100%"
            :readonly="isReadOnly"
            aria-label="测试结果"
          />
        </el-form-item>

        <el-form-item label="测试实拍照片">
          <RepairImageUploader
            :repair-id="repairId"
            type="test"
            :images="afterImages"
            :readonly="isReadOnly"
            size="large"
            @changed="fetchImages"
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
import { useDetail, type RepairImageItem } from '@/composables/detail/useDetail'
import {
  getAllAcceptInfoApi,
  getRepairImagesApi,
  type RepairDetailData,
  type RepairAcceptItem,
} from '@/api/repair/RepairApi'
import RepairImageUploader from './components/RepairImageUploader.vue'

const { submitRepair, saveRepair } = useDetail()

const route = useRoute()
const repairId = ref(0)
const acceptInfo = ref<RepairAcceptItem | null>(null)
const submitLoading = ref(false)
const loading = ref(false)

// 维修图片：一次 GET /client/repair/getAcceptImg 返回前后两批图，按 imagePhase 拆分
const beforeImages = ref<RepairImageItem[]>([])
const afterImages = ref<RepairImageItem[]>([])

const fetchImages = async () => {
  if (!repairId.value) return
  try {
    const res = await getRepairImagesApi(repairId.value)
    if (res.code === 200 && Array.isArray(res.data)) {
      beforeImages.value = res.data
        .filter((item) => item.imagePhase === '维修前')
        .map((item) => ({ id: item.id, address: item.url }))
      afterImages.value = res.data
        .filter((item) => item.imagePhase === '维修后')
        .map((item) => ({ id: item.id, address: item.url }))
    } else {
      beforeImages.value = []
      afterImages.value = []
    }
  } catch (error) {
    console.error('获取维修图片失败:', error)
    beforeImages.value = []
    afterImages.value = []
  }
}

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
  description: '',
  diagnosis: '',
  dispose: '',
  result: '',
})

const goBack = () => {
  window.close()
}

const isReadOnly = computed(() => repairDetail.status === '已完成')

// 接单列表信息（GET /client/repair/getAllAcceptInfo），按 id 找到本维修项，用于工单基础信息补充展示
const fetchAcceptInfo = async () => {
  try {
    const res = await getAllAcceptInfoApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      const item = res.data.find((item) => item.id === repairId.value) ?? null
      acceptInfo.value = item
      // 回填故障与维修记录：接口已返回这四个字段，需写入 form 才能显示
      if (item) {
        form.description = item.description ?? ''
        form.diagnosis = item.diagnosis ?? ''
        form.dispose = item.dispose ?? ''
        form.result = item.result ?? ''
      }
    }
  } catch (error) {
    console.error('获取接单信息失败:', error)
  }
}

onMounted(async () => {
  const id = route.params.id
  if (typeof id === 'string') {
    repairId.value = parseInt(id, 10)
  }
  // 工单基础信息 + 故障与维修记录 两张卡片共用同一加载圈：接单信息与前后图都拉完才关闭
  loading.value = true
  try {
    await Promise.all([fetchAcceptInfo(), fetchImages()])
  } finally {
    loading.value = false
  }
})

// 保存修改
const handleSubmit = async () => {
  if (!form.dispose.trim()) {
    ElMessage.warning('请填写修复结果')
    return
  }
  if (!form.result.trim()) {
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
          description: form.description,
          diagnosis: form.diagnosis,
          dispose: form.dispose,
          result: form.result,
        })
        if (success) {
          ElMessage.success('工单提交成功')
          await fetchImages()
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
          await fetchImages()
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
  /* 与 WorkView .work 一致的品牌蓝内容场：白卡直接浮于其上，形成"蓝场白卡"层次。
     min-height: 100vh 让裸详情页（无侧栏/顶栏外壳）铺满视口，而非贴边一小块。 */
  min-height: 100vh;
  box-sizing: border-box;
  background-image: var(--brand-content-bg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  /* 去掉原 border-bottom: 1px solid black（项目约定：白卡靠蓝底对比区分，不加黑色分隔线）。
     返回按钮与标题左对齐成一组，间距 12px。 */
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--brand-700, #1836b0);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--brand-700, #1836b0);
}

/* 白卡统一：去掉 el-card 默认阴影与灰边，圆角对齐 WorkPage 内容卡（10px），浮于蓝底。
   overflow: hidden 让 header/body 的圆角裁切干净，不溢出。 */
.equipment-repair-info-page :deep(.el-card) {
  border: none;
  border-radius: 10px;
  box-shadow: none;
  background: #ffffff;
  overflow: hidden;
}

.equipment-repair-info-page :deep(.el-card__header) {
  border-bottom: none;
  padding: 16px 18px;
}

.equipment-repair-info-page :deep(.el-card__body) {
  padding: 16px 18px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>
