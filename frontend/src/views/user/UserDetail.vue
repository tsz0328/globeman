<template>
  <div class="user-detail-page">
    <div class="page-header">
      <el-button @click="goBack" type="primary" size="large" icon="arrow-left" style="font-size: 16px;">返回</el-button>
      <h2 class="title">用户详情</h2>
    </div>

    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="section-title">用户信息</span>
          <el-button type="primary" :loading="saving" :disabled="!info" @click="handleSave">保存</el-button>
        </div>
      </template>

      <el-form v-if="info" :model="form" label-width="90px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="账号">
              <el-input v-model="form.account" placeholder="请输入账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="form.sex" placeholder="请选择" clearable style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-tag v-if="info.status === 0" type="danger">禁用</el-tag>
              <el-tag v-else-if="info.status === 1" type="success">正常</el-tag>
              <el-tag v-else type="info">未知</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司">
              <el-select v-model="form.company" filterable placeholder="请选择公司" style="width: 100%">
                <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门">
              <el-select v-model="form.department" filterable clearable placeholder="请选择部门" style="width: 100%">
                <el-option v-for="name in departmentOptions" :key="name" :label="name" :value="name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.role" filterable placeholder="请选择角色" style="width: 100%">
                <el-option v-for="r in roleList" :key="r.role" :label="r.name" :value="r.role" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="form.card" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker v-model="form.birth" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学历">
              <el-input v-model="form.education" placeholder="请输入学历" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人">
              <el-input v-model="form.emergency" placeholder="请输入紧急联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册时间">
              <el-input :model-value="info.time || '—'" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-empty v-else description="未找到该用户" />
    </el-card>

    <el-card>
      <template #header>
        <span class="section-title">证书图片</span>
      </template>

      <div class="image-preview-list" v-if="certificateImages.length">
        <div class="image-wrapper" v-for="(img, index) in certificateImages" :key="img.id ?? `${img.address}-${index}`">
          <el-image :src="getImageUrl(img.address || img.url || img.image || img.img || '')"
            :preview-src-list="certificatePreviewList" class="preview-image" fit="contain" />
          <div class="image-delete-btn" @click="handleDeleteCertificateImage(index)">
            <el-icon>
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无证书图片" />

      <el-upload ref="certificateUploadRef" action="." list-type="picture-card" :on-change="handleCertificateFileChange"
        :on-remove="handleCertificateFileRemove" :file-list="certificateFileList" accept="image/*" multiple
        :auto-upload="false">
        <template #default>
          <el-icon>
            <Plus />
          </el-icon>
          <div>上传图片</div>
        </template>
      </el-upload>

      <el-button type="primary" size="large" style="margin-top: 10px" @click="submitCertificateImages"
        :disabled="certificateFiles.length === 0">
        上传图片
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { checkImageSize } from '@/utils/imageUpload'
import {
  getUserApi,
  getInfoRoleApi,
  updateUserInfoApi,
  getCertificateImagesApi,
  uploadCertificateImagesApi,
  deleteCertificateImageApi,
  type CertificateImageItem,
  type UserInfo,
  type UserUpdateData,
  type RoleData,
} from '@/api/admin/UserApi'
import { getInfoCompanyApi } from '@/api/admin/CompanyApi'
import { getDepartmentInfoApi } from '@/api/admin/DepartmentApi'

const route = useRoute()
const info = ref<UserInfo | null>(null)
const loading = ref(false)
const saving = ref(false)
const certificateUploadRef = ref()
const certificateImages = ref<CertificateImageItem[]>([])
const certificateFileList = ref<UploadFile[]>([])
const certificateFiles = ref<File[]>([])
const account = ref('')

// === 可编辑表单（打开即可编辑，除状态/注册时间外均改）===
const form = ref({
  account: '',
  name: '',
  sex: '',
  company: '',
  department: '',
  role: '', // 角色 code
  phone: '',
  email: '',
  card: '',
  address: '',
  birth: '',
  education: '',
  emergency: '',
})

// === 下拉数据 ===
const roleList = ref<RoleData[]>([])
const companyNames = ref<string[]>([])
const departmentNames = ref<string[]>([])

// 部门选项：后端按当前登录人公司返回，可能不含被查看用户的部门，补上当前值保证可显示
const departmentOptions = computed(() => {
  const list = [...departmentNames.value]
  if (form.value.department && !list.includes(form.value.department)) {
    list.push(form.value.department)
  }
  return list
})

// 关闭当前标签页（本页由 window.open 在新标签打开）
const goBack = () => {
  if (window.opener) {
    window.close()
  } else {
    window.history.back()
  }
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

// 证书图片预览列表（computed 缓存，避免每次渲染重新 map）
const certificatePreviewList = computed(() =>
  certificateImages.value.map((item) => getImageUrl(item.address || item.url || item.image || item.img || '')),
)

// 获取证书图片列表
const fetchCertificateImages = async (userAccount: string) => {
  try {
    const res = await getCertificateImagesApi(userAccount)
    if (res.code === 200) {
      certificateImages.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (error) {
    console.error('获取证书图片失败:', error)
  }
}

// 用后端返回的用户信息填充表单（role 优先用 roleCode，兼容旧数据回退中文名反查）
const fillForm = (u: UserInfo) => {
  form.value = {
    account: u.account ?? '',
    name: u.name ?? '',
    sex: u.sex ?? '',
    company: u.company ?? '',
    department: u.department ?? '',
    role: u.roleCode ?? '',
    phone: u.phone ?? '',
    email: u.email ?? '',
    card: u.card ?? '',
    address: u.address ?? '',
    birth: u.birth ?? '',
    education: u.education ?? '',
    emergency: u.emergency ?? '',
  }
  // 后端未返回 roleCode 时，用中文名反查角色 code
  if (!form.value.role && u.role) {
    const matched = roleList.value.find((r) => r.name === u.role)
    if (matched) form.value.role = matched.role
  }
}

const nullIfEmpty = (v: string | null | undefined): string | null => {
  if (!v) return null
  const t = v.trim()
  return t === '' ? null : t
}

// 保存：账号可改，故 originalAccount 用修改前账号定位；role 传 code
const handleSave = async () => {
  const trimmedAccount = form.value.account.trim()
  if (!trimmedAccount) {
    ElMessage.warning('账号不能为空')
    return
  }
  if (!form.value.name.trim()) {
    ElMessage.warning('姓名不能为空')
    return
  }
  if (!form.value.company) {
    ElMessage.warning('公司不能为空')
    return
  }
  if (!form.value.role) {
    ElMessage.warning('角色不能为空')
    return
  }

  saving.value = true
  try {
    const data: UserUpdateData = {
      originalAccount: account.value,
      account: trimmedAccount,
      name: form.value.name.trim(),
      company: form.value.company,
      department: nullIfEmpty(form.value.department),
      role: form.value.role,
      sex: nullIfEmpty(form.value.sex),
      phone: nullIfEmpty(form.value.phone),
      email: nullIfEmpty(form.value.email),
      card: nullIfEmpty(form.value.card),
      address: nullIfEmpty(form.value.address),
      birth: form.value.birth || null,
      education: nullIfEmpty(form.value.education),
      emergency: nullIfEmpty(form.value.emergency),
    }
    const res = await updateUserInfoApi(data)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      account.value = trimmedAccount
      await refreshUser(trimmedAccount)
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 保存后刷新（账号可能已变，用新账号重新拉取用户信息与证书）
const refreshUser = async (acc: string) => {
  try {
    const res = await getUserApi(acc)
    if (res.code === 200 && res.data) {
      info.value = res.data
      fillForm(res.data)
    }
    await fetchCertificateImages(acc)
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}

// 处理证书图片上传
const handleCertificateFileChange = (file: UploadFile) => {
  if (file.status === 'ready' && file.raw) {
    if (!checkImageSize(file)) {
      certificateUploadRef.value?.handleRemove(file)
      return
    }
    certificateFiles.value.push(file.raw as File)
  }
}

// 处理证书图片移除
const handleCertificateFileRemove = (file: UploadFile) => {
  const rawFile = file.raw as File | undefined
  certificateFiles.value = certificateFiles.value.filter((item) => item !== rawFile)
}

// 删除证书图片
const handleDeleteCertificateImage = async (index: number) => {
  ElMessageBox.confirm('确定要删除这张证书图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const imgItem = certificateImages.value[index]
      if (!imgItem) return
      // 优先用图片路径 url，没有则从其他字段取
      const imageUrl = imgItem.url || imgItem.address || imgItem.image || imgItem.img || imgItem.id || ''
      if (!imageUrl) {
        ElMessage.error('当前图片缺少标识，无法删除')
        return
      }
      try {
        const res = await deleteCertificateImageApi(imageUrl)
        if (res.code === 200) {
          certificateImages.value.splice(index, 1)
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除证书图片失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交证书图片上传
const submitCertificateImages = async () => {
  if (!account.value) {
    ElMessage.warning('缺少用户账号信息')
    return
  }
  if (certificateFiles.value.length === 0) {
    ElMessage.warning('请选择图片')
    return
  }

  try {
    const res = await uploadCertificateImagesApi(certificateFiles.value, account.value)
    if (res.code === 200) {
      ElMessage.success('证书图片上传成功')
      await fetchCertificateImages(account.value)
      certificateFiles.value = []
      certificateFileList.value = []
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传证书图片失败:', error)
    ElMessage.error('上传失败')
  }
}

// 页面加载时获取用户信息、下拉数据与证书图片
onMounted(async () => {
  const accountParam = route.params.id
  const userAccount = typeof accountParam === 'string' ? decodeURIComponent(accountParam) : ''
  if (!userAccount) {
    return
  }
  account.value = userAccount
  loading.value = true
  try {
    const [userRes, rolesRes, companyRes, deptRes] = await Promise.all([
      getUserApi(userAccount),
      getInfoRoleApi(),
      getInfoCompanyApi(),
      getDepartmentInfoApi(),
    ])
    if (userRes.code === 200 && userRes.data) {
      info.value = userRes.data
      fillForm(userRes.data)
    } else {
      console.warn('获取用户信息返回异常:', userRes.msg)
    }
    if (rolesRes.code === 200 && rolesRes.data) {
      roleList.value = Array.isArray(rolesRes.data) ? rolesRes.data : Object.values(rolesRes.data)
      // 角色列表到位后，若 roleCode 缺失，回退用中文名反查 code
      if (info.value && info.value.role && !form.value.role) {
        const matched = roleList.value.find((r) => r.name === info.value?.role)
        if (matched) form.value.role = matched.role
      }
    }
    if (companyRes.code === 200 && Array.isArray(companyRes.data)) {
      companyNames.value = companyRes.data
    }
    if (deptRes.code === 200 && Array.isArray(deptRes.data)) {
      departmentNames.value = deptRes.data
    }

    await fetchCertificateImages(userAccount)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.user-detail-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
  gap: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-weight: 600;
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
  width: calc(25% - 9px);
  aspect-ratio: 1;
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
