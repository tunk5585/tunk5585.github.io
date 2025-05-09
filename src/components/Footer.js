import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  width: 100%;
  padding: 8px 24px;
  background-color: var(--main-bg);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 10px 24px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const Copyright = styled.p`
  font-size: 0.7rem;
  color: var(--text-tertiary);
  opacity: 0.7;
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  
  @media (max-width: 768px) {
    display: none; /* Скрываем ссылки на мобильных устройствах */
  }
`;

const FooterLink = styled(Link)`
  font-size: 0.7rem;
  color: var(--text-tertiary);
  opacity: 0.8;
  text-decoration: underline;
  transition: opacity 0.2s ease, color 0.2s ease;
  
  &:hover {
    opacity: 1;
    color: var(--accent);
  }
`;

const Footer = () => {
  const { language } = useLanguage();
  
  // Устанавливаем дефолтный язык если контекст недоступен
  const lang = language || 'en';
  
  return (
    <FooterContainer>
      <LeftSection>
        <Copyright>
          {lang === 'ru' ? '©2025 DEVELOPMENT AND DESIGN BY TUNK5585' : '©2025 DEVELOPMENT AND DESIGN BY TUNK5585'}
        </Copyright>
      </LeftSection>
      <RightSection>
        <FooterLink to="/privacy">
          {lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
        </FooterLink>
        <FooterLink to="/terms">
          {lang === 'ru' ? 'Пользовательское соглашение' : 'Terms of Use'}
        </FooterLink>
      </RightSection>
    </FooterContainer>
  );
};

export default Footer; 