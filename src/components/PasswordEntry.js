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
  overflow: hidden;
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
  right: 15px;
  bottom: 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  z-index: -1;
  pointer-events: none;
  
  @media (max-width: 480px) {
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
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

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, opacity 0.3s ease;
  display: inline-block;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  outline: none;
  
  &:hover:not(:disabled) {
    background-color: var(--accent);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  border: 1px solid var(--text-primary);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1.3rem;
  transition: all 0.3s ease;
  outline: none;
  
  &:hover {
    color: var(--accent);
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateY(-3px);
  }
`;

const PasswordInfoButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$isActive ? 'var(--accent)' : 'var(--text-secondary)'};
  text-decoration: ${props => props.$isActive ? 'underline' : 'none'};
  cursor: pointer;
  font-size: 0.8rem;
  padding: 4px;
  transition: color 0.2s ease, text-decoration 0.2s ease;
  text-align: left;
  line-height: 1.4;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) {
    &:hover {
      color: var(--accent);
      text-decoration: underline;
      background: none !important;
    }
  }

  &:focus {
    outline: none;
    background: none !important;
  }
  
  &:active {
    color: var(--accent);
    text-decoration: underline;
    background-color: transparent;
  }

  @media (max-width: 480px) {
    margin-top: 0;
    text-align: center;
    font-size: 0.85rem;

    &:active {
      background: none !important;
    }
    
    &:hover, &:focus {
      background: none !important;
    }
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

// Функция для хеширования пароля
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Хеш для пароля "55soclose85"
const EXPECTED_PASSWORD_HASH = "53be0e3ebd379d88181fedbd9b7a32713014f650e9876538684969c8d0187ac1";

const PasswordEntry = ({ onPasswordSuccess }) => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [isInputFocusedOnMobile, setIsInputFocusedOnMobile] = useState(false);
  const [originalScrollPos, setOriginalScrollPos] = useState(0);

  const passwordInfoButtonRef = useRef(null);
  const passwordInfoContentRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(false);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const passwordHash = await hashPassword(password);
      
      if (passwordHash === EXPECTED_PASSWORD_HASH) {
        localStorage.setItem('passwordEntered_v2', 'true');
        if (onPasswordSuccess) onPasswordSuccess();
      } else {
        setError(true);
      }
    } catch (error) {
      console.error('Error hashing password:', error);
      setError(true);
    }
  };
  
  const handleTogglePasswordInfo = () => {
    setShowPasswordInfo(prev => !prev);
  };

  const handleInputFocus = () => {
    if (window.innerWidth <= 480) {
      setOriginalScrollPos(window.pageYOffset || document.documentElement.scrollTop);
      setIsInputFocusedOnMobile(true);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocusedOnMobile(false);
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

  useEffect(() => {
    const preventScroll = (e) => e.preventDefault();
    
    const blockScroll = () => {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${originalScrollPos}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('keydown', preventKeyScroll, { passive: false });
    };
    
    const unblockScroll = () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      
      window.scrollTo(0, originalScrollPos);
      
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('keydown', preventKeyScroll);
    };
    
    const preventKeyScroll = (e) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleResize = () => {
      if (isInputFocusedOnMobile) {
        document.body.style.top = `-${originalScrollPos}px`;
      }
    };
    
    if (isInputFocusedOnMobile) {
      blockScroll();
      window.addEventListener('resize', handleResize);
    } else {
      unblockScroll();
    }
    
    return () => {
      unblockScroll();
      window.removeEventListener('resize', handleResize);
    };
  }, [isInputFocusedOnMobile, originalScrollPos]);

  useEffect(() => {
    let startY = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e) => {
      const curY = e.touches[0].clientY;
      const diffY = curY - startY;
      if (diffY > 0 || diffY < 0) {
        e.preventDefault();
      }
    };
    
    if (isInputFocusedOnMobile) {
      document.addEventListener('touchstart', onTouchStart, { passive: false });
      document.addEventListener('touchmove', onTouchMove, { passive: false });
    }
    
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, [isInputFocusedOnMobile]);

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
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={t.password_placeholder || 'Введите пароль'}
                $error={error}
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
            >
              {t.password_submit || 'Войти'}
            </SubmitButton>

            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <PasswordInfoButton 
                  ref={passwordInfoButtonRef}
                  type="button"
                  onClick={handleTogglePasswordInfo}
                  aria-expanded={showPasswordInfo}
                  $isActive={showPasswordInfo}
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