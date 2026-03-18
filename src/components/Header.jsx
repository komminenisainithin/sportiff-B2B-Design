import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
          SIPL <span className="text-teal-600">B2B</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span className="text-gray-300">|</span>
          <Link to="/cart" className="text-gray-400 hover:text-gray-900">Cart</Link>
          
        </nav>
      </div>
    </header>
  )
}
