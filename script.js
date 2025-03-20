const menuIcon = document.querySelector('.menu-icon');
const dropdownMenu = document.querySelector('.dropdown-menu');
const header = document.querySelector('.header');
const container = document.querySelector('.container');
const pulses = document.querySelectorAll('.pulse');
const linesSvg = document.querySelector('#lines');
const activeBorderSvg = document.querySelector('#active-border');
const playPauseBtn = document.querySelector('.play-pause');
const sizeSlider = document.querySelector('.size-slider');
const controls = document.querySelector('.controls');

let viewportWidth, viewportHeight;
let isAnimating = true;
let pulseScale = 1; // Изначально 1 (оригинальный размер)
let isDraggingSlider = false;

function updateViewportSize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
}

updateViewportSize();
window.addEventListener('resize', updateViewportSize);

menuIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    menuIcon.classList.toggle('active');
    dropdownMenu.classList.toggle('active');
    container.classList.toggle('has-active-menu', dropdownMenu.classList.contains('active'));
});

document.addEventListener('click', (e) => {
    if (!menuIcon.contains(e.target) && !e.target.closest('.pulse')) {
        menuIcon.classList.remove('active');
        dropdownMenu.classList.remove('active');
        container.classList.remove('has-active-menu');
        pulses.forEach(p => {
            if (p.classList.contains('active')) {
                p.classList.remove('active');
                container.classList.remove('has-active');
                header.classList.remove('hidden');
                controls.classList.remove('hidden');
                p.velX = (Math.random() - 0.5) * 2;
                p.velY = (Math.random() - 0.5) * 2;
            }
        });
    }
});

function checkCollisionWithUI(pulse) {
    const headerRect = header.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    const pulseRect = { x: pulse.posX, y: pulse.posY, width: 26 * pulseScale, height: 26 * pulseScale }; // Учитываем масштаб
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

    return collided;
}

function isOverlapping(x, y, pulses, minDistance) {
    for (let pulse of pulses) {
        if (pulse.posX !== undefined && pulse.posY !== undefined) {
            const dx = x - pulse.posX;
            const dy = y - pulse.posY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance * pulseScale) return true; // Учитываем масштаб
        }
    }
    return false;
}

pulses.forEach(pulse => {
    let attempts = 0;
    const maxAttempts = 50;
    const minDistance = 50;

    do {
        pulse.posX = Math.random() * (viewportWidth - 26);
        pulse.posY = Math.random() * (viewportHeight - 26);
        attempts++;
    } while (isOverlapping(pulse.posX, pulse.posY, pulses, minDistance) && attempts < maxAttempts);

    pulse.velX = (Math.random() - 0.5) * 2;
    pulse.velY = (Math.random() - 0.5) * 2;
    pulse.style.left = `${pulse.posX}px`;
    pulse.style.top = `${pulse.posY}px`;
    pulse.connectedTo = new Set();
    pulse.isDragging = false;

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
            let newPosX = Math.max(0, Math.min(currentX - 13 * pulseScale, viewportWidth - 26 * pulseScale));
            let newPosY = Math.max(0, Math.min(currentY - 13 * pulseScale, viewportHeight - 26 * pulseScale));

            const headerRect = header.getBoundingClientRect();
            const controlsRect = controls.getBoundingClientRect();
            if (!header.classList.contains('hidden') && 
                newPosX + 26 * pulseScale > headerRect.left && newPosX < headerRect.right &&
                newPosY + 26 * pulseScale > headerRect.top && newPosY < headerRect.bottom) {
                return;
            }
            if (!controls.classList.contains('hidden') && 
                newPosX + 26 * pulseScale > controlsRect.left && newPosX < controlsRect.right &&
                newPosY + 26 * pulseScale > controlsRect.top && newPosY < controlsRect.bottom) {
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
                    pulse.velX = (Math.random() - 0.5) * 2;
                    pulse.velY = (Math.random() - 0.5) * 2;
                } else {
                    pulses.forEach(p => {
                        if (p.classList.contains('active')) {
                            p.classList.remove('active');
                            p.velX = (Math.random() - 0.5) * 2;
                            p.velY = (Math.random() - 0.5) * 2;
                        }
                    });
                    pulse.classList.add('active');
                    header.classList.add('hidden');
                    controls.classList.add('hidden');
                    pulse.velX = 0;
                    pulse.velY = 0;
                    container.classList.add('has-active');
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

function update() {
    linesSvg.innerHTML = '';
    activeBorderSvg.innerHTML = '';

    pulses.forEach(pulse => {
        if (!pulse.classList.contains('active') && !pulse.isDragging && isAnimating) {
            pulse.posX += pulse.velX;
            pulse.posY += pulse.velY;

            checkCollisionWithUI(pulse);

            const activePulse = document.querySelector('.pulse.active');
            if (activePulse && pulse !== activePulse) {
                const dx = pulse.posX - activePulse.posX;
                const dy = pulse.posY - activePulse.posY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 78 * pulseScale;

                if (distance < minDistance) {
                    const angle = Math.atan2(dy, dx);
                    pulse.posX = activePulse.posX + minDistance * Math.cos(angle);
                    pulse.posY = activePulse.posY + minDistance * Math.sin(angle);
                    pulse.velX *= -1;
                    pulse.velY *= -1;
                }
            }

            if (pulse.posX <= 0) {
                pulse.posX = 0;
                pulse.velX = Math.abs(pulse.velX);
            } else if (pulse.posX >= viewportWidth - 26 * pulseScale) {
                pulse.posX = viewportWidth - 26 * pulseScale;
                pulse.velX = -Math.abs(pulse.velX);
            }
            if (pulse.posY <= 0) {
                pulse.posY = 0;
                pulse.velY = Math.abs(pulse.velY);
            } else if (pulse.posY >= viewportHeight - 26 * pulseScale) {
                pulse.posY = viewportHeight - 26 * pulseScale;
                pulse.velY = -Math.abs(pulse.velY);
            }

            pulse.style.left = `${pulse.posX}px`;
            pulse.style.top = `${pulse.posY}px`;
        }

        if (!pulse.classList.contains('active')) {
            const name = pulse.querySelector('.pulse-content').textContent.split('<br>')[0];
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pulse.posX + 32.5 * pulseScale);
            text.setAttribute('y', pulse.posY + 6.5 * pulseScale);
            text.setAttribute('class', 'connection-text');
            text.setAttribute('font-size', `${7.8 * pulseScale}px`);
            text.textContent = name;
            linesSvg.appendChild(text);
        }

        if (pulse.classList.contains('active')) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pulse.posX + 13 * pulseScale);
            circle.setAttribute('cy', pulse.posY + 13 * pulseScale);
            circle.setAttribute('r', 65 * pulseScale);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 0.65 * pulseScale);
            circle.setAttribute('fill', 'none');
            activeBorderSvg.appendChild(circle);
        }
    });

    for (let i = 0; i < pulses.length; i++) {
        for (let j = i + 1; j < pulses.length; j++) {
            const p1 = pulses[i];
            const p2 = pulses[j];
            if (!p1.classList.contains('active') && !p2.classList.contains('active')) {
                const dx = p2.posX - p1.posX;
                const dy = p2.posY - p1.posY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const connectDistance = 156 * pulseScale;
                const breakDistance = 520 * pulseScale;

                if (distance < 52 * pulseScale) {
                    const tempX = p1.velX;
                    const tempY = p1.velY;
                    p1.velX = p2.velX;
                    p1.velY = p2.velY;
                    p2.velX = tempX;
                    p2.velY = tempY;
                }

                if (distance <= connectDistance) {
                    p1.connectedTo.add(p2);
                    p2.connectedTo.add(p1);
                    p1.classList.add('proximity');
                    p2.classList.add('proximity');
                } else if (distance > breakDistance) {
                    p1.connectedTo.delete(p2);
                    p2.connectedTo.delete(p1);
                    p1.classList.remove('proximity');
                    p2.classList.remove('proximity');
                }

                if (p1.connectedTo.has(p2)) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', p1.posX + 13 * pulseScale);
                    line.setAttribute('y1', p1.posY + 13 * pulseScale);
                    line.setAttribute('x2', p2.posX + 13 * pulseScale);
                    line.setAttribute('y2', p2.posY + 13 * pulseScale);
                    line.setAttribute('class', 'connection-line');
                    line.setAttribute('stroke-width', `${0.65 * pulseScale}px`);
                    linesSvg.appendChild(line);

                    const name1 = p1.querySelector('.pulse-content').textContent.slice(0, 2);
                    const name2 = p2.querySelector('.pulse-content').textContent.slice(0, 2);
                    const randomNum = Math.floor(Math.random() * 900) + 100;
                    const time = new Date().toLocaleTimeString();
                    const distanceText = distance.toFixed(1);

                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', (p1.posX + p2.posX) / 2 + 13 * pulseScale);
                    text.setAttribute('y', (p1.posY + p2.posY) / 2 + 13 * pulseScale);
                    text.setAttribute('class', 'connection-text');
                    text.setAttribute('font-size', `${7.8 * pulseScale}px`);
                    text.textContent = `${name1}-${name2} #${randomNum} | (${p1.posX.toFixed(0)},${p1.posY.toFixed(0)}) - (${p2.posX.toFixed(0)},${p2.posY.toFixed(0)}) | ${time} | ${distanceText}px`;
                    linesSvg.appendChild(text);
                }
            }
        }
    }

    const activePulse = document.querySelector('.pulse.active');
    if (activePulse) {
        pulses.forEach(pulse => {
            if (pulse !== activePulse && !pulse.classList.contains('active')) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', activePulse.posX + 13 * pulseScale);
                line.setAttribute('y1', activePulse.posY + 13 * pulseScale);
                line.setAttribute('x2', pulse.posX + 13 * pulseScale);
                line.setAttribute('y2', pulse.posY + 13 * pulseScale);
                line.setAttribute('class', 'connection-line');
                line.setAttribute('stroke-width', `${0.65 * pulseScale}px`);
                linesSvg.appendChild(line);

                const name1 = activePulse.querySelector('.pulse-content').textContent.slice(0, 2);
                const name2 = pulse.querySelector('.pulse-content').textContent.slice(0, 2);
                const randomNum = Math.floor(Math.random() * 900) + 100;
                const time = new Date().toLocaleTimeString();
                const dx = pulse.posX - activePulse.posX;
                const dy = pulse.posY - activePulse.posY;
                const distance = Math.sqrt(dx * dx + dy * dy).toFixed(1);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', (activePulse.posX + pulse.posX) / 2 + 13 * pulseScale);
                text.setAttribute('y', (activePulse.posY + pulse.posY) / 2 + 13 * pulseScale);
                text.setAttribute('class', 'connection-text');
                text.setAttribute('font-size', `${7.8 * pulseScale}px`);
                text.textContent = `${name1}-${name2} #${randomNum} | (${activePulse.posX.toFixed(0)},${activePulse.posY.toFixed(0)}) - (${pulse.posX.toFixed(0)},${pulse.posY.toFixed(0)}) | ${time} | ${distance}px`;
                linesSvg.appendChild(text);
            }
        });
    }

    requestAnimationFrame(update);
}
update();

playPauseBtn.addEventListener('click', () => {
    isAnimating = !isAnimating;
    playPauseBtn.classList.toggle('paused');
    playPauseBtn.classList.toggle('playing');
    pulses.forEach(pulse => {
        if (!isAnimating) {
            pulse._velX = pulse.velX;
            pulse._velY = pulse.velY;
            pulse.velX = 0;
            pulse.velY = 0;
        } else {
            pulse.velX = pulse._velX || (Math.random() - 0.5) * 2;
            pulse.velY = pulse._velY || (Math.random() - 0.5) * 2;
        }
    });
});

function updatePulseSize(e) {
    const rect = sizeSlider.getBoundingClientRect();
    const y = e.type.includes('touch') 
        ? Math.max(0, Math.min(1, (e.touches[0].clientY - rect.top) / rect.height))
        : Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    pulseScale = 1 + (1 - y); // От 1 (внизу) до 2 (вверху)

    const handle = sizeSlider.querySelector('.size-slider-handle');
    const track = sizeSlider.querySelector('.size-slider-track');
    handle.style.top = `${y * 100}%`;
    track.style.height = `${(1 - y) * 100}%`; // Трек растет снизу вверх

    pulses.forEach(pulse => {
        if (!pulse.classList.contains('active')) {
            pulse.style.transform = `scale(${pulseScale})`;
        }
        const content = pulse.querySelector('.pulse-content');
        content.style.fontSize = `${10 * pulseScale}px`;
    });
}

// Инициализация слайдера на минимальном уровне при загрузке
const handle = sizeSlider.querySelector('.size-slider-handle');
const track = sizeSlider.querySelector('.size-slider-track');
handle.style.top = '100%'; // Ползунок внизу
track.style.height = '0%';  // Трек пустой
pulseScale = 1; // Оригинальный размер

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