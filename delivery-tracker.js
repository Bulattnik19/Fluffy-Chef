// Карта отслеживания доставки
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.delivery-tracker')) {
        initDeliveryTracker();
    }
});

function initDeliveryTracker() {
    const simulateBtn = document.getElementById('simulate-delivery');
    const refreshBtn = document.getElementById('refresh-tracker');
    const deliveryVehicle = document.getElementById('delivery-vehicle');
    const routePoints = document.querySelectorAll('.route-point');
    const steps = document.querySelectorAll('.step');
    const timerProgress = document.querySelector('.timer-progress');
    const timerMinutes = document.getElementById('timer-minutes');
    const deliveryTime = document.getElementById('delivery-time');
    
    let deliveryState = {
        currentStep: 2,
        totalSteps: 5,
        minutesLeft: 45,
        isSimulating: false,
        vehiclePosition: 0
    };
    
    // Обработчики кнопок
    if (simulateBtn) {
        simulateBtn.addEventListener('click', function() {
            if (!deliveryState.isSimulating) {
                startDeliverySimulation();
                this.innerHTML = '<i class="fas fa-pause"></i> Остановить симуляцию';
            } else {
                stopDeliverySimulation();
                this.innerHTML = '<i class="fas fa-play"></i> Симулировать доставку';
            }
            deliveryState.isSimulating = !deliveryState.isSimulating;
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshDeliveryStatus();
        });
    }
    
    // Функции
    function startDeliverySimulation() {
        deliveryState.simulationInterval = setInterval(() => {
            // Уменьшаем время
            if (deliveryState.minutesLeft > 0) {
                deliveryState.minutesLeft--;
                updateTimer();
            }
            
            // Обновляем позицию курьера
            deliveryState.vehiclePosition = (deliveryState.vehiclePosition + 1) % 100;
            updateVehiclePosition();
            
            // Обновляем шаги доставки
            if (deliveryState.minutesLeft % 9 === 0 && deliveryState.currentStep < deliveryState.totalSteps) {
                deliveryState.currentStep++;
                updateDeliverySteps();
            }
            
            // Если доставка завершена
            if (deliveryState.minutesLeft === 0) {
                stopDeliverySimulation();
                if (simulateBtn) {
                    simulateBtn.innerHTML = '<i class="fas fa-play"></i> Симулировать доставку';
                    simulateBtn.disabled = true;
                }
                showDeliveryComplete();
            }
        }, 300); // Обновляем каждые 300мс для плавной анимации
    }
    
    function stopDeliverySimulation() {
        if (deliveryState.simulationInterval) {
            clearInterval(deliveryState.simulationInterval);
        }
    }
    
    function updateTimer() {
        // Обновляем прогресс-бар таймера
        const progress = 339 - (deliveryState.minutesLeft * 339 / 45);
        if (timerProgress) {
            timerProgress.style.strokeDashoffset = progress;
        }
        
        // Обновляем отображаемое время
        if (timerMinutes) {
            timerMinutes.textContent = deliveryState.minutesLeft;
        }
        
        if (deliveryTime) {
            deliveryTime.textContent = `${deliveryState.minutesLeft} минут`;
        }
        
        // Меняем цвет при низком времени
        if (deliveryState.minutesLeft < 10) {
            if (timerProgress) timerProgress.style.stroke = '#ff4444';
            if (timerMinutes) timerMinutes.style.color = '#ff4444';
        } else if (deliveryState.minutesLeft < 20) {
            if (timerProgress) timerProgress.style.stroke = '#ff9800';
            if (timerMinutes) timerMinutes.style.color = '#ff9800';
        }
    }
    
    function updateVehiclePosition() {
        if (deliveryVehicle) {
            // Рассчитываем позицию на карте
            const progress = deliveryState.vehiclePosition / 100;
            let top, left;
            
            if (progress < 0.25) {
                // От склада до сортировки
                top = 40;
                left = 30 + (progress * 4 * 40); // 30% -> 70%
            } else if (progress < 0.5) {
                // От сортировки до транзита
                top = 40 + ((progress - 0.25) * 4 * 40); // 40% -> 80%
                left = 70;
            } else if (progress < 0.75) {
                // От транзита до адреса
                top = 80;
                left = 70 - ((progress - 0.5) * 4 * 40); // 70% -> 30%
            } else {
                // Финальный участок
                top = 80 - ((progress - 0.75) * 4 * 40); // 80% -> 40%
                left = 30;
            }
            
            deliveryVehicle.style.top = `${top}%`;
            deliveryVehicle.style.left = `${left}%`;
            
            // Обновляем активную точку маршрута
            updateActiveRoutePoint(progress);
            
            // Анимация движения
            deliveryVehicle.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(progress * Math.PI * 4) * 0.1})`;
        }
    }
    
    function updateActiveRoutePoint(progress) {
        routePoints.forEach(point => point.classList.remove('active'));
        
        if (progress < 0.25) {
            routePoints[0].classList.add('active'); // Склад
        } else if (progress < 0.5) {
            routePoints[1].classList.add('active'); // Сортировка
        } else if (progress < 0.75) {
            routePoints[2].classList.add('active'); // В пути
        } else {
            routePoints[3].classList.add('active'); // Адрес
        }
    }
    
    function updateDeliverySteps() {
        steps.forEach((step, index) => {
            const stepIcon = step.querySelector('.step-icon i');
            const stepDot = step.querySelector('.step-dot');
            
            if (index < deliveryState.currentStep) {
                step.classList.add('active');
                if (stepIcon) {
                    stepIcon.className = 'fas fa-check-circle';
                }
                if (stepDot) {
                    stepDot.style.display = 'none';
                }
            } else {
                step.classList.remove('active');
                if (stepIcon) {
                    stepIcon.className = 'fas fa-clock';
                }
                if (stepDot) {
                    stepDot.style.display = 'block';
                }
            }
        });
    }
    
    function refreshDeliveryStatus() {
        // В реальном приложении здесь был бы запрос к API
        const randomMinutes = Math.floor(Math.random() * 10) + 1;
        deliveryState.minutesLeft = Math.max(1, deliveryState.minutesLeft - randomMinutes);
        
        updateTimer();
        
        // Показываем уведомление
        showNotification(`Статус обновлен. Осталось ${deliveryState.minutesLeft} минут`, 'info');
        
        // Анимация обновления
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Обновление...';
            setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
            }, 1000);
        }
    }
    
    function showDeliveryComplete() {
        const notification = document.createElement('div');
        notification.className = 'delivery-complete';
        notification.innerHTML = `
            <div class="complete-content">
                <div class="complete-icon">🎉</div>
                <div>
                    <h4>Доставка завершена!</h4>
                    <p>Ваш заказ доставлен. Приятного аппетита вашему питомцу!</p>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--white);
            border-radius: var(--border-radius);
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            z-index: 1000;
            text-align: center;
            animation: popIn 0.5s ease;
            max-width: 400px;
            border: 4px solid #4caf50;
        `;
        
        document.body.appendChild(notification);
        
        // Запускаем конфетти
        launchConfetti();
        
        setTimeout(() => {
            notification.style.animation = 'popOut 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    function launchConfetti() {
        const confettiCount = 100;
        const colors = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                top: -20px;
                left: ${Math.random() * 100}vw;
                opacity: ${0.5 + Math.random() * 0.5};
                z-index: 999;
            `;
            
            document.body.appendChild(confetti);
            
            // Анимация падения
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 20}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
            });
            
            animation.onfinish = () => {
                if (document.body.contains(confetti)) {
                    document.body.removeChild(confetti);
                }
            };
        }
    }
    
    function showNotification(message, type = 'info') {
        // Используем существующую функцию или создаем новую
        const existingNotification = document.querySelector('.delivery-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `delivery-notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'info' ? '#2196f3' : type === 'error' ? '#ff4444' : '#4caf50'};
            color: white;
            border-radius: var(--border-radius);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        @keyframes popOut {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        
        .complete-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        
        .complete-icon {
            font-size: 4rem;
            animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .complete-content h4 {
            margin: 0;
            color: var(--dark-color);
        }
        
        .complete-content p {
            margin: 0.5rem 0 0;
            color: var(--light-text);
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация при загрузке
    updateTimer();
    updateDeliverySteps();
}