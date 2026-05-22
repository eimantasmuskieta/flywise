import { Menu, Plane, User, Heart } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; email: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export function Header({ currentPage, onNavigate, user, onAuthClick, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-purple-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-all transform hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              FlyWise
            </h1>
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-all px-4 py-2 rounded-xl ${
                currentPage === 'home'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`transition-all px-4 py-2 rounded-xl ${
                currentPage === 'about'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => onNavigate('deals')}
              className={`transition-all px-4 py-2 rounded-xl ${
                currentPage === 'deals'
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Deals
            </button>

            {user ? (
              <>
                <button
                  onClick={() => onNavigate('saved')}
                  className={`transition-all px-4 py-2 rounded-xl flex items-center gap-2 ${
                    currentPage === 'saved'
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Saved Trips
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{user.name}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'home'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'about'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => {
                onNavigate('deals');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                currentPage === 'deals'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600'
              }`}
            >
              Deals
            </button>
            {user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('saved');
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    currentPage === 'saved'
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600'
                  }`}
                >
                  ❤️ Saved Trips
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
