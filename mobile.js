// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Обработка тапов для уведомлений на мобильных устройствах
if (isMobile) {
    console.log('Mobile device detected');
    
    // Обработчик тапа по документу
    document.addEventListener('touchstart', (e) => {
        const notifications = document.querySelectorAll('.notification.active:not(.collapsed)');
        const notificationContainer = document.getElementById('notification-container');
        
        // Проверяем, был ли тап вне уведомлений
        if (!notificationContainer.contains(e.target)) {
            notifications.forEach(notification => {
                if (!notification.classList.contains('collapsed')) {
                    notification.classList.add('collapsing');
                    setTimeout(() => {
                        notification.classList.add('collapsed');
                        notification.classList.remove('collapsing');
                    }, 300);
                }
            });
        }
    });

    // Обработчик тапа по уведомлению
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.addEventListener('touchstart', (e) => {
        const notification = e.target.closest('.notification');
        if (!notification) return;
        
        e.stopPropagation(); // Предотвращаем всплытие события
        
        // Получаем все активные уведомления и сортируем их по z-index
        const notifications = Array.from(document.querySelectorAll('.notification.active'));
        notifications.sort((a, b) => {
            const aZIndex = parseInt(window.getComputedStyle(a).zIndex) || 0;
            const bZIndex = parseInt(window.getComputedStyle(b).zIndex) || 0;
            return bZIndex - aZIndex;
        });
        
        // Находим индекс текущего уведомления
        const currentIndex = notifications.indexOf(notification);
        
        if (currentIndex === -1) return;
        
        // Обрабатываем только верхнее уведомление
        if (currentIndex === 0) {
            if (notification.classList.contains('collapsed')) {
                // Разворачиваем текущее уведомление
                notification.classList.remove('collapsed');
                notification.style.zIndex = Math.max(...notifications.map(n => 
                    parseInt(window.getComputedStyle(n).zIndex) || 0
                )) + 1;
            } else {
                // Сворачиваем текущее уведомление
                notification.classList.add('collapsing');
                setTimeout(() => {
                    notification.classList.add('collapsed');
                    notification.classList.remove('collapsing');
                }, 300);
            }
        }
    });
    
    // Функция для проверки и удаления уведомлений
    const checkAndRemoveNotifications = () => {
        const notifications = document.querySelectorAll('.notification.active');
        notifications.forEach(notification => {
            if (notification.dataset.triggerCondition === 'fulfilled') {
                notification.classList.add('collapsing');
                setTimeout(() => {
                    notification.classList.remove('active');
                    notification.classList.add('collapsed');
                    notification.classList.remove('collapsing');
                    // Добавляем задержку перед удалением элемента
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }, 300);
            }
        });
    };
    
    // Запускаем проверку каждые 100мс
    setInterval(checkAndRemoveNotifications, 100);
}