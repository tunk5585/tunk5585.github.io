// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Больше не нужно динамически менять bottom, так как это делает CSS
    // Но мы можем добавить дополнительные проверки, если потребуется
    function ensureVisibility() {
        const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') ||
                               getComputedStyle(document.documentElement).getPropertyValue('constant(safe-area-inset-bottom)') || '0px';
        const safeAreaBottomPx = parseFloat(safeAreaBottom) || 0;

        // Если safe-area-inset-bottom не работает, добавляем минимальный отступ
        if (safeAreaBottomPx === 0) {
            document.documentElement.style.setProperty('--safe-area-inset-bottom', '20px');
        }
    }

    // Вызываем при загрузке
    ensureVisibility();

    // Обновляем при изменении размера окна или ориентации
    window.addEventListener('resize', ensureVisibility);
    window.addEventListener('orientationchange', ensureVisibility);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', ensureVisibility);
        window.visualViewport.addEventListener('scroll', ensureVisibility);
    }
}