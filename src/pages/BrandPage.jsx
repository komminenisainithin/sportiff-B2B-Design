import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import ProductCard from '../components/ProductCard'
import brands from '../data/brands'
import products from '../data/products'

export default function BrandPage() {
  const { brandId } = useParams()

  const brand = brands.find(b => String(b.id) === String(brandId))
  const sortedProducts = [...products].sort((a, b) => a.position - b.position)

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="max-w-full mx-auto px-6 py-8">
          <p className="text-gray-500">Brand not found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Brand hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-6 flex items-center gap-5">
          <div className="bg-black rounded-2xl w-20 h-20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={brand.image}
              alt={brand.name}
              className="w-16 h-16 object-contain"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <div>
            <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: brand.name }]} />
            <h1 className="text-2xl font-bold text-gray-900 uppercase mt-1">{brand.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">View all products from this brand</p>
          </div>
        </div>
      </div>

      <main className="max-w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-400">{sortedProducts.length} product types</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              productCount={0}
              variantCount={0}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
