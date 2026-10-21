'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultThemeContext = {
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
};

const ThemeContext = createContext(defaultThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cognitive_alarm_theme');
    let initial = 'light';
    if (saved === 'dark' || saved === 'light') {
      initial = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initial = 'dark';
    }
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    document.body.setAttribute('data-theme', initial);
    document.documentElement.style.colorScheme = initial;
    setMounted(true);
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      document.documentElement.style.colorScheme = newTheme;
      localStorage.setItem('cognitive_alarm_theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    updateTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx || defaultThemeContext;
}
