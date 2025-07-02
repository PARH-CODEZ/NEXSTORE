'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageScroller = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, url: '/HOMEIMAGE1.jpg' },
    { id: 2, url: '/HOMEIMAGE2.jpg' },
    { id: 3, url: '/HOMEIMAGE3.jpg' },
    { id: 4, url: '/HOMEIMAGE4.jpg' },
    { id: 5, url: '/HOMEIMAGE5.jpg' },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-full p-2 md:p-0">
      {/* Container with fixed aspect ratio */}
      <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden">
        {slides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.url}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            draggable={false}
          />
        ))}

        {/* Bottom Fade Overlay */}
<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />


        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition duration-200 z-10 hover:scale-110"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition duration-200 z-10 hover:scale-110"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white shadow-md' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageScroller;
