import offersData from '../../Data/offers.json';
import categoriesItems from './categoriesItems';
import { getParentDetails } from './orders';
import { PARTNER_LEVELS } from '../constants/partnerLevels';

const offers = offersData?.offers ?? [];

/** Get the five partner level name by discount (28, 30, 33, 35, 37) for display; null if no match */
function getPartnerLevelNameByDiscount(discount) {
  const d = Number(discount);
  const level = PARTNER_LEVELS.find((l) => l.discount === d);
  return level?.name ?? null;
}

/** Parse category_ids string to array of numbers */
function getCategoryIdsByOffer(offer) {
  const str = offer?.category_ids || '';
  return str.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
}

/**
 * Find an offer that applies to the given product id (returns first match).
 * product_ids in offer can be "42" or "42,86" etc.
 */
export function getOfferByProductId(productId) {
  const id = String(productId);
  return offers.find((o) => {
    const ids = (o.product_ids || '').split(',').map((s) => s.trim()).filter(Boolean);
    return ids.includes(id);
  }) || null;
}

/** All offers that apply to this product id */
export function getOffersByProductId(productId) {
  const id = String(productId);
  return offers.filter((o) => {
    const ids = (o.product_ids || '').split(',').map((s) => s.trim()).filter(Boolean);
    return ids.includes(id);
  });
}

/** Get offer by id */
export function getOfferById(offerId) {
  const id = Number(offerId);
  return offers.find((o) => o.id === id) || null;
}

/** Parent names that belong to this offer (from its category_ids) */
export function getParentNamesByOfferId(offerId) {
  const offer = getOfferById(offerId);
  if (!offer) return new Set();
  const categoryIds = new Set(getCategoryIdsByOffer(offer));
  const parentNames = new Set();
  categoriesItems.forEach((group) => {
    if (!categoryIds.has(Number(group.category?.id))) return;
    (group.items || []).forEach((item) => {
      if (item.parent_name) parentNames.add(item.parent_name);
    });
  });
  return parentNames;
}

/** Which offer id does this category belong to (first matching offer) */
export function getOfferIdByCategoryId(categoryId) {
  const cid = Number(categoryId);
  const offer = offers.find((o) => getCategoryIdsByOffer(o).includes(cid));
  return offer ? offer.id : null;
}

/** Which offer id does this parent belong to (by product + category); null if no offer */
export function getOfferIdForParent(parentName) {
  const details = getParentDetails(parentName);
  if (!details?.product_id) return null;
  const productId = details.product_id;
  let parentCategoryId = null;
  for (const group of categoriesItems) {
    const found = (group.items || []).some((i) => i.parent_name === parentName);
    if (found) {
      parentCategoryId = group.category?.id;
      break;
    }
  }
  if (parentCategoryId == null) return null;
  const productOffers = getOffersByProductId(productId);
  const offer = productOffers.find((o) => getCategoryIdsByOffer(o).includes(Number(parentCategoryId)));
  return offer ? offer.id : null;
}

/**
 * Build level-like object from offer_quantities tier.
 * Tiers are sorted by quantity asc; current tier = highest tier where totalQty >= quantity.
 */
export function getLevelInfoFromOffer(offer, totalQty) {
  const tiers = (offer?.offer_quantities || [])
    .map((t) => ({ quantity: Number(t.quantity), discount: parseFloat(t.discount) || 0 }))
    .filter((t) => !Number.isNaN(t.quantity))
    .sort((a, b) => a.quantity - b.quantity);

  if (tiers.length === 0) {
    return {
      currentLevel: { level: 1, minQty: 0, discount: 0, name: 'No tiers', description: '' },
      nextLevel: null,
      qtyNeeded: 0,
      progressPercent: 0,
      isMaxLevel: true
    };
  }

  let currentTier = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalQty >= tiers[i].quantity) {
      currentTier = tiers[i];
      break;
    }
  }

  const currentIndex = tiers.findIndex((t) => t.quantity === currentTier.quantity);
  const nextTier = currentIndex >= 0 && currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  const currentLevelName = getPartnerLevelNameByDiscount(currentTier.discount) ?? `${offer?.name ?? 'Offer'} (${currentTier.discount}%)`;
  const currentLevel = {
    level: currentIndex + 1,
    minQty: currentTier.quantity,
    discount: currentTier.discount,
    name: currentLevelName,
    description: nextTier ? `${currentTier.quantity}-${nextTier.quantity - 1} pcs` : `${currentTier.quantity}+ pcs`
  };

  const nextLevelName = nextTier
    ? (getPartnerLevelNameByDiscount(nextTier.discount) ?? `${offer?.name ?? 'Offer'} (${nextTier.discount}%)`)
    : null;
  const nextLevel = nextTier
    ? {
        level: currentIndex + 2,
        minQty: nextTier.quantity,
        discount: nextTier.discount,
        name: nextLevelName,
        description: `${nextTier.quantity}+ pcs`
      }
    : null;

  const qtyNeeded = nextTier ? Math.max(0, nextTier.quantity - totalQty) : 0;

  let progressPercent = 100;
  if (nextTier) {
    const range = nextTier.quantity - currentTier.quantity;
    const progress = totalQty - currentTier.quantity;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  return {
    currentLevel,
    nextLevel,
    qtyNeeded,
    progressPercent,
    isMaxLevel: !nextTier
  };
}
