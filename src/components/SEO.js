import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = 'TUNK5585', 
  description = 'Look, enjoy, cooperate.', 
  image = '/web-app-manifest-512x512.png',
  url = 'https://tunk5585.xyz' 
}) => {
  const fullUrl = url.startsWith('http') ? url : `https://tunk5585.xyz${url}`;
  const imageUrl = image.startsWith('http') ? image : `https://tunk5585.xyz${image}`;

  return (
    <Helmet>
      {/* Основные метатеги */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph метатеги */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      
      {/* Twitter метатеги */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEO; 