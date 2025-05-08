/* eslint-disable no-labels */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import projects from '../data/projects';
import previewGuru from '../assets/images/preview_guru.webp';
import previewFable from '../assets/images/preview_fable.webp';
import preview0not1 from '../assets/images/preview_0not1.webp';
import previewSamb from '../assets/images/preview_samb.webp';
import previewSite from '../assets/images/preview_site.webp';
import previewWelcom from '../assets/images/preview_welcom.webp';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';
import SEO from '../components/SEO';

const ProjectsContainer = styled.div`
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
  display: flex;
  flex-direction: column;
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
  font-family: 'Space Grotesk', 'Jost', sans-serif;
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
  gap: 48px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const ProjectCardWrapper = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    &[data-project-id="6"] {
      order: -1;
    }
    &[data-project-id="1"] {
      order: 2;
    }
    &[data-project-id="2"] {
      order: 1;
    }
  }
`;

const ProjectCard = styled(motion.div)`
  position: relative;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  border-radius: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  ${props => props.$selected && `
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  `}
`;

const ProjectLink = styled(Link)`
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  outline: none;
  border: none;
  
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: none;
  }
`;

const ProjectImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  position: relative;
  transition: opacity 0.3s ease;

  ${ProjectCard}:hover & {
    opacity: 0.8;
  }
`;

const ProjectInfo = styled.div`
  position: absolute;
  inset: 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ProjectCard}:hover & {
    opacity: 1;
  }
  
  /* На мобильных устройствах показываем информацию только для выбранного проекта */
  ${props => props.$active && `
    opacity: 1;
  `}
`;

const ProjectTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #fff;
  font-family: 'Inter', 'Space Grotesk', 'Jost', sans-serif;
  font-weight: 600;
`;

const ProjectCategory = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  
  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--overlay);
    color: var(--text-primary);
    padding: 0 8px;
    border-radius: 4px;
    margin-right: 5px;
    margin-bottom: 5px;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    height: 22px;
    box-sizing: border-box;
    border: 1px solid var(--accent);
  }
`;

const ProjectDescription = styled.p`
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.9);
`;

const ProjectCaption = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--overlay);
  color: var(--text-primary);
  padding: 0 8px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  border-radius: 4px;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  line-height: 1;
  box-sizing: border-box;
  border: 1px solid var(--accent);
  
  ${ProjectCard}:hover & {
    opacity: 1;
  }
  
  /* На мобильных устройствах показываем год только для выбранного проекта */
  ${props => props.$active && `
    opacity: 1;
  `}
`;

const MobileNotification = styled(motion.div)`
  position: absolute;
  background: var(--overlay);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  text-align: center;
  width: auto;
  max-width: 160px;
  white-space: normal;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: none;
  top: 10px;
  left: 10px;
  transform: none;
  margin: 0;
  border: 1px solid var(--accent);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

// Map project IDs to preview images
const previewImages = {
  1: previewGuru,
  2: previewFable,
  3: preview0not1,
  4: previewSamb,
  5: previewSite,
  6: previewWelcom,
};

const Projects = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const { initialLoadComplete } = useLoading();
  const { language } = useLanguage();
  const t = translations.projects[language];
  
  // Получаем локализованный заголовок проекта
  const getLocalizedTitle = (project) => {
    if (language === 'en' && project.titleEn) {
      return project.titleEn;
    }
    return project.title;
  };
  
  // Получаем локализованное описание проекта
  const getLocalizedDescription = (project) => {
    return project.description[language] || project.description.ru;
  };

  // Получаем локализованный год проекта
  const getLocalizedYear = (project, isPreview = true) => {
    // Значение по умолчанию в случае отсутствия года
    const defaultValue = language === 'en' ? 'Current' : 'Текущий';
    
    // Если год отсутствует, возвращаем значение по умолчанию
    if (!project.year) return defaultValue;
    
    // Если год - объект с локализацией
    if (typeof project.year === 'object' && (project.year.ru || project.year.en)) {
      const yearValue = project.year[language] || project.year.ru;
      
      // Для превьюшек: если год содержит указание на настоящее время, заменяем на "Текущий"/"Current"
      if (isPreview) {
        if ((language === 'ru' && yearValue.includes('Наст.время')) || 
            (language === 'en' && yearValue.includes('Present'))) {
          return language === 'en' ? 'Current' : 'Текущий';
        }
      }
      
      return yearValue;
    }
    
    // Для превьюшек: если год (строка) содержит указание на настоящее время
    if (isPreview && typeof project.year === 'string') {
      if (project.year.includes('Наст.время') || project.year.includes('Present')) {
        return language === 'en' ? 'Current' : 'Текущий';
      }
    }
    
    // Если год - строка или число, возвращаем как есть
    return project.year;
  };

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category.includes(activeFilter)));
    }
  }, [activeFilter]);
  
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setSelectedProjectId(null);
    setShowNotification(false);
  };
  
  const handleProjectClick = (e, projectId) => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      e.preventDefault();
      if (selectedProjectId === projectId) {
        navigate(`/projects/${projectId}`);
        setShowNotification(false);
      } else {
        setSelectedProjectId(projectId);
        setShowNotification(true);
        
        // Авто-скрытие уведомления через 5 секунд
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }
  };
  
  // Получаем уникальные категории проектов
  const categories = ['all', ...new Set(projects.flatMap(project => project.category))];
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4
      }
    })
  };
  
  // Функция для перевода категорий
  const translateCategory = (category) => {
    if (category === 'all') return t.all;
    // Если в другом языке, и есть перевод категории, используем его
    return language === 'en' && t.categories[category] ? t.categories[category] : category;
  };
  
  // Функция для форматирования категорий в отдельные элементы
  const formatCategories = (categoriesArray, translateFn) => {
    return categoriesArray.map((cat, index) => (
      <span key={index}>{translateFn(cat)}</span>
    ));
  };
  
  return (
    <ProjectsContainer>
      <SEO 
        title="TUNK5585 | Projects" 
        description="Look, enjoy, cooperate."
      />
      <TitleContainer>
        <SectionTitle>
          {t.title}
        </SectionTitle>
      </TitleContainer>
      
      <ContentContainer>
        <FilterContainer>
          {categories.map(category => (
            <FilterButton
              key={category}
              $active={activeFilter === category}
              onClick={() => handleFilterClick(category)}
            >
              {translateCategory(category)}
            </FilterButton>
          ))}
        </FilterContainer>
      
        <ProjectsGrid ref={ref}>
          {filteredProjects.map((project, index) => (
            <ProjectCardWrapper key={project.id} data-project-id={project.id}>
              <ProjectCard
                variants={cardVariants}
                initial="hidden"
                animate={(inView && initialLoadComplete) ? "visible" : "hidden"}
                custom={index}
                $selected={selectedProjectId === project.id}
              >
                <ProjectLink
                  to={`/projects/${project.id}`}
                  onClick={e => handleProjectClick(e, project.id)}
                >
                  <ProjectImage className="project-image" $src={previewImages[project.id]} />
                  <ProjectCaption $active={selectedProjectId === project.id}>{getLocalizedYear(project)}</ProjectCaption>
                  <ProjectInfo
                    $active={selectedProjectId === project.id}
                  >
                    <ProjectTitle>
                      {getLocalizedTitle(project)}
                    </ProjectTitle>
                    <ProjectCategory>
                      {formatCategories(project.category, translateCategory)}
                    </ProjectCategory>
                    <ProjectDescription>
                      {getLocalizedDescription(project)}
                    </ProjectDescription>
                  </ProjectInfo>
                  
                  <AnimatePresence>
                    {showNotification && selectedProjectId === project.id && (
                      <MobileNotification
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {language === 'en' ? 'Tap again to view project details' : 'Нажмите еще раз для просмотра'}
                      </MobileNotification>
                    )}
                  </AnimatePresence>
                </ProjectLink>
              </ProjectCard>
            </ProjectCardWrapper>
          ))}
        </ProjectsGrid>
      </ContentContainer>
    </ProjectsContainer>
  );
};

export default Projects; 
