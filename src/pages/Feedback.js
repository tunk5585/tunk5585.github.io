import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';

const FeedbackContainer = styled.div`
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 50px;
`;

const TitleContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionTitle = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border: 0.5px solid var(--text-primary);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: transparent;
  border-radius: 8px;
`;

const FeedbackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeedbackAsciiFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
  overflow: hidden;
  
  .top, .bottom {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-family: monospace;
    font-size: 12px;
    line-height: 1;
    padding: 0 5px;
  }
  
  .top {
    top: 0;
  }
  
  .bottom {
    bottom: 0;
  }
  
  .left, .right {
    position: absolute;
    top: 12px;
    bottom: 12px;
    font-family: monospace;
    font-size: 12px;
    display: block;
  }
  
  .left {
    left: 5px;
  }
  
  .right {
    right: 5px;
  }
  
  /* Вертикальные линии */
  .left::before, .right::before {
    content: "";
    position: absolute;
    width: 1px;
    top: 0;
    bottom: 0;
    background-color: var(--text-primary);
  }
  
  .left::before {
    left: 0;
  }
  
  .right::before {
    right: 0;
  }
  
  /* Символы вертикальных линий - всего 5 символов */
  .v-symbol {
    position: absolute;
    left: 0;
    transform: translateY(-50%);
  }
`;

const FeedbackCard = styled(motion.div)`
  position: relative;
  cursor: pointer;
  padding: 30px;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(30, 30, 30, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.5);
    transform: translateY(-5px);
    
    .ascii-frame {
      opacity: 1;
    }
  }
`;

const FeedbackContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
`;

const Quote = styled.blockquote`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 15px;
  max-width: 500px;
  font-style: italic;
`;

const Author = styled.cite`
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: normal;
  margin-top: 15px;
  
  .company {
    display: block;
    margin-top: 5px;
    font-size: 0.8rem;
  }
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  max-width: 700px;
  width: 100%;
  background-color: var(--main-bg);
  padding: 2rem;
  position: relative;
  border: 1px solid var(--border);
  
  .quote {
    font-size: 1.3rem;
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }
  
  .author {
    font-size: 1.1rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-primary);
`;

// Рамки для отзывов
const frameChars = [
  { horizontal: '-', vertical: '|', topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+' },
  { horizontal: '═', vertical: '║', topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝' },
  { horizontal: '─', vertical: '│', topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘' },
  { horizontal: '▀', vertical: '▐', topLeft: '▛', topRight: '▜', bottomLeft: '▙', bottomRight: '▟' }
];

const Feedback = () => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations.feedback[language];
  
  // Получаем отзывы из переводов
  const feedbacks = t.testimonials.map((feedback, index) => ({
    ...feedback,
    frameIndex: index % frameChars.length
  }));
  
  const openModal = (feedback) => {
    setSelectedFeedback(feedback);
    document.body.style.overflow = 'hidden'; // Блокировка прокрутки фона
  };
  
  const closeModal = () => {
    setSelectedFeedback(null);
    document.body.style.overflow = 'auto'; // Возобновление прокрутки
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };
  
  useEffect(() => {
    // Пустой слушатель для обработки изменения размера окна
    const handleResize = () => {
      // Ничего не делаем, так как переменная verticalCharsCount больше не используется
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <FeedbackContainer>
      <TitleContainer>
        <SectionTitle>
          {t.title}
        </SectionTitle>
      </TitleContainer>
      
      <FeedbackGrid ref={ref}>
        {feedbacks.map((feedback, index) => {
          const frame = frameChars[feedback.frameIndex];
          
          // Позиции для вертикальных символов (в процентах)
          const verticalPositions = [10, 30, 50, 70, 90];
          
          return (
            <FeedbackCard
              key={feedback.id}
              variants={cardVariants}
              initial="hidden"
              animate={inView && initialLoadComplete ? "visible" : "hidden"}
              custom={index}
              onClick={() => openModal(feedback)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FeedbackAsciiFrame className="ascii-frame">
                <div className="top">
                  {frame.topLeft + frame.horizontal.repeat(48) + frame.topRight}
                </div>
                
                <div className="left">
                  {verticalPositions.map((pos, i) => (
                    <span 
                      key={i} 
                      className="v-symbol" 
                      style={{ top: `${pos}%` }}
                    >
                      {frame.vertical}
                    </span>
                  ))}
                </div>
                
                <div className="right">
                  {verticalPositions.map((pos, i) => (
                    <span 
                      key={i} 
                      className="v-symbol" 
                      style={{ top: `${pos}%` }}
                    >
                      {frame.vertical}
                    </span>
                  ))}
                </div>
                
                <div className="bottom">
                  {frame.bottomLeft + frame.horizontal.repeat(48) + frame.bottomRight}
                </div>
              </FeedbackAsciiFrame>
              
              <FeedbackContent>
                <Quote>"{feedback.quote.length > 120 ? feedback.quote.substring(0, 120) + '...' : feedback.quote}"</Quote>
                <Author>
                  {feedback.author}
                  <span className="company">{feedback.company}</span>
                </Author>
              </FeedbackContent>
            </FeedbackCard>
          );
        })}
      </FeedbackGrid>
      
      <AnimatePresence>
        {selectedFeedback && (
          <ModalBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <ModalContent
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CloseButton onClick={closeModal}>×</CloseButton>
              <Quote className="quote">"{selectedFeedback.quote}"</Quote>
              <Author className="author">
                {selectedFeedback.author}
                <span className="company">{selectedFeedback.company}</span>
              </Author>
            </ModalContent>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </FeedbackContainer>
  );
};

export default Feedback; 
