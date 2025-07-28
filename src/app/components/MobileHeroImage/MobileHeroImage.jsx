'use client';

import { useEffect, useState } from 'react';

export default function MobileHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, url: '/mobile/1.jpg' },
    { id: 2, url: '/mobile/2.jpg' },
    { id: 3, url: '/mobile/3.jpg' },
    { id: 4, url: '/mobile/4.jpg' },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000); // 10 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="block w-full relative h-[400px] overflow-hidden md:hidden">
      {slides.map((slide, idx) => (
        <img
          key={slide.id}
          src={slide.url}
          alt={`Slide ${idx + 1}`}
          draggable={false}
          className={`absolute inset-0 w-full  transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}
    <div className="absolute bottom-5 left-0 w-full h-1/3 bg-gradient-to-b from-transparent to-gray-300 " />

      <div className="absolute bottom-30 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
