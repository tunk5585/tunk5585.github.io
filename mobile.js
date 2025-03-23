// mobile.js
const controls = document.querySelector('.controls');

// Проверяем, является ли устройство мобильным
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Обработка тапов для уведомлений на мобильных устройствах
if (isMobile) {
    console.log('Mobile device detected');
    
    // Обработчик тапа по документу для сворачивания уведомлений
    document.addEventListener('touchstart', (e) => {
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
    });

    // Обработчик тапа по уведомлению
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.addEventListener('touchstart', (e) => {
        const notification = e.target.closest('.notification');
        if (!notification) return;
        
        e.stopPropagation();
        
        const handler = notification.id === 'highVelocity' ? highVelocityNotification : tapNotification;
        if (!handler) return;

        if (notification.classList.contains('collapsed')) {
            handler.expandNotification();
        } else {
            handler.collapseNotification();
        }
    });
}