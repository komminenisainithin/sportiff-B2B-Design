import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product, productCount = 0, variantCount = 0 }) {
  const navigate = useNavigate()

  const countText = variantCount > 0
    ? `${productCount} products · ${variantCount} variants`
    : `${productCount} products`

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Product image box */}
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e5e7eb"%3E%3Crect width="80" height="80"/%3E%3C/svg%3E'
          }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-gray-900 uppercase leading-tight">{product.name}</p>
        <p className="text-xs text-gray-400">{countText}</p>
        <button className="text-teal-600 text-sm font-medium text-left hover:underline">
          View all Categories →
        </button>
      </div>
    </div>
  )
}
