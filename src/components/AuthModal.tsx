import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp, resetPassword } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        const { error } = await signUp(email, password);
        if (error) throw error;

        setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;

        setSuccess('Login realizado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu email para redefinir a senha');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;

      setSuccess('Email de redefinição enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'login' ? 'Entrar na Conta' : 'Criar Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for register) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Confirmar Senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Confirme sua senha"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {/* Reset Password (only for login) */}
          {mode === 'login' && (
            <div className="mt-4 text-center">
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="text-sm text-pink-600 hover:text-pink-800 transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                className="ml-1 text-pink-600 hover:text-pink-800 font-medium transition-colors"
              >
                {mode === 'login' ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;