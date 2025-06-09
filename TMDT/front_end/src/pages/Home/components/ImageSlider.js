import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Tự động chuyển slide
  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
    
    return () => {
      stopTimer();
    };
  }, [currentIndex, isPaused]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, 3000); // Chuyển slide sau 3 giây (nhanh hơn một chút)
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this with CSS transition time
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this with CSS transition time
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this with CSS transition time
  };

  // Pause auto-play khi hover
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  // Resume auto-play khi rời chuột
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden group rounded-lg shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slider images */}
      <div 
        className="w-full h-full flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full h-full flex-shrink-0">
            <img
              src={image.src}
              alt={image.alt || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows - Hiển thị khi hover */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
        onClick={prevSlide}
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
        onClick={nextSlide}
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Dots for direct navigation - Luôn hiển thị */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
              currentIndex === index 
                ? 'bg-white scale-110' 
                : 'bg-transparent hover:bg-white hover:bg-opacity-70'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`}></div>
      </div>
    </div>
  );
};

export default ImageSlider;