import raw from '../../Data/categories_wise_items.json'

// Sorted array of { category, items } by category position
const categoriesItems = Object.values(raw.data || {}).sort(
  (a, b) => (a.category?.position ?? 0) - (b.category?.position ?? 0)
)

/**
 * Get catalogue product id for /catalogue/product/{id} by parent_name.
 * Looks up in categories_wise_items (item.id where item.parent_name === parentName).
 */
export function getCatalogueIdByParentName(parentName) {
  if (!parentName) return null
  for (const group of categoriesItems) {
    const item = (group.items || []).find((i) => i.parent_name === parentName)
    if (item && item.id != null) return item.id
  }
  return null
}

export default categoriesItems
