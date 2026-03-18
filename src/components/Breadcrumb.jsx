import { Link } from 'react-router-dom';

/**
 * @param {{ items: Array<{ label: string, path?: string | null }> }} props
 */
export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300" aria-hidden>/</span>}
            {item.path != null && item.path !== '' && !isLast ? (
              <Link to={item.path} className="text-gray-700 font-semibold hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-gray-900' : ''}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
