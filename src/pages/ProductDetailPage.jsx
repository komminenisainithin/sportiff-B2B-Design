import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import CategoryAccordion from '../components/CategoryAccordion'
import products from '../data/products'
import categoriesItems from '../data/categoriesItems'

export default function ProductDetailPage() {
  const { productId } = useParams()

  const product = products.find(p => String(p.id) === String(productId))

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-500">Product not found.</p>
        </main>
      </div>
    )
  }

  const productCategoryGroups = categoriesItems.filter(
    ({ category }) => category.product_id === Number(productId)
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Product title bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: product.name }]} />
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <h1 className="text-lg font-bold text-gray-900 uppercase">{product.name}</h1>
          </div>
        </div>
      </div>

      <main className="max-w-full mx-auto ">
        {productCategoryGroups.length > 0 ? (
          <div className="flex flex-col gap-2">
            {productCategoryGroups.map(({ category, items }, idx) => (
              <CategoryAccordion
                key={category.id}
                category={category}
                items={items}
                defaultOpen={idx === 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No categories available for this product yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
