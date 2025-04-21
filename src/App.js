import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import styled from 'styled-components';
// Импорт компонентов
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollIndicator from './components/ScrollIndicator';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';

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

const App = () => {
  const location = useLocation();
  const navigation = useNavigation();
  const navStartTime = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showNavSpinner, setShowNavSpinner] = useState(false);
  const loading = initialLoad || showNavSpinner;
  const [dots, setDots] = useState(0);
  const [frame, setFrame] = useState(0);

  // Анимация точек загрузки
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setDots(prev => (prev >= 3 ? 0 : prev + 1));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Анимация ASCII крутилки
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setFrame(prev => (prev >= 7 ? 0 : prev + 1));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
    });

    return () => {
      clearTimeout(timerId);
      if (loadHandler) window.removeEventListener('load', loadHandler);
    };
  }, []);

  // Навигационный спиннер с минимальным временем отображения
  useEffect(() => {
    if (navigation.state === 'loading') {
      setShowNavSpinner(true);
      navStartTime.current = Date.now();
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
    if (loading) {
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
  }, [loading]);

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
    <AppWrapper>
      <ScrollToTop />
      {/* Spinner overlay during initial load or navigation */}
      {loading && (
        <LoadingContainer>
          <LoadingAscii>
            {spinnerFrames[frame]}
            <LoadingText>loading{'.'.repeat(dots)}</LoadingText>
          </LoadingAscii>
        </LoadingContainer>
      )}
      {/* Основной контент */}
      <>
        {!location.pathname.startsWith('/projects/') && <Header />}
        <MainContent>
          <Outlet />
        </MainContent>
        {location.pathname !== '/' && <Footer />}
        {!location.pathname.startsWith('/projects/') && <ScrollIndicator />}
        {!location.pathname.startsWith('/projects/') && location.pathname !== '/contact' && <ScrollToTopButton />}
      </>
    </AppWrapper>
  );
};

export default App; 