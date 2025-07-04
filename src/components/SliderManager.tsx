import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Save, X, Image as ImageIcon } from 'lucide-react';
import { SlideImage } from './ImageSlider';

interface SliderManagerProps {
  images: SlideImage[];
  onAddImage: (imageData: Omit<SlideImage, 'id'>) => void;
  onUpdateImage: (id: string, updates: Partial<SlideImage>) => void;
  onDeleteImage: (id: string) => void;
  onReorderImage: (imageId: string, newOrder: number) => void;
  onToggleActive: (id: string) => void;
}

const SliderManager: React.FC<SliderManagerProps> = ({
  images,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
  onReorderImage,
  onToggleActive
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<SlideImage | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    isActive: true,
    order: images.length + 1
  });

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      isActive: true,
      order: images.length + 1
    });
    setEditingImage(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url.trim() || !formData.title.trim()) {
      alert('URL e título são obrigatórios');
      return;
    }

    if (editingImage) {
      onUpdateImage(editingImage.id, formData);
    } else {
      onAddImage(formData);
    }
    
    resetForm();
  };

  const handleEdit = (image: SlideImage) => {
    setEditingImage(image);
    setFormData({
      url: image.url,
      title: image.title,
      description: image.description,
      isActive: image.isActive,
      order: image.order
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
      onDeleteImage(id);
    }
  };

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const newOrder = direction === 'up' ? image.order - 1 : image.order + 1;
    const minOrder = 1;
    const maxOrder = images.length;

    if (newOrder >= minOrder && newOrder <= maxOrder) {
      // Encontrar a imagem que está na posição de destino
      const targetImage = images.find(img => img.order === newOrder);
      if (targetImage) {
        // Trocar as ordens
        onReorderImage(targetImage.id, image.order);
      }
      onReorderImage(imageId, newOrder);
    }
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ImageIcon className="w-6 h-6 text-pink-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Gerenciar Slides</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Imagem
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
          <h4 className="text-lg font-semibold text-pink-800 mb-4">
            {editingImage ? 'Editar Imagem' : 'Nova Imagem'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use URLs de imagens do Pexels, Unsplash ou outras fontes confiáveis
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Título do slide"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Descrição do serviço ou imagem"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordem
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingImage ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Imagens */}
      <div className="space-y-3">
        {sortedImages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma imagem adicionada</p>
            <p className="text-sm text-gray-400">Clique em "Adicionar Imagem" para começar</p>
          </div>
        ) : (
          sortedImages.map((image) => (
            <div key={image.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              {/* Preview da imagem */}
              <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate">{image.title}</h4>
                <p className="text-sm text-gray-600 truncate">{image.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Ordem: {image.order}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    image.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {image.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center space-x-2">
                {/* Reordenar */}
                <div className="flex flex-col">
                  <button
                    onClick={() => moveImage(image.id, 'up')}
                    disabled={image.order === 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveImage(image.id, 'down')}
                    disabled={image.order === images.length}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Ativar/Desativar */}
                <button
                  onClick={() => onToggleActive(image.id)}
                  className={`p-2 rounded transition-colors ${
                    image.isActive
                      ? 'text-green-600 hover:bg-green-100'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {image.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Editar */}
                <button
                  onClick={() => handleEdit(image)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Excluir */}
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Informações */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Dicas para as imagens:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use imagens de alta qualidade (mínimo 1200x600 pixels)</li>
          <li>• Prefira URLs de sites confiáveis como Pexels ou Unsplash</li>
          <li>• Mantenha títulos curtos e descritivos</li>
          <li>• Use a ordem para controlar a sequência dos slides</li>
          <li>• Desative imagens temporariamente sem excluí-las</li>
        </ul>
      </div>
    </div>
  );
};

export default SliderManager;