import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function QuantityStepper({ value = 0, onChange, min = 0, stock = 0 }) {
  const clampedValue = Math.max(min, typeof value === 'number' ? value : 0);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(clampedValue));
  const inputRef = useRef(null);

  const getStockStyles = () => {
    if (stock === 0) return 'bg-gray-900 text-black';
    if (stock >= 1 && stock <= 9) return 'bg-red-600 text-white';
    if (stock >= 10 && stock <= 19) return 'bg-amber-600 text-white';
    return 'bg-green-600 text-white';
  };

  const showOutOfStock = () => {
    toast.error('Out of stock — this variant is currently unavailable.');
  };

  const showLimitReached = (n) => {
    toast.error(`Limit reached — only ${n} units in stock.`);
  };

  const showCartToast = () => {
    toast.success('Item added to cart', { id: 'cart-toast' });
  };

  const applyInput = () => {
    const parsed = parseInt(inputValue, 10);
    const num = Number.isNaN(parsed) || parsed < min ? min : Math.floor(parsed);
    const capped = Math.min(Math.max(num, min), stock);

    if (num > stock) {
      showLimitReached(stock);
      onChange(capped);
    } else if (stock === 0 && num > 0) {
      showOutOfStock();
      onChange(0);
    } else {
      onChange(capped);
      if (capped > clampedValue) showCartToast();
    }
    setInputValue(String(capped));
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInput();
    }
    if (e.key === 'Escape') {
      setInputValue(String(clampedValue));
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) setInputValue(String(clampedValue));
  }, [clampedValue, isEditing]);

  const handleDecrement = () => {
    if (clampedValue > min) onChange(clampedValue - 1);
  };

  const handleIncrement = () => {
    if (stock === 0) {
      showOutOfStock();
      return;
    }
    if (clampedValue + 1 > stock) {
      showLimitReached(stock);
      onChange(stock);
      return;
    }
    onChange(clampedValue + 1);
    showCartToast();
  };

  const stockStyles = getStockStyles();

  return (
    <div className="inline-flex items-center overflow-hidden text-sm font-semibold">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={clampedValue <= min}
        className="w-7 h-8 flex items-center justify-center bg-gray-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        −
      </button>
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min={min}
          max={stock}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={applyInput}
          onKeyDown={handleInputKeyDown}
          disabled={stock === 0}
          className={`min-w-[1.75rem] h-8 flex items-center justify-center text-center border-0 outline-none disabled:opacity-60 disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0 ${stockStyles}`}
          style={{ width: '2.5rem', MozAppearance: 'textfield' }}
        />
      ) : (
        <span
          role="button"
          tabIndex={stock === 0 ? -1 : 0}
          aria-disabled={stock === 0}
          onClick={() => { if (stock > 0) setIsEditing(true); }}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && stock > 0) { e.preventDefault(); setIsEditing(true); } }}
          className={`min-w-[1.75rem] h-8 flex items-center justify-center text-center select-none ${stockStyles} ${stock === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {clampedValue}
        </span>
      )}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={stock === 0}
        className="w-7 h-8 flex items-center justify-center bg-gray-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
