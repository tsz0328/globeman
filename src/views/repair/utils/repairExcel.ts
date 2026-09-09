// 维修订单导出（业务专属）：订单头信息块 + 设备明细表（含 SN 码）
// 与订单导出（src/utils/orderExcel.ts）同构、同一套规范：
// - 大标题 = 订单名称；信息区四行两列、无外框；设备表全边框
// - 三种投递方式：单文件（多订单顺序排列）/ 多文件逐个下载 / 多文件打包 zip
// 差异（对齐维修详情弹窗 / 维修打印模板）：
// - 设备表第 7 列是「SN码」而非「数量」
// - 明细按 SN 展开成多行（每条 SN 一行，空 SN 不展示），与屏幕表格口径一致；
//   展开后无任何行时写「（无 SN 明细）」占位
// 注意：与 orderExcel.ts 的通用辅助（writeMergedCell / 文件名清洗等）为同源副本，
// 改导出布局时两个文件需同步评估。
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { downloadBlob, ensureXlsx } from '@/utils/excel'
import type { RepairOrderData } from '@/api/repair/RepairApi'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const DEVICE_HEADERS = ['序号', '品名', '型号', '类型', '品牌', '参数', 'SN码']
const COL_WIDTHS = [6, 22, 34, 12, 14, 24, 26]

const THIN_BORDER = {
  top: { style: 'thin' as const },
  left: { style: 'thin' as const },
  bottom: { style: 'thin' as const },
  right: { style: 'thin' as const },
}

/**
 * 表头信息区布局：与维修详情弹窗（RepairOrderDetailDialog）可见字段、
 * 标签、取值完全一致（订单名称作大标题，不再重复一行）。
 * 订单类型 / 状态属管理信息、弹窗不显示，故导出也不含；
 * 打印模板的合同编号 / 付款条件 / 盖章栏为 print-only，同样不导出。
 */
interface InfoField {
  label: string
  get: (order: RepairOrderData) => string
}

const INFO_ROWS: { left: InfoField; right: InfoField }[] = [
  {
    left: { label: '客户单位：', get: (o) => o.customer },
    right: { label: '负责人：', get: (o) => o.manager },
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
    right: { label: '创建时间：', get: (o) => o.time ?? '' },
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

/** 明细按 SN 展开成多行（每条 SN 一行，空 SN 不展示），与屏幕表格 / 打印口径一致 */
function expandDetailsBySn(order: RepairOrderData): string[][] {
  const rows: string[][] = []
  for (const d of order.details ?? []) {
    const snList = (d.SN || []).map((s) => (s || '').trim()).filter((s) => s)
    for (const sn of snList) {
      rows.push([d.name || '', d.model || '', d.type || '', d.brand || '', d.spec || '', sn])
    }
  }
  return rows
}

/**
 * 构建含若干维修订单的工作簿（只构建，不下载）。
 * 单文件与多文件导出共用此函数，保证两种形态的内容完全一致。
 */
async function buildRepairWorkbook(orders: RepairOrderData[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('维修设备明细')
  sheet.columns = COL_WIDTHS.map((width) => ({ width }))

  const colCount = DEVICE_HEADERS.length
  let r = 1

  for (const order of orders) {
    // 大标题：订单名称（居中加粗，对应弹窗顶部居中标题）
    const titleCell = sheet.getCell(r, 1)
    titleCell.value = order.name || order.id || '维修订单详情'
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

    // 设备明细行（按 SN 展开）
    const rows = expandDetailsBySn(order)
    if (rows.length === 0) {
      sheet.getCell(r, 1).value = '（无 SN 明细）'
      sheet.mergeCells(r, 1, r, colCount)
      r++
    } else {
      rows.forEach((values, index) => {
        const cells: (string | number)[] = [index + 1, ...values]
        cells.forEach((v, ci) => {
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
function orderFileName(order: RepairOrderData, index: number): string {
  const safe = sanitizeFilename(order.name, order.id || `维修订单${index + 1}`)
  return `${String(index + 1).padStart(2, '0')}_${safe}`
}

/**
 * 导出为单个 xlsx：所有订单依次排列在同一 sheet。
 * 返回导出的订单数。
 */
export async function exportRepairOrdersToExcel(
  orders: RepairOrderData[],
  filename: string,
): Promise<number> {
  const workbook = await buildRepairWorkbook(orders)
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), ensureXlsx(filename))
  return orders.length
}

/**
 * 导出为多个 xlsx：每个订单一个文件，依次触发下载。
 *
 * 注意：浏览器普遍会拦截页面瞬时发起的连续下载（Chrome 会弹「是否允许下载多个文件」，
 * 用户不点允许则后续文件被丢弃），故每次下载之间留一拍间隔降低被拦概率。
 * 若仍被拦或需下载数量较多，改用 exportRepairOrdersToZip。
 */
export async function exportRepairOrdersToSeparateFiles(orders: RepairOrderData[]): Promise<number> {
  for (const [index, order] of orders.entries()) {
    const workbook = await buildRepairWorkbook([order])
    const buffer = await workbook.xlsx.writeBuffer()
    downloadBlob(new Blob([buffer], { type: XLSX_MIME }), ensureXlsx(orderFileName(order, index)))
    if (index < orders.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }
  return orders.length
}

/** 导出为多个 xlsx 并打包成一个 zip：避开浏览器对连续下载的限制，一次下载拿全部 */
export async function exportRepairOrdersToZip(
  orders: RepairOrderData[],
  filename: string,
): Promise<number> {
  const zip = new JSZip()
  for (const [index, order] of orders.entries()) {
    const workbook = await buildRepairWorkbook([order])
    const buffer = await workbook.xlsx.writeBuffer()
    zip.file(`${orderFileName(order, index)}.xlsx`, buffer)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, filename.endsWith('.zip') ? filename : `${filename}.zip`)
  return orders.length
}
