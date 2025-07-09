'use client'
import React, { useState } from 'react';
import { Star, Share, Heart, ShoppingCart, Truck, Shield, Award, RotateCcw, Zap, ChevronRight } from 'lucide-react';
import Navbar from '@/app/components/Navbar/Navbar';

const IPhoneProductPage = () => {
  const [selectedColor, setSelectedColor] = useState('Black Titanium');
  const [protectionPlan, setProtectionPlan] = useState(false);
  const [giftOptions, setGiftOptions] = useState(false);
  const [exchangeOption, setExchangeOption] = useState('without');

  const colorOptions = [
    { name: 'Black Titanium', image: '/api/placeholder/60/60' },
    { name: 'Natural Titanium', image: '/api/placeholder/60/60' },
    { name: 'White Titanium', image: '/api/placeholder/60/60' },
    { name: 'Desert Titanium', image: '/api/placeholder/60/60' }
  ];

  const thumbnailImages = [
    '/api/placeholder/50/50',
    '/api/placeholder/50/50',
    '/api/placeholder/50/50',
    '/api/placeholder/50/50',
    '/api/placeholder/50/50',
    '/api/placeholder/50/50',
    '/api/placeholder/50/50'
  ];

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Thumbnails */}
            <div className="col-span-">
              <div className="flex flex-col space-y-2 sticky top-6">
                {thumbnailImages.map((thumb, index) => (
                  <div key={index} className="w-12 h-12 border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-orange-500 bg-gray-50 flex items-center justify-center">
                    {index === 0 && <div className="text-gray-600 text-xs">📱</div>}
                    {index === 1 && <div className="text-gray-600 text-xs">▶️</div>}
                    {index === 2 && <div className="text-gray-600 text-xs">📱</div>}
                    {index === 3 && <div className="text-gray-600 text-xs">👤</div>}
                    {index === 4 && <div className="text-gray-600 text-xs">📐</div>}
                    {index === 5 && <div className="text-gray-600 text-xs">🎬</div>}
                    {index === 6 && <div className="text-gray-600 text-xs">📱</div>}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">VIDEO</div>
            </div>

            {/* Center Column - Main Product Image */}
            <div className="col-span-4">
              <div className="bg-gray-50 rounded-lg p-8 mb-4">
                <img
                  src="/api/placeholder/500/600"
                  alt="iPhone 16 Pro Max"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="col-span-4">
              <div className="space-y-4">
                {/* Header with Share Icon */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl text-gray-900 leading-tight mb-3">
                      iPhone 16 Pro Max 1 TB: 5G Mobile Phone with Camera Control, 4K 120 fps Dolby Vision and a Huge Leap in Battery Life. Works with AirPods; Black Titanium
                    </h1>
                    <p className="text-blue-600 text-sm hover:underline cursor-pointer mb-2">Visit the Apple Store</p>
                    <div className="flex items-center">
                      <span className="text-orange-500 text-sm mr-1">4.4</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-orange-500 fill-current' : i === 4 ? 'text-orange-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-blue-600 text-sm ml-2 hover:underline cursor-pointer">259 ratings</span>
                    </div>
                  </div>
                  <Share className="h-5 w-5 text-gray-500 cursor-pointer ml-4" />
                </div>

                {/* Price Section */}
                <div className="py-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">-8%</span>
                    <span className="text-3xl font-normal text-gray-900">₹1,70,900</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    <span>M.R.P.: </span>
                    <span className="line-through">₹1,84,900</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Inclusive of all taxes</div>
                  <div className="text-sm">
                    <span className="text-gray-700">EMI starts at ₹8,286. No Cost EMI available </span>
                    <span className="text-blue-600 hover:underline cursor-pointer">EMI options ⌄</span>
                  </div>
                </div>

                {/* Offers Section */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">%</span>
                    </div>
                    <span className="font-semibold text-gray-900">Offers</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="font-semibold text-sm mb-1">No Cost EMI</div>
                      <div className="text-xs text-gray-600 mb-2">Upto ₹7,700.07 EMI interest savings on select Credit Cards</div>
                      <div className="text-xs text-blue-600 hover:underline cursor-pointer">1 offer ›</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm mb-1">Bank Offer</div>
                      <div className="text-xs text-gray-600 mb-2">Upto ₹3,000.00 discount on select Credit Cards</div>
                      <div className="text-xs text-blue-600 hover:underline cursor-pointer">5 offers ›</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm mb-1">Cashback</div>
                      <div className="text-xs text-gray-600 mb-2">Upto ₹5,127.00 cashback as Amazon Pay Balance when you pay...</div>
                      <div className="text-xs text-blue-600 hover:underline cursor-pointer">1 offer ›</div>
                    </div>
                  </div>
                </div>

                {/* Service Icons */}
                <div className="flex justify-between items-center py-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <RotateCcw className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">10 days Service</div>
                    <div className="text-xs text-gray-700">Centre</div>
                    <div className="text-xs text-gray-700">Replacement</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">Free Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">Warranty</div>
                    <div className="text-xs text-gray-700">Policy</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">Cash/Pay on</div>
                    <div className="text-xs text-gray-700">Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">Top Brand</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Color Selection */}
                <div className="py-4">
                  <div className="mb-3">
                    <span className="text-sm font-normal">Colour: </span>
                    <span className="text-sm font-semibold">{selectedColor}</span>
                  </div>
                  <div className="flex space-x-3">
                    {colorOptions.map((option, index) => (
                      <div key={option.name} className="text-center cursor-pointer">
                        <div
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${selectedColor === option.name ? 'border-blue-500' : 'border-gray-300'}`}
                          onClick={() => setSelectedColor(option.name)}
                        >
                          <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            <div className="top-20 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
              {/* Exchange Options */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">With Exchange</span>
                    <div className="text-sm text-orange-600 font-medium">Up to ₹ 47,150.00 off</div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">Buy new:</span>
                    <div className="text-sm">
                      <span className="text-orange-600">₹ 1,70,900.00</span>
                      <span className="text-gray-500"> + ₹84,900.00</span>
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
                <div className="ml-6 text-sm">
                  <span className="font-semibold">Without Exchange</span>
                  <span className="text-blue-600 ml-2">●</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-4">
                <div className="text-blue-600 font-medium text-sm mb-1">FREE delivery 11 - 12 July</div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Delivering to Mumbai 400001 - </span>
                  <span className="text-blue-600 hover:underline cursor-pointer">Update location</span>
                </div>
              </div>

              {/* Stock and Seller Info */}
              <div className="mb-4 text-sm space-y-1">
                <div className="text-red-600 font-medium">Only 1 left in stock.</div>
                <div className="text-gray-700">Ships from <span className="font-medium">Amazon</span></div>
                <div className="text-gray-700">Sold by <span className="font-medium">Clicktech Retail Private Ltd</span></div>
                <div className="text-gray-700">Payment <span className="font-medium text-blue-600">Secure transaction</span></div>
              </div>

              {/* Protection Plan */}
              <div className="mb-4">
                <div className="font-semibold text-sm mb-2">Add a Protection Plan:</div>
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={protectionPlan}
                    onChange={(e) => setProtectionPlan(e.target.checked)}
                    className="mt-1 w-4 h-4"
                  />
                  <div className="text-sm">
                    <div className="text-blue-600 hover:underline cursor-pointer">Protect+ with AppleCare Services for iPhone 16 Pro Max (1year)</div>
                    <div className="text-gray-600">(Email Delivery, No Physical Kit)</div>
                    <div className="font-semibold">for ₹16,999.00</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg text-sm">
                  Add to Cart
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  Buy Now
                </button>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={giftOptions}
                    onChange={(e) => setGiftOptions(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Add gift options</span>
                </div>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm">
                  Add to Wish List
                </button>
              </div>
            </div>


          </div>
        </div>



      </div>
    </>
  );
};

export default IPhoneProductPage;