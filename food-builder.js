// Конструктор корма
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.food-builder')) {
        initFoodBuilder();
    }
});

function initFoodBuilder() {
    const baseOptions = document.querySelectorAll('.base-option');
    const ingredientSliders = document.querySelectorAll('.ingredient-slider input');
    const foodBase = document.getElementById('food-base');
    const ingredientLayers = document.querySelectorAll('.ingredient-layer');
    const statValues = {
        calories: document.getElementById('calories'),
        health: document.getElementById('health'),
        taste: document.getElementById('taste')
    };
    const statFills = document.querySelectorAll('.stat-fill');
    const estimatedPrice = document.getElementById('estimated-price');
    const saveRecipeBtn = document.getElementById('save-recipe');
    
    // Данные о основах корма
    const baseData = {
        chicken: {
            color: 'linear-gradient(135deg, #ffb74d 0%, #f57c00 100%)',
            calories: 350,
            health: 85,
            taste: 92,
            price: 400
        },
        fish: {
            color: 'linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)',
            calories: 320,
            health: 90,
            taste: 88,
            price: 450
        },
        beef: {
            color: 'linear-gradient(135deg, #ff8a65 0%, #d84315 100%)',
            calories: 420,
            health: 80,
            taste: 95,
            price: 500
        },
        vegetable: {
            color: 'linear-gradient(135deg, #81c784 0%, #388e3c 100%)',
            calories: 280,
            health: 95,
            taste: 75,
            price: 350
        }
    };
    
    // Текущие значения
    let currentBase = 'chicken';
    let currentIngredients = {
        vitamins: 30,
        fiber: 40,
        protein: 60,
        calcium: 25
    };
    
    // Инициализация слайдеров
    ingredientSliders.forEach(slider => {
        const ingredient = slider.closest('.ingredient').getAttribute('data-ingredient');
        slider.value = currentIngredients[ingredient];
        
        slider.addEventListener('input', function() {
            const ingredient = this.closest('.ingredient').getAttribute('data-ingredient');
            currentIngredients[ingredient] = parseInt(this.value);
            updateVisualization();
            updateStats();
        });
    });
    
    // Обработчики для кнопок основы
    baseOptions.forEach(option => {
        option.addEventListener('click', function() {
            const baseType = this.getAttribute('data-base');
            
            // Обновляем активную кнопку
            baseOptions.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем основу
            currentBase = baseType;
            updateVisualization();
            updateStats();
            
            // Анимация изменения
            animateBaseChange();
        });
    });
    
    // Обработчик кнопки сохранения рецепта
    if (saveRecipeBtn) {
        saveRecipeBtn.addEventListener('click', function() {
            saveRecipe();
        });
    }
    
    // Функции обновления
    function updateVisualization() {
        // Обновляем основу
        if (foodBase && baseData[currentBase]) {
            foodBase.style.background = baseData[currentBase].color;
        }
        
        // Обновляем слои добавок
        ingredientLayers.forEach(layer => {
            const ingredient = layer.classList[1]; // vitamins, fiber и т.д.
            const value = currentIngredients[ingredient] || 0;
            layer.style.opacity = value / 100;
            
            // Анимация пульсации для активных добавок
            if (value > 50) {
                layer.style.animation = 'pulse 1.5s ease-in-out infinite';
            } else {
                layer.style.animation = 'none';
            }
        });
    }
    
    function updateStats() {
        const base = baseData[currentBase];
        
        if (!base) return;
        
        // Рассчитываем модифицированные значения
        const vitaminsMod = currentIngredients.vitamins / 100;
        const fiberMod = currentIngredients.fiber / 100;
        const proteinMod = currentIngredients.protein / 100;
        const calciumMod = currentIngredients.calcium / 100;
        
        const calories = Math.round(base.calories * (0.8 + proteinMod * 0.4));
        const health = Math.min(100, Math.round(base.health + 
            vitaminsMod * 15 + 
            fiberMod * 10 + 
            calciumMod * 5));
        const taste = Math.min(100, Math.round(base.taste + 
            (proteinMod - 0.5) * 20 + 
            (calciumMod - 0.3) * 10));
        
        // Обновляем значения
        if (statValues.calories) statValues.calories.textContent = `${calories} ккал`;
        if (statValues.health) statValues.health.textContent = `${health}%`;
        if (statValues.taste) statValues.taste.textContent = `${taste}%`;
        
        // Обновляем прогресс-бары
        if (statFills[0]) statFills[0].style.width = `${(calories / 500) * 100}%`;
        if (statFills[1]) statFills[1].style.width = `${health}%`;
        if (statFills[2]) statFills[2].style.width = `${taste}%`;
        
        // Рассчитываем цену
        const priceMultiplier = 1 + 
            (currentIngredients.vitamins * 0.002) +
            (currentIngredients.protein * 0.003) +
            (currentIngredients.calcium * 0.0015) -
            (currentIngredients.fiber * 0.001);
        
        const price = Math.round(base.price * priceMultiplier);
        if (estimatedPrice) {
            estimatedPrice.textContent = `${price} ₽`;
            
            // Анимация изменения цены
            estimatedPrice.style.transform = 'scale(1.1)';
            estimatedPrice.style.color = '#4caf50';
            setTimeout(() => {
                estimatedPrice.style.transform = 'scale(1)';
                estimatedPrice.style.color = '';
            }, 300);
        }
    }
    
    function animateBaseChange() {
        // Анимация "всплытия" основы
        if (foodBase) {
            foodBase.style.transform = 'scale(1.2) rotate(180deg)';
            foodBase.style.transition = 'transform 0.5s ease, background 0.5s ease';
            
            setTimeout(() => {
                foodBase.style.transform = 'scale(1) rotate(0deg)';
            }, 500);
        }
        
        // Анимация "моргания" слоев
        ingredientLayers.forEach(layer => {
            layer.style.opacity = '0';
            setTimeout(() => {
                layer.style.opacity = (currentIngredients[layer.classList[1]] || 0) / 100;
            }, 200);
        });
    }
    
    function saveRecipe() {
        const recipe = {
            base: currentBase,
            ingredients: { ...currentIngredients },
            stats: {
                calories: statValues.calories?.textContent || '',
                health: statValues.health?.textContent || '',
                taste: statValues.taste?.textContent || ''
            },
            price: estimatedPrice?.textContent || ''
        };
        
        // Сохраняем в localStorage
        const savedRecipes = JSON.parse(localStorage.getItem('fluffyChefRecipes')) || [];
        savedRecipes.push({
            ...recipe,
            id: Date.now(),
            date: new Date().toISOString()
        });
        
        localStorage.setItem('fluffyChefRecipes', JSON.stringify(savedRecipes));
        
        // Показываем уведомление
        showRecipeSavedNotification();
        
        // Анимация кнопки
        if (saveRecipeBtn) {
            saveRecipeBtn.innerHTML = '<i class="fas fa-check"></i> Рецепт сохранен!';
            saveRecipeBtn.disabled = true;
            
            setTimeout(() => {
                saveRecipeBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить рецепт';
                saveRecipeBtn.disabled = false;
            }, 2000);
        }
    }
    
    function showRecipeSavedNotification() {
        const notification = document.createElement('div');
        notification.className = 'recipe-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <h4>Рецепт сохранен!</h4>
                    <p>Вы можете просмотреть сохраненные рецепты в личном кабинете</p>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--white);
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: var(--shadow);
            border-left: 4px solid #4caf50;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .notification-content i {
            font-size: 2rem;
            color: #4caf50;
        }
        
        .notification-content h4 {
            margin: 0;
            color: var(--dark-color);
        }
        
        .notification-content p {
            margin: 0.25rem 0 0;
            color: var(--light-text);
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
    
    // Инициализация при загрузке
    updateVisualization();
    updateStats();
}