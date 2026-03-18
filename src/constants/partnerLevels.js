/**
 * Partner Level Configuration
 * Offering applies to: (1) Swimming Goggles – PARTNER_LEVELS; (2) Short Fins – SHORT_FINS_LEVELS.
 * Defines tiers based on order quantity per product type.
 */

export const PARTNER_LEVELS = [
  {
    level: 1,
    minQty: 1,
    discount: 28,
    name: "Developing Entry Level Partner",
    description: "1-23 pcs"
  },
  {
    level: 2,
    minQty: 24,
    discount: 30,
    name: "Committed Growth Partner",
    description: "24-59 pcs"
  },
  {
    level: 3,
    minQty: 60,
    discount: 33,
    name: "Range Expansion Partner",
    description: "60-95 pcs"
  },
  {
    level: 4,
    minQty: 96,
    discount: 35,
    name: "High Volume Category Partner",
    description: "96-143 pcs"
  },
  {
    level: 5,
    minQty: 144,
    discount: 37,
    name: "Apex Strategic Partner",
    description: "144+ pcs"
  }
];

/**
 * Short Swimming Fins Partner Levels
 * Based on total fins quantity (all colors & sizes combined)
 */

export const SHORT_FINS_LEVELS = [
  {
    level: 1,
    minQty: 1,
    discount: 20,
    name: "Starter Fins Partner",
    description: "1-11 pcs"
  },
  {
    level: 2,
    minQty: 12,
    discount: 23,
    name: "Growth Fins Partner",
    description: "12-23 pcs"
  },
  {
    level: 3,
    minQty: 24,
    discount: 26,
    name: "Active Fins Partner",
    description: "24-47 pcs"
  },
  {
    level: 4,
    minQty: 48,
    discount: 30,
    name: "High Volume Fins Partner",
    description: "48-71 pcs"
  },
  {
    level: 5,
    minQty: 72,
    discount: 33,
    name: "Elite Fins Partner",
    description: "72-95 pcs"
  },
  {
    level: 6,
    minQty: 96,
    discount: 36,
    name: "Strategic Fins Partner",
    description: "96+ pcs"
  }
];
export const getFinsLevelByQty = (qty) => {
  for (let i = SHORT_FINS_LEVELS.length - 1; i >= 0; i--) {
    if (qty >= SHORT_FINS_LEVELS[i].minQty) {
      return SHORT_FINS_LEVELS[i];
    }
  }
  return SHORT_FINS_LEVELS[0];
};

/**
 * Get next Short Fins level after current quantity
 * @param {number} qty - Total Short Fins quantity
 * @returns {object|null} Next level object or null if at max level
 */
export const getNextFinsLevelByQty = (qty) => {
  const currentLevel = getFinsLevelByQty(qty);
  const nextLevelObj = SHORT_FINS_LEVELS.find(l => l.level === currentLevel.level + 1);
  return nextLevelObj || null;
};

/**
 * Get level by quantity
 * @param {number} qty - Total Swimming Goggles quantity
 * @returns {object} Level object matching the quantity
 */
export const getLevelByQty = (qty) => {
  for (let i = PARTNER_LEVELS.length - 1; i >= 0; i--) {
    if (qty >= PARTNER_LEVELS[i].minQty) {
      return PARTNER_LEVELS[i];
    }
  }
  return PARTNER_LEVELS[0];
};

/**
 * Get next level after current quantity
 * @param {number} qty - Total Swimming Goggles quantity
 * @returns {object|null} Next level object or null if at max level
 */
export const getNextLevelByQty = (qty) => {
  const currentLevel = getLevelByQty(qty);
  const nextLevelObj = PARTNER_LEVELS.find(l => l.level === currentLevel.level + 1);
  return nextLevelObj || null;
};
