import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ButtonContainer = styled(motion.div)`
  position: fixed;
  bottom: 45px;
  left: 20px;
  z-index: 50;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--main-bg);
  border: 0.5px solid var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: bottom 0.3s ease-out;
  
  @media (max-width: 768px) {
    bottom: 45px;
    left: 15px;
  }
`;

const ArrowIcon = styled.div`
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border-right: 1.5px solid #fff;
  border-bottom: 1.5px solid #fff;
  transform: translateY(3.5px) rotate(-135deg);
  transform-origin: center center;
`;

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(() => 45);
  
  // Проверяем текущую позицию прокрутки
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Обработка изменения высоты вьюпорта (для Safari скрытия интерфейса)
  useEffect(() => {
    const updateBottomOffset = () => {
      const base = 45;
      let diff = 0;
      if (window.visualViewport) {
        diff = window.innerHeight - window.visualViewport.height;
      }
      setBottomOffset(base + (diff > 0 ? diff : 0));
    };

    updateBottomOffset();
    window.addEventListener('resize', updateBottomOffset);
    window.addEventListener('scroll', updateBottomOffset);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateBottomOffset);
      window.visualViewport.addEventListener('scroll', updateBottomOffset);
    }
    return () => {
      window.removeEventListener('resize', updateBottomOffset);
      window.removeEventListener('scroll', updateBottomOffset);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateBottomOffset);
        window.visualViewport.removeEventListener('scroll', updateBottomOffset);
      }
    };
  }, []);
  
  // Функция для прокрутки наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Анимация для контейнера
  const containerVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <ButtonContainer
          style={{ bottom: bottomOffset }}
          key="scroll-to-top-button"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowIcon />
        </ButtonContainer>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton; 