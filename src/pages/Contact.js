import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ContactContainer = styled.div`
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 50px;
`;

const SectionTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: -1px;
  
  .accent {
    display: inline-block;
    position: relative;
    
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: var(--text-primary);
    }
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
`;

const InfoContainer = styled.div`
  margin-top: 3rem;
`;

const InfoItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-right: 1rem;
  width: 80px;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
`;

const AsciiArt = styled.pre`
  font-family: monospace;
  font-size: 12px;
  line-height: 1;
  white-space: pre;
  color: var(--text-primary);
  margin-top: 3rem;
  opacity: 0.5;
`;

const FormSection = styled.div`
  position: relative;
`;

const ContactForm = styled(motion.form)`
  padding: 2rem;
  background-color: rgba(30, 30, 30, 0.3);
  position: relative;
  z-index: 1;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  
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
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--text-secondary);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 12px 24px;
  background-color: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
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
`;

const SuccessText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled(motion.button)`
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid var(--text-primary);
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--accent);
  }
`;

// ASCII арт для контактов
const contactAscii = `
  _______  _______  _        _______  _______  _______ _________
 (  ____ \\(  ___  )( (    /|(  ____ \\(  ___  )(  ____ \\\\__   __/
 | (    \\/| (   ) ||  \\  ( || (    \\/| (   ) || (    \\/   ) (   
 | |      | |   | ||   \\ | || (_____ | (___) || |         | |   
 | |      | |   | || (\\ \\) |(_____  )|  ___  || |         | |   
 | |      | |   | || | \\   |      ) || (   ) || |         | |   
 | (____/\\| (___) || )  \\  |/\\____) || )   ( || (____/\\   | |   
 (_______/(_______)|/    )_)\\_______)|/     \\|(_______/   )_(   
`;

const Contact = () => {
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
      <SectionTitle>
        <span className="accent">Свяжитесь</span> со мной
      </SectionTitle>
      
      <ContentContainer>
        <ContactInfoSection>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <ContactText>
              Если у вас есть вопросы о моих услугах, предложения о сотрудничестве или вы хотите обсудить ваш проект, пожалуйста, свяжитесь со мной любым удобным способом.
            </ContactText>
            
            <ContactText>
              Я всегда открыт для интересных и креативных проектов, и буду рад обсудить, как мой опыт может помочь в реализации ваших идей.
            </ContactText>
          </motion.div>
          
          <InfoContainer>
            <InfoItem
              variants={infoVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>creative.director@example.com</InfoValue>
            </InfoItem>
            
            <InfoItem
              variants={infoVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <InfoLabel>Телефон:</InfoLabel>
              <InfoValue>+7 (123) 456-78-90</InfoValue>
            </InfoItem>
            
            <InfoItem
              variants={infoVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <InfoLabel>Адрес:</InfoLabel>
              <InfoValue>г. Москва, ул. Креативная, д. 42</InfoValue>
            </InfoItem>
          </InfoContainer>
          
          <AsciiArt>
            {contactAscii}
          </AsciiArt>
        </ContactInfoSection>
        
        <FormSection>
          <ContactForm
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
          >
            <FormGroup>
              <Label htmlFor="name">Имя</Label>
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
              <Label htmlFor="subject">Тема</Label>
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
              <Label htmlFor="message">Сообщение</Label>
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
              Отправить
            </SubmitButton>
            
            {showSuccess && (
              <SuccessMessage
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SuccessText>Спасибо за сообщение! Я свяжусь с вами в ближайшее время.</SuccessText>
                <CloseButton
                  onClick={closeSuccess}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Закрыть
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