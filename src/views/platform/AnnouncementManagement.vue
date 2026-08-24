<template>
  <WorkPage>
    <template #actions>
      <el-button
        v-if="activeTab === 'announcement'"
        type="primary"
        @click="openCreate"
      >
        发布公告
      </el-button>
      <el-button
        v-else
        type="primary"
        :loading="introSaving"
        @click="handleSaveIntro"
      >
        保存介绍
      </el-button>
    </template>

    <el-tabs v-model="activeTab">
      <!-- ============ 公告管理 ============ -->
      <el-tab-pane label="公告管理" name="announcement">
        <el-form :inline="true" class="filter-form" @submit.prevent>
          <el-form-item label="标题">
            <el-input
              v-model="keyword"
              placeholder="搜索公告标题"
              style="width: 180px"
              clearable
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="typeFilter"
              placeholder="全部"
              style="width: 140px"
              clearable
            >
              <el-option label="最新公告" value="latest" />
              <el-option label="平台公告" value="platform" />
            </el-select>
          </el-form-item>
        </el-form>

        <el-table :data="pagedData" border style="width: 100%">
          <el-table-column label="类型" width="110">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'latest' ? 'danger' : 'primary'">
                {{ scope.row.type === 'latest' ? '最新公告' : '平台公告' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="160" />
          <el-table-column label="正文预览" min-width="220" show-overflow-tooltip>
            <template #default="scope">{{ scope.row.content.join(' / ') }}</template>
          </el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="180" />
          <el-table-column label="状态" width="90">
            <template #default="scope">
              <el-tag :type="scope.row.enabled ? 'success' : 'info'">
                {{ scope.row.enabled ? '已发布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right" class-name="action-column">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                :loading="editLoadingId === scope.row.id"
                @click="openEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                :loading="deleteLoadingId === scope.row.id"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="filteredList.length"
          />
        </div>
      </el-tab-pane>

      <!-- ============ 公司介绍（独立编辑，非表格）============ -->
      <el-tab-pane label="公司介绍" name="intro">
        <el-form label-width="90px" class="intro-form">
          <el-form-item label="公司名称">
            <el-input
              v-model="introForm.title"
              placeholder="如：湖南全球人信息技术有限公司"
            />
          </el-form-item>
          <el-form-item label="介绍内容">
            <el-input
              v-model="introForm.content"
              type="textarea"
              :rows="14"
              placeholder="支持换行，保存后将在首页「公司介绍」区展示"
            />
          </el-form-item>
          <el-form-item label="Logo 地址">
            <el-input
              v-model="introForm.logoUrl"
              placeholder="可选，留空则沿用站点默认 logo"
              clearable
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- ============ 公告新增/编辑弹窗 ============ -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '发布公告' : '编辑公告'"
      width="640px"
      @closed="resetForm"
    >
      <el-form label-width="90px">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio label="latest">最新公告</el-radio>
            <el-radio label="platform">平台公告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="公告标题" />
        </el-form-item>
        <el-form-item label="正文">
          <div
            v-for="(p, idx) in form.content"
            :key="idx"
            class="para-row"
          >
            <el-input
              v-model="form.content[idx]"
              type="textarea"
              :rows="3"
              :placeholder="`第 ${idx + 1} 段`"
            />
            <el-button
              text
              type="danger"
              :disabled="form.content.length <= 1"
              @click="removePara(idx)"
            >
              移除
            </el-button>
          </div>
          <el-button text type="primary" @click="addPara">+ 新增一段</el-button>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="form.publishTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm"
            placeholder="选择发布时间"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.enabled"
            active-text="已发布"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </template>
    </el-dialog>
  </WorkPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkPage from '@/components/common/WorkPage.vue'
import {
  announcements,
  deleteAnnouncement,
  saveAnnouncement,
  saveIntro,
  intro,
  type AnnouncementItem,
  type AnnouncementType,
  type IntroContent,
} from '@/api/platform/Announcement'

const activeTab = ref<'announcement' | 'intro'>('announcement')

// ---------- 列表 / 筛选 / 分页 ----------
const keyword = ref('')
const typeFilter = ref<AnnouncementType | ''>('')
const currentPage = ref(1)
const pageSize = 10

const filteredList = computed(() => {
  let list = announcements.value
  if (typeFilter.value) list = list.filter((i) => i.type === typeFilter.value)
  if (keyword.value) {
    list = list.filter((i) => i.title.includes(keyword.value))
  }
  return [...list].sort((a, b) => b.publishTime.localeCompare(a.publishTime))
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

// ---------- 删除（per-row loading）----------
const deleteLoadingId = ref<string | null>(null)

const handleDelete = async (row: AnnouncementItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除公告「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const success = await deleteAnnouncement(row.id)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoadingId.value = null
  }
}

// ---------- 编辑（per-row loading，仅用于编辑按钮自身转圈）----------
const editLoadingId = ref<string | null>(null)

const openEdit = (row: AnnouncementItem) => {
  editLoadingId.value = row.id
  Object.assign(form, {
    id: row.id,
    type: row.type,
    title: row.title,
    content: [...row.content],
    publishTime: row.publishTime,
    enabled: row.enabled,
  })
  dialogMode.value = 'edit'
  dialogVisible.value = true
  // 弹窗打开后用 nextTick 复位按钮 loading，避免一直转
  setTimeout(() => {
    editLoadingId.value = null
  }, 0)
}

// ---------- 新增 / 编辑弹窗 ----------
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const saving = ref(false)

const emptyForm = (): AnnouncementItem => ({
  id: '',
  type: 'platform',
  title: '',
  content: [''],
  publishTime: '',
  enabled: true,
})

const form = reactive<AnnouncementItem>(emptyForm())

const resetForm = () => {
  Object.assign(form, emptyForm())
}

const addPara = () => form.content.push('')
const removePara = (idx: number) => form.content.splice(idx, 1)

const openCreate = () => {
  resetForm()
  dialogMode.value = 'create'
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  const content = form.content.map((c) => c.trim()).filter((c) => c)
  if (content.length === 0) {
    ElMessage.warning('请至少填写一段正文')
    return
  }
  saving.value = true
  try {
    const payload: AnnouncementItem = {
      id: form.id || `a${Date.now()}`,
      type: form.type,
      title: form.title.trim(),
      content,
      publishTime: form.publishTime || new Date().toLocaleString('zh-CN'),
      enabled: form.enabled,
    }
    const success = await saveAnnouncement(payload)
    if (success) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

// ---------- 公司介绍独立编辑 ----------
const introSaving = ref(false)
const introForm = reactive<IntroContent>({
  id: intro.value.id,
  title: intro.value.title,
  content: intro.value.content,
  logoUrl: intro.value.logoUrl,
})

const handleSaveIntro = async () => {
  if (!introForm.title.trim()) {
    ElMessage.warning('请填写公司名称')
    return
  }
  introSaving.value = true
  try {
    const success = await saveIntro({ ...introForm })
    if (success) {
      ElMessage.success('公司介绍已保存')
    } else {
      ElMessage.error('保存失败')
    }
  } finally {
    introSaving.value = false
  }
}
</script>

<style scoped>
.filter-form {
  margin-bottom: 12px;
}
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.intro-form {
  max-width: 720px;
  margin-top: 8px;
}
.para-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.para-row :deep(.el-textarea) {
  flex: 1;
}
:deep(.action-column) {
  white-space: nowrap;
}
</style>
