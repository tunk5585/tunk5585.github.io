import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // Импортируем хук для получения текущего маршрута
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';

const IndicatorContainer = styled(motion.div)`
  position: fixed;
  bottom: 35px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 50;
  cursor: pointer;
  padding: 6px 6px 10px;
  border-radius: 8px;
  background-color: var(--main-bg);
  box-shadow: none;
  backdrop-filter: none;
  border: 0.5px solid var(--text-primary);
  overflow: hidden;
  transition: bottom 0.3s ease-out;
  
  @media (max-width: 768px) {
    bottom: 35px;
    padding: 4px 8px 10px;
  }
`;

const ScrollText = styled(motion.p)`
  font-size: 0.6rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 0.1px;
  opacity: 0.9;
  text-align: center;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
  }
`;

const ArrowContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 16px;
  overflow: hidden;
`;

const Arrow = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-right: 1.5px solid #fff;
  border-bottom: 1.5px solid #fff;
  transform: rotate(45deg);
  margin: 0 auto;
  
  @media (max-width: 768px) {
    width: 12px;
    height: 12px;
  }
`;

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  // ref для предотвращения повторного показа индикатора
  const hasScrolledRef = useRef(false);
  const location = useLocation(); // Получаем текущий маршрут
  const { language } = useLanguage();
  const [bottomOffset, setBottomOffset] = useState(() => {
    if (typeof window === 'undefined') return 35;
    const base = 35;
    if (window.visualViewport) {
      const diff = window.innerHeight - window.visualViewport.height;
      return base + (diff > 0 ? diff : 0);
    }
    return base;
  });
  
  // Немедленно скрываем индикатор при изменении маршрута (до начала перехода)
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsVisible(false);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Сбрасываем состояние прокрутки при переходе на новую страницу
  useEffect(() => {
    // Немедленно скрываем при начале перехода
    setIsVisible(false);
    
    // Сбрасываем состояние прокрутки
    setHasScrolled(false);
    hasScrolledRef.current = false;
    
    // Проверяем через минимальную задержку после перехода
    const checkTimer = setTimeout(checkPageHeight, 100);
    return () => clearTimeout(checkTimer);
  }, [location.pathname]);
  
  // Функция для проверки высоты страницы
  const checkPageHeight = () => {
    // если уже скроллили или кликали — не показываем снова
    if (hasScrolledRef.current) {
      setIsVisible(false);
      return;
    }
    const pageHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // Показываем индикатор только на длинных страницах и если еще не прокручивали
    if (pageHeight > viewportHeight * 1.8 && scrollY < 150) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  
  // Проверяем размер страницы при загрузке и изменении размера окна
  useEffect(() => {
    // Первая проверка с минимальной задержкой
    const initialTimer = setTimeout(checkPageHeight, 200);
    
    // Слушаем изменения размера окна
    window.addEventListener('resize', checkPageHeight);
    
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', checkPageHeight);
    };
  }, []);
  
  // Эффект для отслеживания скролла и скрытия индикатора
  useEffect(() => {
    const handleScroll = () => {
      // Если прокрутили достаточно - скрываем и запоминаем
      if (window.scrollY > 150) {
        setIsVisible(false);
        setHasScrolled(true);
        hasScrolledRef.current = true;
      } 
      // При возврате в начало на той же странице - можем показать снова
      else if (window.scrollY < 50 && !hasScrolled) {
        checkPageHeight();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);
  
  // Обработка изменения высоты вьюпорта (для плавного смещения при скрытии Safari UI)
  useEffect(() => {
    const updateBottomOffset = () => {
      const base = 35;
      let diff = 0;
      if (window.visualViewport) {
        diff = window.innerHeight - window.visualViewport.height;
      }
      setBottomOffset(base + (diff > 0 ? diff : 0));
    };

    updateBottomOffset();
    window.addEventListener('resize', updateBottomOffset);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateBottomOffset);
    }
    return () => {
      window.removeEventListener('resize', updateBottomOffset);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateBottomOffset);
      }
    };
  }, []);
  
  // Функция для прокрутки страницы вниз
  const scrollDown = () => {
    const windowHeight = window.innerHeight;
    const scrollOptions = {
      top: windowHeight,
      behavior: 'smooth'
    };
    
    window.scrollTo(scrollOptions);
    setIsVisible(false);
    setHasScrolled(true);
    hasScrolledRef.current = true;
  };
  
  // Анимация для контейнера
  const containerVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 1 // Быстрее исчезает
      }
    }
  };
  
  // Анимация для текста
  const textVariants = {
    visible: { 
      opacity: 1,
      y: 0
    },
    hidden: { 
      opacity: 0,
      y: 10,
      transition: { duration: 0.7 }
    }
  };
  
  // Анимация для стрелки
  const arrowVariants = {
    visible: { 
      opacity: [0.4, 1, 0.4],
      y: [0, 4, 0],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    },
    hidden: { 
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.7
      }
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <IndicatorContainer
          style={{ bottom: bottomOffset }}
          key="scroll-indicator"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          onClick={scrollDown}
          whileHover={{ scale: 1.1 }}
        >
          <ScrollText variants={textVariants}>
            {translations[language].scroll_down}
          </ScrollText>
          <ArrowContainer
            variants={arrowVariants}
          >
            <Arrow />
          </ArrowContainer>
        </IndicatorContainer>
      )}
    </AnimatePresence>
  );
};

export default ScrollIndicator; 