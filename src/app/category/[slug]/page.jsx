'use client'
import React, { useState, useEffect } from 'react';
import { ChevronDown, Star, Info } from 'lucide-react';
import CategoryNav from '@/app/components/Categories/Categories';
import Navbar from '@/app/components/Navbar/Navbar';

export default function AmazonDesktopUI() {
  const [selectedFilters, setSelectedFilters] = useState({
    getItToday: false,
    getItTomorrow: false,
    getIt2Days: false,
    samsung: false,
    iqoo: false,
    oneplus: false,
    realme: false,
    redmi: false,
    motorola: false,
    apple: false
  });

  const brands = ['Samsung', 'iQOO', 'OnePlus', 'realme', 'Redmi', 'Motorola', 'Apple'];
  const [showAll, setShowAll] = useState(false);
  const visibleBrands = showAll ? brands : brands.slice(0, 7);


  const [products, setProducts] = useState([]);

  const [totalResults, setTotalResults] = useState(40000);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('Featured');



  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(131000);


  const percentage = ((minPrice / 131000) * 100).toFixed(2);
  const percentageMax = ((maxPrice / 131000) * 100).toFixed(2);


  const handleMinChange = (e) => {
    let value = Number(e.target.value);
    console.log('Min slider value:', value, 'Max price:', maxPrice);

    const maxLimit = maxPrice - 1000;
    if (maxLimit < 0) {
      // Prevent invalid max limit, just allow minPrice to 0 in this edge case
      setMinPrice(0);
      return;
    }

    if (value < 0) value = 0;
    if (value > maxLimit) value = maxLimit;

    setMinPrice(value);
  };



  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
  };






  useEffect(() => {
    setProducts([]);
  }, []);

  // Function to fetch products from backend
  const fetchProducts = async (filters = {}, page = 1, sort = 'Featured') => {
    setLoading(true);
    try {
      // Replace this with your actual API call
      // const response = await fetch(`/api/products?page=${page}&sort=${sort}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(filters)
      // });
      // const data = await response.json();
      // setProducts(data.products);
      // setTotalResults(data.total);

      // For now, using mock data
      setTimeout(() => {
        setProducts([mockProduct]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    const newFilters = {
      ...selectedFilters,
      [filter]: !selectedFilters[filter]
    };
    setSelectedFilters(newFilters);

    // Fetch products with new filters
    fetchProducts(newFilters, currentPage, sortBy);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    fetchProducts(selectedFilters, currentPage, newSort);
  };

  return (

    <>
      <Navbar />
      <CategoryNav />
      <div className="min-h-screen bg-white max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center max-w-screen mx-auto">
            <div className="text-md font-semibold text-gray-700">
              SHOWING { } ITEMS
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-700 mr-1">SORT BY- </span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="uppercase text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-2 focus:border-blue-500 focus:ring-0 transition-all duration-200"
              >
                <option value="Featured">FEATURED</option>
                <option value="Price: Low to High">PRICE: LOW TO HIGH</option>
                <option value="Price: High to Low">PRICE: HIGH TO LOW</option>
                <option value="Customer Rating">CUSTOMER RATING</option>
                <option value="Newest Arrivals">NEWEST ARRIVALS</option>
              </select>
            </div>
          </div>
        </div>


        <div className="max-w-screen-xl  flex">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            {/* Delivery Day Section */}
            <div className="p-4">
              <h3 className="font-semibold text-md text-gray-900 mb-3 uppercase">Delivery Day</h3>
              <div className="space-y-2">
                <label className="flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mr-3 accent-orange-500"
                    checked={selectedFilters.getItToday}
                    onChange={() => handleFilterChange('getItToday')}
                  />
                  <span className="text-gray-700 uppercase">Get It Today</span>
                </label>
                <label className="flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mr-3 accent-orange-500"
                    checked={selectedFilters.getItTomorrow}
                    onChange={() => handleFilterChange('getItTomorrow')}
                  />
                  <span className="text-gray-700 uppercase">Get It by Tomorrow</span>
                </label>
                <label className="flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mr-3 accent-orange-500"
                    checked={selectedFilters.getIt2Days}
                    onChange={() => handleFilterChange('getIt2Days')}
                  />
                  <span className="text-gray-700 uppercase">Get It in 2 Days</span>
                </label>
              </div>
            </div>

            {/* Brands Section */}
            <div className="p-4">
              <h3 className="font-semibold text-md text-gray-900 mb-3 uppercase">Brands</h3>
              <div className="space-y-2">
                {visibleBrands.map((brand) => {
                  const key = brand.toLowerCase();
                  const isChecked = selectedFilters[key];

                  return (
                    <label key={key} className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mr-3 accent-orange-500"
                        checked={isChecked}
                        onChange={() => handleFilterChange(key)}
                      />
                      <span
                        className={`font-medium uppercase  ${isChecked ? 'text-blue-600' : 'text-gray-700'
                          }`}
                      >
                        {brand}
                      </span>
                    </label>
                  );
                })}

                {/* See More / See Less */}
                {brands.length > 7 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-blue-600 text-sm flex items-center mt-2 hover:text-blue-800"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        See Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        See More
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>


            {/* Price Section */}
            <div className="p-4">
              <h3 className="font-bold text-sm text-gray-900 mb-3 uppercase">Price</h3>
              <div className="text-sm text-gray-700 mb-4">
                ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
              </div>

              {/* Price Range Slider */}
              <div className="relative mb-4 h-6">
                <div className="h-2 bg-gray-200 rounded-full relative">
                  <div
                    className="absolute top-0 h-2 bg-teal-500 rounded-full"
                    style={{ left: `${percentage}%`, width: `${percentageMax - percentage}%` }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-md cursor-pointer"
                    style={{ left: `${percentage}%` }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-md cursor-pointer"
                    style={{ left: `${percentageMax}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="131000"
                  step="1000"
                  value={minPrice}
                  onChange={handleMinChange}
                  className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
                />
                <input
                  type="range"
                  min="0"
                  max="131000"
                  step="1000"
                  value={maxPrice}
                  onChange={handleMaxChange}
                  className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-20"
                />
              </div>

              <button
                onClick={handleSortChange}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded text-sm font-medium border border-gray-300"
              >
                GO
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white">
            {/* Results Header */}
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1 uppercase">Results</h2>
              <p className="text-sm text-gray-600 uppercase">Check each product page for other buying options.</p>
            </div>

            {/* Product Cards */}

          </div>
        </div>



      </div>
    </>
  );
}


// const mockProduct = {
//     id: 1,
//     title: "Redmi A4 5G (Sparkle Purple, 4GB RAM, 64GB Storage) | Global Debut SD 4s Gen 2 | Segment Largest 6.88in 120Hz | 50MP Dual Camera | 18W Fast Charging",
//     brand: "Redmi",
//     model: "A4 5G",
//     color: "Sparkle Purple",
//     ram: "4GB",
//     storage: "64GB",
//     price: 8498,
//     originalPrice: 10999,
//     discount: 23,
//     rating: 3.9,
//     reviewCount: 4100,
//     image: "", // Add your image URL here
//     isSponsored: true,
//     isLimitedDeal: true,
//     deliveryDate: "Fri, 4 Jul",
//     isPrimeFreeDelivery: true,
//     deliveryTime: "Tomorrow 8 am - 12 pm",
//     cashbackOffer: "Up to 5% back with Amazon Pay ICICI...",
//     service: "Installation",
//     otherVariants: 1,
//     purchaseCount: "5K+",
//     features: [
//       "Global Debut SD 4s Gen 2",
//       "Segment Largest 6.88in 120Hz",
//       "50MP Dual Camera",
//       "18W Fast Charging"
//     ]
//   };

//   <div className="p-4">
//               {loading ? (
//                 <div className="flex justify-center items-center h-64">
//                   <div className="text-gray-500">Loading products...</div>
//                 </div>
//               ) : (
//                 products.map((product) => (
//                   <div key={product.id} className="border border-gray-200 rounded-lg bg-white mb-4">
//                     {/* Sponsored Header */}
//                     {product.isSponsored && (
//                       <div className="px-4 pt-3 pb-2">
//                         <div className="flex items-center">
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mr-1">Sponsored</span>
//                           <Info className="w-3 h-3 text-gray-400" />
//                         </div>
//                       </div>
//                     )}

//                     <div className="px-4 pb-4">
//                       <div className="flex gap-6">
//                         {/* Product Image Container */}
//                         <div className="w-64 flex-shrink-0">
//                           <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
//                             {product.image ? (
//                               <img
//                                 src={product.image}
//                                 alt={product.title}
//                                 className="w-full h-full object-contain rounded-lg"
//                               />
//                             ) : (
//                               <div className="text-gray-400 text-sm text-center">
//                                 Product Image<br />
//                                 ({product.brand} {product.model})
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Product Details */}
//                         <div className="flex-1">
//                           {/* Product Title */}
//                           <h3 className="text-gray-900 font-normal text-base mb-2 leading-snug">
//                             {product.title}
//                           </h3>

//                           {/* Rating */}
//                           <div className="flex items-center mb-2">
//                             <span className="text-sm font-medium text-gray-900 mr-1">{product.rating}</span>
//                             <div className="flex text-orange-400 mr-2">
//                               {[1, 2, 3, 4, 5].map((star) => (
//                                 <Star
//                                   key={star}
//                                   className={`w-4 h-4 ${star <= Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}
//                                 />
//                               ))}
//                             </div>
//                             <ChevronDown className="w-3 h-3 text-blue-600 mr-1" />
//                             <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
//                               ({product.reviewCount.toLocaleString()})
//                             </span>
//                           </div>

//                           {/* Purchase Info */}
//                           <div className="text-sm text-gray-600 mb-2">
//                             {product.purchaseCount}+ bought in past month
//                           </div>

//                           {/* Limited Time Deal */}
//                           {product.isLimitedDeal && (
//                             <div className="mb-3">
//                               <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
//                                 Limited time deal
//                               </span>
//                             </div>
//                           )}

//                           {/* Price Section */}
//                           <div className="mb-2">
//                             <div className="flex items-baseline">
//                               <span className="text-lg text-gray-900">₹</span>
//                               <span className="text-2xl font-normal text-gray-900">
//                                 {product.price.toLocaleString()}
//                               </span>
//                               <span className="text-sm text-gray-600 ml-3">M.R.P:</span>
//                               <span className="text-sm text-gray-600 line-through ml-1">
//                                 ₹{product.originalPrice.toLocaleString()}
//                               </span>
//                               <span className="text-sm text-gray-600 ml-1">
//                                 ({product.discount}% off)
//                               </span>
//                             </div>
//                           </div>

//                           {/* Cashback Info */}
//                           <div className="text-sm text-gray-600 mb-3">{product.cashbackOffer}</div>

//                           {/* Delivery Info */}
//                           <div className="mb-3">
//                             <div className="text-sm font-medium text-gray-900 mb-1">
//                               FREE delivery {product.deliveryDate}
//                             </div>
//                             {product.isPrimeFreeDelivery && (
//                               <div className="text-sm text-gray-600 mb-1">
//                                 Or <span className="text-blue-600 hover:text-blue-800 cursor-pointer">Prime members</span> get FREE delivery
//                               </div>
//                             )}
//                             <div className="text-sm font-medium text-gray-900">
//                               {product.deliveryTime}
//                             </div>
//                           </div>

//                           {/* Service Info */}
//                           {product.service && (
//                             <div className="text-sm text-gray-600 mb-4">Service: {product.service}</div>
//                           )}

//                           {/* Action Button */}
//                           <div className="mb-3">
//                             <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-6 rounded-full text-sm transition-colors">
//                               Add to cart
//                             </button>
//                           </div>

//                           {/* Additional Options */}
//                           {product.otherVariants > 0 && (
//                             <div className="text-sm">
//                               <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
//                                 +{product.otherVariants} other color/pattern
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>