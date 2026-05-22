import { HeroBanner } from './HeroBanner';
import { FeaturesSection } from './FeaturesSection';
import { PopularDestinations } from './PopularDestinations';
import { Testimonials } from './Testimonials';
import { CTASection } from './CTASection';
import { PlanYourTrip } from './PlanYourTrip';
import { useState } from 'react';

interface HomePageProps {
  user: { id: number; name: string; email: string } | null;
  onSaveTrip: (trip: any) => void;
  onAuthRequired: () => void;
}

export function HomePage({ user, onSaveTrip, onAuthRequired }: HomePageProps) {
  const [showPlanning, setShowPlanning] = useState(false);
  const [planningMode, setPlanningMode] = useState<'chat' | 'form'>('form');

  const handleStartPlanning = (mode: 'chat' | 'form') => {
    setPlanningMode(mode);
    setShowPlanning(true);
    setTimeout(() => {
      const element = document.getElementById('planning-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div>
      <HeroBanner onStartPlanning={handleStartPlanning} />
      {showPlanning && (
        <div id="planning-section">
          <PlanYourTrip 
            initialMode={planningMode} 
            user={user}
            onSaveTrip={onSaveTrip}
            onAuthRequired={onAuthRequired}
          />
        </div>
      )}
      <FeaturesSection />
      <PopularDestinations />
      <Testimonials />
      <CTASection onGetStarted={() => handleStartPlanning('form')} />
    </div>
  );
}
