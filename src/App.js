import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import styled from 'styled-components';
import { HelmetProvider } from 'react-helmet-async';
import { useLoading } from './context/LoadingContext';
import { LanguageProvider } from './context/LanguageContext';
// Импорт компонентов
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollIndicator from './components/ScrollIndicator';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import SEO from './components/SEO';
import GlobalStyle from './styles/GlobalStyle';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  touch-action: none;
  overscroll-behavior: none;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--main-bg);
  z-index: 9999;
  flex-direction: column;
`;

const LoadingAscii = styled.pre`
  font-family: monospace;
  white-space: pre;
  line-height: 1.2;
  font-size: 16px;
  color: var(--text-primary);
  text-align: center;
  position: relative;
`;

const LoadingText = styled.div`
  position: absolute;
  bottom: -30px;
  right: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'Space Grotesk', sans-serif;
`;

// Компонент, скрывающий детей до явного указания о готовности
const DelayedContent = ({ isReady, children }) => {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isReady) {
      // Добавляем небольшую задержку перед показом контента
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [isReady]);
  
  if (!shouldRender) {
    return null;
  }
  
  return <>{children}</>;
};

const App = () => {
  const location = useLocation();
  const navigation = useNavigation();
  const navStartTime = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showNavSpinner, setShowNavSpinner] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const loadingFinishing = useRef(false);
  const [dots, setDots] = useState(0);
  const [frame, setFrame] = useState(0);
  const { setInitialLoadComplete } = useLoading();

  // Вычисляем базовое состояние загрузки
  const isLoading = initialLoad || showNavSpinner;
  
  // Состояние готовности контента
  const [contentReady, setContentReady] = useState(false);

  // Анимация точек загрузки
  useEffect(() => {
    let interval;
    if (showLoadingScreen) {
      interval = setInterval(() => {
        setDots(prev => (prev >= 3 ? 0 : prev + 1));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [showLoadingScreen]);

  // Анимация ASCII крутилки
  useEffect(() => {
    let interval;
    if (showLoadingScreen) {
      interval = setInterval(() => {
        setFrame(prev => (prev >= 7 ? 0 : prev + 1));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [showLoadingScreen]);

  // Управление экраном загрузки и плавным завершением
  useEffect(() => {
    if (isLoading) {
      setShowLoadingScreen(true);
      setContentReady(false);
      loadingFinishing.current = false;
    } else if (!loadingFinishing.current) {
      // Если загрузка окончена, но мы еще не запустили процесс завершения
      loadingFinishing.current = true;
      
      // Быстро увеличиваем проценты до 100%
      const finishInterval = setInterval(() => {
        setLoadingPercent(prev => {
          if (prev >= 100) {
            clearInterval(finishInterval);
            // Добавляем задержку перед скрытием экрана загрузки
            setTimeout(() => {
              setShowLoadingScreen(false);
              // Устанавливаем готовность контента ПОСЛЕ скрытия экрана загрузки
              setTimeout(() => {
                setContentReady(true);
              }, 50);
            }, 300);
            return 100;
          }
          return prev + 2; // Ускоренное заполнение до 100%
        });
      }, 20);
      
      return () => clearInterval(finishInterval);
    }
  }, [isLoading]);

  // Анимация процентов загрузки
  useEffect(() => {
    let interval;
    if (showLoadingScreen && !loadingFinishing.current && loadingPercent < 98) {
      interval = setInterval(() => {
        setLoadingPercent(prev => {
          // Ускоряем рост процентов по мере увеличения значения
          const increment = prev < 50 ? 1 : prev < 80 ? 0.8 : prev < 95 ? 0.3 : 0.1;
          return Math.min(prev + increment, 98); // Максимум 98% для обычной загрузки
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [showLoadingScreen, loadingPercent]);

  // Initial load: минимум 3с и ожидание события загрузки страницы
  useEffect(() => {
    let timerId;
    let loadHandler;

    const timerPromise = new Promise(resolve => {
      timerId = setTimeout(resolve, 3000);
    });

    const loadPromise = new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        loadHandler = () => resolve();
        window.addEventListener('load', loadHandler);
      }
    });

    Promise.all([timerPromise, loadPromise]).then(() => {
      setInitialLoad(false);
      setInitialLoadComplete(true);
    });

    return () => {
      clearTimeout(timerId);
      if (loadHandler) window.removeEventListener('load', loadHandler);
    };
  }, [setInitialLoadComplete]);

  // Навигационный спиннер с минимальным временем отображения
  useEffect(() => {
    if (navigation.state === 'loading') {
      setShowNavSpinner(true);
      navStartTime.current = Date.now();
      setLoadingPercent(0);
    } else if (navigation.state === 'idle') {
      const elapsed = Date.now() - navStartTime.current;
      const remaining = 500 - elapsed;
      if (remaining > 0) {
        const timer = setTimeout(() => setShowNavSpinner(false), remaining);
        return () => clearTimeout(timer);
      } else {
        setShowNavSpinner(false);
      }
    }
  }, [navigation.state]);

  // Блокируем прокрутку страницы на время загрузки, включая touch и колесо
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    if (showLoadingScreen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.addEventListener('touchmove', prevent, { passive: false });
      document.body.addEventListener('wheel', prevent, { passive: false });
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.removeEventListener('touchmove', prevent);
      document.body.removeEventListener('wheel', prevent);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.removeEventListener('touchmove', prevent);
      document.body.removeEventListener('wheel', prevent);
    };
  }, [showLoadingScreen]);

  // Блокировка pull-to-refresh в Mobile Safari
  useEffect(() => {
    let startY = 0;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      const curY = e.touches[0].clientY;
      const diffY = curY - startY;
      // если на вершине страницы и тянут вниз — блокируем обновление
      if (window.scrollY === 0 && diffY > 0) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Кадры анимации большой ASCII крутилки
  const spinnerFrames = [
    `
        ,:
        ,:
        ,:
        ,:
        ,:
        ,:
    ____,:____
   /    :    /
  /     :    /
 /      :    /
/       :    /
        :
        :
        :
        :
        :
        :
    `,
    `
        ,:
        ,:
        ,:
        ,:
        ,:
        ,:
    ____,:____
    \\   :    /
     \\  :   /
      \\ :  /
       \\: /
        :
        :
        :
        :
        :
        :
    `,
    `
        :
        :
        :
        :
        :
        :
    ____:____
     \\  :  /
      \\ : /
       \\:/
        X
       /:
      / :
     /  :
    /   :
        :
        :
    `,
    `
        :
        :
        :
        :
        :
        :
    ____:____
      /:|\\
     / : \\
    /  :  \\
   /   :   \\
        :
        :
        :
        :
        :
        :
    `,
    `
        :
        :
        :
        :
        :
        :
    ____:____
     /  :  \\
    /   :   \\
   /    :    \\
  /     :     \\
        :
        :
        :
        :
        :
        :
    `,
    `
        :
        :
        :
        :
        :
        :
    ____:____
    \\   :   /
     \\  :  /
      \\ : /
       \\:/
        :
        :
        :
        :
        :
        :
    `,
    `
        :
        :
        :
        :
        :
        :
    ____:____
     \\  :  /
      \\ : /
       \\:/
        X
       /:
      / :
     /  :
        :
        :
        :
    `,
    `
        :
        :
        :
        :
        :
        :
    ____:____
      / : \\
     /  :  \\
    /   :   \\
   /    :    \\
        :
        :
        :
        :
        :
        :
    `
  ];

  return (
    <HelmetProvider>
      <LanguageProvider>
        <AppWrapper>
          <GlobalStyle />
          <SEO />
          <ScrollToTop />
          {/* Spinner overlay during initial load or navigation */}
          {showLoadingScreen && (
            <LoadingContainer>
              <LoadingAscii>
                {spinnerFrames[frame]}
                <LoadingText>loading{'.'.repeat(dots)} {Math.floor(loadingPercent)}%</LoadingText>
              </LoadingAscii>
            </LoadingContainer>
          )}
          {/* Основной контент загружается только после полного скрытия экрана загрузки */}
          <DelayedContent isReady={contentReady || !showLoadingScreen}>
            {!location.pathname.startsWith('/projects/') && <Header />}
            <MainContent>
              <Outlet />
            </MainContent>
            {location.pathname !== '/' && <Footer />}
            {!location.pathname.startsWith('/projects/') && <ScrollIndicator />}
            {!location.pathname.startsWith('/projects/') && location.pathname !== '/contact' && <ScrollToTopButton />}
          </DelayedContent>
        </AppWrapper>
      </LanguageProvider>
    </HelmetProvider>
  );
};

export default App; 