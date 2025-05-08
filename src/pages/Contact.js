import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTelegram, FaInstagram, FaBehance } from 'react-icons/fa';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';
import SEO from '../components/SEO';

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
  gap: 48px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const ContactInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

const InfoItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
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
  gap: 1.5rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    margin-top: 2rem;
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
    margin-top: 1rem;
    padding-right: 15px;
  }
  
  @media (max-width: 480px) {
    padding-right: 10px;
  }
`;

const ContactForm = styled(motion.form)`
  padding: 2rem;
  background-color: rgba(30, 30, 30, 0.3);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.2rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
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
  border: 1px solid var(--border);
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
  border: 1px solid var(--border);
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
  margin-top: 1rem;
  
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

const SuccessMessage = styled(motion.div)`
  background-color: rgba(30, 30, 30, 0.9);
  border: 1px solid var(--border);
  padding: 2rem;
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const SuccessText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const CloseButton = styled(motion.button)`
  padding: 8px 16px;
  background-color: transparent;
  border: 0.5px solid var(--text-primary);
  color: var(--text-primary);
  font-family: 'Space Grotesk', 'Jost', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent);
  }
`;

const Contact = () => {
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // В реальном проекте здесь был бы код для отправки формы
    // Имитация успешной отправки
    console.log(formData);
    setShowSuccess(true);
  };
  
  const closeSuccess = () => {
    setShowSuccess(false);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7
      }
    }
  };
  
  const infoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7
      }
    }
  };
  
  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <ContactContainer>
      <SEO 
        title="TUNK5585 | Contact" 
        description="Look, enjoy, cooperate."
      />
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
            variants={formVariants}
            initial="hidden"
            animate={initialLoadComplete ? "visible" : "hidden"}
            onSubmit={handleSubmit}
          >
            <FormGroup>
              <Label htmlFor="name">{t.name}</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="subject">{t.subject}</Label>
              <Input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="message">{t.message}</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.send}
            </SubmitButton>
            
            {showSuccess && (
              <SuccessMessage
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SuccessText>{t.success_message}</SuccessText>
                <CloseButton
                  onClick={closeSuccess}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.close}
                </CloseButton>
              </SuccessMessage>
            )}
          </ContactForm>
          <FormBackground />
        </FormSection>
      </ContentContainer>
    </ContactContainer>
  );
};

export default Contact; 
