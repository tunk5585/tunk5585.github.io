import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import logo from '../assets/images/header/Lolo_tunk_1.svg';
import MobileMenu from './MobileMenu';

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
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const Logo = styled(Link)`
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -1px;
  position: relative;
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
  transition: filter 0.3s ease;
  
  &:hover {
    filter: brightness(1.1);
  }
`;

const Nav = styled.nav`
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-left: 25px;
`;

const NavLink = styled(Link)`
  font-size: 1rem;
  position: relative;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  &:after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: var(--text-primary);
    transition: width 0.3s ease;
  }
  
  &:hover:after, &.active:after {
    width: 100%;
  }
  
  &.active {
    opacity: 0.8;
  }
`;

const Header = () => {
  const [scroll, setScroll] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const location = useLocation();
  
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
  
  return (
    <>
      <HeaderContainer $scroll={scroll} $hidden={hidden}>
        <HeaderContent>
          <Logo to="/" aria-label="На главную">
            <LogoImage src={logo} alt="Логотип" />
          </Logo>
          
          <Nav>
            <NavList>
              <NavItem>
                <NavLink to="/" className={location.pathname === '/' ? 'active' : ''}>
                  Главная
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                  Обо мне
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/projects" className={location.pathname === '/projects' ? 'active' : ''}>
                  Проекты
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/testimonials" className={location.pathname === '/testimonials' ? 'active' : ''}>
                  Отзывы
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                  Контакты
                </NavLink>
              </NavItem>
            </NavList>
          </Nav>
        </HeaderContent>
      </HeaderContainer>
      
      {/* Мобильное меню - отображается только на мобильных устройствах */}
      <MobileMenu />
    </>
  );
};

export default Header; 