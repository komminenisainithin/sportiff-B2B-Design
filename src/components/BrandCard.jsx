import { useNavigate } from 'react-router-dom'

export default function BrandCard({ brand }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
    onClick={() => navigate(`/brands/${brand.id}`)}>
      {/* Logo box */}
      <div className="bg-black rounded-xl w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img
          src={brand.image}
          alt={brand.name}
          className="w-16 h-16 object-contain"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.classList.add('bg-gray-800')
          }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <p className="text-base font-bold text-gray-900 uppercase">{brand.name}</p>
        <p className="text-xs text-gray-400">View All products</p>
        <button
          
          className="text-teal-600 text-sm font-medium text-left hover:underline"
        >
          See Products →
        </button>
      </div>
    </div>
  )
}
