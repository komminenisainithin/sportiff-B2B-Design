import { useOrder } from '../context/OrderContext';
import { getSwimmingGogglesTotal, getLevelInfo, getShortFinsTotal, getFinsLevelInfo } from '../utils/levelCalculator';
import { PARTNER_LEVELS, SHORT_FINS_LEVELS } from '../constants/partnerLevels';

function LevelStrip({ label, total, levelInfo, levels }) {
  const { currentLevel, nextLevel, qtyNeeded, progressPercent, isMaxLevel } = levelInfo;

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          {label && (
            <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
          )}
          <span className="text-2xl font-bold text-teal-400 leading-none">{currentLevel.discount}%</span>
          <span className="text-sm font-semibold text-gray-200 truncate">{currentLevel.name}</span>
          {total > 0 && (
            <span className="ml-auto text-xs text-teal-400 font-bold flex-shrink-0">
              {total} pcs ordered
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-400 h-full rounded-full"
              style={{ width: `${progressPercent}%`, transition: 'width 0.6s ease-in-out' }}
            />
          </div>
          <span className="text-xs font-semibold text-teal-400 w-8 text-right">{progressPercent}%</span>
        </div>
        {!isMaxLevel ? (
          <p className="text-xs text-gray-400">
            <span className="font-bold text-teal-400">Add {qtyNeeded} pcs</span> to reach{' '}
            <span className="text-white font-semibold">{nextLevel.name}</span>{' '}
            <span className="text-teal-400">({nextLevel.discount}%)</span>
          </p>
        ) : (
          <p className="text-xs text-teal-300 font-semibold">Maximum partner level reached</p>
        )}
      </div>
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        {[...levels].reverse().map((level) => {
          const isCurrentLevel = level.level === currentLevel.level;
          const isReached = total >= level.minQty;
          return (
            <div
              key={level.level}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-all duration-300 ${
                isCurrentLevel
                  ? 'bg-teal-600 text-white ring-1 ring-teal-300'
                  : isReached
                  ? 'bg-teal-800 text-teal-300'
                  : 'bg-gray-700 text-gray-500'
              }`}
            >
              <span className="font-bold w-7 text-right">{level.discount}%</span>
              <span className="text-gray-300 text-xs">L{level.level}</span>
              {isCurrentLevel && <span className="text-teal-200 text-xs">◀</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PartnerLevelHeader({ filterProductId }) {
  const { orders } = useOrder();
  const swimmingGogglesTotal = getSwimmingGogglesTotal(orders);
  const levelInfo = getLevelInfo(swimmingGogglesTotal);
  const shortFinsTotal = getShortFinsTotal(orders);
  const finsLevelInfo = getFinsLevelInfo(shortFinsTotal);

  const showGoggles = filterProductId === null || filterProductId === undefined || filterProductId === 42;
  const showFins = filterProductId === null || filterProductId === undefined || filterProductId === 86;

  return (
    <div className="sticky top-0 z-40 shadow-sm">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3 flex flex-col gap-4">
        {showGoggles && (
          <LevelStrip
            label={showFins ? 'Goggles' : null}
            total={swimmingGogglesTotal}
            levelInfo={levelInfo}
            levels={PARTNER_LEVELS}
          />
        )}
        {showGoggles && showFins && <div className="border-t border-gray-600" />}
        {showFins && (
          <LevelStrip
            label={showGoggles ? 'Short Fins' : null}
            total={shortFinsTotal}
            levelInfo={finsLevelInfo}
            levels={SHORT_FINS_LEVELS}
          />
        )}
      </div>
    </div>
  );
}
