import { useOrder } from '../context/OrderContext';
import { getParentDetails } from '../data/orders';

export default function OrderItemRow({ parentName }) {
  const parentDetails = getParentDetails(parentName);
  const { updateQuantity, getQuantity, getColorTotal } = useOrder();

  if (!parentDetails) return null;

  const { colours, sizes, variants } = parentDetails;
  const sizeList = sizes || [];

  return (
    <div className="space-y-4">
      {/* Header with Size Columns */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {/* Info Column */}
          <div className="flex-shrink-0 w-80">
            <div className="text-xs font-semibold text-gray-600 uppercase">
              Product Details
            </div>
          </div>

          {/* Size Columns Header */}
          <div className="flex gap-3">
            {sizeList.map(size => (
              <div key={size.attribute_value_id} className="text-center">
                <div className="text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                  {size.sales_size}
                </div>
              </div>
            ))}
            {/* Total Column */}
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                Total Qty
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rows for each color */}
      <div className="space-y-3">
        {colours.map(colour => {
          const colorVariant = variants.find(v => {
            const colourInfo = parentDetails.colours_info?.[colour.attribute_value_id];
            return colourInfo?.variant_id?.includes(v.id);
          });

          return (
            <div key={colour.attribute_value_id} className="overflow-x-auto">
              <div className="flex gap-4 pb-2">
                {/* Product Info Column */}
                <div className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-3">
                  {colorVariant && (
                    <div className="flex gap-3">
                      <img
                        src={colorVariant.primary_image}
                        alt={colour.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {colour.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {colorVariant.sales_description}
                        </p>
                        <p className="text-sm font-bold text-teal-600 mt-1">
                          ₹{colorVariant.mrp_price}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Size Input Columns */}
                <div className="flex gap-3">
                  {sizeList.map(size => (
                    <div key={size.attribute_value_id} className="flex-shrink-0">
                      <input
                        type="number"
                        min="0"
                        value={getQuantity(parentName, colour.attribute_value_id, size.attribute_value_id)}
                        onChange={(e) =>
                          updateQuantity(
                            parentName,
                            colour.attribute_value_id,
                            size.attribute_value_id,
                            e.target.value
                          )
                        }
                        className="w-12 h-10 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        placeholder="0"
                      />
                    </div>
                  ))}

                  {/* Total Qty Column */}
                  <div className="flex-shrink-0 w-16 h-10 bg-teal-50 border border-teal-200 rounded flex items-center justify-center">
                    <span className="text-sm font-bold text-teal-700">
                      {getColorTotal(parentName, colour.attribute_value_id)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
