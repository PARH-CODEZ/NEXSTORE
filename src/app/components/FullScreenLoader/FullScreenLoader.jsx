// components/FullScreenLoader.jsx
'use client';
import React from 'react';

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-gray-800 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
