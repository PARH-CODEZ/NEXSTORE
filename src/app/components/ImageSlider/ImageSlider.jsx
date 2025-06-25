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
    const interval = setInterval(nextSlide, 10000); // auto slide every 10 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-2 md:p-0
    ">
      <div className="relative w-full max-w-screen h-[220px] sm:h-[420px] mx-auto overflow-hidden rounded-xl md:rounded-none">
        {/* Slides */}
        {slides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.url}
            alt={`Slide ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              zIndex: index === currentSlide ? 10 : 0,
            }}
            draggable={false}
          />
        ))}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent pointer-events-none" />

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition duration-200 z-20 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition duration-200 z-20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white shadow-md'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageScroller;
