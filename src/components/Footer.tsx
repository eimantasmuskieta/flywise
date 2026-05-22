import { Plane, Facebook, Instagram } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FlyWise
              </span>
            </div>
            <p className="text-gray-400">
              Your intelligent companion for creating perfect travel itineraries with AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Plan Your Trip
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Destinations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('deals')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Travel Deals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('help-center')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact-us')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms-of-service')}
                  className="text-gray-400 hover:text-white transition-colors block text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 support@flywise.com</li>
              <li>🌍 Global Support</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400">
            © 2025 FlyWise. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
