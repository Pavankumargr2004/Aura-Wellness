import React from 'react';
import { Sparkles, Activity, MessageSquare } from 'lucide-react';
import { type View } from '../types';

interface HomeProps {
  setActiveView: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ setActiveView }) => {
    return (
            /* Hero Section */
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/10 mb-8 animate-float">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-muted-foreground">AI-Powered Cognitive Support</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl relative z-10">
                    Welcome to <br />
                    <span className="text-gradient inline-block mt-4 pb-2">AURA WELLNESS</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10 mt-16 relative z-10">
                    Your Cognitive Digital Twin. A next-generation AI system that understands, predicts, and optimizes your mental health. Real-time interventions tailored to your neuro-behavioral patterns.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <button 
                        onClick={() => setActiveView('dashboard')}
                        className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                    >
                        <Activity className="h-5 w-5" /> Start Your Journey
                    </button>
                    <button 
                        onClick={() => setActiveView('chat')}
                        className="px-8 py-4 rounded-full bg-secondary/80 text-foreground font-bold text-lg hover:bg-secondary border border-white/10 hover:border-primary/30 transition-all flex items-center gap-2 backdrop-blur-sm"
                    >
                        <MessageSquare className="h-5 w-5" /> Talk to Aura
                    </button>
                </div>
            </div>
    );
};

export default Home;