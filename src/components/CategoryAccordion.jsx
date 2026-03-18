import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOfferIdByCategoryId } from '../data/offers'

function ItemCard({ item, category }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0 w-32 hover:shadow-md transition-shadow flex flex-col">
      <div className="w-full h-28 bg-gray-50 overflow-hidden cursor-pointer">
        <img
          src={item.item_image}
          alt={item.parent_name}
          className="w-full h-full object-contain p-1"
          onClick={() => {
            const offerId = category ? getOfferIdByCategoryId(category.id) : null
            navigate(offerId != null ? `/orders?product=${item.product_id}&offer=${offerId}` : `/orders?product=${item.product_id}`)
          }}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="112" fill="%23e5e7eb"%3E%3Crect width="128" height="112"/%3E%3C/svg%3E'
          }}
        />
      </div>
      <div className="p-2 flex-1 flex flex-col">
        <p className="text-xs font-bold text-gray-500 uppercase">{item.brand_name}</p>
        <p className="text-xs font-semibold text-gray-900 leading-tight mt-0.5 line-clamp-2">
          {item.parent_name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{item.product_name}</p>
        <p className="text-xs text-gray-400">
          Sizes: {item.sizes_count} &nbsp;Colours: {item.colours_count}
        </p>
        <p className="text-xs font-bold text-teal-600 mt-1">
          MRP ₹{Number(item.mrp_price).toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  )
}

export default function CategoryAccordion({ category, items, defaultOpen = false }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <span className="flex-1 text-sm font-semibold text-gray-900 text-left uppercase">
          {category.name}
        </span>
        <span className="text-xs text-gray-400 mr-3">{items.length} models</span>

        <button
          onClick={(e) => {
            e.stopPropagation()
            const offerId = getOfferIdByCategoryId(category.id)
            navigate(offerId != null ? `/orders?product=${category.product_id}&offer=${offerId}` : `/orders?product=${category.product_id}`)
          }}
          className="mt-2 w-max bg-teal-600 hover:bg-teal-700 text-white font-semibold py-1.5 px-2 rounded text-xs transition-colors duration-200"
        >
          Order Now
        </button>

        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded item grid */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex flex-wrap gap-3">
            {items.map(item => (
              <ItemCard key={item.id} item={item} category={category} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
