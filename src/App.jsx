import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import BrandPage from './pages/BrandPage'
import ProductDetailPage from './pages/ProductDetailPage'
import OrdersPage from './pages/OrdersPage'
import CartPage from './pages/CartPage'
import VariantDetailPage from './pages/VariantDetailPage'
import { OrderProvider } from './context/OrderContext'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <OrderProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brands/:brandId" element={<BrandPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/variant-detail" element={<VariantDetailPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </OrderProvider>
    </BrowserRouter>
  )
}
