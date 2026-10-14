// Интерактивный питомец
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.interactive-pet')) {
        initInteractivePet();
    }
});

function initInteractivePet() {
    const petButtons = document.querySelectorAll('.pet-btn');
    const petModel = document.getElementById('pet-model');
    const petName = document.getElementById('pet-name');
    const petDescription = document.getElementById('pet-description');
    const foodItems = document.querySelectorAll('.food-item');
    
    // Данные о питомцах
    const petsData = {
        cat: {
            name: "Кошка Мурка",
            description: "Любит рыбные лакомства и молочные корма. Предпочитает есть 4 раза в день небольшими порциями.",
            foods: {
                fish: 90,
                chicken: 75,
                milk: 60
            }
        },
        dog: {
            name: "Собака Барсик",
            description: "Обожает мясные корма и косточки. Нуждается в высокобелковом питании 2 раза в день.",
            foods: {
                fish: 40,
                chicken: 95,
                milk: 30
            }
        },
        rabbit: {
            name: "Кролик Пушистик",
            description: "Питается свежими овощами и сеном. Требует постоянного доступа к свежей пище.",
            foods: {
                fish: 10,
                chicken: 5,
                milk: 85
            }
        },
        bird: {
            name: "Попугай Кеша",
            description: "Любит зерновые смеси и фрукты. Нуждается в разнообразном питании 3 раза в день.",
            foods: {
                fish: 20,
                chicken: 30,
                milk: 90
            }
        }
    };
    
    // Обработчики для кнопок выбора питомца
    petButtons.forEach(button => {
        button.addEventListener('click', function() {
            const petType = this.getAttribute('data-pet');
            
            // Обновляем активную кнопку
            petButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем модель питомца
            updatePetModel(petType);
            
            // Обновляем информацию
            updatePetInfo(petType);
            
            // Обновляем шкалы предпочтений
            updateFoodPreferences(petType);
            
            // Анимация переключения
            animatePetSwitch();
        });
    });
    
    // Инициализация 3D вращения при наведении
    if (petModel) {
        petModel.addEventListener('mouseenter', function() {
            this.style.animation = 'rotatePet 5s linear infinite';
        });
        
        petModel.addEventListener('mouseleave', function() {
            this.style.animation = 'float 3s ease-in-out infinite';
        });
    }
    
    // Функции обновления
    function updatePetModel(petType) {
        if (petModel) {
            // Удаляем все классы животных
            petModel.classList.remove('cat', 'dog', 'rabbit', 'bird');
            // Добавляем нужный класс
            petModel.classList.add(petType);
            
            // Добавляем анимацию переключения
            petModel.style.animation = 'none';
            setTimeout(() => {
                petModel.style.animation = 'float 3s ease-in-out infinite';
            }, 10);
        }
    }
    
    function updatePetInfo(petType) {
        const pet = petsData[petType];
        if (pet) {
            if (petName) petName.textContent = pet.name;
            if (petDescription) petDescription.textContent = pet.description;
        }
    }
    
    function updateFoodPreferences(petType) {
        const pet = petsData[petType];
        if (pet) {
            foodItems.forEach(item => {
                const foodType = item.getAttribute('data-food');
                const percentage = pet.foods[foodType] || 0;
                const fill = item.querySelector('.food-fill');
                
                if (fill) {
                    // Анимируем изменение ширины
                    fill.style.transition = 'width 1s ease';
                    fill.style.width = `${percentage}%`;
                    
                    // Добавляем цифровое отображение
                    const valueSpan = item.querySelector('.percentage');
                    if (!valueSpan) {
                        const span = document.createElement('span');
                        span.className = 'percentage';
                        span.textContent = ` ${percentage}%`;
                        span.style.fontSize = '0.9em';
                        span.style.color = 'var(--accent-color)';
                        span.style.fontWeight = 'bold';
                        item.querySelector('span').appendChild(span);
                    } else {
                        valueSpan.textContent = ` ${percentage}%`;
                    }
                }
            });
        }
    }
    
    function animatePetSwitch() {
        // Анимация "вздрагивания" модели
        if (petModel) {
            petModel.style.transform = 'scale(1.1)';
            setTimeout(() => {
                petModel.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Анимация появления текста
        if (petName) {
            petName.style.opacity = '0';
            petName.style.transform = 'translateY(10px)';
            setTimeout(() => {
                petName.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                petName.style.opacity = '1';
                petName.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotatePet {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
        }
        
        .percentage {
            font-weight: bold;
            color: var(--accent-color);
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация при загрузке
    updateFoodPreferences('cat');
}