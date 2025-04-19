import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // Импортируем хук для получения текущего маршрута

const IndicatorContainer = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 50;
  cursor: pointer;
  padding: 8px 15px 12px 15px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0px 10px rgba(255, 255, 255, 0.77);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  @media (max-width: 768px) {
    bottom: 20px;
    padding: 8px 15px 12px 15px;
  }
`;

const ScrollText = styled(motion.p)`
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 2px;
  opacity: 0.9;
  text-align: center;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const ArrowContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 24px;
`;

const Arrow = styled(motion.div)`
  width: 18px;
  height: 18px;
  border-right: 2px solid rgba(0, 0, 0, 0.8);
  border-bottom: 2px solid rgba(0, 0, 0, 0.8);
  transform: rotate(45deg);
  margin: 0 auto;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }
`;

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation(); // Получаем текущий маршрут
  
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
    
    // Проверяем через минимальную задержку после перехода
    const checkTimer = setTimeout(checkPageHeight, 100);
    return () => clearTimeout(checkTimer);
  }, [location.pathname]);
  
  // Функция для проверки высоты страницы
  const checkPageHeight = () => {
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
      } 
      // При возврате в начало на той же странице - можем показать снова
      else if (window.scrollY < 50 && !hasScrolled) {
        checkPageHeight();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);
  
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
  };
  
  // Анимация для контейнера
  const containerVariants = {
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.15 // Быстрее исчезает
      }
    }
  };
  
  // Анимация для текста
  const textVariants = {
    visible: { 
      opacity: 1
    },
    hidden: { 
      opacity: 0
    }
  };
  
  // Анимация для стрелки
  const arrowVariants = {
    visible: { 
      opacity: [0.4, 1, 0.4],
      y: [0, 5, 0],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    },
    hidden: { 
      opacity: 0,
      transition: {
        duration: 0.15
      }
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <IndicatorContainer
          key="scroll-indicator"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          onClick={scrollDown}
          whileHover={{ scale: 1.1 }}
        >
          <ScrollText variants={textVariants}>
            Прокрутите вниз
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