import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTelegram, FaEye, FaEyeSlash, FaInstagram } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';
import { ReactComponent as LogoSvg } from '../assets/images/header/Lolo_tunk_1.svg';

const PasswordOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--main-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
`;

const LanguageSwitcherContainer = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10000;
`;

const LanguageButton = styled.button`
  background: none;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 8px 12px;
  font-size: 0.8rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent);
    color: var(--text-secondary);
  }
`;

const PasswordContainer = styled(motion.div)`
  background-color: rgba(30, 30, 30, 0.5);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 48px;
  max-width: 400px;
  width: 100%;
  position: relative;
  
  @media (max-width: 480px) {
    padding: 32px;
  }
`;

const FormBackground = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--border);
  z-index: -1;
  pointer-events: none;
  
  @media (max-width: 480px) {
    top: 10px;
    left: 10px;
  }
`;

const TitleRowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  margin-bottom: 16px;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 14px;
  background-color: rgba(20, 20, 20, 0.5);
  border: 2px solid ${props => props.$error ? '#ff6b6b' : 'var(--border)'};
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ff6b6b' : 'var(--text-secondary)'};
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
  
  &:hover {
    color: var(--accent);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 24px;
  position: relative;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px; 
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 12px 24px;
  background-color: transparent;
  border: 0.5px solid var(--text-primary);
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: var(--accent);
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #ff6b6b;
  margin-top: 10px;
  font-size: 0.9rem;
`;

const LogoContainer = styled.div`
  flex-shrink: 0;
  
  svg {
    height: 32px;
    width: auto;
    display: block;
  }
`;

const IconsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
`;

const TelegramIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border: 0.5px solid var(--text-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1.3rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--accent);
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateY(-3px);
  }
`;

const PasswordInfoButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px;
  transition: color 0.2s ease, text-decoration 0.2s ease;
  text-align: left;
  line-height: 1.4;
  outline: none;

  &:hover {
    color: var(--accent);
    text-decoration: underline;
    background: none;
  }

  &:focus {
    color: var(--accent);
    text-decoration: underline;
    background: none;
    outline: none;
  }
  
  &:active {
    background: none;
  }

  @media (max-width: 480px) {
    margin-top: 0;
    text-align: center;
    font-size: 0.85rem;
  }
`;

const InfoPopup = styled(motion.div)`
  position: absolute;
  background: var(--main-bg);
  border-radius: 8px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 12px 16px;
  font-size: 0.85rem;
  line-height: 1.5;
  z-index: 10;
  
  width: auto;
  max-width: 380px;
  
  white-space: normal;
  word-break: normal;
  overflow-wrap: break-word;

  top: calc(100% + 8px);
  left: 0;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;

const PasswordEntry = ({ onPasswordSuccess }) => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);

  const passwordInfoButtonRef = useRef(null);
  const passwordInfoContentRef = useRef(null);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(false);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === '55welcom85') {
      // Запоминаем, что пароль был введен правильно
      localStorage.setItem('passwordEntered', 'true');
      // Вызываем callback для родительского компонента
      if (onPasswordSuccess) onPasswordSuccess();
    } else {
      setError(true);
    }
  };
  
  const handleTogglePasswordInfo = () => {
    setShowPasswordInfo(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPasswordInfo) {
        if (passwordInfoButtonRef.current && passwordInfoButtonRef.current.contains(event.target)) {
            return;
        }
        if (passwordInfoContentRef.current && !passwordInfoContentRef.current.contains(event.target)) {
          setShowPasswordInfo(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPasswordInfo]);

  return (
    <PasswordOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LanguageSwitcherContainer>
        <LanguageButton onClick={toggleLanguage}>
          {language === 'ru' ? 'EN' : 'RU'}
        </LanguageButton>
      </LanguageSwitcherContainer>
      
      <PasswordContainer
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <TitleRowContainer>
          <LogoContainer>
            <LogoSvg />
          </LogoContainer>
        </TitleRowContainer>
        <Description>{t.password_description || 'Пожалуйста, введите предоставленный пароль для доступа к сайту.'}</Description>
        
        <form onSubmit={handleSubmit}>
          <InputContainer>
            <PasswordInputWrapper>
              <PasswordInput 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder={t.password_placeholder || 'Введите пароль'}
                $error={error}
                autoFocus
              />
              <TogglePasswordButton 
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? t.hide_password : t.show_password}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </TogglePasswordButton>
            </PasswordInputWrapper>
            
            <AnimatePresence>
              {error && (
                <ErrorMessage
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {t.password_error || 'Неверный пароль, попробуйте еще раз.'}
                </ErrorMessage>
              )}
            </AnimatePresence>
          </InputContainer>
          
          <ButtonContainer>
            <SubmitButton
              type="submit"
              whileHover={{ backgroundColor: 'var(--accent)' }}
              whileTap={{ scale: 0.97 }}
            >
              {t.password_submit || 'Войти'}
            </SubmitButton>

            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <PasswordInfoButton 
                  ref={passwordInfoButtonRef}
                  type="button"
                  onClick={handleTogglePasswordInfo}
                  aria-expanded={showPasswordInfo}
                >
                  {t.where_to_get_password_button || "Где взять пароль?"}
                </PasswordInfoButton>

                <AnimatePresence>
                  {showPasswordInfo && (
                    <InfoPopup
                      ref={passwordInfoContentRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {t.where_to_get_password_tooltip || "Я сам выдам вам пароль после первичного контакта."}
                    </InfoPopup>
                  )}
                </AnimatePresence>
            </div>
          </ButtonContainer>
        </form>
        
        <IconsContainer>
          <TelegramIcon href="https://t.me/tunk5585" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <FaTelegram />
          </TelegramIcon>
          <TelegramIcon href="https://instagram.com/tunk5585" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </TelegramIcon>
        </IconsContainer>
        
        <FormBackground />
      </PasswordContainer>
    </PasswordOverlay>
  );
};

export default PasswordEntry; 