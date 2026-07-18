<template>
  <div class="equipment-repair-info-page">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="page-title">设备维修信息详情</h2>
    </div>

    <el-card>
      <template #header>
        <span class="section-title">工单基础信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">智能制造产线升级项目</el-descriptions-item>
        <el-descriptions-item label="订单名称">2026-SB-0718-001维修工单</el-descriptions-item>
        <el-descriptions-item label="设备SN">SN2026051200896</el-descriptions-item>
        <el-descriptions-item label="维修员">张工</el-descriptions-item>
        <el-descriptions-item label="设备类型">工业视觉检测相机</el-descriptions-item>
        <el-descriptions-item label="设备型号">VS-500HD Pro</el-descriptions-item>
        <el-descriptions-item label="设备参数" :span="2"
          >500万像素、全局快门、12V直流供电、IP65防护、接口GigE</el-descriptions-item
        >
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
            :model-value="form.faultReason"
            :readonly="true"
            :rows="3"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="处理方式">
          <el-input
            type="textarea"
            :model-value="form.handleMethod"
            :readonly="true"
            :rows="4"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="修复结果">
          <el-input
            type="textarea"
            v-model="form.repairResult"
            placeholder="填写修复结果描述"
            :rows="3"
            style="width: 100%"
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
              <div class="image-delete-btn" @click="handleDeleteRepairImage(index)">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <el-upload
            ref="repairUploadRef"
            action="."
            list-type="picture-card"
            :on-change="(file: any, fileList: any[]) => handleFileChange(file, fileList, 'repair')"
            :on-remove="(file: any, fileList: any[]) => handleFileRemove(file, fileList, 'repair')"
            :file-list="repairFileList"
            accept="image/*"
            multiple
            :auto-upload="false"
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
            :disabled="repairFiles.length === 0"
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
              <div class="image-delete-btn" @click="handleDeleteTestImage(index)">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <el-upload
            ref="testUploadRef"
            action="."
            list-type="picture-card"
            :on-change="(file: any, fileList: any[]) => handleFileChange(file, fileList, 'test')"
            :on-remove="(file: any, fileList: any[]) => handleFileRemove(file, fileList, 'test')"
            :file-list="testFileList"
            accept="image/*"
            multiple
            :auto-upload="false"
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
            @click="submitTestImages"
            :disabled="testFiles.length === 0"
          >
            上传图片
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadRepairImagesApi, getRepairImagesApi, deleteRepairImageApi } from '@/api/DetailApi'

const route = useRoute()
const router = useRouter()
const repairId = ref(0)

const repairUploadRef = ref()
const testUploadRef = ref()

const form = reactive({
  faultReason:
    '设备供电接口氧化接触不良，成像画面持续出现横纹噪点，设备频繁自动断开连接，无法稳定采集图像数据。',
  handleMethod:
    '1. 拆卸设备外壳，清理供电接口氧化层；\n2. 更换全新镀金供电端子；\n3. 重新固定内部排线，加固接口卡扣；\n4. 除尘并重新组装整机。',
  repairResult: '供电接触恢复正常，设备不再自动断连，成像噪点完全消除，硬件故障已修复。',
  testResult:
    '连续72小时满负载循环测试，图像采集稳定无异常，各项参数指标符合出厂标准，设备可正常交付使用。',
})

interface ImageItem {
  id: number
  address: string
}

const repairImages = ref<ImageItem[]>([])
const testImages = ref<ImageItem[]>([])
const repairFileList = ref<any[]>([])
const testFileList = ref<any[]>([])
const repairFiles = ref<File[]>([])
const testFiles = ref<File[]>([])

const goBack = () => {
  router.back()
}

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

const fetchRepairDetails = async () => {
  try {
    const res = await getRepairImagesApi(repairId.value)
    if (res.code === 200 && res.data) {
      repairImages.value = Object.values(res.data).map((item) => ({
        id: item.id,
        address: item.address,
      }))
      console.log('修复实拍照片:', repairImages.value)
    }
  } catch (error) {
    console.error('获取维修详情失败:', error)
  }
}

onMounted(() => {
  const id = route.params.id
  if (typeof id === 'string') {
    repairId.value = parseInt(id, 10)
    console.log('设备维修信息ID:', repairId.value)
  }
  fetchRepairDetails()
})

const handleFileChange = (file: any, fileList: any[], type: string) => {
  if (file.status === 'ready') {
    if (type === 'repair') {
      repairFiles.value.push(file.raw)
    } else {
      testFiles.value.push(file.raw)
    }
  }
}

const handleFileRemove = (file: any, fileList: any[], type: string) => {
  const rawFile = file.raw
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
      try {
        const res = await deleteRepairImageApi(imgItem.id)
        if (res.code === 200) {
          repairImages.value.splice(index, 1)
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error) {
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
      try {
        const res = await deleteRepairImageApi(imgItem.id)
        if (res.code === 200) {
          testImages.value.splice(index, 1)
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error) {
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
    const res = await uploadRepairImagesApi(repairFiles.value, repairId.value)
    if (res.code === 200) {
      ElMessage.success('图片上传成功')
      await fetchRepairDetails()
      repairFiles.value = []
      repairFileList.value = []
    } else {
      ElMessage.error(res.msg || '图片上传失败')
    }
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
}

const submitTestImages = async () => {
  if (testFiles.value.length === 0) {
    ElMessage.warning('请选择图片')
    return
  }
  try {
    const res = await uploadRepairImagesApi(testFiles.value, repairId.value)
    if (res.code === 200) {
      ElMessage.success('图片上传成功')
      await fetchRepairDetails()
      testFiles.value = []
      testFileList.value = []
    } else {
      ElMessage.error(res.msg || '图片上传失败')
    }
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
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
