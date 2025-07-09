import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { useRouter } from 'next/navigation';


const ProductCard = ({ products = [] }) => {
  const router=useRouter();
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-4 h-4 fill-orange-400 text-orange-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getProductImage = (product) => {
    const productImage = product.images?.[0]?.imageUrl;
    const variantImage = product.variants?.[0]?.images?.[0]?.imageUrl;
    return productImage || variantImage || '/placeholder.jpg'; // fallback to placeholder if none found
  };

  const getDiscountedPrice = (price, discountPercent) => {
    if (!discountPercent || discountPercent <= 0) return price;
    return Math.round(price * (1 - discountPercent / 100));
  };

  const getTwoDaysLaterDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Add 2 days

    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }); // Example: "Thu, 11 Jul"
  };




  const getAverageRating = (reviews = []) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div className="space-y-4">
      {products.map((product, index) => {
        const avgRating = getAverageRating(product.reviews || []);
        const reviewCount = product._count?.reviews || 0;

        return (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden "
           onClick={() => router.push(`/products/${product.id}`)}>
            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <span className="text-xs text-gray-500 mr-2">Sponsored</span>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">i</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-80 h-80 object-contain"
                    />
                  </div>


                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 uppercase">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {renderStars(avgRating)}
                      </div>
                      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                        {reviewCount}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      {product.purchaseCount || 500}+ bought in past month
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-medium text-gray-900">
                        {formatPrice(getDiscountedPrice(product.price, product.discountPercent))}
                      </span>

                      <span className="text-sm text-gray-500">
                        M.R.P: <span className="line-through">{formatPrice(product.mrp || product.price)}</span>
                      </span>
                      <span className="text-sm text-gray-900">
                        ({Math.round(product.discountPercent || 0)}% off)

                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-3 uppercase">
                      Save extra with No Cost EMI
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      Buy for {formatPrice(getDiscountedPrice(product.price, product.discountPercent))} with Amazon Pay
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium uppercase">
                        prime
                      </div>
                    </div>

                    <div className="text-sm mb-2">
                      <span className="font-medium">FREE delivery</span> {getTwoDaysLaterDate()}

                    </div>


                    <div className="text-sm text-gray-600 mb-4">
                      Service: Installation
                    </div>

                    <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 text-sm font-medium mb-3 uppercase">
                      Add to cart
                    </button>

                    {product._count.variants > 0 && (
                      <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                        +{product._count.variants - 1} other colors/patterns
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="block md:hidden">
              <div className="p-3">
                <div className="flex items-center mb-2">
                  <span className="text-xs text-gray-500">Sponsored</span>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-40 h-40 object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-3 uppercase">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center">
                        {renderStars(avgRating)}
                      </div>
                      <span className="text-xs text-blue-600">
                        ({reviewCount})
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      {product.purchaseCount || 500}+ bought in past month
                    </div>

                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-lg font-medium text-gray-900">
                        {formatPrice(getDiscountedPrice(product.price, product.discountPercent))}
                      </span>
                      <span className="text-xs text-gray-500">
                        M.R.P: <span className="line-through">{formatPrice(product.mrp || product.price)}</span>
                      </span>
                      <span className="text-xs text-gray-900">
                        ({Math.round(product.discountPercent || 0)}% off)

                      </span>
                    </div>


                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        prime
                      </div>
                    </div>

                    <div className="text-xs mb-1">
                      <span className="font-medium">FREE delivery</span> {getTwoDaysLaterDate()}
                    </div>


                    <div className="text-xs text-gray-600 mb-3">
                      Service: Installation
                    </div>

                    <div className="text-xs text-blue-600 hover:underline cursor-pointer mb-3">
                      +{product.otherOptions || 0} other colors/patterns
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 text-sm font-medium uppercase rounded-sm">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ✅ ProductGrid wrapper - receives products from parent
const ProductGrid = ({ products = [] }) => {
  return (
    <div className="md:w-[80%] md:p-4">
      <ProductCard products={products} />
    </div>
  );
};

export default ProductGrid;
