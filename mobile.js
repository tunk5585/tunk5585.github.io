// mobile.js
const controls = document.querySelector('.controls');

// Константы для инерции
const mobileFrictionFactor = 0.9993; // Снижаем затухание ещё в 3 раза (было 0.998)
const mobileMinVelocity = 0.5; // Минимальная скорость, точки не будут останавливаться полностью
const mobileInertiaDecayTime = 45000; // Увеличенное время затухания инерции до 45 секунд (было 15000)
const mobileCollisionInertiaFactor = 0.7; // Коэффициент передачи импульса при столкновении с активной точкой

// Карта для хранения состояния перетаскивания для каждой точки на мобильных устройствах
const mobileDragState = new Map();

// Заменяем дублирующую проверку единой функцией
function detectMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) ||
           (window.matchMedia("(pointer: coarse)").matches);
}

// Функция для определения Safari на iOS
function isIOSSafari() {
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua) && /WebKit/i.test(ua) && !/CriOS/i.test(ua) && !/OPiOS/i.test(ua) && !/FxiOS/i.test(ua);
}

// Объявляем глобальную переменную для использования во всем проекте
window.isMobileDevice = detectMobileDevice();
window.isIOSSafari = isIOSSafari();

// Применяем классы к документу
if (window.isMobileDevice) {
    console.log('Mobile device detected');
    document.body.classList.add('mobile-device');
    document.documentElement.classList.add('mobile-device');
    
    // Добавляем класс для Safari на iOS
    if (window.isIOSSafari) {
        console.log('iOS Safari detected');
        document.body.classList.add('ios-safari');
        document.documentElement.classList.add('ios-safari');
    }
}

// Остальной код специфичный для мобильных устройств
// Используем window.isMobileDevice вместо локальной переменной isMobile
if (window.isMobileDevice) {
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
        
        // Фиксируем все точки в их текущих позициях при загрузке
        const pulses = document.querySelectorAll('.pulse');
        pulses.forEach(pulse => {
            // Запоминаем исходные позиции
            if (pulse.style.left && pulse.style.top) {
                pulse.setAttribute('data-original-left', pulse.style.left);
                pulse.setAttribute('data-original-top', pulse.style.top);
            }
        });
        
        // Перехватываем изменение размера ползунком
        const sizeSlider = document.querySelector('.size-slider');
        if (sizeSlider) {
            // Флаг для отслеживания состояния слайдера
            let isSliding = false;
            
            // Обработчик начала изменения размера
            sizeSlider.addEventListener('mousedown', () => {
                isSliding = true;
                document.body.classList.add('resizing');
                
                // Временно скрываем пульсирующие кольца при изменении размера
                const rings = document.querySelectorAll('.pulse-ring');
                rings.forEach(ring => {
                    ring.style.animation = 'none';
                    ring.style.opacity = '0';
                });
            }, { passive: true });
            
            // Обработчик для тачскрина
            sizeSlider.addEventListener('touchstart', () => {
                isSliding = true;
                document.body.classList.add('resizing');
                
                // Временно скрываем пульсирующие кольца при изменении размера
                const rings = document.querySelectorAll('.pulse-ring');
                rings.forEach(ring => {
                    ring.style.animation = 'none';
                    ring.style.opacity = '0';
                });
            }, { passive: true });
            
            // Обработчик окончания изменения размера
            document.addEventListener('mouseup', () => {
                if (isSliding) {
                    finishResizing();
                }
            }, { passive: true });
            
            // Обработчик для тачскрина
            document.addEventListener('touchend', () => {
                if (isSliding) {
                    finishResizing();
                }
            }, { passive: true });
            
            // Функция восстановления после изменения размера
            function finishResizing() {
                isSliding = false;
                document.body.classList.remove('resizing');
                
                // Добавляем небольшую задержку перед восстановлением пульсирующих колец
                setTimeout(() => {
                    // Обновляем позиции всех точек и их пульсирующих колец
                    const pulses = document.querySelectorAll('.pulse');
                    pulses.forEach(pulse => {
                        // Сбрасываем и восстанавливаем кольцо пульсации
                        const ring = pulse.querySelector('.pulse-ring');
                        if (ring) {
                            // Принудительно обновляем позицию
                            ring.style.cssText = '';
                            void ring.offsetWidth;
                            
                            // Если точка не активна, восстанавливаем анимацию
                            if (!document.body.classList.contains('has-active-point') && 
                                !document.querySelector('.container').classList.contains('has-active')) {
                                ring.style.animation = 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite';
                                ring.style.opacity = '1';
                            }
                        }
                    });
                }, 50);
            }
        }
        
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
        
        // Специфичная фикс-функция для Safari iOS
        if (window.isIOSSafari) {
            // Принудительно показываем информацию о скорости в Safari на iOS
            const fixSafariVelocityInfo = function() {
                const velocityInfo = document.querySelector('.velocity-info');
                if (velocityInfo) {
                    // Делаем элемент видимым в Safari
                    velocityInfo.style.display = 'block';
                    velocityInfo.style.position = 'fixed';
                    velocityInfo.style.bottom = '70px'; // Увеличиваем отступ снизу
                    velocityInfo.style.left = '13px';
                    velocityInfo.style.margin = '0';
                    velocityInfo.style.padding = '5px';
                    velocityInfo.style.zIndex = '1000';
                    velocityInfo.style.width = 'auto';
                    velocityInfo.style.maxWidth = '40%';
                    velocityInfo.style.opacity = '1';
                    velocityInfo.style.visibility = 'visible';
                    velocityInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    velocityInfo.style.borderRadius = '4px';
                    
                    // Проверяем, поддерживается ли safe-area-inset-bottom
                    if (CSS.supports('padding-bottom: env(safe-area-inset-bottom)')) {
                        // Используем env() для устройств с нижней панелью (iPhone X и новее)
                        velocityInfo.style.bottom = 'calc(70px + env(safe-area-inset-bottom))';
                    }
                    
                    // Убедимся, что контент отображается правильно при открытии меню
                    const menuIcon = document.querySelector('.menu-icon');
                    if (menuIcon) {
                        menuIcon.addEventListener('click', () => {
                            // Проверяем, открыто ли меню
                            if (document.querySelector('.container').classList.contains('has-active-menu')) {
                                // Применяем стили в самом открытии меню
                                velocityInfo.style.display = 'block';
                                velocityInfo.style.opacity = '1';
                                velocityInfo.style.visibility = 'visible';
                                
                                // Принудительно обновляем содержимое информации о скорости
                                setTimeout(() => {
                                    if (typeof updateVelocityInfo === 'function') {
                                        updateVelocityInfo();
                                        
                                        // Дополнительная проверка, чтобы текст был виден
                                        if (velocityInfo.textContent.trim() === '') {
                                            const pulses = document.querySelectorAll('.pulse');
                                            let info = '';
                                            
                                            pulses.forEach(pulse => {
                                                if (!pulse.classList.contains('active') && pulse.velX && pulse.velY) {
                                                    const velocity = calculateVelocity(pulse);
                                                    const name = pulse.querySelector('.pulse-content').textContent.split(' ')[0];
                                                    info += `${name}; Скорость: ${velocity.toFixed(2)}\n`;
                                                }
                                            });
                                            
                                            if (info.trim() !== '') {
                                                velocityInfo.textContent = info.trim();
                                            }
                                        }
                                    }
                                }, 50);
                            }
                        });
                    }
                }
            };
            
            // Вызываем функцию сразу и после полной загрузки
            fixSafariVelocityInfo();
            window.addEventListener('load', fixSafariVelocityInfo);
            
            // Добавляем обработчики для обновления информации о скорости
            window.addEventListener('orientationchange', () => {
                setTimeout(fixSafariVelocityInfo, 300);
            });
            
            // Добавляем обработчик для случаев, когда пользователь прокрутил страницу
            window.addEventListener('scroll', () => {
                setTimeout(fixSafariVelocityInfo, 200);
            });
            
            // Проверяем при резекте окна
            window.addEventListener('resize', () => {
                setTimeout(fixSafariVelocityInfo, 200);
            });
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
        let isDragging = false;
        let startX, startY;

        // Инициализируем состояние перетаскивания для каждой точки
        mobileDragState.set(pulse, {
            lastPosX: 0, 
            lastPosY: 0,
            lastTime: 0,
            velocityX: 0,
            velocityY: 0
        });

        // Сохраняем исходные координаты и размер точки
        pulse.originalX = pulse.offsetLeft;
        pulse.originalY = pulse.offsetTop;
        
        // Заменяем обработчик событий touchstart
        pulse.addEventListener('touchstart', (e) => {
            const now = Date.now();
            if (now - lastTouchTime < 300) return; // Предотвращаем быстрые повторные касания
            lastTouchTime = now;
            
            // Останавливаем всплытие события, но не предотвращаем дефолтное поведение
            e.stopPropagation();
            
            // Сбрасываем фокус с элементов ввода для скрытия клавиатуры
            document.activeElement.blur();
            
            // Запоминаем начальные координаты
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            
            // Начинаем перетаскивание
            isDragging = true;
            
            // Останавливаем движение точки при касании
            pulse.velX = 0;
            pulse.velY = 0;
            
            // Сбрасываем флаги инерции
            pulse.justReleased = false;
            
            // Устанавливаем флаг isDragging в точке
            pulse.isDragging = true;
            
            // Инициализируем состояние перетаскивания для этой точки
            const state = mobileDragState.get(pulse);
            state.lastPosX = pulse.posX || pulse.offsetLeft;
            state.lastPosY = pulse.posY || pulse.offsetTop;
            state.lastTime = now;
            state.velocityX = 0;
            state.velocityY = 0;
            
            // Добавляем класс для визуальной индикации
            pulse.classList.add('being-dragged');
            
            // Обновляем в веб-компоненте если есть
            if (window.updateDraggingState) {
                window.updateDraggingState(true);
            }
        }, { passive: false });
        
        // Обработчик события touchmove
        pulse.addEventListener('touchmove', (e) => {
            if (isDragging) {
                // Получаем текущие координаты касания
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                // Рассчитываем смещение от начальной позиции
                const offsetX = touchX - startX;
                const offsetY = touchY - startY;
                
                // Если это реальное перетаскивание (а не просто касание)
                if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
                    // Устанавливаем новую позицию точки
                    pulse.posX = Math.max(0, Math.min(window.innerWidth - pulse.offsetWidth, pulse.originalX + offsetX));
                    pulse.posY = Math.max(0, Math.min(window.innerHeight - pulse.offsetHeight, pulse.originalY + offsetY));
                    
                    // Применяем позицию с transform для лучшей производительности
                    pulse.style.transform = `translate3d(${pulse.posX}px, ${pulse.posY}px, 0)`;
                    
                    // Отслеживаем скорость перемещения для этой точки
                    const now = Date.now();
                    const state = mobileDragState.get(pulse);
                    if (now - state.lastTime > 50) { // Чаще обновляем для более точного отслеживания
                        state.velocityX = (pulse.posX - state.lastPosX) / (now - state.lastTime) * 1000;
                        state.velocityY = (pulse.posY - state.lastPosY) / (now - state.lastTime) * 1000;
                        
                        // Обновляем глобальные переменные для совместимости с основным кодом
                        window.dragVelocityX = state.velocityX;
                        window.dragVelocityY = state.velocityY;
                        window.lastDragTime = now;
                        
                        state.lastPosX = pulse.posX;
                        state.lastPosY = pulse.posY;
                        state.lastTime = now;
                    }
                    
                    // Предотвращаем прокрутку страницы
                    e.preventDefault();
                }
            }
        }, { passive: false });
        
        // Обработчик события touchend
        pulse.addEventListener('touchend', (e) => {
            const wasDragged = isDragging;
            isDragging = false;
            pulse.isDragging = false;
            
            // Удаляем класс перетаскивания
            pulse.classList.remove('being-dragged');
            
            // Обновляем оригинальную позицию для следующего перетаскивания
            pulse.originalX = pulse.posX || pulse.offsetLeft;
            pulse.originalY = pulse.posY || pulse.offsetTop;
            
            // Получаем состояние перетаскивания для этой точки
            const state = mobileDragState.get(pulse);
            
            // Если точка была активирована и это было короткое касание, сохраняем её активной
            // Иначе, если она не активирована или была перетаскивание, обрабатываем соответственно
            if (!pulse.classList.contains('active')) {
                if (wasDragged && state.velocityX && state.velocityY) {
                    // Если было перетаскивание, придаем инерцию с более сильным эффектом
                    pulse.velX = state.velocityX * 0.2; // Увеличиваем фактор инерции для более заметного эффекта (было 0.1)
                    pulse.velY = state.velocityY * 0.2;
                    
                    // Ограничиваем скорость для предотвращения слишком быстрого движения
                    const speed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                    if (speed > 30) { // Увеличиваем максимальную скорость (было 20)
                        const factor = 30 / speed;
                        pulse.velX *= factor;
                        pulse.velY *= factor;
                    }
                    
                    // Добавляем метки для затухающей инерции
                    pulse.justReleased = true;
                    pulse.releaseTime = Date.now();
                    
                    // Устанавливаем минимальную скорость для обеспечения долгого движения
                    if (speed < mobileMinVelocity * 2) {
                        const angle = Math.atan2(pulse.velY, pulse.velX);
                        pulse.velX = Math.cos(angle) * mobileMinVelocity * 2;
                        pulse.velY = Math.sin(angle) * mobileMinVelocity * 2;
                    }
                } else {
                    // Если не было перетаскивания, даем движение с базовой скоростью
                    const angle = Math.random() * 2 * Math.PI;
                    pulse.velX = Math.cos(angle) * mobileMinVelocity * 3;
                    pulse.velY = Math.sin(angle) * mobileMinVelocity * 3;
                    
                    // Добавляем метки для затухающей инерции
                    pulse.justReleased = true;
                    pulse.releaseTime = Date.now();
                }
            } else {
                // Если точка активна, убеждаемся что она остается на месте
                pulse.velX = 0;
                pulse.velY = 0;
                
                // Принудительно обновляем стили, чтобы предотвратить сдвиг
                requestAnimationFrame(() => {
                    pulse.style.transform = 'translate3d(0, 0, 0)';
                });
            }
            
            // Сбрасываем переменные перетаскивания для этой точки
            state.velocityX = 0;
            state.velocityY = 0;
            state.lastTime = 0;
            
            // Обновляем в веб-компоненте если есть
            if (window.updateDraggingState) {
                window.updateDraggingState(false);
            }
        }, { passive: false });
    });
    
    // Перехватываем изменение размера и автоматически фиксируем положение точек
    window.addEventListener('resize', () => {
        // Обрабатываем все точки при изменении размера окна
        const pulses = document.querySelectorAll('.pulse');
        pulses.forEach(pulse => {
            if (pulse.classList.contains('active')) {
                // Для активной точки применяем жесткую фиксацию
                const rect = pulse.getBoundingClientRect();
                pulse.style.transform = 'translate3d(0, 0, 0)';
                pulse.style.transition = 'none';
                pulse.style.left = `${rect.left}px`;
                pulse.style.top = `${rect.top}px`;
            }
        });
    });

    // Оптимизация обработки ресурсов для повышения производительности
    // Отключаем ненужные эффекты в режиме низкой производительности
    const checkLowPerformance = () => {
        // Если устройство на iOS и страница тормозит, добавляем класс low-performance
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isLowRAM = navigator.deviceMemory && navigator.deviceMemory < 4;
        
        // Тестируем производительность устройства
        let startTime = performance.now();
        let iterations = 0;
        
        // Простой тест производительности - как быстро выполняется 20000 операций
        while (iterations < 20000 && performance.now() - startTime < 50) {
            iterations++;
            Math.sqrt(iterations);
        }
        
        // Если устройство медленное (не смогло выполнить 20000 операций за 50мс)
        // или это iOS, или мало памяти - оптимизируем
        if (iterations < 20000 || isIOS || isLowRAM) {
            document.documentElement.classList.add('low-performance');
            document.body.classList.add('low-performance');
            
            // Дополнительные оптимизации для очень слабых устройств
            if (iterations < 10000 || isLowRAM) {
                // Упрощаем или отключаем анимации
                console.log('Very low performance mode activated');
                
                // Отключаем некоторые анимации
                const pulseRings = document.querySelectorAll('.pulse-ring');
                pulseRings.forEach(ring => {
                    if (iterations < 5000) {
                        // На очень слабых устройствах вообще отключаем пульсацию
                        ring.style.display = 'none';
                    } else {
                        // На средне-слабых замедляем
                        ring.style.animationDuration = '3s';
                    }
                });
                
                // Отключаем некоторые эффекты, которые не критически важны
                document.querySelectorAll('.connection-text').forEach(el => {
                    el.style.display = 'none';
                });
            }
        }
    };
    
    // Проверяем производительность после полной загрузки
    window.addEventListener('load', checkLowPerformance);
}

// Создаем единый модуль для управления событиями касания
const TouchEventManager = {
    // Настройки и состояние
    touchStartTime: 0,
    touchStartX: 0,
    touchStartY: 0,
    TOUCH_THRESHOLD: 10,
    activeElement: null,
    
    // Инициализация всех обработчиков
    init() {
        // Один обработчик для всех элементов с классом pulse
        this.initPulseEvents();
        
        // Один обработчик для всех уведомлений
        this.initNotificationEvents();
        
        // Общий обработчик для документа
        this.initDocumentEvents();
        
        // Обработчик для изменения размера
        this.initResizeEvents();
    },
    
    // Методы инициализации разных групп обработчиков
    initPulseEvents() {
        const pulses = document.querySelectorAll('.pulse');
        
        // Делегируем обработку событий через один слушатель
        document.addEventListener('touchstart', (e) => {
            const pulse = e.target.closest('.pulse');
            if (!pulse) return;
            
            // Предотвращаем дребезг касаний
            const now = Date.now();
            if (now - this.touchStartTime < 300 && pulse === this.activeElement) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            this.touchStartTime = now;
            this.activeElement = pulse;
            
            // Вызываем обработку касания точки
            this.handlePulseTouchStart(e, pulse);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            const pulse = this.activeElement;
            if (!pulse || !pulse.classList.contains('pulse')) return;
            
            // Вызываем обработку окончания касания точки
            this.handlePulseTouchEnd(e, pulse);
            this.activeElement = null;
        }, { passive: false });
    },
    
    handlePulseTouchStart(e, pulse) {
        // Логика обработки начала касания точки
        // ... код из существующего обработчика touchstart ...
    },
    
    handlePulseTouchEnd(e, pulse) {
        // Логика обработки окончания касания точки
        // ... код из существующего обработчика touchend ...
    },
    
    // Остальные методы для других групп событий
    // ...
};

// Инициализируем модуль только на мобильных устройствах
if (window.isMobileDevice) {
    document.addEventListener('DOMContentLoaded', () => {
        TouchEventManager.init();
        // ... прочие инициализации для мобильных ...
    });
}

// Перехватываем оригинальную функцию обновления для добавления инерции
if (window.update) {
    const originalUpdate = window.update;
    
    window.update = function(currentTime) {
        // Вызываем оригинальную функцию
        originalUpdate(currentTime);
        
        // Добавляем собственную логику затухающей инерции
        if (window.isMobileDevice) {
            pulses.forEach(pulse => {
                if (!pulse.classList.contains('active') && !pulse.isDragging && isAnimating) {
                    // Применяем силу трения для плавного затухания
                    if (Math.abs(pulse.velX) > 0 || Math.abs(pulse.velY) > 0) {
                        // Сначала сохраняем текущую скорость и направление
                        const speed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                        const angle = Math.atan2(pulse.velY, pulse.velX);
                        
                        // Экспоненциальное затухание скорости
                        pulse.velX *= mobileFrictionFactor;
                        pulse.velY *= mobileFrictionFactor;
                        
                        // Если скорость стала слишком маленькой, поддерживаем базовую скорость
                        const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                        if (newSpeed < mobileMinVelocity) {
                            pulse.velX = Math.cos(angle) * mobileMinVelocity;
                            pulse.velY = Math.sin(angle) * mobileMinVelocity;
                        }
                    }
                    
                    // Специальная обработка для точек, которые только что были отпущены
                    if (pulse.justReleased) {
                        const now = Date.now();
                        // Если прошло больше времени чем inertiaDecayTime, убираем флаг
                        if (now - pulse.releaseTime > mobileInertiaDecayTime) {
                            pulse.justReleased = false;
                        } else {
                            // Если точка только что была отпущена, применяем более сильное затухание
                            // Плавное уменьшение скорости с течением времени
                            const elapsedRatio = (now - pulse.releaseTime) / mobileInertiaDecayTime;
                            const adjustedFriction = mobileFrictionFactor - (0.02 * (1 - elapsedRatio));
                            pulse.velX *= adjustedFriction;
                            pulse.velY *= adjustedFriction;
                        }
                    }
                    
                    // Обработка столкновения с активной точкой на мобильных устройствах
                    const activePulse = document.querySelector('.pulse.active');
                    if (activePulse && pulse !== activePulse) {
                        // Получаем размеры точек
                        const pulseSize = pulse.offsetWidth || 26;
                        const activePulseSize = activePulse.offsetWidth || 40;
                        
                        // Вычисляем центры точек
                        const pulseX = pulse.posX + pulseSize / 2;
                        const pulseY = pulse.posY + pulseSize / 2;
                        const activePulseX = activePulse.offsetLeft + activePulseSize / 2;
                        const activePulseY = activePulse.offsetTop + activePulseSize / 2;
                        
                        // Вычисляем расстояние между точками
                        const dx = pulseX - activePulseX;
                        const dy = pulseY - activePulseY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDistance = (pulseSize + activePulseSize) / 2;

                        // Если точки столкнулись
                        if (distance < minDistance) {
                            // Вычисляем угол между точками
                            const angle = Math.atan2(dy, dx);
                            
                            // Отталкиваем точку от активной точки
                            pulse.posX = activePulseX + Math.cos(angle) * minDistance - pulseSize / 2;
                            pulse.posY = activePulseY + Math.sin(angle) * minDistance - pulseSize / 2;
                            
                            // Вычисляем скорость точки до столкновения
                            const oldVelX = pulse.velX;
                            const oldVelY = pulse.velY;
                            const oldSpeed = Math.sqrt(oldVelX * oldVelX + oldVelY * oldVelY);
                            
                            // Отражаем скорость и применяем импульс столкновения
                            const normalX = Math.cos(angle);
                            const normalY = Math.sin(angle);
                            const dotProduct = pulse.velX * normalX + pulse.velY * normalY;
                            
                            // Базовое отражение скорости
                            pulse.velX = pulse.velX - 2 * dotProduct * normalX;
                            pulse.velY = pulse.velY - 2 * dotProduct * normalY;
                            
                            // Добавляем дополнительный импульс для более выраженного эффекта
                            const baseImpulse = Math.max(mobileMinVelocity * 10, oldSpeed * mobileCollisionInertiaFactor);
                            pulse.velX += normalX * baseImpulse;
                            pulse.velY += normalY * baseImpulse;
                            
                            // Отмечаем точку как недавно столкнувшуюся и устанавливаем время столкновения
                            pulse.justCollided = true;
                            pulse.collisionTime = Date.now();
                            
                            // Ограничиваем максимальную скорость после столкновения
                            const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                            if (newSpeed > 40) {
                                const factor = 40 / newSpeed;
                                pulse.velX *= factor;
                                pulse.velY *= factor;
                            }
                            
                            // Обеспечиваем минимальную скорость после столкновения
                            if (newSpeed < mobileMinVelocity * 5) {
                                const factor = (mobileMinVelocity * 5) / Math.max(newSpeed, 0.1);
                                pulse.velX *= factor;
                                pulse.velY *= factor;
                            }
                            
                            // Применяем новую позицию и скорость
                            pulse.style.transform = `translate3d(${pulse.posX}px, ${pulse.posY}px, 0)`;
                        }
                    }
                    
                    // При столкновении со стенами уменьшаем скорость
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;
                    const pulseSize = 26; // Базовый размер точки
                    
                    if (pulse.posX <= 0) {
                        pulse.posX = 0;
                        pulse.velX = Math.abs(pulse.velX) * 0.8; // Уменьшаем скорость при отскоке на 20%
                    } else if (pulse.posX >= windowWidth - pulseSize) {
                        pulse.posX = windowWidth - pulseSize;
                        pulse.velX = -Math.abs(pulse.velX) * 0.8; // Уменьшаем скорость при отскоке на 20%
                    }
                    
                    if (pulse.posY <= 0) {
                        pulse.posY = 0;
                        pulse.velY = Math.abs(pulse.velY) * 0.8; // Уменьшаем скорость при отскоке на 20%
                    } else if (pulse.posY >= windowHeight - pulseSize) {
                        pulse.posY = windowHeight - pulseSize;
                        pulse.velY = -Math.abs(pulse.velY) * 0.8; // Уменьшаем скорость при отскоке на 20%
                    }
                }
            });
        }
    };
}