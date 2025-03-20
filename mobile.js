// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    function updateMobileViewport() {
        const safeAreaBottom = Math.max(window.innerHeight - document.documentElement.clientHeight, 0);
        controls.style.bottom = `${13 + safeAreaBottom}px`;
    }

    // Вызываем при загрузке
    updateMobileViewport();

    // Обновляем при изменении размера окна или ориентации
    window.addEventListener('resize', updateMobileViewport);
    window.addEventListener('orientationchange', updateMobileViewport);
}