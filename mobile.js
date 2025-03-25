// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Обработка тапов для уведомлений на мобильных устройствах
if (isMobile) {
    console.log('Mobile device detected');
    
    // Глобальные переменные для отслеживания скорости точек
    let highVelocityPoints = new Set();
    let isTrackingVelocity = true;
    
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
        
        // Переопределяем функцию проверки скорости точек для мобильных устройств
        if (typeof updateVelocityInfo === 'function') {
            const originalUpdateVelocityInfo = updateVelocityInfo;
            
            // Перезаписываем глобальную функцию updateVelocityInfo
            window.updateVelocityInfo = function() {
                // Вызываем оригинальную функцию для базового обновления информации
                originalUpdateVelocityInfo();
                
                if (!isTrackingVelocity) return;
                
                // Проверка скорости всех точек
                const pulses = document.querySelectorAll('.pulse');
                let hasHighVelocity = false;
                highVelocityPoints.clear();
                
                pulses.forEach(pulse => {
                    if (pulse.velX && pulse.velY) {
                        const velocity = calculateVelocity(pulse);
                        if (velocity > 5) {
                            hasHighVelocity = true;
                            highVelocityPoints.add(pulse);
                        }
                    }
                });
                
                // Если есть точки с высокой скоростью и уведомление не активно, показываем его
                if (hasHighVelocity && !isHighVelocityTriggered && typeof highVelocityNotification !== 'undefined') {
                    isHighVelocityTriggered = true;
                    highVelocityNotification.showNotification();
                    
                    // Задаем таймаут для автоматического сворачивания
                    setTimeout(() => {
                        if (isHighVelocityTriggered && highVelocityNotification.isExpanded) {
                            highVelocityNotification.collapseNotification();
                        }
                    }, 5000);
                }
                // Если нет точек с высокой скоростью и уведомление активно, скрываем его
                else if (!hasHighVelocity && isHighVelocityTriggered && typeof highVelocityNotification !== 'undefined') {
                    isHighVelocityTriggered = false;
                    highVelocityNotification.hideNotification();
                }
            };
        }
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
            // Не закрываем уведомление о высокой скорости, если есть точки с высокой скоростью
            const notifications = document.querySelectorAll('.notification.active:not(.collapsed)');
            notifications.forEach(notification => {
                const handler = notification.id === 'highVelocity' ? highVelocityNotification : tapNotification;
                
                // Проверяем, что это не highVelocity или если это он, но точек с высокой скоростью нет
                if (handler && !notification.classList.contains('collapsed') && 
                   (notification.id !== 'highVelocity' || (notification.id === 'highVelocity' && highVelocityPoints.size === 0))) {
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
                // Если это уведомление о высокой скорости и есть точки с высокой скоростью,
                // не закрываем его полностью, только сворачиваем
                if (notification.id === 'highVelocity' && highVelocityPoints.size > 0) {
                    handler.collapseNotification();
                } else {
                    handler.collapseNotification();
                }
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
            
            // Останавливаем движение точки при касании
            pulse.velX = 0;
            pulse.velY = 0;
            
            // Делаем точку активной при касании
            if (!pulse.classList.contains('active')) {
                // Деактивируем все другие точки перед активацией этой
                pulses.forEach(p => p.classList.remove('active'));
                
                // Добавляем класс 'has-active' к container
                document.querySelector('.container').classList.add('has-active');
                
                // Принудительно убираем классы, которые могут конфликтовать с CSS
                pulse.classList.remove('proximity');
                
                // Активируем выбранную точку
                pulse.classList.add('active');
                
                // Приостанавливаем отслеживание скорости при активной точке
                isTrackingVelocity = false;
                
                // Принудительно применяем стили для активной точки, чтобы исправить возможные конфликты
                requestAnimationFrame(() => {
                    // Сначала удаляем все анимации
                    const rings = document.querySelectorAll('.pulse-ring');
                    rings.forEach(ring => {
                        ring.style.animation = 'none';
                        ring.style.opacity = '0';
                    });
                    
                    // Затем устанавливаем правильные стили для текущей точки
                    const ring = pulse.querySelector('.pulse-ring');
                    if (ring) {
                        ring.style.animation = 'none';
                        ring.style.opacity = '0';
                    }
                });
            } else {
                // Деактивируем точку при повторном касании
                pulse.classList.remove('active');
                document.querySelector('.container').classList.remove('has-active');
                
                // Возобновляем отслеживание скорости
                isTrackingVelocity = true;
            }
        }, { passive: false });
        
        // Обработчик события touchend
        pulse.addEventListener('touchend', (e) => {
            // Если точка была активирована и это было короткое касание, сохраняем её активной
            // Иначе, если она не активирована, даем ей случайное направление движения
            if (!pulse.classList.contains('active')) {
                pulse.velX = (Math.random() - 0.5) * 2;
                pulse.velY = (Math.random() - 0.5) * 2;
            }
        }, { passive: false });
    });
}