import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const DEFAULT_SETTINGS = {
  pharmacyName: "Eyerus Pharmacy",
  tagline: "Health Today, Better Tomorrow",
  pharmacistName: "Eyerus Gebremariam",
  pharmacistRole: "Chief Pharmacist",
  pharmacistPhoto: "",
  theme: "light",
  currency: "ETB",
  taxRate: 15,
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  toggleTheme: () => {},
});

export function SettingsProvider({ children }) {
  const { user } = useAuth();

  const getStorageKey = () => {
    return user?.id ? `luna_pharmacy_settings_user_${user.id}` : "luna_pharmacy_settings";
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("luna_pharmacy_settings");
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to parse settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // When logged-in user changes, sync settings to that pharmacy's profile
  useEffect(() => {
    if (user) {
      const key = `luna_pharmacy_settings_user_${user.id}`;
      let userSettings = {};
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          userSettings = JSON.parse(saved);
        }
      } catch (e) {}

      setSettings((prev) => ({
        ...prev,
        ...userSettings,
        pharmacyName: userSettings.pharmacyName || user.pharmacy_name || prev.pharmacyName || "Eyerus Pharmacy",
        pharmacistName: userSettings.pharmacistName || user.pharmacist_name || prev.pharmacistName || "Chief Pharmacist",
      }));
    }
  }, [user]);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [settings.theme]);

  const updateSettings = (partial) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem("luna_pharmacy_settings", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist settings:", e);
      }
      return updated;
    });
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    updateSettings({ theme: nextTheme });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
