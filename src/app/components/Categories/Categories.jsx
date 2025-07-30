'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const CategoryNav = () => {
  const router = useRouter();

const categories = [
  { CategoryID: 1001, CategoryName: 'Mobiles', Slug: 'mobiles' },
  { CategoryID: 1002, CategoryName: 'Smart Watches', Slug: 'smart-watches' },
  { CategoryID: 1003, CategoryName: 'Laptops', Slug: 'laptops' },
  { CategoryID: 1004, CategoryName: 'Appliances', Slug: 'appliances' },
  { CategoryID: 1005, CategoryName: 'Gaming', Slug: 'gaming' },
  { CategoryID: 1006, CategoryName: 'Furniture', Slug: 'furniture' },
  { CategoryID: 1, CategoryName: 'Electronics', Slug: 'electronics' },
  { CategoryID: 2, CategoryName: 'Fashion', Slug: 'fashion' },
  { CategoryID: 3, CategoryName: 'Home & Garden', Slug: 'home-garden' },
  { CategoryID: 4, CategoryName: 'Sports', Slug: 'sports' },
  { CategoryID: 5, CategoryName: 'Toys', Slug: 'toys' },
  { CategoryID: 6, CategoryName: 'Books', Slug: 'books' },
  { CategoryID: 7, CategoryName: 'Health', Slug: 'health' },
  { CategoryID: 8, CategoryName: 'Automotive', Slug: 'automotive' },
  { CategoryID: 9, CategoryName: 'Beauty', Slug: 'beauty' },
  { CategoryID: 10, CategoryName: 'Groceries', Slug: 'groceries' },
  { CategoryID: 11, CategoryName: 'Music', Slug: 'music' },
  { CategoryID: 12, CategoryName: 'Office Supplies', Slug: 'office-supplies' },
  { CategoryID: 13, CategoryName: 'Pet Supplies', Slug: 'pet-supplies' },
  { CategoryID: 14, CategoryName: 'Baby Products', Slug: 'baby-products' },
];


  const handleClick = (slug) => {
    router.push(`/category/${slug}`);
  };

  return (
    <nav className="bg-gray-800 text-white h-14 md:h-16 overflow-x-scroll overflow-y-hidden custom-scrollbar">
      <style jsx>{`
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937; /* thumb color, track color */
        }

        /* WebKit */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937; /* gray-800 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563; /* gray-600 */
          border-radius: 10px;
          border: 2px solid #1f2937; /* padding around thumb */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280; /* lighter gray */
        }
      `}</style>

      <div className="flex flex-row items-center justify-start space-x-4 px-6 h-full min-w-max">
        {categories.map((category) => (
          <div
            key={category.CategoryID}
            onClick={() => handleClick(category.Slug)}
            className="flex items-center px-5 py-2 hover:bg-gray-700 cursor-pointer whitespace-nowrap h-full rounded-md transition-colors"
          >
            <span className="text-xs font-normal md:text-sm md:font-semibold uppercase tracking-wide ">
              {category.CategoryName}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
