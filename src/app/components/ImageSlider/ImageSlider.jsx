'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageScroller() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, url: '/HOMEIMAGE1.jpg' },
    { id: 2, url: '/HOMEIMAGE2.jpg' },
    { id: 3, url: '/HOMEIMAGE3.jpg' },
    { id: 4, url: '/HOMEIMAGE4.jpg' },
    { id: 5, url: '/HOMEIMAGE5.png' },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-full p-2 md:p-0">
      <div className="relative w-full aspect-[16/7] overflow-hidden">
        {/* Image wrapper with fade */}
        <div className="relative w-full h-full">
          {slides.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.url}
              alt={`Slide ${idx + 1}`}
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover duration-1000 ease-in-out transition-opacity
                ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                scale-160 translate-y-[50px] md:scale-100 md:translate-y-0`}
            />
          ))}

          {/* Fade overlay applied only on the image */}
         <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-b from-transparent to-gray-200 hidden md:block" />

        </div>

        {/* Arrows shifted upward */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-[50%] md:top-[30%] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition hover:scale-110 z-20"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button  
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-[50%] md:top-[30%] -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition hover:scale-110 z-20"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
