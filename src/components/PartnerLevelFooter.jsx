import { useOrder } from '../context/OrderContext';
import { getSwimmingGogglesTotal, getLevelInfo, getShortFinsTotal, getFinsLevelInfo } from '../utils/levelCalculator';

export default function PartnerLevelFooter() {
  const { orders } = useOrder();
  const swimmingGogglesTotal = getSwimmingGogglesTotal(orders);
  const levelInfo = getLevelInfo(swimmingGogglesTotal);
  const shortFinsTotal = getShortFinsTotal(orders);
  const finsLevelInfo = getFinsLevelInfo(shortFinsTotal);

  const { currentLevel, nextLevel, qtyNeeded } = levelInfo;

  return (
    <div className="bg-teal-50 border-t border-teal-200 px-6 py-4">
      <div className="space-y-4">
        {/* Goggles */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Goggles — Current Partner Level</p>
            <p className="text-lg font-bold text-gray-900">
              {currentLevel.name}
              <span className="text-teal-600 ml-2">({currentLevel.discount}% discount)</span>
            </p>
          </div>
          <div className="flex-1 text-right">
            {!levelInfo.isMaxLevel ? (
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Level:</p>
                <p className="text-sm font-semibold text-teal-600">
                  Add <span className="text-lg font-bold">{qtyNeeded} pcs</span> to reach{' '}
                  <span className="font-bold text-gray-900">{nextLevel.name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">({nextLevel.discount}% discount)</p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-teal-600">Maximum Level Reached</p>
            )}
          </div>
        </div>

        {/* Short Fins */}
        <div className="flex items-center justify-between gap-4 border-t border-teal-200 pt-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Short Fins — Current Partner Level</p>
            <p className="text-lg font-bold text-gray-900">
              {finsLevelInfo.currentLevel.name}
              <span className="text-teal-600 ml-2">({finsLevelInfo.currentLevel.discount}% discount)</span>
            </p>
          </div>
          <div className="flex-1 text-right">
            {!finsLevelInfo.isMaxLevel ? (
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Level:</p>
                <p className="text-sm font-semibold text-teal-600">
                  Add <span className="text-lg font-bold">{finsLevelInfo.qtyNeeded} pcs</span> to reach{' '}
                  <span className="font-bold text-gray-900">{finsLevelInfo.nextLevel.name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">({finsLevelInfo.nextLevel.discount}% discount)</p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-teal-600">Maximum Level Reached</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
