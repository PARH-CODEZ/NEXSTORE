'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleClick = (slug) => {
    router.push(`/category/${slug}`);
  };

  return (
    <nav className="bg-gray-800 text-white h-14 overflow-x-auto overflow-y-hidden scrollbar-hide">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex flex-row items-center justify-start space-x-6 px-4 h-full min-w-max">
        {categories.map((category) => (
          <div
            key={category.CategoryID}
            onClick={() => handleClick(category.Slug)}
            className="flex items-center space-x-1 px-3 py-0 hover:bg-gray-700 cursor-pointer whitespace-nowrap h-full"
          >
            <span className="text-sm font-medium uppercase tracking-wide">
              {category.CategoryName}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
