import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const TestimonialsContainer = styled.div`
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 50px;
`;

const SectionTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: -1px;
  
  .accent {
    display: inline-block;
    position: relative;
    
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: var(--text-primary);
    }
  }
`;

const TestimonialsGrid = styled.div`
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

const TestimonialAsciiFrame = styled.div`
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

const TestimonialCard = styled(motion.div)`
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

const TestimonialContent = styled.div`
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

// Данные отзывов
const testimonials = [
  {
    id: 1,
    quote: "Работа с этим креативным дизайнером превзошла все наши ожидания. Уникальный взгляд на проблему и инновационные решения определенно выделили наш бренд.",
    author: "Елена Волкова",
    company: "CEO, Bright Future",
    frameIndex: 0
  },
  {
    id: 2,
    quote: "Невероятное внимание к деталям и способность улавливать самую суть бренда. Результаты работы не только визуально привлекательны, но и потрясающе функциональны.",
    author: "Алексей Морозов",
    company: "Marketing Director, Синергия",
    frameIndex: 1
  },
  {
    id: 3,
    quote: "Я сотрудничал с многими дизайнерами, но этот опыт был особенным. Проект был выполнен в срок, с глубоким пониманием наших целей и полным учетом наших пожеланий.",
    author: "Мария Сергеева",
    company: "Project Manager, DigitalWave",
    frameIndex: 2
  },
  {
    id: 4,
    quote: "Тонкое чувство стиля и современных тенденций. Креативные решения, которые предложил дизайнер, помогли нашему продукту выделиться на рынке и привлечь новую аудиторию.",
    author: "Дмитрий Казаков",
    company: "Product Owner, TechSolutions",
    frameIndex: 3
  },
  {
    id: 5,
    quote: "Профессионализм и креативность на высшем уровне. Проект был сложным, но результат превзошел все наши ожидания. Обязательно будем сотрудничать снова.",
    author: "Ольга Соколова",
    company: "Art Director, Creative Studio",
    frameIndex: 0
  },
  {
    id: 6,
    quote: "Редко встречаются специалисты, которые так глубоко погружаются в проект и предлагают действительно инновационные решения. Наш ребрендинг получил множество положительных отзывов.",
    author: "Антон Лебедев",
    company: "CEO, Momentum",
    frameIndex: 1
  }
];

const Testimonials = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const openModal = (testimonial) => {
    setSelectedTestimonial(testimonial);
    document.body.style.overflow = 'hidden'; // Блокировка прокрутки фона
  };
  
  const closeModal = () => {
    setSelectedTestimonial(null);
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
  
  // Функция для расчета количества вертикальных элементов
  const calculateVerticalChars = (height) => {
    // Примерно один символ на каждые 15px высоты
    // Минимум 5 символов, максимум 20
    return Math.min(20, Math.max(5, Math.floor(height / 15)));
  };
  
  const [verticalCharsCount, setVerticalCharsCount] = useState(10);
  
  useEffect(() => {
    // Расчет оптимального количества вертикальных символов
    // на основе типичной высоты карточки
    const calculateChars = () => {
      const cardHeight = 250; // Примерная высота карточки
      setVerticalCharsCount(calculateVerticalChars(cardHeight - 24)); // Минус высота верхней и нижней линий
    };
    
    calculateChars();
    window.addEventListener('resize', calculateChars);
    
    return () => {
      window.removeEventListener('resize', calculateChars);
    };
  }, []);
  
  return (
    <TestimonialsContainer>
      <SectionTitle>
        <span className="accent">Отзывы</span> клиентов
      </SectionTitle>
      
      <TestimonialsGrid ref={ref}>
        {testimonials.map((testimonial, index) => {
          const frame = frameChars[testimonial.frameIndex];
          
          // Позиции для вертикальных символов (в процентах)
          const verticalPositions = [10, 30, 50, 70, 90];
          
          return (
            <TestimonialCard
              key={testimonial.id}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={index}
              onClick={() => openModal(testimonial)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TestimonialAsciiFrame className="ascii-frame">
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
              </TestimonialAsciiFrame>
              
              <TestimonialContent>
                <Quote>"{testimonial.quote.length > 120 ? testimonial.quote.substring(0, 120) + '...' : testimonial.quote}"</Quote>
                <Author>
                  {testimonial.author}
                  <span className="company">{testimonial.company}</span>
                </Author>
              </TestimonialContent>
            </TestimonialCard>
          );
        })}
      </TestimonialsGrid>
      
      <AnimatePresence>
        {selectedTestimonial && (
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
              <Quote className="quote">"{selectedTestimonial.quote}"</Quote>
              <Author className="author">
                {selectedTestimonial.author}
                <span className="company">{selectedTestimonial.company}</span>
              </Author>
            </ModalContent>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </TestimonialsContainer>
  );
};

export default Testimonials; 