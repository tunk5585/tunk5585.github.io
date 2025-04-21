import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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
  background-color: transparent;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    height: 350px;
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

const AsciiArt = styled.pre`
  font-family: monospace;
  font-size: 0.35rem;
  line-height: 0.35rem;
  white-space: pre;
  overflow: auto;
  color: var(--text-primary);
  padding: 1rem;
  box-sizing: border-box;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
  @media (max-width: 768px) {
    font-size: 0.25rem;
    line-height: 0.25rem;
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
  margin-bottom: 3rem;
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
  gap: 1.5rem;
  
  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const SkillItem = styled(motion.div)`
  padding: 10px 15px;
  background-color: rgba(40, 40, 40, 0.5);
  position: relative;
  display: flex;
  align-items: center;
  border-left: 3px solid var(--accent);
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
  }
  
  @media (max-width: 500px) {
    padding: 6px 10px;
    min-height: 32px;
  }
`;

const SkillProgress = styled(motion.div)`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$level}%;
  background-color: rgba(255, 255, 255, 0.07);
  z-index: 0;
`;

const SkillName = styled.span`
  font-size: 1rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 500px) {
    font-size: 0.8rem;
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

// Данные о навыках с процентами владения
const skills = [
  { name: "Графический дизайн", level: 95 },
  { name: "UI/UX дизайн", level: 90 },
  { name: "Брендинг", level: 85 },
  { name: "Типографика", level: 88 },
  { name: "Иллюстрация", level: 75 },
  { name: "Моушн-дизайн", level: 70 },
  { name: "Фотография", level: 80 },
  { name: "Прототипирование", level: 65 }
];

// Личные качества
const personalQualities = [
  { name: "Креативность", level: 95 },
  { name: "Смекалка", level: 90 },
  { name: "Любопытство", level: 95 },
  { name: "Пунктуальность", level: 85 },
  { name: "Адаптивность", level: 80 },
  { name: "Участие", level: 85 }
];

// Данные об опыте
const experience = [
  {
    period: "Февраль 2023 — наст. время",
    position: "Арт-директор",
    company: "Self-Employed / Freelance",
    description: "Управление творческими проектами, разработка визуальных концепций и арт‑дирекшн кампаний."
  },
  {
    period: "Январь 2019 — наст. время",
    position: "Графический дизайнер",
    company: "Self-Employed / Freelance",
    description: "Создание технических дизайнов и верстка полиграфической продукции, контроль качества макетов."
  },
  {
    period: "Октябрь 2021 — Август 2022",
    position: "Ассистент руководителя отдела \"Новых клиентов\"",
    company: "Digital Agency / DxB",
    description: "Брифинг, эскизы и сметы, сбор данных, общение с клиентом и отчёты"
  }
];

const ChartContainer = styled(motion.div)`
  width: 100%;
  height: 300px;
  margin-top: 1rem;
`;

const About = () => {
  const [bioRef, bioInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [skillsRef, skillsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const [qualitiesRef, qualitiesInView] = useInView({
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
  
  const [asciiArt, setAsciiArt] = useState('');
  useEffect(() => {
    fetch('/ascii.txt')
      .then(res => res.text())
      .then(text => setAsciiArt(text))
      .catch(console.error);
  }, []);
  
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
  
  // Данные и настройки для Radar Chart личных качеств
  const qualitiesChartData = {
    labels: personalQualities.map(q => q.name),
    datasets: [{
      label: 'Личные качества',
      data: personalQualities.map(q => q.level),
      backgroundColor: 'rgba(160, 160, 160, 0.2)',
      borderColor: 'rgb(133, 133, 133)',
      borderWidth: 1,
      borderDash: [5, 5],
      tension: 0.4,
      pointBackgroundColor: 'rgb(188, 188, 188)',
    }]
  };
  const qualitiesChartOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 55, display: false },
        angleLines: { color: 'rgba(200, 200, 200, 0.3)' },
        grid: { color: 'rgba(200, 200, 200, 0.3)' },
        pointLabels: { color: '#ffffff', font: { size: 12 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } }
    },
    maintainAspectRatio: false
  };

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
                  <span key={i} className="v-symbol" style={{ top: `${pos}%` }}>
                    {frameChar.vertical}
                  </span>
                ))}
              </div>
              <div className="right">
                {verticalPositions.map((pos, i) => (
                  <span key={i} className="v-symbol" style={{ top: `${pos}%` }}>
                    {frameChar.vertical}
                  </span>
                ))}
              </div>
              <div className="bottom">
                {frameChar.bottomLeft + frameChar.horizontal.repeat(48) + frameChar.bottomRight}
              </div>
            </AsciiFrame>
            <AsciiArt>
              {asciiArt}
            </AsciiArt>
          </ProfileImageContainer>
        </ProfileSection>
        
        <BioSection>
          <BioText
            ref={bioRef}
            initial={{ opacity: 0, y: 30 }}
            animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
          >
            Привет! Меня зовут <Highlight>Толя — креативный дизайнер и арт‑директор</Highlight> с более чем пятилетним опытом создания визуальных коммуникаций, где <Highlight>эстетика</Highlight> органично сочетается с <Highlight>функциональностью</Highlight>.
          </BioText>
          <BioText
            initial={{ opacity: 0, y: 30 }}
            animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Мой подход базируется на <Highlight>глубоком анализе задач бренда и изучении его аудитории</Highlight>: это позволяет создавать <Highlight>решения</Highlight>, которые действительно работают на достижение <Highlight>бизнес‑целей</Highlight>. Я регулярно тестирую новые форматы и техники, чтобы внедрять свежие и нестандартные решения.
          </BioText>
          <BioText
            initial={{ opacity: 0, y: 30 }}
            animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Вне работы я не стою на месте: изучаю маркетинговые тренды и погружаюсь в менеджмент, осваиваю хард‑скиллы. <Highlight>Интегрирую</Highlight> всё самое свежее в свой воркфлоу. С широко раскрытыми глазами открываю для себя <Highlight>будущее</Highlight>, в котором уже живём.
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
                  <SkillProgress 
                    $level={skill.level}
                    initial={{ width: 0 }}
                    animate={skillsInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  />
                  <SkillName>{skill.name}</SkillName>
                </SkillItem>
              ))}
            </SkillsGrid>
          </SkillsSection>
          
          <SkillsSection
            ref={qualitiesRef}
            variants={containerVariants}
            initial="hidden"
            animate={qualitiesInView ? "visible" : "hidden"}
            style={{ marginTop: '2.5rem' }}
          >
            <SkillsTitle>Личные качества</SkillsTitle>
            <ChartContainer
              initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
              animate={qualitiesInView ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.7, opacity: 0, rotate: -10 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Radar data={qualitiesChartData} options={qualitiesChartOptions} />
            </ChartContainer>
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
