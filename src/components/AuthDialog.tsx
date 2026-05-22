import { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: { id: number; name: string; email: string }) => void;
}

const hashEmailForMockId = (value: string) => {
  const normalized = value.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};

export function AuthDialog({ isOpen, onClose, onAuthenticated }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let resolvedUserId: number | null = null;

    if (mode === 'register') {
      const registerResponse = await fetch(`${API_BASE_URL}/api/users/register`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const registerPayload = await registerResponse.json().catch(() => null);
      if (typeof registerPayload?.id === 'number') {
        resolvedUserId = registerPayload.id;
      }
    }

    if (resolvedUserId === null) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser?.email?.toLowerCase?.() === email.trim().toLowerCase() && typeof storedUser?.id === 'number') {
          resolvedUserId = storedUser.id;
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }

    if (resolvedUserId === null) {
      resolvedUserId = hashEmailForMockId(email);
    }

    // Mock authentication - in real app, this would call an API
    const userData = {
  id: resolvedUserId,
  name: mode === 'register' ? name : email.split('@')[0],
  email: email
};

localStorage.setItem("user", JSON.stringify(userData));

onAuthenticated(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl">{mode === 'login' ? 'Welcome Back!' : 'Join FlyWise'}</h2>
          </div>
          <p className="text-white/90">
            {mode === 'login' 
              ? 'Sign in to save and manage your trips' 
              : 'Create an account to save your dream trips'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-purple-600 hover:text-purple-700"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
