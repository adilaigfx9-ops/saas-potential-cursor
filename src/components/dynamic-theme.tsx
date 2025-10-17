import { useEffect } from 'react';
import { useTheme } from './theme-provider';
import { useGlobalSettings } from './global-settings-provider';

export function DynamicTheme() {
  const { theme } = useTheme();
  const { settings } = useGlobalSettings();

  useEffect(() => {
    if (settings?.branding) {
      const root = document.documentElement;
      
      // Apply custom CSS variables from settings
      if (settings.branding.primaryColor) {
        root.style.setProperty('--youtube-red', settings.branding.primaryColor);
      }
      
      if (settings.branding.secondaryColor) {
        root.style.setProperty('--primary', settings.branding.secondaryColor);
      }
      
      if (settings.branding.fontFamily) {
        root.style.setProperty('--font-family', settings.branding.fontFamily);
        document.body.style.fontFamily = settings.branding.fontFamily;
      }
    }
  }, [settings]);

  useEffect(() => {
    // Apply theme-specific customizations
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      root.classList.remove(systemTheme === 'dark' ? 'light' : 'dark');
    }
  }, [theme]);

  return null; // This component doesn't render anything visible
}
