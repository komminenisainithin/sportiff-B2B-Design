export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-gray-200 w-full">
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => onTabChange(index)}
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors
              ${activeTab === index
                ? 'border-b-2 border-teal-600 text-teal-600'
                : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
