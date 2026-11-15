import { createContext, useContext, useState, useEffect } from "react";

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
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("luna_pharmacy_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.pharmacistName || parsed.pharmacistName === "Asme Teklay") {
          parsed.pharmacistName = "Eyerus Gebremariam";
        }
        if (!parsed.pharmacistRole || parsed.pharmacistRole === "Pharmacist") {
          parsed.pharmacistRole = "Chief Pharmacist";
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
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
