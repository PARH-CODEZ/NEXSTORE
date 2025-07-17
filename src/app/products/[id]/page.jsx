'use client'
import React, { useState, useEffect, useActionState } from 'react';
import { Star, Share, Truck, Shield, Award, RotateCcw, Zap, Trash2 } from 'lucide-react';
import Navbar from '@/app/components/Navbar/Navbar';
import CategoryNav from '@/app/components/Categories/Categories';
import BrandSection from '@/app/components/BrandProductScroll/BrandProductScroll';
import Footer from '@/app/components/Footer/Footer';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import ReviewModal from '@/app/components/ReviewModal/ReviewModal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import ProductNotFound from '@/app/components/ProductNotFound/ProductNotFound';


const Productpage = () => {

  const router = useRouter()

  const user = useSelector((state) => state.user.user);

  const params = useParams();
  const id = params?.id;
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState([])
  const [selectedVariant, setSelectedVariant] = useState([])
  const [brand, setBrand] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState();
  const [thumbnailImages, setThumbnailImages] = useState([]);
  const [variants, SetVariants] = useState([])
  const [images, SetImages] = useState()
  const [seller, SetSeller] = useState("")
  const [address, setAddresses] = useState()
  const [defaultCity, setDefaultCity] = useState('');
  const [defaultPostalCode, setDefaultPostalCode] = useState('');
  const [protectionPlan, setProtectionPlan] = useState(false);
  const [giftOptions, setGiftOptions] = useState(false);
  const [exchangeOption, setExchangeOption] = useState('without');
  const [attributeValues, setAttributeValues] = useState([]);
  const [attributeMap, setAttributeMap] = useState({});
  const [primaryAttribute, setPrimaryAttribute] = useState(null);
  const [selectedPrimaryValue, setSelectedPrimaryValue] = useState(null);
  const [isOpen, setIsOpen] = useState(false)
  const [reviewAdded, setReviewAdded] = useState(false);
  const [notFound, setNotFound] = useState(false)

  const handleReviewAdded = () => {
    setReviewAdded(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      return
    }
    const res = await fetch('/api/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete review');

    setReviewAdded(true)
  }

  const handleReviewModal = () => {
    if (!user) {
      router.push("/login")
    }
    else {
      setIsOpen(true)
    }
  }
  const onClose = () => {
    setIsOpen(false);
  };


  // 🔧 Normalize helper
  const normalize = str => str?.toLowerCase().replace(/\s+/g, '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productRes = await fetch(`/api/products/${id}`);
        if (productRes.status === 404) {
          setNotFound(true);
          return;
        }
        const productData = await productRes.json();

        if (!productRes.ok) throw new Error(productData.error || 'Failed to fetch product');
        console.log(productData)
        const product = productData.product;
        const allVariants = product?.variants || [];
        setProduct(product);
        SetVariants(allVariants);
        setBrand(productData.brand);
        setRelatedProducts(productData.relatedProducts);
        SetImages(product.displayImages);
        SetSeller(productData.sellerName);
        setAttributeValues(productData?.variantData?.attributeValues || []);
        setPrimaryAttribute(productData?.variantData?.primaryAttribute || null);

        // Default select the first value
        if (productData?.variantData?.attributeValues?.length > 0) {
          setSelectedPrimaryValue(productData.variantData.attributeValues[0]);
        }

        const attrMap = {};

        allVariants.forEach(variant => {
          variant.attributeMapping.forEach(mapping => {
            const attr = normalize(mapping.value.attribute.name);
            const val = mapping.value.value.trim();

            if (!attrMap[attr]) attrMap[attr] = new Set();
            attrMap[attr].add(val);
          });
        });

        const mapped = {};
        for (const key in attrMap) mapped[key] = Array.from(attrMap[key]);
        setAttributeMap(mapped);

        // 🔍 Pick primary attribute automatically
        let detectedPrimary = null;
        if (mapped['storage']) detectedPrimary = 'storage';
        else if (mapped['size']) detectedPrimary = 'size';

        setPrimaryAttribute(detectedPrimary);

        // ⏺️ Set default selected value
        if (detectedPrimary && mapped[detectedPrimary]?.length > 0) {
          setSelectedPrimaryValue(mapped[detectedPrimary][0]);
        }

        // 📷 Handle initial images
        let initialVariant = null;
        let images = [];

        if (allVariants.length > 0) {
          initialVariant = allVariants[0];
          setSelectedVariant(initialVariant);

          if (initialVariant.images?.length > 0) {
            images = initialVariant.images.map((img) => img.imageUrl);
          }
        }

        if (images.length === 0 && product.images?.length > 0) {
          images = product.images.map((img) => img.imageUrl);
        }

        setThumbnailImages(images);
        setMainImage(images[0] || '/api/placeholder/500/600');

        // 🏡 Load address if user is logged in
        if (user) {
          const addressRes = await fetch('/api/address/list', { credentials: 'include' });
          const addressData = await addressRes.json();

          if (!addressRes.ok) throw new Error(addressData.error || 'Failed to load addresses');

          setAddresses(addressData.addresses);

          const def = addressData.addresses.find((a) => a.IsDefault);
          if (def) {
            setDefaultCity(def.City);
            setDefaultPostalCode(def.PostalCode);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, user, reviewAdded]);

  // ✅ Filtered Variants
  const filteredVariants = primaryAttribute
    ? variants.filter(variant =>
      variant.attributeMapping.some(mapping =>
        normalize(mapping.value.attribute.name) === primaryAttribute &&
        normalize(mapping.value.value) === normalize(selectedPrimaryValue)
      )
    )
    : variants;



  const reviews = product?.reviews || [];
  const totalRatings = reviews?.length;
  const averageRating = totalRatings
    ? (reviews?.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : '0.0';

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    ratingCounts[r.rating] += 1;
  });

  const ratingBreakdown = Object.keys(ratingCounts)
    .reverse()
    .map((star) => {
      const count = ratingCounts[star];
      const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
      return { star: Number(star), count, percent };
    });

  const handleVariantSelection = (variant) => {
    setSelectedVariant(variant);

    let images = [];

    if (variant.images?.length > 0) {
      images = variant.images.map(img => img.imageUrl);
    }

    setThumbnailImages(images);
    setMainImage(images[0] || '/api/placeholder/500/600');
  };



  const parseDescription = (descriptionString) => {
    return descriptionString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== "")
      .map(line => {
        const [title, ...rest] = line.split('—');
        return {
          title: title?.trim(),
          text: rest.join('—').trim(),
        };
      });
  };

  const descriptionItems = product?.description
    ? parseDescription(product.description)
    : [];



  const today = new Date();
  const deliveryStart = new Date();
  const deliveryEnd = new Date();
  deliveryStart.setDate(today.getDate() + 2);
  deliveryEnd.setDate(today.getDate() + 3);

  const options = { day: "numeric", month: "long" };
  const deliveryStartFormatted = deliveryStart.toLocaleDateString("en-IN", options);
  const deliveryEndFormatted = deliveryEnd.toLocaleDateString("en-IN", options);


  const [successId, setSuccessId] = useState(null);
  const [errorId, setErrorId] = useState(null);


  async function handleAddToCart(e, variantId) {

    e.stopPropagation();

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ variantId, quantity: 1 }),
      });

      // 401 → go sign‑in
      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.status === 400) {
        toast.error("MAX QTY REACHED")
      }

      // non‑OK (4xx / 5xx) → treat as failure
      if (!res.ok) throw new Error((await res.json()).error || 'Request failed');

      // ✅ success animation
      setSuccessId(variantId);
      setTimeout(() => setSuccessId(null), 1500);
    } catch (err) {
      console.error('Add‑to‑cart error:', err);

      // ❌ failure animation
      setErrorId(variantId);
      setTimeout(() => setErrorId(null), 1200);

      // (optional) toast / alert
      // toast.error(err.message || 'Could not add to cart');
    }
  }







  if (notFound) return (
    <>
      <Navbar />
      <CategoryNav />
      <ProductNotFound />
    </>)
  return (
    <>
      <div className='overflow-x-hidden'>
        <Navbar />
        <CategoryNav />



        {loading ? (
          <div className="h-[70vh] inset-0 z-50 flex flex-col items-center justify-center bg-white">
            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-sm text-gray-700 font-medium uppercase">Product is loading, please wait...</div>
          </div>

        ) : (
          <>
            <BrandSection
              brandName={brand.name}
              brandImage={brand.imageUrl}
              products={relatedProducts}
            />
            <div className="bg-white min-h-screen ">
              <div className="md:w-[85%] xl:mx-auto px-4 md:px-4 md:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-12 gap-6">

                  {/* Left Column - Thumbnails */}
                  <div className="col-span-5 flex flex-col md:flex-row md:space-x-5">
                    {/* Thumbnails (Desktop only) */}
                    <div className="hidden md:flex flex-col space-y-2 sticky top-6">
                      {thumbnailImages.map((thumb, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-orange-500 bg-gray-50 flex items-center justify-center"
                          onClick={() => setMainImage(thumb)}
                        >
                          <img src={thumb} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <h1 className="text-sm font-medium text-gray-600 leading-tight mb-3 uppercase  md:hidden mt-2">
                      {product.name || 'PRODUCT DESCRIPTION'}
                    </h1>


                    {/* Main Image */}
                    <div className="flex-grow sm:h-[430px] md:h-[700px] bg-gray-50 rounded-lg p-4 md:p-8 mb-4 w-full">
                      <img
                        src={mainImage}
                        alt="Selected Product"
                        className="w-full h-full object-contain "
                      />

                      {/* Dots (Mobile only) */}
                      <div className="flex justify-center items-center space-x-2 mt-4 md:hidden">
                        {thumbnailImages.map((thumb, index) => (
                          <div
                            key={index}
                            onClick={() => setMainImage(thumb)}
                            className={`w-2.5 h-2.5 rounded-full cursor-pointer ${mainImage === thumb ? 'bg-orange-500' : 'bg-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>



                  {/* Right Column - Product Details */}
                  <div className="col-span-5 md:col-span-4 w-full ">
                    <div className="space-y-4  ">
                      {/* Header with Share Icon */}
                      <div className="hidden justify-between items-start border-b border-gray-300 pb-2 md:flex ">
                        <div className="flex-1">
                          <h1 className="text-2xl font-medium text-gray-900 leading-tight mb-3 uppercase hidden md:block">
                            {product.name || 'PRODUCT DESCRIPTION'}
                          </h1>
                          <p className="text-blue-800 text-sm hover:underline cursor-pointer mb-2 uppercase">Visit the Apple Store</p>

                          {/*Stars */}
                          <div className="flex items-center mt-2">
                            <span className="text-orange-500 text-sm mr-1">{averageRating}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'text-orange-500 fill-current' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-blue-800 text-sm ml-2 hover:underline cursor-pointer uppercase">
                              {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                            </span>
                          </div>

                          <div className='text-xs font-semibold mt-2 mb-1'>200 + BROUGHT LAST MONTH </div>
                        </div>
                        <Share className="h-5 w-5 text-gray-500 cursor-pointer ml-4" />
                      </div>

                      {/* Price Section */}
                      <div className="">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                            ({Math.round(product.discountPercent)}%)
                          </span>
                          <span className="text-3xl font-semibold text-gray-900">
                            ₹{Math.round(
                              Number(product.price) - (Number(product.price) * Number(product.discountPercent) / 100)
                              + Number(selectedVariant?.additionalPrice ?? 0)
                            ).toLocaleString('en-IN')}
                          </span>

                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span>M.R.P.: </span>
                          <span className="line-through">
                            ₹{(
                              Number(product.price) +
                              Number(selectedVariant?.additionalPrice ?? 0)
                            ).toLocaleString('en-IN')}
                          </span>

                        </div>
                        <div className="text-sm text-gray-600 mb-2">Inclusive of all taxes</div>
                        <div className="text-sm">
                          <span className="text-gray-700">
                            EMI starts at ₹{Math.round((product.price - (product.price * product.discountPercent / 100)) / 12).toLocaleString('en-IN')}. No Cost EMI available.
                          </span>
                          <span className="text-blue-600 hover:underline cursor-pointer">EMI options ⌄</span>
                        </div>
                      </div>

                      {/* Offers Section */}
                      <div className="rounded-lg">
                        {/* Title */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">%</span>
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900 uppercase">Offers</h2>
                        </div>

                        {/* Horizontally Scrollable Offer Cards */}
                        <div className="flex overflow-x-auto space-x-3 pb-2 faint-scrollbar">
                          {[
                            {
                              title: "No Cost EMI",
                              description: "Upto ₹7,700.07 EMI interest savings on select Credit Cards",
                              offers: "1 offer ›"
                            },
                            {
                              title: "Bank Offer",
                              description: "Upto ₹3,000.00 discount on select Credit Cards",
                              offers: "5 offers ›"
                            },
                            {
                              title: "Cashback",
                              description: "Upto ₹5,127.00 cashback as Amazon Pay Balance when you pay...",
                              offers: "1 offer ›"
                            }
                          ].map((offer, index) => (
                            <div
                              key={index}
                              className="max-w-[180px] border border-gray-200 rounded-md bg-white shadow-sm flex flex-col justify-between p-3"
                            >
                              <div>
                                <div className="font-semibold text-sm mb-1 uppercase truncate">{offer.title}</div>
                                <div className="text-xs text-gray-600 truncate">{offer.description}</div>
                              </div>
                              <div className="text-xs text-blue-600 hover:underline cursor-pointer mt-2 uppercase truncate">
                                {offer.offers}
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>




                      {/* SERVICE ICONS */}
                      <div className="flex items-start justify-between gap-2 px-2 py-3 bg-white text-sm border-b border-gray-400 overflow-x-auto">
                        {[
                          { icon: <RotateCcw className="h-5 w-5 text-yellow-500" />, label: '10 days Service Centre Replacement' },
                          { icon: <Truck className="h-5 w-5 text-yellow-500" />, label: 'Free Delivery' },
                          { icon: <Shield className="h-5 w-5 text-yellow-500" />, label: 'Warranty Policy' },
                          { icon: <Zap className="h-5 w-5 text-yellow-500" />, label: 'Cash/Pay on Delivery' },
                          { icon: <Award className="h-5 w-5 text-yellow-500" />, label: 'Top Brand' }
                        ].map((item, index) => (
                          <div key={index} className="flex flex-col items-center text-center w-[68px]">
                            <div className="w-12 h-12 border border-black rounded-full flex items-center justify-center mb-1">
                              {item.icon}
                            </div>
                            <span className="text-[10px] text-blue-700 leading-tight truncate text-ellipsis overflow-hidden w-full">
                              {item.label}
                            </span>
                          </div>
                        ))}

                      </div>




                      {/* Product Selection */}
                      <div className="pb-8 border-b border-gray-400 sm:order-2">
                        {/* Selected Variant Label */}
                        <div className="mb-3">
                          <span className="text-sm font-normal uppercase">Variant: </span>
                          <span className="text-sm font-semibold uppercase">
                            {selectedVariant?.variantName || 'Default'}
                          </span>
                        </div>

                        {/* 🔹 Dynamic Attribute Selection (Storage/Size) */}
                        {attributeValues.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {attributeValues.map(value => (
                              <button
                                key={value}
                                onClick={() => setSelectedPrimaryValue(value)}
                                className={`px-3 py-1 border rounded text-sm capitalize ${normalize(selectedPrimaryValue) === normalize(value)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-800 border-gray-300'
                                  }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 🔸 Variant Thumbnails Filtered by Selected Value */}
                        <div className="flex flex-wrap gap-3">
                          {filteredVariants.map(variant => (
                            <div key={variant.id} className="w-16 text-center cursor-pointer">
                              <div
                                className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${selectedVariant?.id === variant.id
                                  ? 'border-blue-500'
                                  : 'border-gray-300'
                                  }`}
                                onClick={() => handleVariantSelection(variant)}
                              >
                                <img
                                  src={variant.images?.[0]?.imageUrl || '/api/placeholder/100/100'}
                                  alt={variant.variantName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs mt-1 capitalize">{variant.variantName}</div>
                            </div>
                          ))}
                        </div>
                      </div>



                      {/* Actions */}
                      <div className='md:hidden mb-4 border-b border-gray-400 pb-8'>
                        <div className="pb-8">
                          <div className="flex items-center justify-between mb-2">
                            {['mobiles', 'electronics', 'washing-machines', 'acs', 'laptops'].includes(product.category?.Slug) && (
                              <>
                                <div>
                                  <span className="font-semibold text-sm uppercase">With Exchange</span>
                                  <div className="text-sm text-orange-600 font-medium">
                                    Up to ₹{Math.round(product.price * (30 / 100)).toLocaleString("en-IN")} off
                                  </div>
                                </div>
                                <input
                                  type="radio"
                                  name="exchange"
                                  value="with"
                                  checked={exchangeOption === 'with'}
                                  onChange={(e) => setExchangeOption(e.target.value)}
                                  className="w-4 h-4"
                                />
                              </>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-sm uppercase">Buy new:</span>
                              <div className="text-sm">
                                ₹{Math.round(product.price - (product.price * product.discountPercent / 100)).toLocaleString('en-IN')}
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="exchange"
                              value="without"
                              checked={exchangeOption === 'without'}
                              onChange={(e) => setExchangeOption(e.target.value)}
                              className="w-4 h-4"
                            />
                          </div>
                        </div>


                        {/* Delivery Info */}
                        <div className="mb-4">
                          <div className="text-blue-600 font-medium text-sm mb-1 uppercase">
                            FREE delivery {deliveryStartFormatted} - {deliveryEndFormatted}
                          </div>

                          <div className="flex items-center text-sm gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-gray-700">Delivering to {(defaultPostalCode, defaultCity) || '400001 Mumbai '}</span>
                            <Link href={"/account"}><span className="text-blue-600 hover:underline cursor-pointer uppercase"> Update location</span></Link>
                          </div>
                        </div>

                        {/* Stock and Seller Info */}
                        <div className="mb-4 text-sm space-y-1">
                          <div
                            className={`font-semibold text-base flex items-center gap-2 ${product.stockAvailable ? 'text-green-600' : 'text-red-600'
                              }`}
                          >
                            {product.stockAvailable ? 'IN STOCK' : 'CURRENTLY UNAVAILABLE'}
                          </div>


                          <div className="text-gray-700">SHIPS FROM <span className="font-medium">NEXSTORE</span></div>
                          <div className="text-gray-700">SOLD BY:<span className="font-medium">{seller || "SELLER"}</span></div>
                          <div className="text-gray-700">PAYMENT<span className="font-medium text-blue-600 uppercase">Secure transaction</span></div>
                        </div>

                        {/* Protection Plan */}
                        <div className="mb-4">
                          <div className="font-semibold text-sm mb-2 uppercase">Add a Protection Plan:</div>
                          <div className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={protectionPlan}
                              onChange={(e) => setProtectionPlan(e.target.checked)}
                              className="mt-1 w-4 h-4"
                            />
                            <div className="text-sm">
                              <div className="text-blue-600 hover:underline cursor-pointer uppercase">Protect+ for  {product.title} (1year)</div>
                              <div className="text-gray-600">(Email Delivery, No Physical Kit)</div>
                              <div className="font-semibold">For ₹{Math.round(product.price * (10 / 100)).toLocaleString("en-IN")} </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={(e) => handleAddToCart(e, selectedVariant.id)}
                            disabled={!product.stockAvailable}
                            className={`w-full font-medium py-2 px-4 rounded-lg text-sm uppercase transition-transform duration-300
    ${!product.stockAvailable
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : successId === selectedVariant.id
                                  ? 'bg-blue-500 text-white scale-95'
                                  : errorId === selectedVariant.id
                                    ? 'bg-red-500 text-white scale-95'
                                    : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                              }
  `}
                          >
                            {successId === selectedVariant.id
                              ? '✓ Added to Cart'
                              : errorId === selectedVariant.id
                                ? 'Failed'
                                : 'Add to Cart'}
                          </button>



                          <button
                            className={`w-full font-medium py-2 px-4 rounded-lg text-sm uppercase 
                            ${!product.stockAvailable
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                            disabled={!product.stockAvailable}
                          >
                            Buy Now
                          </button>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={giftOptions}
                              onChange={(e) => setGiftOptions(e.target.checked)}
                              className="w-4 h-4"
                              disabled={!product.stockAvailable}
                            />
                            <span className={`text-sm ${!product.stockAvailable ? 'text-gray-400' : ''}`}>
                              Add gift options
                            </span>
                          </div>
                        </div>


                      </div>


                    </div>

                    <div className="my-6 ">
                      {/* Specifications */}

                      {product?.specifications?.length > 0 && (
                        <div className="bg-white border-b border-gray-400 my-6 pb-6">
                          <h2 className="text-xl font-medium mb-4 text-gray-900 uppercase">
                            Technical Specifications
                          </h2>
                          <div className="space-y-4">
                            {product.specifications.map((spec) => (
                              <div
                                key={spec.id}
                                className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-sm"
                              >
                                <span className="text-gray-800 font-semibold sm:col-span-2 uppercase ">
                                  {spec.label.trim()}
                                </span>
                                <span className="text-gray-900 sm:col-span-3">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {descriptionItems.length > 0 && (
                        <div className="bg-white rounded-lg">
                          <h2 className="text-xl font-bold mb-4 uppercase">About this item</h2>
                          <div className="space-y-4">
                            {descriptionItems.map((item, index) => (
                              <div key={index}>
                                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}



                    </div>

                  </div>

                  {/*Right hand ActionBar on Larger Screens */}
                  <div className="top-20 flex-col h-[700px] right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 hidden md:block">
                    {/* Exchange Options */}
                    <div className="mb-4">
                      {['mobiles', 'electronics', 'washing-machines', 'acs', 'laptops'].includes(product.category?.Slug) && (
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-sm uppercase">With Exchange</span>
                            <div className="text-sm text-orange-600 font-medium">
                              Up to ₹{Math.round(product.price * (30 / 100)).toLocaleString("en-IN")} off
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="exchange"
                            value="with"
                            checked={exchangeOption === 'with'}
                            onChange={(e) => setExchangeOption(e.target.value)}
                            className="w-4 h-4"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm uppercase">Buy new:</span>
                          <div className="text-sm">
                            ₹{Math.round(product.price - (product.price * product.discountPercent / 100)).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="exchange"
                          value="without"
                          checked={exchangeOption === 'without'}
                          onChange={(e) => setExchangeOption(e.target.value)}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>


                    {/* Delivery Info */}
                    <div className="mb-4">
                      <div className="text-blue-600 font-medium text-sm mb-1 uppercase">
                        FREE delivery {deliveryStartFormatted} - {deliveryEndFormatted}
                      </div>

                      <div className="flex items-center text-sm gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-700 uppercase">Delivering to {(defaultPostalCode, defaultCity) || '400001 Mumbai'}</span>
                        <span className="text-blue-600 hover:underline cursor-pointer uppercase">Update location</span>
                      </div>
                    </div>

                    {/* Stock and Seller Info */}
                    <div className="mb-4 text-sm space-y-1">
                      <div
                        className={`font-semibold text-base flex items-center gap-2 ${product.stockAvailable ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {product.stockAvailable ? 'IN STOCK' : 'CURRENTLY UNAVAILABLE'}
                      </div>

                      <div className="text-gray-700">SHIPS FROM <span className="font-medium">NEXSTORE</span></div>
                      <div className="text-gray-700">Sold by <span className="font-medium">{seller || "SELLER"}</span></div>
                      <div className="text-gray-700">Payment <span className="font-medium text-blue-600 uppercase">Secure transaction</span></div>
                    </div>

                    {/* Protection Plan */}
                    <div className="mb-4">
                      <div className="font-semibold text-sm mb-2 uppercase">Add a Protection Plan:</div>
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={protectionPlan}
                          onChange={(e) => setProtectionPlan(e.target.checked)}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="text-sm">
                          <div className="text-blue-600 hover:underline cursor-pointer uppercase">Protect+ for  {product.title} (1year)</div>
                          <div className="text-gray-600">(Email Delivery, No Physical Kit)</div>
                          <div className="font-semibold">For ₹{Math.round(product.price * (10 / 100)).toLocaleString("en-IN")} </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Add to Cart */}
                      <button
                        onClick={(e) => handleAddToCart(e, selectedVariant.id)}
                        disabled={!product.stockAvailable}
                        className={`w-full font-medium py-2 px-4 rounded-lg text-sm uppercase transition-transform duration-300
    ${!product.stockAvailable
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : successId === selectedVariant.id
                              ? 'bg-blue-500 text-white scale-95'
                              : errorId === selectedVariant.id
                                ? 'bg-red-500 text-white scale-95'
                                : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                          }
  `}
                      >
                        {successId === selectedVariant.id
                          ? '✓ Added to Cart'
                          : errorId === selectedVariant.id
                            ? 'Failed'
                            : 'Add to Cart'}
                      </button>



                      {/* Buy Now */}
                      <button
                        className={`w-full font-medium py-2 px-4 rounded-lg text-sm uppercase
                           ${!product.stockAvailable
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                        disabled={!product.stockAvailable}
                      >
                        Buy Now
                      </button>

                      {/* Gift options */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={giftOptions}
                          onChange={(e) => setGiftOptions(e.target.checked)}
                          className="w-4 h-4"
                          disabled={!product.stockAvailable}
                        />
                        <span className={`text-sm ${!product.stockAvailable ? 'text-gray-400' : ''}`}>
                          Add gift options
                        </span>
                      </div>
                    </div>

                  </div>


                </div>
              </div>



            </div>
            <div className="xl:w-[85%] xl:mx-auto px-4 py-6 md:block">
              <div className="flex flex-col">
                {images?.map((image, index) => (
                  <img
                    key={image.id || index}
                    src={image.imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full rounded mb-[-2px]"
                  />
                ))}
              </div>
            </div>
            {/*reviews*/}
            <div className="w-full xl:w-[85%] xl:mx-auto px-4 py-10 bg-white rounded-lg">
              {/* Section Title */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">CUSTOMERS SAY -</h3>
              </div>

              {/* Side-by-side layout */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Customer Review Summary */}
                <div className="w-full lg:w-1/3 bg-white p-4 rounded-md border text-sm shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 uppercase">Customer reviews</h3>
                  <div className="flex items-center mt-1 mb-1 text-orange-500">
                    {Array(Math.floor(averageRating))
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                      ))}
                    {averageRating % 1 >= 0.5 && (
                      <Star size={16} fill="currentColor" strokeWidth={0} className="opacity-50" />
                    )}
                    <span className="text-sm text-gray-800 ml-2 font-medium">
                      {averageRating} out of 5
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-4">
                    {reviews.length.toLocaleString("en-IN")} global ratings
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-1 mb-4">
                    {ratingBreakdown.map((item) => (
                      <div key={item.star} className="flex items-center gap-2">
                        <div className="w-12 text-right text-blue-700 font-medium">{item.star} star</div>
                        <div className="flex-1 bg-gray-200 h-3 rounded overflow-hidden">
                          <div
                            className="bg-orange-400 h-3"
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>
                        <div className="w-10 text-right text-gray-700">{item.percent}%</div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-4" />

                  {/* CTA */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1 uppercase">Review this product</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      Share your thoughts with other customers
                    </p>
                    <button onClick={handleReviewModal} className="border border-gray-400 rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-100 transition uppercase">
                      Write a product review
                    </button>
                  </div>
                </div>

                {/* Right: Review Cards */}
                <div className="w-full lg:w-2/3">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 uppercase">Top reviews from India</h3>
                  <div className="max-h-[650px] overflow-y-auto pr-2 custom-scroll flex flex-wrap gap-4">
                    {reviews.map((review, index) => (
                      <div
                        key={index}
                        className="w-full border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm relative"
                      >
                        {/* Show delete icon if it's the current user's review */}
                        {user?.id === review.userId && (
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="absolute top-2 right-2 text-red-600 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}

                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 text-white font-semibold">
                            {review.user?.FullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{review.user?.FullName}</span>
                        </div>

                        <div className="flex items-center text-yellow-500 text-sm mb-2">
                          <div className="flex mr-2">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        <div className="text-sm text-gray-800 leading-relaxed">{review.review}</div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>

              {/* Bottom CTA for smaller screens */}

            </div>

            <ReviewModal isOpen={isOpen} onClose={onClose} productId={id} userId={user?.id} onReviewAdded={handleReviewAdded} />
            <Footer />



          </>

        )}


      </div>



    </>
  );
};

export default Productpage;