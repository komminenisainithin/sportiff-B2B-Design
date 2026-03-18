
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import QuantityStepper from '../components/QuantityStepper';
import { getParentDetails, getStockForVariant } from '../data/orders';
import { useOrder } from '../context/OrderContext';
import { getSwimmingGogglesTotal, getShortFinsTotal, getLevelInfo, getFinsLevelInfo } from '../utils/levelCalculator';

function getMockStock(parentName, colourId, sizeId) {
  const s = `${parentName}-${colourId}-${sizeId}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h) % 26;
}

function getStock(parentDetails, colourId, sizeId) {
  const colourInfo = parentDetails?.colours_info?.[colourId];
  if (!colourInfo?.variant_id?.length || !colourInfo?.size_id)
    return getMockStock(parentDetails?.parent_name, colourId, sizeId);

  const sizeIdx = colourInfo.size_id.indexOf(Number(sizeId));
  const variantId = sizeIdx >= 0 ? colourInfo.variant_id[sizeIdx] : null;
  const fromData = getStockForVariant(variantId);

  return fromData !== undefined
    ? fromData
    : getMockStock(parentDetails?.parent_name, colourId, sizeId);
}

function parseKeyFeatures(detailedSpec) {
  if (!detailedSpec || typeof detailedSpec !== 'string') return [];
  const lines = detailedSpec
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.match(/^[\s\-:]*$/));

  return lines.slice(0, 4);
}

/** Remove size suffix (e.g. " - UK: 8H-9H") from sales_description for display title */
function titleWithoutSize(salesDescription) {
  if (!salesDescription || typeof salesDescription !== 'string') return '';
  return salesDescription.replace(/\s*-\s*UK:.*$/i, '').trim();
}

export default function VariantDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const parentName = searchParams.get('parent');
  const colourIdParam = searchParams.get('colour');
  const colourId =
    colourIdParam != null && colourIdParam !== ''
      ? Number(colourIdParam)
      : null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState('details');
  const [addAllSizesRounds, setAddAllSizesRounds] = useState(0);

  const parentDetails = parentName ? getParentDetails(parentName) : null;
  const colour = parentDetails?.colours?.find(
    (c) => c.attribute_value_id === colourId
  );

  const colourInfo = parentDetails?.colours_info?.[colourId];
  const variantId = colourInfo?.variant_id?.[0];
  const variant = parentDetails?.variants?.find((v) => v.id === variantId);

  const sizes = parentDetails?.sizes || [];

  const { orders, updateQuantity, getQuantity } = useOrder();

  const productId = parentDetails?.product_id;

  const levelInfo =
    productId === 42
      ? getLevelInfo(getSwimmingGogglesTotal(orders))
      : productId === 86
        ? getFinsLevelInfo(getShortFinsTotal(orders))
        : null;

  const discountPct = levelInfo?.currentLevel?.discount ?? null;
  const { nextLevel, qtyNeeded, isMaxLevel } = levelInfo || {};

  const wholesalePrice =
    variant && discountPct != null
      ? parseFloat(variant.mrp_price) * (1 - discountPct / 100)
      : variant
        ? parseFloat(variant.mrp_price)
        : null;

  const hasAnySizeStock = parentDetails && sizes.some(
    (size) => getStock(parentDetails, colourId, size.attribute_value_id) > 0
  );

  const handleAddAllSizes = () => {
    if (!parentDetails) return;
    sizes.forEach((size) => {
      const sizeId = size.attribute_value_id;
      const stock = getStock(parentDetails, colourId, sizeId);
      if (stock > 0) {
        const currentQty = getQuantity(parentDetails.parent_name, colourId, sizeId) || 0;
        updateQuantity(parentDetails.parent_name, colourId, sizeId, Math.min(currentQty + 1, stock));
      }
    });
    setAddAllSizesRounds((prev) => prev + 1);
  };

  const handleRemoveAllSizes = () => {
    if (!parentDetails) return;
    sizes.forEach((size) => {
      const sizeId = size.attribute_value_id;
      const currentQty = getQuantity(parentDetails.parent_name, colourId, sizeId) || 0;
      if (currentQty > 0) {
        updateQuantity(parentDetails.parent_name, colourId, sizeId, currentQty - 1);
      }
    });
    setAddAllSizesRounds((prev) => Math.max(0, prev - 1));
  };

  const images = variant?.variant_images?.length
    ? [variant.primary_image, ...(variant.variant_images || [])].filter(Boolean)
    : variant?.primary_image
      ? [variant.primary_image]
      : [];

  const mainImage = images[selectedImageIndex] || images[0];

  async function handleDownloadMedia() {
    if (!mainImage || !variant?.sales_description) return;
    try {
      const res = await fetch(mainImage, { mode: 'cors' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const ext = blob.type === 'image/png' ? '.png' : blob.type === 'image/webp' ? '.webp' : '.jpg';
      const base = (variant.sales_description || 'product')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'product';
      const filename = `${base}-image-${selectedImageIndex + 1}${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (_) {
      const a = document.createElement('a');
      a.href = mainImage;
      a.download = `${(variant.sales_description || 'product').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 60) || 'product'}-image-${selectedImageIndex + 1}.jpg`;
      a.rel = 'noopener';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  const keyFeatures = parseKeyFeatures(variant?.detailed_specification);
  const defaultFeatures = ['Quality material', 'Competitive training', 'PVC free'];
  const displayFeatures = keyFeatures.length ? keyFeatures : defaultFeatures;

  const shortDesc = variant?.short_description || '';
  const longDesc = variant?.detailed_description || shortDesc;

  if (!parentName || colourId == null || !parentDetails || !colour || !variant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-10">
          <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Variant' }]} />
          <p className="text-gray-500 mt-2">Variant not found.</p>
        </main>
      </div>
    );
  }

  const variantCount = parentDetails?.colours?.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-full mx-auto w-full px-4 py-3">
        <Breadcrumb
          items={[
            { label: 'Home', path: '/' },
            { label: titleWithoutSize(variant.sales_description) || variant.sales_description || 'Product' }
          ]}
        />

        <div className="bg-white overflow-hidden mt-2">

          <div className="p-3 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* IMAGE SECTION */}

            <div className="space-y-4 border border-gray-200 p-2 rounded-lg">

              {mainImage && (
                <button
                  type="button"
                  onClick={handleDownloadMedia}
                  className="inline-flex items-center justify-center w-9 h-9   text-teal-600 hover:bg-teal-50 transition"
                  aria-label="Download media"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12" />
                    <path d="M8 11l4 4 4-4" />
                    <path d="M5 19h14" />
                  </svg>
                </button>
              )}

              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={variant.sales_description}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              <div className="flex gap-2  overflow-x-auto pb-1">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border transition
                    ${selectedImageIndex === idx
                        ? 'border-teal-600 ring-2 ring-teal-100'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

            </div>


            {/* PRODUCT INFO */}

            <div className="space-y-6">

              <div className="space-y-2">

                <div className="flex items-start justify-between gap-4">

                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {titleWithoutSize(variant.sales_description) || variant.sales_description}
                  </h1>

                  <span className="text-xl md:text-2xl font-bold text-gray-500 line-through">
                    ₹{parseFloat(variant.mrp_price).toLocaleString('en-IN')}
                  </span>

                </div>
                {discountPct != null && (
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-medium text-gray-600">Wholesale (incl. GST)</h3>
                    <span className="text-lg md:text-2xl font-bold text-gray-900">
                      ₹{wholesalePrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}


              </div>


              {/* SPECIFICATIONS */}

              <dl className="rounded-lg border border-gray-100 divide-y text-sm">

                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Parent Description</dt>
                  <dd className="font-medium text-gray-900">{parentDetails.parent_description}</dd>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Colour Description</dt>
                  <dd className="font-medium text-gray-900">{colour ? `${colour.colour_id} ${colour.name}` : '—'}</dd>
                </div>

                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Brand</dt>
                  <dd className="font-medium text-gray-900">{parentDetails.brand_name}</dd>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Product</dt>
                  <dd className="font-medium text-gray-900">{parentDetails.product_name}</dd>
                </div>

                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium text-gray-900">{parentDetails.product_name}</dd>
                </div>

                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Brand Series</dt>
                  <dd className="font-medium text-gray-900">{parentDetails.parent_name}</dd>
                </div>

                <div className="flex justify-between px-4 py-2">
                  <dt className="text-gray-500">Colours</dt>
                  <dd>
                    {productId != null ? (
                      <Link
                        to={`/orders?product=${productId}`}
                        className="text-teal-600 hover:underline"
                      >
                        click here to view {variantCount - 1} more variants
                      </Link>
                    ) : (
                      variantCount
                    )}
                  </dd>
                </div>

              </dl>


              {/* DISCOUNT MESSAGE */}

              {!isMaxLevel && nextLevel && (
                <div className="p-3 rounded-lg bg-teal-50 text-sm text-gray-700 border border-teal-100">
                  Add <span className="font-bold text-teal-600">{qtyNeeded}</span> more units to get{' '}
                  <span className="font-semibold">{nextLevel.discount}% off</span>
                </div>
              )}


              {/* SIZES */}

              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Sizes
                </h2>

                <div className="space-y-2">

                  {sizes.map((size) => {
                    const stock = getStock(
                      parentDetails,
                      colourId,
                      size.attribute_value_id
                    );

                    return (
                      <div
                        key={size.attribute_value_id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-teal-200 transition"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {size.sales_size}
                        </span>

                        <QuantityStepper
                          value={
                            getQuantity(
                              parentDetails.parent_name,
                              colourId,
                              size.attribute_value_id
                            ) || 0
                          }
                          onChange={(qty) =>
                            updateQuantity(
                              parentDetails.parent_name,
                              colourId,
                              size.attribute_value_id,
                              qty
                            )
                          }
                          stock={stock}
                        />
                      </div>
                    );
                  })}

                </div>
              </div>
              <div className="flex gap-2 items-stretch">
                <div className="flex-1 min-w-0 flex items-stretch">
                  <div className="flex w-full h-12 items-center overflow-hidden text-sm font-semibold">
                    <button
                      type="button"
                      onClick={handleRemoveAllSizes}
                      disabled={addAllSizesRounds <= 0}
                      className="w-7 h-full flex-shrink-0 flex items-center justify-center bg-gray-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove one from all sizes"
                    >
                      −
                    </button>
                    <span
                      className="flex-1 min-w-0 h-full flex items-center justify-center text-center bg-gray-100 text-gray-900 border-x border-gray-200 text-xs"
                    >
                      {addAllSizesRounds === 0 ? 'Add All Sizes' : addAllSizesRounds}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddAllSizes}
                      disabled={!hasAnySizeStock}
                      className="w-7 h-full flex-shrink-0 flex items-center justify-center bg-gray-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Add one to all in-stock sizes"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* ADD TO CART */}

                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 min-w-0 h-12 flex items-center justify-center rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition"
                >
                  Add to Cart
                </button>
              </div>




            </div>

          </div>
        </div>

        {/* Bottom tabbed section */}
        <div className="title-wrapper mt-8">
          <div className="flex flex-wrap gap-8 border-b border-[#e0e0e0]" role="tablist" aria-label="Product details">
            <div
              role="tab"
              id="tab-label-details"
              aria-selected={activeDetailTab === 'details'}
              aria-controls="details"
              tabIndex={0}
              className={activeDetailTab === 'details' ? 'active' : ''}
            >
              <button
                type="button"
                onClick={() => setActiveDetailTab('details')}
                className={`text-left text-base font-bold uppercase bg-transparent cursor-pointer py-2 px-0 focus:outline-none border-b-2 ${activeDetailTab === 'details' ? 'text-[#111] border-[#111]' : 'text-[#111] border-transparent hover:text-[#333]'
                  }`}
                style={{ letterSpacing: '1px' }}
              >
                Product description
              </button>
            </div>
            <div
              role="tab"
              id="tab-label-features"
              aria-selected={activeDetailTab === 'features'}
              aria-controls="features"
              tabIndex={0}
              className={activeDetailTab === 'features' ? 'active' : ''}
            >
              <button
                type="button"
                onClick={() => setActiveDetailTab('features')}
                className={`text-left text-base font-bold uppercase bg-transparent cursor-pointer py-2 px-0 focus:outline-none border-b-2 ${activeDetailTab === 'features' ? 'text-[#111] border-[#111]' : 'text-[#111] border-transparent hover:text-[#333]'
                  }`}
                style={{ letterSpacing: '1px' }}
              >
                Features
              </button>
            </div>
            <div
              role="tab"
              id="tab-label-material-care"
              aria-selected={activeDetailTab === 'material-care'}
              aria-controls="material-care"
              tabIndex={0}
              className={activeDetailTab === 'material-care' ? 'active' : ''}
            >
              <button
                type="button"
                onClick={() => setActiveDetailTab('material-care')}
                className={`text-left text-base font-bold uppercase bg-transparent cursor-pointer py-2 px-0 focus:outline-none border-b-2 ${activeDetailTab === 'material-care' ? 'text-[#111] border-[#111]' : 'text-[#111] border-transparent hover:text-[#333]'
                  }`}
                style={{ letterSpacing: '1px' }}
              >
                Material and care
              </button>
            </div>
          </div>

          <div className="pt-4">
            {activeDetailTab === 'details' && (
              <div id="details" role="tabpanel" aria-labelledby="tab-label-details" className="text-sm text-gray-600 leading-relaxed">
                {longDesc || 'No description available.'}
              </div>
            )}
            {activeDetailTab === 'features' && (
              <div id="features" role="tabpanel" aria-labelledby="tab-label-features">
                <div className="flex flex-wrap gap-2">
                  {displayFeatures.map((label, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeDetailTab === 'material-care' && (
              <div id="material-care" role="tabpanel" aria-labelledby="tab-label-material-care" className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {variant?.detailed_specification || 'No material and care information available.'}
              </div>
            )}
          </div>
        </div>

        {/* PROMOTION */}

        {!isMaxLevel && nextLevel && (
          <div className="mt-6 py-4 px-4 rounded-lg bg-teal-50 border border-teal-100 text-center text-sm">
            Add <span className="font-bold text-teal-700">{qtyNeeded}</span> more{' '}
            {parentDetails.product_name} to reach{' '}
            <span className="font-semibold">{nextLevel.name}</span> for{' '}
            {nextLevel.discount}% off
          </div>
        )}

      </main>
    </div>
  );
}
