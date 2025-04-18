import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ProjectsContainer = styled.div`
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

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.$active ? 'var(--text-primary)' : 'var(--border)'};
  color: ${props => props.$active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: ${props => props.$active ? 'transparent' : 'var(--accent)'};
    color: var(--text-primary);
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled(motion.div)`
  position: relative;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  
  &:hover .project-info {
    opacity: 1;
  }
  
  &:hover .project-image {
    transform: scale(1.05);
  }
  
  &:hover .ascii-overlay {
    opacity: 0.7;
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 100%;
  background-color: #252525;
  position: relative;
  transition: transform 0.5s ease;
`;

const AsciiOverlay = styled.pre`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  line-height: 1;
  color: var(--text-primary);
  padding: 10px;
  white-space: pre;
  user-select: none;
  z-index: 1;
`;

const ProjectInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 5px;
`;

const ProjectCategory = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
`;

const ProjectDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0;
`;

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  max-width: 900px;
  width: 100%;
  background-color: var(--main-bg);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid var(--border);
`;

const ModalTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const ModalCategory = styled.span`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const ModalBody = styled.div`
  padding: 2rem;
  flex: 1;
`;

const ModalDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
`;

const ModalImageContainer = styled.div`
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
`;

const ModalImage = styled.div`
  width: 100%;
  height: 400px;
  background-color: #252525;
  position: relative;
`;

const ModalDetails = styled.div`
  margin-top: 2rem;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DetailLabel = styled.div`
  flex: 0 0 150px;
  color: var(--text-secondary);
  
  @media (max-width: 768px) {
    margin-bottom: 0.5rem;
  }
`;

const DetailValue = styled.div`
  flex: 1;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-primary);
  z-index: 10;
`;

// ASCII арт для проектов
const generateProjectAscii = (index) => {
  const ascii = [
    `
█▀▀█ █▀▀█ █▀▀█ ░░▀ █▀▀ █▀▀ ▀▀█▀▀
█░░█ █▄▄▀ █░░█ ░░█ █▀▀ █░░ ░░█░░
▀▀▀▀ ▀░▀▀ ▀▀▀▀ █▄█ ▀▀▀ ▀▀▀ ░░▀░░`,
    `
▓▓▓▓ ▓▓▓▓ ▓▓▓▓ ▓▓▓▓ ▓▓▓▓ ▓▓▓▓ ▓▓▓▓
▓▓▒▒ ▓▓▒▒ ▓▓▒▒ ▓▓▒▒ ▓▓▒▒ ▓▓▒▒ ▓▓▒▒
▒▒░░ ▒▒░░ ▒▒░░ ▒▒░░ ▒▒░░ ▒▒░░ ▒▒░░
░░   ░░   ░░   ░░   ░░   ░░   ░░  `,
    `
╔══╗╔══╗╔══╗╔══╗╔══╗╔══╗
║  ║║  ║║  ║║  ║║  ║║  ║
╚══╝╚══╝╚══╝╚══╝╚══╝╚══╝`,
    `
┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐
│ ││ ││ ││ ││ ││ │
└─┘└─┘└─┘└─┘└─┘└─┘`
  ];
  
  return ascii[index % ascii.length];
};

// Данные проектов
const projects = [
  {
    id: 1,
    title: "Ребрендинг Fusion",
    category: "Брендинг",
    description: "Полное обновление визуальной идентичности для технологической компании.",
    longDescription: "Проект ребрендинга для технологической компании Fusion включал в себя разработку нового логотипа, цветовой палитры, типографики и набора графических элементов. Основной задачей было создать современный и технологичный образ, который бы отражал инновационный дух компании и её продуктов. В результате была создана гибкая система визуальной идентичности, которая легко адаптируется для различных носителей — от цифровых до печатных.",
    client: "Fusion Technologies",
    year: "2023",
    role: "Креативный директор, дизайнер"
  },
  {
    id: 2,
    title: "Имерсивный опыт Neon Dreams",
    category: "Интерактивный дизайн",
    description: "Создание иммерсивной цифровой инсталляции для музея современного искусства.",
    longDescription: "Neon Dreams — это цифровая инсталляция, созданная для музея современного искусства, которая погружает посетителей в интерактивное пространство, реагирующее на их движения и звуки. Проект объединяет визуальное искусство, технологии и звуковой дизайн, создавая уникальное пространство, где каждый посетитель становится соавтором произведения. Инсталляция использует проекционное картирование, датчики движения и алгоритмы машинного обучения для создания персонализированного опыта для каждого зрителя.",
    client: "Музей современного искусства",
    year: "2022",
    role: "Арт-директор, UX дизайнер"
  },
  {
    id: 3,
    title: "Упаковка EcoSphere",
    category: "Упаковка",
    description: "Экологичная упаковка для линейки органических продуктов.",
    longDescription: "Проект упаковки для линейки органических продуктов EcoSphere был разработан с фокусом на экологичность и устойчивое развитие. Весь дизайн основан на концепции минимализма, используя переработанные материалы и биоразлагаемые чернила. Визуальный язык упаковки подчеркивает натуральность продуктов, используя тактильные текстуры и изображения ингредиентов в минималистичном стиле. Проект получил награду за инновационный подход к экологичному дизайну.",
    client: "EcoSphere Organics",
    year: "2023",
    role: "Дизайнер упаковки"
  },
  {
    id: 4,
    title: "Веб-платформа Quantum",
    category: "Веб-дизайн",
    description: "Интерактивная веб-платформа для образовательных онлайн-курсов.",
    longDescription: "Quantum — это инновационная веб-платформа для образовательных онлайн-курсов, которая создает персонализированный опыт обучения для каждого пользователя. Интерфейс платформы построен на принципах когнитивной психологии и использует адаптивные алгоритмы для оптимизации процесса обучения. Дизайн объединяет функциональность с эстетикой, создавая интуитивно понятное и визуально привлекательное пространство для обучения. Особое внимание было уделено доступности и инклюзивности интерфейса.",
    client: "Quantum Education",
    year: "2022",
    role: "UX/UI дизайнер, арт-директор"
  },
  {
    id: 5,
    title: "AR-приложение Botanica",
    category: "AR/VR",
    description: "Приложение дополненной реальности для изучения растений и ботаники.",
    longDescription: "Botanica — это образовательное приложение дополненной реальности, которое превращает изучение растений в интерактивное приключение. Пользователи могут сканировать растения в реальном мире, получать информацию о них и наблюдать визуализацию процессов фотосинтеза и роста в AR. Дизайн приложения основан на биомиметических принципах, имитируя органические формы и структуры растений. Проект также включал создание 3D-моделей различных видов растений и их анимированных жизненных циклов.",
    client: "Образовательный фонд Botanica",
    year: "2023",
    role: "Креативный директор, UX дизайнер"
  },
  {
    id: 6,
    title: "Типографика Киберпанк",
    category: "Типографика",
    description: "Экспериментальный шрифт, вдохновленный эстетикой киберпанка.",
    longDescription: "Киберпанк — это экспериментальный шрифт, вдохновленный эстетикой киберпанка и футуристической технологией. Шрифт объединяет геометрические формы с глитч-эффектами и нестандартными лигатурами, создавая уникальную визуальную динамику. Проект включал разработку полного набора символов, включая кириллицу и расширенную латиницу, а также специальные глифы и альтернативные знаки. Шрифт был выпущен как свободное программное обеспечение и широко используется в дизайне компьютерных игр и цифровых медиа.",
    client: "Персональный проект",
    year: "2021",
    role: "Шрифтовой дизайнер"
  }
];

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category === activeFilter));
    }
  }, [activeFilter]);
  
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
  
  const openModal = (project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };
  
  // Получаем уникальные категории проектов
  const categories = ['all', ...new Set(projects.map(project => project.category))];
  
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };
  
  return (
    <ProjectsContainer>
      <SectionTitle>
        Мои <span className="accent">проекты</span>
      </SectionTitle>
      
      <FilterContainer>
        {categories.map(category => (
          <FilterButton
            key={category}
            $active={activeFilter === category}
            onClick={() => handleFilterClick(category)}
          >
            {category === 'all' ? 'Все' : category}
          </FilterButton>
        ))}
      </FilterContainer>
      
      <ProjectsGrid ref={ref}>
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            onClick={() => openModal(project)}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ProjectImage className="project-image" />
            
            <AsciiOverlay className="ascii-overlay">
              {generateProjectAscii(index)}
            </AsciiOverlay>
            
            <ProjectInfo className="project-info">
              <ProjectTitle>{project.title}</ProjectTitle>
              <ProjectCategory>{project.category}</ProjectCategory>
              <ProjectDescription>{project.description}</ProjectDescription>
            </ProjectInfo>
          </ProjectCard>
        ))}
      </ProjectsGrid>
      
      <AnimatePresence>
        {selectedProject && (
          <ModalBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <ModalContent
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CloseButton onClick={closeModal}>×</CloseButton>
              
              <ModalHeader>
                <ModalTitle>{selectedProject.title}</ModalTitle>
                <ModalCategory>{selectedProject.category}</ModalCategory>
              </ModalHeader>
              
              <ModalBody>
                <ModalImageContainer>
                  <ModalImage />
                </ModalImageContainer>
                
                <ModalDescription>{selectedProject.longDescription}</ModalDescription>
                
                <ModalDetails>
                  <DetailRow>
                    <DetailLabel>Клиент:</DetailLabel>
                    <DetailValue>{selectedProject.client}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Год:</DetailLabel>
                    <DetailValue>{selectedProject.year}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Роль:</DetailLabel>
                    <DetailValue>{selectedProject.role}</DetailValue>
                  </DetailRow>
                </ModalDetails>
              </ModalBody>
            </ModalContent>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </ProjectsContainer>
  );
};

export default Projects; 