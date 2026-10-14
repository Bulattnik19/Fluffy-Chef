// Интерактивная временная шкала
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.company-history')) {
        initHistoryTimeline();
    }
});

function initHistoryTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const yearSlider = document.getElementById('year-slider');
    const currentYear = document.getElementById('current-year');
    const prevBtn = document.getElementById('prev-year');
    const nextBtn = document.getElementById('next-year');
    const timelineProgress = document.getElementById('timeline-progress');
    
    const years = [2015, 2017, 2019, 2021, 2024];
    let currentIndex = 0;
    
    // Инициализация слайдера
    if (yearSlider) {
        yearSlider.min = Math.min(...years);
        yearSlider.max = Math.max(...years);
        yearSlider.value = years[currentIndex];
        
        yearSlider.addEventListener('input', function() {
            const year = parseInt(this.value);
            const closestYear = years.reduce((prev, curr) => {
                return Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev;
            });
            
            const newIndex = years.indexOf(closestYear);
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                updateTimeline();
                animateYearChange();
            }
        });
    }
    
    // Обработчики кнопок
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                updateTimeline();
                animateYearChange();
                updateSlider();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentIndex < years.length - 1) {
                currentIndex++;
                updateTimeline();
                animateYearChange();
                updateSlider();
            }
        });
    }
    
    // Обработчики для клика по точкам временной шкалы
    timelineItems.forEach((item, index) => {
        const marker = item.querySelector('.timeline-marker');
        if (marker) {
            marker.addEventListener('click', function() {
                currentIndex = index;
                updateTimeline();
                animateYearChange();
                updateSlider();
            });
        }
    });
    
    // Функции
    function updateTimeline() {
        // Обновляем активный элемент
        timelineItems.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('active');
                
                // Анимация появления
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            } else {
                item.classList.remove('active');
            }
        });
        
        // Обновляем отображаемый год
        if (currentYear) {
            currentYear.textContent = years[currentIndex];
        }
        
        // Обновляем прогресс-бар
        if (timelineProgress) {
            const progress = ((currentIndex + 1) / years.length) * 100;
            timelineProgress.style.height = `${progress}%`;
        }
    }
    
    function updateSlider() {
        if (yearSlider) {
            yearSlider.value = years[currentIndex];
        }
    }
    
    function animateYearChange() {
        // Анимация изменения года
        if (currentYear) {
            currentYear.style.transform = 'scale(1.2)';
            currentYear.style.color = 'var(--accent-color)';
            
            setTimeout(() => {
                currentYear.style.transform = 'scale(1)';
                currentYear.style.color = '';
            }, 300);
        }
        
        // Анимация "пульсации" активной точки
        const activeMarker = timelineItems[currentIndex]?.querySelector('.timeline-marker');
        if (activeMarker) {
            activeMarker.style.animation = 'pulse 0.6s ease';
            setTimeout(() => {
                activeMarker.style.animation = '';
            }, 600);
        }
        
        // Показываем всплывающую информацию
        showYearInfo(years[currentIndex]);
    }
    
    function showYearInfo(year) {
        const infoTexts = {
            2015: "Fluffy Chef начинал как маленький семейный бизнес",
            2017: "Запустили первую линейку кормов",
            2019: "Расширили ассортимент для всех питомцев",
            2021: "Начали сотрудничество с ветеринарами",
            2024: "Внедряем инновации и заботимся об экологии"
        };
        
        const notification = document.createElement('div');
        notification.className = 'year-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-calendar-alt"></i>
                <div>
                    <h4>${year} год</h4>
                    <p>${infoTexts[year]}</p>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--white);
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: var(--shadow);
            border-left: 4px solid var(--accent-color);
            z-index: 1000;
            animation: slideInLeft 0.3s ease;
            max-width: 300px;
        `;
        
        // Удаляем старое уведомление
        const oldNotification = document.querySelector('.year-notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.3s ease';
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
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(141, 110, 99, 0.7); }
            70% { transform: scale(1.3); box-shadow: 0 0 0 10px rgba(141, 110, 99, 0); }
            100% { transform: scale(1.2); box-shadow: 0 0 0 0 rgba(141, 110, 99, 0); }
        }
        
        @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
        }
        
        .year-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .year-notification i {
            font-size: 1.5rem;
            color: var(--accent-color);
        }
        
        .year-notification h4 {
            margin: 0;
            color: var(--dark-color);
        }
        
        .year-notification p {
            margin: 0.25rem 0 0;
            color: var(--light-text);
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация при загрузке
    updateTimeline();
}