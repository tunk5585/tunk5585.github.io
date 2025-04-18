import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
  pointer-events: none;
  z-index: 1;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

// Наборы символов
const symbolsSet = '0123456789+-*/=<>%#$&*@[]^_{}~';
const defaultSymbol = '?';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const symbolsArrayRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const requestIdRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // Установка размеров canvas
    const updateCanvasSize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      // Пересоздаём символы при изменении размера
      initSymbols(width, height);
    };
    
    // Обработчик движения мыши
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    // Инициализация символов
    const initSymbols = (width, height) => {
      const cellSize = 15; // Маленький размер ячейки для высокой плотности
      const columns = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);
      
      const newSymbols = [];
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const realChar = symbolsSet.charAt(Math.floor(Math.random() * symbolsSet.length));
          const fontSize = Math.random() < 0.2 ? 7 + Math.floor(Math.random() * 3) : 9;
          
          newSymbols.push({
            x: x * cellSize + cellSize / 2,
            y: y * cellSize + cellSize / 2,
            realChar: realChar,   // Настоящий символ, который будет раскрываться
            displayChar: defaultSymbol, // По умолчанию показываем знак вопроса
            revealed: false,      // Флаг, показывающий раскрыт ли символ
            fontSize,
            baseOpacity: 0.03,
            opacity: 0.03,
            scale: 1,
            offsetX: 0,
            offsetY: 0
          });
        }
      }
      
      symbolsArrayRef.current = newSymbols;
    };
    
    // Функция анимации
    const animate = () => {
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      
      // Очищаем canvas
      ctx.clearRect(0, 0, width, height);
      
      const symbolsArray = symbolsArrayRef.current;
      const mousePos = mouseRef.current;
      
      // Рисуем каждый символ
      for (let i = 0; i < symbolsArray.length; i++) {
        const symbol = symbolsArray[i];
        
        // Расстояние до курсора
        const dx = symbol.x - mousePos.x;
        const dy = symbol.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Анимация в зависимости от расстояния до курсора
        if (distance < 80) {
          // Активная зона - раскрываем символ
          const factor = 1 - distance / 80;
          symbol.opacity = 0.1 + factor * 0.3;
          symbol.scale = 1 + factor * 0.5;
          symbol.offsetX = (Math.random() * 3 - 1.5) * factor;
          symbol.offsetY = (Math.random() * 3 - 1.5) * factor;
          
          // Раскрываем символ
          symbol.displayChar = symbol.realChar;
          symbol.revealed = true;
        } else if (distance < 150) {
          // Зона влияния - повышаем видимость, но не раскрываем
          const factor = 1 - (distance - 80) / 70;
          symbol.opacity = 0.03 + factor * 0.07;
          symbol.scale = 1 + factor * 0.1;
          symbol.offsetX = 0;
          symbol.offsetY = 0;
          
          // Скрываем символ, если он был раскрыт, но с небольшой задержкой
          if (symbol.revealed && Math.random() < 0.1) {
            symbol.displayChar = defaultSymbol;
            symbol.revealed = false;
          }
        } else {
          // Нормальное состояние
          symbol.opacity = 0.03;
          symbol.scale = 1;
          symbol.offsetX = 0;
          symbol.offsetY = 0;
          
          // Скрываем символ 
          if (symbol.revealed) {
            symbol.displayChar = defaultSymbol;
            symbol.revealed = false;
          }
        }
        
        // Рисуем символ
        ctx.save();
        ctx.globalAlpha = symbol.opacity;
        ctx.font = `${symbol.fontSize * symbol.scale}px monospace`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.translate(
          symbol.x + symbol.offsetX,
          symbol.y + symbol.offsetY
        );
        
        ctx.fillText(symbol.displayChar, 0, 0);
        ctx.restore();
        
        // Случайно меняем некоторые реальные символы (очень редко)
        if (Math.random() < 0.0002) {
          symbol.realChar = symbolsSet.charAt(Math.floor(Math.random() * symbolsSet.length));
          if (symbol.revealed) {
            symbol.displayChar = symbol.realChar;
          }
        }
      }
      
      // Продолжаем анимацию
      requestIdRef.current = requestAnimationFrame(animate);
    };
    
    // Первичная инициализация
    updateCanvasSize();
    
    // Запускаем анимацию
    requestIdRef.current = requestAnimationFrame(animate);
    
    // Добавляем обработчики событий
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateCanvasSize);
    
    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateCanvasSize);
      
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);
  
  return (
    <BackgroundContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
    </BackgroundContainer>
  );
};

export default InteractiveBackground; 