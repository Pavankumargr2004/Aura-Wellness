
import React, { useEffect, useState } from 'react';
import { Heart, Activity, Plus, Dna, Stethoscope, Brain, Pill, Syringe, Thermometer, Microscope } from 'lucide-react';

const ICONS = [Heart, Activity, Plus, Dna, Stethoscope, Brain, Pill, Syringe, Thermometer, Microscope];

interface Particle {
  id: number;
  Icon: React.ElementType;
  style: React.CSSProperties;
}

const BackgroundAnimation: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles only on client-side mount to avoid hydration mismatch
    const newParticles = Array.from({ length: 30 }).map((_, i) => { // Increased count to 30
      const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
      const duration = Math.floor(Math.random() * 20) + 20; // 20s - 40s duration
      const delay = Math.floor(Math.random() * 20);
      const size = Math.floor(Math.random() * 40) + 25; // 25px - 65px
      const left = Math.floor(Math.random() * 100);
      
      // Increased opacity range for better visibility (0.15 to 0.35)
      const opacity = (Math.random() * 0.2) + 0.15; 

      return {
        id: i,
        Icon,
        style: {
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `-${delay}s`, // Start mid-animation
          width: `${size}px`,
          height: `${size}px`,
          opacity: opacity,
          '--target-opacity': opacity,
        } as React.CSSProperties,
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 w-full h-full">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-primary/40 animate-floatUp" 
          style={{
            ...p.style,
            bottom: '-15%', // Start well below screen
            color: 'var(--primary)', // Explicitly use primary color
          }}
        >
          <p.Icon strokeWidth={1.5} width="100%" height="100%" />
        </div>
      ))}
    </div>
  );
};

export default BackgroundAnimation;
