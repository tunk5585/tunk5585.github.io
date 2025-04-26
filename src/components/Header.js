import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as LogoSvg } from '../assets/images/header/Lolo_tunk_1.svg';
import MobileMenu from './MobileMenu';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 20px 0;
  transition: all 0.3s ease;
  background-color: ${props => props.$scroll ? 'var(--main-bg)' : 'transparent'};
  box-shadow: ${props => props.$scroll ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none'};
  transform: translateY(${props => props.$hidden ? '-100%' : '0'});
  border-bottom: ${props => props.$notHome ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-left: calc(20px + env(safe-area-inset-left));
  padding-right: calc(14px + env(safe-area-inset-right));
  box-sizing: border-box;
`;

const Logo = styled(motion.div)`
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  cursor: pointer;
  svg {
    height: 40px;
    width: auto;
    transition: filter 0.3s ease;

    &:hover {
      filter: brightness(1.1);
    }
  }
`;

// Кнопка меню в стиле мобильной версии
const MenuButton = styled.button`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  user-select: none;
  
  /* Убираем все возможные подсветки и эффекты */
  &:focus, &:active, &:hover {
    outline: none;
    box-shadow: none;
    background: none;
    -webkit-appearance: none;
  }
`;

const MenuIcon = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

const MenuCircle = styled(motion.circle)`
  fill: var(--accent);
`;

// Оверлей для затемнения при открытии меню
const MenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 90;
  backdrop-filter: blur(2px);
`;

// Выпадающее меню
const MenuDropdown = styled(motion.div)`
  position: absolute;
  top: 70px;
  right: 20px;
  width: 180px; /* Уменьшаем ширину с 250px до 180px */
  background: var(--main-bg);
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 150;
  transform-origin: top right;
  border: 1px solid var(--border);
`;

// Анимированные элементы меню
const NavList = styled(motion.ul)`
  list-style: none;
  padding: 10px 0; /* Уменьшаем отступы с 15px до 10px */
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const NavItem = styled(motion.li)`
  margin: 0;
  padding: 0;
  width: 100%;
`;

const NavLink = styled(Link)`
  font-size: 0.75rem; /* Уменьшаем размер шрифта с 0.85rem до 0.75rem */
  font-weight: 500;
  position: relative;
  display: block;
  padding: 8px 15px;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.8px; /* Немного уменьшаем расстояние между буквами */
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--accent);
  }
  
  &.active {
    color: var(--text-secondary);
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// Социальные сети в нижней части меню
const CopyrightContainer = styled.div`
  padding: 10px 0;
  border-top: 1px solid var(--border);
  text-align: center;
`;

const Copyright = styled.p`
  font-size: 0.55rem; /* Уменьшаем размер шрифта с 0.65rem до 0.55rem */
  color: var(--text-tertiary);
  letter-spacing: 0.4px; /* Немного уменьшаем расстояние между буквами */
  margin: 0;
  padding: 0 8px;
`;

// Добавляем компонент переключателя языка
const LanguageSwitcherContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LanguageButton = styled.button`
  background: none;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 6px 10px;
  font-size: 0.75rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  
  &:hover {
    background-color: var(--accent);
    color: var(--text-secondary);
  }
`;

// Компонент для анимированного текста при наведении
const ScrambleText = ({ text, isHovered }) => {
  const [displayText, setDisplayText] = useState(text);
  
  // Набор символов для скремблинга
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
  
  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }
    
    let animationFrame;
    let iterations = 0;
    const maxIterations = 15;
    
    // Определяем самый длинный текст
    const maxLength = text.length;
    
    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];
    
    const animate = () => {
      iterations++;
      
      const probability = 0.5 * (iterations / maxIterations);
      
      let newText = '';
      for (let i = 0; i < maxLength; i++) {
        if (Math.random() < probability) {
          newText += text[i];
        } else {
          newText += getRandomChar();
        }
      }
      
      setDisplayText(newText);
      
      if (iterations < maxIterations) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isHovered, text]);
  
  return <span>{displayText}</span>;
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  
  // Используем контекст языка
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Определяем направление скролла
      if (currentScrollPos > prevScrollPos && !hidden && currentScrollPos > 20) {
        // Скролл вниз - скрываем хедер
        setHidden(true);
      } else if (currentScrollPos < prevScrollPos && hidden) {
        // Скролл вверх - показываем хедер
        setHidden(false);
      }
      
      // Устанавливаем фон хедера, если позиция больше 50px
      setScroll(currentScrollPos > 50);
      
      // Закрываем меню при скролле
      if (isOpen) {
        setIsOpen(false);
      }
      
      // Сохраняем текущую позицию скролла
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hidden, prevScrollPos, isOpen]);
  
  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  // Обработчик для закрытия меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Проверяем, что клик не по кнопке меню
      const menuButtonEl = document.querySelector('[aria-label="Меню десктоп"]');
      if (menuButtonEl && (menuButtonEl === event.target || menuButtonEl.contains(event.target))) {
        return; // Не обрабатываем клик по кнопке меню здесь
      }
      
      // Обрабатываем клик вне меню
      if (menuRef.current && !menuRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Варианты анимации для выпадающего меню
  const dropdownVariants = {
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 22,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      }
    },
    closed: {
      opacity: 0,
      scale: 0.9,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05,
        staggerDirection: -1,
      }
    }
  };
  
  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }
    },
    closed: {
      y: -10,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }
    }
  };
  
  // Варианты анимации для оверлея
  const overlayVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Улучшенная анимация для лого
  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5
      }
    },
    shake: {
      x: [0, -3, 3, -3, 3, -2, 2, -1, 1, 0],
      rotate: [0, -0.5, 0.5, -0.5, 0.5, -0.3, 0.3, -0.1, 0.1, 0],
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Обработчик для кнопки меню
  const handleMenuButtonClick = () => {
    setIsOpen(!isOpen);
  };
  
  // Обработчик клика по логотипу с анимацией
  const handleLogoClick = (e) => {
    e.preventDefault(); // Предотвращаем стандартный переход по ссылке
    
    // Запускаем анимацию потряхивания в любом случае
    setIsShaking(true);
    
    if (location.pathname === '/') {
      // Если уже на главной, просто прокручиваем вверх с анимацией после потряхивания
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsShaking(false);
      }, 500); // Ждем завершения анимации
      return;
    }
    
    // После завершения анимации переходим на главную страницу
    setTimeout(() => {
      navigate('/');
      setIsShaking(false);
    }, 500); // 500мс - длительность анимации
  };
  
  return (
    <>
      {/* Оверлей для затемнения страницы */}
      <AnimatePresence>
        {isOpen && (
          <MenuOverlay 
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <HeaderContainer $scroll={scroll} $hidden={hidden} $notHome={location.pathname !== '/'}>
        <HeaderContent>
          <Logo 
            onClick={handleLogoClick}
            aria-label="На главную"
            animate={isShaking ? "shake" : "visible"}
            initial="visible"
            variants={logoVariants}
            whileHover={{ scale: 1.05 }}
          >
            <LogoSvg aria-label="Логотип" />
          </Logo>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Добавляем переключатель языка */}
            <LanguageSwitcherContainer>
              <LanguageButton onClick={toggleLanguage}>
                {language === 'en' ? 'RU' : 'EN'}
              </LanguageButton>
            </LanguageSwitcherContainer>
            
            <MenuButton 
              onClick={handleMenuButtonClick} 
              aria-label="Меню десктоп"
              type="button"
            >
              <MenuIcon>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <MenuCircle
                    cx="20"
                    cy="20"
                    r="20"
                    initial={false}
                    animate={isOpen ? { scale: 1 } : { scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d="M13,16 L27,16"
                    stroke="var(--text-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={false}
                    animate={isOpen ? { rotate: 45, translateY: 4 } : { rotate: 0, translateY: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d="M13,24 L27,24"
                    stroke="var(--text-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={false}
                    animate={isOpen ? { rotate: -45, translateY: -4 } : { rotate: 0, translateY: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d="M13,20 L27,20"
                    stroke="var(--text-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={false}
                    animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
              </MenuIcon>
            </MenuButton>
          </div>
          
          <AnimatePresence>
            {isOpen && (
              <MenuDropdown
                ref={menuRef}
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
              >
                <NavList>
                  <NavItem variants={itemVariants}>
                    <NavLink 
                      to="/" 
                      className={location.pathname === '/' ? 'active' : ''}
                      onMouseEnter={() => setHoveredItem('main')}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <ScrambleText text={t.main} isHovered={hoveredItem === 'main'} />
                    </NavLink>
                  </NavItem>
                  
                  <NavItem variants={itemVariants}>
                    <NavLink 
                      to="/about" 
                      className={location.pathname === '/about' ? 'active' : ''}
                      onMouseEnter={() => setHoveredItem('about')}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <ScrambleText text={t.about} isHovered={hoveredItem === 'about'} />
                    </NavLink>
                  </NavItem>
                  
                  <NavItem variants={itemVariants}>
                    <NavLink 
                      to="/projects" 
                      className={location.pathname === '/projects' ? 'active' : ''}
                      onMouseEnter={() => setHoveredItem('projects')}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <ScrambleText text={t.projects} isHovered={hoveredItem === 'projects'} />
                    </NavLink>
                  </NavItem>
                  
                  <NavItem variants={itemVariants}>
                    <NavLink 
                      to="/testimonials" 
                      className={location.pathname === '/testimonials' ? 'active' : ''}
                      onMouseEnter={() => setHoveredItem('feedback')}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <ScrambleText text={t.feedback} isHovered={hoveredItem === 'feedback'} />
                    </NavLink>
                  </NavItem>
                  
                  <NavItem variants={itemVariants}>
                    <NavLink 
                      to="/contact" 
                      className={location.pathname === '/contact' ? 'active' : ''}
                      onMouseEnter={() => setHoveredItem('contact')}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <ScrambleText text={t.contact} isHovered={hoveredItem === 'contact'} />
                    </NavLink>
                  </NavItem>
                </NavList>
                
                <CopyrightContainer>
                  <Copyright>{t.copyright}</Copyright>
                </CopyrightContainer>
              </MenuDropdown>
            )}
          </AnimatePresence>
        </HeaderContent>
      </HeaderContainer>
      
      {/* Мобильное меню - отображается только на мобильных устройствах */}
      <MobileMenu />
    </>
  );
};

export default Header; 