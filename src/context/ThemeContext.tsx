import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { settingsService } from "@/services";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
  setDarkMode: (isDark: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme preference from user settings
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Check for system preference first
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        
        // Default to system preference
        let darkModeEnabled = systemPrefersDark;
        
        // If user is logged in, get their preference from settings
        if (user?.id) {
          const preferences = await settingsService.getUserPreferences(user.id);
          if (preferences && preferences.dark_mode !== undefined) {
            darkModeEnabled = preferences.dark_mode;
          }
        }
        
        setIsDarkMode(darkModeEnabled);
        applyTheme(darkModeEnabled);
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [user?.id]);

  // Apply theme to document
  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    await setDarkMode(newMode);
  };

  // Set dark mode
  const setDarkMode = async (isDark: boolean) => {
    setIsDarkMode(isDark);
    applyTheme(isDark);

    // Save preference if user is logged in
    if (user?.id) {
      try {
        await settingsService.updatePreferences(user.id, {
          dark_mode: isDark
        });
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 