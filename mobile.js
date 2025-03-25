// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Обработка тапов для уведомлений на мобильных устройствах
if (isMobile) {
    console.log('Mobile device detected');
    
    // Улучшенная обработка касаний для мобильных устройств
    document.addEventListener('DOMContentLoaded', () => {
        // Предотвращаем нежелательное масштабирование двойным тапом
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('pulse') || 
                e.target.closest('.pulse') || 
                e.target.classList.contains('notification') || 
                e.target.closest('.notification')) {
                e.preventDefault();
            }
        });
        
        // Блокируем стандартные действия браузера для всех интерактивных элементов
        const interactiveElements = document.querySelectorAll('.pulse, .notification, .play-pause, .size-slider');
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
        
        // Добавляем класс для мобильных устройств
        document.body.classList.add('mobile-device');
    });
    
    // Обработчик тапа по документу для сворачивания уведомлений с задержкой
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    const TOUCH_THRESHOLD = 10; // пиксели для определения свайпа
    
    document.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        const notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer.contains(e.target)) {
            const notifications = document.querySelectorAll('.notification.active:not(.collapsed)');
            notifications.forEach(notification => {
                const handler = notification.id === 'highVelocity' ? highVelocityNotification : tapNotification;
                if (handler && !notification.classList.contains('collapsed')) {
                    handler.collapseNotification();
                }
            });
        }
    }, { passive: false });
    
    // Проверка, был ли это короткий тап или свайп
    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = Date.now() - touchStartTime;
        const touchDistanceX = Math.abs(touchEndX - touchStartX);
        const touchDistanceY = Math.abs(touchEndY - touchStartY);
        
        // Если это был короткий тап, а не свайп
        if (touchDuration < 300 && touchDistanceX < TOUCH_THRESHOLD && touchDistanceY < TOUCH_THRESHOLD) {
            // Это был короткий тап - никаких действий не требуется
        }
    }, { passive: false });

    // Улучшенный обработчик тапа по уведомлению
    const notificationContainer = document.getElementById('notification-container');
    
    notificationContainer.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        
        const notification = e.target.closest('.notification');
        if (!notification) return;
        
        const handler = notification.id === 'highVelocity' ? highVelocityNotification : tapNotification;
        if (!handler) return;
        
        // Используем setTimeout для лучшего различения между tap и scroll
        setTimeout(() => {
            if (notification.classList.contains('collapsed')) {
                handler.expandNotification();
            } else {
                handler.collapseNotification();
            }
        }, 10);
    }, { passive: false });
    
    // Улучшенная обработка взаимодействия с точками (pulses) на мобильных устройствах
    const pulses = document.querySelectorAll('.pulse');
    pulses.forEach(pulse => {
        // Предотвращаем дребезг касаний (touch bounce)
        let lastTouchTime = 0;
        
        // Заменяем обработчик событий touchstart
        pulse.addEventListener('touchstart', (e) => {
            // Предотвращаем двойную обработку события в течение 300 мс
            const now = Date.now();
            if (now - lastTouchTime < 300) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            lastTouchTime = now;
            
            // Делаем точку активной при касании
            if (!pulse.classList.contains('active')) {
                // Деактивируем все другие точки перед активацией этой
                pulses.forEach(p => p.classList.remove('active'));
                
                // Добавляем класс 'has-active' к container
                document.querySelector('.container').classList.add('has-active');
                
                // Активируем выбранную точку
                pulse.classList.add('active');
            }
        }, { passive: false });
    });
}