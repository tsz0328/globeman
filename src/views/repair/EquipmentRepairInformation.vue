<template>
  <div class="equipment-repair-info-page">
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
          <div class="image-preview-list">
            <div class="image-wrapper" v-for="(img, index) in repairImages" :key="img.id">
              <el-image
                :src="getImageUrl(img.address)"
                :preview-src-list="repairImages.map((img) => getImageUrl(img.address))"
                class="preview-image"
                fit="cover"
              />
              <div
                class="image-delete-btn"
                @click="handleDeleteRepairImage(index)"
              :style="{
                pointerEvents: isReadOnly ? 'none' : 'auto',
                opacity: isReadOnly ? 0 : 1,
              }"
              >
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <el-upload
            ref="repairUploadRef"
            action="."
            list-type="picture-card"
            :on-change="
              (file: UploadFile, fileList: UploadFile[]) =>
                handleFileChange(file, fileList, 'repair')
            "
            :on-remove="
              (file: UploadFile, fileList: UploadFile[]) =>
                handleFileRemove(file, fileList, 'repair')
            "
            :file-list="repairFileList"
            accept="image/*"
            multiple
            :auto-upload="false"
            :disabled="isReadOnly"
          >
            <template #default>
              <el-icon><Plus /></el-icon>
              <div>上传图片</div>
            </template>
          </el-upload>
          <el-button
            type="primary"
            size="small"
            style="margin-top: 10px"
            @click="submitRepairImages"
            :disabled="repairFiles.length === 0 || isReadOnly"
          >
            上传图片
          </el-button>
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
          <div class="image-preview-list">
            <div class="image-wrapper" v-for="(img, index) in testImages" :key="img.id">
              <el-image
                :src="getImageUrl(img.address)"
                :preview-src-list="testImages.map((img) => getImageUrl(img.address))"
                class="preview-image"
                fit="cover"
              />
              <div
                class="image-delete-btn"
                @click="handleDeleteTestImage(index)"
              :style="{
                pointerEvents: isReadOnly ? 'none' : 'auto',
                opacity: isReadOnly ? 0 : 1,
              }"
              >
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <el-upload
            ref="testUploadRef"
            action="."
            list-type="picture-card"
            :on-change="
              (file: UploadFile, fileList: UploadFile[]) => handleFileChange(file, fileList, 'test')
            "
            :on-remove="
              (file: UploadFile, fileList: UploadFile[]) => handleFileRemove(file, fileList, 'test')
            "
            :file-list="testFileList"
            accept="image/*"
            multiple
            :auto-upload="false"
            :disabled="isReadOnly"
          >
            <template #default>
              <el-icon><Plus /></el-icon>
              <div>上传图片</div>
            </template>
          </el-upload>
          <el-button
            type="primary"
            size="large"
            style="margin-top: 10px"
            @click="submitTestImages"
            :disabled="testFiles.length === 0 || isReadOnly"
          >
            上传图片
          </el-button>
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
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { useDetail, type RepairImageItem } from '@/composables/detail/useDetail'
import type { RepairDetailData } from '@/api/repair/RepairApi'
import { formatDateTime } from '@/utils/sort'
import { checkImageSize } from '@/utils/imageUpload'

const {
  getRepairById,
  getRepairImages,
  uploadRepairImages,
  deleteRepairImage,
  getTestImages,
  uploadTestImages,
  deleteTestImage,
  submitRepair,
  saveRepair,
} = useDetail()

const route = useRoute()
const repairId = ref(0)
const submitLoading = ref(false)

const repairUploadRef = ref()
const testUploadRef = ref()

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

const repairImages = ref<RepairImageItem[]>([])
const testImages = ref<RepairImageItem[]>([])
const repairFileList = ref<UploadFile[]>([])
const testFileList = ref<UploadFile[]>([])
const repairFiles = ref<File[]>([])
const testFiles = ref<File[]>([])

const goBack = () => {
  window.close()
}

// 获取图片的完整 URL
const getImageUrl = (imgPath: string): string => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath
  }
  if (imgPath.startsWith('/')) {
    return `/api${imgPath}`
  }
  return `/api/${imgPath}`
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

//获取维修/测试图片
const fetchRepairDetails = async () => {
  repairImages.value = await getRepairImages(repairId.value)
  testImages.value = await getTestImages(repairId.value)
}

onMounted(() => {
  const id = route.params.id
  if (typeof id === 'string') {
    repairId.value = parseInt(id, 10)
  }
  fetchRepairById()
  fetchRepairDetails()
})

const handleFileChange = (file: UploadFile, fileList: UploadFile[], type: string) => {
  if (file.status === 'ready' && file.raw) {
    if (!checkImageSize(file)) {
      if (type === 'repair') {
        repairUploadRef.value?.handleRemove(file)
      } else {
        testUploadRef.value?.handleRemove(file)
      }
      return
    }
    if (type === 'repair') {
      repairFiles.value.push(file.raw as File)
    } else {
      testFiles.value.push(file.raw as File)
    }
  }
}

// 处理文件移除
const handleFileRemove = (file: UploadFile, fileList: UploadFile[], type: string) => {
  const rawFile = file.raw as File | undefined
  if (type === 'repair') {
    repairFiles.value = repairFiles.value.filter((f) => f !== rawFile)
  } else {
    testFiles.value = testFiles.value.filter((f) => f !== rawFile)
  }
}

const handleDeleteRepairImage = async (index: number) => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const imgItem = repairImages.value[index]
      if (!imgItem) return
      const success = await deleteRepairImage(imgItem.id)
      if (success) {
        repairImages.value.splice(index, 1)
        ElMessage.success('删除成功')
      } else {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const handleDeleteTestImage = async (index: number) => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const imgItem = testImages.value[index]
      if (!imgItem) return
      const success = await deleteTestImage(imgItem.id)
      if (success) {
        testImages.value.splice(index, 1)
        ElMessage.success('删除成功')
      } else {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const submitRepairImages = async () => {
  if (repairFiles.value.length === 0) {
    ElMessage.warning('请选择图片')
    return
  }
  try {
    const success = await uploadRepairImages(repairFiles.value, repairId.value)
    if (success) {
      ElMessage.success('图片上传成功')
      await fetchRepairDetails()
      repairFiles.value = []
      repairFileList.value = []
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch {
    ElMessage.error('图片上传失败')
  }
}

const submitTestImages = async () => {
  if (testFiles.value.length === 0) {
    ElMessage.warning('请选择图片')
    return
  }
  try {
    const success = await uploadTestImages(testFiles.value, repairId.value)
    if (success) {
      ElMessage.success('图片上传成功')
      await fetchRepairDetails()
      testFiles.value = []
      testFileList.value = []
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch {
    ElMessage.error('图片上传失败')
  }
}

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
          await fetchRepairDetails()
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
          // 重新拉取最新工单状态，使表单立即进入只读、按钮立即消失（无需刷新页面）
          await fetchRepairById()
          await fetchRepairDetails()
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

:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: pointer;
}

.image-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-delete-btn {
  opacity: 1;
}
</style>
