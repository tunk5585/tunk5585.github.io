import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/header/Lolo_tunk_1.svg';

// Стилизованные компоненты для мобильного меню
const MobileMenuContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    transform: translateY(${props => props.$hidden ? '-100%' : '0'});
    transition: transform 0.3s ease;
  }
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

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  padding-left: calc(20px + env(safe-area-inset-left));
  padding-right: calc(20px + env(safe-area-inset-right));
  background-color: var(--main-bg);
  box-shadow: ${props => props.$scroll ? '0 2px 10px rgba(0, 0, 0, 0.2)' : 'none'};
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 480px) {
    padding: 15px;
    padding-left: calc(15px + env(safe-area-inset-left));
    padding-right: calc(10px + env(safe-area-inset-right));
  }
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  
  @media (max-width: 480px) {
    height: 35px;
  }
`;

// Кнопка меню с кастомной анимацией
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
  touch-action: manipulation;
  
  /* Убираем все возможные подсветки и эффекты */
  &:focus, &:active, &:hover {
    outline: none;
    box-shadow: none;
    background: none;
    -webkit-appearance: none;
  }
  
  /* Дополнительные правила для iOS Safari */
  @media not all and (min-resolution:.001dpcm) { 
    @supports (-webkit-appearance:none) {
      &, &:focus, &:active {
        -webkit-appearance: none !important;
        border-radius: 0 !important;
      }
    }
  }
  
  @media (max-width: 480px) {
    width: 35px;
    height: 35px;
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
  touch-action: none;
  
  @media (max-width: 480px) {
    width: 35px;
    height: 35px;
  }
`;

const MenuCircle = styled(motion.circle)`
  fill: var(--accent);
`;

// Компактное выпадающее меню
const MenuDropdown = styled(motion.div)`
  position: absolute;
  top: 80px;
  right: 20px;
  width: 175px;
  background: var(--main-bg);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 150;
  transform-origin: top right;
  border: 1px solid var(--border);
  
  @media (max-width: 480px) {
    top: 70px;
    right: 15px;
    width: calc(68% - 30px);
    max-width: 189px;
  }
`;

// Анимированные элементы меню
const NavList = styled(motion.ul)`
  list-style: none;
  padding: 15px 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    padding: 10px 0;
  }
`;

const NavItem = styled(motion.li)`
  margin: 0;
  padding: 0;
  width: 100%;
`;

const NavLink = styled(Link)`
  font-size: 1rem;
  font-weight: 500;
  position: relative;
  display: block;
  padding: 12px 20px;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--accent);
  }
  
  &.active {
    color: var(--text-secondary);
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  @media (max-width: 480px) {
    padding: 10px 15px;
    font-size: 0.95rem;
  }
`;

// Социальные сети в нижней части меню
const CopyrightContainer = styled.div`
  padding: 15px 0;
  border-top: 1px solid var(--border);
  text-align: center;
  
  @media (max-width: 480px) {
    padding: 10px 0;
  }
`;

const Copyright = styled.p`
  font-size: 0.75rem;
  color: var(--text-tertiary);
  letter-spacing: 0.5px;
  margin: 0;
  padding: 0 10px;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 0 8px;
  }
`;

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  
  // Полностью блокируем прокрутку при открытом меню, включая touch-джесты
  useEffect(() => {
    const preventScroll = (e) => e.preventDefault();
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventScroll, { passive: false });
    } else {
      document.removeEventListener('touchmove', preventScroll);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.removeEventListener('touchmove', preventScroll);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);
  
  // Эффект для отслеживания скролла
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
      
      // Сохраняем текущую позицию скролла
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hidden, prevScrollPos]);
  
  // Предотвращаем pull-to-refresh в мобильных браузерах
  useEffect(() => {
    const preventPullToRefresh = (e) => {
      // Предотвращаем только если скролл находится в верхней позиции
      if (window.scrollY === 0) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        document.body.style.overscrollBehavior = 'none';
      }
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
      document.body.style.overscrollBehavior = 'auto';
    });
    
    return () => {
      document.removeEventListener('touchstart', preventPullToRefresh);
      document.removeEventListener('touchend', () => {});
    };
  }, []);
  
  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  // Обработчик для закрытия меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Проверяем, что клик не по кнопке меню
      const menuButtonEl = document.querySelector('[aria-label="Меню"]');
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
  
  // Дополнительный хак для удаления эффектов касания на мобильных
  useEffect(() => {
    const button = document.querySelector('[aria-label="Меню"]');
    if (button) {
      // Добавляем стиль напрямую к элементу
      button.style.webkitTapHighlightColor = 'transparent';
      button.style.WebkitAppearance = 'none';
      button.style.boxShadow = 'none';
      
      // Удаляем этот обработчик, так как он блокирует нажатия
      // button.addEventListener('touchstart', (e) => {
      //   e.preventDefault();
      // }, { passive: false });
    }
    
    return () => {
      // Очистка обработчика тоже не нужна
      // if (button) {
      //   button.removeEventListener('touchstart', (e) => {
      //     e.preventDefault();
      //   });
      // }
    };
  }, []);
  
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
  
  // Обработчик для самой кнопки меню
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
      {/* Оверлей выносим на верхний уровень, чтобы он покрывал всю страницу */}
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
      
      <MobileMenuContainer $hidden={hidden}>
        <MobileHeader $scroll={scroll}>
          <Logo 
            onClick={handleLogoClick}
            aria-label="На главную"
            animate={isShaking ? "shake" : "visible"}
            initial="visible"
            variants={logoVariants}
            whileHover={{ scale: 1.05 }}
          >
            <LogoImage src={logo} alt="Логотип" />
          </Logo>
          
          <MenuButton 
            onClick={handleMenuButtonClick} 
            aria-label="Меню"
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
        </MobileHeader>
        
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
                  <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
                    Главная
                  </NavLink>
                </NavItem>
                
                <NavItem variants={itemVariants}>
                  <NavLink to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                    Обо мне
                  </NavLink>
                </NavItem>
                
                <NavItem variants={itemVariants}>
                  <NavLink to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>
                    Проекты
                  </NavLink>
                </NavItem>
                
                <NavItem variants={itemVariants}>
                  <NavLink to="/testimonials" className={location.pathname === '/testimonials' ? 'active' : ''}>
                    Отзывы
                  </NavLink>
                </NavItem>
                
                <NavItem variants={itemVariants}>
                  <NavLink to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                    Контакты
                  </NavLink>
                </NavItem>
              </NavList>
              
              <CopyrightContainer>
                <Copyright>©2025 DEVELOPMENT AND DESIGN BY TUNK5585</Copyright>
              </CopyrightContainer>
            </MenuDropdown>
          )}
        </AnimatePresence>
      </MobileMenuContainer>
    </>
  );
};

export default MobileMenu; 