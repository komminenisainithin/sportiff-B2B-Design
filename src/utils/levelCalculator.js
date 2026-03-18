import { getLevelByQty, getNextLevelByQty, getFinsLevelByQty, getNextFinsLevelByQty } from '../constants/partnerLevels';
import { getParentDetails } from '../data/orders';
import { getOfferByProductId, getLevelInfoFromOffer } from '../data/offers';

const GOGGLES_PRODUCT_ID = 42;

/**
 * Calculate total Swimming Goggles quantity from orders
 * @param {object} orders - Order state from OrderContext
 * @returns {number} Total Swimming Goggles quantity
 */
export const getSwimmingGogglesTotal = (orders) => {
  let total = 0;

  Object.keys(orders).forEach(parentName => {
    const parentDetails = getParentDetails(parentName);

    // Only count if this parent's product is "SWIMMING GOGGLES"
    if (parentDetails && parentDetails.product_name === 'SWIMMING GOGGLES') {
      // Sum all quantities for this parent
      Object.keys(orders[parentName]).forEach(colorId => {
        Object.keys(orders[parentName][colorId]).forEach(sizeId => {
          const qty = orders[parentName][colorId][sizeId];
          total += parseInt(qty) || 0;
        });
      });
    }
  });

  return total;
};

/**
 * Calculate total Short Fins (SWIMMING FINS, product_id 86) quantity from orders
 * @param {object} orders - Order state from OrderContext
 * @returns {number} Total Short Fins quantity
 */
export const getShortFinsTotal = (orders) => {
  let total = 0;

  Object.keys(orders).forEach(parentName => {
    const parentDetails = getParentDetails(parentName);

    if (parentDetails && (parentDetails.product_id === 86 || parentDetails.product_name === 'SWIMMING FINS')) {
      Object.keys(orders[parentName]).forEach(colorId => {
        Object.keys(orders[parentName][colorId]).forEach(sizeId => {
          const qty = orders[parentName][colorId][sizeId];
          total += parseInt(qty) || 0;
        });
      });
    }
  });

  return total;
};

/**
 * Get current level based on Swimming Goggles quantity (uses offer from Data/offers.json when available)
 */
export const getCurrentLevel = (totalQty) => {
  const offer = getOfferByProductId(GOGGLES_PRODUCT_ID);
  if (offer) return getLevelInfoFromOffer(offer, totalQty).currentLevel;
  return getLevelByQty(totalQty);
};

/**
 * Get next level for given quantity
 */
export const getNextLevel = (totalQty) => {
  const offer = getOfferByProductId(GOGGLES_PRODUCT_ID);
  if (offer) return getLevelInfoFromOffer(offer, totalQty).nextLevel;
  return getNextLevelByQty(totalQty);
};

/**
 * Calculate quantity needed to reach next level
 */
export const getQtyNeededForNextLevel = (totalQty) => {
  const offer = getOfferByProductId(GOGGLES_PRODUCT_ID);
  if (offer) return getLevelInfoFromOffer(offer, totalQty).qtyNeeded;
  const nextLevel = getNextLevelByQty(totalQty);
  if (!nextLevel) return 0;
  return Math.max(0, nextLevel.minQty - totalQty);
};

/**
 * Calculate progress percentage between current and next level
 */
export const getProgressPercentage = (totalQty) => {
  const offer = getOfferByProductId(GOGGLES_PRODUCT_ID);
  if (offer) return getLevelInfoFromOffer(offer, totalQty).progressPercent;
  const currentLevel = getLevelByQty(totalQty);
  const nextLevel = getNextLevelByQty(totalQty);
  if (!nextLevel) return 100;
  const range = nextLevel.minQty - currentLevel.minQty;
  const progress = totalQty - currentLevel.minQty;
  const percentage = Math.round((progress / range) * 100);
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Get level info for display (uses Data/offers.json for product 42 when available)
 * @param {number} totalQty - Total Swimming Goggles quantity
 * @returns {object} Object with currentLevel, nextLevel, qtyNeeded, progressPercent, isMaxLevel
 */
export const getLevelInfo = (totalQty) => {
  const offer = getOfferByProductId(GOGGLES_PRODUCT_ID);
  if (offer) return getLevelInfoFromOffer(offer, totalQty);
  const currentLevel = getLevelByQty(totalQty);
  const nextLevel = getNextLevelByQty(totalQty);
  return {
    currentLevel,
    nextLevel,
    qtyNeeded: getQtyNeededForNextLevel(totalQty),
    progressPercent: getProgressPercentage(totalQty),
    isMaxLevel: !nextLevel
  };
};

/**
 * Quantity needed to reach next Short Fins level
 * @param {number} totalQty - Total Short Fins quantity
 * @returns {number} Units needed (0 if at max level)
 */
export const getFinsQtyNeededForNextLevel = (totalQty) => {
  const nextLevel = getNextFinsLevelByQty(totalQty);
  if (!nextLevel) return 0;
  return Math.max(0, nextLevel.minQty - totalQty);
};

/**
 * Progress percentage between current and next Short Fins level
 * @param {number} totalQty - Total Short Fins quantity
 * @returns {number} Progress percentage (0-100)
 */
export const getFinsProgressPercentage = (totalQty) => {
  const currentLevel = getFinsLevelByQty(totalQty);
  const nextLevel = getNextFinsLevelByQty(totalQty);
  if (!nextLevel) return 100;
  const currentLevelQty = currentLevel.minQty;
  const nextLevelQty = nextLevel.minQty;
  const range = nextLevelQty - currentLevelQty;
  const progress = totalQty - currentLevelQty;
  const percentage = Math.round((progress / range) * 100);
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Get Short Fins level info for display
 * @param {number} totalQty - Total Short Fins quantity
 * @returns {object} Object with currentLevel, nextLevel, qtyNeeded, progressPercent, isMaxLevel
 */
export const getFinsLevelInfo = (totalQty) => {
  const currentLevel = getFinsLevelByQty(totalQty);
  const nextLevel = getNextFinsLevelByQty(totalQty);
  const qtyNeeded = getFinsQtyNeededForNextLevel(totalQty);
  const progressPercent = getFinsProgressPercentage(totalQty);

  return {
    currentLevel,
    nextLevel,
    qtyNeeded,
    progressPercent,
    isMaxLevel: !nextLevel
  };
};
