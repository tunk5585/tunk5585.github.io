import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const PrivacyContainer = styled.div`
  min-height: 100vh;
  padding-top: 124px;
  padding-bottom: 48px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding-top: 88px;
    padding-bottom: 32px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const TitleContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 48px;
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
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled(motion.div)`
  margin-bottom: 2.5rem;
`;

const SectionHeading = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const List = styled.ul`
  margin-left: 2rem;
  margin-bottom: 1.5rem;
`;

const ListItem = styled.li`
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const Privacy = () => {
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7
      }
    }
  };
  
  return (
    <>
      <SEO 
        title={language === 'ru' ? "Политика конфиденциальности" : "Privacy Policy"} 
        description={language === 'ru' ? "Политика обработки персональных данных" : "Personal data processing policy"}
      />
      <PrivacyContainer>
        <TitleContainer>
          <SectionTitle>
            {language === 'ru' ? "Политика конфиденциальности" : "Privacy Policy"}
          </SectionTitle>
        </TitleContainer>
        
        <ContentContainer>
          {language === 'ru' ? (
            // Русская версия
            <>
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.1 }}
              >
                <SectionHeading>1. Общие положения</SectionHeading>
                <Paragraph>
                  Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона 
                  от 27.07.2006 №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по 
                  обеспечению безопасности персональных данных.
                </Paragraph>
                <Paragraph>
                  Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод 
                  человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность 
                  частной жизни, личную и семейную тайну.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.2 }}
              >
                <SectionHeading>2. Основные понятия, используемые в Политике</SectionHeading>
                <Paragraph>
                  Персональные данные – любая информация, относящаяся к прямо или косвенно определенному или определяемому 
                  физическому лицу (субъекту персональных данных).
                </Paragraph>
                <Paragraph>
                  Обработка персональных данных – любое действие (операция) или совокупность действий (операций), совершаемых 
                  с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, 
                  запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу 
                  (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.3 }}
              >
                <SectionHeading>3. Собираемые данные</SectionHeading>
                <Paragraph>
                  При заполнении формы обратной связи на сайте, мы собираем следующие персональные данные:
                </Paragraph>
                <List>
                  <ListItem>Имя</ListItem>
                  <ListItem>Адрес электронной почты</ListItem>
                  <ListItem>Тема сообщения</ListItem>
                  <ListItem>Текст сообщения</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.4 }}
              >
                <SectionHeading>4. Цели обработки персональных данных</SectionHeading>
                <Paragraph>
                  Персональные данные обрабатываются в следующих целях:
                </Paragraph>
                <List>
                  <ListItem>Обработка входящих запросов от пользователей с целью консультирования и связи с пользователем</ListItem>
                  <ListItem>Отправка ответов на запросы пользователя</ListItem>
                  <ListItem>Предоставление пользователям информации об услугах, проектах и т.д.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.5 }}
              >
                <SectionHeading>5. Правовые основания обработки персональных данных</SectionHeading>
                <Paragraph>
                  Обработка персональных данных осуществляется на основе следующих принципов:
                </Paragraph>
                <List>
                  <ListItem>Обработка персональных данных осуществляется на законной и справедливой основе</ListItem>
                  <ListItem>Обработка персональных данных ограничивается достижением конкретных, заранее определенных и законных целей</ListItem>
                  <ListItem>Не допускается обработка персональных данных, несовместимая с целями сбора персональных данных</ListItem>
                </List>
                <Paragraph>
                  Правовым основанием обработки персональных данных является согласие субъекта персональных данных на обработку 
                  его персональных данных.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.6 }}
              >
                <SectionHeading>6. Трансграничная передача данных</SectionHeading>
                <Paragraph>
                  При использовании формы обратной связи на сайте, персональные данные передаются для обработки на серверы 
                  сервиса Formspree, который расположен за пределами территории Российской Федерации. Отправляя форму, 
                  пользователь соглашается на такую трансграничную передачу данных.
                </Paragraph>
                <Paragraph>
                  Оператор принимает все необходимые меры для защиты персональных данных при их трансграничной передаче, 
                  в том числе путем заключения соответствующих соглашений с получателями.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.7 }}
              >
                <SectionHeading>7. Права субъекта персональных данных</SectionHeading>
                <Paragraph>
                  Субъект персональных данных имеет право:
                </Paragraph>
                <List>
                  <ListItem>Получать информацию, касающуюся обработки его персональных данных</ListItem>
                  <ListItem>Требовать уточнения его персональных данных, их блокирования или уничтожения</ListItem>
                  <ListItem>Отозвать свое согласие на обработку персональных данных</ListItem>
                  <ListItem>Обжаловать действия или бездействие оператора в уполномоченный орган по защите прав субъектов персональных данных или в судебном порядке</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.8 }}
              >
                <SectionHeading>8. Контактная информация</SectionHeading>
                <Paragraph>
                  По всем вопросам, связанным с обработкой персональных данных, можно обращаться по электронной почте: 
                  t.project5585@gmail.com
                </Paragraph>
              </Section>
            </>
          ) : (
            // Английская версия
            <>
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.1 }}
              >
                <SectionHeading>1. General provisions</SectionHeading>
                <Paragraph>
                  This personal data processing policy has been compiled in accordance with the requirements of Federal Law No. 152-FZ 
                  dated July 27, 2006 "On Personal Data" and defines the procedure for processing personal data and measures to ensure 
                  the security of personal data.
                </Paragraph>
                <Paragraph>
                  The operator considers its most important goal and condition for carrying out its activities to be the observance of 
                  human and civil rights and freedoms when processing their personal data, including protection of the rights to privacy, 
                  personal and family secrets.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.2 }}
              >
                <SectionHeading>2. Basic concepts used in the Policy</SectionHeading>
                <Paragraph>
                  Personal data - any information relating directly or indirectly to a specific or identifiable individual (personal data subject).
                </Paragraph>
                <Paragraph>
                  Processing of personal data - any action (operation) or a set of actions (operations) performed with or without the use 
                  of automation tools with personal data, including collection, recording, systematization, accumulation, storage, 
                  clarification (updating, modification), extraction, use, transfer (distribution, provision, access), depersonalization, 
                  blocking, deletion, destruction of personal data.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.3 }}
              >
                <SectionHeading>3. Data collected</SectionHeading>
                <Paragraph>
                  When filling out the feedback form on the site, we collect the following personal data:
                </Paragraph>
                <List>
                  <ListItem>Name</ListItem>
                  <ListItem>Email address</ListItem>
                  <ListItem>Subject of the message</ListItem>
                  <ListItem>Message text</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.4 }}
              >
                <SectionHeading>4. Purposes of personal data processing</SectionHeading>
                <Paragraph>
                  Personal data is processed for the following purposes:
                </Paragraph>
                <List>
                  <ListItem>Processing incoming requests from users in order to consult and communicate with the user</ListItem>
                  <ListItem>Sending responses to user requests</ListItem>
                  <ListItem>Providing users with information about services, projects, etc.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.5 }}
              >
                <SectionHeading>5. Legal grounds for personal data processing</SectionHeading>
                <Paragraph>
                  Personal data is processed based on the following principles:
                </Paragraph>
                <List>
                  <ListItem>Processing of personal data is carried out on a legal and fair basis</ListItem>
                  <ListItem>Processing of personal data is limited to achieving specific, predetermined and legitimate purposes</ListItem>
                  <ListItem>Processing of personal data that is incompatible with the purposes of collecting personal data is not allowed</ListItem>
                </List>
                <Paragraph>
                  The legal basis for the processing of personal data is the consent of the personal data subject to the processing of his personal data.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.6 }}
              >
                <SectionHeading>6. Cross-border data transfer</SectionHeading>
                <Paragraph>
                  When using the feedback form on the site, personal data is transferred for processing to the servers 
                  of the Formspree service, which is located outside the territory of the Russian Federation. By submitting the form, 
                  the user agrees to such cross-border data transfer.
                </Paragraph>
                <Paragraph>
                  The operator takes all necessary measures to protect personal data during their cross-border transfer, 
                  including by concluding appropriate agreements with recipients.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.7 }}
              >
                <SectionHeading>7. Rights of the personal data subject</SectionHeading>
                <Paragraph>
                  The personal data subject has the right to:
                </Paragraph>
                <List>
                  <ListItem>Receive information regarding the processing of his personal data</ListItem>
                  <ListItem>Require clarification of his personal data, their blocking or destruction</ListItem>
                  <ListItem>Withdraw consent to the processing of personal data</ListItem>
                  <ListItem>Appeal against actions or inaction of the operator to the authorized body for the protection of the rights of personal data subjects or in court</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.8 }}
              >
                <SectionHeading>8. Contact information</SectionHeading>
                <Paragraph>
                  For all questions related to the processing of personal data, you can contact by email: 
                  t.project5585@gmail.com
                </Paragraph>
              </Section>
            </>
          )}
        </ContentContainer>
      </PrivacyContainer>
    </>
  );
};

export default Privacy; 