import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useLoading } from '../context/LoadingContext';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';


ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const AboutContainer = styled.div`
  min-height: 100vh;
  padding-top: 124px;   /* высота хедера 60px + 64px (2 шага) */
  padding-bottom: 48px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding-top: 88px;   /* высота хедера 60px + 28px (1.75 шага моб) */
    padding-bottom: 32px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const TitleContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 48px; /* 2 шага */
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

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 48px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 32px;
  }
`;

const ProfileSection = styled(motion.div)`
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProfileImageContainer = styled.div`
  width: 100%;
  height: ${props => props.$bioHeight && !props.$isMobile ? `${props.$bioHeight}px` : 'auto'};
  background-color: transparent;
  position: relative;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    aspect-ratio: 1/1;
    min-height: 280px;
    height: auto;
    width: 100%;
  }
`;

const ProfileInfoGender = styled.div`
  position: absolute;
  top: 40px;
  right: 15px;
  font-family: monospace;
  font-size: 11px;
  color: var(--text-secondary);
  z-index: 15;
  transform: rotate(90deg);
  transform-origin: right center;
  
  @media (max-width: 768px) {
    font-size: 10px;
    right: 15px;
    top: 60px;
  }
`;

const ProfileInfoAge = styled.div`
  position: absolute;
  bottom: 20px;
  right: 15px;
  font-family: monospace;
  font-size: 11px;
  color: var(--text-secondary);
  z-index: 15;
  transform: rotate(90deg);
  transform-origin: right center;
  
  @media (max-width: 768px) {
    font-size: 10px;
    right: 15px;
  }
`;

const ModelFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
  overflow: visible;
  
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

// Расширенный контейнер для ASCII арта
const AsciiArtContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 6px;
  line-height: 0.7;
  font-family: monospace;
  white-space: pre;
  pointer-events: none;
  color: var(--text-primary);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: transparent;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    font-size: 4px;
    line-height: 0.8;
    top: -5%;
    left: -5%;
    width: 110%;
    height: 110%;
  }
`;

// Расширенный скрытый контейнер для 3D модели
const HiddenCanvas = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  
  @media (max-width: 768px) {
    top: -5%;
    left: -5%;
    width: 110%;
    height: 110%;
  }
`;

// Контейнер для экрана загрузки
const LoadingScreenContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 15;
  background-color: var(--main-bg);
  pointer-events: none;
`;

const LoadingContainer = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  position: relative;
`;

const BioSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (max-width: 768px) {
    gap: 16px;
    margin-top: 16px;
  }
`;

const BioTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px; /* 1 шаг между абзацами */
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const BioText = styled(motion.p)`
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 0;
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const SkillsSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 48px;
  @media (max-width: 768px) {
    gap: 16px;
    margin-top: 32px;
  }
`;

const QualitiesSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 48px;
  @media (max-width: 768px) {
    gap: 16px;
    margin-top: 32px;
  }
`;

const SkillsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const SkillItem = styled(motion.div)`
  padding: 12px 16px;
  background-color: rgba(40, 40, 40, 0.5);
  position: relative;
  display: flex;
  align-items: center;
  border-left: 3px solid var(--accent);
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
  }
  
  @media (max-width: 500px) {
    padding: 6px 8px;
    min-height: 32px;
  }
`;

const SkillProgress = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$level}%;
  background-color: rgba(255, 255, 255, 0.07);
  z-index: 0;
`;

const SkillName = styled.span`
  font-size: 1rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const ExperienceSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 48px;
  @media (max-width: 768px) {
    gap: 16px;
    margin-top: 32px;
  }
`;

const ExperienceTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 1px;
    background-color: var(--border);
  }
`;

const TimelineItem = styled(motion.div)`
  padding-left: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px; /* небольшой gap между элементами внутри TimelineItem */
  @media (max-width: 768px) {
    padding-left: 16px;
    gap: 6px;
  }
  &:before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0;
    width: 11px;
    height: 11px;
    background-color: var(--accent);
  }
`;

const TimelinePeriod = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0;
`;

const TimelinePosition = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TimelineCompany = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const TimelineDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0;
  @media (max-width: 768px) {
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

// Модифицированная функция AsciiEffect для большего поля просмотра
function AsciiEffect({ domRef, characters = ' .:-+*=%@#$', invert = true, resolution = 0.15, alphaThreshold = 0.15 }) {
  const { gl, scene, camera, size } = useThree();
  
  // Создаем необходимые объекты при монтировании
  const nodeRef = useRef();
  
  // Создаем скрытый канвас только один раз при монтировании
  useEffect(() => {
    const canvas = document.createElement('canvas');
    
    // Добавляем в DOM, но делаем невидимым
    canvas.style.position = 'absolute';
    canvas.style.top = '-9999px';
    canvas.style.visibility = 'hidden';
    document.body.appendChild(canvas);
    
    // Устанавливаем размеры
    const asciiWidth = Math.floor(size.width * resolution);
    const asciiHeight = Math.floor(size.height * resolution);
    
    canvas.width = asciiWidth;
    canvas.height = asciiHeight;
    
    // Сохраняем ссылки
    nodeRef.current = canvas;
    
    // Очистка при размонтировании
    return () => {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [size, resolution]);
  
  // Эффект рендеринга на каждом кадре
  useFrame(() => {
    if (!nodeRef.current || !domRef.current) return;
    
    const canvas = nodeRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const asciiDiv = domRef.current;
    
    // Определяем, является ли устройство мобильным через медиа-запрос
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Увеличиваем размеры рендеринга только для мобильных, но не так сильно
    const asciiWidth = Math.floor(size.width * resolution * (isMobile ? 1.1 : 1));
    const asciiHeight = Math.floor(size.height * resolution * (isMobile ? 1.1 : 1));
    
    // Обновляем размеры канваса, если они изменились
    if (canvas.width !== asciiWidth || canvas.height !== asciiHeight) {
      canvas.width = asciiWidth;
      canvas.height = asciiHeight;
    }
    
    // Рендерим сцену в скрытый канвас
    gl.render(scene, camera);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(gl.domElement, 0, 0, asciiWidth, asciiHeight);
    const imageData = context.getImageData(0, 0, asciiWidth, asciiHeight);
    
    // Получаем данные изображения
    const pixels = imageData.data;
    
    // Преобразуем данные в ASCII
    let asciiImage = '';
    
    for (let y = 0; y < asciiHeight; y++) {
      for (let x = 0; x < asciiWidth; x++) {
        const i = (y * asciiWidth + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3] / 255; // Альфа-канал от 0 до 1
        
        // Если альфа ниже порога или пиксель очень темный, считаем его прозрачным
        const brightness = (r + g + b) / 3;
        if (a < alphaThreshold || brightness < 20) {
          asciiImage += '&nbsp;'; // Используем неразрывный пробел для прозрачности
          continue;
        }
        
        // Получаем яркость пикселя (0-255)
        const normalizedBrightness = Math.floor(brightness);
        
        // Выбираем символ в зависимости от яркости
        const index = Math.floor(normalizedBrightness / 256 * characters.length);
        const char = invert ? characters[characters.length - index - 1] : characters[index];
        
        // Добавляем символ
        asciiImage += char;
      }
      asciiImage += '<br/>';
    }
    
    // Обновляем содержимое
    asciiDiv.innerHTML = asciiImage;
  });
  
  return null; // Не рендерим ничего в Canvas
}

// Десктопная версия 3D модели
function DesktopModel({ mouseX, mouseY }) {
  const { scene } = useGLTF('/assets/base.glb');
  
  // Используем useRef для сохранения предыдущих значений mouseX и mouseY
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);
  
  // Плавное следование за мышью
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  
  // Добавляем автоматическое вращение
  useEffect(() => {
    let frameId;
    let angle = 0;
    
    const animate = () => {
      // Если мышь не двигается, делаем автовращение
      if (Math.abs(mouseX) < 0.01 && Math.abs(mouseY) < 0.01) {
        angle += 0.005;
        rotationY.current = Math.sin(angle) * 0.3;
      }
      
      frameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [mouseX, mouseY]);
  
  useEffect(() => {
    const deltaX = mouseX - prevMouseX.current;
    const deltaY = mouseY - prevMouseY.current;
    
    // Увеличиваем коэффициенты для более выраженного вращения
    rotationY.current += deltaX * 0.5;
    rotationX.current += deltaY * 0.2;
    
    // Увеличиваем максимальные ограничения вращения до четверти оборота (π/2)
    rotationX.current = Math.max(-3, Math.min(3, rotationX.current));
    rotationY.current = Math.max(-3, Math.min(3, rotationY.current));
    
    prevMouseX.current = mouseX;
    prevMouseY.current = mouseY;
  }, [mouseX, mouseY]);
  
  useEffect(() => {
    // Сбрасываем вращение при размонтировании
    return () => {
      rotationX.current = 0;
      rotationY.current = 0;
    };
  }, []);
  
  return (
    <primitive 
      object={scene} 
      rotation={[rotationX.current+0.1, rotationY.current-0.5, 0.1]}
      scale={1}
      position={[0.12, -.97, 0]}
    />
  );
}

// Мобильная версия 3D модели
function MobileModel({ scrollY }) {
  const { scene } = useGLTF('/assets/base.glb');
  
  // Для мобильной версии используем только вращение по Y в зависимости от скролла
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  
  // Обновляем вращение на основе скролла
  useEffect(() => {
    // Нормализуем скролл
    const normalizedScroll = Math.min(scrollY / 500, 1);
    
    // Поворачиваем модель на 180 градусов при скролле вниз
    rotationY.current = normalizedScroll * Math.PI;
    
    // Небольшой наклон по X для лучшего эффекта
    rotationX.current = normalizedScroll * 0.1;
  }, [scrollY]);
  
  return (
    <primitive 
      object={scene} 
      rotation={[rotationX.current, rotationY.current - Math.PI / 2.7, 0]}
      scale={0.6}
      position={[0.07, -0.6, 0]}
    />
  );
}

const ChartContainer = styled(motion.div)`
  width: 100%;
  height: 300px;
  margin: 0;
`;

// Компонент информационной метки (точка + линия + текст)
const InfoTagContainer = styled.div`
  position: fixed;
  left: 24px;
  top: 219px; // Базовая позиция
  transform: translateY(${props => props.$scrollOffset}px); // Параллакс-эффект
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
  transition: transform 0.1s ease-out; // Плавное движение, но быстрое реагирование
  
  @media (max-width: 768px) {
    display: none; // Только для десктопной версии
  }
`;

const InfoDotLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const InfoDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: var(--text-primary);
`;

const InfoLine = styled.div`
  height: 1px;
  width: ${props => props.$lineWidth}px; // Динамическая ширина линии
  background-color: var(--text-primary);
  transition: width 0.3s ease-out; // Плавная анимация изменения длины
`;

const InfoText = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.3;
`;

const InfoSecondaryText = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.3;
`;

// Модифицируем компонент ScrambleText для анимации только определенной части текста
const ScrambleText = ({ text, scramblePart }) => {
  const [displayText, setDisplayText] = useState(text);
  const prevTextRef = useRef('');
  
  // Набор символов для скремблинга
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_[]';
  
  useEffect(() => {
    // Если текст не изменился, не запускаем анимацию
    if (prevTextRef.current === text) return;
    
    // Находим позицию части для анимации в тексте
    const startPos = text.indexOf(scramblePart);
    if (startPos === -1) {
      // Если часть не найдена, просто отображаем текст
      setDisplayText(text);
      prevTextRef.current = text;
      return;
    }
    
    let animationFrame;
    let iterations = 0;
    const maxIterations = 15; // Максимальное количество итераций
    
    // Функция для получения случайного символа
    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];
    
    // Функция для анимации
    const animate = () => {
      iterations++;
      
      // Вероятность правильного символа увеличивается с каждой итерацией
      const probability = 0.5 * (iterations / maxIterations);
      
      // Часть текста до анимируемой части
      const prefix = text.substring(0, startPos);
      // Часть текста после анимируемой части
      const suffix = text.substring(startPos + scramblePart.length);
      
      // Формируем новую анимируемую часть
      let newScrambledPart = '';
      for (let i = 0; i < scramblePart.length; i++) {
        // Пробелы не анимируем
        if (scramblePart[i] === ' ') {
          newScrambledPart += ' ';
        } else {
          // Решаем, отображать правильный символ или случайный
          if (Math.random() < probability) {
            newScrambledPart += scramblePart[i];
          } else {
            newScrambledPart += getRandomChar();
          }
        }
      }
      
      // Собираем полный текст
      setDisplayText(prefix + newScrambledPart + suffix);
      
      // Продолжаем анимацию, пока не достигнем максимального количества итераций
      if (iterations < maxIterations) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // В конце устанавливаем точный текст
        setDisplayText(text);
        prevTextRef.current = text;
      }
    };
    
    // Запускаем анимацию
    animationFrame = requestAnimationFrame(animate);
    
    // Очистка при размонтировании или при изменении текста
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [text, scramblePart]);
  
  return <span>{displayText}</span>;
};

// Компонент для анимированного вертикального текста с параметром активации
const ProfileInfoContent = ({ type }) => {
  const { language } = useLanguage();
  const t = translations.about[language];
  const [isScrambling, setIsScrambling] = useState(false);
  const isActiveRef = useRef(false); // Флаг для отслеживания активности
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(0);
  
  // Определяем полный текст и часть для анимации в зависимости от типа
  const textConfig = type === 'gender' 
    ? { fullText: t.gender, scramblePart: t.gender.split(": ")[1] }
    : { fullText: t.age, scramblePart: t.age.match(/\[\d+\]/)[0] };
  
  const isMobileRef = useRef(false);

  // Проверяем тип устройства
  useEffect(() => {
    isMobileRef.current = window.matchMedia('(max-width: 768px)').matches;

    const updateDeviceType = () => {
      isMobileRef.current = window.matchMedia('(max-width: 768px)').matches;
    };

    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // Функция для проверки активности и отключения анимации при бездействии - объявляем её ПЕРВОЙ
  const checkActivity = useCallback(() => {
    const now = Date.now();
    
    // Если прошло более 300мс с последней активности, останавливаем анимацию
    if (now - lastActivityRef.current > 300) {
      isActiveRef.current = false;
      setIsScrambling(false);
      return;
    }
    
    // Продолжаем проверку
    timeoutRef.current = requestAnimationFrame(checkActivity);
  }, []);

  // Функция активации/деактивации анимации - теперь она ВТОРАЯ
  const activateScrambling = useCallback(() => {
    // Сохраняем время последней активности
    lastActivityRef.current = Date.now();
    
    // Если анимация не активна, активируем её
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      setIsScrambling(true);
      
      // Запускаем цикл проверки активности
      checkActivity();
    }
  }, [checkActivity]);

  // Обработчик движения мыши для десктопа
  useEffect(() => {
    if (isMobileRef.current) return; // Пропускаем для мобильных

    const handleMouseMove = () => {
      activateScrambling();
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(timeoutRef.current);
    };
  }, [activateScrambling]);

  // Обработчик скролла для мобильных
  useEffect(() => {
    if (!isMobileRef.current) return; // Пропускаем для десктопа

    const handleScroll = () => {
      activateScrambling();
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(timeoutRef.current);
    };
  }, [activateScrambling]);

  return isScrambling 
    ? <ScrambleText text={textConfig.fullText} scramblePart={textConfig.scramblePart} /> 
    : textConfig.fullText;
};

// Компонент информационной метки
const InfoTag = () => {
  const { language } = useLanguage();
  const t = translations.about[language];
  const [currentSection, setCurrentSection] = useState("bio_section");
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineWidth, setLineWidth] = useState(120); // Базовая длина линии
  
  // Диапазон изменения длины линии
  const minLineWidth = 80; 
  const maxLineWidth = 150;
  
  useEffect(() => {
    // Функция для определения текущего раздела и расчета параллакс-эффекта
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      // Параллакс-эффект: умножаем скролл на коэффициент меньше 1 для более медленного движения
      const parallaxFactor = 0.3; // 30% от скорости скролла
      setScrollOffset(window.scrollY * parallaxFactor);
      
      // Анимация длины линии:
      // Используем синусоидальную функцию для плавного изменения длины линии при скролле
      const scrollPhase = window.scrollY * 0.01; // Регулирует скорость изменения длины
      // Амплитуда колебаний
      const amplitude = (maxLineWidth - minLineWidth) / 2;
      // Смещение, чтобы значения были в диапазоне от minLineWidth до maxLineWidth
      const offset = minLineWidth + amplitude;
      // Вычисляем новую длину на основе синусоидальной функции
      const newLineWidth = offset + amplitude * Math.sin(scrollPhase);
      
      setLineWidth(newLineWidth);
      
      // Получаем элементы разделов
      const skillsSection = document.querySelector('.skills-section');
      const qualitiesSection = document.querySelector('.qualities-section');
      const experienceSection = document.querySelector('.experience-section');
      
      // Получаем позиции разделов
      const skillsPosition = skillsSection?.getBoundingClientRect().top + window.scrollY;
      const qualitiesPosition = qualitiesSection?.getBoundingClientRect().top + window.scrollY;
      const experiencePosition = experienceSection?.getBoundingClientRect().top + window.scrollY;
      
      // Определяем текущий раздел на основе позиции скролла
      if (skillsPosition && scrollPosition >= skillsPosition) {
        setCurrentSection("skills_section");
      } else if (experiencePosition && scrollPosition >= experiencePosition) {
        setCurrentSection("experience_section");
      } else if (qualitiesPosition && scrollPosition >= qualitiesPosition) {
        setCurrentSection("qualities_section");
      } else {
        setCurrentSection("bio_section");
      }
    };
    
    // Используем requestAnimationFrame для плавной анимации
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Устанавливаем обработчик события прокрутки
    window.addEventListener('scroll', scrollListener);
    
    // Вызываем функцию один раз при монтировании для начальной установки
    handleScroll();
    
    // Очистка обработчика при размонтировании
    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, []);
  
  return (
    <InfoTagContainer $scrollOffset={scrollOffset}>
      <InfoDotLine>
        <InfoDot />
        <InfoLine $lineWidth={lineWidth} />
      </InfoDotLine>
      <InfoText>
        {t.info_date}
      </InfoText>
      <InfoSecondaryText>
        {t.version}
      </InfoSecondaryText>
      <InfoSecondaryText>
        {t.filename}: <ScrambleText text={currentSection} scramblePart={currentSection} />
      </InfoSecondaryText>
    </InfoTagContainer>
  );
};

// Компонент экрана загрузки
const LoadingScreen = ({ progress }) => {
  const { language } = useLanguage();
  const t = translations.about[language];
  const [dots, setDots] = useState(0);
  
  // Анимация точек загрузки
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev >= 3 ? 0 : prev + 1));
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <LoadingScreenContainer>
      <LoadingContainer>
        {(t.loading || "loading")}{'.'.repeat(dots)} {Math.floor(progress)}%
      </LoadingContainer>
    </LoadingScreenContainer>
  );
};

const About = () => {
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations.about[language];
  
  const [bioRef, bioInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [skillsRef, skillsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [qualitiesRef, qualitiesInView] = useInView({
    triggerOnce: true,
    threshold: 0.4
  });
  
  const [experienceRef, experienceInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [profileRef, profileInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  // Состояние для отслеживания положения мыши
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Ссылка на DOM-элемент ASCII-арта
  const asciiRef = useRef();
  
  // Добавляем определение мобильного устройства
  const [isMobile, setIsMobile] = useState(false);
  
  // Добавляем отслеживание скролла для мобильных устройств
  const [scrollY, setScrollY] = useState(0);
  
  // Добавляем реф для текстового блока и состояние для его высоты
  const bioTextGroupRef = useRef(null);
  const [bioTextHeight, setBioTextHeight] = useState(0);
  
  // Добавляем состояние для загрузки 3D модели
  const [modelLoading, setModelLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Эффект для измерения высоты текстового блока при рендере и изменении размера
  useEffect(() => {
    const updateBioHeight = () => {
      if (bioTextGroupRef.current) {
        setBioTextHeight(bioTextGroupRef.current.offsetHeight);
      }
    };
    
    // Обновляем высоту при монтировании и изменении размера окна
    updateBioHeight();
    window.addEventListener('resize', updateBioHeight);
    
    // Обновляем высоту через небольшую задержку, чтобы дать время анимации/рендеру
    const timeoutId = setTimeout(updateBioHeight, 100);
    
    return () => {
      window.removeEventListener('resize', updateBioHeight);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Определяем тип устройства при загрузке и изменении размера окна
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);
  
  // Отслеживаем скролл для мобильных устройств
  useEffect(() => {
    if (!isMobile) return;
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);
  
  // Обработчик движения мыши на уровне документа - только для десктопа
  useEffect(() => {
    if (isMobile) return; // Пропускаем для мобильных устройств
    
    const handleMouseMove = (e) => {
      // Нормализуем координаты от -1 до 1 относительно центра экрана
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      setMousePosition({ x, y });
    };
    
    // Добавляем обработчик на весь документ
    document.addEventListener('mousemove', handleMouseMove);
    
    // Очистка обработчика
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);
  
  // Эффект для имитации загрузки модели
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    let loadingInterval;
    let currentProgress = 0;
    
    const simulateLoading = () => {
      loadingInterval = setInterval(() => {
        currentProgress += Math.random() * 3;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(loadingInterval);
          setTimeout(() => setModelLoading(false), 500); // Небольшая задержка перед показом модели
        }
        setLoadingProgress(currentProgress);
      }, 100);
    };
    
    simulateLoading();
    
    return () => {
      clearInterval(loadingInterval);
    };
  }, [initialLoadComplete]);
  
  // Константа для рамки
  const frameChar = { 
    horizontal: '═', 
    vertical: '║', 
    topLeft: '╔', 
    topRight: '╗', 
    bottomLeft: '╚', 
    bottomRight: '╝' 
  };
  
  // Добавляем обратно анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Позиции для вертикальных символов (в процентах)
  const verticalPositions = [10, 30, 50, 70, 90];
  
  // Данные и настройки для Radar Chart личных качеств
  const qualitiesChartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 55, display: false },
        angleLines: { color: 'rgba(200, 200, 200, 0.3)' },
        grid: { color: 'rgba(200, 200, 200, 0.3)' },
        pointLabels: { color: '#ffffff', font: { size: 12 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } }
    },
    maintainAspectRatio: false
  };

  return (
    <AboutContainer>
      <TitleContainer>
        <SectionTitle>
          {t.title}
        </SectionTitle>
      </TitleContainer>
      
      <ContentContainer>
        <ProfileSection 
          ref={profileRef}
          initial={{ opacity: 0, y: 50 }}
          animate={profileInView && initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <ProfileImageContainer $bioHeight={bioTextHeight} $isMobile={isMobile}>
            {/* Добавляем информацию о пользователе по правому краю */}
            <ProfileInfoGender>
              <ProfileInfoContent type="gender" />
            </ProfileInfoGender>
            <ProfileInfoAge>
              <ProfileInfoContent type="age" />
            </ProfileInfoAge>
            {/* Сначала рамка (z-index: 20) */}
            <ModelFrame>
              <div className="top">
                {frameChar.topLeft + frameChar.horizontal.repeat(48) + frameChar.topRight}
              </div>
              <div className="left">
                {verticalPositions.map((pos, i) => (
                  <span key={i} className="v-symbol" style={{ top: `${pos}%` }}>
                    {frameChar.vertical}
                  </span>
                ))}
              </div>
              <div className="right">
                {verticalPositions.map((pos, i) => (
                  <span key={i} className="v-symbol" style={{ top: `${pos}%` }}>
                    {frameChar.vertical}
                  </span>
                ))}
              </div>
              <div className="bottom">
                {frameChar.bottomLeft + frameChar.horizontal.repeat(48) + frameChar.bottomRight}
              </div>
            </ModelFrame>
            
            {/* Показываем экран загрузки, если модель ещё загружается */}
            {modelLoading && <LoadingScreen progress={loadingProgress} />}
            
            {/* Затем ASCII контейнер (z-index: 10) */}
            <AsciiArtContainer ref={asciiRef} style={{ opacity: modelLoading ? 0 : 1 }} />
            
            {/* Затем скрытый Canvas для рендеринга 3D модели */}
            <HiddenCanvas>
              <Canvas 
                style={{ width: '100%', height: '100%' }} 
                camera={{ 
                  position: isMobile ? [0, 0, 2.5] : [0, 0, 7],
                  fov: isMobile ? 45 : 35
                }}
                gl={{ preserveDrawingBuffer: true, alpha: true }}
              >
                <color attach="background" args={['#000']} transparent opacity={0} />
                <ambientLight intensity={0.9} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2.0} />
                <pointLight position={[-10, -10, -10]} intensity={1.0} />
                <Suspense fallback={null}>
                  {isMobile ? (
                    <MobileModel scrollY={scrollY} />
                  ) : (
                    <DesktopModel mouseX={mousePosition.x} mouseY={mousePosition.y} />
                  )}
                  <Environment preset="city" />
                  <AsciiEffect 
                    domRef={asciiRef} 
                    characters=' .:-+*=%@#$' 
                    invert={true} 
                    resolution={isMobile ? 0.30 : 0.40}
                    alphaThreshold={isMobile ? 0.1 : 0.15}
                  />
                </Suspense>
              </Canvas>
            </HiddenCanvas>
          </ProfileImageContainer>
        </ProfileSection>
        
        <BioSection className="bio-section">
          <BioTextGroup ref={bioTextGroupRef}>
            <BioText
              ref={bioRef}
              initial={{ opacity: 0, y: 30 }}
              animate={bioInView && initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7 }}
              dangerouslySetInnerHTML={{ __html: t.bio1.replace(/<highlight>(.*?)<\/highlight>/g, '<span style="color: var(--text-primary); font-weight: 500;">$1</span>') }}
            />
            <BioText
              initial={{ opacity: 0, y: 30 }}
              animate={bioInView && initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              dangerouslySetInnerHTML={{ __html: t.bio2.replace(/<highlight>(.*?)<\/highlight>/g, '<span style="color: var(--text-primary); font-weight: 500;">$1</span>') }}
            />
            <BioText
              initial={{ opacity: 0, y: 30 }}
              animate={bioInView && initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              dangerouslySetInnerHTML={{ __html: t.bio3.replace(/<highlight>(.*?)<\/highlight>/g, '<span style="color: var(--text-primary); font-weight: 500;">$1</span>') }}
            />
          </BioTextGroup>
          
          <QualitiesSection
            ref={qualitiesRef}
            className="qualities-section"
            variants={containerVariants}
            initial="hidden"
            animate={qualitiesInView && initialLoadComplete ? "visible" : "hidden"}
          >
            <SkillsTitle>{t.qualities_title}</SkillsTitle>
            <ChartContainer
              initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
              animate={qualitiesInView && initialLoadComplete ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.7, opacity: 0, rotate: -10 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Radar data={{
                labels: t.qualities.map(q => q.name),
                datasets: [{
                  label: t.qualities_title,
                  data: t.qualities.map(q => q.level),
                  backgroundColor: 'rgba(160, 160, 160, 0.2)',
                  borderColor: 'rgb(133, 133, 133)',
                  borderWidth: 1,
                  borderDash: [5, 5],
                  tension: 0.4,
                  pointBackgroundColor: 'rgb(188, 188, 188)',
                }]
              }} options={qualitiesChartOptions} />
            </ChartContainer>
          </QualitiesSection>
          
          <ExperienceSection
            ref={experienceRef}
            className="experience-section"
            variants={containerVariants}
            initial="hidden"
            animate={experienceInView && initialLoadComplete ? "visible" : "hidden"}
          >
            <ExperienceTitle>{t.experience_title}</ExperienceTitle>
            <TimelineContainer>
              {t.experience.map((job, index) => (
                <TimelineItem key={index} variants={itemVariants}>
                  <TimelinePeriod>{job.period}</TimelinePeriod>
                  <TimelinePosition>{job.position}</TimelinePosition>
                  <TimelineCompany>{job.company}</TimelineCompany>
                  <TimelineDescription>{job.description}</TimelineDescription>
                </TimelineItem>
              ))}
            </TimelineContainer>
          </ExperienceSection>
          
          <SkillsSection
            ref={skillsRef}
            className="skills-section"
            variants={containerVariants}
            initial="hidden"
            animate={skillsInView && initialLoadComplete ? "visible" : "hidden"}
          >
            <SkillsTitle>{t.skills_title}</SkillsTitle>
            <SkillsGrid>
              {t.skills.map((skill, index) => (
                <SkillItem key={index} variants={itemVariants}>
                  <SkillProgress 
                    $level={skill.level}
                    initial={{ width: 0 }}
                    animate={skillsInView && initialLoadComplete ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  />
                  <SkillName>{skill.name}</SkillName>
                </SkillItem>
              ))}
            </SkillsGrid>
          </SkillsSection>
        </BioSection>
      </ContentContainer>
      
      <InfoTag />
    </AboutContainer>
  );
};

// Предзагрузка модели
useGLTF.preload('/assets/base.glb');

export default About; 
