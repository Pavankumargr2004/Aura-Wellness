
import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for demo purposes
    if (email === 'admin@aura.com' && password === 'admin123') {
      onLoginSuccess();
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fadeIn p-4">
      <button 
        onClick={onBack} 
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Dashboard
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4 ring-1 ring-red-500/30">
                <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Admin Portal</h2>
            <p className="text-muted-foreground mt-2">Restricted access. Authorized personnel only.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl border-red-500/20 shadow-2xl shadow-red-900/10">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 flex items-center animate-fadeIn">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Admin Email</label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-red-400 transition-colors">
                            <Mail className="h-5 w-5" />
                        </span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full py-3 pl-12 pr-4 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            placeholder="admin@aura.com"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Secure Key</label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-red-400 transition-colors">
                            <KeyRound className="h-5 w-5" />
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-3 pl-12 pr-4 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                    <Lock className="h-4 w-4" /> Authenticate
                </button>
            </form>
        </div>
        
        <div className="text-center mt-8 text-xs text-muted-foreground opacity-60">
            <p>System ID: AURA-CORE-V2.1</p>
            <p>Access logged: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
