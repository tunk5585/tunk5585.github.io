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
        if (notification && !notification.classList.contains('collapsing')) {
            e.stopPropagation(); // Предотвращаем всплытие события
            
            if (notification.classList.contains('collapsed')) {
                // Сворачиваем все другие уведомления
                document.querySelectorAll('.notification.active:not(.collapsed)').forEach(otherNotification => {
                    if (otherNotification !== notification) {
                        otherNotification.classList.add('collapsing');
                        setTimeout(() => {
                            otherNotification.classList.add('collapsed');
                            otherNotification.classList.remove('collapsing');
                        }, 300);
                    }
                });
                
                // Разворачиваем текущее уведомление
                notification.classList.remove('collapsed');
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
}