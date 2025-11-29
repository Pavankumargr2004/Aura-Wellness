
import React, { useState } from 'react';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import ForgotPassword from './auth/ForgotPassword';
import { HeartPulse, Sparkles, ShieldCheck, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type AuthView = 'login' | 'signup' | 'forgot';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const { t } = useLanguage();

  const renderView = () => {
    switch (view) {
      case 'login':
        return <Login onLoginSuccess={onLoginSuccess} onNavigateToSignUp={() => setView('signup')} onNavigateToForgot={() => setView('forgot')} />;
      case 'signup':
        return <SignUp onSignUpSuccess={() => setView('login')} onNavigateToLogin={() => setView('login')} />;
      case 'forgot':
        return <ForgotPassword onNavigateToLogin={() => setView('login')} />;
      default:
        return <Login onLoginSuccess={onLoginSuccess} onNavigateToSignUp={() => setView('signup')} onNavigateToForgot={() => setView('forgot')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden relative font-sans">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse delay-1000"></div>
        </div>

        {/* Left Side - Branding (Desktop) */}
        <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-16 bg-card/30 backdrop-blur-md border-r border-white/5">
            <div>
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/20 shadow-lg shadow-primary/10">
                        <HeartPulse className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">AURA WELLNESS</h1>
                </div>
                <h2 className="text-6xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-purple-500 drop-shadow-sm">
                    Your Cognitive <br/> Digital Twin.
                </h2>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-light">
                    Experience the next generation of mental wellness. AI-driven insights, real-time stress analysis, and personalized interventions tailored just for you.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                        <Sparkles className="h-6 w-6" /> AI Powered
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Advanced algorithms designed to predict emotional fluctuations and prevent burnout.</p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                        <ShieldCheck className="h-6 w-6" /> Private & Secure
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Your data is processed locally with a privacy-first architecture. You are in control.</p>
                </div>
            </div>

            <div className="mt-auto pt-12 opacity-60">
                <p className="text-xs">© {new Date().getFullYear()} Aura Wellness Inc. All rights reserved.</p>
            </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
            <div className="w-full max-w-md space-y-8 glass-card p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                 {/* Decorative top gradient line */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                 
                 <div className="lg:hidden flex flex-col items-center justify-center mb-8">
                    <div className="p-3 bg-primary/20 rounded-full mb-3">
                        <HeartPulse className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">AURA WELLNESS</h1>
                 </div>
                {renderView()}
            </div>
        </div>
    </div>
  );
};

export default AuthPage;
