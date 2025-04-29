import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import InteractiveBackground from '../components/InteractiveBackground';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';

const HomeContainer = styled.div`
  touch-action: none;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
`;

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 17vh;
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
  font-weight: 600;
  mix-blend-mode: difference;
  max-width: 100%;
  width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: clamp(3.2rem, 10vw, 5rem);
    line-height: 1;
  }
`;

// Добавляем компоненты для контроля переносов
const TitleLine = styled.div`
  display: block;
  white-space: normal;
  
  @media (max-width: 768px) {
    margin-bottom: 0.1rem;
  }
`;

const FirstLine = styled(TitleLine)`
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const SecondLine = styled(TitleLine)`
  margin-top: 5px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`;

const ThirdLine = styled(TitleLine)`
  margin-top: 5px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`;

const FourthLine = styled(TitleLine)`
  margin-top: 5px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

// Эффект печатной машинки с фиксированным разделением строк
const TypewriterTitle = ({ speed = 30, startDelay = 500 }) => {
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [line4, setLine4] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationStarted, setAnimationStarted] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const { initialLoadComplete } = useLoading();
  
  // Используем useMemo для создания массива lines
  const lines = React.useMemo(() => [
    t.hero_title_line1.trim(),
    t.hero_title_line2.trim(),
    t.hero_title_line3.trim(),
    t.hero_title_line4.trim()
  ], [t.hero_title_line1, t.hero_title_line2, t.hero_title_line3, t.hero_title_line4]);
  
  // Запускаем анимацию только один раз после загрузки
  useEffect(() => {
    let timer;
    if (initialLoadComplete && !animationStarted) {
      timer = setTimeout(() => {
        setAnimationStarted(true);
        setCurrentLine(0);
        setCurrentIndex(0);
      }, startDelay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [initialLoadComplete, startDelay, animationStarted]);
  
  // Анимация печатной машинки
  useEffect(() => {
    if (!animationStarted || currentLine >= lines.length) return;
    
    const currentText = lines[currentLine];
    let timer;
    
    if (currentIndex < currentText.length) {
      timer = setTimeout(() => {
        if (currentLine === 0) {
          setLine1(currentText.substring(0, currentIndex + 1));
        } else if (currentLine === 1) {
          setLine2(currentText.substring(0, currentIndex + 1));
        } else if (currentLine === 2) {
          setLine3(currentText.substring(0, currentIndex + 1));
        } else if (currentLine === 3) {
          setLine4(currentText.substring(0, currentIndex + 1));
        }
        
        setCurrentIndex(currentIndex + 1);
      }, speed);
    } else if (currentLine < lines.length - 1) {
      timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);
        setCurrentIndex(0);
      }, 50); // Небольшая пауза между строками
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [animationStarted, currentLine, currentIndex, lines, speed]);
  
  return (
    <>
      <FirstLine>{line1}</FirstLine>
      <SecondLine>{line2}</SecondLine>
      <ThirdLine>{line3}</ThirdLine>
      <FourthLine>{line4}</FourthLine>
    </>
  );
};

const Subtitle = styled(motion.h2)`
  font-family: ${props => props.language === 'en' ? "'Space Grotesk', sans-serif" : "'Jost', sans-serif"};
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
  border: 0.5px solid var(--text-primary);
  color: var(--text-primary);
  background: transparent;
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  
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

const Home = () => {
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <HomeContainer>
      <HeroSection>
        <InteractiveBackground />
        
        <HeroContent>
          <Title
            initial={{ opacity: 0, y: 30 }}
            animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <TypewriterTitle speed={30} />
          </Title>
          
          <Subtitle
            language={language}
            initial={{ opacity: 0, y: 30 }}
            animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t.hero_subtitle}
          </Subtitle>
          
          <ButtonRow
            initial={{ opacity: 0, y: 30 }}
            animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button to="/projects" className="primary">{t.view_projects}</Button>
            <Button to="/contact">{t.get_in_touch}</Button>
          </ButtonRow>
        </HeroContent>
      </HeroSection>
    </HomeContainer>
  );
};

export default Home; 
