import React, { createContext, useState, useContext, useEffect } from 'react';

// Создаем контекст для языка
const LanguageContext = createContext();

// Хук для использования контекста языка
export const useLanguage = () => useContext(LanguageContext);

// Провайдер языка
export const LanguageProvider = ({ children }) => {
  // Получаем сохраненный язык или используем английский по умолчанию
  const getSavedLanguage = () => {
    const savedLang = localStorage.getItem('language');
    return savedLang || 'en'; // Всегда возвращаем 'en' по умолчанию
  };

  const [language, setLanguage] = useState(getSavedLanguage);

  // Функция переключения языка
  const toggleLanguage = () => {
    // Добавляем стиль для скрытия контента перед перезагрузкой
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    
    const newLang = language === 'en' ? 'ru' : 'en';
    
    // Используем setTimeout для задержки перед обновлением страницы
    setTimeout(() => {
      setLanguage(newLang);
      localStorage.setItem('language', newLang);
      window.location.reload();
    }, 200); // 200мс должно хватить для плавного исчезновения
  };

  // Сохраняем выбранный язык в localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Добавляем эффект для восстановления видимости после загрузки страницы
  useEffect(() => {
    document.body.style.opacity = '1';
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 