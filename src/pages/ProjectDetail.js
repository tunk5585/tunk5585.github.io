/* eslint-disable no-labels */
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import projects from '../data/projects';
import { useLanguage } from '../context/LanguageContext';
import translations from '../data/translations';
import SEO from '../components/SEO';
// Импортируем изображения проектов для десктопной версии
import insideGuru from '../assets/images/inside_project_guru.webp';
import insideFable from '../assets/images/inside_project_fable.webp';
import inside0not1 from '../assets/images/inside_project_0not1.webp';
import insideSamb from '../assets/images/inside_project_samb.webp';
// Импортируем изображения проектов для мобильной версии
import insideGuruMobile from '../assets/images/inside_project_mob_guru.webp';
import insideFableMobile from '../assets/images/inside_project_mob_fable.webp';
import inside0not1Mobile from '../assets/images/inside_project_mob_0not1.webp';
import insideSambMobile from '../assets/images/inside_project_mob_samb.webp';

const ProjectDetailContainer = styled.div`
  min-height: 100vh;
  padding-top: 0;
  padding-bottom: 48px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding-bottom: 32px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const ProjectHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: var(--main-bg);
  padding: 1.25rem 0;
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  
  @media (max-width: 768px) {
    padding: 1rem 0;
    padding-left: 16px;
    padding-right: 16px;
    margin-left: -16px;
    margin-right: -16px;
  }
`;

const LanguageButton = styled.button`
  background: none;
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 6px 10px;
  font-size: 0.75rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--accent);
    color: var(--text-secondary);
  }
`;

const CloseButton = styled.button`
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--main-bg);
  border: 0.5px solid var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseIcon = styled.div`
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background-color: var(--text-primary);
    transform-origin: center;
  }
  
  &::before {
    transform: translateX(-50%) rotate(45deg);
  }
  
  &::after {
    transform: translateX(-50%) rotate(-45deg);
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
`;

const ProjectImageContainer = styled.div`
  width: 100%;
  margin: 2rem 0;
  display: flex;
  justify-content: center;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  object-position: center;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 2rem 0;
`;

const Tag = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
`;

const ProjectContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 0;
  color: var(--text-primary);
`;

const ProjectDetails = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
`;

const DetailRow = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const ScrollIndicator = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
  cursor: pointer;
  padding: 6px 6px 10px;
  border-radius: 8px;
  background-color: var(--main-bg);
  border: 0.5px solid var(--text-primary);
  overflow: hidden;

  @media (min-width: 769px) {
    display: none;
  }
`;

const ScrollText = styled(motion.p)`
  font-size: 0.6rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 0.1px;
  opacity: 0.9;
  text-align: center;
  width: 100%;
`;

const ArrowContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 16px;
  overflow: hidden;
`;

const Arrow = styled(motion.div)`
  width: 12px;
  height: 12px;
  border-right: 1.5px solid #fff;
  border-bottom: 1.5px solid #fff;
  transform: rotate(45deg);
`;

const ScrollTopButton = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 1rem;
  z-index: 1001;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--main-bg);
  border: 0.5px solid var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: center;

  @media (min-width: 769px) {
    bottom: 45px;
    right: 2rem;
  }
`;

const ScrollTopArrow = styled.div`
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border-right: 1.5px solid var(--text-primary);
  border-bottom: 1.5px solid var(--text-primary);
  transform: translateY(3.5px) rotate(-135deg);
  transform-origin: center center;
`;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(() => (window.innerWidth >= 769 ? 45 : 20));
  const { language, toggleLanguage } = useLanguage();
  const t = translations.projects[language];
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Обработчик изменения размера окна для определения мобильного представления
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Map project IDs to detail project images
  const projectImages = {
    1: insideGuru,
    2: insideFable,
    3: inside0not1,
    4: insideSamb,
    // Проекты 5 (site) и 6 (welcom) пока не используются
  };
  
  // Map project IDs to mobile detail project images
  const mobileProjectImages = {
    1: insideGuruMobile,
    2: insideFableMobile,
    3: inside0not1Mobile,
    4: insideSambMobile,
    // Проекты 5 (site) и 6 (welcom) пока не используются
  };
  
  // Выбираем нужное изображение в зависимости от устройства
  const getProjectImage = (projectId) => {
    if (isMobile && mobileProjectImages[projectId]) {
      return mobileProjectImages[projectId];
    }
    return projectImages[projectId];
  };
  
  useEffect(() => {
    const updateBottomOffset = () => {
      const base = window.innerWidth >= 769 ? 45 : 20;
      let diff = 0;
      if (window.visualViewport) {
        diff = window.innerHeight - window.visualViewport.height;
      }
      let footerOverlap = 0;
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          footerOverlap = window.innerHeight - rect.top;
        }
      }
      setBottomOffset(base + (diff > 0 ? diff : 0) + footerOverlap + 10);
    };
    updateBottomOffset();
    window.addEventListener('resize', updateBottomOffset);
    window.addEventListener('scroll', updateBottomOffset);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateBottomOffset);
      window.visualViewport.addEventListener('scroll', updateBottomOffset);
    }
    return () => {
      window.removeEventListener('resize', updateBottomOffset);
      window.removeEventListener('scroll', updateBottomOffset);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateBottomOffset);
        window.visualViewport.removeEventListener('scroll', updateBottomOffset);
      }
    };
  }, []);
  
  // Находим проект по ID
  const project = projects.find(p => p.id.toString() === id);
  
  // Если проект не найден, редирект на страницу проектов
  useEffect(() => {
    if (!project) {
      navigate('/projects');
    } else {
      // Принудительно прокручиваем страницу вверх при открытии проекта
      window.scrollTo(0, 0);
    }
  }, [project, navigate]);
  
  // Функция для перевода категорий
  const translateCategory = (category) => {
    return language === 'en' && t.categories[category] ? t.categories[category] : category;
  };
  
  // Получаем локализованный заголовок проекта
  const getLocalizedTitle = () => {
    if (language === 'en' && project.titleEn) {
      return project.titleEn;
    }
    return project.title;
  };
  
  // Получаем локализованное описание проекта
  const getLocalizedLongDescription = () => {
    return project.longDescription[language] || project.longDescription.ru;
  };
  
  // Получаем локализованные данные клиента
  const getLocalizedClient = () => {
    if (typeof project.client === 'object' && project.client[language]) {
      return project.client[language];
    }
    return project.client;
  };
  
  // Получаем локализованные данные года
  const getLocalizedYear = () => {
    if (typeof project.year === 'object' && project.year[language]) {
      return project.year[language];
    }
    return project.year;
  };
  
  // Получаем локализованные данные роли
  const getLocalizedRole = () => {
    if (typeof project.role === 'object' && project.role[language]) {
      return project.role[language];
    }
    return project.role;
  };

  // Показываем индикатор прокрутки, если контент длинный
  useEffect(() => {
    if (project) {
      // Сбрасываем состояние видимости обоих индикаторов
      setScrollTopVisible(false);
      setIndicatorVisible(false);
      
      // Принудительно прокручиваем в начало при загрузке проекта
      window.scrollTo(0, 0);
      
      const timer = setTimeout(() => {
        const pageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        // Показываем индикатор только если страница достаточно длинная
        // и не зависим от текущей позиции прокрутки
        if (pageHeight > viewportHeight * 1.8) {
          setIndicatorVisible(true);
        }
      }, 300); // Увеличиваем задержку для надежности
      
      return () => clearTimeout(timer);
    }
  }, [project]);
  
  // Отслеживаем скролл для показа/скрытия индикаторов
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 150) {
        // Скрываем индикатор прокрутки вниз только если он видим
        if (indicatorVisible) {
          setIndicatorVisible(false);
        }
        // Показываем кнопку прокрутки вверх
        setScrollTopVisible(true);
      } else {
        // Скрываем кнопку прокрутки вверх
        setScrollTopVisible(false);
      }
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [indicatorVisible]);
  
  const handleBack = () => {
    navigate('/projects');
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };
  
  // Генерируем SEO данные для текущего проекта
  const generateSeoData = () => {
    if (!project) return {
      title: language === 'ru' ? 'Проект не найден' : 'Project Not Found',
      description: ''
    };
    
    const projectTitle = getLocalizedTitle();
    const projectDescription = project[language]?.description || project.en?.description || '';
    
    return {
      title: projectTitle,
      description: projectDescription.length > 160 
        ? projectDescription.substring(0, 157) + '...' 
        : projectDescription,
      image: getProjectImage(project.id)
    };
  };
  
  const seoData = generateSeoData();
  
  if (!project) return null;
  
  return (
    <>
      <SEO 
        title={seoData.title} 
        description={seoData.description}
        image={seoData.image}
        article={true}
      />
      <ProjectDetailContainer ref={containerRef}>
        <ProjectHeader>
          <LanguageButton onClick={toggleLanguage}>
            {language === 'en' ? 'RU' : 'EN'}
          </LanguageButton>
          <CloseButton onClick={handleBack}>
            <CloseIcon />
          </CloseButton>
        </ProjectHeader>
        
        <ContentContainer>
          <ProjectImageContainer>
            {getProjectImage(project.id) ? (
              <ProjectImage 
                src={getProjectImage(project.id)} 
                alt={getLocalizedTitle()} 
              />
            ) : (
              <ProjectImage 
                as="div" 
                style={{ 
                  backgroundColor: '#252525',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {language === 'en' ? 'Image coming soon' : 'Изображение скоро будет добавлено'}
                </div>
              </ProjectImage>
            )}
          </ProjectImageContainer>
          
          <TagContainer>
            {project.category.map(cat => (
              <Tag key={cat}>{translateCategory(cat)}</Tag>
            ))}
          </TagContainer>
          
          <ProjectContent>
            <ProjectDescription>{getLocalizedLongDescription()}</ProjectDescription>
            
            <ProjectDetails>
              <DetailRow>
                <DetailLabel>{t.client}</DetailLabel>
                <DetailValue>{getLocalizedClient()}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>{t.year}</DetailLabel>
                <DetailValue>{getLocalizedYear()}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>{t.role}</DetailLabel>
                <DetailValue>{getLocalizedRole()}</DetailValue>
              </DetailRow>
            </ProjectDetails>
          </ProjectContent>
        </ContentContainer>
        
        {indicatorVisible && (
          <ScrollIndicator
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollDown}
          >
            <ScrollText>{t.scroll_down}</ScrollText>
            <ArrowContainer><Arrow /></ArrowContainer>
          </ScrollIndicator>
        )}
        
        {scrollTopVisible && (
          <ScrollTopButton
            style={{ bottom: bottomOffset }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
          >
            <ScrollTopArrow />
          </ScrollTopButton>
        )}
      </ProjectDetailContainer>
    </>
  );
};

export default ProjectDetail; 