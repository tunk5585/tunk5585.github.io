// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Больше не нужно динамически менять положение, так как это теперь фиксировано в CSS
// Оставляем заготовку на случай, если понадобится дополнительная мобильная логика
if (isMobile) {
    console.log('Mobile device detected');
}