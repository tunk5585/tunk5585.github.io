// В начале файла добавляем явное объявление анимационной системы
const animationSystem = {
    lastFrameTime: 0,
    animationFrameId: null,
    
    // Единая функция для запуска/остановки анимации
    toggleAnimation: function(state) {
        if (state === false) {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        } else {
            if (!this.animationFrameId) {
                this.lastFrameTime = 0;
                this.start();
            }
        }
    },
    
    // Запуск анимации
    start: function() {
        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    },
    
    // Основной цикл анимации
    update: function(currentTime) {
        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
        
        // Пропускаем кадры для поддержания стабильного FPS
        if (currentTime - this.lastFrameTime < frameBudget) {
            return;
        }
        
        // Если производительность низкая, уменьшаем частоту обновления
        if (document.body.classList.contains('low-performance')) {
            if (currentTime - this.lastFrameTime < frameBudget * 2) {
                return;
            }
        }
        
        this.lastFrameTime = currentTime;
        
        // Очищаем линии перед перерисовкой
        linesSvg.innerHTML = '';
        activeBorderSvg.innerHTML = '';
        updateVelocityInfo();

        pulses.forEach(pulse => {
            if (!pulse.classList.contains('active') && !pulse.isDragging && isAnimating) {
                // Применяем силу трения для плавного затухания
                if (Math.abs(pulse.velX) > 0 || Math.abs(pulse.velY) > 0) {
                    // Сохраняем текущее направление и скорость
                    const speed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                    const angle = Math.atan2(pulse.velY, pulse.velX);
                    
                    // Экспоненциальное затухание скорости
                    pulse.velX *= frictionFactor;
                    pulse.velY *= frictionFactor;
                    
                    // Если скорость стала ниже минимальной, устанавливаем базовую скорость
                    const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                    if (newSpeed < minVelocity) {
                        // Поддерживаем минимальную скорость в том же направлении
                        pulse.velX = Math.cos(angle) * minVelocity;
                        pulse.velY = Math.sin(angle) * minVelocity;
                    }
                }
                
                // Запоминаем точку, которая недавно была отпущена после перетаскивания
                if (pulse.justReleased) {
                    const now = Date.now();
                    // Если прошло больше времени чем inertiaDecayTime, убираем флаг
                    if (now - pulse.releaseTime > inertiaDecayTime) {
                        pulse.justReleased = false;
                    } else {
                        // Особое затухание для только что отпущенных точек
                        const elapsedRatio = (now - pulse.releaseTime) / inertiaDecayTime;
                        // Делаем затухание очень медленным для только что отпущенных точек
                        const adjustedFriction = Math.max(frictionFactor, 1 - (0.0001 * (1 - elapsedRatio)));
                        
                        // Запоминаем текущее направление
                        const angle = Math.atan2(pulse.velY, pulse.velX);
                        
                        // Применяем более мягкое затухание
                        pulse.velX *= adjustedFriction;
                        pulse.velY *= adjustedFriction;
                        
                        // Обеспечиваем минимальную скорость
                        const currentSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                        if (currentSpeed < minVelocity * 3) { // Увеличиваем множитель с 1.5 до 3
                            const velocityAngle = Math.atan2(pulse.velY, pulse.velX);
                            pulse.velX = Math.cos(velocityAngle) * minVelocity * 3;
                            pulse.velY = Math.sin(velocityAngle) * minVelocity * 3;
                        }
                    }
                }
                
                pulse.posX += pulse.velX;
                pulse.posY += pulse.velY;

                const pulseSize = basePulseSize * passiveMultiplier * pulseScale;

                // Проверка границ экрана с учетом полного размера точки
                if (pulse.posX <= 0) {
                    pulse.posX = 0;
                    pulse.velX = Math.abs(pulse.velX) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
                } else if (pulse.posX >= viewportWidth - pulseSize) {
                    pulse.posX = viewportWidth - pulseSize;
                    pulse.velX = -Math.abs(pulse.velX) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
                }
                if (pulse.posY <= 0) {
                    pulse.posY = 0;
                    pulse.velY = Math.abs(pulse.velY) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
                } else if (pulse.posY >= viewportHeight - pulseSize) {
                    pulse.posY = viewportHeight - pulseSize;
                    pulse.velY = -Math.abs(pulse.velY) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
                }

                // Проверяем столкновения с UI элементами без влияния на скорость
                checkCollisionWithUI(pulse);

                // Здесь изменяем обработку столкновения с активной точкой
                const activePulse = document.querySelector('.pulse.active');
                if (activePulse && pulse !== activePulse) {
                    const activePulseSize = basePulseSize * activeMultiplier * pulseScale;
                    const dx = (pulse.posX + pulseSize / 2) - (activePulse.posX + activePulseSize / 2);
                    const dy = (pulse.posY + pulseSize / 2) - (activePulse.posY + activePulseSize / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (pulseSize + activePulseSize) / 2;

                    if (distance < minDistance) {
                        // Вычисляем угол между точками
                        const angle = Math.atan2(dy, dx);
                        
                        // Отталкиваем точку от активной точки
                        pulse.posX = activePulse.posX + activePulseSize / 2 + Math.cos(angle) * minDistance - pulseSize / 2;
                        pulse.posY = activePulse.posY + activePulseSize / 2 + Math.sin(angle) * minDistance - pulseSize / 2;
                        
                        // Вычисляем скорость точки до столкновения
                        const oldVelX = pulse.velX;
                        const oldVelY = pulse.velY;
                        const oldSpeed = Math.sqrt(oldVelX * oldVelX + oldVelY * oldVelY);
                        
                        // Отражаем скорость с более плавным эффектом
                        const normalX = Math.cos(angle);
                        const normalY = Math.sin(angle);
                        const dotProduct = pulse.velX * normalX + pulse.velY * normalY;
                        
                        // Базовое отражение скорости
                        pulse.velX = pulse.velX - 2 * dotProduct * normalX;
                        pulse.velY = pulse.velY - 2 * dotProduct * normalY;
                        
                        // Для более плавного отскока от активной точки
                        const baseImpulse = Math.max(minVelocity * 3, oldSpeed * collisionInertiaFactor);
                        pulse.velX += normalX * baseImpulse * 2.0; // Значительно увеличиваем силу импульса (было 0.3)
                        pulse.velY += normalY * baseImpulse * 2.0;
                        
                        // Смягчаем скорость после столкновения для более реалистичного эффекта
                        pulse.velX *= 2; // Возможно, слишком низкий коэффициент 
                        pulse.velY *= 2;
                        
                        // Отмечаем точку как недавно столкнувшуюся и устанавливаем время столкновения
                        pulse.justCollided = true;
                        pulse.collisionTime = Date.now();
                        
                        // Сниженное ограничение максимальной скорости после столкновения
                        const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                        if (newSpeed > 20) { // Значительно увеличиваем максимальную скорость (было 5)
                            const factor = 20 / newSpeed;
                            pulse.velX *= factor;
                            pulse.velY *= factor;
                        }
                        
                        // Обеспечиваем минимальную скорость после столкновения
                        if (newSpeed < minVelocity * 3) { // Используем новую минимальную скорость
                            const factor = (minVelocity * 3) / Math.max(newSpeed, 0.001);
                            pulse.velX *= factor;
                            pulse.velY *= factor;
                        }
                    }
                }

                pulse.style.left = `${pulse.posX}px`;
                pulse.style.top = `${pulse.posY}px`;
                
                // Проверяем, находится ли точка под UI элементами при движении
                checkCollisionWithUI(pulse);
            }

            // Рассчитываем центр точки
            const pulseSize = basePulseSize * (pulse.classList.contains('active') ? activeMultiplier : passiveMultiplier) * pulseScale;
            const centerX = pulse.posX + pulseSize / 2;
            const centerY = pulse.posY + pulseSize / 2;

            // Рисуем границу для активной точки
            if (pulse.classList.contains('active')) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', centerX);
                circle.setAttribute('cy', centerY);
                const borderRadius = pulseSize / 2;
                circle.setAttribute('r', borderRadius);
                circle.setAttribute('stroke', '#fff');
                circle.style.strokeWidth = `${0.65 * pulseScale}px`;
                circle.setAttribute('fill', 'none');
                activeBorderSvg.appendChild(circle);
            }

            // Позиционируем текст рядом с точкой (для неактивных точек)
            if (!pulse.classList.contains('active')) {
                const name = pulse.querySelector('.pulse-content').textContent.split('<br>')[0];
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                
                // Стандартное смещение текста
                const textOffset = 32.5 * pulseScale * passiveMultiplier * textOffsetMultiplier;
                
                // Временно добавляем текст в SVG для измерения его размеров
                text.setAttribute('x', 0);
                text.setAttribute('y', 0);
                text.setAttribute('class', 'connection-text');
                text.style.fontSize = `${Math.max(15.6 * (pulseScale * passiveMultiplier / 2), minFontSize)}px`;
                text.textContent = name;
                linesSvg.appendChild(text);
                
                // Измеряем размеры текста с помощью getBBox()
                const textBox = text.getBBox();
                const textWidth = textBox.width;
                
                // Проверяем, выходит ли текст за правую границу экрана
                const rightEdgePosition = centerX + textOffset + textWidth + 10; // Добавляем небольшой отступ
                
                // Проверяем, выходит ли текст за левую границу экрана
                const leftEdgePosition = centerX - textOffset - textWidth - 10; // Добавляем небольшой отступ
                
                // Определяем финальную позицию
                let finalX;
                let textAnchor;
                
                if (rightEdgePosition > viewportWidth) {
                    // Если выходит за правую границу, размещаем слева от точки
                    finalX = centerX - textOffset;
                    textAnchor = 'end';
                } else if (leftEdgePosition < 0 && centerX - textOffset < textWidth) {
                    // Если текст выходит за левую границу при размещении слева, ставим справа
                    finalX = centerX + textOffset;
                    textAnchor = 'start';
                } else {
                    // По умолчанию размещаем справа от точки
                    finalX = centerX + textOffset;
                    textAnchor = 'start';
                }
                
                // Применяем финальную позицию и выравнивание текста
                text.setAttribute('x', finalX);
                text.setAttribute('y', centerY);
                text.setAttribute('text-anchor', textAnchor);
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
                    const dx = p2.centerX - p1.centerX;
                    const dy = p2.centerY - p1.centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const pulseSize = basePulseSize * passiveMultiplier * pulseScale;
                    const collisionDistance = pulseSize;
                    const connectDistance = 156 * pulseScale;
                    const breakDistance = 520 * pulseScale;

                    if (distance < collisionDistance) {
                        const angle = Math.atan2(dy, dx);
                        const overlap = (collisionDistance - distance) / 2;
                        
                        // Обновляем позиции точек только если они не перетаскиваются
                        if (!p1.isDragging && !p2.isDragging) {
                            const newP1X = p1.posX - overlap * Math.cos(angle);
                            const newP1Y = p1.posY - overlap * Math.sin(angle);
                            const newP2X = p2.posX + overlap * Math.cos(angle);
                            const newP2Y = p2.posY + overlap * Math.sin(angle);
                            
                            // Проверяем, не выходят ли новые позиции за пределы экрана
                            if (newP1X >= 0 && newP1X <= viewportWidth - pulseSize &&
                                newP1Y >= 0 && newP1Y <= viewportHeight - pulseSize &&
                                newP2X >= 0 && newP2X <= viewportWidth - pulseSize &&
                                newP2Y >= 0 && newP2Y <= viewportHeight - pulseSize) {
                                
                                p1.posX = newP1X;
                                p1.posY = newP1Y;
                                p2.posX = newP2X;
                                p2.posY = newP2Y;
                                
                                // Обновляем стили
                                p1.style.left = `${p1.posX}px`;
                                p1.style.top = `${p1.posY}px`;
                                p2.style.left = `${p2.posX}px`;
                                p2.style.top = `${p2.posY}px`;
                                
                                // Обновляем центры
                                p1.centerX = p1.posX + pulseSize / 2;
                                p1.centerY = p1.posY + pulseSize / 2;
                                p2.centerX = p2.posX + pulseSize / 2;
                                p2.centerY = p2.posY + pulseSize / 2;
                            }
                        }
                        
                        // Обмен скоростями только для точек, которые не перетаскиваются
                        if (!p1.isDragging && !p2.isDragging) {
                            const tempX = p1.velX;
                            const tempY = p1.velY;
                            p1.velX = p2.velX;
                            p1.velY = p2.velY;
                            p2.velX = tempX;
                            p2.velY = tempY;
                            
                            // Ограничиваем скорости после обмена
                            const vel1 = limitVelocity(p1.velX, p1.velY);
                            const vel2 = limitVelocity(p2.velX, p2.velY);
                            p1.velX = vel1.x;
                            p1.velY = vel1.y;
                            p2.velX = vel2.x;
                            p2.velY = vel2.y;
                        } else if (p1.isDragging && !p2.isDragging) {
                            // Если первая точка перетаскивается, вторая отскакивает с уменьшенной силой
                            const normalX = Math.cos(angle);
                            const normalY = Math.sin(angle);
                            const dotProduct = p2.velX * normalX + p2.velY * normalY;
                            const newVel = limitVelocity(
                                (p2.velX - 2 * dotProduct * normalX) * dragCollisionFactor,
                                (p2.velY - 2 * dotProduct * normalY) * dragCollisionFactor
                            );
                            p2.velX = newVel.x;
                            p2.velY = newVel.y;
                        } else if (!p1.isDragging && p2.isDragging) {
                            // Если вторая точка перетаскивается, первая отскакивает с уменьшенной силой
                            const normalX = -Math.cos(angle);
                            const normalY = -Math.sin(angle);
                            const dotProduct = p1.velX * normalX + p1.velY * normalY;
                            const newVel = limitVelocity(
                                (p1.velX - 2 * dotProduct * normalX) * dragCollisionFactor,
                                (p1.velY - 2 * dotProduct * normalY) * dragCollisionFactor
                            );
                            p1.velX = newVel.x;
                            p1.velY = newVel.y;
                        }
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
                        line.style.strokeWidth = `${0.65 * pulseScale * passiveMultiplier}px`;
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
                        text.style.fontSize = `${Math.max(15.6 * (pulseScale * passiveMultiplier / 2), minFontSize)}px`;
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
                    line.style.strokeWidth = `${0.65 * pulseScale * ((activeMultiplier + passiveMultiplier) / 2)}px`;
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
                    text.style.fontSize = `${Math.max(15.6 * (pulseScale * ((activeMultiplier + passiveMultiplier) / 2) / 2), minFontSize)}px`;
                    text.textContent = isGuiVisible 
                        ? `${name1}-${name2} ${connectionId} | ${connectionTime} | ${distanceText}`
                        : `${name1}-${name2}`;
                    linesSvg.appendChild(text);
                }
            });
        }

        requestAnimationFrame(this.update.bind(this));
    }
};

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
const notificationContainer = document.querySelector('.notification-container');

let viewportWidth, viewportHeight;
let isAnimating = true;
let pulseScale = 1; // Масштаб пульсации
let isDraggingSlider = false;
let isGuiVisible = true; // Новая переменная для отслеживания состояния GUI
const basePulseSize = 26; // Базовый размер точки
const activeMultiplier = 2; // Множитель для активной точки
const passiveMultiplier = 1; // Множитель для неактивной точки
const minFontSize = 14; // Минимальный размер шрифта для текста
const basePulseTextSize = 24; // Базовый размер текста в точках
const textOffsetMultiplier = .6; // Множитель для отступа текста от точки
const maxSliderScale = 4; // Максимальный множитель фейдера
const textOffsetX = -50; // Смещение текста по X в процентах
const textOffsetY = -60; // Смещение текста по Y в процентах
const maxVelocity = 100; // Максимальная скорость точек

// Константы для встроенной пульсирующей точки в тексте
const inlinePulseContainerSize = 21; // Размер контейнера для пульсирующей точки (px)
const inlinePulseDotSize = 7; // Размер самой точки (px)
const inlinePulseMaxSize = 22; // Максимальный размер пульсации (px)

// Добавляем массив для хранения ID соединений
const connectionIds = new Map();

// Добавляем Map для хранения времени соединений
const connectionTimes = new Map();

// Добавить константы в начало файла
const dragCollisionFactor = 0.35; // коэффициент силы столкновения
const velocityTrackingPeriod = 20; // Период отслеживания в мс

// Заменим глобальные переменные отслеживания скорости на объекты для каждой точки
const dragState = new Map(); // Карта для хранения состояния перетаскивания для каждой точки

// Добавим константы для пульсирующего кольца
const pulseRingSize = basePulseSize; // Размер кольца равен размеру точки
const PULSE_RING_BORDER_WIDTH = 1; // Толщина обводки кольца
const pulseRingMaxScale = 2.5; // Максимальный масштаб пульсации

// Добавляем константы для инерции в начало файла, после других констант
const frictionFactor = 0.999; // Более заметное затухание (было 0.9995)
const minVelocity = 0.8; // Меньшая минимальная скорость для более длительного движения (было 0.4)
const inertiaDecayTime = 150000; // Более короткое время затухания (было 75000 мс)
const collisionInertiaFactor = 5.0; // Значительно увеличенный импульс при столкновении (было 2)
const velocityThreshold = 150.0; // Гораздо меньший порог для определения свайпа (было 2000)

// Добавляем переменные для отслеживания скорости курсора
let lastCursorX = 0;
let lastCursorY = 0;
let lastCursorTime = 0;
let cursorVelocityX = 0;
let cursorVelocityY = 0;
let cursorVelocity = 0;
const cursorVelocityTrackingPeriod = 50; // Период отслеживания в мс

// Добавляем константы для улучшенной инерции
const dragDurationFactor = 0.0015; // коэффициент влияния продолжительности перетаскивания
const dragVelocityWeighting = 0.65; // вес скорости при расчете силы броска
const dragHistoryWeighting = 0.35; // вес истории перетаскивания
const maxDragDuration = 2000; // максимальная учитываемая продолжительность перетаскивания (мс)
const dragAccelerationMultiplier = 1.1; // множитель ускорения для длительного перетаскивания

class NotificationHandler {
    constructor(id) {
        this.id = id;
        this.container = document.getElementById('notification-container');
        this.notification = this.createNotification(id);
        this.isAnimating = false;
        this.isExpanded = false;
        this.expandedWidth = 0;
        this.expandedHeight = 0;
        this.autoCollapseTimeout = null;
        this.initEventListeners();
    }

    createNotification(id) {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.id = id;
        notification.innerHTML = `
            <span class="exclamation">!</span>
            <div class="notification-content">
                <div class="notification-text">
                    <span class="warning-text">5585gpt:</span> Нажмите на <span class="inline-pulse"><span class="inline-pulse-dot"></span><span class="inline-pulse-ring"></span></span>, чтобы открыть соответствующий раздел сайта...
                </div>
                <button class="details-button">
                    Подробнее
                    <div class="details-tooltip">
                        ...или просто поиграй с ними, хватай и тащи.
                    </div>
                </button>
            </div>
        `;
        return notification;
    }

    fixExpandedSize() {
        const notificationRect = this.notification.getBoundingClientRect();
        this.expandedWidth = notificationRect.width;
        this.expandedHeight = notificationRect.height;
        this.notification.style.width = `${this.expandedWidth}px`;
        this.notification.style.height = `${this.expandedHeight}px`;
    }

    showNotification() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.container.insertBefore(this.notification, this.container.firstChild);
        requestAnimationFrame(() => {
            this.notification.classList.remove('collapsed');
            this.notification.classList.add('active');
            this.fixExpandedSize();

            setTimeout(() => {
                this.isAnimating = false;
                this.isExpanded = true;

                this.autoCollapseTimeout = setTimeout(() => {
                    this.collapseNotification();
                }, 3000);
            }, 300);
        });
    }

    hideNotification() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        if (this.autoCollapseTimeout) {
            clearTimeout(this.autoCollapseTimeout);
            this.autoCollapseTimeout = null;
        }

        this.notification.classList.remove('active');
        setTimeout(() => {
            this.notification.classList.remove('collapsed');
            this.notification.style.width = '';
            this.notification.style.height = '';
            this.notification.style.padding = '';
            if (this.notification.parentNode === this.container) {
                this.container.removeChild(this.notification);
            }
            this.isAnimating = false;
            this.isExpanded = false;
        }, 300);
    }

    collapseNotification() {
        if (this.isAnimating || !this.isExpanded || !this.notification.classList.contains('active')) return;
        this.isAnimating = true;

        this.notification.style.width = `${this.expandedWidth}px`;
        this.notification.style.height = `${this.expandedHeight}px`;
        this.notification.style.padding = '5.5px';

        requestAnimationFrame(() => {
            this.notification.style.width = '16.5px';
            this.notification.style.height = '16.5px';
            this.notification.style.padding = '3.3px';
            this.notification.classList.add('collapsed');
            setTimeout(() => {
                this.isAnimating = false;
                this.isExpanded = false;
            }, 300);
        });
    }

    expandNotification() {
        if (this.isAnimating || this.isExpanded || !this.notification.classList.contains('active')) return;
        this.isAnimating = true;

        this.notification.style.width = '16.5px';
        this.notification.style.height = '16.5px';
        this.notification.style.padding = '3.3px';

        requestAnimationFrame(() => {
            this.notification.style.width = `${this.expandedWidth}px`;
            this.notification.style.height = `${this.expandedHeight}px`;
            this.notification.style.padding = '5.5px';
            this.notification.classList.remove('collapsed');
            setTimeout(() => {
                this.isAnimating = false;
                this.isExpanded = true;
            }, 300);
        });
    }

    initEventListeners() {
        // Привязываем события строго к текущему уведомлению
        this.notification.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            if (this.autoCollapseTimeout) {
                clearTimeout(this.autoCollapseTimeout);
                this.autoCollapseTimeout = null;
            }
            this.expandNotification();
        });

        this.notification.addEventListener('mouseleave', (e) => {
            e.stopPropagation();
            this.collapseNotification();
        });

        this.notification.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                if (this.autoCollapseTimeout) {
                    clearTimeout(this.autoCollapseTimeout);
                    this.autoCollapseTimeout = null;
                }
                this.expandNotification();
            }
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.isExpanded && 
                this.notification.classList.contains('active') && 
                !this.notification.contains(e.target)) {
                if (!this.isAnimating) {
                    this.collapseNotification();
                }
            }
        });
    }
}

// Создаем экземпляры уведомлений
// const highVelocityNotification = new NotificationHandler('highVelocity');
const tapNotification = new NotificationHandler('tapNotification');

let hasTappedPulse = false;
let tapNotificationTimeout = null;

// Добавляем обработчик для отслеживания тапов на пульсирующие кружки
pulses.forEach(pulse => {
    pulse.addEventListener('click', () => {
        hasTappedPulse = true;
        if (tapNotificationTimeout) {
            clearTimeout(tapNotificationTimeout);
            tapNotificationTimeout = null;
        }
        tapNotification.hideNotification();
    });
});

// Устанавливаем таймер для показа уведомления о тапе
tapNotificationTimeout = setTimeout(() => {
    if (!hasTappedPulse) {
        tapNotification.showNotification();
    }
}, 4000);

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

// Функция определения мобильного устройства - улучшенная версия
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (window.matchMedia("(pointer: coarse)").matches);
}

// Добавляем класс mobile-device при загрузке, если это мобильное устройство
if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
}

function isOverlapping(x, y, pulses, minDistance) {
    for (let pulse of pulses) {
        if (pulse.posX !== undefined && pulse.posY !== undefined) {
            const dx = x - pulse.posX;
            const dy = y - pulse.posY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const effectiveDistance = minDistance * (pulse.classList.contains('active') ? pulseScale * activeMultiplier : pulseScale);
            if (distance < effectiveDistance) return true;
        }
    }
    return false;
}

function applyUICollisionEffect(element) {
    if (!element) return;
    
    // Добавляем класс для анимации столкновения
    element.classList.add('pulse-collision');
    
    // Удаляем класс через 300мс
    setTimeout(() => {
        element.classList.remove('pulse-collision');
    }, 300);
}

// И обновляем функцию checkCollisionWithUI
function checkCollisionWithUI(pulse) {
    const pulseRect = pulse.getBoundingClientRect();
    const pulseCenter = {
        x: pulseRect.left + pulseRect.width / 2,
        y: pulseRect.top + pulseRect.height / 2
    };
    
    // Проверяем столкновение с хедером
    const header = document.querySelector('.header');
    if (!header.classList.contains('hidden')) {
        const headerRect = header.getBoundingClientRect();
        if (
            pulseRect.right > headerRect.left &&
            pulseRect.left < headerRect.right &&
            pulseRect.bottom > headerRect.top &&
            pulseRect.top < headerRect.bottom
        ) {
            // Если в коде мобильных устройств есть функция createGlowEffect, используем её
            if (typeof createGlowEffect === 'function') {
                createGlowEffect(header, headerRect, pulseCenter);
            } else {
                // Для десктопа не применяем эффект подсветки
                // header.classList.add('highlight');
                // setTimeout(() => {
                //     header.classList.remove('highlight');
                // }, 300);
            }
            applyUICollisionEffect(header);
            return true;
        }
    }
    
    // Проверяем столкновение с панелью управления
    const controls = document.querySelector('.controls');
    if (!controls.classList.contains('hidden')) {
        const controlsRect = controls.getBoundingClientRect();
        if (
            pulseRect.right > controlsRect.left &&
            pulseRect.left < controlsRect.right &&
            pulseRect.bottom > controlsRect.top &&
            pulseRect.top < controlsRect.bottom
        ) {
            if (typeof createGlowEffect === 'function') {
                createGlowEffect(controls, controlsRect, pulseCenter);
            } else {
                // Для десктопа не применяем эффект подсветки
                // controls.classList.add('highlight');
                // setTimeout(() => {
                //     controls.classList.remove('highlight');
                // }, 300);
            }
            applyUICollisionEffect(controls);
            return true;
        }
    }
    
    // Проверяем столкновение с выпадающим меню
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu.classList.contains('active')) {
        const dropdownRect = dropdownMenu.getBoundingClientRect();
        if (
            pulseRect.right > dropdownRect.left &&
            pulseRect.left < dropdownRect.right &&
            pulseRect.bottom > dropdownRect.top &&
            pulseRect.top < dropdownRect.bottom
        ) {
            if (typeof createGlowEffect === 'function') {
                createGlowEffect(dropdownMenu, dropdownRect, pulseCenter);
            } else {
                // Для десктопа не применяем эффект подсветки
                // dropdownMenu.classList.add('highlight');
                // setTimeout(() => {
                //     dropdownMenu.classList.remove('highlight');
                // }, 300);
            }
            applyUICollisionEffect(dropdownMenu);
            return true;
        }
    }
    
    // Проверяем столкновение с уведомлениями
    const notifications = document.querySelectorAll('.notification.active');
    for (const notification of notifications) {
        const notificationRect = notification.getBoundingClientRect();
        if (
            pulseRect.right > notificationRect.left &&
            pulseRect.left < notificationRect.right &&
            pulseRect.bottom > notificationRect.top &&
            pulseRect.top < notificationRect.bottom
        ) {
            // Применяем эффект просвечивания к уведомлению
            if (typeof createNotificationGlowEffect === 'function') {
                createNotificationGlowEffect(notification, pulseCenter);
            } else if (typeof createGlowEffect === 'function') {
                createGlowEffect(notification, notificationRect, pulseCenter);
            }
            applyUICollisionEffect(notification);
            return true;
        }
    }
    
    return false;
}

// Инициализация точек
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
    content.style.fontSize = `${Math.max(8 * (pulseScale / 2), minFontSize * 2)}px`;
    content.style.transform = `translate(-50%, -50%) scale(${pulseScale / 2})`;

    let startX, startY;

    // Добавляем каждой точке собственное состояние перетаскивания
    dragState.set(pulse, {
        lastPosX: 0,
        lastPosY: 0,
        lastTime: 0,
        velocityX: 0,
        velocityY: 0
    });

    function startInteraction(e) {
        if (e.type.includes('touch')) {
            e.preventDefault();
        }
        
        pulse.isDragging = true;
        
        // Получаем начальные координаты касания или мыши
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        // Устанавливаем начальную позицию для iPad/iPhone
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const rect = pulse.getBoundingClientRect();
            if (!pulse.posX || !pulse.posY) {
                pulse.posX = rect.left;
                pulse.posY = rect.top;
            }
        }
        
        // Останавливаем движение точки при начале перетаскивания
        pulse.velX = 0;
        pulse.velY = 0;
        
        // Инициализируем отслеживание скорости для ТЕКУЩЕЙ точки
        const state = dragState.get(pulse);
        state.lastPosX = pulse.posX;
        state.lastPosY = pulse.posY;
        state.lastTime = Date.now();
        state.velocityX = 0;
        state.velocityY = 0;
        
        // Сообщаем другим частям кода, что началось перетаскивание
        document.body.classList.add('is-dragging');
    }

    function movePulse(e) {
        if (pulse.isDragging) {
            const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
            const pulseSize = basePulseSize * (pulse.classList.contains('active') ? pulseScale * activeMultiplier : pulseScale);
            let newPosX = Math.max(0, Math.min(currentX - pulseSize / 2, viewportWidth - pulseSize));
            let newPosY = Math.max(0, Math.min(currentY - pulseSize / 2, viewportHeight - pulseSize));
            
            // Применяем новую позицию
            pulse.posX = newPosX;
            pulse.posY = newPosY;
            pulse.style.left = `${pulse.posX}px`;
            pulse.style.top = `${pulse.posY}px`;
            
            // Обновляем центр для использования в других расчетах
            pulse.centerX = pulse.posX + pulseSize / 2;
            pulse.centerY = pulse.posY + pulseSize / 2;
            
            // Проверяем, находится ли точка под UI элементами при перетаскивании
            checkCollisionWithUI(pulse);
            
            // Отслеживаем скорость перемещения ДЛЯ ТЕКУЩЕЙ точки
            const currentTime = Date.now();
            const state = dragState.get(pulse);
            
            // Отслеживаем продолжительность перетаскивания
            if (!state.dragStartTime) {
                state.dragStartTime = currentTime;
            }
            state.dragDuration = currentTime - state.dragStartTime;
            
            // Инициализируем историю перетаскивания, если её нет
            if (!state.dragHistory) {
                state.dragHistory = [];
            }
            
            if (currentTime - state.lastTime > velocityTrackingPeriod) {
                const vx = (pulse.posX - state.lastPosX) / (currentTime - state.lastTime) * 1000;
                const vy = (pulse.posY - state.lastPosY) / (currentTime - state.lastTime) * 1000;
                
                // Сохраняем историю последних движений для сглаживания
                state.dragHistory.push({
                    vx: vx,
                    vy: vy,
                    time: currentTime
                });
                
                // Ограничиваем размер истории
                if (state.dragHistory.length > 10) {
                    state.dragHistory.shift();
                }
                
                state.velocityX = vx;
                state.velocityY = vy;
                state.lastPosX = pulse.posX;
                state.lastPosY = pulse.posY;
                state.lastTime = currentTime;
            }
            
            // Обновляем информацию о скорости в реальном времени
            if (typeof updateVelocityInfo === 'function') {
                updateVelocityInfo();
            }
            
            // Предотвращаем дефолтное поведение для сенсорных устройств
            if (e.type.includes('touch')) {
                e.preventDefault();
            }
        }
    }

    function endInteraction(e) {
        if (pulse.isDragging) {
            const currentX = e.type.includes('touch') ? (e.changedTouches[0] ? e.changedTouches[0].clientX : startX) : e.clientX;
            const currentY = e.type.includes('touch') ? (e.changedTouches[0] ? e.changedTouches[0].clientY : startY) : e.clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;
            
            // Проверяем, было ли это просто тапом или перетаскиванием
            const wasDragged = Math.abs(dx) >= 5 || Math.abs(dy) >= 5;

            // Получаем состояние перетаскивания для ТЕКУЩЕЙ точки
            const state = dragState.get(pulse);
            
            // ВАЖНО: Проверяем, есть ли на экране активная точка
            const isAnyPulseActive = document.querySelector('.pulse.active') !== null;

            // Применяем инерцию только если не активирована ни одна точка
            // или если текущая точка - та, которая активирована
            if (wasDragged && !pulse.classList.contains('active') && !isAnyPulseActive) {
                // Вычисляем текущую скорость перемещения
                const currentVelocity = calculateDragVelocity(state);
                
                // Определяем, был ли это свайп (быстрое движение) или плавное перетаскивание
                const isSwipe = currentVelocity > velocityThreshold;
                
                // Применяем инерцию только при свайпе или достаточной продолжительности перетаскивания
                if ((isSwipe || state.dragDuration > 300) && 
                    (Math.abs(state.velocityX) > 0.1 || Math.abs(state.velocityY) > 0.1)) {
                    
                    // Рассчитываем средневзвешенную скорость из истории перетаскивания
                    let avgVelX = state.velocityX, avgVelY = state.velocityY;
                    
                    if (state.dragHistory && state.dragHistory.length > 0) {
                        let totalWeight = 0;
                        let weightedSumX = 0;
                        let weightedSumY = 0;
                        
                        // Используем более поздние измерения с большим весом
                        for (let i = 0; i < state.dragHistory.length; i++) {
                            const entry = state.dragHistory[i];
                            const weight = (i + 1) / state.dragHistory.length;
                            weightedSumX += entry.vx * weight;
                            weightedSumY += entry.vy * weight;
                            totalWeight += weight;
                        }
                        
                        // Рассчитываем средневзвешенную скорость
                        avgVelX = weightedSumX / totalWeight;
                        avgVelY = weightedSumY / totalWeight;
                    }
                    
                    // Комбинируем текущую скорость и историю
                    const finalVelX = state.velocityX * dragVelocityWeighting + avgVelX * dragHistoryWeighting;
                    const finalVelY = state.velocityY * dragVelocityWeighting + avgVelY * dragHistoryWeighting;
                    
                    // Получаем направление движения
                    const angle = Math.atan2(finalVelY, finalVelX);
                    
                    // Рассчитываем силу броска с учетом скорости и продолжительности
                    const swipeSpeed = Math.sqrt(finalVelX * finalVelX + finalVelY * finalVelY);
                    
                    // Учитываем продолжительность перетаскивания (ограничиваем максимальную продолжительность)
                    const durationFactor = Math.min(state.dragDuration, maxDragDuration) / maxDragDuration;
                    const accelerationBonus = durationFactor * dragAccelerationMultiplier;
                    
                    // Рассчитываем общую силу броска
                    const throwPower = swipeSpeed * 0.05 * (1 + accelerationBonus);
                    const maxThrowPower = 35; // Увеличиваем максимальную скорость точки
                    const actualThrowPower = Math.min(throwPower, maxThrowPower);
                    
                    // Применяем инерцию, масштабированную по скорости свайпа и продолжительности
                    pulse.velX = Math.cos(angle) * actualThrowPower;
                    pulse.velY = Math.sin(angle) * actualThrowPower;
                    
                    // Добавляем метки для затухающей инерции
                    pulse.justReleased = true;
                    pulse.releaseTime = Date.now();
                    pulse.dragDuration = state.dragDuration; // Сохраняем продолжительность
                } else {
                    // Если это было плавное перемещение (не свайп), 
                    // не применяем инерцию и останавливаем точку
                    pulse.velX = 0;
                    pulse.velY = 0;
                }
            } else {
                // Если точка активирована или есть другая активная точка,
                // не применяем инерцию, останавливаем точку
                pulse.velX = 0;
                pulse.velY = 0;
            }
            
            // Теперь проверяем тап
            if (!wasDragged) {
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                }
                
                if (pulse.classList.contains('active')) {
                    // Деактивация точки
                    pulse.classList.remove('active');
                    container.classList.remove('has-active');
                    header.classList.remove('hidden');
                    controls.classList.remove('hidden');
                    const oldSize = basePulseSize * activeMultiplier * pulseScale;
                    const newSize = basePulseSize * passiveMultiplier * pulseScale;
                    const sizeDiff = (oldSize - newSize) / 2;
                    pulse.posX += sizeDiff;
                    pulse.posY += sizeDiff;
                    pulse.style.left = `${pulse.posX}px`;
                    pulse.style.top = `${pulse.posY}px`;
                    pulse.style.width = `${newSize}px`;
                    pulse.style.height = `${newSize}px`;
                    const content = pulse.querySelector('.pulse-content');
                    content.style.fontSize = `${Math.max(basePulseTextSize * passiveMultiplier, minFontSize * 2)}px`;
                    content.style.transform = `translate(${textOffsetX}%, ${textOffsetY}%) scale(${passiveMultiplier / 2})`;
                    pulse.velX = (Math.random() - 0.5) * 2;
                    pulse.velY = (Math.random() - 0.5) * 2;
                } else {
                    // Деактивация других точек
                    pulses.forEach(p => {
                        if (p.classList.contains('active')) {
                            p.classList.remove('active');
                            const oldSize = basePulseSize * activeMultiplier * pulseScale;
                            const newSize = basePulseSize * passiveMultiplier * pulseScale;
                            const sizeDiff = (oldSize - newSize) / 2;
                            p.posX += sizeDiff;
                            p.posY += sizeDiff;
                            p.style.left = `${p.posX}px`;
                            p.style.top = `${p.posY}px`;
                            p.style.width = `${newSize}px`;
                            p.style.height = `${newSize}px`;
                            const content = p.querySelector('.pulse-content');
                            content.style.fontSize = `${Math.max(basePulseTextSize * passiveMultiplier, minFontSize * 2)}px`;
                            content.style.transform = `translate(${textOffsetX}%, ${textOffsetY}%) scale(${passiveMultiplier / 2})`;
                            p.velX = (Math.random() - 0.5) * 2;
                            p.velY = (Math.random() - 0.5) * 2;
                        }
                    });

                    // Активация текущей точки
                    pulse.classList.add('active');
                    header.classList.add('hidden');
                    controls.classList.add('hidden');
                    const oldSize = basePulseSize * passiveMultiplier * pulseScale;
                    const newSize = basePulseSize * activeMultiplier * pulseScale;
                    const sizeDiff = (newSize - oldSize) / 2;
                    pulse.posX -= sizeDiff;
                    pulse.posY -= sizeDiff;
                    pulse.style.left = `${pulse.posX}px`;
                    pulse.style.top = `${pulse.posY}px`;
                    pulse.style.width = `${newSize}px`;
                    pulse.style.height = `${newSize}px`;
                    const content = pulse.querySelector('.pulse-content');
                    content.style.fontSize = `${Math.max(basePulseTextSize * activeMultiplier, minFontSize * 2)}px`;
                    content.style.transform = `translate(${textOffsetX}%, ${textOffsetY}%) scale(${activeMultiplier / 2})`;
                    pulse.velX = 0;
                    pulse.velY = 0;
                    container.classList.add('has-active');
                    menuIcon.classList.remove('active');
                    dropdownMenu.classList.remove('active');
                    container.classList.remove('has-active-menu');

                    // Обрабатываем уведомление о первом тапе
                    if (!hasTappedPulse) {
                        hasTappedPulse = true;
                        if (tapNotificationTimeout) {
                            clearTimeout(tapNotificationTimeout);
                            tapNotificationTimeout = null;
                        }
                        tapNotification.hideNotification();
                    }
                }
            }
            
            pulse.isDragging = false;
            document.body.classList.remove('is-dragging');
        }

        // Сбрасываем параметры отслеживания для ТЕКУЩЕЙ точки
        const state = dragState.get(pulse);
        state.lastPosX = 0;
        state.lastPosY = 0;
        state.lastTime = 0;
        state.velocityX = 0;
        state.velocityY = 0;
        state.dragStartTime = 0;
        state.dragDuration = 0;
        
        // Обновляем информацию о скорости
        if (typeof updateVelocityInfo === 'function') {
            requestAnimationFrame(updateVelocityInfo);
        }
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

// Обновляем функцию updateVelocityInfo для отображения только при открытом меню бургер
function updateVelocityInfo() {
    const velocityInfo = document.querySelector('.velocity-info');
    if (!velocityInfo) return;
    
    // Проверяем, открыто ли меню бургер
    const isMenuOpen = container.classList.contains('has-active-menu');
    
    // Если меню не открыто, скрываем информацию о скорости и выходим
    if (!isMenuOpen) {
        velocityInfo.style.opacity = '0';
        return;
    }
    
    let info = '';
    const pulses = document.querySelectorAll('.pulse');
    
    // Добавляем информацию о скорости курсора
    if (cursorVelocity > 0.1) {
        info += `Курсор: ${cursorVelocity.toFixed(2)}\n`;
    }
    
    pulses.forEach(pulse => {
        if (!pulse.classList.contains('active') && !pulse.isDragging) {
            if (pulse.velX || pulse.velY) {
                const velocity = calculateVelocity(pulse);
                const name = pulse.querySelector('.pulse-content').textContent.split(' ')[0];
                
                // Показываем информацию о скорости
                if (velocity > 0.1) {
                    info += `${name}: ${velocity.toFixed(2)}\n`;
                }
            }
        }
    });
    
    velocityInfo.textContent = info.trim();
    
    // Если есть информация о скорости и меню открыто, показываем её
    if (info.trim() && isMenuOpen) {
        velocityInfo.style.opacity = '1';
    } else {
        velocityInfo.style.opacity = '0';
    }
}

// Добавляем функции для отслеживания скорости курсора
function updateCursorVelocity(e) {
    const currentTime = Date.now();
    
    // Получаем координаты курсора или касания
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : lastCursorX);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : lastCursorY);
    
    // Рассчитываем скорость, только если прошло определенное время
    if (currentTime - lastCursorTime > cursorVelocityTrackingPeriod) {
        const dt = (currentTime - lastCursorTime) / 1000; // в секундах
        
        if (dt > 0 && lastCursorTime > 0) {
            cursorVelocityX = (clientX - lastCursorX) / dt;
            cursorVelocityY = (clientY - lastCursorY) / dt;
            cursorVelocity = Math.sqrt(cursorVelocityX * cursorVelocityX + cursorVelocityY * cursorVelocityY);
        }
        
        lastCursorX = clientX;
        lastCursorY = clientY;
        lastCursorTime = currentTime;
        
        // Обновляем информацию о скорости
        requestAnimationFrame(updateVelocityInfo);
    }
}

// Добавляем обработчики событий для отслеживания движений курсора
document.addEventListener('mousemove', updateCursorVelocity);
document.addEventListener('touchmove', updateCursorVelocity, { passive: true });

// Сбрасываем скорость курсора при остановке движения
document.addEventListener('mouseup', () => {
    setTimeout(() => {
        cursorVelocity = 0;
        requestAnimationFrame(updateVelocityInfo);
    }, 200);
});

document.addEventListener('touchend', () => {
    setTimeout(() => {
        cursorVelocity = 0;
        requestAnimationFrame(updateVelocityInfo);
    }, 200);
});

// Оптимизация анимации для повышения производительности
let lastFrameTime = 0;
const targetFPS = 60;
const frameBudget = 1000 / targetFPS;
let animationFrameId;

// Обновляем функцию update для поддержания базовой скорости
function update(currentTime) {
    animationFrameId = requestAnimationFrame(update);
    
    // Пропускаем кадры для поддержания стабильного FPS
    if (currentTime - lastFrameTime < frameBudget) {
        return;
    }
    
    // Если производительность низкая, уменьшаем частоту обновления
    if (document.body.classList.contains('low-performance')) {
        if (currentTime - lastFrameTime < frameBudget * 2) {
            return;
        }
    }
    
    lastFrameTime = currentTime;
    
    // Очищаем линии перед перерисовкой
    linesSvg.innerHTML = '';
    activeBorderSvg.innerHTML = '';
    updateVelocityInfo();

    pulses.forEach(pulse => {
        if (!pulse.classList.contains('active') && !pulse.isDragging && isAnimating) {
            // Применяем силу трения для плавного затухания
            if (Math.abs(pulse.velX) > 0 || Math.abs(pulse.velY) > 0) {
                // Сохраняем текущее направление и скорость
                const speed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                const angle = Math.atan2(pulse.velY, pulse.velX);
                
                // Экспоненциальное затухание скорости
                pulse.velX *= frictionFactor;
                pulse.velY *= frictionFactor;
                
                // Если скорость стала ниже минимальной, устанавливаем базовую скорость
                const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                if (newSpeed < minVelocity) {
                    // Поддерживаем минимальную скорость в том же направлении
                    pulse.velX = Math.cos(angle) * minVelocity;
                    pulse.velY = Math.sin(angle) * minVelocity;
                }
            }
            
            // Запоминаем точку, которая недавно была отпущена после перетаскивания
            if (pulse.justReleased) {
                const now = Date.now();
                // Если прошло больше времени чем inertiaDecayTime, убираем флаг
                if (now - pulse.releaseTime > inertiaDecayTime) {
                    pulse.justReleased = false;
                } else {
                    // Особое затухание для только что отпущенных точек
                    const elapsedRatio = (now - pulse.releaseTime) / inertiaDecayTime;
                    // Делаем затухание очень медленным для только что отпущенных точек
                    const adjustedFriction = Math.max(frictionFactor, 1 - (0.0001 * (1 - elapsedRatio)));
                    
                    // Запоминаем текущее направление
                    const angle = Math.atan2(pulse.velY, pulse.velX);
                    
                    // Применяем более мягкое затухание
                    pulse.velX *= adjustedFriction;
                    pulse.velY *= adjustedFriction;
                    
                    // Обеспечиваем минимальную скорость
                    const currentSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                    if (currentSpeed < minVelocity * 3) { // Увеличиваем множитель с 1.5 до 3
                        const velocityAngle = Math.atan2(pulse.velY, pulse.velX);
                        pulse.velX = Math.cos(velocityAngle) * minVelocity * 3;
                        pulse.velY = Math.sin(velocityAngle) * minVelocity * 3;
                    }
                }
            }
            
            pulse.posX += pulse.velX;
            pulse.posY += pulse.velY;

            const pulseSize = basePulseSize * passiveMultiplier * pulseScale;

            // Проверка границ экрана с учетом полного размера точки
            if (pulse.posX <= 0) {
                pulse.posX = 0;
                pulse.velX = Math.abs(pulse.velX) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
            } else if (pulse.posX >= viewportWidth - pulseSize) {
                pulse.posX = viewportWidth - pulseSize;
                pulse.velX = -Math.abs(pulse.velX) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
            }
            if (pulse.posY <= 0) {
                pulse.posY = 0;
                pulse.velY = Math.abs(pulse.velY) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
            } else if (pulse.posY >= viewportHeight - pulseSize) {
                pulse.posY = viewportHeight - pulseSize;
                pulse.velY = -Math.abs(pulse.velY) * 0.5; // Сильнее уменьшаем скорость при отскоке (было 0.9)
            }

            // Проверяем столкновения с UI элементами без влияния на скорость
            checkCollisionWithUI(pulse);

            // Здесь изменяем обработку столкновения с активной точкой
            const activePulse = document.querySelector('.pulse.active');
            if (activePulse && pulse !== activePulse) {
                const activePulseSize = basePulseSize * activeMultiplier * pulseScale;
                const dx = (pulse.posX + pulseSize / 2) - (activePulse.posX + activePulseSize / 2);
                const dy = (pulse.posY + pulseSize / 2) - (activePulse.posY + activePulseSize / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (pulseSize + activePulseSize) / 2;

                if (distance < minDistance) {
                    // Вычисляем угол между точками
                    const angle = Math.atan2(dy, dx);
                    
                    // Отталкиваем точку от активной точки
                    pulse.posX = activePulse.posX + activePulseSize / 2 + Math.cos(angle) * minDistance - pulseSize / 2;
                    pulse.posY = activePulse.posY + activePulseSize / 2 + Math.sin(angle) * minDistance - pulseSize / 2;
                    
                    // Вычисляем скорость точки до столкновения
                    const oldVelX = pulse.velX;
                    const oldVelY = pulse.velY;
                    const oldSpeed = Math.sqrt(oldVelX * oldVelX + oldVelY * oldVelY);
                    
                    // Отражаем скорость с более плавным эффектом
                    const normalX = Math.cos(angle);
                    const normalY = Math.sin(angle);
                    const dotProduct = pulse.velX * normalX + pulse.velY * normalY;
                    
                    // Базовое отражение скорости
                    pulse.velX = pulse.velX - 2 * dotProduct * normalX;
                    pulse.velY = pulse.velY - 2 * dotProduct * normalY;
                    
                    // Для более плавного отскока от активной точки
                    const baseImpulse = Math.max(minVelocity * 3, oldSpeed * collisionInertiaFactor);
                    pulse.velX += normalX * baseImpulse * 2.0; // Значительно увеличиваем силу импульса (было 0.3)
                    pulse.velY += normalY * baseImpulse * 2.0;
                    
                    // Смягчаем скорость после столкновения для более реалистичного эффекта
                    pulse.velX *= 2; // Возможно, слишком низкий коэффициент 
                    pulse.velY *= 2;
                    
                    // Отмечаем точку как недавно столкнувшуюся и устанавливаем время столкновения
                    pulse.justCollided = true;
                    pulse.collisionTime = Date.now();
                    
                    // Сниженное ограничение максимальной скорости после столкновения
                    const newSpeed = Math.sqrt(pulse.velX * pulse.velX + pulse.velY * pulse.velY);
                    if (newSpeed > 20) { // Значительно увеличиваем максимальную скорость (было 5)
                        const factor = 20 / newSpeed;
                        pulse.velX *= factor;
                        pulse.velY *= factor;
                    }
                    
                    // Обеспечиваем минимальную скорость после столкновения
                    if (newSpeed < minVelocity * 3) { // Используем новую минимальную скорость
                        const factor = (minVelocity * 3) / Math.max(newSpeed, 0.001);
                        pulse.velX *= factor;
                        pulse.velY *= factor;
                    }
                }
            }

            pulse.style.left = `${pulse.posX}px`;
            pulse.style.top = `${pulse.posY}px`;
            
            // Проверяем, находится ли точка под UI элементами при движении
            checkCollisionWithUI(pulse);
        }

        // Рассчитываем центр точки
        const pulseSize = basePulseSize * (pulse.classList.contains('active') ? activeMultiplier : passiveMultiplier) * pulseScale;
        const centerX = pulse.posX + pulseSize / 2;
        const centerY = pulse.posY + pulseSize / 2;

        // Рисуем границу для активной точки
        if (pulse.classList.contains('active')) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            const borderRadius = pulseSize / 2;
            circle.setAttribute('r', borderRadius);
            circle.setAttribute('stroke', '#fff');
            circle.style.strokeWidth = `${0.65 * pulseScale}px`;
            circle.setAttribute('fill', 'none');
            activeBorderSvg.appendChild(circle);
        }

        // Позиционируем текст рядом с точкой (для неактивных точек)
        if (!pulse.classList.contains('active')) {
            const name = pulse.querySelector('.pulse-content').textContent.split('<br>')[0];
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            
            // Стандартное смещение текста
            const textOffset = 32.5 * pulseScale * passiveMultiplier * textOffsetMultiplier;
            
            // Временно добавляем текст в SVG для измерения его размеров
            text.setAttribute('x', 0);
            text.setAttribute('y', 0);
            text.setAttribute('class', 'connection-text');
            text.style.fontSize = `${Math.max(15.6 * (pulseScale * passiveMultiplier / 2), minFontSize)}px`;
            text.textContent = name;
            linesSvg.appendChild(text);
            
            // Измеряем размеры текста с помощью getBBox()
            const textBox = text.getBBox();
            const textWidth = textBox.width;
            
            // Проверяем, выходит ли текст за правую границу экрана
            const rightEdgePosition = centerX + textOffset + textWidth + 10; // Добавляем небольшой отступ
            
            // Проверяем, выходит ли текст за левую границу экрана
            const leftEdgePosition = centerX - textOffset - textWidth - 10; // Добавляем небольшой отступ
            
            // Определяем финальную позицию
            let finalX;
            let textAnchor;
            
            if (rightEdgePosition > viewportWidth) {
                // Если выходит за правую границу, размещаем слева от точки
                finalX = centerX - textOffset;
                textAnchor = 'end';
            } else if (leftEdgePosition < 0 && centerX - textOffset < textWidth) {
                // Если текст выходит за левую границу при размещении слева, ставим справа
                finalX = centerX + textOffset;
                textAnchor = 'start';
            } else {
                // По умолчанию размещаем справа от точки
                finalX = centerX + textOffset;
                textAnchor = 'start';
            }
            
            // Применяем финальную позицию и выравнивание текста
            text.setAttribute('x', finalX);
            text.setAttribute('y', centerY);
            text.setAttribute('text-anchor', textAnchor);
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
                const dx = p2.centerX - p1.centerX;
                const dy = p2.centerY - p1.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const pulseSize = basePulseSize * passiveMultiplier * pulseScale;
                const collisionDistance = pulseSize;
                const connectDistance = 156 * pulseScale;
                const breakDistance = 520 * pulseScale;

                if (distance < collisionDistance) {
                    const angle = Math.atan2(dy, dx);
                    const overlap = (collisionDistance - distance) / 2;
                    
                    // Обновляем позиции точек только если они не перетаскиваются
                    if (!p1.isDragging && !p2.isDragging) {
                        const newP1X = p1.posX - overlap * Math.cos(angle);
                        const newP1Y = p1.posY - overlap * Math.sin(angle);
                        const newP2X = p2.posX + overlap * Math.cos(angle);
                        const newP2Y = p2.posY + overlap * Math.sin(angle);
                        
                        // Проверяем, не выходят ли новые позиции за пределы экрана
                        if (newP1X >= 0 && newP1X <= viewportWidth - pulseSize &&
                            newP1Y >= 0 && newP1Y <= viewportHeight - pulseSize &&
                            newP2X >= 0 && newP2X <= viewportWidth - pulseSize &&
                            newP2Y >= 0 && newP2Y <= viewportHeight - pulseSize) {
                            
                            p1.posX = newP1X;
                            p1.posY = newP1Y;
                            p2.posX = newP2X;
                            p2.posY = newP2Y;
                            
                            // Обновляем стили
                            p1.style.left = `${p1.posX}px`;
                            p1.style.top = `${p1.posY}px`;
                            p2.style.left = `${p2.posX}px`;
                            p2.style.top = `${p2.posY}px`;
                            
                            // Обновляем центры
                            p1.centerX = p1.posX + pulseSize / 2;
                            p1.centerY = p1.posY + pulseSize / 2;
                            p2.centerX = p2.posX + pulseSize / 2;
                            p2.centerY = p2.posY + pulseSize / 2;
                        }
                    }
                    
                    // Обмен скоростями только для точек, которые не перетаскиваются
                    if (!p1.isDragging && !p2.isDragging) {
                        const tempX = p1.velX;
                        const tempY = p1.velY;
                        p1.velX = p2.velX;
                        p1.velY = p2.velY;
                        p2.velX = tempX;
                        p2.velY = tempY;
                        
                        // Ограничиваем скорости после обмена
                        const vel1 = limitVelocity(p1.velX, p1.velY);
                        const vel2 = limitVelocity(p2.velX, p2.velY);
                        p1.velX = vel1.x;
                        p1.velY = vel1.y;
                        p2.velX = vel2.x;
                        p2.velY = vel2.y;
                    } else if (p1.isDragging && !p2.isDragging) {
                        // Если первая точка перетаскивается, вторая отскакивает с уменьшенной силой
                        const normalX = Math.cos(angle);
                        const normalY = Math.sin(angle);
                        const dotProduct = p2.velX * normalX + p2.velY * normalY;
                        const newVel = limitVelocity(
                            (p2.velX - 2 * dotProduct * normalX) * dragCollisionFactor,
                            (p2.velY - 2 * dotProduct * normalY) * dragCollisionFactor
                        );
                        p2.velX = newVel.x;
                        p2.velY = newVel.y;
                    } else if (!p1.isDragging && p2.isDragging) {
                        // Если вторая точка перетаскивается, первая отскакивает с уменьшенной силой
                        const normalX = -Math.cos(angle);
                        const normalY = -Math.sin(angle);
                        const dotProduct = p1.velX * normalX + p1.velY * normalY;
                        const newVel = limitVelocity(
                            (p1.velX - 2 * dotProduct * normalX) * dragCollisionFactor,
                            (p1.velY - 2 * dotProduct * normalY) * dragCollisionFactor
                        );
                        p1.velX = newVel.x;
                        p1.velY = newVel.y;
                    }
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
                    line.style.strokeWidth = `${0.65 * pulseScale * passiveMultiplier}px`;
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
                    text.style.fontSize = `${Math.max(15.6 * (pulseScale * passiveMultiplier / 2), minFontSize)}px`;
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
                line.style.strokeWidth = `${0.65 * pulseScale * ((activeMultiplier + passiveMultiplier) / 2)}px`;
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
                text.style.fontSize = `${Math.max(15.6 * (pulseScale * ((activeMultiplier + passiveMultiplier) / 2) / 2), minFontSize)}px`;
                text.textContent = isGuiVisible 
                    ? `${name1}-${name2} ${connectionId} | ${connectionTime} | ${distanceText}`
                    : `${name1}-${name2}`;
                linesSvg.appendChild(text);
            }
        });
    }

    requestAnimationFrame(update);
}

// Запускаем анимацию с requestAnimationFrame
animationFrameId = requestAnimationFrame(update);

// Добавляем обработчик видимости страницы для остановки анимации, когда страница не видна
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Останавливаем анимацию, когда страница не видна
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else {
        // Восстанавливаем анимацию, когда страница снова видна
        if (!animationFrameId) {
            lastFrameTime = 0;
            animationFrameId = requestAnimationFrame(update);
        }
    }
});

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
    
    const newScale = 1 + (1 - y) * (maxSliderScale - 1); // От 1 (внизу) до maxSliderScale (вверху)
    pulseScale = newScale;
    
    const handle = sizeSlider.querySelector('.size-slider-handle');
    const track = sizeSlider.querySelector('.size-slider-track');
    handle.style.top = `${y * 100}%`;
    track.style.height = `${(1 - y) * 100}%`;

    // Применяем масштабирование к CSS переменным
    document.documentElement.style.setProperty('--scale-multiplier', newScale);
    document.documentElement.style.setProperty('--font-scale', newScale);
    document.documentElement.style.setProperty('--spacing-scale', newScale);

    // Обновляем размеры точек
    pulses.forEach(pulse => {
        const multiplier = pulse.classList.contains('active') ? activeMultiplier : passiveMultiplier;
        const pulseSize = basePulseSize * multiplier * newScale;
        pulse.style.width = `${pulseSize}px`;
        pulse.style.height = `${pulseSize}px`;
        const content = pulse.querySelector('.pulse-content');
        content.style.fontSize = `${Math.max(basePulseTextSize * multiplier, minFontSize * 2)}px`;
        content.style.transform = `translate(${textOffsetX}%, ${textOffsetY}%) scale(${multiplier / 2})`;
    });

    // После обновления размеров точек, обновляем и кольца
    updatePulseRings();
}

// Инициализация начального масштаба
const handle = sizeSlider.querySelector('.size-slider-handle');
const track = sizeSlider.querySelector('.size-slider-track');
handle.style.top = '100%';
track.style.height = '0%';
document.documentElement.style.setProperty('--scale-multiplier', 1);
document.documentElement.style.setProperty('--font-scale', 1);
document.documentElement.style.setProperty('--spacing-scale', 1);

pulses.forEach(pulse => {
    const multiplier = pulse.classList.contains('active') ? activeMultiplier : passiveMultiplier;
    const pulseSize = basePulseSize * multiplier;
    pulse.style.width = `${pulseSize}px`;
    pulse.style.height = `${pulseSize}px`;
    const content = pulse.querySelector('.pulse-content');
    content.style.fontSize = `${Math.max(basePulseTextSize * multiplier, minFontSize * 2)}px`;
    content.style.transform = `translate(${textOffsetX}%, ${textOffsetY}%) scale(${multiplier / 2})`;
});

// Оптимизированная функция обработки изменения размера 
sizeSlider.addEventListener('mousedown', (e) => {
    isDraggingSlider = true;
    document.body.classList.add('resizing');
    
    // Временно отключаем пульсирующие кольца при изменении размера
    const rings = document.querySelectorAll('.pulse-ring');
    rings.forEach(ring => {
        ring.style.animation = 'none';
        ring.style.opacity = '0';
    });
    
    updatePulseSize(e);
});

sizeSlider.addEventListener('touchstart', (e) => {
    isDraggingSlider = true;
    document.body.classList.add('resizing');
    
    // Временно отключаем пульсирующие кольца при изменении размера
    const rings = document.querySelectorAll('.pulse-ring');
    rings.forEach(ring => {
        ring.style.animation = 'none';
        ring.style.opacity = '0';
    });
    
    updatePulseSize(e);
});

// Оптимизированная функция восстановления пульсации после изменения размера
function finishResizing() {
    isDraggingSlider = false;
    
    // Даем время для стабилизации размеров перед восстановлением пульсации
    setTimeout(() => {
        document.body.classList.remove('resizing');
        
        // Восстанавливаем пульсирующие кольца
        const rings = document.querySelectorAll('.pulse-ring');
        const hasActive = document.querySelector('.pulse.active') !== null;
        const isMobile = document.body.classList.contains('mobile-device');
        
        rings.forEach(ring => {
            // Сбрасываем все inline стили
            ring.style.cssText = '';
            void ring.offsetWidth; // Триггерим перерисовку
            
            // Восстанавливаем пульсацию в зависимости от типа устройства
            if (!hasActive) {
                if (isMobile) {
                    // Для мобильных устройств всегда показываем пульсацию
                    ring.style.animation = 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite';
                    ring.style.opacity = '1';
                }
                // Для десктопа не нужно добавлять анимацию, она появится при наведении
            }
        });
    }, 100);
}

document.addEventListener('mouseup', () => {
    if (isDraggingSlider) {
        finishResizing();
    }
});

document.addEventListener('touchend', () => {
    if (isDraggingSlider) {
        finishResizing();
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingSlider) updatePulseSize(e);
});

document.addEventListener('touchmove', (e) => {
    if (isDraggingSlider) updatePulseSize(e);
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

// Обработчик для меню-бургера
if (!isMobileDevice()) {
    // На десктопе используем hover
    menuIcon.addEventListener('mouseenter', (e) => {
        menuIcon.classList.add('active');
        dropdownMenu.classList.add('active');
        container.classList.add('has-active-menu');
    });

    const headerElement = document.querySelector('.header');
    headerElement.addEventListener('mouseleave', (e) => {
        menuIcon.classList.remove('active');
        dropdownMenu.classList.remove('active');
        container.classList.remove('has-active-menu');
    });
} else {
    // На мобильных устройствах используем клик
    menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        menuIcon.classList.toggle('active');
        dropdownMenu.classList.toggle('active');
        container.classList.toggle('has-active-menu');
    });

    // Закрытие меню при клике вне его на мобильных устройствах
    document.addEventListener('click', (e) => {
        if (!menuIcon.contains(e.target) && !dropdownMenu.contains(e.target)) {
            menuIcon.classList.remove('active');
            dropdownMenu.classList.remove('active');
            container.classList.remove('has-active-menu');
        }
    });
}

// Добавляем обработчик клика по документу для деактивации точки
document.addEventListener('click', (e) => {
    const activePulse = document.querySelector('.pulse.active');
    if (activePulse && !activePulse.contains(e.target)) {
        activePulse.classList.remove('active');
        header.classList.remove('hidden');
        controls.classList.remove('hidden');
        container.classList.remove('has-active');
        
        // Возвращаем точке исходный размер с учетом passiveMultiplier
        const oldSize = basePulseSize * activeMultiplier * pulseScale;
        const newSize = basePulseSize * passiveMultiplier * pulseScale;
        const sizeDiff = (oldSize - newSize) / 2;
        activePulse.posX += sizeDiff;
        activePulse.posY += sizeDiff;
        activePulse.style.left = `${activePulse.posX}px`;
        activePulse.style.top = `${activePulse.posY}px`;
        activePulse.style.width = `${newSize}px`;
        activePulse.style.height = `${newSize}px`;
        const content = activePulse.querySelector('.pulse-content');
        content.style.fontSize = `${Math.max(basePulseTextSize * passiveMultiplier, minFontSize * 2)}px`;
        content.style.transform = `translate(${textOffsetX}%, ${textOffsetY}%) scale(${passiveMultiplier / 2})`;
        activePulse.velX = (Math.random() - 0.5) * 2;
        activePulse.velY = (Math.random() - 0.5) * 2;
    }
});

// В функции ограничения скорости
function limitVelocity(velX, velY) {
    const speed = Math.sqrt(velX * velX + velY * velY);
    if (speed > maxVelocity) {
        const scale = maxVelocity / speed;
        return {
            x: velX * scale,
            y: velY * scale
        };
    }
    return { x: velX, y: velY };
}


// Применяем константы к CSS переменным при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Устанавливаем существующие переменные
    document.documentElement.style.setProperty('--scale-multiplier', pulseScale);
    document.documentElement.style.setProperty('--font-scale', pulseScale);
    document.documentElement.style.setProperty('--spacing-scale', pulseScale);
    
    // Устанавливаем новые переменные для встроенной пульсирующей точки
    document.documentElement.style.setProperty('--inline-pulse-container-size', `${inlinePulseContainerSize}px`);
    document.documentElement.style.setProperty('--inline-pulse-dot-size', `${inlinePulseDotSize}px`);
    document.documentElement.style.setProperty('--inline-pulse-max-size', `${inlinePulseMaxSize}px`);
    
    // Добавляем новые переменные для пульсирующего кольца
    document.documentElement.style.setProperty('--pulse-ring-size', `${pulseRingSize}px`);
    document.documentElement.style.setProperty('--pulse-ring-border-width', `${PULSE_RING_BORDER_WIDTH}px`);
    document.documentElement.style.setProperty('--pulse-ring-max-scale', pulseRingMaxScale);
    

    
    // Запускаем анимацию
    animationSystem.start();
});

// Функция для обновления стилей пульсирующих колец
function updatePulseRings() {
    const rings = document.querySelectorAll('.pulse-ring');
    rings.forEach(ring => {
        // Сбрасываем текущие inline стили, чтобы CSS-переменные применялись корректно
        ring.style.cssText = '';
        
        // Запускаем перерисовку
        void ring.offsetWidth;
    });
}

// Вспомогательная функция для расчета общей скорости перетаскивания
function calculateDragVelocity(state) {
    if (!state) return 0;
    return Math.sqrt(state.velocityX * state.velocityX + state.velocityY * state.velocityY);
}
