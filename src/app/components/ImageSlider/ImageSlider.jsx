'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageScroller() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, url: '/H1.png' },
    { id: 2, url: '/H2.png' },
    { id: 3, url: '/H3.png' },
    { id: 4, url: '/H4.png' },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-full md:p-0 hidden md:block bg-gray-300">
      <div className="relative w-full aspect-[16/7] overflow-hidden bg-gray-300">
        {/* Image wrapper with fade */}
        <div className="relative w-full h-full bg-gray-300">
          {slides.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.url}
              alt={`Slide ${idx + 1}`}
              draggable={false}
              className={`absolute inset-0 mx-auto duration-1000 ease-in-out transition-opacity 2xl:w-[80%]
                ${idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  md:translate-y-0`}
            />
          ))}

          {/* Fade overlay applied only on the image */}
          <div className="absolute 2xl:top-85 xl:bottom-10 lg:bottom-5 md:bottom-5 left-0 w-full h-1/3 bg-gradient-to-b from-transparent to-gray-300 hidden md:block" />

        </div>

        {/* Arrows shifted upward */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute 2xl:left-60  left-4 top-[50%] md:top-[20%] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition hover:scale-110 z-20 "
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute 2xl:right-60 right-4 top-[50%] md:top-[20%] -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md transition hover:scale-110 z-20 "
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
