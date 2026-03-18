import { Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import OrderTable from '../components/OrderTable';
import { getParentDetails } from '../data/orders';
import { useOrder } from '../context/OrderContext';
import { getSwimmingGogglesTotal, getLevelInfo, getShortFinsTotal, getFinsLevelInfo } from '../utils/levelCalculator';
import { getOfferIdForParent, getOfferById, getLevelInfoFromOffer } from '../data/offers';

// Fixed column widths for cart table: first 5 and last 3 same for all tables; size columns share remaining width.
const CART_FIRST_5_COL_WIDTHS = ['56px', '140px', '80px', '56px', '100px'];
const CART_LAST_3_COL_WIDTHS = ['72px', '110px', '40px'];
const CART_FIXED_TOTAL_PX = 634;

// Per-size total for a product: sum quantity for that size across all parents in the group
function getProductSizeTotal(parents, sizeId, getQuantity, getParentDetails) {
  return parents.reduce((sum, p) => {
    const details = getParentDetails(p.parent_name);
    const colours = details?.colours || [];
    const hasSize = (details?.sizes || []).some((s) => s.attribute_value_id === sizeId);
    if (!hasSize) return sum;
    const parentSizeTotal = colours.reduce(
      (s, c) => s + (getQuantity(p.parent_name, c.attribute_value_id, sizeId) || 0),
      0
    );
    return sum + parentSizeTotal;
  }, 0);
}

// Discounted total amount for a list of parents (same logic as OrderTable footer)
function getProductTotalAmount(parents, getColorTotal, getParentDetails, discountPct) {
  let total = 0;
  parents.forEach((p) => {
    const details = getParentDetails(p.parent_name);
    if (!details) return;
    const variants = details.variants || [];
    const colours = details.colours || [];
    colours.forEach((colour) => {
      const colourInfo = details.colours_info?.[colour.attribute_value_id];
      const colorVariant = variants.find((v) => colourInfo?.variant_id?.includes(v.id));
      const colorTotal = getColorTotal(p.parent_name, colour.attribute_value_id);
      if (colorVariant && discountPct != null && colorTotal > 0) {
        total += colorTotal * parseFloat(colorVariant.mrp_price) * (1 - discountPct / 100);
      }
    });
  });
  return total;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { orders, getParentTotal, getGrandTotal, getGrandTotalPrice, getVariantsCount, getParentsCount, getColorTotal, getQuantity } = useOrder();

  // Parents that have at least one item in cart
  const parentNamesWithQty = Object.keys(orders).filter((parentName) => getParentTotal(parentName) > 0);
  const parentsWithDetails = parentNamesWithQty
    .map((parentName) => {
      const details = getParentDetails(parentName);
      return details ? { ...details, parent_name: parentName } : null;
    })
    .filter(Boolean);

  // Group by offer (one table per offer); parents with no offer group by product_id
  const byOfferKey = {};
  parentsWithDetails.forEach((p) => {
    const offerId = getOfferIdForParent(p.parent_name);
    const key = offerId != null ? `offer_${offerId}` : `product_${p.product_id}`;
    if (!byOfferKey[key]) {
      byOfferKey[key] = {
        offerId: offerId ?? null,
        offer: offerId != null ? getOfferById(offerId) : null,
        productId: p.product_id,
        productName: p.product_name,
        parents: [],
      };
    }
    byOfferKey[key].parents.push(p);
  });
  const offerGroups = Object.values(byOfferKey).sort((a, b) => {
    if (a.offerId != null && b.offerId != null) return a.offerId - b.offerId;
    if (a.offerId != null) return -1;
    if (b.offerId != null) return 1;
    return a.productId - b.productId;
  });

  const swimmingGogglesTotal = getSwimmingGogglesTotal(orders);
  const gogglesLevelInfo = getLevelInfo(swimmingGogglesTotal);
  const shortFinsTotal = getShortFinsTotal(orders);
  const finsLevelInfo = getFinsLevelInfo(shortFinsTotal);

  const parentsCount = getParentsCount();
  const grandTotal = getGrandTotal();
  const variantsCount = getVariantsCount();

  // Discounted total: per-group level info and sum
  const grandTotalPriceDiscounted = offerGroups.reduce((sum, group) => {
    const groupTotalQty = group.parents.reduce((s, p) => s + getParentTotal(p.parent_name), 0);
    const levelInfo = group.offer
      ? getLevelInfoFromOffer(group.offer, groupTotalQty)
      : group.productId === 42
        ? gogglesLevelInfo
        : group.productId === 86
          ? finsLevelInfo
          : { currentLevel: { discount: null } };
    const discountPct = levelInfo?.currentLevel?.discount ?? null;
    return sum + getProductTotalAmount(group.parents, getColorTotal, getParentDetails, discountPct);
  }, 0);

  const isEmpty = parentNamesWithQty.length === 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Page title bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart' }]} />
          <h1 className="text-lg font-bold text-gray-900 uppercase mt-1">Your Cart</h1>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition"
        >
          Explore more products
        </Link>
      </div>

      {/* Content */}
      <main className="flex-1 bg-white pb-5">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate('/')}
              className="text-teal-600 font-semibold hover:underline"
            >
              Go to Orders
            </button>
          </div>
        ) : (
          <>
            <div className="max-w-full mx-auto">
              {offerGroups.map((group, groupIndex) => {
                const groupTotalQty = group.parents.reduce((s, p) => s + getParentTotal(p.parent_name), 0);
                const levelInfo = group.offer
                  ? getLevelInfoFromOffer(group.offer, groupTotalQty)
                  : group.productId === 42
                    ? gogglesLevelInfo
                    : group.productId === 86
                      ? finsLevelInfo
                      : { nextLevel: null, qtyNeeded: 0, isMaxLevel: true };
                const { nextLevel, qtyNeeded, isMaxLevel } = levelInfo;
                const groupKey = group.offerId != null ? `offer_${group.offerId}` : `product_${group.productId}`;
                const sectionTitle = group.offer ? group.offer.name : group.productName;

                return (
                  <div key={groupKey}>
                    {/* Offer / product header row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200">
                      <h2 className="text-base font-bold text-gray-900 uppercase">{sectionTitle}</h2>
                      <div className="flex flex-wrap items-center gap-3">
                        {isMaxLevel ? (
                          <p className="text-xs text-teal-600 font-semibold">Max level reached</p>
                        ) : nextLevel ? (
                          <p className="text-xs text-gray-600">
                            <span className="font-bold text-teal-600">Add {qtyNeeded} pcs</span> to get {nextLevel.discount}% discount
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => navigate(group.offerId != null ? `/orders?product=${group.productId}&offer=${group.offerId}` : `/orders?product=${group.productId}`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition"
                        >
                          +
                          Add More
                        </button>
                      </div>
                    </div>

                    {/* OrderTable per parent: one thead (first only), same columns; no per-table footer */}
                    {(() => {
                      const seen = new Set();
                      const unifiedSizes = [];
                      group.parents.forEach((p) => {
                        const details = getParentDetails(p.parent_name);
                        (details?.sizes || []).forEach((s) => {
                          if (!seen.has(s.attribute_value_id)) {
                            seen.add(s.attribute_value_id);
                            unifiedSizes.push(s);
                          }
                        });
                      });
                      const N = unifiedSizes.length;
                      const sizeWidths = N > 0
                        ? Array(N).fill(`calc((100% - ${CART_FIXED_TOTAL_PX}px) / ${N})`)
                        : [];
                      const colWidths = [
                        ...CART_FIRST_5_COL_WIDTHS,
                        ...sizeWidths,
                        ...CART_LAST_3_COL_WIDTHS,
                      ];
                      const productTotalQty = group.parents.reduce((s, p) => s + getParentTotal(p.parent_name), 0);
                      const discountPct = levelInfo?.currentLevel?.discount ?? null;
                      const productTotalAmount = getProductTotalAmount(group.parents, getColorTotal, getParentDetails, discountPct);
                      return (
                        <>
                          {group.parents.map((parent, parentIndex) => (
                            <Fragment key={parent.parent_name}>
                              <div className="">
                                <OrderTable
                                  parentName={parent.parent_name}
                                  showLegend={false}
                                  showFooter={false}
                                  showOnlySelectedVariants
                                  showHeader={parentIndex === 0}
                                  sizesOverride={unifiedSizes}
                                  colWidths={colWidths}
                                />
                              </div>
                              {parentIndex < group.parents.length - 1 && (
                                <div className="h-2 bg-black" aria-hidden />
                              )}
                            </Fragment>
                          ))}
                          {/* One footer per product: per-size totals, total qty, total amount */}
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200" style={{ tableLayout: 'fixed' }}>
                              <colgroup>
                                {colWidths.map((w, i) => (
                                  <col key={i} style={{ width: w }} />
                                ))}
                              </colgroup>
                              <tbody>
                                <tr className="border-t-2 bg-gray-300 border-gray-200">
                                  <td colSpan={5} className="px-3 py-0.5 text-xs font-semibold text-gray-700" />
                                  {unifiedSizes.map((size) => {
                                    const total = getProductSizeTotal(group.parents, size.attribute_value_id, getQuantity, getParentDetails);
                                    const anyParentHasSize = group.parents.some((p) => {
                                      const details = getParentDetails(p.parent_name);
                                      return (details?.sizes || []).some((s) => s.attribute_value_id === size.attribute_value_id);
                                    });
                                    return (
                                      <td
                                        key={size.attribute_value_id}
                                        className="px-2 py-0.5 text-center border-r border-gray-200 text-xs text-gray-800 whitespace-nowrap"
                                      >
                                        {anyParentHasSize ? total : <span className="text-xs text-gray-400">—</span>}
                                      </td>
                                    );
                                  })}
                                  <td className="px-2 py-0.5 text-center border-r border-gray-200 whitespace-nowrap">
                                    <span className="inline-flex items-center font-bold justify-center min-w-[2rem] h-6 px-1.5 rounded text-xs text-black">
                                      {productTotalQty}
                                    </span>
                                  </td>
                                  <td className="px-3 py-0.5 text-center whitespace-nowrap">
                                    <span className="text-xs font-bold text-gray-800">
                                      {productTotalAmount > 0
                                        ? `₹${productTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : '—'}
                                    </span>
                                  </td>
                                  <td className="px-1 py-0.5 border-r border-gray-200" style={{ width: '1%' }} />
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}

                    {/* One total row per product */}
                    {/* {(() => {
                      const productTotalQty = group.parents.reduce((s, p) => s + getParentTotal(p.parent_name), 0);
                      const discountPct = levelInfo?.currentLevel?.discount ?? null;
                      const productTotalAmount = getProductTotalAmount(group.parents, getColorTotal, getParentDetails, discountPct);
                      return (
                        <div className="border-t-2 border-gray-200 bg-gray-300 px-4 py-2 flex flex-wrap items-center justify-end gap-6">
                          <span className="text-xs font-semibold text-gray-700 uppercase">Total (this product)</span>
                          <span className="inline-flex items-center font-bold min-w-[2rem] text-sm text-gray-900">
                            {productTotalQty} pcs
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {productTotalAmount > 0
                              ? `₹${productTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : '—'}
                          </span>
                        </div>
                      );
                    })()} */}

                    {/* Thin divider between product blocks */}
                    {/* {groupIndex < offerGroups.length - 1 && (
                      <hr className="border-t border-gray-200 my-4 mx-4" />
                    )} */}
                  </div>
                );
              })}
            </div>

            {/* Legend once for entire cart */}
            <div className="flex flex-wrap items-center gap-x-6 p-2 text-xs text-gray-600 max-w-full mx-auto px-4 mt-4">
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
          </>
        )}
      </main>

      {/* Order Summary - fixed bottom, card design */}
      <div className=" py-4">
        <div className="mx-auto max-w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className=" px-4 pb-4">
            <h2 className="text-xl font-bold text-gray-900 my-4">Order Summary</h2>

            

            

            <div className="space-y-1.5">
              <p className="text-sm text-gray-600">
                Total Items: <span className="font-bold text-gray-900">{grandTotal} pcs</span>
              </p>
              <p className="text-sm text-gray-600">
                Wholesale Price (Incl. of GST): <span className="text-xl font-bold text-gray-900">₹{grandTotalPriceDiscounted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
            </div>

            <button
              disabled={grandTotal === 0}
              onClick={() =>
                alert(
                  `Proceeding to checkout with ${variantsCount} variants, ${grandTotal} items - Total: ₹${grandTotalPriceDiscounted.toFixed(2)}`
                )
              }
              className={`mt-5 w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors duration-200 ${
                grandTotal === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
