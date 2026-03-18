export default function GridCard({ item, onClick }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      {/* Image */}
      <div className="w-full h-40  overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="160" fill="%23e5e7eb"%3E%3Crect width="200" height="160"/%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm font-bold text-gray-900 uppercase leading-tight">{item.name}</p>
        {item.subtitle && (
          <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
        )}
        {item.brand && (
          <span className="inline-block mt-2 text-xs bg-teal-50 text-teal-700 font-medium px-2 py-0.5 rounded-full">
            {item.brand}
          </span>
        )}
      </div>
    </div>
  )
}
