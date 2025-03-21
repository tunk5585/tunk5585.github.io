const menuIcon = document.querySelector('.menu-icon');
const dropdownMenu = document.querySelector('.dropdown-menu');
const header = document.querySelector('.header');
const headerLogo = document.querySelector('.header-logo');
const container = document.querySelector('.container');
const pulses = document.querySelectorAll('.pulse');
const linesSvg = document.querySelector('#lines');
const activeBorderSvg = document.querySelector('#active-border');
const playPauseBtn = document.querySelector('.play-pause');
const sizeSlider = document.querySelector('.size-slider');
const controls = document.querySelector('.controls');
const toggleGuiBtn = document.querySelector('.toggle-gui');
const velocityInfo = document.querySelector('.velocity-info');
const notification = document.querySelector('.notification');
const notificationText = document.createElement('div');
notificationText.className = 'notification-text';

const notificationExclamation = document.createElement('div');
notificationExclamation.className = 'notification-exclamation';
notificationExclamation.textContent = '!';

// Очищаем уведомление перед добавлением элементов
while (notification.firstChild) {
    notification.removeChild(notification.firstChild);
}

notification.appendChild(notificationText);
notification.appendChild(notificationExclamation);

let viewportWidth, viewportHeight;
let isAnimating = true;
let pulseScale = 1; // Изначально 1 (оригинальный размер)
let isDraggingSlider = false;
let isGuiVisible = true; // Новая переменная для отслеживания состояния GUI
let isHighVelocityTriggered = false; // Добавляем флаг для отслеживания состояния триггера
const basePulseSize = 26; // Базовый размер точки
const activeScaleMultiplier = 5; // Множитель для активной точки
const minFontSize = 12; // Минимальный размер шрифта для текста

// Добавляем массив для хранения ID соединений
const connectionIds = new Map();

// Добавляем Map для хранения времени соединений
const connectionTimes = new Map();

// Система событий
const EventSystem = {
    events: new Map(),
    triggers: new Map(), // Хранит состояния триггеров
    
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
            this.triggers.set(eventName, false);
        }
        this.events.get(eventName).add(callback);
    },
    
    trigger(eventName, data) {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            this.triggers.set(eventName, true);
            callbacks.forEach(callback => callback(data));
        }
    },
    
    reset(eventName) {
        if (this.triggers.has(eventName)) {
            this.triggers.set(eventName, false);
        }
    },
    
    isTriggered(eventName) {
        return this.triggers.get(eventName) || false;
    }
};

// Система уведомлений
const NotificationSystem = {
    isActive: false,
    collapseTimer: null,
    currentMessage: '',
    
    show(message, force = false) {
        // Если сообщение то же самое и не force, игнорируем
        if (!force && message === this.currentMessage && this.isActive) {
            return;
        }
        
        // Очищаем предыдущий таймер
        this.clearTimer();
        
        this.currentMessage = message;
        const textElement = notification.querySelector('.notification-text');
        textElement.textContent = message;
        
        // Сбрасываем все классы
        notification.classList.remove('collapsed', 'collapsing', 'hide');
        
        // Показываем уведомление
        notification.classList.add('show');
        this.isActive = true;
        
        // Устанавливаем новый таймер
        this.setCollapseTimer();
    },

    setCollapseTimer() {
        this.clearTimer();
        this.collapseTimer = setTimeout(() => {
            if (this.isActive && !notification.matches(':hover')) {
                this.collapse();
            }
        }, 5000);
    },

    clearTimer() {
        if (this.collapseTimer) {
            clearTimeout(this.collapseTimer);
            this.collapseTimer = null;
        }
    },

    collapse() {
        if (!this.isActive) return;
        
        notification.classList.add('collapsing');
        setTimeout(() => {
            if (this.isActive) {
                notification.classList.add('collapsed');
                notification.classList.remove('collapsing');
            }
        }, 400);
    },

    expand() {
        if (!this.isActive) return;
        notification.classList.remove('collapsed', 'collapsing');
    },

    hide() {
        this.clearTimer();
        this.currentMessage = '';
        this.isActive = false;
        
        // Просто добавляем класс hide, сохраняя текущее состояние
        notification.classList.add('hide');
        notification.classList.remove('show');
    },

    toggle() {
        if (notification.classList.contains('collapsed')) {
            this.expand();
        } else {
            this.collapse();
        }
    }
};

// Регистрируем обработчик события скорости
EventSystem.on('highVelocity', () => {
    NotificationSystem.show('Внимание! Одна из точек достигла критической скорости!');
});

// Функция для генерации случайного символа (буква или цифра)
function getRandomChar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
}

// Функция для генерации или обновления ID соединения
function getConnectionId(id1, id2) {
    const connectionKey = [id1, id2].sort().join('-');
    
    if (!connectionIds.has(connectionKey)) {
        connectionIds.set(connectionKey, Array(5).fill('0'));
    }
    
    // Обновляем один случайный символ только если анимация активна
    if (isAnimating) {
        const currentId = connectionIds.get(connectionKey);
        const posToUpdate = Math.floor(Math.random() * 5);
        currentId[posToUpdate] = getRandomChar();
        connectionIds.set(connectionKey, currentId);
    }
    
    return connectionIds.get(connectionKey).join('');
}

function updateViewportSize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
}

updateViewportSize();
window.addEventListener('resize', updateViewportSize);

// Функция определения мобильного устройства
function isMobileDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// Новая логика для бургер-меню
function handleBurgerInteraction(e) {
    const headerRect = header.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    // Проверяем, находится ли точка взаимодействия в нижней половине хедера
    if (y >= headerRect.top + headerRect.height / 2 &&
        y <= headerRect.bottom &&
        x >= headerRect.left &&
        x <= headerRect.right) {
        menuIcon.classList.add('active');
        dropdownMenu.classList.add('active');
        container.classList.add('has-active-menu');
    }
}

// Обработчик для закрытия меню
function handleMenuClose(e) {
    const headerRect = header.getBoundingClientRect();
    const x = e.type.includes('touch') ? 
        (e.changedTouches[0] ? e.changedTouches[0].clientX : e.clientX) : 
        e.clientX;
    const y = e.type.includes('touch') ? 
        (e.changedTouches[0] ? e.changedTouches[0].clientY : e.clientY) : 
        e.clientY;
    
    const relatedTarget = e.relatedTarget || e.toElement;
    
    if (!relatedTarget || 
        (!header.contains(relatedTarget) && !dropdownMenu.contains(relatedTarget)) ||
        (y < headerRect.top + headerRect.height / 2) ||
        (x < headerRect.left || x > headerRect.right)) {
        menuIcon.classList.remove('active');
        dropdownMenu.classList.remove('active');
        container.classList.remove('has-active-menu');
    }
}

// Удаляем все существующие обработчики
header.removeEventListener('mouseover', handleBurgerInteraction);
header.removeEventListener('mouseout', handleMenuClose);
header.removeEventListener('click', handleBurgerInteraction);
header.removeEventListener('touchstart', handleBurgerInteraction);
header.removeEventListener('touchend', handleMenuClose);

// Добавляем обработчики в зависимости от типа устройства
if (isMobileDevice()) {
    // Для мобильных устройств используем только тап
    menuIcon.addEventListener('click', (e) => {
        e.preventDefault();
        if (menuIcon.classList.contains('active')) {
            menuIcon.classList.remove('active');
            dropdownMenu.classList.remove('active');
            container.classList.remove('has-active-menu');
        } else {
            menuIcon.classList.add('active');
            dropdownMenu.classList.add('active');
            container.classList.add('has-active-menu');
        }
    });

    // Закрытие меню при тапе вне области
    document.addEventListener('touchstart', (e) => {
        if (!header.contains(e.target) && !dropdownMenu.contains(e.target)) {
            menuIcon.classList.remove('active');
            dropdownMenu.classList.remove('active');
            container.classList.remove('has-active-menu');
        }
    }, { passive: true });

    notification.addEventListener('click', (e) => {
        e.stopPropagation();
        NotificationSystem.toggle();
    });

    // Обработка тапа вне уведомления
    document.addEventListener('click', (e) => {
        if (!notification.contains(e.target) && 
            NotificationSystem.isActive && 
            !notification.classList.contains('collapsed')) {
            NotificationSystem.collapse();
        }
    });
} else {
    // Для десктопа используем наведение
    header.addEventListener('mouseover', handleBurgerInteraction);
    header.addEventListener('mouseout', handleMenuClose);
    
    dropdownMenu.addEventListener('mouseover', () => {
        menuIcon.classList.add('active');
        dropdownMenu.classList.add('active');
        container.classList.add('has-active-menu');
    });
    
    dropdownMenu.addEventListener('mouseout', handleMenuClose);

    notification.addEventListener('mouseenter', () => {
        if (NotificationSystem.isActive) {
            NotificationSystem.expand();
            NotificationSystem.clearTimer();
        }
    });
    
    notification.addEventListener('mouseleave', () => {
        if (NotificationSystem.isActive) {
            NotificationSystem.collapse();
            NotificationSystem.setCollapseTimer();
        }
    });
}

document.addEventListener('click', (e) => {
    if (!menuIcon.contains(e.target) && !e.target.closest('.pulse')) {
        pulses.forEach(p => {
            if (p.classList.contains('active')) {
                p.classList.remove('active');
                container.classList.remove('has-active');
                header.classList.remove('hidden');
                controls.classList.remove('hidden');
                const oldSize = basePulseSize * pulseScale * activeScaleMultiplier;
                const newSize = basePulseSize * pulseScale;
                const sizeDiff = (oldSize - newSize) / 2;
                p.posX += sizeDiff;
                p.posY += sizeDiff;
                p.style.left = `${p.posX}px`;
                p.style.top = `${p.posY}px`;
                p.style.width = `${newSize}px`;
                p.style.height = `${newSize}px`;
                p.velX = (Math.random() - 0.5) * 2;
                p.velY = (Math.random() - 0.5) * 2;
            }
        });
    }
});

function checkCollisionWithUI(pulse) {
    const headerRect = header.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    const dropdownRect = dropdownMenu.getBoundingClientRect();
    const pulseSize = basePulseSize * (pulse.classList.contains('active') ? pulseScale * activeScaleMultiplier : pulseScale);
    const pulseRect = { x: pulse.posX, y: pulse.posY, width: pulseSize, height: pulseSize };
    let collided = false;

    if (!header.classList.contains('hidden') && 
        pulseRect.x < headerRect.right && 
        pulseRect.x + pulseRect.width > headerRect.left &&
        pulseRect.y < headerRect.bottom && 
        pulseRect.y + pulseRect.height > headerRect.top) {
        if (pulseRect.x + pulseRect.width / 2 < headerRect.left + headerRect.width / 2) {
            pulse.posX = headerRect.left - pulseRect.width;
            pulse.velX = -Math.abs(pulse.velX);
        } else {
            pulse.posX = headerRect.right;
            pulse.velX = Math.abs(pulse.velX);
        }
        collided = true;
    }

    if (!controls.classList.contains('hidden') && 
        pulseRect.x < controlsRect.right && 
        pulseRect.x + pulseRect.width > controlsRect.left &&
        pulseRect.y < controlsRect.bottom && 
        pulseRect.y + pulseRect.height > controlsRect.top) {
        if (pulseRect.x + pulseRect.width / 2 < controlsRect.left + controlsRect.width / 2) {
            pulse.posX = controlsRect.left - pulseRect.width;
            pulse.velX = -Math.abs(pulse.velX);
        } else {
            pulse.posX = controlsRect.right;
            pulse.velX = Math.abs(pulse.velX);
        }
        collided = true;
    }

    if (dropdownMenu.classList.contains('active') && 
        pulseRect.x < dropdownRect.right && 
        pulseRect.x + pulseRect.width > dropdownRect.left &&
        pulseRect.y < dropdownRect.bottom && 
        pulseRect.y + pulseRect.height > dropdownRect.top) {
        if (pulseRect.x + pulseRect.width / 2 < dropdownRect.left + dropdownRect.width / 2) {
            pulse.posX = dropdownRect.left - pulseRect.width;
            pulse.velX = -Math.abs(pulse.velX);
        } else {
            pulse.posX = dropdownRect.right;
            pulse.velX = Math.abs(pulse.velX);
        }
        collided = true;
    }

    return collided;
}

function isOverlapping(x, y, pulses, minDistance) {
    for (let pulse of pulses) {
        if (pulse.posX !== undefined && pulse.posY !== undefined) {
            const dx = x - pulse.posX;
            const dy = y - pulse.posY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const effectiveDistance = minDistance * (pulse.classList.contains('active') ? pulseScale * activeScaleMultiplier : pulseScale);
            if (distance < effectiveDistance) return true;
        }
    }
    return false;
}

pulses.forEach(pulse => {
    let attempts = 0;
    const maxAttempts = 50;
    const minDistance = 50;

    do {
        pulse.posX = Math.random() * (viewportWidth - basePulseSize);
        pulse.posY = Math.random() * (viewportHeight - basePulseSize);
        attempts++;
    } while (isOverlapping(pulse.posX, pulse.posY, pulses, minDistance) && attempts < maxAttempts);

    pulse.velX = (Math.random() - 0.5) * 2;
    pulse.velY = (Math.random() - 0.5) * 2;
    pulse.style.left = `${pulse.posX}px`;
    pulse.style.top = `${pulse.posY}px`;
    pulse.connectedTo = new Set();
    pulse.isDragging = false;
    pulse.style.transformOrigin = 'center center';
    const pulseSize = basePulseSize * pulseScale;
    pulse.style.width = `${pulseSize}px`;
    pulse.style.height = `${pulseSize}px`;
    const content = pulse.querySelector('.pulse-content');
    content.style.fontSize = `${Math.max(60 * (pulseScale / 2), minFontSize * 3)}px`;
    content.style.transform = `translate(-50%, -50%) scale(${pulseScale / 2})`;

    let startX, startY;

    function startInteraction(e) {
        e.preventDefault();
        pulse.isDragging = true;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        pulse.velX = 0;
        pulse.velY = 0;
    }

    function movePulse(e) {
        if (pulse.isDragging) {
            const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const pulseSize = basePulseSize * (pulse.classList.contains('active') ? pulseScale * activeScaleMultiplier : pulseScale);
            let newPosX = Math.max(0, Math.min(currentX - pulseSize / 2, viewportWidth - pulseSize));
            let newPosY = Math.max(0, Math.min(currentY - pulseSize / 2, viewportHeight - pulseSize));

            const headerRect = header.getBoundingClientRect();
            const controlsRect = controls.getBoundingClientRect();
            const dropdownRect = dropdownMenu.getBoundingClientRect();
            if (!header.classList.contains('hidden') && 
                newPosX + pulseSize > headerRect.left && newPosX < headerRect.right &&
                newPosY + pulseSize > headerRect.top && newPosY < headerRect.bottom) {
                return;
            }
            if (!controls.classList.contains('hidden') && 
                newPosX + pulseSize > controlsRect.left && newPosX < controlsRect.right &&
                newPosY + pulseSize > controlsRect.top && newPosY < controlsRect.bottom) {
                return;
            }
            if (dropdownMenu.classList.contains('active') && 
                newPosX + pulseSize > dropdownRect.left && newPosX < dropdownRect.right &&
                newPosY + pulseSize > dropdownRect.top && newPosY < dropdownRect.bottom) {
                return;
            }

            pulse.posX = newPosX;
            pulse.posY = newPosY;
            pulse.style.left = `${pulse.posX}px`;
            pulse.style.top = `${pulse.posY}px`;
        }
    }

    function endInteraction(e) {
        if (pulse.isDragging) {
            const currentX = e.type.includes('touch') ? (e.changedTouches[0] ? e.changedTouches[0].clientX : startX) : e.clientX;
            const currentY = e.type.includes('touch') ? (e.changedTouches[0] ? e.changedTouches[0].clientY : startY) : e.clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                e.stopPropagation();
                if (pulse.classList.contains('active')) {
                    pulse.classList.remove('active');
                    container.classList.remove('has-active');
                    header.classList.remove('hidden');
                    controls.classList.remove('hidden');
                    const oldSize = basePulseSize * pulseScale * activeScaleMultiplier;
                    const newSize = basePulseSize * pulseScale;
                    const sizeDiff = (oldSize - newSize) / 2;
                    pulse.posX += sizeDiff;
                    pulse.posY += sizeDiff;
                    pulse.style.left = `${pulse.posX}px`;
                    pulse.style.top = `${pulse.posY}px`;
                    pulse.style.width = `${newSize}px`;
                    pulse.style.height = `${newSize}px`;
                    pulse.velX = (Math.random() - 0.5) * 2;
                    pulse.velY = (Math.random() - 0.5) * 2;
                } else {
                    pulses.forEach(p => {
                        if (p.classList.contains('active')) {
                            p.classList.remove('active');
                            const oldSize = basePulseSize * pulseScale * activeScaleMultiplier;
                            const newSize = basePulseSize * pulseScale;
                            const sizeDiff = (oldSize - newSize) / 2;
                            p.posX += sizeDiff;
                            p.posY += sizeDiff;
                            p.style.left = `${p.posX}px`;
                            p.style.top = `${p.posY}px`;
                            p.style.width = `${newSize}px`;
                            p.style.height = `${newSize}px`;
                            p.velX = (Math.random() - 0.5) * 2;
                            p.velY = (Math.random() - 0.5) * 2;
                        }
                    });
                    pulse.classList.add('active');
                    header.classList.add('hidden');
                    controls.classList.add('hidden');
                    const oldSize = basePulseSize * pulseScale;
                    const newSize = basePulseSize * pulseScale * activeScaleMultiplier;
                    const sizeDiff = (newSize - oldSize) / 2;
                    pulse.posX -= sizeDiff;
                    pulse.posY -= sizeDiff;
                    pulse.style.left = `${pulse.posX}px`;
                    pulse.style.top = `${pulse.posY}px`;
                    pulse.style.width = `${newSize}px`;
                    pulse.style.height = `${newSize}px`;
                    pulse.velX = 0;
                    pulse.velY = 0;
                    container.classList.add('has-active');
                    menuIcon.classList.remove('active');
                    dropdownMenu.classList.remove('active');
                    container.classList.remove('has-active-menu');
                }
            } else if (!pulse.classList.contains('active')) {
                pulse.velX = (Math.random() - 0.5) * 2;
                pulse.velY = (Math.random() - 0.5) * 2;
            }
        }
        pulse.isDragging = false;
    }

    pulse.addEventListener('mousedown', startInteraction);
    document.addEventListener('mousemove', movePulse);
    document.addEventListener('mouseup', endInteraction);

    pulse.addEventListener('touchstart', startInteraction);
    document.addEventListener('touchmove', movePulse);
    document.addEventListener('touchend', endInteraction);
});

// Функция для расчета скорости точки
function calculateVelocity(pulse) {
    if (!pulse.velX || !pulse.velY) return 0;
    return Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
}

// Обновляем функцию updateVelocityInfo для проверки скорости
function updateVelocityInfo() {
    let info = '';
    let hasHighVelocity = false;
    
    pulses.forEach(pulse => {
        const name = pulse.querySelector('.pulse-content').textContent.split(' ')[0];
        const velocity = calculateVelocity(pulse);
        
        if (velocity > 30) {
            hasHighVelocity = true;
        }
        
        if (container.classList.contains('has-active-menu')) {
            info += `${name}; Скорость: ${velocity.toFixed(2)}\n`;
        }
    });
    
    // Обработка события высокой скорости
    if (hasHighVelocity) {
        if (!EventSystem.isTriggered('highVelocity')) {
            EventSystem.trigger('highVelocity');
        }
    } else {
        if (EventSystem.isTriggered('highVelocity')) {
            NotificationSystem.hide();
            EventSystem.reset('highVelocity');
        }
    }
    
    if (container.classList.contains('has-active-menu')) {
        velocityInfo.textContent = info.trim();
    } else {
        velocityInfo.textContent = '';
    }
}

function update() {
    linesSvg.innerHTML = '';
    activeBorderSvg.innerHTML = '';
    updateVelocityInfo();

    pulses.forEach(pulse => {
        if (!pulse.classList.contains('active') && !pulse.isDragging && isAnimating) {
            pulse.posX += pulse.velX;
            pulse.posY += pulse.velY;

            checkCollisionWithUI(pulse);

            const activePulse = document.querySelector('.pulse.active');
            if (activePulse && pulse !== activePulse) {
                const pulseSize = basePulseSize * pulseScale;
                const activePulseSize = basePulseSize * pulseScale * activeScaleMultiplier;
                const dx = (pulse.posX + pulseSize / 2) - (activePulse.posX + activePulseSize / 2);
                const dy = (pulse.posY + pulseSize / 2) - (activePulse.posY + activePulseSize / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const pulseRadius = pulseSize / 2;
                const activePulseRadius = activePulseSize / 2;
                const minDistance = pulseRadius + activePulseRadius;

                if (distance < minDistance) {
                    const angle = Math.atan2(dy, dx);
                    const overlap = minDistance - distance;
                    
                    pulse.posX = activePulse.posX + activePulseSize / 2 + Math.cos(angle) * minDistance - pulseSize / 2;
                    pulse.posY = activePulse.posY + activePulseSize / 2 + Math.sin(angle) * minDistance - pulseSize / 2;
                    
                    const normalX = Math.cos(angle);
                    const normalY = Math.sin(angle);
                    const dotProduct = pulse.velX * normalX + pulse.velY * normalY;
                    pulse.velX = (pulse.velX - 2 * dotProduct * normalX) * 1.2;
                    pulse.velY = (pulse.velY - 2 * dotProduct * normalY) * 1.2;
                    
                    const impulse = 0.5;
                    pulse.velX += normalX * impulse;
                    pulse.velY += normalY * impulse;
                }
            }

            const pulseSize = basePulseSize * (pulse.classList.contains('active') ? pulseScale * activeScaleMultiplier : pulseScale);
            if (pulse.posX <= 0) {
                pulse.posX = 0;
                pulse.velX = Math.abs(pulse.velX);
            } else if (pulse.posX >= viewportWidth - pulseSize) {
                pulse.posX = viewportWidth - pulseSize;
                pulse.velX = -Math.abs(pulse.velX);
            }
            if (pulse.posY <= 0) {
                pulse.posY = 0;
                pulse.velY = Math.abs(pulse.velY);
            } else if (pulse.posY >= viewportHeight - pulseSize) {
                pulse.posY = viewportHeight - pulseSize;
                pulse.velY = -Math.abs(pulse.velY);
            }

            pulse.style.left = `${pulse.posX}px`;
            pulse.style.top = `${pulse.posY}px`;
        }

        // Рассчитываем центр точки
        const pulseSize = basePulseSize * (pulse.classList.contains('active') ? pulseScale * activeScaleMultiplier : pulseScale);
        const centerX = pulse.posX + pulseSize / 2;
        const centerY = pulse.posY + pulseSize / 2;

        // Позиционируем текст рядом с точкой (для неактивных точек)
        if (!pulse.classList.contains('active')) {
            const name = pulse.querySelector('.pulse-content').textContent.split('<br>')[0];
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX + (32.5 * pulseScale) - 5);
            text.setAttribute('y', centerY);
            text.setAttribute('class', 'connection-text');
            text.style.fontSize = `${Math.max(15.6 * (pulseScale / 2), minFontSize)}px`;
            text.textContent = name;
            linesSvg.appendChild(text);
        }

        // Рисуем границу для активной точки
        if (pulse.classList.contains('active')) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', 65 * pulseScale);
            circle.setAttribute('stroke', '#fff');
            circle.style.strokeWidth = `${0.65 * pulseScale}px`;
            circle.setAttribute('fill', 'none');
            activeBorderSvg.appendChild(circle);
        }

        // Сохраняем центр для использования в других расчетах
        pulse.centerX = centerX;
        pulse.centerY = centerY;
    });

    // Обрабатываем связи между неактивными точками
    for (let i = 0; i < pulses.length; i++) {
        for (let j = i + 1; j < pulses.length; j++) {
            const p1 = pulses[i];
            const p2 = pulses[j];
            if (!p1.classList.contains('active') && !p2.classList.contains('active')) {
                const dx = p2.posX - p1.posX;
                const dy = p2.posY - p1.posY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const pulseSize = basePulseSize * pulseScale;
                const collisionDistance = pulseSize;
                const connectDistance = 156 * pulseScale;
                const breakDistance = 520 * pulseScale;

                if (distance < collisionDistance) {
                    const angle = Math.atan2(dy, dx);
                    const overlap = (collisionDistance - distance) / 2;
                    p1.posX -= overlap * Math.cos(angle);
                    p1.posY -= overlap * Math.sin(angle);
                    p2.posX += overlap * Math.cos(angle);
                    p2.posY += overlap * Math.sin(angle);
                    const tempX = p1.velX;
                    const tempY = p1.velY;
                    p1.velX = p2.velX;
                    p1.velY = p2.velY;
                    p2.velX = tempX;
                    p2.velY = tempY;
                }

                if (distance <= connectDistance) {
                    const connectionKey = [p1.dataset.project, p2.dataset.project].sort().join('-');
                    if (!p1.connectedTo.has(p2)) {
                        connectionTimes.set(connectionKey, Date.now());
                    }
                    p1.connectedTo.add(p2);
                    p2.connectedTo.add(p1);
                    p1.classList.add('proximity');
                    p2.classList.add('proximity');
                } else if (distance > breakDistance) {
                    const connectionKey = [p1.dataset.project, p2.dataset.project].sort().join('-');
                    connectionTimes.delete(connectionKey);
                    p1.connectedTo.delete(p2);
                    p2.connectedTo.delete(p1);
                    p1.classList.remove('proximity');
                    p2.classList.remove('proximity');
                }

                if (p1.connectedTo.has(p2)) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', p1.centerX);
                    line.setAttribute('y1', p1.centerY);
                    line.setAttribute('x2', p2.centerX);
                    line.setAttribute('y2', p2.centerY);
                    line.setAttribute('class', 'connection-line');
                    line.style.strokeWidth = `${0.65 * pulseScale}px`;
                    linesSvg.appendChild(line);

                    const name1 = p1.querySelector('.pulse-content').textContent
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase();
                    const name2 = p2.querySelector('.pulse-content').textContent
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase();
                    const connectionId = getConnectionId(p1.dataset.project, p2.dataset.project);
                    const connectionKey = [p1.dataset.project, p2.dataset.project].sort().join('-');
                    const connectionTime = formatConnectionTime(Date.now() - connectionTimes.get(connectionKey));
                    const distanceText = `РАССТОЯНИЕ: ${distance.toFixed(1)}px`;

                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', (p1.centerX + p2.centerX) / 2);
                    text.setAttribute('y', (p1.centerY + p2.centerY) / 2);
                    text.setAttribute('class', 'connection-text connection-info');
                    text.style.fontSize = `${Math.max(15.6 * (pulseScale / 2), minFontSize)}px`;
                    text.textContent = isGuiVisible 
                        ? `${name1}-${name2} ${connectionId} | ${connectionTime} | ${distanceText}`
                        : `${name1}-${name2}`;
                    linesSvg.appendChild(text);
                }
            }
        }
    }

    // Обрабатываем связи между активной точкой и остальными
    const activePulse = document.querySelector('.pulse.active');
    if (activePulse) {
        pulses.forEach(pulse => {
            if (pulse !== activePulse && !pulse.classList.contains('active')) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', activePulse.centerX);
                line.setAttribute('y1', activePulse.centerY);
                line.setAttribute('x2', pulse.centerX);
                line.setAttribute('y2', pulse.centerY);
                line.setAttribute('class', 'connection-line');
                line.style.strokeWidth = `${0.65 * pulseScale}px`;
                linesSvg.appendChild(line);

                const name1 = activePulse.querySelector('.pulse-content').textContent
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase();
                const name2 = pulse.querySelector('.pulse-content').textContent
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase();
                const connectionId = getConnectionId(activePulse.dataset.project, pulse.dataset.project);
                const connectionKey = [activePulse.dataset.project, pulse.dataset.project].sort().join('-');
                const connectionTime = connectionTimes.has(connectionKey) 
                    ? formatConnectionTime(Date.now() - connectionTimes.get(connectionKey))
                    : 'СВЯЗЬ: 00:00';
                const dx = pulse.posX - activePulse.posX;
                const dy = pulse.posY - activePulse.posY;
                const distance = Math.sqrt(dx * dx + dy * dy).toFixed(1);
                const distanceText = `РАССТОЯНИЕ: ${distance}px`;

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', (activePulse.centerX + pulse.centerX) / 2);
                text.setAttribute('y', (activePulse.centerY + pulse.centerY) / 2);
                text.setAttribute('class', 'connection-text connection-info');
                text.style.fontSize = `${Math.max(15.6 * (pulseScale / 2), minFontSize)}px`;
                text.textContent = isGuiVisible 
                    ? `${name1}-${name2} ${connectionId} | ${connectionTime} | ${distanceText}`
                    : `${name1}-${name2}`;
                linesSvg.appendChild(text);
            }
        });
    }

    requestAnimationFrame(update);
}
update();

playPauseBtn.addEventListener('click', () => {
    requestAnimationFrame(() => {
        isAnimating = !isAnimating;
        playPauseBtn.classList.toggle('playing');
        playPauseBtn.classList.toggle('paused');
        
        pulses.forEach(pulse => {
            if (!isAnimating) {
                pulse._velX = pulse.velX;
                pulse._velY = pulse.velY;
                pulse.velX = 0;
                pulse.velY = 0;
            } else {
                pulse.velX = (Math.random() - 0.5) * 2;
                pulse.velY = (Math.random() - 0.5) * 2;
                delete pulse._velX;
                delete pulse._velY;
            }
        });
    });
});

function updatePulseSize(e) {
    const rect = sizeSlider.getBoundingClientRect();
    const y = e.type.includes('touch') 
        ? Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height))
        : Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const oldPulseScale = pulseScale;
    pulseScale = 1 + (5 * (1 - y)); // От 1 (внизу) до 6 (вверху)

    const handle = sizeSlider.querySelector('.size-slider-handle');
    const track = sizeSlider.querySelector('.size-slider-track');
    handle.style.top = `${y * 100}%`;
    track.style.height = `${(1 - y) * 100}%`;

    pulses.forEach(pulse => {
        const oldSize = basePulseSize * (pulse.classList.contains('active') ? oldPulseScale * activeScaleMultiplier : oldPulseScale);
        const newSize = basePulseSize * (pulse.classList.contains('active') ? pulseScale * activeScaleMultiplier : pulseScale);
        const sizeDiff = (oldSize - newSize) / 2;
        pulse.posX += sizeDiff;
        pulse.posY += sizeDiff;
        pulse.style.left = `${pulse.posX}px`;
        pulse.style.top = `${pulse.posY}px`;
        pulse.style.width = `${newSize}px`;
        pulse.style.height = `${newSize}px`;
        const content = pulse.querySelector('.pulse-content');
        content.style.fontSize = `${Math.max(60 * (pulseScale / 2), minFontSize * 3)}px`;
        content.style.transform = `translate(-50%, -50%) scale(${pulseScale / 2})`;
    });
}

const handle = sizeSlider.querySelector('.size-slider-handle');
const track = sizeSlider.querySelector('.size-slider-track');
handle.style.top = '100%';
track.style.height = '0%';
pulseScale = 1;

pulses.forEach(pulse => {
    const pulseSize = basePulseSize * pulseScale;
    pulse.style.width = `${pulseSize}px`;
    pulse.style.height = `${pulseSize}px`;
    const content = pulse.querySelector('.pulse-content');
    content.style.fontSize = `${Math.max(60 * (pulseScale / 2), minFontSize * 3)}px`;
    content.style.transform = `translate(-50%, -50%) scale(${pulseScale / 2})`;
});

sizeSlider.addEventListener('mousedown', (e) => {
    isDraggingSlider = true;
    updatePulseSize(e);
});

sizeSlider.addEventListener('touchstart', (e) => {
    isDraggingSlider = true;
    updatePulseSize(e);
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingSlider) updatePulseSize(e);
});

document.addEventListener('touchmove', (e) => {
    if (isDraggingSlider) updatePulseSize(e);
});

document.addEventListener('mouseup', () => {
    isDraggingSlider = false;
});

document.addEventListener('touchend', () => {
    isDraggingSlider = false;
});

// Функция для форматирования времени в формат ММ:СС
function formatConnectionTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `СВЯЗЬ: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Добавляем обработчик для кнопки переключения GUI
toggleGuiBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isGuiVisible = !isGuiVisible;
    toggleGuiBtn.textContent = isGuiVisible ? 'Скрыть GUI' : 'Показать GUI';
    
    // Закрываем меню после переключения
    menuIcon.classList.remove('active');
    dropdownMenu.classList.remove('active');
    container.classList.remove('has-active-menu');
});

headerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    headerLogo.style.pointerEvents = 'none'; // Блокируем повторные клики
    headerLogo.classList.add('rotate-once');
    
    // Ждем завершения анимации + небольшая пауза
    setTimeout(() => {
        window.location.href = 'https://tunk5585.github.io/';
    }, 800); // 400мс на анимацию + 400мс дополнительная пауза
});

// Удаляем класс анимации после её завершения
headerLogo.addEventListener('animationend', () => {
    headerLogo.classList.remove('rotate-once');
    headerLogo.style.pointerEvents = 'auto';
});