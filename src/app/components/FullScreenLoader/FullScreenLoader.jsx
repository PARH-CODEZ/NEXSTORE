'use client';
import React from 'react';

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
