import { useNavigate } from 'react-router-dom';

export default function OrderNowButton({ productId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    const path = productId != null && productId !== '' ? `/orders?product=${productId}` : '/orders';
    navigate(path);
  };

  return (
    <button
      onClick={handleClick}
      className="mt-3 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
    >
      Order Now
    </button>
  );
}
