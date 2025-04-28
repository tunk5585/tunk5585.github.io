/* eslint-disable no-labels */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import projects from '../data/projects';
import previewGuru from '../assets/images/preview_guru.jpg';
import previewFable from '../assets/images/preview_fable.jpg';
import preview0not1 from '../assets/images/preview_0not1.jpg';
import previewSamb from '../assets/images/preview_samb.jpg';
import previewSite from '../assets/images/preview_site.png';
import previewWelcom from '../assets/images/preview_welcom.jpg';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';

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

const ProjectCard = styled(motion.div)`
  position: relative;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.3s ease;
  
  &:hover .project-info {
    opacity: 1;
  }
  
  ${props => props.$selected && `
    box-shadow: 0 0 0 3px var(--accent);
    transform: scale(1.02);
    z-index: 5;
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
`;

const ProjectInfo = styled.div`
  position: absolute;
  inset: 0;
  padding: 20px;
  background: var(--overlay);
  opacity: ${props => (props.$active ? 1 : 0)};
  transition: opacity 0.3s ease;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ProjectTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: var(--text-primary);
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
  color: var(--text-primary);
`;

const MobileNotification = styled(motion.div)`
  position: absolute;
  background: var(--overlay);
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  max-width: 100%;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: none;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const ProjectCardWrapper = styled.div`
  position: relative;
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
        
        // Авто-скрытие уведомления через 3 секунды
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    }
  };
  
  // Получаем уникальные категории проектов
  const categories = ['all', ...new Set(projects.flatMap(project => project.category))];
  
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
  
  // Функция для перевода категорий
  const translateCategory = (category) => {
    if (category === 'all') return t.all;
    // Если в другом языке, и есть перевод категории, используем его
    return language === 'en' && t.categories[category] ? t.categories[category] : category;
  };
  
  return (
    <ProjectsContainer>
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
            <ProjectCardWrapper key={project.id}>
              <ProjectCard
                variants={cardVariants}
                initial="hidden"
                animate={inView && initialLoadComplete ? "visible" : "hidden"}
                custom={index}
                $selected={selectedProjectId === project.id}
              >
                <ProjectLink
                  to={`/projects/${project.id}`}
                  onClick={e => handleProjectClick(e, project.id)}
                >
                  <ProjectImage className="project-image" $src={previewImages[project.id]} />
                  
                  <ProjectInfo
                    className="project-info"
                    $active={selectedProjectId === project.id}
                  >
                    <ProjectTitle>{getLocalizedTitle(project)}</ProjectTitle>
                    <ProjectCategory>{'#' + project.category.map(cat => translateCategory(cat)).join(' #')}</ProjectCategory>
                    <ProjectDescription>{getLocalizedDescription(project)}</ProjectDescription>
                  </ProjectInfo>
                </ProjectLink>
              </ProjectCard>
              
              <AnimatePresence>
                {showNotification && selectedProjectId === project.id && (
                  <MobileNotification
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {language === 'en' ? 'Tap again to view project details' : 'Нажмите еще раз, чтобы просмотреть детали проекта'}
                  </MobileNotification>
                )}
              </AnimatePresence>
            </ProjectCardWrapper>
          ))}
        </ProjectsGrid>
      </ContentContainer>
    </ProjectsContainer>
  );
};

export default Projects; 
