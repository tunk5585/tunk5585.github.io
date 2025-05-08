import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';
import SEO from '../components/SEO';

const FeedbackContainer = styled.div`
  min-height: 100vh;
  padding-top: 124px;
  padding-bottom: 64px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding-top: 88px;
    padding-bottom: 48px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const TitleContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 48px;
  padding: 0;
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
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
  
  .v-symbol {
    position: absolute;
    left: 0;
    transform: translateY(-50%);
  }
`;

const FeedbackCard = styled(motion.div)`
  position: relative;
  cursor: pointer;
  padding: 24px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 30, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.3);
    transform: translateY(-5px);
    
    .ascii-frame {
      opacity: 0.5;
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    min-height: 200px;
  }
`;

const FeedbackContent = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Quote = styled.blockquote`
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 auto;
  padding: 0;
  font-style: italic;
  color: var(--text-primary);
  text-align: left;
  flex-grow: 1;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const Author = styled.cite`
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: normal;
  margin-top: 16px;
  text-align: right;
  
  .company {
    display: block;
    margin-top: 4px;
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ModalContent = styled(motion.div)`
  max-width: 650px;
  width: 100%;
  background-color: var(--main-bg);
  position: relative;
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  
  @media (max-width: 600px) {
    max-width: 100%;
    max-height: 70vh;
  }
`;

const ModalHeader = styled.div`
  position: relative;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 1px solid var(--border);
  
  @media (max-width: 768px) {
    height: 50px;
    padding: 0 20px;
  }
`;

const ModalCloseWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 25px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 15px;
  }
`;

const CloseButton = styled.button`
  cursor: pointer;
  padding: 8px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: var(--main-bg);
  border: 0.5px solid var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const CloseIcon = styled.div`
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background-color: var(--text-primary);
    transform-origin: center;
  }
  
  &::before {
    transform: translateX(-50%) rotate(45deg);
  }
  
  &::after {
    transform: translateX(-50%) rotate(-45deg);
  }
`;

const ModalBody = styled.div`
  padding: 28px;
  
  @media (max-width: 768px) {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(70vh - 50px); /* 50px - высота хедера */
    -webkit-overflow-scrolling: touch;
  }
`;

const ModalQuote = styled.blockquote`
  font-size: 1.2rem;
  line-height: 1.7;
  margin: 0 0 24px;
  font-style: italic;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0 0 20px;
  }
`;

const ModalAuthor = styled.cite`
  display: block;
  font-size: 1rem;
  color: var(--text-secondary);
  font-style: normal;
  text-align: right;
  
  .company {
    display: block;
    margin-top: 4px;
    font-size: 0.85rem;
    opacity: 0.7;
  }
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
  const [isLongFeedback, setIsLongFeedback] = useState(false);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations.feedback[language];
  
  // Создаем объект с SEO данными для страницы отзывов, так как они отсутствуют в переводах
  const seoData = {
    title: language === 'ru' ? 'Отзывы клиентов' : 'Client Feedback',
    description: language === 'ru' 
      ? 'Прочитайте отзывы клиентов о моей работе в качестве дизайнера. Узнайте, что говорят клиенты о моих услугах и проектах.'
      : 'Read client testimonials about my work as a designer. See what clients say about my services and projects.'
  };
  
  // Получаем отзывы из переводов
  const feedbacks = t.testimonials.map((feedback, index) => ({
    ...feedback,
    frameIndex: index % frameChars.length
  }));
  
  const openModal = (feedback) => {
    setSelectedFeedback(feedback);
    // Проверяем длину текста отзыва, чтобы определить, считать ли его длинным
    setIsLongFeedback(feedback.quote.length > 250);
    document.body.style.overflow = 'hidden'; // Блокировка прокрутки фона
  };
  
  const closeModal = () => {
    setSelectedFeedback(null);
    document.body.style.overflow = 'auto'; // Возобновление прокрутки
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
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
  
  // Блокировка скролла при открытии модального окна и сброс при размонтировании
  useEffect(() => {
    if (selectedFeedback) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = '';
    };
  }, [selectedFeedback]);
  
  return (
    <>
      <SEO 
        title={seoData.title} 
        description={seoData.description}
        image="/images/feedback-og-image.jpg"
      />
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
            
            // Ограничиваем длину цитаты для превью
            const previewQuote = feedback.quote.length > 120 
              ? feedback.quote.substring(0, 120) + '...' 
              : feedback.quote;
            
            return (
              <FeedbackCard
                key={feedback.id}
                variants={cardVariants}
                initial="hidden"
                animate={inView && initialLoadComplete ? "visible" : "hidden"}
                custom={index}
                onClick={() => openModal(feedback)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
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
                  <Quote>"{previewQuote}"</Quote>
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
              style={{
                alignItems: isLongFeedback && window.innerWidth <= 768 ? 'flex-start' : 'center',
                paddingTop: isLongFeedback && window.innerWidth <= 768 ? '10%' : '0'
              }}
            >
              <ModalContent
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <ModalHeader>
                  <div></div>
                  <ModalCloseWrapper>
                    <CloseButton 
                      onClick={closeModal}
                      aria-label="Закрыть"
                    >
                      <CloseIcon />
                    </CloseButton>
                  </ModalCloseWrapper>
                </ModalHeader>
                <ModalBody className="modal-body">
                  <ModalQuote>"{selectedFeedback.quote}"</ModalQuote>
                  <ModalAuthor>
                    {selectedFeedback.author}
                    <span className="company">{selectedFeedback.company}</span>
                  </ModalAuthor>
                </ModalBody>
              </ModalContent>
            </ModalBackdrop>
          )}
        </AnimatePresence>
      </FeedbackContainer>
    </>
  );
};

export default Feedback; 
