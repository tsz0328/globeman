import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'

describe('exceljs 冒烟', () => {
  it('能创建 workbook', () => {
    expect(new ExcelJS.Workbook()).toBeTruthy()
  })
})
