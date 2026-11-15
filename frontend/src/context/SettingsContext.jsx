import { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
  pharmacyName: "Eyerus Pharmacy",
  tagline: "Health Today, Better Tomorrow",
  pharmacistName: "Asme Teklay",
  pharmacistRole: "Pharmacist",
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
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("luna_pharmacy_settings");
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to parse settings from localStorage:", e);
    }
    return DEFAULT_SETTINGS;
  });

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
