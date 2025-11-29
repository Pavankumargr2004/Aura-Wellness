import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      aria-label={theme === 'dark' ? t('theme_switchToLight') : t('theme_switchToDark')}
      title={theme === 'dark' ? t('theme_switchToLight') : t('theme_switchToDark')}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};
