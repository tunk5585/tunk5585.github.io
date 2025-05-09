import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTelegram, FaInstagram, FaBehance } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';
import SEO from '../components/SEO';
import { useForm } from '@formspree/react';

const ContactContainer = styled.div`
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px; /* 2 шага */
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px; /* 2 шага моб */
  }
`;

const ContactInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 8px;
`;

const ContactText = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
`;

const InfoContainer = styled.div`
  margin-top: 48px; /* 2 шага */
  
  @media (max-width: 768px) {
    margin-top: 32px; /* 2 шага моб */
  }
`;

const InfoItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px; /* 1 шаг */
  
  @media (max-width: 768px) {
    margin-bottom: 16px; /* 1 шаг моб */
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-right: 1rem;
  width: 80px;
  
  @media (max-width: 480px) {
    width: 100%;
    margin-bottom: 0.3rem;
  }
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

// Заменяю ASCII арт на компонент с иконками соцсетей
const SocialIcons = styled.div`
  display: flex;
  gap: 24px; /* 1 шаг */
  margin-top: 48px; /* 2 шага */
  
  @media (max-width: 768px) {
    margin-top: 32px; /* 2 шага моб */
    gap: 16px; /* 1 шаг моб */
    justify-content: flex-start;
  }
`;

const SocialIconBlock = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 0.5px solid var(--text-primary);
  border-radius: 8px;
  background: transparent;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateY(-3px);
  }
`;

const SocialIconLink = styled.a`
  color: var(--text-primary);
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  
  &:hover {
    color: var(--accent);
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const FormSection = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    margin-top: 16px; /* 1 шаг моб */
    padding-right: 15px;
  }
  
  @media (max-width: 480px) {
    padding-right: 10px;
  }
`;

const ContactForm = styled(motion.form)`
  padding: 32px; /* 2 шага моб */
  background-color: rgba(30, 30, 30, 0.3);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 24px; /* 1.5 шага моб */
  }
  
  @media (max-width: 480px) {
    padding: 16px; /* 1 шаг моб */
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px; /* 1 шаг */
  
  @media (max-width: 768px) {
    margin-bottom: 16px; /* 1 шаг моб */
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background-color: rgba(20, 20, 20, 0.5);
  border: 2px solid var(--border);
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.95rem;
  }
  
  &:focus {
    outline: none;
    border-color: var(--text-secondary);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  background-color: rgba(20, 20, 20, 0.5);
  border: 2px solid var(--border);
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    min-height: 120px;
    padding: 10px;
    font-size: 0.95rem;
  }
  
  &:focus {
    outline: none;
    border-color: var(--text-secondary);
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
  margin-top: 24px; /* 1 шаг */
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    z-index: -1;
  }
  
  &:hover:before {
    transform: translateX(100%);
  }
  
  &:hover {
    background-color: var(--accent);
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    width: 100%;
  }
`;

const FormBackground = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  width: 100%;
  height: 100%;
  border: 1px solid var(--border);
  z-index: 0;
  pointer-events: none;
  
  @media (max-width: 768px) {
    width: calc(100% - 15px);
  }
  
  @media (max-width: 480px) {
    top: 10px;
    left: 10px;
  }
`;

// Обновляем стили для сообщения об успешной отправке
const SuccessMessage = styled(motion.div)`
  background-color: rgba(30, 30, 30, 0.9);
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 24px; /* 1.5 шага */
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100; /* Увеличиваем z-index */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 480px) {
    padding: 16px; /* 1 шаг моб */
    width: 90%;
  }
`;

const SuccessText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 16px; /* 1 шаг моб */
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 12px;
  }
`;

const StyledLink = styled(Link)`
  color: var(--text-primary);
  text-decoration: underline;
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    text-shadow: 0 0 2px rgba(240, 123, 255, 0.5);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px; /* 1 шаг */
  position: relative;
  background-color: ${props => props.$hasError ? 'rgba(255, 107, 107, 0.08)' : 'transparent'};
  border-radius: 4px;
  padding: ${props => props.$hasError ? '10px' : '0'};
  border-left: ${props => props.$hasError ? '3px solid #ff6b6b' : 'none'};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    margin-bottom: 16px; /* 1 шаг моб */
  }
`;

const CustomCheckbox = styled.div`
  position: relative;
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: ${props => props.$hasError ? '2px solid #ff6b6b' : '1px solid var(--border)'};
  background-color: ${props => props.$hasError ? 'rgba(255, 107, 107, 0.1)' : 'rgba(20, 20, 20, 0.5)'};
  margin-right: 10px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:after {
    content: '';
    position: absolute;
    display: ${props => props.checked ? 'block' : 'none'};
    width: 10px;
    height: 10px;
    background-color: var(--accent);
  }
  
  &:hover {
    border-color: ${props => props.$hasError ? '#ff6b6b' : 'var(--text-secondary)'};
  }
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const CheckboxLabel = styled.label`
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-secondary);
  cursor: pointer;
`;

// Улучшенные поля ввода с валидацией
const InputWithValidation = styled(Input)`
  border-color: ${props => props.$hasError ? '#ff6b6b' : 'var(--border)'};
  border-width: ${props => props.$hasError ? '2px' : '1px'};
  background-color: ${props => props.$hasError ? 'rgba(255, 107, 107, 0.05)' : 'rgba(20, 20, 20, 0.5)'};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.$hasError ? '#ff6b6b' : 'var(--text-secondary)'};
    background-color: ${props => props.$hasError ? 'rgba(255, 107, 107, 0.03)' : 'rgba(20, 20, 20, 0.5)'};
  }
`;

const TextareaWithValidation = styled(Textarea)`
  border-color: ${props => props.$hasError ? '#ff6b6b' : 'var(--border)'};
  border-width: ${props => props.$hasError ? '2px' : '1px'};
  background-color: ${props => props.$hasError ? 'rgba(255, 107, 107, 0.05)' : 'rgba(20, 20, 20, 0.5)'};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.$hasError ? '#ff6b6b' : 'var(--text-secondary)'};
    background-color: ${props => props.$hasError ? 'rgba(255, 107, 107, 0.03)' : 'rgba(20, 20, 20, 0.5)'};
  }
`;

// Добавляем оверлей для закрытия модального окна по клику на затемненный фон
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Contact = () => {
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations[language];
  
  // Для хранения индекса формы, чтобы сбрасывать состояние Formspree
  const [formKey, setFormKey] = useState(0);
  const [formState, handleSubmit] = useForm("xzzrglnv", {
    data: {
      source: "website-contact-form"
    }
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [consent, setConsent] = useState(false);
  
  // Добавляем состояние для технической информации
  const [technicalInfo, setTechnicalInfo] = useState({});
  // Время начала посещения страницы
  const [pageStartTime, setPageStartTime] = useState(Date.now());
  
  // Состояние для отслеживания ошибок валидации
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    subject: false, 
    message: false,
    consent: false
  });

  // Состояние для отслеживания попытки отправки
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Для управления видимостью модального окна
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Функция для сбора технической информации пользователя
  const collectTechnicalInfo = async () => {
    // Сначала собираем базовую информацию, которая всегда доступна
    const baseInfo = {
      browser_language: navigator.language || 'unknown',
      user_agent: navigator.userAgent || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      form_date: new Date().toISOString()
    };
    
    // Устанавливаем базовую информацию сразу
    setTechnicalInfo(baseInfo);
    
    // Пытаемся получить IP и геолокацию асинхронно
    try {
      // Используем более надежный метод через сторонний сервис без аутентификации
      const ipResponse = await fetch('https://api.ipify.org?format=json')
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch IP'))
        .catch(() => ({ ip: 'unavailable' }));
      
      // Если IP не удалось получить, не пытаемся получить геолокацию
      if (ipResponse.ip === 'unavailable') {
        return;
      }
      
      // Пытаемся получить геолокацию с использованием запасных сервисов
      try {
        // Пробуем первый сервис
        const geoResponse = await fetch(`https://ipapi.co/${ipResponse.ip}/json/`)
          .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch geolocation'));
        
        // Обновляем техническую информацию с данными геолокации
        setTechnicalInfo(prev => ({
          ...prev,
          ip: ipResponse.ip,
          country: geoResponse.country_name || 'unknown',
          city: geoResponse.city || 'unknown',
          region: geoResponse.region || 'unknown',
          isp: geoResponse.org || 'unknown'
        }));
      } catch (geoError) {
        // Если первый сервис не сработал, пробуем запасной
        try {
          const backupGeoResponse = await fetch(`https://ipwho.is/${ipResponse.ip}`)
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch geolocation from backup'));
          
          // Обновляем техническую информацию с данными геолокации из запасного сервиса
          setTechnicalInfo(prev => ({
            ...prev,
            ip: ipResponse.ip,
            country: backupGeoResponse.country || 'unknown',
            city: backupGeoResponse.city || 'unknown',
            region: backupGeoResponse.region || 'unknown',
            isp: backupGeoResponse.connection?.isp || 'unknown'
          }));
        } catch (backupError) {
          // Если и запасной сервис не сработал, устанавливаем только IP
          setTechnicalInfo(prev => ({
            ...prev,
            ip: ipResponse.ip
          }));
          console.warn('Could not fetch geolocation data', backupError);
        }
      }
    } catch (ipError) {
      console.warn('Could not fetch IP address', ipError);
      // Продолжаем работу без IP и геолокации
    }
  };
  
  // Запускаем сбор информации при загрузке компонента
  useEffect(() => {
    // Устанавливаем время начала посещения страницы
    setPageStartTime(Date.now());
    
    // Запускаем сбор технической информации
    collectTechnicalInfo().catch(error => {
      console.warn('Error collecting technical info:', error);
      // В случае ошибки продолжаем работу без технических данных
    });
    
    // Обновляем размер экрана при изменении окна
    const handleResize = () => {
      setTechnicalInfo(prev => ({
        ...prev,
        screen_size: `${window.innerWidth}x${window.innerHeight}`
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Функция для валидации email
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Если были попытки отправки, проверяем валидность в реальном времени
    if (hasAttemptedSubmit) {
      if (name === 'email') {
        setFormErrors(prev => ({
          ...prev,
          [name]: value.trim() === '' || !validateEmail(value)
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          [name]: value.trim() === ''
        }));
      }
    }
  };
  
  // Общая функция для обработки изменения согласия
  const toggleConsent = () => {
    const newValue = !consent;
    setConsent(newValue);
    
    // Сбрасываем ошибку, если чекбокс выбран
    if (newValue) {
      setFormErrors(prev => ({
        ...prev,
        consent: false
      }));
    } else if (hasAttemptedSubmit) {
      // Устанавливаем ошибку только если уже была попытка отправки
      setFormErrors(prev => ({
        ...prev,
        consent: true
      }));
    }
  };
  
  const handleConsentChange = (e) => {
    const isChecked = e.target.checked;
    setConsent(isChecked);
    
    // Всегда сбрасываем ошибку, если чекбокс выбран
    if (isChecked) {
      setFormErrors(prev => ({
        ...prev,
        consent: false
      }));
    } else if (hasAttemptedSubmit) {
      // Устанавливаем ошибку только если уже была попытка отправки
      setFormErrors(prev => ({
        ...prev,
        consent: true
      }));
    }
  };
  
  // Дополнительная функция для закрытия по клику на оверлей
  const closeOnOverlay = (e) => {
    // Проверяем, что клик был на оверлее (не на самом модальном окне)
    if (e.target === e.currentTarget) {
      setShowSuccessModal(false);
    }
  };
  
  // Создаем отдельную функцию для явного управления состоянием модального окна
  const openSuccessModal = () => {
    setShowSuccessModal(true);
  };
  
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };
  
  // Функция валидации перед отправкой формы
  const validateForm = (e) => {
    e.preventDefault();
    
    // Отмечаем, что была попытка отправки
    setHasAttemptedSubmit(true);
    
    // Проверяем все поля
    const errors = {
      name: formData.name.trim() === '',
      email: formData.email.trim() === '' || !validateEmail(formData.email),
      subject: formData.subject.trim() === '',
      message: formData.message.trim() === '',
      consent: !consent
    };
    
    // Обновляем состояние ошибок
    setFormErrors(errors);
    
    // Проверяем, есть ли ошибки
    const hasErrors = Object.values(errors).some(error => error);
    
    if (!hasErrors) {
      // Обновляем время на странице перед отправкой
      const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
      
      // Обновляем техническую информацию с временем на странице
      setTechnicalInfo(prev => ({
        ...prev,
        time_on_page: `${timeOnPage}s`,
        form_submit_date: new Date().toISOString()
      }));
      
      // Если ошибок нет, отправляем форму
      setIsSubmitting(true);

      // Возвращаем реальную отправку на Formspree
      handleSubmit(e)
        .then((response) => {
          setIsSubmitting(false);
        })
        .catch((error) => {
          setIsSubmitting(false);
          alert("Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.");
        });
    } else {
      // Прокручиваем к первому полю с ошибкой
      const errorFields = Object.keys(errors).filter(key => errors[key]);
      
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            element.focus();
          }, 500);
        }
      }
    }
  };
  
  // Анимации
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };
  
  const infoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
  };
  
  const successVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };
  
  // Обработка успешной отправки формы
  useEffect(() => {
    // Проверяем только на успешную отправку, чтобы предотвратить бесконечный цикл
    if (formState.succeeded && !showSuccessModal) {
      // Показываем модальное окно
      openSuccessModal();
      
      // Сбрасываем форму
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setConsent(false);
      
      // Сбрасываем состояние ошибок
      setFormErrors({
        name: false,
        email: false,
        subject: false,
        message: false,
        consent: false
      });
      
      // Сбрасываем попытку отправки
      setHasAttemptedSubmit(false);
      
      // Увеличиваем ключ формы для сброса Formspree
      setFormKey(prevKey => prevKey + 1);
    }
  }, [formState.succeeded, showSuccessModal]);
  
  return (
    <>
      <SEO 
        title={t.contact_page_title} 
        description={t.contact_meta_description}
        image="/images/contact-og-image.jpg"
      />
      
      {/* Модальное окно успешной отправки вне контейнера формы */}
      <AnimatePresence>
        {showSuccessModal && (
          <ModalOverlay 
            key={`modal-overlay-${formKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlay}
          >
            <SuccessMessage
              key={`success-message-${formKey}`}
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на само сообщение
            >
              <SuccessText>{t.success_message}</SuccessText>
              
              {/* Изменение кнопки закрытия для более прямого вызова */}
              <button
                onClick={closeSuccessModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '0.5px solid var(--text-primary)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontFamily: 'Space Grotesk, Jost, sans-serif',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {t.close}
              </button>
            </SuccessMessage>
          </ModalOverlay>
        )}
      </AnimatePresence>
      
      <ContactContainer>
        <TitleContainer>
          <SectionTitle>
            {t.contact_me.title}
          </SectionTitle>
        </TitleContainer>
        
        <ContentContainer>
          <ContactInfoSection>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7 }}
            >
              <ContactText>
                {t.contact_text1}
              </ContactText>
              
              <ContactText>
                {t.contact_text2}
              </ContactText>
            </motion.div>
            
            <InfoContainer>
              <InfoItem
                variants={infoVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.2 }}
              >
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>t.project5585@gmail.com</InfoValue>
              </InfoItem>
              
              <InfoItem
                variants={infoVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.3 }}
              >
                <InfoLabel>{t.phone}:</InfoLabel>
                <InfoValue>+7 (977) 571-20-22</InfoValue>
              </InfoItem>
              
              <InfoItem
                variants={infoVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.4 }}
              >
                <InfoLabel>{t.address}:</InfoLabel>
                <InfoValue>{t.address_value}</InfoValue>
              </InfoItem>
            </InfoContainer>
            
            <SocialIcons>
              <SocialIconBlock
                initial={{ opacity: 0, y: 20 }}
                animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SocialIconLink href="https://t.me/tunk5585" target="_blank" rel="noopener noreferrer">
                  <FaTelegram />
                </SocialIconLink>
              </SocialIconBlock>
              
              <SocialIconBlock
                initial={{ opacity: 0, y: 20 }}
                animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SocialIconLink href="https://instagram.com/tunk5585" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </SocialIconLink>
              </SocialIconBlock>
              
              <SocialIconBlock
                initial={{ opacity: 0, y: 20 }}
                animate={initialLoadComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SocialIconLink href="https://behance.net/username" target="_blank" rel="noopener noreferrer">
                  <FaBehance />
                </SocialIconLink>
              </SocialIconBlock>
            </SocialIcons>
          </ContactInfoSection>
          
          <FormSection>
            <ContactForm
              key={formKey}
              variants={formVariants}
              initial="hidden"
              animate={initialLoadComplete ? "visible" : "hidden"}
              onSubmit={validateForm}
              noValidate
            >
              <FormGroup>
                <Label htmlFor="name">{t.name}</Label>
                <InputWithValidation
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  $hasError={formErrors.name}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <InputWithValidation
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  $hasError={formErrors.email}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="subject">{t.subject}</Label>
                <InputWithValidation
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  $hasError={formErrors.subject}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="message">{t.message}</Label>
                <TextareaWithValidation
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  $hasError={formErrors.message}
                />
              </FormGroup>
              
              <CheckboxContainer $hasError={formErrors.consent}>
                <HiddenCheckbox
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={consent}
                  onChange={handleConsentChange}
                />
                <CustomCheckbox 
                  checked={consent} 
                  onClick={toggleConsent}
                  $hasError={formErrors.consent}
                />
                <CheckboxLabel 
                  htmlFor="consent" 
                  onClick={toggleConsent}
                >
                  {language === 'ru' 
                    ? <>Согласие на обработку персональных данных согласно <StyledLink to="/privacy">Политике конфиденциальности</StyledLink></>
                    : <>Consent to data processing in accordance with the <StyledLink to="/privacy">Privacy Policy</StyledLink></>
                  }
                </CheckboxLabel>
              </CheckboxContainer>
              
              {/* Скрытые поля для технической информации */}
              {Object.entries(technicalInfo).map(([key, value]) => (
                <input
                  key={key}
                  type="hidden"
                  name={`tech_${key}`}
                  value={value || ''}
                />
              ))}
              
              {/* Скрытое поле для передачи информации о согласии на Formspree */}
              <input 
                type="hidden" 
                name="consent_information" 
                value={language === 'ru' 
                  ? `Согласие: ${consent ? 'Да' : 'Нет'}, дата: ${new Date().toISOString()}`
                  : `Consent: ${consent ? 'Yes' : 'No'}, date: ${new Date().toISOString()}`
                } 
              />
              
              <SubmitButton
                type="submit"
                whileHover={{ backgroundColor: 'var(--accent)' }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? t.sending : t.send}
              </SubmitButton>
            </ContactForm>
            <FormBackground />
          </FormSection>
        </ContentContainer>
      </ContactContainer>
    </>
  );
};

export default Contact; 
