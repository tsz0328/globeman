// 临时验收测试：用项目自身的 parseDeviceSheet 跑用户提供的真实清单文件
import { describe, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseDeviceSheet } from './excel'

const FILES = [
  'C:/Users/Hello/Downloads/2026-10-10广东90台最后40台.xlsx',
  'C:/Users/Hello/Downloads/2026-10-21广东50台.xlsx',
]

describe('真实清单导入验收', () => {
  for (const path of FILES) {
    it(`解析 ${path.split('/').pop()}`, async () => {
      const buf = readFileSync(path)
      const file = new File([buf], path.split('/').pop() ?? 'a.xlsx')
      const parsed = await parseDeviceSheet(file)

      console.log('=== 标题:', parsed.title)
      console.log('=== meta:', JSON.stringify(parsed.meta))
      console.log('=== 表头:', JSON.stringify(parsed.headers))
      console.log('=== 忽略列:', JSON.stringify(parsed.ignoredColumns))
      console.log('=== SN列:', parsed.hasSnColumn, '类型判定:', parsed.detectedType)
      console.log('=== 行数:', parsed.rows.length)

      const noName = parsed.rows.filter((r) => !r.equipmentName)
      console.log('=== 品名为空的行（会被表单校验拦下）:', noName.length)
      noName.forEach((r, i) => console.log('  缺品名行', i + 1, JSON.stringify(r)))

      const noSn = parsed.rows.filter((r) => !r.sn)
      console.log('=== SN为空的行:', noSn.length)

      parsed.rows.slice(0, 3).forEach((r, i) => console.log(`  首行${i + 1}:`, JSON.stringify(r)))
      parsed.rows.slice(-2).forEach((r, i) => console.log(`  尾行${i + 1}:`, JSON.stringify(r)))

      if (noName.length > 0) throw new Error(`有 ${noName.length} 行品名为空，导入会被校验拦截`)
    })
  }
})
