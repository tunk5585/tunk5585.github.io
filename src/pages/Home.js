import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import InteractiveBackground from '../components/InteractiveBackground';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: var(--main-bg);
`;

const HeroContent = styled.div`
  z-index: 2;
  max-width: 900px;
  padding: 0 2rem;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 6vw, 5rem);
  margin-bottom: 1rem;
  line-height: 1.1;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  mix-blend-mode: difference;
  max-width: 100%;
  width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

// Добавляем компоненты для контроля переносов
const TitleLine = styled.div`
  display: block;
  white-space: normal;
`;

const FirstLine = styled(TitleLine)`
  margin-bottom: 5px;
`;

const SecondLine = styled(TitleLine)`
  margin-top: 5px;
`;

const ThirdLine = styled(TitleLine)`
  margin-top: 5px;
`;

// Эффект печатной машинки с фиксированным разделением строк
const TypewriterTitle = ({ speed = 30 }) => {
  const [text, setText] = useState('');
  const fullText = "Креативный Дизайн & Инновационные Решения";
  const index = useRef(0);
  
  useEffect(() => {
    if (index.current < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.substring(0, index.current + 1));
        index.current += 1;
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [text, speed]);
  
  // Разделяем текст на три строки в фиксированных местах
  const firstLineText = text.slice(0, 10); // "Креативный"
  const secondLineText = text.slice(10, 19); // "Дизайн &"
  const thirdLineText = text.slice(19); // "Инновационные Решения"
  
  return (
    <>
      <FirstLine>{firstLineText}</FirstLine>
      <SecondLine>{secondLineText}</SecondLine>
      <ThirdLine>{thirdLineText}</ThirdLine>
    </>
  );
};

const Subtitle = styled(motion.h2)`
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-weight: 300;
  max-width: 700px;
  margin: 0 auto 2rem;
`;

const ButtonRow = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
    margin: 2rem auto 0;
  }
`;

const Button = styled(Link)`
  padding: 12px 24px;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
  background: transparent;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: -1;
  }
  
  &:hover:before {
    transform: translateX(100%);
  }
  
  &:hover {
    background-color: var(--accent);
  }
  
  &.primary {
    background-color: var(--text-primary);
    color: var(--main-bg);
    
    &:hover {
      background-color: var(--text-secondary);
    }
  }
`;

// Эффект печатной машинки с поддержкой переносов строк
const TypewriterText = ({ text, speed = 50 }) => {
  const [displayText, setDisplayText] = useState('');
  const index = useRef(0);
  
  useEffect(() => {
    if (index.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text.charAt(index.current));
        index.current += 1;
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [displayText, text, speed]);
  
  // Разбиваем текст на строки и вставляем <br> для переносов
  return (
    <>
      {displayText.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <InteractiveBackground />
        
        <HeroContent>
          <Title
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TypewriterTitle speed={30} />
          </Title>
          
          <Subtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Соединяю технологии и эстетику, создавая уникальные цифровые впечатления, которые запоминаются и вдохновляют.
          </Subtitle>
          
          <ButtonRow
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button to="/projects" className="primary">Посмотреть проекты</Button>
            <Button to="/contact">Связаться</Button>
          </ButtonRow>
        </HeroContent>
      </HeroSection>
    </HomeContainer>
  );
};

export default Home; 