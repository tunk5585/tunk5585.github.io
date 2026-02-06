import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigation } from 'react-router-dom';
import Spinner from './Spinner';
import { useLoading } from '../context/LoadingContext';

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

const DelayedContent = ({ isReady, children }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isReady) {
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

const LoadingScreen = ({ children }) => {
  const navigation = useNavigation();
  const navStartTime = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showNavSpinner, setShowNavSpinner] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const loadingFinishing = useRef(false);
  const { setInitialLoadComplete } = useLoading();
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    const currentIsLoading = initialLoad || showNavSpinner;

    if (currentIsLoading) {
      setShowLoadingScreen(true);
      setContentReady(false);
      loadingFinishing.current = false;
    } else if (!loadingFinishing.current) {
      loadingFinishing.current = true;

      const finishInterval = setInterval(() => {
        setLoadingPercent(prev => {
          if (prev >= 100) {
            clearInterval(finishInterval);
            setTimeout(() => {
              setShowLoadingScreen(false);
              setTimeout(() => {
                setContentReady(true);
              }, 50);
            }, 300);
            return 100;
          }
          return prev + 2;
        });
      }, 20);

      return () => clearInterval(finishInterval);
    }
  }, [initialLoad, showNavSpinner]);

  useEffect(() => {
    let interval;
    if (showLoadingScreen && !loadingFinishing.current && loadingPercent < 98 && (initialLoad || showNavSpinner)) {
      interval = setInterval(() => {
        setLoadingPercent(prev => {
          const increment = prev < 50 ? 1 : prev < 80 ? 0.8 : prev < 95 ? 0.3 : 0.1;
          return Math.min(prev + increment, 98);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [showLoadingScreen, loadingPercent, initialLoad, showNavSpinner]);

  useEffect(() => {
    if (!initialLoad) return;
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
  }, [initialLoad, setInitialLoadComplete]);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setShowNavSpinner(true);
      navStartTime.current = Date.now();
      setLoadingPercent(0);
      setShowLoadingScreen(true);
      loadingFinishing.current = false;
      setContentReady(false);
    } else if (navigation.state === 'idle' && showNavSpinner) {
      const elapsed = Date.now() - (navStartTime.current || Date.now());
      const remaining = 500 - elapsed;
      if (remaining > 0) {
        const timer = setTimeout(() => setShowNavSpinner(false), remaining);
        return () => clearTimeout(timer);
      } else {
        setShowNavSpinner(false);
      }
    }
  }, [navigation.state, showNavSpinner]);

  useEffect(() => {
    const prevent = e => e.preventDefault();
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

  useEffect(() => {
    let startY = 0;

    const onTouchStart = e => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = e => {
      const curY = e.touches[0].clientY;
      const diffY = curY - startY;
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

  return (
    <>
      {showLoadingScreen && (
        <LoadingContainer>
          <Spinner percent={loadingPercent} />
        </LoadingContainer>
      )}
      <DelayedContent isReady={contentReady || !showLoadingScreen}>
        {children}
      </DelayedContent>
    </>
  );
};

export default LoadingScreen;
