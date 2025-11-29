
import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setError('');
      console.log('Password reset requested for:', email);
      setSubmitted(true);
    } else {
        setError(t('auth_forgot_error_no_email'));
    }
  };

  if (submitted) {
    return (
      <div className="text-center animate-fadeIn space-y-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('auth_forgot_success_title')}</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
            {t('auth_forgot_success_description')}{' '}
            <span className="font-medium text-foreground block mt-1">{email}</span>
            </p>
        </div>
        <button type="button" onClick={onNavigateToLogin} className="mt-4 font-semibold text-primary hover:text-primary/80 flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('auth_forgot_back_to_login')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full">
      <button type="button" onClick={onNavigateToLogin} className="text-muted-foreground hover:text-foreground transition-colors mb-6 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t('auth_forgot_title')}</h2>
        <p className="text-muted-foreground">{t('auth_forgot_description')}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-center animate-fadeIn">
            <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <button type="submit" className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
          {t('auth_forgot_button')} <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
