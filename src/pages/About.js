import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import AboutImage from '../assets/images/about_img.svg';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 50px;
  
  @media (max-width: 768px) {
    padding-top: 80px;
    padding-bottom: 40px;
  }
`;

const TitleContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
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
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 0 1rem;
  }
`;

const ProfileSection = styled(motion.div)`
  position: relative;
`;

const ProfileImageContainer = styled.div`
  width: 100%;
  height: 500px;
  background-color: #2a2a2a;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    height: 350px;
  }
`;

const ProfileImg = styled.img`
  width: 60%;
  height: 60%;
  object-fit: contain;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 70%;
    height: 70%;
  }
`;

const AsciiFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
  overflow: hidden;
  
  .top, .bottom {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: left;
    white-space: nowrap;
    font-family: monospace;
    font-size: 12px;
    line-height: 1;
    padding: 0 5px;
  }
  
  .top {
    top: 0;
  }
  
  .bottom {
    bottom: 0;
  }
  
  .left, .right {
    position: absolute;
    top: 12px;
    bottom: 12px;
    font-family: monospace;
    font-size: 12px;
    display: block;
  }
  
  .left {
    left: 5px;
  }
  
  .right {
    right: 5px;
  }
  
  /* Вертикальные линии */
  .left::before, .right::before {
    content: "";
    position: absolute;
    width: 1px;
    top: 0;
    bottom: 0;
    background-color: var(--text-primary);
  }
  
  .left::before {
    left: 0;
  }
  
  .right::before {
    right: 0;
  }
  
  /* Символы вертикальных линий */
  .v-symbol {
    position: absolute;
    left: 0;
    transform: translateY(-50%);
  }
`;

const BioSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const BioText = styled(motion.p)`
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

const Highlight = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`;

const SkillsSection = styled(motion.div)`
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

const SkillsTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const SkillItem = styled(motion.div)`
  padding: 10px 15px;
  background-color: rgba(40, 40, 40, 0.5);
  display: flex;
  align-items: center;
  border-left: 3px solid var(--accent);
  
  @media (max-width: 768px) {
    padding: 8px 12px;
  }
`;

const SkillName = styled.span`
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ExperienceSection = styled(motion.div)`
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

const ExperienceTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const TimelineContainer = styled.div`
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 1px;
    background-color: var(--border);
  }
`;

const TimelineItem = styled(motion.div)`
  padding-left: 25px;
  position: relative;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    padding-left: 20px;
    margin-bottom: 25px;
  }
  
  &:before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0;
    width: 11px;
    height: 11px;
    background-color: var(--accent);
  }
`;

const TimelinePeriod = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
`;

const TimelinePosition = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TimelineCompany = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
`;

const TimelineDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

// Добавляем константу для рамки
const frameChar = { 
  horizontal: '═', 
  vertical: '║', 
  topLeft: '╔', 
  topRight: '╗', 
  bottomLeft: '╚', 
  bottomRight: '╝' 
};

// Данные о навыках
const skills = [
  "Графический дизайн",
  "UI/UX дизайн",
  "Брендинг",
  "Типографика",
  "Иллюстрация",
  "Моушн-дизайн",
  "Фотография",
  "Прототипирование"
];

// Данные об опыте
const experience = [
  {
    period: "2022 - наст. время",
    position: "Креативный директор",
    company: "Design Studio XYZ",
    description: "Руководство командой дизайнеров, разработка креативных концепций, взаимодействие с клиентами, контроль качества проектов."
  },
  {
    period: "2019 - 2022",
    position: "Старший UI/UX дизайнер",
    company: "Digital Agency ABC",
    description: "Разработка пользовательских интерфейсов и опыта для веб-сайтов и мобильных приложений, создание прототипов, проведение UX-исследований."
  },
  {
    period: "2017 - 2019",
    position: "Графический дизайнер",
    company: "Brand Studio DEF",
    description: "Разработка визуальной идентичности, создание маркетинговых материалов, дизайн упаковки и печатной продукции."
  }
];

const About = () => {
  const [bioRef, bioInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [skillsRef, skillsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [experienceRef, experienceInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [profileRef, profileInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Позиции для вертикальных символов (в процентах)
  const verticalPositions = [10, 30, 50, 70, 90];
  
  return (
    <AboutContainer>
      <TitleContainer>
        <SectionTitle>
          Обо мне
        </SectionTitle>
      </TitleContainer>
      
      <ContentContainer>
        <ProfileSection 
          ref={profileRef}
          initial={{ opacity: 0, y: 50 }}
          animate={profileInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <ProfileImageContainer>
            <AsciiFrame>
              <div className="top">
                {frameChar.topLeft + frameChar.horizontal.repeat(48) + frameChar.topRight}
              </div>
              
              <div className="left">
                {verticalPositions.map((pos, i) => (
                  <span 
                    key={i} 
                    className="v-symbol" 
                    style={{ top: `${pos}%` }}
                  >
                    {frameChar.vertical}
                  </span>
                ))}
              </div>
              
              <div className="right">
                {verticalPositions.map((pos, i) => (
                  <span 
                    key={i} 
                    className="v-symbol" 
                    style={{ top: `${pos}%` }}
                  >
                    {frameChar.vertical}
                  </span>
                ))}
              </div>
              
              <div className="bottom">
                {frameChar.bottomLeft + frameChar.horizontal.repeat(48) + frameChar.bottomRight}
              </div>
            </AsciiFrame>
            <ProfileImg src={AboutImage} alt="Обо мне" />
          </ProfileImageContainer>
        </ProfileSection>
        
        <BioSection>
          <BioText
            ref={bioRef}
            initial={{ opacity: 0, y: 30 }}
            animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
          >
            Привет! Я <Highlight>креативный дизайнер</Highlight> и арт-директор с более чем 7-летним опытом работы в индустрии. Специализируюсь на создании уникальных визуальных решений, объединяющих функциональность и эстетику.
          </BioText>
          
          <BioText
            initial={{ opacity: 0, y: 30 }}
            animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Мой подход к дизайну основан на <Highlight>глубоком понимании бренда</Highlight> и его аудитории. Я стремлюсь создавать работы, которые не только визуально привлекательны, но и эффективно решают коммуникационные задачи.
          </BioText>
          
          <BioText
            initial={{ opacity: 0, y: 30 }}
            animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Верю, что великий дизайн возникает на пересечении <Highlight>творчества, технологий и человеческих потребностей</Highlight>. Увлечен экспериментами с новыми медиа и техниками, постоянно расширяя границы своих возможностей.
          </BioText>
          
          <SkillsSection
            ref={skillsRef}
            variants={containerVariants}
            initial="hidden"
            animate={skillsInView ? "visible" : "hidden"}
          >
            <SkillsTitle>Навыки</SkillsTitle>
            <SkillsGrid>
              {skills.map((skill, index) => (
                <SkillItem key={index} variants={itemVariants}>
                  <SkillName>{skill}</SkillName>
                </SkillItem>
              ))}
            </SkillsGrid>
          </SkillsSection>
          
          <ExperienceSection
            ref={experienceRef}
            variants={containerVariants}
            initial="hidden"
            animate={experienceInView ? "visible" : "hidden"}
          >
            <ExperienceTitle>Опыт работы</ExperienceTitle>
            <TimelineContainer>
              {experience.map((job, index) => (
                <TimelineItem key={index} variants={itemVariants}>
                  <TimelinePeriod>{job.period}</TimelinePeriod>
                  <TimelinePosition>{job.position}</TimelinePosition>
                  <TimelineCompany>{job.company}</TimelineCompany>
                  <TimelineDescription>{job.description}</TimelineDescription>
                </TimelineItem>
              ))}
            </TimelineContainer>
          </ExperienceSection>
        </BioSection>
      </ContentContainer>
    </AboutContainer>
  );
};

export default About; 
