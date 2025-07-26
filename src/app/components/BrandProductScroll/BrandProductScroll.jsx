'use client';

import React from 'react';
import Link from 'next/link';

const BrandSection = ({ brandName, brandImage, products }) => {
  return (
    <div className="bg-white text-black px-6 py-2 overflow-x-auto custom-scrollbar">
      <div className="flex items-center space-x-6 min-w-max">
        {/* Brand image and name */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <img
            src={brandImage || '/fallback-brand.png'} // replace with actual fallback path
            alt={brandName || 'Brand'}
            className="w-8 h-8 object-contain border rounded-full"
            onError={(e) => {
              e.target.onerror = null;

            }}
          />
          <span className="text-md font-semibold whitespace-nowrap uppercase">
            {brandName || 'Brand'}
          </span>
        </div>

        {/* Vertical divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Product names (plain text) */}
        <div className="flex items-center space-x-4">
          {products?.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="text-sm whitespace-nowrap uppercase hover:underline"
              >
                {product.title}
              </Link>
            ))
          ) : (
            <Link
              href="/products"
              className="text-sm font-medium whitespace-nowrap uppercase hover:underline"
            >
              SEE MORE
            </Link>
          )}
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #ffffff;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #ffffff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 10px;
          border: 2px solid #ffffff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a1a1aa;
        }
      `}</style>
    </div>
  );
};

export default BrandSection;
