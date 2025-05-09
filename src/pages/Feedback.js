import React, { useState, useEffect, useMemo } from 'react';
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
  overflow: hidden;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.3);
    transform: translateY(-5px);
    
    .ascii-frame {
      opacity: 0.5;
    }
  }
  
  &.expanded {
    min-height: auto;
    cursor: default;
    
    &:hover {
      transform: none;
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

const ExpandableQuote = styled(motion.div)`
  width: 100%;
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

const ExpandButton = styled(motion.button)`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: none;
  color: var(--text-secondary);
  margin-top: 16px;
  padding: 8px;
  cursor: pointer;
  align-self: center;
  position: relative;
  z-index: 5;
  
  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    transition: transform 0.3s ease;
    transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
  
  &:hover {
    color: var(--text-primary);
  }
`;

// Рамки для отзывов
const frameChars = [
  { horizontal: '-', vertical: '|', topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+' },
  { horizontal: '═', vertical: '║', topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝' },
  { horizontal: '─', vertical: '│', topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘' },
  { horizontal: '▀', vertical: '▐', topLeft: '▛', topRight: '▜', bottomLeft: '▙', bottomRight: '▟' }
];

// Восстанавливаем стили для модального окна
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
`;

const ModalQuote = styled.blockquote`
  font-size: 1.2rem;
  line-height: 1.7;
  margin: 0 0 24px;
  font-style: italic;
  color: var(--text-primary);
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

const Feedback = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Отслеживаем ширину экрана для определения режима отображения
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  
  // Определяем, какой режим отображения использовать (модальное окно или аккордион)
  const isMobile = useMemo(() => windowWidth <= 768, [windowWidth]);
  
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
  
  // Слушаем изменение размера окна
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Обработчик модального окна
  const openModal = (feedback) => {
    if (isMobile) return; // На мобильных не открываем модальное окно
    setSelectedFeedback(feedback);
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    setSelectedFeedback(null);
    document.body.style.overflow = 'auto';
  };
  
  // Обработчик аккордиона
  const toggleExpand = (id, e) => {
    if (!isMobile) return; // На десктопе не используем аккордион
    
    // Если передан event, предотвращаем всплытие
    if (e) {
      e.stopPropagation();
    }
    setExpandedId(expandedId === id ? null : id);
  };
  
  // Обработчик для клика по карточке - выбирает нужный режим в зависимости от устройства
  const handleCardClick = (feedback) => {
    if (isMobile) {
      // На мобильных используем аккордион
      toggleExpand(feedback.id);
    } else {
      // На десктопе открываем модальное окно
      openModal(feedback);
    }
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
  
  const expandVariants = {
    collapsed: { 
      height: 'auto', 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    },
    expanded: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
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
            const isExpanded = expandedId === feedback.id && isMobile;
            
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
                className={isExpanded ? 'expanded' : ''}
                onClick={() => handleCardClick(feedback)}
                whileHover={!isExpanded ? { scale: 1.01 } : {}}
                whileTap={!isExpanded ? { scale: 0.99 } : {}}
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
                  {isMobile ? (
                    <AnimatePresence initial={false} mode="wait">
                      {!isExpanded ? (
                        <ExpandableQuote key="preview" initial={{opacity: 1}} animate={{opacity: 1}} exit={{opacity: 0}}>
                          <Quote>"{previewQuote}"</Quote>
                        </ExpandableQuote>
                      ) : (
                        <ExpandableQuote
                          key="full"
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          variants={expandVariants}
                        >
                          <Quote>"{feedback.quote}"</Quote>
                        </ExpandableQuote>
                      )}
                    </AnimatePresence>
                  ) : (
                    <Quote>"{previewQuote}"</Quote>
                  )}
                  
                  <Author>
                    {feedback.author}
                    <span className="company">{feedback.company}</span>
                  </Author>
                  
                  {isMobile && feedback.quote.length > 120 && (
                    <ExpandButton 
                      expanded={isExpanded}
                      onClick={(e) => toggleExpand(feedback.id, e)}
                      aria-label={isExpanded ? "Свернуть отзыв" : "Развернуть отзыв"} 
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d={isExpanded ? "M19 15L12 8L5 15" : "M5 9L12 16L19 9"} 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </ExpandButton>
                  )}
                </FeedbackContent>
              </FeedbackCard>
            );
          })}
        </FeedbackGrid>
        
        {/* Модальное окно только для десктопа */}
        <AnimatePresence>
          {selectedFeedback && !isMobile && (
            <ModalBackdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
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
                <ModalBody>
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
