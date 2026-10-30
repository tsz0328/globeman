// 通用 Excel 读写工具（基于 exceljs，浏览器端）
// 供各管理页的「导入/导出 Excel」按钮复用：导出把列表行写成 xlsx 下载，导入把 xlsx 解析成表头键值对。
// 注意：exceljs 的 package.json 带 browser 字段指向 dist/exceljs.min.js，
// Vite 默认 mainFields 含 browser，因此直接 `import ExcelJS from 'exceljs'` 即可拿到浏览器构建，无需额外 alias 配置。
import ExcelJS from 'exceljs'

/** 导出列定义 */
export interface ExcelColumn<T> {
  /** 表头文字，同时作为导入时的列名匹配依据 */
  label: string
  /** 行对象上的属性名（formatter 存在时可省略取值含义） */
  prop?: string
  /** 列宽（字符数），默认 18 */
  width?: number
  /** 自定义取值，优先级高于 prop */
  formatter?: (row: T) => string | number
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** 把 exceljs 单元格值统一转成字符串：兼容富文本 / 公式结果 / 超链接 / 日期 / 数字 */
function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleString('zh-CN')
  if (typeof value === 'object') {
    const v = value as {
      text?: unknown
      result?: unknown
      richText?: { text?: unknown }[]
    }
    if (Array.isArray(v.richText)) return v.richText.map((t) => String(t.text ?? '')).join('')
    if (v.text !== undefined) return String(v.text)
    if (v.result !== undefined) return String(v.result)
    return ''
  }
  return String(value)
}

/** 触发浏览器下载 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** 补齐 .xlsx 后缀 */
export function ensureXlsx(filename: string): string {
  return filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
}

/**
 * 导出数据为 xlsx 并触发下载。
 * rows 传空数组时生成「仅表头」的文件，可直接当作导入模板使用。
 */
export async function exportToExcel<T extends object>(
  rows: T[],
  columns: ExcelColumn<T>[],
  filename: string,
  sheetName = '数据',
): Promise<number> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)

  sheet.columns = columns.map((col) => ({
    header: col.label,
    key: col.prop ?? col.label,
    width: col.width ?? 18,
  }))

  // 表头加粗 + 冻结首行，滚动时列名常驻
  sheet.getRow(1).font = { bold: true }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  for (const row of rows) {
    const values = columns.map((col) => {
      if (col.formatter) return col.formatter(row)
      if (!col.prop) return ''
      const raw = (row as unknown as Record<string, unknown>)[col.prop]
      return (raw ?? '') as string | number
    })
    sheet.addRow(values)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(new Blob([buffer], { type: XLSX_MIME }), ensureXlsx(filename))
  return rows.length
}

/**
 * 解析 xlsx 文件，以首行作为表头，返回「表头 -> 单元格文本」的对象数组。
 * 全空行会被跳过；单元格值统一转为去空格后的字符串。
 */
export async function parseExcel(file: File): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const sheet = workbook.worksheets[0]
  if (!sheet) throw new Error('文件内容为空，未找到工作表')

  // 首行作为表头，列号（从 1 开始）映射到列名
  const headers: string[] = []
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cellToText(cell.value).trim()
  })

  const rows: Record<string, string>[] = []
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return // 跳过表头
    const record: Record<string, string> = {}
    headers.forEach((header, colNumber) => {
      if (!header) return
      record[header] = cellToText(row.getCell(colNumber).value).trim()
    })
    // 跳过完全空白的行
    if (Object.values(record).some((v) => v !== '')) rows.push(record)
  })

  return rows
}

// =====================================================================
// 设备清单解析（业务形态：一次导入 = 一个订单 + N 台设备）
// 真实清单样式：顶部标题行（合并单元格）+ 若干元信息行（键：值）+ 表头行 + 设备行 + 页脚
// 表头行位置与列名在不同来源的清单中都不一致，故按关键词识别而非固定行号/列名。
// =====================================================================

/** 解析出的设备行（对应订单设备明细字段） */
export interface DeviceRow {
  equipmentName: string
  equipmentModel: string
  /** 原型号（维修改造单特有列） */
  originalModel: string
  /** 改型号（维修改造单特有列） */
  refitModel: string
  /** 加工项目（维修单两种形态都有） */
  processItem: string
  brand: string
  spec: string
  sn: string
}

export interface ParsedDeviceSheet {
  /** 清单标题（合并单元格那一行，如「库存设备清单」） */
  title: string
  /** 元信息键值对（发货人 / 到货日期 / 采购人 / 商家 等） */
  meta: Record<string, string>
  /** 识别到的表头列名 */
  headers: string[]
  /** 设备行 */
  rows: DeviceRow[]
  /** 未识别、已忽略的列名（供前端提示） */
  ignoredColumns: string[]
  /** 是否含 S/N 序列号列（命中后已带入设备明细的 sn 字段） */
  hasSnColumn: boolean
  /** 表头特征判定的订单类型：含「原型号/改型号」列即维修改造单 →「维修」；其余表头判不出类型，为 undefined */
  detectedType?: string
}

// 明确忽略的列：优先于字段匹配，避免「序号」等被误判成设备字段
// 注意：S/N、SN码、序列号 不再忽略 —— 现作为「SN码」字段匹配进设备明细（订单创单即可登记序列号）
const IGNORED_COLUMN_KEYWORDS = [
  '序号',
  '备注',
  'pid',
  '测试结果',
  '老化时长',
  '金额',
  '到货日期',
  '物流',
  '商家',
  '采购人',
  '发货人',
  '收货人',
  '日期',
  // 「数量」列已从设备字段中移除：设备明细按「一行一台」管理（每行一个 SN），
  // 数量恒为 1，保留该列只会诱导录入重复信息。清单里的数量列导入时忽略并提示。
  '数量',
]

const SN_COLUMN_KEYWORDS = ['s/n', '序列号', 'sn码', 'sn']

// 「类型」列已从设备字段中移除（与品名重复：录入表/导出/打印均不再展示），
// 但其值仍作为「品名兜底」来源——清单无「名称/品名」列时优先取类型列值（如 RRU）。
// 命中这些关键词的列不记入 ignoredColumns（数据被消费了，不算未识别忽略）。
const TYPE_COLUMN_KEYWORDS = ['类型']

// 设备字段关键词（按顺序匹配，命中即止）
const DEVICE_COLUMN_RULES: { field: keyof DeviceRow; keywords: string[] }[] = [
  { field: 'equipmentName', keywords: ['设备名称', '品名', '名称'] },
  // 维修改造单特有列，独立字段。必须排在通用「型号」规则之前——
  // 「原型号/改型号」都含「型号」二字，不先拦截会被通用规则吸进 model
  { field: 'originalModel', keywords: ['原型号'] },
  { field: 'refitModel', keywords: ['改型号'] },
  { field: 'processItem', keywords: ['加工项目'] },
  { field: 'equipmentModel', keywords: ['型号'] },
  { field: 'brand', keywords: ['设备厂家', '厂家', '品牌', '厂商'] },
  { field: 'spec', keywords: ['参数', '频段', '频率', '带宽', '规格', '电源额定值', '交流/直流'] },
  { field: 'sn', keywords: ['s/n', 'sn码', '序列号', 'sn'] },
]

/** 列名 → 设备字段，命中忽略列表或无法识别时返回 null */
function matchDeviceField(header: string): keyof DeviceRow | null {
  const h = header.toLowerCase().replace(/\s/g, '')
  if (!h) return null
  if (IGNORED_COLUMN_KEYWORDS.some((k) => h.includes(k))) return null
  for (const rule of DEVICE_COLUMN_RULES) {
    if (rule.keywords.some((k) => h.includes(k))) return rule.field
  }
  return null
}

/** 取某行的单元格文本数组（下标从 1 开始，与 Excel 列号对齐） */
function readRowCells(sheet: ExcelJS.Worksheet, rowNumber: number): string[] {
  const cells: string[] = []
  sheet.getRow(rowNumber).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    cells[colNumber] = cellToText(cell.value).trim()
  })
  return cells
}

/**
 * 解析设备清单：自动定位表头行、提取标题与元信息、按关键词映射设备列。
 * 数据行读取到「所有设备字段均为空」的行为止，以避开「发货人：xxx」这类页脚。
 */
export async function parseDeviceSheet(file: File): Promise<ParsedDeviceSheet> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const sheet = workbook.worksheets[0]
  if (!sheet) throw new Error('文件内容为空，未找到工作表')

  // 1) 定位表头行：含「序号」或能匹配到 >= 2 个设备字段的行
  let headerRowNumber = 0
  let headerCells: string[] = []
  const scanLimit = Math.min(sheet.rowCount, 10)
  for (let r = 1; r <= scanLimit; r++) {
    const cells = readRowCells(sheet, r)
    const nonEmpty = cells.filter(Boolean)
    if (nonEmpty.length < 2) continue
    const hasIndex = nonEmpty.some((v) => v.replace(/\s/g, '') === '序号')
    const matched = nonEmpty.filter((v) => matchDeviceField(v)).length
    if (hasIndex || matched >= 2) {
      headerRowNumber = r
      headerCells = cells
      break
    }
  }
  if (!headerRowNumber) {
    throw new Error('未识别到表头行，请确认清单含「序号」或「型号 / 设备名称」等列名')
  }

  // 2) 表头行之前：整行同值视为标题（合并单元格），「键：值」收进 meta
  let title = ''
  const meta: Record<string, string> = {}
  for (let r = 1; r < headerRowNumber; r++) {
    const nonEmpty = readRowCells(sheet, r).filter(Boolean)
    if (nonEmpty.length === 0) continue
    const uniq = Array.from(new Set(nonEmpty))
    if (uniq.length === 1 && nonEmpty.length > 1) {
      title = uniq[0] ?? ''
      continue
    }
    for (const v of nonEmpty) {
      const m = v.match(/^(.+?)[：:]\s*(.+)$/)
      if (m?.[1] && m[2]) meta[m[1].trim()] = m[2].trim()
    }
  }

  // 3) 列映射
  const headers: string[] = []
  const ignoredColumns: string[] = []
  const fieldByCol: (keyof DeviceRow | null)[] = []
  // 「类型」列列号：不作为设备字段，仅用于品名兜底，故单列出来、不进 ignoredColumns
  const typeColumnNumbers: number[] = []
  headerCells.forEach((h, colNumber) => {
    if (!h) return
    headers[colNumber] = h
    const field = matchDeviceField(h)
    fieldByCol[colNumber] = field
    if (!field) {
      const s = h.toLowerCase().replace(/\s/g, '')
      if (TYPE_COLUMN_KEYWORDS.some((k) => s.includes(k))) typeColumnNumbers.push(colNumber)
      else ignoredColumns.push(h)
    }
  })

  const hasSnColumn = headers.filter(Boolean).some((h) => {
    const s = h.toLowerCase().replace(/\s/g, '')
    return SN_COLUMN_KEYWORDS.some((k) => s.includes(k))
  })

  // 维修改造单识别：表头含「原型号/改型号」列（仅这类清单才有）→ 订单类型判定为「维修」。
  // 其余清单（采购/维修-型号型/普通销售）表头无类型特征，判不出，交由用户手选。
  const isRefurbishSheet = headers.filter(Boolean).some((h) => {
    const s = h.toLowerCase().replace(/\s/g, '')
    return s.includes('原型号') || s.includes('改型号')
  })

  // 4) 设备行：读到全空行为止
  const rows: DeviceRow[] = []
  for (let r = headerRowNumber + 1; r <= sheet.rowCount; r++) {
    const sheetRow = sheet.getRow(r)
    const device: DeviceRow = {
      equipmentName: '',
      equipmentModel: '',
      originalModel: '',
      refitModel: '',
      processItem: '',
      brand: '',
      spec: '',
      sn: '',
    }
    fieldByCol.forEach((field, colNumber) => {
      if (!field) return
      const raw = cellToText(sheetRow.getCell(colNumber).value).trim()
      if (!raw) return
      // 多列命中同一字段时（如「设备频段」「带宽」都归入参数）用 / 拼接，避免后者覆盖前者丢数据
      device[field] = device[field] ? `${device[field]} / ${raw}` : raw
    })

    // 「类型」列值（多列命中用 / 拼接）：只作品名兜底来源，不作为设备字段
    let typeValue = ''
    for (const colNumber of typeColumnNumbers) {
      const raw = cellToText(sheetRow.getCell(colNumber).value).trim()
      if (raw) typeValue = typeValue ? `${typeValue} / ${raw}` : raw
    }

    const isEmpty =
      !device.equipmentName &&
      !device.equipmentModel &&
      !device.originalModel &&
      !device.refitModel &&
      !device.processItem &&
      !typeValue &&
      !device.brand &&
      !device.spec
    if (isEmpty) break // 空行 / 页脚（发货人、日期等）→ 清单结束

    // 品名兜底（清单无「名称/品名」列时）：优先取「类型」列值，其次从型号串提取设备类别前缀（RRU/AAU 等）。
    // 改造单没有通用「型号」列，改型号落在 refitModel，也参与类别提取。
    // 注：两列都推不出时（如维修清单只有厂家/频段/SN）品名仍留空，交由创单表单校验提示。
    if (!device.equipmentName) {
      if (typeValue) {
        device.equipmentName = typeValue
      } else {
        const modelSource = device.equipmentModel || device.refitModel
        const category = modelSource.match(/^\s*([A-Za-z]{2,6})\b/)?.[1]
        if (category) device.equipmentName = category
      }
    }

    rows.push(device)
  }

  return {
    title,
    meta,
    headers: headers.filter(Boolean),
    rows,
    ignoredColumns,
    hasSnColumn,
    detectedType: isRefurbishSheet ? '维修' : undefined,
  }
}
