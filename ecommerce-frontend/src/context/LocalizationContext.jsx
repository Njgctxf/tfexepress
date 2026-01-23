import { createContext, useContext, useState, useEffect } from "react";
import { EXCHANGE_RATES, translations } from "./LocalizationData";

const LocalizationContext = createContext();

export const useLocalization = () => useContext(LocalizationContext);

export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("tfex_lang") || "fr");
  const [currency, setCurrency] = useState(localStorage.getItem("tfex_curr") || "FCFA");

  useEffect(() => {
    localStorage.setItem("tfex_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("tfex_curr", currency);
  }, [currency]);

  // Debug logs
  useEffect(() => {
    console.log("Current Language:", language);
    console.log("Current Currency:", currency);
  }, [language, currency]);

  // Fonction pour traduire une clé
  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translations for language "${language}" not found, falling back to "fr"`);
      return translations["fr"][key] || key;
    }
    return translations[language][key] || key;
  };

  // Fonction pour convertir et formater les prix
  const formatPrice = (priceInFCFA) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    const converted = priceInFCFA * rate;
    
    if (currency === "FCFA") {
      return `${Math.round(converted).toLocaleString()} FCFA`;
    }
    
    return `${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <LocalizationContext.Provider value={{ 
      language, 
      setLanguage, 
      currency, 
      setCurrency, 
      t, 
      formatPrice,
      EXCHANGE_RATES 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};
