// Categories parsed from Data/Categories.json
// (original file uses JS comments and multiple objects, so inlined here)

export const gogglesCategories = [
  {
    id: 81,
    name: "SWIMMING GOGGLES FOR FITNESS & TRAINING",
    image: "https://api.sportsdrive.in/storage/media/Category Images/SWIMMING GOGGLES FOR FITNESS & TRAINING/008541_THE_ONE_PLUS_MIRROR_100_BLUE_MIRROR_GREY_BLUE-1.jpg",
    position: 1,
    productId: 42
  },
  {
    id: 108,
    name: "ADULT SWIMMING GOGGLE & CAP SET FOR FITNESS & TRAINING",
    image: "https://api.sportsdrive.in/storage/media/Category Images/ADULT SWIMMING GOGGLE & CAP SET FOR FITNESS & TRAINING/92422_ARENA_POOL_SET_55_SILVER_SMOKE_WHITE_BLACK_001.jpg",
    position: 2,
    productId: 42
  },
  {
    id: 82,
    name: "JUNIOR SWIMMING GOGGLES FOR FITNESS & TRAINING",
    image: "https://api.sportsdrive.in/storage/media/Category Images/JUNIOR SWIMMING GOGGLES FOR FITNESS & TRAINING/008538_ARENA_365_JR_GOGGLES_211_CLEAR_RED_BLUE-1.jpg",
    position: 3,
    productId: 42
  },
  {
    id: 83,
    name: "JUNIOR SWIMMING GOGGLE & CAP SET FOR FITNESS & TRAINING",
    image: "https://api.sportsdrive.in/storage/media/Category Images/JUNIOR SWIMMING GOGGLES & CAP FOR FITNESS & TRAINING/003_Category_JUNIOR-SWIMMING-GOGGLES-&-CAP-FOR-FITNESS-&-TRAINING.jpg",
    position: 4,
    productId: 42
  },
  {
    id: 55,
    name: "SWIMMING GOGGLES FOR RACING & COMPETITION",
    image: "https://api.sportsdrive.in/storage/media/Category Images/SWIMMING GOGGLES FOR RACING & COMPETITION/006870_COBRA_EDGE_SWIPE_MR_102_GOLD_WHITE_BLACK_001.jpg",
    position: 5,
    productId: 42
  },
  {
    id: 14,
    name: "JUNIOR SWIMMING GOGGLES FOR RACING & COMPETITION",
    image: "https://api.sportsdrive.in/storage/media/Category Images/JUNIOR SWIMMING GOGGLES FOR RACING & COMPETITION/011007-120-PYTHON JUNIOR MR-001.jpg",
    position: 6,
    productId: 42
  },
  {
    id: 106,
    name: "SWIMMING GOGGLES FOR OPEN WATER & TRIATHLON",
    image: "https://api.sportsdrive.in/storage/media/Category Images/SWIMMING GOGGLES FOR OPEN WATER & TRIATHLON/003_Category_SWIMMING-GOGGLES-FOR-OPEN-WATER_TRIATHLON.jpg",
    position: 7,
    productId: 42
  }
]

export const capsCategories = [
  {
    id: 84,
    name: "SWIMMING CAPS FOR FITNESS & TRAINING",
    image: "https://api.sportsdrive.in/storage/media/Category Images/SWIMMING CAPS FOR FITNESS & TRAINING/1E368_Print_2_273_FIREFLOW_001.jpg",
    position: 8,
    productId: 79
  },
  {
    id: 85,
    name: "JUNIOR SWIMMING CAPS FOR FITNESS & TRAINING",
    image: "https://api.sportsdrive.in/storage/media/Category Images/JUNIOR SWIMMING CAPS FOR FITNESS & TRAINING/006360_SILICONE_JR_CAP_904_BLUE_MULTI_001.jpg",
    position: 9,
    productId: 79
  },
  {
    id: 80,
    name: "SWIMMING CAPS FOR RACING & COMPETITION",
    image: "https://api.sportsdrive.in/storage/media/Category Images/RACING & COMPETITION SWIMMING CAPS/000400_3D_SOFT_501_BLACK_New_With_Stripe_001.jpg",
    position: 10,
    productId: 79
  }
]

export const finsCategories = [
  {
    id: 86,
    name: "SHORT SWIMMING FINS",
    image: "https://api.sportsdrive.in/storage/media/Category Images/SHORT TRAINING FINS/006151_POWERFIN_PRO_II_210_SAGE_ARTIC_LIME_001.jpg",
    position: 15,
    productId: 86
  },
  {
    id: 87,
    name: "LONG SWIMMING FINS",
    image: "https://api.sportsdrive.in/storage/media/Category Images/LONG TRAINING FINS/M0746-05-4-05W_POOL_COLOUR_LONG_FLOATING_FINS_RED_UK_5-7_001.jpg",
    position: 16,
    productId: 86
  }
]

export const allCategories = [
  ...gogglesCategories,
  ...capsCategories,
  ...finsCategories
]

// Map from product ID → its categories
export const categoryByProduct = {
  42: gogglesCategories,  // Swimming Goggles
  79: capsCategories,     // Swimming Caps
  86: finsCategories,     // Swimming Fins
}
