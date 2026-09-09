// 订单导出（业务专属）：订单头信息块 + 设备明细表
// 形态与业务侧真实清单（如「华为17台」）对齐：订单名作标题，下方是订单头信息 + 设备表。
// 三种投递方式：单文件（多订单顺序排列）/ 多文件逐个下载 / 多文件打包 zip。
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { downloadBlob, ensureXlsx } from '@/utils/excel'
import type { Order } from '@/composables/order/useOrder'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const DEVICE_HEADERS = ['序号', '品名', '型号', '类型', '品牌', '参数', '数量']
const COL_WIDTHS = [6, 22, 34, 12, 14, 24, 8]

const THIN_BORDER = {
  top: { style: 'thin' as const },
  left: { style: 'thin' as const },
  bottom: { style: 'thin' as const },
  right: { style: 'thin' as const },
}

/**
 * 表头信息区布局：与 OrderDetailDialog 的字段、标签、取值完全一致。
 * 弹窗可见字段只有这 8 个（订单名称作大标题，不再重复一行）；
 * 订单类型 / 状态属管理信息、弹窗不显示，故导出也不含；
 * 弹窗 print-only 的合同编号 / 付款条件 / 盖章栏同样不导出。
 * 每行两个字段并排，与弹窗 .info-row 的两列布局对应。
 */
interface InfoField {
  label: string
  get: (order: Order) => string
}

const INFO_ROWS: { left: InfoField; right: InfoField }[] = [
  {
    left: { label: '客户单位：', get: (o) => o.customer },
    right: { label: '负责人：', get: (o) => o.leaderAccount },
  },
  {
    // 与弹窗一致：省市区用空格连接
    left: {
      label: '省市区：',
      get: (o) => [o.province, o.city, o.district].filter(Boolean).join(' '),
    },
    right: { label: '收货信息：', get: (o) => o.address },
  },
  {
    left: { label: '联系人：', get: (o) => o.contact },
    right: { label: '联系电话：', get: (o) => o.contactPhone },
  },
  {
    left: { label: '订单号：', get: (o) => o.id ?? '' },
    right: { label: '创建时间：', get: (o) => o.createTime ?? '' },
  },
]

/**
 * 在合并区间写入文本。
 * 需要边框时传 `border: true`——合并单元格必须逐格设边框才会显示完整外框，
 * 只设左上角单元格的话打开是残缺的（设备明细表用）。
 * 表头信息区不传，保持无框。
 */
function writeMergedCell(
  sheet: ExcelJS.Worksheet,
  row: number,
  startCol: number,
  endCol: number,
  value: string,
  style: { bold?: boolean; align?: 'left' | 'center'; border?: boolean } = {},
): void {
  if (endCol > startCol) sheet.mergeCells(row, startCol, row, endCol)
  if (style.border) {
    for (let c = startCol; c <= endCol; c++) {
      sheet.getCell(row, c).border = THIN_BORDER
    }
  }
  const cell = sheet.getCell(row, startCol)
  cell.value = value
  if (style.bold) cell.font = { bold: true }
  if (style.align) cell.alignment = { horizontal: style.align }
}

/**
 * 构建含若干订单的工作簿（只构建，不下载）。
 * 单文件与多文件导出共用此函数，保证两种形态的内容完全一致。
 */
async function buildOrderWorkbook(orders: Order[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('订单设备明细')
  sheet.columns = COL_WIDTHS.map((width) => ({ width }))

  const colCount = DEVICE_HEADERS.length
  let r = 1

  for (const order of orders) {
    // 大标题：订单名称（居中加粗，对应弹窗顶部居中标题）
    const titleCell = sheet.getCell(r, 1)
    titleCell.value = order.name || order.id || '订单详情'
    titleCell.font = { bold: true, size: 14 }
    titleCell.alignment = { horizontal: 'center' }
    sheet.mergeCells(r, 1, r, colCount)
    r++

    // 表头信息区：每行两个字段并排，列区间 A:B | C:D | E | F:G
    for (const info of INFO_ROWS) {
      writeMergedCell(sheet, r, 1, 2, info.left.label, { bold: true })
      writeMergedCell(sheet, r, 3, 4, info.left.get(order))
      writeMergedCell(sheet, r, 5, 5, info.right.label, { bold: true })
      writeMergedCell(sheet, r, 6, 7, info.right.get(order))
      r++
    }

    r++ // 信息区与设备表之间空一行（对应弹窗 .form-info 的下外边距）

    // 设备明细表头
    DEVICE_HEADERS.forEach((header, i) => {
      const cell = sheet.getCell(r, i + 1)
      cell.value = header
      cell.font = { bold: true }
      cell.alignment = { horizontal: 'center' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } }
      cell.border = THIN_BORDER
    })
    r++

    // 设备明细行
    const details = order.details ?? []
    if (details.length === 0) {
      sheet.getCell(r, 1).value = '（无设备明细）'
      sheet.mergeCells(r, 1, r, colCount)
      r++
    } else {
      details.forEach((d, index) => {
        const values: (string | number)[] = [
          index + 1,
          d.name || '',
          d.model || '',
          d.type || '',
          d.brand || '',
          d.spec || '',
          d.number,
        ]
        values.forEach((v, ci) => {
          const cell = sheet.getCell(r, ci + 1)
          cell.value = v
          cell.border = THIN_BORDER
        })
        r++
      })
    }

    r += 2 // 订单之间空两行
  }

  return workbook
}

/** 订单名可能含 / \ : * ? " < > | 等非法文件名字符，替换后再用作文件名 */
function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|\r\n\t]/g, '_').trim()
  return cleaned || fallback
}

/** 单订单文件名：加两位序号前缀，避免同名订单在 zip 内互相覆盖 */
function orderFileName(order: Order, index: number): string {
  const safe = sanitizeFilename(order.name, order.id || `订单${index + 1}`)
  return `${String(index + 1).padStart(2, '0')}_${safe}`
}

/**
 * 导出为单个 xlsx：所有订单依次排列在同一 sheet。
 * 返回导出的订单数。
 */
export async function exportOrdersToExcel(orders: Order[], filename: string): Promise<number> {
  const workbook = await buildOrderWorkbook(orders)
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), ensureXlsx(filename))
  return orders.length
}

/**
 * 导出为多个 xlsx：每个订单一个文件，依次触发下载。
 *
 * 注意：浏览器普遍会拦截页面瞬时发起的连续下载（Chrome 会弹「是否允许下载多个文件」，
 * 用户不点允许则后续文件被丢弃），故每次下载之间留一拍间隔降低被拦概率。
 * 若仍被拦或需下载数量较多，改用 exportOrdersToZip。
 */
export async function exportOrdersToSeparateFiles(orders: Order[]): Promise<number> {
  for (const [index, order] of orders.entries()) {
    const workbook = await buildOrderWorkbook([order])
    const buffer = await workbook.xlsx.writeBuffer()
    downloadBlob(new Blob([buffer], { type: XLSX_MIME }), ensureXlsx(orderFileName(order, index)))
    if (index < orders.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }
  return orders.length
}

/** 导出为多个 xlsx 并打包成一个 zip：避开浏览器对连续下载的限制，一次下载拿全部 */
export async function exportOrdersToZip(orders: Order[], filename: string): Promise<number> {
  const zip = new JSZip()
  for (const [index, order] of orders.entries()) {
    const workbook = await buildOrderWorkbook([order])
    const buffer = await workbook.xlsx.writeBuffer()
    zip.file(`${orderFileName(order, index)}.xlsx`, buffer)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, filename.endsWith('.zip') ? filename : `${filename}.zip`)
  return orders.length
}
