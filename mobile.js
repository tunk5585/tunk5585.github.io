// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    function getSafeAreaBottom() {
        // Пробуем получить значение safe-area-inset-bottom через CSS
        const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') ||
                               getComputedStyle(document.documentElement).getPropertyValue('constant(safe-area-inset-bottom)') || '0px';
        const safeAreaBottomPx = parseFloat(safeAreaBottom) || 0;

        // Дополнительно проверяем через visualViewport API
        let visualViewportBottom = 0;
        if (window.visualViewport) {
            const viewport = window.visualViewport;
            visualViewportBottom = window.innerHeight - (viewport.height + viewport.offsetTop);
        }

        // Возвращаем максимальное значение из всех источников
        return Math.max(safeAreaBottomPx, visualViewportBottom, 10); // Минимальный отступ 10px как запасной вариант
    }

    function updateMobileViewport() {
        const safeAreaBottom = getSafeAreaBottom();
        controls.style.bottom = `${13 + safeAreaBottom}px`;
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