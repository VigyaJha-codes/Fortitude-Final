import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'glass';
type ContrastMode = 'normal' | 'high';
type FontScale = 100 | 125 | 150;

interface ThemeContextType {
  themeMode: ThemeMode;
  contrastMode: ContrastMode;
  fontScale: FontScale;
  setThemeMode: (mode: ThemeMode) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setFontScale: (scale: FontScale) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('themeMode') as ThemeMode) || 'light';
  });
  
  const [contrastMode, setContrastModeState] = useState<ContrastMode>(() => {
    return (localStorage.getItem('contrastMode') as ContrastMode) || 'normal';
  });
  
  const [fontScale, setFontScaleState] = useState<FontScale>(() => {
    return (parseInt(localStorage.getItem('fontScale') || '100') as FontScale) || 100;
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
  };

  const setContrastMode = (mode: ContrastMode) => {
    setContrastModeState(mode);
    localStorage.setItem('contrastMode', mode);
  };

  const setFontScale = (scale: FontScale) => {
    setFontScaleState(scale);
    localStorage.setItem('fontScale', scale.toString());
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (themeMode === 'dark' || themeMode === 'glass') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply contrast mode
    if (contrastMode === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply font scale
    root.classList.remove('text-scale-100', 'text-scale-125', 'text-scale-150');
    root.classList.add(`text-scale-${fontScale}`);
  }, [themeMode, contrastMode, fontScale]);

  return (
    <ThemeContext.Provider value={{
      themeMode,
      contrastMode,
      fontScale,
      setThemeMode,
      setContrastMode,
      setFontScale,
    }}>
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
