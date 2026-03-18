// Import orders data from Data folder (goggles + fins + extra items e.g. goggle case, kickboards, bags)
import ordersDataRaw from '../../Data/orders_data.json';
import finsDataRaw from '../../Data/FINS.json';
import ordersDataExtraRaw from '../../Data/orders_data_extra.json';
import stockData from '../../Data/stock.json';
import categoriesItems from './categoriesItems';

/** Category ids for SWIMMING GOGGLES FOR RACING & COMPETITION (offer 142) */
const RACING_COMPETITION_CATEGORY_IDS = new Set([55, 14]);

/** Shared size ID for all Racing & Competition synthetic items so the cart shows one "ONE SIZE" column */
const RACING_SYNTHETIC_SIZE_ID = 900001;

/**
 * Build order-item-shaped objects from categories_wise_items for Racing & Competition (categories 55, 14).
 * Each item gets one placeholder variant/size/colour so it appears and is orderable on the Orders page.
 */
function getRacingCompetitionOrderItems() {
  const result = [];
  for (const group of categoriesItems) {
    const catId = group.category?.id;
    if (catId == null || !RACING_COMPETITION_CATEGORY_IDS.has(Number(catId))) continue;
    for (const item of group.items || []) {
      if (!item.parent_name) continue;
      const variantId = 900000 + item.id;
      const sizeId = RACING_SYNTHETIC_SIZE_ID;
      const colourId = 900000 + item.id * 1000 + 2;
      result.push({
        id: item.id,
        parent_name: item.parent_name,
        parent_description: item.parent_description || item.parent_name,
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        product_id: item.product_id,
        product_name: item.product_name,
        item_image: item.item_image,
        brand_image: item.brand_image,
        product_image: item.product_image,
        mrp_price: item.mrp_price,
        variants: [
          { id: variantId, mrp_price: item.mrp_price, primary_image: item.item_image }
        ],
        sizes: [{ attribute_value_id: sizeId, sales_size: 'ONE SIZE' }],
        colours: [
          { attribute_value_id: colourId, colour_id: '0', name: 'Default' }
        ],
        colours_info: {
          [colourId]: { variant_id: [variantId], size_id: [sizeId] }
        }
      });
    }
  }
  return result;
}

const racingCompetitionItems = getRacingCompetitionOrderItems();

// Merge goggles (orders_data), fins (FINS), extra API data, and Racing & Competition items so all show in Orders
const ordersData = [
  ...(ordersDataRaw.data || []),
  ...(finsDataRaw.data || []),
  ...(ordersDataExtraRaw.data || []),
  ...racingCompetitionItems
];

// Group orders by unique parent_name
export const getUniqueParents = () => {
  const parentMap = new Map();

  ordersData.forEach(item => {
    if (!parentMap.has(item.parent_name)) {
      parentMap.set(item.parent_name, item);
    }
  });

  return Array.from(parentMap.values());
};

// Get all variants for a specific parent
export const getVariantsByParent = (parentName) => {
  const parentItem = ordersData.find(item => item.parent_name === parentName);
    return parentItem ? parentItem.colours.map(colour => {
    const variant = parentItem.variants[0]; // Get first variant as representative
    return {
      ...colour,
      ...parentItem,
      colourInfo: parentItem.colours_info?.[colour.attribute_value_id]
    };
  }) : [];
};

// Get all details for a parent (including variants, colours, sizes)
export const getParentDetails = (parentName) => {
  return ordersData.find(item => item.parent_name === parentName);
};

/**
 * Static stock by variant id (from Data/stock.json).
 * Returns undefined if variant has no entry (caller can fall back to mock).
 */
export const getStockForVariant = (variantId) => {
  if (variantId == null) return undefined;
  const key = String(variantId);
  return stockData[key] !== undefined ? stockData[key] : undefined;
};

export default ordersData;
