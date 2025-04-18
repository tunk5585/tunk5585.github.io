import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  padding: 5px;
  background-color: var(--main-bg);
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Copyright = styled.p`
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  margin: 0;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <Copyright>
        ©2025 DEVELOPMENT AND DESIGN BY TUNK5585
      </Copyright>
    </FooterContainer>
  );
};

export default Footer; 