import { ref } from 'vue'

// ============================================================================
// 公告 / 公司介绍 数据模型 + Mock 数据源
// ----------------------------------------------------------------------------
// 后端公告接口当前待定。此处先用模块级响应式 store 模拟「后端」，
// 所有读写函数都走 async 以对齐未来真实接口（替换函数体内部即可，签名不变）。
// 真实接口契约（待后端确认，先按此结构对齐）：
//   GET  /client/announcement/list        列表（可按 type 过滤）
//   GET  /client/announcement/latest       最新一条 (type=latest, 启用态)
//   POST /client/announcement/save         新增/编辑（JSON: AnnouncementItem）
//   DELETE /client/announcement/delete?id= 删除
//   GET  /client/intro/get                 公司介绍（单条 IntroContent）
//   POST /client/intro/save                保存公司介绍
// ============================================================================

export type AnnouncementType = 'latest' | 'platform'

export interface AnnouncementItem {
  id: string
  type: AnnouncementType
  title: string
  /** 多段正文，对应平台公告的 paragraphs[]；最新公告通常 1 段 */
  content: string[]
  publishTime: string
  /** true=已发布 / false=草稿 */
  enabled: boolean
}

export interface IntroContent {
  id: string
  /** 公司名称（显示在介绍区标题） */
  title: string
  /** 长文正文（可含换行） */
  content: string
  /** 可选 logo 地址 */
  logoUrl?: string
}

/** 模拟网络延迟 */
const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// ---- Mock「后端」存储（模块级响应式，管理页与首页共享同一份数据）----
export const announcements = ref<AnnouncementItem[]>([
  {
    id: 'a1',
    type: 'latest',
    title: '系统升级维护通知',
    content: ['为提供更稳定的服务，平台将于本周六 02:00-04:00 进行系统升级维护，期间相关功能暂不可用，敬请谅解。'],
    publishTime: '2026-08-20 10:00',
    enabled: true,
  },
  {
    id: 'a2',
    type: 'platform',
    title: '各供应商：',
    content: [
      '根据中国铁塔一码到底全国推广工作要求，在线商务平台已于2023年8月4日上线全国全品类主设备一码到底。即2023年8月5日起接收的主设备订单需贴签扫码后才能发货。请涉及的各主设备供应商根据近期实际供货量提前备签，避免因标签问题影响发货。',
      '一码到底相关要求、培训视频、操作手册详见铁塔在线商务平台-下载专区。',
    ],
    publishTime: '2026-08-18 09:30',
    enabled: true,
  },
  {
    id: 'a3',
    type: 'platform',
    title: '各供应商：',
    content: [
      '中国铁塔秉承开放、平等和诚信原则与广大供应商开展合作。如有下列相关问题，可通过相关渠道反映，感谢配合！',
      '1.进行欠款清理申诉，推动中小企业应付款清理工作。',
      '2.采购履约需要反馈的情形（如未履行采购手续向供应商进行借货等）。',
    ],
    publishTime: '2026-08-15 14:00',
    enabled: true,
  },
])

export const intro = ref<IntroContent>({
  id: 'intro',
  title: '湖南全球人信息技术有限公司',
  content:
    '（请在「公告管理 - 公司介绍」中维护贵司正式介绍，当前为占位文案。）\n湖南全球人信息技术有限公司（简称湖南全球人）是一家专注于全球人业务信息化服务的企业，致力于为行业客户提供高效、可靠的数字化解决方案。',
  logoUrl: '',
})

// ---- 对外 API（签名稳定，未来替换函数体内部即可对接真实后端）----

export async function getAnnouncementList(type?: AnnouncementType): Promise<AnnouncementItem[]> {
  await delay()
  let list = announcements.value
  if (type) list = list.filter((i) => i.type === type)
  // 复制返回，避免调用方直接改到 store；排序按发布时间倒序
  return [...list].sort((a, b) => b.publishTime.localeCompare(a.publishTime))
}

export async function getLatestAnnouncement(): Promise<AnnouncementItem | null> {
  await delay()
  const list = announcements.value
    .filter((i) => i.type === 'latest' && i.enabled)
    .sort((a, b) => b.publishTime.localeCompare(a.publishTime))
  return list[0] ?? null
}

export async function getIntro(): Promise<IntroContent> {
  await delay()
  return { ...intro.value }
}

export async function saveAnnouncement(item: AnnouncementItem): Promise<boolean> {
  await delay()
  const idx = announcements.value.findIndex((i) => i.id === item.id)
  if (idx >= 0) {
    announcements.value[idx] = { ...item }
  } else {
    announcements.value.push({ ...item })
  }
  return true
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  await delay()
  const idx = announcements.value.findIndex((i) => i.id === id)
  if (idx >= 0) announcements.value.splice(idx, 1)
  return true
}

export async function saveIntro(data: IntroContent): Promise<boolean> {
  await delay()
  intro.value = { ...data }
  return true
}
