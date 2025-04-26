import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем контекст для языка
const LanguageContext = createContext();

// Хук для использования контекста языка
export const useLanguage = () => useContext(LanguageContext);

// Провайдер языка
export const LanguageProvider = ({ children }) => {
  // Получаем сохраненный язык или используем язык браузера
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('ru') ? 'ru' : 'en';
  };

  // Получаем сохраненный язык или используем английский по умолчанию
  const getSavedLanguage = () => {
    const savedLang = localStorage.getItem('language');
    return savedLang || 'en'; // Всегда возвращаем 'en' по умолчанию
  };

  const [language, setLanguage] = useState(getSavedLanguage);

  // Функция переключения языка
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ru' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Перезагружаем страницу после смены языка
    window.location.reload();
  };

  // Сохраняем выбранный язык в localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 