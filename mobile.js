// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    function updateMobileViewport() {
        // Проверяем поддержку visualViewport API
        if (window.visualViewport) {
            const viewport = window.visualViewport;
            const safeAreaBottom = window.innerHeight - viewport.height;
            controls.style.bottom = `${13 + Math.max(safeAreaBottom, 0)}px`;
        } else {
            // Запасной вариант: используем window.innerHeight и clientHeight
            const safeAreaBottom = Math.max(window.innerHeight - document.documentElement.clientHeight, 0);
            controls.style.bottom = `${13 + safeAreaBottom}px`;
        }
    }

    // Вызываем при загрузке
    updateMobileViewport();

    // Обновляем при изменении размера окна, ориентации или смещении viewport
    window.addEventListener('resize', updateMobileViewport);
    window.addEventListener('orientationchange', updateMobileViewport);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateMobileViewport);
        window.visualViewport.addEventListener('scroll', updateMobileViewport);
    }
}