import { useState } from 'react';
import { getUniqueParents } from '../data/orders';

export default function OrderParentTabs({ onSelectParent, renderContent }) {
  const parents = getUniqueParents();
  const [activeParent, setActiveParent] = useState(parents[0]?.parent_name || null);

  const handleTabChange = (parentName) => {
    setActiveParent(parentName);
    onSelectParent?.(parentName);
  };

  return (
    <div className="w-full">
      {/* Horizontal Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-300 bg-white rounded-t-2xl">
        {parents.map(parent => (
          <button
            key={parent.parent_name}
            onClick={() => handleTabChange(parent.parent_name)}
            className={`flex-shrink-0 px-6 py-4 font-semibold text-sm transition-colors duration-200 ${
              activeParent === parent.parent_name
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {parent.item_image && (
                <img
                  src={parent.item_image}
                  alt={parent.parent_name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  className="w-8 h-8 object-cover rounded"
                />
              )}
              <span className="truncate max-w-xs">{parent.parent_name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-2xl shadow-sm p-6">
        {activeParent && renderContent(activeParent)}
      </div>
    </div>
  );
}
