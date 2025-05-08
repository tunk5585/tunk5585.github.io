import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SEO = ({ 
  title, 
  description, 
  image, 
  article
}) => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  
  // Базовый URL сайта
  const siteUrl = 'https://tunk5585.xyz';
  
  // Значения по умолчанию
  const defaultTitle = language === 'ru' ? 'Загрузка' : 'Loading';
  const defaultDescription = language === 'ru' 
    ? 'Look, enjoy, cooperate.' 
    : 'Look, enjoy, cooperate.';
  const defaultImage = `${siteUrl}/images/og-image.jpg`;
  
  // Используемые значения (либо переданные, либо по умолчанию)
  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: image || defaultImage,
    url: `${siteUrl}${pathname}`
  };
  
  // Полный заголовок с названием сайта
  const fullTitle = `${seo.title} | TUNK5585`;

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
};

export default SEO; 