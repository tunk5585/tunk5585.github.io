import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  }
`;

const MobileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: ${props => props.$scroll ? 'var(--main-bg)' : 'transparent'};
  box-shadow: ${props => props.$scroll ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: all 0.3s ease;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
`;

// Кнопка меню с кастомной анимацией
const MenuButton = styled.button`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MenuIcon = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MenuCircle = styled(motion.circle)`
  fill: var(--accent);
`;

// Компактное выпадающее меню
const MenuDropdown = styled(motion.div)`
  position: absolute;
  top: 80px;
  right: 20px;
  width: 250px;
  background: var(--main-bg);
  border-radius: 18px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 150;
  transform-origin: top right;
  border: 1px solid var(--border);
`;

// Анимированные элементы меню
const NavList = styled(motion.ul)`
  list-style: none;
  padding: 15px 0;
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
  font-size: 1.2rem;
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
`;

// Разделитель между пунктами меню
const Divider = styled.div`
  height: 1px;
  background-color: var(--border);
  margin: 5px 0;
`;

// Социальные сети в нижней части меню
const CopyrightContainer = styled.div`
  padding: 15px 0;
  border-top: 1px solid var(--border);
  text-align: center;
`;

const Copyright = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin: 0;
  padding: 0 10px;
`;

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  
  // Эффект для отслеживания скролла
  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Закрываем меню при изменении маршрута
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  // Обработчик для закрытия меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
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
  
  return (
    <MobileMenuContainer>
      <MobileHeader $scroll={scroll}>
        <Logo to="/" aria-label="На главную">
          <LogoImage src={logo} alt="Логотип" />
        </Logo>
        
        <MenuButton onClick={() => setIsOpen(!isOpen)} aria-label="Меню">
          <MenuIcon>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <MenuCircle
                cx="20"
                cy="20"
                r="20"
                initial={false}
                animate={isOpen ? { scale: 1 } : { scale: 0.8 }}
              />
              <motion.path
                d="M13,16 L27,16"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={false}
                animate={isOpen ? { rotate: 45, translateY: 4 } : { rotate: 0, translateY: 0 }}
              />
              <motion.path
                d="M13,24 L27,24"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={false}
                animate={isOpen ? { rotate: -45, translateY: -4 } : { rotate: 0, translateY: 0 }}
              />
              <motion.path
                d="M13,20 L27,20"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={false}
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
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
  );
};

export default MobileMenu; 