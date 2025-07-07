import React from 'react';
import { Star, StarHalf, Check } from 'lucide-react';

const ProductCard = ({ products = [] }) => {
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
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="p-4">
              {/* Sponsored Badge */}
              <div className="flex items-center mb-3">
                <span className="text-xs text-gray-500 mr-2">Sponsored</span>
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">i</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-60 h-60 object-contain"
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 uppercase">
                    {product.title}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {product.reviewCount}
                    </span>
                  </div>
                  
                  {/* Purchase Info */}
                  <div className="text-sm text-gray-600 mb-3">
                    {product.purchaseCount}+ bought in past month
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      M.R.P: <span className="line-through">{formatPrice(product.mrp)}</span>
                    </span>
                    <span className="text-sm text-gray-900">
                      ({product.discount}% off)
                    </span>
                  </div>
                  
                  {/* EMI Info */}
                  <div className="text-sm text-gray-600 mb-3">
                    Save extra with No Cost EMI
                  </div>
                  
                  {/* Prime Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium uppercase">
                      prime
                    </div>
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="text-sm mb-2">
                    <span className="font-medium">FREE delivery</span> {product.deliveryDate}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Or fastest delivery {product.fastestDelivery}
                  </div>
                  
                  {/* Service */}
                  <div className="text-sm text-gray-600 mb-4">
                    Service: {product.service}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 text-sm font-medium mb-3 uppercase">
                    Add to cart
                  </button>
                  
                  {/* Other Options */}
                  <div className="text-sm text-blue-600 hover:underline cursor-pointer">
                    +{product.otherOptions} other colors/patterns
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="p-3">
              {/* Sponsored Badge */}
              <div className="flex items-center mb-2">
                <span className="text-xs text-gray-500">Sponsored</span>
              </div>
              
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-40 h-40 object-contain"
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-3 uppercase">
                    {product.title}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-xs text-blue-600">
                      ({product.reviewCount})
                    </span>
                  </div>
                  
                  {/* Purchase Info */}
                  <div className="text-xs text-gray-600 mb-2">
                    {product.purchaseCount}+ bought in past month
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      M.R.P: <span className="line-through">{formatPrice(product.mrp)}</span>
                    </span>
                    <span className="text-xs text-gray-900">
                      ({product.discount}% off)
                    </span>
                  </div>
                  
                  {/* EMI Info */}
                  <div className="text-xs text-gray-600 mb-2">
                    Buy for {formatPrice(product.emiPrice)} with Amazon Pay ICICI...
                  </div>
                  
                  {/* Prime Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                      prime
                    </div>
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="text-xs mb-1">
                    <span className="font-medium">FREE delivery</span> {product.deliveryDate}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Or fastest delivery {product.fastestDelivery}
                  </div>
                  
                  {/* Service */}
                  <div className="text-xs text-gray-600 mb-3">
                    Service: {product.service}
                  </div>
                  
                  {/* Other Options */}
                  <div className="text-xs text-blue-600 hover:underline cursor-pointer mb-3">
                    +{product.otherOptions} other colors/patterns
                  </div>
                </div>
              </div>
              
              {/* Add to Cart Button - Full Width on Mobile */}
              <div className="mt-3">
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 text-sm font-medium uppercase rounded-sm">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Example usage component
const ProductGrid = () => {
  const sampleProducts = [
    {
      title: "iPhone 16 Pro Max 256 GB: 5G Mobile Phone with Camera Control, 4K 120 fps Dolby Vision and a Huge Leap in Battery Life. Works with AirPods; Black Titanium",
      image: "/IP.jpg",
      rating: 4.3,
      reviewCount: "253",
      purchaseCount: "200",
      price: 135900,
      mrp: 144900,
      discount: 6,
      emiPrice: 131900,
      deliveryDate: "Sun, 6 Jul",
      fastestDelivery: "Tomorrow, 5 Jul",
      service: "Installation",
      otherOptions: 3
    },
   
  ];

  return (
    <div className="md:w-[80%] md:p-4">
      <ProductCard products={sampleProducts} />
    </div>
  );
};

export default ProductGrid;