import type { SystemConnection } from '../data/types'

export const SYSTEM_CATEGORY_ORDER = [
  'ERP/MRP System',
  'Department Software',
  'Spreadsheet/Tracker',
  'QMS / Compliance',
  'AI/Automation',
]

export function dasharrayForLineStyle(lineStyle: string): string | undefined {
  if (lineStyle === 'dash') return '8 5'
  if (lineStyle === 'dot') return '2 5'
  return undefined
}

export interface SystemCategoryStyle {
  category: string
  stroke: string
  dasharray?: string
  animated: boolean
}

/**
 * One representative style per system category, derived from the actual
 * connection data rather than hardcoded — so the legend always matches what's
 * drawn on the canvas even if the workbook's colors/styles change.
 */
export function buildSystemCategoryStyles(connections: SystemConnection[]): SystemCategoryStyle[] {
  const byCategory = new Map<string, SystemConnection[]>()
  for (const c of connections) {
    const list = byCategory.get(c.systemCategory) ?? []
    list.push(c)
    byCategory.set(c.systemCategory, list)
  }

  const mostCommon = <T,>(values: T[]): T => {
    const counts = new Map<T, number>()
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
  }

  const categories = [...byCategory.keys()].sort((a, b) => {
    const ia = SYSTEM_CATEGORY_ORDER.indexOf(a)
    const ib = SYSTEM_CATEGORY_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  return categories.map((category) => {
    const rows = byCategory.get(category)!
    return {
      category,
      stroke: mostCommon(rows.map((r) => r.lineColor)),
      dasharray: dasharrayForLineStyle(mostCommon(rows.map((r) => r.lineStyle))),
      animated: rows.some((r) => r.animated),
    }
  })
}
