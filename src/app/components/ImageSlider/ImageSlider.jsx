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
    <div className="w-screen relative p-2 md:p-0">
      <div className="relative w-full overflow-hidden">
        {/* Slide Container */}
        <div className="relative aspect-[16/7] w-full rounded-xl md:rounded-none">
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              src={slide.url}
              alt={`Slide ${index + 1}`}
              className=" absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out scale-180 translate-y-[75px] md:scale-100 md:translate-y-[0px]"
              style={{
                opacity: index === currentSlide ? 1 : 0,
                zIndex: index === currentSlide ? 10 : 0,
              }}
              draggable={false}
            />
          ))}

          {/* Bottom Fade Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none z-10" />

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-[40%] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition duration-200 z-20 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-[40%] -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition duration-200 z-20 hover:scale-110"
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
    </div>
  );
};

export default ImageScroller;
