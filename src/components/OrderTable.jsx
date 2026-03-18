import { getParentDetails, getStockForVariant } from '../data/orders';
import { getCatalogueIdByParentName } from '../data/categoriesItems';
import { useOrder } from '../context/OrderContext';
import { getSwimmingGogglesTotal, getShortFinsTotal, getLevelInfo, getFinsLevelInfo } from '../utils/levelCalculator';
import QuantityStepper from './QuantityStepper';

// Fallback when variant has no entry in Data/stock.json
function getMockStock(parentName, colourId, sizeId) {
  const s = `${parentName}-${colourId}-${sizeId}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h) % 26;
}

function getStock(parentDetails, colourId, sizeId) {
  const colourInfo = parentDetails?.colours_info?.[colourId];
  if (!colourInfo?.variant_id?.length || !colourInfo?.size_id) return getMockStock(parentDetails?.parent_name, colourId, sizeId);
  const sizeIdx = colourInfo.size_id.indexOf(Number(sizeId));
  const variantId = sizeIdx >= 0 ? colourInfo.variant_id[sizeIdx] : null;
  const fromData = getStockForVariant(variantId);
  return fromData !== undefined ? fromData : getMockStock(parentDetails?.parent_name, colourId, sizeId);
}

export default function OrderTable({ parentName, showLegend = true, showFooter = true, showOnlySelectedVariants = false, showHeader = true, sizesOverride = null, colWidths = null }) {
  const parentDetails = getParentDetails(parentName);
  const { orders, updateQuantity, getQuantity, getColorTotal, getParentTotal } = useOrder();

  if (!parentDetails) return null;

  const { colours, sizes, variants } = parentDetails;
  const sizeList = sizesOverride ?? (sizes || []);
  const parentSizeIds = new Set((sizes || []).map((s) => s.attribute_value_id));
  const parentTotal = getParentTotal(parentName);
  const coloursToShow = showOnlySelectedVariants
    ? colours.filter((c) => getColorTotal(parentName, c.attribute_value_id) > 0)
    : colours;

  // Partner-level for this product type (Goggles 42, Fins 86)
  const productId = parentDetails.product_id;
  const levelInfo =
    productId === 42
      ? getLevelInfo(getSwimmingGogglesTotal(orders))
      : productId === 86
        ? getFinsLevelInfo(getShortFinsTotal(orders))
        : null;
  const currentLevel = levelInfo?.currentLevel;
  const discountPct = currentLevel?.discount ?? null;

  // Per-size totals (sum across colours) and parent total amount
  const getSizeTotal = (sizeId) =>
    colours.reduce(
      (sum, c) => sum + (getQuantity(parentName, c.attribute_value_id, sizeId) || 0),
      0
    );
  let parentTotalAmount = 0;
  colours.forEach((colour) => {
    const colourInfo = parentDetails.colours_info?.[colour.attribute_value_id];
    const colorVariant = variants.find((v) => colourInfo?.variant_id?.includes(v.id));
    const colorTotal = getColorTotal(parentName, colour.attribute_value_id);
    if (colorVariant && discountPct != null && colorTotal > 0) {
      parentTotalAmount += colorTotal * parseFloat(colorVariant.mrp_price) * (1 - discountPct / 100);
    }
  });

  const numCols = 5 + sizeList.length + 3;
  const useFixedLayout = colWidths && colWidths.length === numCols;

  const catalogueBaseUrl = 'https://b2b.sipl-catalog.sportsdrive.in/catalogue/product';
  const openCatalogueInNewTab = () => {
    const id = getCatalogueIdByParentName(parentName);
    if (id != null) window.open(`${catalogueBaseUrl}/${id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse border border-gray-200"
        style={{ tableLayout: useFixedLayout ? 'fixed' : 'auto' }}
      >
        {useFixedLayout && (
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
        )}
        {/* Table header — columns size to content (once per product on Cart) */}
        {showHeader && (
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-1 py-0.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap">
                Image
              </th>
              <th className="px-2 py-0.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide align-middle border-r border-gray-200 min-w-[100px]">
                Colour
              </th>
              <th className="px-1 py-0.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap">
                MRP
              </th>
              <th className="px-1 py-0.5 text-center text-xs font-semibold  text-green-950 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap">
                {currentLevel ? `LEVEL ${currentLevel.level}` : 'Discount'}
              </th>
              <th className="px-1 py-0.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap align-middle flex flex-col items-center justify-center">
              <span>Wholesale</span> <span>Price</span>  <span className="text-xs">(Incl. of GST)</span>
              </th>
              {sizeList.map(size => (
                <th
                  key={size.attribute_value_id}
                  className="px-1 py-0.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap border-r border-gray-200"
                >
                  {size.sales_size}
                </th>
              ))}
              <th className="px-1 py-0.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap">
                TOTAL <br/> <span className="text-xs">QTY</span>
              </th>
              <th colSpan={2} className="px-1 py-0.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide border-r border-gray-200 whitespace-nowrap">
                TOTAL Amount <br/> <span className="text-xs">(Incl. of GST)</span>
              </th>
            </tr>
          </thead>
        )}
        {/* Table body — one row per colour */}
        <tbody>
          {coloursToShow.map((colour, idx) => {
            const colourInfo = parentDetails.colours_info?.[colour.attribute_value_id];
            const colorVariant = variants.find(v => colourInfo?.variant_id?.includes(v.id));
            
            const colorTotal = getColorTotal(parentName, colour.attribute_value_id);

            return (
              <tr
                key={colour.attribute_value_id}
                className={`border-b border-gray-300`}
              >
                {/* Image cell — clickable to variant detail */}
                <td className="px-1 py-0.5 border-r border-gray-200">
                  <button
                    type="button"
                    onClick={openCatalogueInNewTab}
                    className="flex justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-12 h-12 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {colorVariant?.primary_image ? (
                        <img
                          src={colorVariant.primary_image}
                          alt={colour.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentNode;
                            if (parent && !parent.querySelector('.img-placeholder')) {
                              const div = document.createElement('div');
                              div.className = 'img-placeholder w-12 h-12';
                              parent.appendChild(div);
                            }
                          }}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                  </button>
                </td>

                {/* Colour name cell — clickable to variant detail */}
                <td className="px-2 py-0.5 border-r border-gray-200">
                  <button
                    type="button"
                    onClick={openCatalogueInNewTab}
                    className="text-left text-xs text-teal-600 hover:underline cursor-pointer w-full"
                  >
                    {colour.colour_id} {colour.name}
                  </button>
                </td>

                {/* MRP cell */}
                <td className="px-1 py-0.5 text-center border-r border-gray-200 whitespace-nowrap">
                  {colorVariant ? (
                    <p className="text-xs text-gray-600">
                      ₹{parseFloat(colorVariant.mrp_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">—</p>
                  )}
                </td>

                {/* Discount cell — partner-level discount */}
                <td className="px-1 py-0.5 text-center border-r border-gray-200 whitespace-nowrap">
                  {discountPct != null ? (
                    <p className="text-xs font-semibold text-green-600">
                      {discountPct}%
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">—</p>
                  )}
                </td>

                {/* Wholesale Price cell (MRP after discount) */}
                <td className="px-1 py-0 text-center border-r border-gray-300 whitespace-nowrap">
                  {colorVariant && discountPct != null ? (
                    <p className="text-xs  text-gray-600">
                      ₹{parseFloat(
                        parseFloat(colorVariant.mrp_price) * (1 - discountPct / 100)
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  ) : colorVariant ? (
                    <p className="text-xs text-gray-600">—</p>
                  ) : (
                    <p className="text-xs text-gray-600">—</p>
                  )}
                </td>

                {/* Size qty stepper cells (or "—" when parent doesn't have this size) */}
                {sizeList.map(size => {
                  const parentHasSize = parentSizeIds.has(size.attribute_value_id);
                  return (
                    <td key={size.attribute_value_id} className="px-2 py-0 text-center border-r border-gray-200 whitespace-nowrap">
                      <div className="flex justify-center">
                        {parentHasSize ? (
                          <QuantityStepper
                            value={getQuantity(parentName, colour.attribute_value_id, size.attribute_value_id) || 0}
                            onChange={(qty) =>
                              updateQuantity(
                                parentName,
                                colour.attribute_value_id,
                                size.attribute_value_id,
                                qty
                              )
                            }
                            stock={getStock(parentDetails, colour.attribute_value_id, size.attribute_value_id)}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}

                {/* Total qty per colour */}
                <td className="px-1 py-0.5 text-center border-r border-gray-200 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center font-bold justify-center min-w-[2rem] h-8 px-2 rounded text-xs  text-black ">
                      {colorTotal}
                    </span>
                    
                  </div>
                </td>

                {/* TOTAL Amount (Incl. of GST) per row */}
                <td className="px-1 py-1.5 text-center  whitespace-nowrap">
                  {colorVariant && discountPct != null && colorTotal > 0 ? (
                    <p className="text-xs font-bold text-gray-800">
                      ₹{(colorTotal * parseFloat(colorVariant.mrp_price) * (1 - discountPct / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">—</p>
                  )}
                </td>
                <td className="px-2 py-1.5 text-left border-r border-gray-200">
                  <button
                      onClick={() => {
                        sizeList.forEach(sz => {
                          updateQuantity(parentName, colour.attribute_value_id, sz.attribute_value_id, 0);
                        });
                      }}
                      className="p-1.5 rounded  text-[#FF495C] hover:text-[#4A2CAD] active:text-[#154C51]  transition-colors"
                      title="Delete all quantities for this color"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Footer — per-size totals, total qty, total amount (hidden on Cart so one total row per product) */}
        {showFooter && (
          <tfoot>
            <tr className=" border-t-2 bg-gray-300 border-gray-200">
              <td
                colSpan={5}
                className="px-3 py-0.5 text-xs font-semibold text-gray-700"
              >
              
              </td>
              {sizeList.map((size) => (
                <td
                  key={size.attribute_value_id}
                  className="px-2 py-0.5 text-center border-r border-gray-200 text-xs text-gray-800 whitespace-nowrap"
                >
                  {parentSizeIds.has(size.attribute_value_id)
                    ? getSizeTotal(size.attribute_value_id)
                    : <span className="text-xs text-gray-400">—</span>}
                </td>
              ))}
              <td className="px-2 py-0.5 text-center border-r border-gray-200 whitespace-nowrap">
                <span className="inline-flex items-center font-bold justify-center min-w-[2rem] h-6 px-1.5 rounded text-xs  text-black">
                  {parentTotal}
                </span>
              </td>
              <td className="px-3 py-0.5 text-center whitespace-nowrap">
                <span className="text-xs font-bold  text-gray-800">
                  {parentTotalAmount > 0
                    ? `₹${parentTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </span>
              </td>
              <td className="px-1 py-0.5 border-r border-gray-200" style={{ width: '1%' }}></td>
            </tr>
          </tfoot>
        )}
      </table>

      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-6 p-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-gray-900" aria-hidden />
            Out of Stock
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-red-600" aria-hidden />
            Only a Few Left
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-amber-500" aria-hidden />
            Limited Availability
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-green-600" aria-hidden />
            In Stock
          </span>
        </div>
      )}
    </div>
  );
}
