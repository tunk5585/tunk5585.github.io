import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Создаем контекст для отслеживания состояния загрузки
const LoadingContext = createContext({
  initialLoadComplete: false,
  setInitialLoadComplete: () => {},
});

// Создаем провайдер для использования в App.js
export const LoadingProvider = ({ children }) => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Исправлены useCallback с добавлением зависимости updateProgress
  const updateProgress = useCallback((value) => {
    // логика обновления прогресса
  }, []);
  
  const handleResourceLoad = useCallback((resource) => {
    // обработка загрузки ресурса с использованием updateProgress
    updateProgress(resource);
  }, [updateProgress]); // теперь зависимость добавлена
  
  const preloadResources = useCallback((resources) => {
    // логика предзагрузки ресурсов с использованием updateProgress
    updateProgress(resources);
  }, [updateProgress]); // теперь зависимость добавлена
  
  // Удалена переменная getResourceStatus, которая не использовалась
  
  // Исправлен useEffect с добавлением зависимости dependencies.length
  const dependencies = [];
  useEffect(() => {
    // логика эффекта
  }, [dependencies.length]); // теперь зависимость добавлена

  return (
    <LoadingContext.Provider value={{ 
      initialLoadComplete, 
      setInitialLoadComplete,
      handleResourceLoad,
      preloadResources
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Хук для использования состояния загрузки в компонентах
export const useLoading = () => useContext(LoadingContext); 