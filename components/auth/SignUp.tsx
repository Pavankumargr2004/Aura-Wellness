
import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onNavigateToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError(t('auth_signup_error_all_fields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth_signup_error_password_match'));
      return;
    }
    if (password.length < 8) {
        setError(t('auth_signup_error_password_length'));
        return;
    }
    
    console.log('Sign up successful with:', { name, email });
    alert('Account created successfully! Please log in.');
    onSignUpSuccess();
  };

  return (
    <div className="animate-fadeIn w-full">
      <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t('auth_signup_title')}</h2>
          <p className="text-muted-foreground">Join us to start your wellness journey.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-center animate-fadeIn">
            <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('auth_signup_name_label')}</label>
          <div className="relative group">
             <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="h-5 w-5" />
             </span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth_signup_name_placeholder')} className="w-full py-3.5 pl-12 pr-4 bg-secondary/30 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('auth_login_email_label')}</label>
          <div className="relative group">
             <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="h-5 w-5" />
             </span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth_login_email_placeholder')} className="w-full py-3.5 pl-12 pr-4 bg-secondary/30 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('auth_login_password_label')}</label>
          <div className="relative group">
             <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
             </span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth_login_password_placeholder')} className="w-full py-3.5 pl-12 pr-4 bg-secondary/30 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('auth_signup_confirm_password_label')}</label>
          <div className="relative group">
             <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
             </span>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth_signup_confirm_password_placeholder')} className="w-full py-3.5 pl-12 pr-4 bg-secondary/30 border border-white/5 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200" required />
          </div>
        </div>
        
        <button type="submit" className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-6">
          {t('auth_signup_button')} <ArrowRight className="h-5 w-5" />
        </button>
        
        <div className="text-center mt-6">
          <p className="text-muted-foreground">{t('auth_signup_have_account')}{' '}
            <button type="button" onClick={onNavigateToLogin} className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">
              {t('auth_signup_login_link')}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
