import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import BrandCard from '../components/BrandCard'
import ProductCard from '../components/ProductCard'
import brands from '../data/brands'
import products from '../data/products'

// Product counts from real data (bags has 7 products / 19 variants as shown in screenshot)
const productMeta = {
  42: { productCount: 0, variantCount: 0 },  // Swimming Goggles
  79: { productCount: 0, variantCount: 0 },  // Swimming Caps
  86: { productCount: 0, variantCount: 0 },  // Swimming Fins
  93: { productCount: 7, variantCount: 19 }, // Swimming Bags
  91: { productCount: 0, variantCount: 0 },  // Swimming Snorkels
  87: { productCount: 0, variantCount: 0 },  // Swimming Hand Paddles
  88: { productCount: 0, variantCount: 0 },  // Swimming Finger Paddles
  95: { productCount: 0, variantCount: 0 },  // Swimming Resistance Training Equipment
  94: { productCount: 0, variantCount: 0 },  // Swimming Kickboards
  90: { productCount: 0, variantCount: 0 },  // Swimming Pullbuoys
  92: { productCount: 0, variantCount: 0 },  // Swimming Accessories
  96: { productCount: 0, variantCount: 0 },  // Swimming Goggle Case
}

export default function HomePage() {
  const sortedBrands = [...brands].sort((a, b) => a.position - b.position)
  const sortedProducts = [...products].sort((a, b) => a.position - b.position)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-full mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'All brands' }]} />
        {/* All brands section */}
        <div className="mb-10 mt-2">
          <h1 className="text-2xl font-bold text-gray-900">All brands</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a brand to see categories and the discount you&apos;ll get.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {sortedBrands.map(brand => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>

        {/* Products section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click a product to see categories and variants (colours/sizes).
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {sortedProducts.map(product => {
              const meta = productMeta[product.id] || { productCount: 0, variantCount: 0 }
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  productCount={meta.productCount}
                  variantCount={meta.variantCount}
                />
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
