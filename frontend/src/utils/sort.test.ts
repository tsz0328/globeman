import { describe, it, expect } from 'vitest'
import {
  toTimeStamp,
  formatDateTime,
  sortByCreateTimeDesc,
  sortByTimeDesc,
  type HasCreateTime,
} from './sort'

describe('toTimeStamp', () => {
  it('解析 MySQL DATETIME 空格格式（TZ 安全往返）', () => {
    const raw = '2026-05-29 11:44:53'
    expect(toTimeStamp(raw)).toBe(new Date('2026-05-29T11:44:53').getTime())
  })

  it('解析 ISO 时间字符串', () => {
    expect(toTimeStamp('2026-05-29T11:44:53')).toBe(
      new Date('2026-05-29T11:44:53').getTime(),
    )
  })

  it('13 位毫秒时间戳原样返回', () => {
    expect(toTimeStamp(1700000000000)).toBe(1700000000000)
  })

  it('10 位秒级时间戳换算为毫秒', () => {
    expect(toTimeStamp(1700000000)).toBe(1700000000000)
  })

  it('纯数字字符串按时间戳处理', () => {
    expect(toTimeStamp('1700000000')).toBe(1700000000000)
  })

  it('无法解析的非法输入兜底为 0', () => {
    expect(toTimeStamp('not-a-time')).toBe(0)
    expect(toTimeStamp(null)).toBe(0)
    expect(toTimeStamp(undefined)).toBe(0)
  })
})

describe('formatDateTime', () => {
  it('DATETIME 空格格式原样规整为空格分隔（TZ 安全）', () => {
    expect(formatDateTime('2026-05-29T11:44:53')).toBe('2026-05-29 11:44:53')
  })

  it('空值返回空串', () => {
    expect(formatDateTime('')).toBe('')
    expect(formatDateTime(null)).toBe('')
  })

  it('无法解析时原样返回字符串', () => {
    expect(formatDateTime('已发货')).toBe('已发货')
  })
})

describe('sortByCreateTimeDesc', () => {
  const list: HasCreateTime[] = [
    { id: 1, createTime: '2026-05-29 10:00:00' },
    { id: 2, createTime: '2026-05-29 12:00:00' },
    { id: 3, createTime: '2026-05-29 11:00:00' },
  ]

  it('按 createTime 降序（最新在前），且不修改原数组', () => {
    const sorted = sortByCreateTimeDesc(list)
    expect(sorted.map((i) => i.id)).toEqual([2, 3, 1])
    expect(list.map((i) => i.id)).toEqual([1, 2, 3])
  })

  it('时间相同时按 id 兜底（大的在前）', () => {
    const sameTime: HasCreateTime[] = [
      { id: 10, createTime: '2026-05-29 11:00:00' },
      { id: 5, createTime: '2026-05-29 11:00:00' },
    ]
    expect(sortByCreateTimeDesc(sameTime).map((i) => i.id)).toEqual([10, 5])
  })

  it('非法时间兜底排到末尾', () => {
    const withBad: HasCreateTime[] = [
      { id: 1, createTime: 'bad-time' },
      { id: 2, createTime: '2026-05-29 09:00:00' },
    ]
    expect(sortByCreateTimeDesc(withBad).map((i) => i.id)).toEqual([2, 1])
  })
})

describe('sortByTimeDesc', () => {
  interface Row {
    id: number
    time: string | null
    takeTime: string | null
  }

  const rows: Row[] = [
    { id: 1, time: '2026-10-21 11:06:01', takeTime: '2026-10-22 10:21:39' },
    { id: 2, time: '2026-10-26 10:36:09', takeTime: '2026-10-22 10:46:19' },
    { id: 3, time: '2026-10-26 15:40:29', takeTime: null },
  ]

  it('按指定字段降序（最新在前），且不修改原数组', () => {
    const sorted = sortByTimeDesc(rows, (i) => i.time)
    expect(sorted.map((i) => i.id)).toEqual([3, 2, 1])
    expect(rows.map((i) => i.id)).toEqual([1, 2, 3])
  })

  it('支持非 createTime 字段（如 takeTime）', () => {
    expect(sortByTimeDesc(rows, (i) => i.takeTime).map((i) => i.id)).toEqual([2, 1, 3])
  })

  it('空值 / 非法时间沉底，不会跑到最上面', () => {
    const withNull = sortByTimeDesc(rows, (i) => i.takeTime)
    expect(withNull.at(-1)?.id).toBe(3)
  })

  it('时间相同时保持原有先后顺序（稳定排序）', () => {
    const sameTime: Row[] = [
      { id: 7, time: '2026-10-26 10:00:00', takeTime: null },
      { id: 8, time: '2026-10-26 10:00:00', takeTime: null },
    ]
    expect(sortByTimeDesc(sameTime, (i) => i.time).map((i) => i.id)).toEqual([7, 8])
  })
})
