import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

const TermsContainer = styled.div`
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

const Terms = () => {
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
        title={language === 'ru' ? "Пользовательское соглашение" : "Terms of Use"} 
        description={language === 'ru' ? "Условия использования сайта" : "Website terms of use"}
      />
      <TermsContainer>
        <TitleContainer>
          <SectionTitle>
            {language === 'ru' ? "Пользовательское соглашение" : "Terms of Use"}
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
                  Настоящее Пользовательское соглашение (далее — «Соглашение») определяет условия использования сайта, 
                  размещенного в сети Интернет по адресу: tunk5585.github.io (далее — «Сайт»).
                </Paragraph>
                <Paragraph>
                  Владельцем Сайта является физическое лицо, контактный e-mail: t.project5585@gmail.com (далее — «Владелец»).
                </Paragraph>
                <Paragraph>
                  Настоящее Соглашение является публичной офертой. Используя Сайт, Вы подтверждаете, что ознакомились, 
                  поняли и согласны соблюдать условия настоящего Соглашения.
                </Paragraph>
                <Paragraph>
                  Настоящее Соглашение действует с 9 мая 2025 года.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.2 }}
              >
                <SectionHeading>2. Права и обязанности Пользователя</SectionHeading>
                <Paragraph>
                  При использовании Сайта Пользователь обязуется:
                </Paragraph>
                <List>
                  <ListItem>Соблюдать положения действующего законодательства Российской Федерации и настоящего Соглашения;</ListItem>
                  <ListItem>Не распространять информацию, которая является незаконной, вредоносной, оскорбительной, нарушающей права третьих лиц;</ListItem>
                  <ListItem>Не предпринимать действий, которые могут нарушить нормальную работу Сайта;</ListItem>
                  <ListItem>Не использовать Сайт для распространения рекламной информации без согласия Владельца;</ListItem>
                  <ListItem>Не копировать, не воспроизводить, не изменять, не распространять и не представлять общественности контент Сайта без предварительного письменного разрешения Владельца.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.3 }}
              >
                <SectionHeading>3. Права Владельца Сайта</SectionHeading>
                <Paragraph>
                  Владелец Сайта имеет право:
                </Paragraph>
                <List>
                  <ListItem>В любое время изменять, дополнять или обновлять содержание Сайта без предварительного уведомления Пользователя;</ListItem>
                  <ListItem>Изменять оформление Сайта, его функциональные возможности;</ListItem>
                  <ListItem>Приостанавливать работу Сайта для проведения технических работ;</ListItem>
                  <ListItem>Блокировать доступ к Сайту для Пользователей, нарушающих условия настоящего Соглашения;</ListItem>
                  <ListItem>Изменять условия настоящего Соглашения в одностороннем порядке, с обязательным размещением новой редакции на Сайте.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.4 }}
              >
                <SectionHeading>4. Ограничение ответственности</SectionHeading>
                <Paragraph>
                  Владелец Сайта не несет ответственности:
                </Paragraph>
                <List>
                  <ListItem>За любые действия Пользователя, связанные с использованием предоставленных прав использования Сайта;</ListItem>
                  <ListItem>За ущерб любого рода, понесенный Пользователем из-за потери своих данных, или в результате разглашения Пользователем своих данных третьим лицам;</ListItem>
                  <ListItem>За содержание и законность, достоверность информации, используемой/получаемой Пользователем на Сайте;</ListItem>
                  <ListItem>За качество товаров/работ/услуг третьих лиц, информация о которых размещена на Сайте;</ListItem>
                  <ListItem>За прямой или косвенный ущерб и упущенную выгоду, причиненные Пользователю в результате использования или невозможности использования Сайта;</ListItem>
                  <ListItem>За работоспособность и совместимость программного обеспечения Пользователя с программным и аппаратным обеспечением Сайта;</ListItem>
                  <ListItem>За работу сторонних сервисов, используемых на Сайте, включая, но не ограничиваясь сервисом обработки форм Formspree.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.5 }}
              >
                <SectionHeading>5. Интеллектуальная собственность</SectionHeading>
                <Paragraph>
                  Весь контент, размещенный на Сайте, включая, но не ограничиваясь текстами, графическими изображениями, 
                  фотографиями, видео, программным обеспечением, музыкой, звуками и другими объектами, 
                  а также дизайн Сайта являются объектами интеллектуальной собственности Владельца Сайта 
                  или третьих лиц, и охраняются в соответствии с законодательством РФ и международными соглашениями 
                  в области интеллектуальной собственности.
                </Paragraph>
                <Paragraph>
                  Любое использование объектов интеллектуальной собственности, размещенных на Сайте, 
                  без предварительного письменного разрешения Владельца Сайта или правообладателя запрещено.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.6 }}
              >
                <SectionHeading>6. Заключительные положения</SectionHeading>
                <Paragraph>
                  Настоящее Соглашение составляет соглашение между Пользователем и Владельцем Сайта относительно порядка 
                  использования Сайта и заменяет собой все предыдущие соглашения между Пользователем и Владельцем.
                </Paragraph>
                <Paragraph>
                  Настоящее Соглашение регулируется и толкуется в соответствии с законодательством Российской Федерации. 
                  Вопросы, не урегулированные настоящим Соглашением, подлежат разрешению в соответствии с законодательством 
                  Российской Федерации.
                </Paragraph>
                <Paragraph>
                  Если по тем или иным причинам одно или несколько положений настоящего Соглашения будут признаны 
                  недействительными или не имеющими юридической силы, это не оказывает влияния на действительность 
                  или применимость остальных положений.
                </Paragraph>
                <Paragraph>
                  В случае возникновения споров или разногласий, связанных с исполнением настоящего Соглашения, 
                  Пользователь и Владелец Сайта приложат все усилия для их разрешения путем проведения переговоров. 
                  В случае если споры не будут разрешены путем переговоров, они подлежат разрешению в порядке, 
                  установленном действующим законодательством Российской Федерации.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.7 }}
              >
                <SectionHeading>7. Контактная информация</SectionHeading>
                <Paragraph>
                  По всем вопросам, связанным с использованием Сайта, можно обращаться по электронной почте: 
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
                  This Terms of Use Agreement (hereinafter referred to as the "Agreement") defines the terms of use of the website 
                  located on the Internet at: tunk5585.github.io (hereinafter referred to as the "Website").
                </Paragraph>
                <Paragraph>
                  The owner of the Website is an individual, contact e-mail: t.project5585@gmail.com (hereinafter referred to as the "Owner").
                </Paragraph>
                <Paragraph>
                  This Agreement is a public offer. By using the Website, you confirm that you have read, 
                  understood and agree to comply with the terms of this Agreement.
                </Paragraph>
                <Paragraph>
                  This Agreement is effective from May 9, 2025.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.2 }}
              >
                <SectionHeading>2. Rights and obligations of the User</SectionHeading>
                <Paragraph>
                  When using the Website, the User agrees to:
                </Paragraph>
                <List>
                  <ListItem>Comply with the provisions of the current legislation of the Russian Federation and this Agreement;</ListItem>
                  <ListItem>Not distribute information that is illegal, harmful, offensive, violating the rights of third parties;</ListItem>
                  <ListItem>Not take actions that may disrupt the normal operation of the Website;</ListItem>
                  <ListItem>Not use the Website to distribute advertising information without the consent of the Owner;</ListItem>
                  <ListItem>Not copy, reproduce, modify, distribute or present to the public the content of the Website without the prior written permission of the Owner.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.3 }}
              >
                <SectionHeading>3. Rights of the Website Owner</SectionHeading>
                <Paragraph>
                  The Website Owner has the right to:
                </Paragraph>
                <List>
                  <ListItem>At any time change, supplement or update the content of the Website without prior notice to the User;</ListItem>
                  <ListItem>Change the design of the Website, its functionality;</ListItem>
                  <ListItem>Suspend the operation of the Website for technical work;</ListItem>
                  <ListItem>Block access to the Website for Users who violate the terms of this Agreement;</ListItem>
                  <ListItem>Change the terms of this Agreement unilaterally, with the mandatory posting of a new version on the Website.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.4 }}
              >
                <SectionHeading>4. Limitation of liability</SectionHeading>
                <Paragraph>
                  The Website Owner is not responsible for:
                </Paragraph>
                <List>
                  <ListItem>Any actions of the User related to the use of the rights granted to use the Website;</ListItem>
                  <ListItem>Damage of any kind suffered by the User due to the loss of their data, or as a result of the User's disclosure of their data to third parties;</ListItem>
                  <ListItem>The content and legality, accuracy of information used/received by the User on the Website;</ListItem>
                  <ListItem>The quality of goods/works/services of third parties, information about which is posted on the Website;</ListItem>
                  <ListItem>Direct or indirect damage and lost profits caused to the User as a result of using or inability to use the Website;</ListItem>
                  <ListItem>The performance and compatibility of the User's software with the software and hardware of the Website;</ListItem>
                  <ListItem>The operation of third-party services used on the Website, including, but not limited to, the Formspree form processing service.</ListItem>
                </List>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.5 }}
              >
                <SectionHeading>5. Intellectual property</SectionHeading>
                <Paragraph>
                  All content posted on the Website, including, but not limited to, texts, graphic images, 
                  photographs, videos, software, music, sounds and other objects, 
                  as well as the design of the Website are objects of intellectual property of the Website Owner 
                  or third parties, and are protected in accordance with the legislation of the Russian Federation and international agreements 
                  in the field of intellectual property.
                </Paragraph>
                <Paragraph>
                  Any use of intellectual property objects posted on the Website 
                  without the prior written permission of the Website Owner or the copyright holder is prohibited.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.6 }}
              >
                <SectionHeading>6. Final provisions</SectionHeading>
                <Paragraph>
                  This Agreement constitutes an agreement between the User and the Website Owner regarding the procedure 
                  for using the Website and replaces all previous agreements between the User and the Owner.
                </Paragraph>
                <Paragraph>
                  This Agreement is governed by and construed in accordance with the laws of the Russian Federation. 
                  Issues not regulated by this Agreement shall be resolved in accordance with the legislation 
                  of the Russian Federation.
                </Paragraph>
                <Paragraph>
                  If for one reason or another, one or more provisions of this Agreement are recognized 
                  invalid or not legally binding, this does not affect the validity 
                  or applicability of the remaining provisions.
                </Paragraph>
                <Paragraph>
                  In the event of disputes or disagreements related to the implementation of this Agreement, 
                  the User and the Website Owner will make every effort to resolve them through negotiations. 
                  If the disputes are not resolved through negotiations, they shall be resolved in the manner 
                  established by the current legislation of the Russian Federation.
                </Paragraph>
              </Section>
              
              <Section
                variants={sectionVariants}
                initial="hidden"
                animate={initialLoadComplete ? "visible" : "hidden"}
                transition={{ delay: 0.7 }}
              >
                <SectionHeading>7. Contact information</SectionHeading>
                <Paragraph>
                  For all questions related to the use of the Website, you can contact us by email: 
                  t.project5585@gmail.com
                </Paragraph>
              </Section>
            </>
          )}
        </ContentContainer>
      </TermsContainer>
    </>
  );
};

export default Terms; 