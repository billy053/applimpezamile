import { useState, useEffect } from 'react';
import { SlideImage } from '../components/ImageSlider';

export const useSliderImages = () => {
  const [images, setImages] = useState<SlideImage[]>([]);

  // Carregar imagens do localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem('cleanpro-slider-images');
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        setImages(parsedImages);
      } catch (error) {
        console.error('Erro ao carregar imagens do slider:', error);
        // Carregar imagens padrão se houver erro
        loadDefaultImages();
      }
    } else {
      // Carregar imagens padrão na primeira vez
      loadDefaultImages();
    }
  }, []);

  // Salvar imagens no localStorage
  useEffect(() => {
    localStorage.setItem('cleanpro-slider-images', JSON.stringify(images));
  }, [images]);

  const loadDefaultImages = () => {
    const defaultImages: SlideImage[] = [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Limpeza Residencial Completa',
        description: 'Transformamos sua casa em um ambiente limpo e aconchegante',
        isActive: true,
        order: 1
      },
      {
        id: '2',
        url: 'https://images.pexels.com/photos/4239037/pexels-photo-4239037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Limpeza Comercial Profissional',
        description: 'Mantemos seu escritório sempre impecável para seus clientes',
        isActive: true,
        order: 2
      },
      {
        id: '3',
        url: 'https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        title: 'Limpeza Predial Especializada',
        description: 'Cuidamos de condomínios e áreas comuns com excelência',
        isActive: true,
        order: 3
      }
    ];
    setImages(defaultImages);
  };

  const addImage = (imageData: Omit<SlideImage, 'id'>) => {
    const newImage: SlideImage = {
      ...imageData,
      id: Date.now().toString(),
    };
    setImages(prev => [...prev, newImage]);
    return newImage;
  };

  const updateImage = (id: string, updates: Partial<SlideImage>) => {
    setImages(prev =>
      prev.map(image =>
        image.id === id ? { ...image, ...updates } : image
      )
    );
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(image => image.id !== id));
  };

  const reorderImages = (imageId: string, newOrder: number) => {
    setImages(prev =>
      prev.map(image =>
        image.id === imageId ? { ...image, order: newOrder } : image
      )
    );
  };

  const toggleImageActive = (id: string) => {
    setImages(prev =>
      prev.map(image =>
        image.id === id ? { ...image, isActive: !image.isActive } : image
      )
    );
  };

  const getActiveImages = () => {
    return images
      .filter(img => img.isActive)
      .sort((a, b) => a.order - b.order);
  };

  return {
    images,
    addImage,
    updateImage,
    deleteImage,
    reorderImages,
    toggleImageActive,
    getActiveImages,
    loadDefaultImages
  };
};