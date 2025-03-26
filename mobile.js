// mobile.js
const controls = document.querySelector('.controls');

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
                    velocityInfo.style.bottom = '13px';
                    velocityInfo.style.left = '13px';
                    velocityInfo.style.margin = '0';
                    velocityInfo.style.padding = '0';
                    velocityInfo.style.zIndex = '1000';
                    velocityInfo.style.width = 'auto';
                    velocityInfo.style.maxWidth = '40%';
                    velocityInfo.style.opacity = '1';
                    velocityInfo.style.visibility = 'visible';
                    
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
            
            // Добавляем обработчик для обновления информации о скорости при повороте экрана
            window.addEventListener('orientationchange', () => {
                setTimeout(fixSafariVelocityInfo, 300);
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

        // Сохраняем исходные координаты и размер точки
        pulse.originalX = pulse.offsetLeft;
        pulse.originalY = pulse.offsetTop;
        
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
            
            // Фиксируем положение точки перед взаимодействием
            const rect = pulse.getBoundingClientRect();
            pulse.fixedLeft = rect.left;
            pulse.fixedTop = rect.top;
            
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
                
                // Добавляем класс для отключения всех пульсаций
                document.body.classList.add('has-active-point');
                
                // Принудительно применяем стили для активной точки, чтобы исправить возможные конфликты
                requestAnimationFrame(() => {
                    // Сначала удаляем все анимации со всех пульсирующих колец
                    const allRings = document.querySelectorAll('.pulse-ring');
                    allRings.forEach(ring => {
                        // Просто удаляем все inline стили, чтобы CSS правила применились
                        ring.style.cssText = '';
                        
                        // Триггерим перерисовку
                        void ring.offsetWidth;
                        
                        // Устанавливаем только необходимые стили для анимации
                        ring.style.animation = 'none';
                        ring.style.opacity = '0';
                        ring.style.display = 'none';
                    });
                    
                    // Затем устанавливаем правильные стили для текущей точки
                    const ring = pulse.querySelector('.pulse-ring');
                    if (ring) {
                        ring.style.animation = 'none';
                        ring.style.opacity = '0';
                        ring.style.display = 'none';
                    }
                    
                    // Фиксируем текущую позицию активной точки
                    const rect = pulse.getBoundingClientRect();
                    if (rect.width && rect.height) {
                        // Принудительно фиксируем размер и позицию
                        pulse.style.transform = 'translate3d(0, 0, 0)';
                        pulse.style.left = `${pulse.fixedLeft}px`;
                        pulse.style.top = `${pulse.fixedTop}px`;
                    }
                });
            } else {
                // Деактивируем точку при повторном касании
                pulse.classList.remove('active');
                document.querySelector('.container').classList.remove('has-active');
                document.body.classList.remove('has-active-point');
                
                // Восстанавливаем исходные стили
                pulse.style.transform = '';
                
                // Восстанавливаем оригинальную позицию, если была сохранена
                if (pulse.originalX !== undefined && pulse.originalY !== undefined) {
                    pulse.style.left = `${pulse.originalX}px`;
                    pulse.style.top = `${pulse.originalY}px`;
                    
                    // Обновляем posX и posY для правильной физики
                    pulse.posX = pulse.originalX;
                    pulse.posY = pulse.originalY;
                }
                
                // Восстанавливаем анимацию для всех пульсирующих колец
                const allRings = document.querySelectorAll('.pulse-ring');
                allRings.forEach(ring => {
                    // Просто удаляем все inline стили, чтобы CSS правила применились
                    ring.style.cssText = '';
                    
                    // Триггерим перерисовку
                    void ring.offsetWidth;
                    
                    // Устанавливаем только необходимые стили для анимации
                    ring.style.animation = 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite';
                    ring.style.opacity = '1';
                });
                
                // Возобновляем отслеживание скорости
                isTrackingVelocity = true;
            }
        }, { passive: false });
        
        // Обработчик события touchend
        pulse.addEventListener('touchend', (e) => {
            // Если точка была активирована и это было короткое касание, сохраняем её активной
            // Иначе, если она не активирована, даем ей случайное направление движения
            if (!pulse.classList.contains('active')) {
                // Восстанавливаем движение если точка не активна
                pulse.velX = (Math.random() - 0.5) * 2;
                pulse.velY = (Math.random() - 0.5) * 2;
            } else {
                // Если точка активна, убеждаемся что она остается на месте
                pulse.velX = 0;
                pulse.velY = 0;
                
                // Принудительно обновляем стили, чтобы предотвратить сдвиг
                requestAnimationFrame(() => {
                    pulse.style.transform = 'translate3d(0, 0, 0)';
                });
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