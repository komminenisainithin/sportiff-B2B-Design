import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import OrderTable from '../components/OrderTable';
import PartnerLevelHeader from '../components/PartnerLevelHeader';
import { getUniqueParents, getParentDetails, getStockForVariant } from '../data/orders';
import { getParentNamesByOfferId, getOfferById, getLevelInfoFromOffer } from '../data/offers';
import products from '../data/products';
import { useOrder } from '../context/OrderContext';
import { getSwimmingGogglesTotal, getLevelInfo, getShortFinsTotal, getFinsLevelInfo } from '../utils/levelCalculator';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawProduct = searchParams.get('product');
  const rawOffer = searchParams.get('offer');
  const filterProductId = rawProduct !== null && rawProduct !== '' && !isNaN(Number(rawProduct)) ? Number(rawProduct) : null;
  const filterOfferId = rawOffer !== null && rawOffer !== '' && !isNaN(Number(rawOffer)) ? Number(rawOffer) : null;

  const allParents = getUniqueParents();
  let parents = filterProductId != null
    ? allParents.filter(p => getParentDetails(p.parent_name)?.product_id === filterProductId)
    : allParents;
  if (filterOfferId != null && parents.length > 0) {
    const offerParentNames = getParentNamesByOfferId(filterOfferId);
    parents = parents.filter(p => offerParentNames.has(p.parent_name));
  }

  const [expandedParent, setExpandedParent] = useState(null);
  const [addAllRounds, setAddAllRounds] = useState({});
  const { updateQuantity, getQuantity, getGrandTotal, getGrandTotalPrice, getVariantsCount, getParentsCount, getParentTotal, getParentTotalPrice } = useOrder();

  function getStock(parentDetails, colourId, sizeId) {
    const colourInfo = parentDetails?.colours_info?.[colourId];
    if (!colourInfo?.variant_id?.length || !colourInfo?.size_id) return 0;
    const sizeIdx = colourInfo.size_id.indexOf(Number(sizeId));
    const variantId = sizeIdx >= 0 ? colourInfo.variant_id[sizeIdx] : null;
    const fromData = getStockForVariant(variantId);
    if (fromData !== undefined) return fromData;
    const s = `${parentDetails?.parent_name}-${colourId}-${sizeId}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h) % 26;
  }

  const handleAddAllVariants = (e, parentName) => {
    e.stopPropagation();
    const parentDetails = getParentDetails(parentName);
    if (!parentDetails) return;
    const { colours, sizes } = parentDetails;
    colours.forEach(colour => {
      sizes.forEach(size => {
        const stock = getStock(parentDetails, colour.attribute_value_id, size.attribute_value_id);
        if (stock > 0) {
          const currentQty = getQuantity(parentName, colour.attribute_value_id, size.attribute_value_id) || 0;
          updateQuantity(parentName, colour.attribute_value_id, size.attribute_value_id, Math.min(currentQty + 1, stock));
        }
      });
    });
    setAddAllRounds(prev => ({ ...prev, [parentName]: (prev[parentName] ?? 0) + 1 }));
    setExpandedParent(parentName);
  };

  const handleRemoveAllVariants = (e, parentName) => {
    e.stopPropagation();
    const parentDetails = getParentDetails(parentName);
    if (!parentDetails) return;
    const { colours, sizes } = parentDetails;
    colours.forEach(colour => {
      sizes.forEach(size => {
        const currentQty = getQuantity(parentName, colour.attribute_value_id, size.attribute_value_id) || 0;
        if (currentQty > 0) {
          updateQuantity(parentName, colour.attribute_value_id, size.attribute_value_id, currentQty - 1);
        }
      });
    });
    setAddAllRounds(prev => ({ ...prev, [parentName]: Math.max(0, (prev[parentName] ?? 0) - 1) }));
    setExpandedParent(parentName);
  };

  const handleDeleteAllForParent = (e, parentName) => {
    e.stopPropagation();
    const parentDetails = getParentDetails(parentName);
    if (!parentDetails) return;
    const { colours, sizes } = parentDetails;
    colours.forEach(colour => {
      sizes.forEach(size => {
        updateQuantity(parentName, colour.attribute_value_id, size.attribute_value_id, 0);
      });
    });
    setAddAllRounds(prev => ({ ...prev, [parentName]: 0 }));
  };

  const { orders } = useOrder();
  const swimmingGogglesTotal = getSwimmingGogglesTotal(orders);
  const shortFinsTotal = getShortFinsTotal(orders);

  // Footer: scoped to current view (current product + offer). When switching category, totals start at zero for that category.
  const footerItemsCount = parents.filter((p) => getParentTotal(p.parent_name) > 0).length;
  const footerQty = parents.reduce((sum, p) => sum + getParentTotal(p.parent_name), 0);
  const footerPrice = parents.reduce((sum, p) => sum + getParentTotalPrice(p.parent_name), 0);
  let footerVariantsCount = 0;
  parents.forEach((p) => {
    const details = getParentDetails(p.parent_name);
    if (!details?.colours?.length || !details?.sizes?.length) return;
    details.colours.forEach((c) => {
      details.sizes.forEach((s) => {
        if ((getQuantity(p.parent_name, c.attribute_value_id, s.attribute_value_id) || 0) > 0) footerVariantsCount++;
      });
    });
  });

  // Level info: when viewing a specific offer (category), use that offer's tiers and scoped qty; otherwise global.
  const showGogglesLevel = filterProductId === null || filterProductId === 42;
  const gogglesLevelInfo =
    showGogglesLevel && filterOfferId != null
      ? getLevelInfoFromOffer(getOfferById(filterOfferId), footerQty)
      : getLevelInfo(swimmingGogglesTotal);
  const { currentLevel, nextLevel, qtyNeeded } = gogglesLevelInfo;

  const showFinsLevel = filterProductId === null || filterProductId === 86;
  const finsLevelInfo = getFinsLevelInfo(filterProductId === 86 ? footerQty : shortFinsTotal);

  const currentOffer = filterOfferId != null ? getOfferById(filterOfferId) : null;

  const product = filterProductId != null ? products.find((p) => p.id === filterProductId) : null;
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    ...(filterProductId != null ? [{ label: product?.name ?? `Product ${filterProductId}`, path: `/products/${filterProductId}` }] : []),
    { label: 'Orders' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Page title bar */}
      <div className="bg-white border-b border-gray-200 px-2 py-3 flex-shrink-0">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-lg font-bold text-gray-900 uppercase mt-1">
          Orders
        </h1>
      </div>

      {/* Partner Level Header - Sticky */}
      <PartnerLevelHeader filterProductId={filterProductId} />

      {/* Full-width table content */}
      <div className="flex-1 overflow-auto p-0 pb-40">
        <div className="max-w-full mx-auto">
          {/* <p className="text-sm text-gray-500 mb-6">
            Browse all <strong className="text-gray-700">{parents.length} parent products</strong>
          </p> */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '64px' }} />
                <col style={{ width: '250px' }} />
                <col style={{ width: '80px' }} />
                <col />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Image</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Parent Description</th>
                  <th className="text-center  py-3 px-0 font-medium text-gray-700 text-sm align-middle">MRP</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Variants</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Total Qty</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Total Amount</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Add Quantity</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {parents.flatMap(parent => {
                  const variantsCount = parent.variants ? parent.variants.length : 0;
                  const isExpanded = expandedParent === parent.parent_name;
                  return [
                    <tr
                      key={parent.parent_name}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedParent(isExpanded ? null : parent.parent_name)}
                    >
                      <td className="py-2 px-4 align-middle">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={parent.item_image}
                            alt={parent.parent_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <p className="text-sm font-medium text-gray-900">{parent.parent_description}</p>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <p className="text-xs font-medium text-center text-gray-900">₹{parseFloat(parent.mrp_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </td>
                      <td className="py-2 px-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-sm font-medium text-gray-700">{variantsCount}</p>
                          <span><svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg></span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center align-middle">
                        <p className="text-md font-bold text-gray-900">{getParentTotal(parent.parent_name)}</p>
                      </td>
                      <td className="py-2 px-4 text-center align-middle">
                        <p className="text-md font-bold text-gray-900">₹{getParentTotalPrice(parent.parent_name).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </td>
                      <td className="py-2 px-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center overflow-hidden text-base font-semibold">
                          <button
                            type="button"
                            onClick={(e) => handleRemoveAllVariants(e, parent.parent_name)}
                            disabled={(addAllRounds[parent.parent_name] ?? 0) <= 0}
                            className="w-9 h-10 flex items-center justify-center bg-gray-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove one from all Colours"
                          >
                            −
                          </button>
                          <span
                            className="min-w-[6rem] w-32 h-10 px-2 flex items-center justify-center text-center bg-gray-100 text-gray-900 border-x border-gray-200 text-sm"
                          >
                            {(addAllRounds[parent.parent_name] ?? 0) === 0 ? 'Add 1 to all Colours' : addAllRounds[parent.parent_name]}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleAddAllVariants(e, parent.parent_name)}
                            className="w-9 h-10 flex items-center justify-center bg-gray-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Add one to all in-stock Colours"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAllForParent(e, parent.parent_name)}
                          disabled={getParentTotal(parent.parent_name) === 0}
                          className="p-1.5 rounded text-[#FF495C] hover:text-[#4A2CAD] active:text-[#154C51] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete all quantity for this product"
                          aria-label="Delete all quantity for this product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                      
                    </tr>,
                    isExpanded && (
                      <tr key={`${parent.parent_name}-expanded`}>
                        <td colSpan={8} className="border-b border-gray-200 p-0 align-top">
                          <OrderTable parentName={parent.parent_name} />
                        </td>
                      </tr>
                    )
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Combined Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 shadow-xl">
        {/* Checkout row */}
        <div className="bg-white border-t-2 border-gray-200 px-3 py-2">
          <div className="flex flex-col gap-1.5 max-w-full mx-auto pb-2 ">
            {currentOffer && (
              <p className="text-xs font-semibold text-gray-600 truncate" title={currentOffer.name}>
                {currentOffer.short_description || currentOffer.name}
              </p>
            )}
            {showGogglesLevel && (
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800">
                  <span className="text-gray-500 font-semibold">Goggles:</span>{' '}
                  {currentLevel.name}
                  <span className="text-teal-600 ml-1">({currentLevel.discount}%)</span>
                </p>
                {nextLevel ? (
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-teal-600">Add {qtyNeeded} pcs</span> → {nextLevel.name} ({nextLevel.discount}%)
                  </p>
                ) : (
                  <p className="text-xs text-teal-600 font-semibold">Max level reached</p>
                )}
              </div>
            )}
            {showFinsLevel && (
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800">
                  <span className="text-gray-500 font-semibold">Short Fins:</span>{' '}
                  {finsLevelInfo.currentLevel.name}
                  <span className="text-teal-600 ml-1">({finsLevelInfo.currentLevel.discount}%)</span>
                </p>
                {finsLevelInfo.nextLevel ? (
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-teal-600">Add {finsLevelInfo.qtyNeeded} pcs</span> → {finsLevelInfo.nextLevel.name} ({finsLevelInfo.nextLevel.discount}%)
                  </p>
                ) : (
                  <p className="text-xs text-teal-600 font-semibold">Max level reached</p>
                )}
              </div>
            )}
          </div>
          <div className="max-w-full mx-auto flex items-center justify-between">
            {/* Left: Items & Variants (scoped to current category/offer) */}
            <div className="flex flex-row gap-1">
              <p className="text-sm font-semibold text-gray-900">Items: <span className="text-lg font-bold">{footerItemsCount}</span></p>
              <p className="text-sm font-semibold text-gray-900">Variants: <span className="text-lg font-bold text-teal-600">{footerVariantsCount}</span></p>
            </div>

            {/* Quantity */}
            <div className="flex flex-row gap-1 items-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Quantity:</p>
              <p className="text-xl font-bold text-gray-900">{footerQty}</p>
            </div>

            {/* Our Price */}
            <div className="flex flex-row gap-1 items-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Wholesale Price (Incl. of GST) :</p>
              <p className="text-xl font-bold text-teal-600">₹{footerPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {/* Checkout */}
            <button
              disabled={footerQty === 0}
              onClick={() => navigate('/cart')}
              className={`px-6 py-1 rounded-lg font-semibold text-white transition-colors duration-200 ${footerQty === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                }`}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
