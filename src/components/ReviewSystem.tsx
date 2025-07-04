import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, MessageCircle, User, Calendar } from 'lucide-react';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  serviceType: string;
  date: Date;
  helpful: number;
}

interface ReviewFormData {
  clientName: string;
  rating: number;
  comment: string;
  serviceType: string;
}

const ReviewSystem: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    clientName: '',
    rating: 0,
    comment: '',
    serviceType: ''
  });

  const serviceTypes = [
    'Limpeza Residencial',
    'Limpeza Comercial',
    'Limpeza Predial'
  ];

  // Carregar avaliações do localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('cleanpro-reviews');
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews).map((review: any) => ({
          ...review,
          date: new Date(review.date)
        }));
        setReviews(parsedReviews);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      }
    }
  }, []);

  // Salvar avaliações no localStorage
  useEffect(() => {
    localStorage.setItem('cleanpro-reviews', JSON.stringify(reviews));
  }, [reviews]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0 || !formData.clientName.trim() || !formData.comment.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      ...formData,
      date: new Date(),
      helpful: 0
    };

    setReviews(prev => [newReview, ...prev]);
    setFormData({
      clientName: '',
      rating: 0,
      comment: '',
      serviceType: ''
    });
    setShowForm(false);
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Avaliações dos Clientes</h2>
              <p className="text-pink-100">Veja o que nossos clientes dizem sobre nossos serviços</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              Avaliar Serviço
            </button>
          </div>
        </div>

        {/* Statistics */}
        {reviews.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(averageRating))}
                </div>
                <p className="text-gray-600">Baseado em {reviews.length} avaliações</p>
              </div>
              
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="p-6 border-b border-gray-200 bg-pink-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Deixe sua Avaliação</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Digite seu nome"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Serviço
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Selecione o serviço</option>
                    {serviceTypes.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avaliação *
                </label>
                <div className="flex items-center space-x-2">
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData(prev => ({ ...prev, rating }))
                  )}
                  <span className="text-sm text-gray-600 ml-2">
                    {formData.rating > 0 && `${formData.rating} estrela${formData.rating > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Comentário *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Conte-nos sobre sua experiência com nosso serviço..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Avaliação
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Ainda não há avaliações</p>
              <p className="text-sm text-gray-400">Seja o primeiro a avaliar nossos serviços!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Todas as Avaliações ({reviews.length})
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{review.clientName}</h4>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            {review.serviceType && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                                {review.serviceType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {review.date.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Útil ({review.helpful})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;