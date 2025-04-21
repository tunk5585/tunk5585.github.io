import React, { createContext, useContext, useState } from 'react';

// Создаем контекст для отслеживания состояния загрузки
const LoadingContext = createContext({
  initialLoadComplete: false,
  setInitialLoadComplete: () => {},
});

// Создаем провайдер для использования в App.js
export const LoadingProvider = ({ children }) => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  return (
    <LoadingContext.Provider value={{ initialLoadComplete, setInitialLoadComplete }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Хук для использования состояния загрузки в компонентах
export const useLoading = () => useContext(LoadingContext); 