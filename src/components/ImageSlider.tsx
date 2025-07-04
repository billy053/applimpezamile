import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export interface SlideImage {
  id: string;
  url: string;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
}

interface ImageSliderProps {
  images: SlideImage[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeImages = images
    .filter(img => img.isActive)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!isPlaying || activeImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeImages.length);
    }, 5000); // Muda slide a cada 5 segundos

    return () => clearInterval(interval);
  }, [isPlaying, activeImages.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % activeImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + activeImages.length) % activeImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (activeImages.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden shadow-xl mb-8">
      {/* Slides */}
      <div className="relative w-full h-full">
        {activeImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
              }}
            />
            
            {/* Overlay com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {/* Conteúdo do slide */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
              <p className="text-lg text-gray-200">{image.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de navegação */}
      {activeImages.length > 1 && (
        <>
          {/* Botão anterior */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Botão próximo */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Controle play/pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {activeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;