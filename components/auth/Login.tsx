
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 mr-3">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.449-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToSignUp, onNavigateToForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setError('');
      console.log('Login successful with:', { email, password });
      onLoginSuccess();
    } else {
      setError(t('auth_login_error'));
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google login success for the demo
    console.log('Google login successful');
    onLoginSuccess();
  };

  return (
    <div className="animate-fadeIn w-full">
      <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t('auth_login_welcome')}</h2>
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-center animate-fadeIn">
            <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('auth_login_email_label')}</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Mail className="h-5 w-5" />
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth_login_email_placeholder')}
              className="w-full py-3.5 pl-12 pr-4 bg-secondary/30 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              required
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth_login_password_label')}</label>
            <button type="button" onClick={onNavigateToForgot} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                {t('auth_login_forgot')}
            </button>
          </div>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Lock className="h-5 w-5" />
            </span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth_login_password_placeholder')}
              className="w-full py-3.5 pl-12 pr-4 bg-secondary/30 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-4">
          {t('auth_login_button')} <ArrowRight className="h-5 w-5" />
        </button>
      </form>
      
      <div className="relative my-8 flex items-center">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-widest">{t('auth_login_or')}</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>
      
      <button 
        type="button" 
        onClick={handleGoogleLogin} 
        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl font-semibold text-foreground bg-secondary/50 hover:bg-secondary border border-white/5 transition-all duration-200 group"
      >
        <GoogleIcon />
        <span className="group-hover:text-white transition-colors">{t('auth_login_google')}</span>
      </button>

      <div className="text-center mt-8">
          <p className="text-muted-foreground">{t('auth_login_no_account')}{' '}
            <button type="button" onClick={onNavigateToSignUp} className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">
              {t('auth_login_signup_link')}
            </button>
          </p>
      </div>
    </div>
  );
};

export default Login;
