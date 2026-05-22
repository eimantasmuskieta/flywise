import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AboutUs } from './components/AboutUs';
import { Deals } from './components/Deals';
import { Footer } from './components/Footer';
import { AuthDialog } from './components/AuthDialog';
import { SavedTrips } from './components/SavedTrips';
import { HelpCenterPage } from './components/HelpCenterPage';
import { ContactUsPage } from './components/ContactUsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { toast, Toaster } from 'sonner@2.0.3';
import { useEffect } from 'react';

interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  interests: string;
  savedAt: Date;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.id && parsedUser?.email) {
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  }, []);

  const handleAuthenticated = (userData: AuthUser) => {
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}! 🎉`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
    toast.success('You have been signed out');
  };

  const handleSaveTrip = async (trip: SavedTrip) => {
   if (!user?.id) {
    toast.info('Please sign in to save your trips');
    return;
   }
   try {
    const response = await fetch('/api/trips/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        destination: trip.destination,
        start_date: trip.startDate,
        end_date: trip.endDate,
        travelers: trip.travelers,
        budget: trip.budget
      })
    });

    const data = await response.json();

    console.log(data);

    setSavedTrips([...savedTrips, trip]);

    toast.success('Trip saved successfully! ✈️');
   } catch (error) {
    console.log(error);
    toast.error('Failed to save trip');
  }
};

  const handleDeleteTrip = (id: string) => {
    setSavedTrips(savedTrips.filter(trip => trip.id !== id));
    toast.success('Trip removed from saved');
  };

  const handleViewTrip = (trip: SavedTrip) => {
    toast.info('Opening trip details...');
  };

  const handleAuthRequired = () => {
    setShowAuthDialog(true);
    toast.info('Please sign in to save your trips');
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" richColors />
      
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        user={user}
        onAuthClick={() => setShowAuthDialog(true)}
        onLogout={handleLogout}
      />
      
      <main>
        {currentPage === 'home' && (
          <HomePage 
            user={user}
            onSaveTrip={handleSaveTrip}
            onAuthRequired={handleAuthRequired}
          />
        )}
        {currentPage === 'about' && <AboutUs />}
        {currentPage === 'deals' && <Deals />}
        {currentPage === 'saved' && (
          <SavedTrips 
            trips={savedTrips}
            user={user}
            onDeleteTrip={handleDeleteTrip}
            onViewTrip={handleViewTrip}
          />
        )}
        {currentPage === 'help-center' && <HelpCenterPage />}
        {currentPage === 'contact-us' && <ContactUsPage />}
        {currentPage === 'privacy-policy' && <PrivacyPolicyPage />}
        {currentPage === 'terms-of-service' && <TermsOfServicePage />}
      </main>

      <Footer onNavigate={setCurrentPage} />

      <AuthDialog 
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}
