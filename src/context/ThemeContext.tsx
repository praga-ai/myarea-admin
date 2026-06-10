import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'tvk' | 'dark' | 'light' | 'professional';

export interface Theme {
  name: ThemeName;
  label: string;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    success: string;
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
  };
}

export const THEMES: Record<ThemeName, Theme> = {
  tvk: {
    name: 'tvk',
    label: 'TVK Political Party',
    colors: {
      primary: '#8B1538',
      primaryDark: '#6B0E2A',
      accent: '#FF9500',
      success: '#4caf50',
      background: '#f5f5f5',
      cardBackground: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      gradient: 'linear-gradient(135deg, #8B1538 0%, #6B0E2A 100%)',
    },
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    colors: {
      primary: '#1a1a2e',
      primaryDark: '#0f3460',
      accent: '#e94560',
      success: '#00d4aa',
      background: '#16213e',
      cardBackground: '#0f3460',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#2a2a3e',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    },
  },
  light: {
    name: 'light',
    label: 'Light',
    colors: {
      primary: '#4a90e2',
      primaryDark: '#357abd',
      accent: '#f5a623',
      success: '#7ed321',
      background: '#f8f9fa',
      cardBackground: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      gradient: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
    },
  },
  professional: {
    name: 'professional',
    label: 'Professional',
    colors: {
      primary: '#2c3e50',
      primaryDark: '#1a252f',
      accent: '#3498db',
      success: '#27ae60',
      background: '#ecf0f1',
      cardBackground: '#ffffff',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      border: '#bdc3c7',
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('selectedTheme');
    return (saved as ThemeName) || 'tvk';
  });

  const currentTheme = THEMES[themeName];
  const availableThemes = Object.values(THEMES);

  const handleSetTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem('selectedTheme', name);
    // Apply theme to document root
    applyThemeToDocument(THEMES[name]);
  };

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        setTheme: handleSetTheme,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-card-background', theme.colors.cardBackground);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--gradient-primary', theme.colors.gradient);
}
