// mobile.js
const controls = document.querySelector('.controls');

// Константы для инерции
const mobileFrictionFactor = 0.9995; // Еще более плавное затухание
const mobileMinVelocity = 0.4; // Уменьшаем минимальную скорость в 4 раза (было 0.4)
const mobileInertiaDecayTime = 150000; // Сокращаем время затухания инерции (было 75000)
const mobileCollisionInertiaFactor = 5.0; // Увеличиваем коэффициент импульса при столкновении (было 0.5)
const mobileVelocityThreshold = 1050.0; // Снижаем порог скорости для определения свайпа (было 2000)
const mobileReleaseInertiaFactor = 0.000015; // Уменьшаем коэффициент инерции еще в 100 раз (было 0.0015)

// Константа для расширения области касания (в пикселях)
const touchAreaExpansion = 15; // Расширяет область касания на 15px вокруг видимой точки

// Переменные для отслеживания скорости касания (курсор для мобильных устройств)
let mobileTouchX = 0;
let mobileTouchY = 0;
let mobileTouchTime = 0;
let mobileTouchVelocityX = 0;
let mobileTouchVelocityY = 0;
let mobileTouchVelocity = 0;
const mobileTouchVelocityTrackingPeriod = 50; // мс

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
    // Удаляем глобальную переменную для отслеживания скорости точек и флаг
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
            
            // Перезаписываем глобальную функцию updateVelocityInfo для мобильных устройств
            window.updateVelocityInfo = function() {
                // Вызываем оригинальную функцию для базового обновления информации
                originalUpdateVelocityInfo();
                
                // Дополнительная проверка для iOS Safari
                if (window.isIOSSafari) {
                    const velocityInfo = document.querySelector('.velocity-info');
                    if (velocityInfo) {
                        // Проверяем, открыто ли меню
                        const isMenuOpen = document.querySelector('.container').classList.contains('has-active-menu');
                        
                        if (isMenuOpen) {
                            // Показываем информацию о скорости только при открытом меню
                            velocityInfo.style.display = 'block';
                            velocityInfo.style.opacity = '1';
                            velocityInfo.style.visibility = 'visible';
                            
                            // Проверяем, есть ли информация о курсоре в тексте
                            if (velocityInfo.textContent.trim() && !velocityInfo.textContent.includes('Курсор:') && mobileTouchVelocity > 0.1) {
                                // Добавляем информацию о скорости касания в начало
                                const currentText = velocityInfo.textContent;
                                velocityInfo.textContent = `Курсор: ${mobileTouchVelocity.toFixed(2)}\n${currentText}`;
                            }
                        } else {
                            // Скрываем информацию
                            velocityInfo.style.opacity = '0';
                        }
                    }
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
            // Обновляем логику, удаляя проверки на уведомление о высокой скорости
            const notifications = document.querySelectorAll('.notification.active:not(.collapsed)');
            notifications.forEach(notification => {
                const handler = notification.id === 'tap' ? tapNotification : null;
                
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
        
        // Исключаем проверку на highVelocity
        const handler = notification.id === 'tap' ? tapNotification : null;
        if (!handler) return;
        
        // Используем setTimeout для лучшего различия между tap и scroll
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
        // Добавляем стиль для расширения области касания
        const style = document.createElement('style');
        style.textContent = `
            .pulse[data-id="${pulse.dataset.id || Math.random()}"]::before {
                content: '';
                position: absolute;
                top: -${touchAreaExpansion}px;
                left: -${touchAreaExpansion}px;
                right: -${touchAreaExpansion}px;
                bottom: -${touchAreaExpansion}px;
                z-index: -1;
            }
        `;
        document.head.appendChild(style);
        
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
            velocityY: 0,
            dragHistory: [] // Добавляем массив для истории движений
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
                    // Устанавливаем новую позицию точки с учетом границ экрана
                    pulse.posX = Math.max(0, Math.min(window.innerWidth - pulse.offsetWidth, pulse.originalX + offsetX));
                    pulse.posY = Math.max(0, Math.min(window.innerHeight - pulse.offsetHeight, pulse.originalY + offsetY));
                    
                    // Проверяем только невидимые барьеры справа
                    const rightMargin = 20;
                    const viewportRight = window.innerWidth;
                    const pulseSize = pulse.offsetWidth || 26;
                    
                    // Проверяем правый край экрана
                    if (pulse.posX + pulseSize > viewportRight - rightMargin) {
                        // Получаем все блоки, которые могут быть справа
                        const header = document.querySelector('.header');
                        const controls = document.querySelector('.controls');
                        const dropdownMenu = document.querySelector('.dropdown-menu');
                        
                        const headerRect = header.getBoundingClientRect();
                        const controlsRect = controls.getBoundingClientRect();
                        
                        const rightElements = [headerRect, controlsRect];
                        if (dropdownMenu.classList.contains('active')) {
                            rightElements.push(dropdownMenu.getBoundingClientRect());
                        }
                        
                        let inGap = true;
                        
                        // Проверяем, находится ли точка в вертикальном диапазоне какого-либо блока
                        for (const elemRect of rightElements) {
                            if (pulse.posY < elemRect.bottom && 
                                pulse.posY + pulseSize > elemRect.top && 
                                elemRect.right > viewportRight - rightMargin * 2) {
                                inGap = false;
                                break;
                            }
                        }
                        
                        // Если точка находится в щели, ограничиваем её позицию
                        if (inGap) {
                            pulse.posX = viewportRight - pulseSize - rightMargin;
                        }
                    }
                    
                    // Применяем позицию с transform для лучшей производительности
                    pulse.style.transform = `translate3d(${pulse.posX}px, ${pulse.posY}px, 0)`;
                    
                    // Проверяем, находится ли точка под UI элементами при перетаскивании
                    checkMobileBarriers(pulse);
                    
                    // Отслеживаем скорость перемещения для этой точки
                    const now = Date.now();
                    const state = mobileDragState.get(pulse);
                    
                    // Инициализируем историю перетаскивания, если её нет
                    if (!state.dragHistory) {
                        state.dragHistory = [];
                    }
                    
                    if (now - state.lastTime > 50) { // Чаще обновляем для более точного отслеживания
                        const vx = (pulse.posX - state.lastPosX) / (now - state.lastTime) * 1000;
                        const vy = (pulse.posY - state.lastPosY) / (now - state.lastTime) * 1000;
                        
                        // Сохраняем историю последних движений для сглаживания
                        state.dragHistory.push({
                            vx: vx,
                            vy: vy,
                            time: now
                        });
                        
                        // Ограничиваем размер истории
                        if (state.dragHistory.length > 10) {
                            state.dragHistory.shift();
                        }
                        
                        state.velocityX = vx;
                        state.velocityY = vy;
                        
                        // Обновляем глобальные переменные для совместимости с основным кодом
                        window.dragVelocityX = vx;
                        window.dragVelocityY = vy;
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
        
        // Обработчик события touchend с улучшенной плавностью и проверкой активной точки
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
            
            // Проверяем, есть ли активная точка на экране
            const isAnyPulseActive = document.querySelector('.pulse.active') !== null;
            
            // Если точка не активна и нет других активных точек, проверяем необходимость инерции
            if (!pulse.classList.contains('active') && !isAnyPulseActive) {
                if (wasDragged && state.velocityX && state.velocityY) {
                    // Вычисляем текущую скорость перемещения
                    const currentVelocity = Math.sqrt(state.velocityX * state.velocityX + state.velocityY * state.velocityY);
                    
                    // Определяем, был ли это свайп (быстрое движение) или плавное перетаскивание
                    const isSwipe = currentVelocity > mobileVelocityThreshold;
                    
                    // Применяем инерцию только при свайпе
                    if (isSwipe) {
                        // Получаем направление движения
                        const angle = Math.atan2(state.velocityY, state.velocityX);
                        
                        // Получаем силу броска в зависимости от скорости свайпа
                        const swipeSpeed = Math.sqrt(state.velocityX * state.velocityX + state.velocityY * state.velocityY);
                        const throwPower = swipeSpeed * 0.03; // Чуть меньше множитель для мобильных
                        const maxThrowPower = 15; // Ограничиваем максимальную скорость для мобильных
                        const actualThrowPower = Math.min(throwPower, maxThrowPower);
                        
                        // Применяем инерцию, масштабированную по скорости свайпа
                        pulse.velX = Math.cos(angle) * actualThrowPower;
                        pulse.velY = Math.sin(angle) * actualThrowPower;
                        
                        console.log("Скорость свайпа:", swipeSpeed, "Сила броска:", actualThrowPower);
                        
                        // Добавляем метки для затухающей инерции
                        pulse.justReleased = true;
                        pulse.releaseTime = Date.now();
                        
                        // Устанавливаем минимальную скорость для обеспечения долгого движения
                        const currentSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                        if (currentSpeed < mobileMinVelocity * 1.5) {
                            const velocityAngle = Math.atan2(pulse.velY, pulse.velX);
                            pulse.velX = Math.cos(velocityAngle) * mobileMinVelocity * 1.5;
                            pulse.velY = Math.sin(velocityAngle) * mobileMinVelocity * 1.5;
                        }
                    } else {
                        // Если это было плавное перетаскивание, останавливаем точку
                        pulse.velX = 0;
                        pulse.velY = 0;
                    }
                } else {
                    // Если не было перетаскивания, останавливаем точку
                    pulse.velX = 0;
                    pulse.velY = 0;
                }
            } else {
                // Если точка активна или есть другая активная точка, останавливаем её
                pulse.velX = 0;
                pulse.velY = 0;
                
                // Принудительно обновляем стили, чтобы предотвратить сдвиг
                requestAnimationFrame(() => {
                    pulse.style.transform = 'translate3d(0, 0, 0)';
                });
            }
            
            // Сбрасываем переменные перетаскивания
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
            // Проверяем, было ли касание на точке или рядом с ней
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            // Ищем ближайшую точку
            let nearestPulse = null;
            let minDistance = Infinity;
            
            pulses.forEach(pulse => {
                // Получаем положение и размер точки
                const rect = pulse.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Вычисляем расстояние от касания до центра точки
                const distance = Math.sqrt((touchX - centerX) ** 2 + (touchY - centerY) ** 2);
                
                // Проверяем, находится ли касание в расширенной области
                const expandedRadius = rect.width / 2 + touchAreaExpansion;
                
                if (distance <= expandedRadius && distance < minDistance) {
                    minDistance = distance;
                    nearestPulse = pulse;
                }
            });
            
            // Если нашли точку в радиусе обнаружения
            if (nearestPulse) {
                // Предотвращаем дребезг касаний
                const now = Date.now();
                if (now - this.touchStartTime < 300 && nearestPulse === this.activeElement) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                this.touchStartTime = now;
                this.activeElement = nearestPulse;
                
                // Вызываем обработку касания точки
                this.handlePulseTouchStart(e, nearestPulse);
                e.preventDefault(); // Предотвращаем стандартное поведение
            } else {
                // Ищем точку через стандартный метод
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
            }
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
                            
                            // Для более плавного отскока от активной точки
                            const baseImpulse = Math.max(mobileMinVelocity * 5, oldSpeed * mobileCollisionInertiaFactor);
                            pulse.velX += normalX * baseImpulse * 0.7; // Снижаем силу импульса
                            pulse.velY += normalY * baseImpulse * 0.7;
                            
                            // Смягчаем скорость после столкновения для более реалистичного эффекта
                            pulse.velX *= 0.85;
                            pulse.velY *= 0.85;
                            
                            // Отмечаем точку как недавно столкнувшуюся и устанавливаем время столкновения
                            pulse.justCollided = true;
                            pulse.collisionTime = Date.now();
                            
                            // Ограничиваем максимальную скорость после столкновения
                            const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                            if (newSpeed > 25) { // Снижаем максимальную скорость (было 40)
                                const factor = 25 / newSpeed;
                                pulse.velX *= factor;
                                pulse.velY *= factor;
                            }
                            
                            // Обеспечиваем минимальную скорость после столкновения
                            if (newSpeed < mobileMinVelocity * 3) { // Снижаем минимальную скорость (было 5)
                                const factor = (mobileMinVelocity * 3) / Math.max(newSpeed, 0.1);
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
                        pulse.velX = Math.abs(pulse.velX) * 0.5; // Уменьшаем скорость при отскоке
                    } else if (pulse.posX >= windowWidth - pulseSize) {
                        pulse.posX = windowWidth - pulseSize;
                        pulse.velX = -Math.abs(pulse.velX) * 0.5; // Уменьшаем скорость при отскоке
                    }
                    
                    if (pulse.posY <= 0) {
                        pulse.posY = 0;
                        pulse.velY = Math.abs(pulse.velY) * 0.5; // Уменьшаем скорость при отскоке
                    } else if (pulse.posY >= windowHeight - pulseSize) {
                        pulse.posY = windowHeight - pulseSize;
                        pulse.velY = -Math.abs(pulse.velY) * 0.5; // Уменьшаем скорость при отскоке
                    }
                    
                    // Добавляем проверку невидимых барьеров
                    checkMobileBarriers(pulse);
                }
            });
        }
    };
}

// Функция для отслеживания скорости касания (курсора) на мобильных устройствах
function updateMobileTouchVelocity(e) {
    const currentTime = Date.now();
    
    // Получаем координаты касания
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : mobileTouchX;
    const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : mobileTouchY;
    
    // Рассчитываем скорость, только если прошло определенное время
    if (currentTime - mobileTouchTime > mobileTouchVelocityTrackingPeriod) {
        const dt = (currentTime - mobileTouchTime) / 1000; // в секундах
        
        if (dt > 0 && mobileTouchTime > 0) {
            mobileTouchVelocityX = (clientX - mobileTouchX) / dt;
            mobileTouchVelocityY = (clientY - mobileTouchY) / dt;
            mobileTouchVelocity = Math.sqrt(mobileTouchVelocityX * mobileTouchVelocityX + mobileTouchVelocityY * mobileTouchVelocityY);
        }
        
        mobileTouchX = clientX;
        mobileTouchY = clientY;
        mobileTouchTime = currentTime;
        
        // Обновляем глобальные переменные для совместимости
        if (window.cursorVelocity !== undefined) {
            window.cursorVelocity = mobileTouchVelocity;
            window.cursorVelocityX = mobileTouchVelocityX;
            window.cursorVelocityY = mobileTouchVelocityY;
        }
        
        // Обновляем информацию о скорости
        if (typeof updateVelocityInfo === 'function') {
            requestAnimationFrame(updateVelocityInfo);
        }
    }
}

// Добавляем обработчик событий для отслеживания движений касания
document.addEventListener('touchmove', updateMobileTouchVelocity, { passive: true });

// Сбрасываем скорость касания при завершении
document.addEventListener('touchend', () => {
    setTimeout(() => {
        mobileTouchVelocity = 0;
        
        // Обновляем глобальные переменные для совместимости
        if (window.cursorVelocity !== undefined) {
            window.cursorVelocity = 0;
        }
        
        // Обновляем информацию о скорости
        if (typeof updateVelocityInfo === 'function') {
            requestAnimationFrame(updateVelocityInfo);
        }
    }, 200);
});

// Добавляем функцию проверки невидимых барьеров для мобильных устройств
function checkMobileBarriers(pulse) {
    // Получаем размер точки
    const pulseSize = pulse.offsetWidth || 26;
    const pulseRect = { 
        x: pulse.posX, 
        y: pulse.posY, 
        width: pulseSize, 
        height: pulseSize 
    };
    
    let collided = false;
    
    // Получаем прямоугольники UI элементов
    const header = document.querySelector('.header');
    const controls = document.querySelector('.controls');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    const headerRect = header.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    const dropdownRect = dropdownMenu.getBoundingClientRect();
    
    // Проверяем, находится ли точка под UI элементами, и увеличиваем их яркость
    
    // Хедер
    if (!header.classList.contains('hidden') && 
        pulseRect.x < headerRect.right && 
        pulseRect.x + pulseRect.width > headerRect.left &&
        pulseRect.y < headerRect.bottom && 
        pulseRect.y + pulseRect.height > headerRect.top) {
        
        // Увеличиваем яркость хедера
        header.classList.add('highlight');
        setTimeout(() => {
            header.classList.remove('highlight');
        }, 300);
    }
    
    // Контролы
    if (!controls.classList.contains('hidden') && 
        pulseRect.x < controlsRect.right && 
        pulseRect.x + pulseRect.width > controlsRect.left &&
        pulseRect.y < controlsRect.bottom && 
        pulseRect.y + pulseRect.height > controlsRect.top) {
        
        // Увеличиваем яркость контролов
        controls.classList.add('highlight');
        setTimeout(() => {
            controls.classList.remove('highlight');
        }, 300);
    }
    
    // Выпадающее меню
    if (dropdownMenu.classList.contains('active') && 
        pulseRect.x < dropdownRect.right && 
        pulseRect.x + pulseRect.width > dropdownRect.left &&
        pulseRect.y < dropdownRect.bottom && 
        pulseRect.y + pulseRect.height > dropdownRect.top) {
        
        // Увеличиваем яркость выпадающего меню
        dropdownMenu.classList.add('highlight');
        setTimeout(() => {
            dropdownMenu.classList.remove('highlight');
        }, 300);
    }
    
    // Добавляем невидимые барьеры справа
    const rightMargin = 20; // Отступ от правого края экрана
    
    // Находим все блоки, которые расположены у правого края экрана
    const rightElements = [headerRect, controlsRect];
    if (dropdownMenu.classList.contains('active')) {
        rightElements.push(dropdownRect);
    }
    
    // Проверяем, находится ли точка в щели между блоками и правым краем экрана
    const viewportRight = window.innerWidth;
    
    // Если точка находится близко к правому краю экрана
    if (pulseRect.x + pulseRect.width > viewportRight - rightMargin) {
        let inGap = true;
        
        // Проверяем, находится ли точка в вертикальном диапазоне какого-либо блока
        for (const elemRect of rightElements) {
            if (pulseRect.y < elemRect.bottom && 
                pulseRect.y + pulseRect.height > elemRect.top && 
                elemRect.right > viewportRight - rightMargin * 2) {
                inGap = false;
                break;
            }
        }
        
        // Если точка находится в щели, отталкиваем её
        if (inGap) {
            pulse.posX = viewportRight - pulseRect.width - rightMargin;
            if (pulse.velX) pulse.velX = -Math.abs(pulse.velX) * 0.5; // Отражаем с уменьшением скорости
            collided = true;
            
            // Обновляем визуальное положение для мобильных устройств
            pulse.style.transform = `translate3d(${pulse.posX}px, ${pulse.posY}px, 0)`;
        }
    }
    
    return collided;
}