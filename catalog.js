// Функциональность страницы каталога
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.catalog-page')) {
        initCatalog();
    }
});

function initCatalog() {
    // Загрузка товаров
    loadCatalogProducts();
    
    // Инициализация фильтров
    initFilters();
    
    // Инициализация сортировки
    initSorting();
}

// Загрузка товаров каталога
function loadCatalogProducts() {
    const productsContainer = document.getElementById('catalog-products');
    
    if (!productsContainer) return;
    
    // Используем единую функцию получения товаров
    const products = getProducts();
    
    // Сохраняем все товары для фильтрации
    window.allProducts = products;
    window.filteredProducts = [...products];
    
    renderProducts(products);
    updateProductsCount(products.length);
}

// Рендер товаров
function renderProducts(products) {
    const productsContainer = document.getElementById('catalog-products');
    
    if (!productsContainer) return;
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-catalog">
                <i class="fas fa-search"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card animate-fade-in" data-animal="${product.animal}" data-type="${product.type}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="handleImageError(this)">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)} ₽</div>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                    В корзину
                </button>
            </div>
        </div>
    `).join('');
    
    // Добавление обработчиков для кнопок корзины
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            addToCart(productId);
        });
    });
}

// Инициализация фильтров
function initFilters() {
    const applyBtn = document.getElementById('apply-filters');
    const resetBtn = document.getElementById('reset-filters');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const minPriceDisplay = document.getElementById('min-price');
    const maxPriceDisplay = document.getElementById('max-price');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Обновление отображения цен
    if (priceMin && priceMax && minPriceDisplay && maxPriceDisplay) {
        // Устанавливаем начальные значения
        priceMin.value = 0;
        priceMax.value = 5000;
        minPriceDisplay.textContent = '0';
        maxPriceDisplay.textContent = '5000';
        
        priceMin.addEventListener('input', function() {
            minPriceDisplay.textContent = this.value;
            if (parseInt(this.value) > parseInt(priceMax.value)) {
                priceMax.value = this.value;
                maxPriceDisplay.textContent = this.value;
            }
        });
        
        priceMax.addEventListener('input', function() {
            maxPriceDisplay.textContent = this.value;
            if (parseInt(this.value) < parseInt(priceMin.value)) {
                priceMin.value = this.value;
                minPriceDisplay.textContent = this.value;
            }
        });
    }
    
    // Автоматическое применение фильтров при изменении чекбоксов
    document.querySelectorAll('input[name="animal"], input[name="type"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Если выбрали конкретный чекбокс, снимаем "Все"
            if (this.value !== 'all' && this.checked) {
                const allCheckbox = document.querySelector(`input[name="${this.name}"][value="all"]`);
                if (allCheckbox) {
                    allCheckbox.checked = false;
                }
            }
            
            // Если выбрали "Все", снимаем остальные
            if (this.value === 'all' && this.checked) {
                document.querySelectorAll(`input[name="${this.name}"]:not([value="all"])`).forEach(cb => {
                    cb.checked = false;
                });
            }
            
            // Применяем фильтры
            setTimeout(applyFilters, 100);
        });
    });
}

// Применение фильтров
function applyFilters() {
    const selectedAnimals = getSelectedValues('animal');
    const selectedTypes = getSelectedValues('type');
    const minPrice = parseInt(document.getElementById('price-min').value) || 0;
    const maxPrice = parseInt(document.getElementById('price-max').value) || 5000;
    
    console.log('Applying filters:', { selectedAnimals, selectedTypes, minPrice, maxPrice });
    
    let filtered = window.allProducts.filter(product => {
        // Фильтр по животным
        if (selectedAnimals.length > 0 && !selectedAnimals.includes('all') && !selectedAnimals.includes(product.animal)) {
            return false;
        }
        
        // Фильтр по типу продукта
        if (selectedTypes.length > 0 && !selectedTypes.includes('all') && !selectedTypes.includes(product.type)) {
            return false;
        }
        
        // Фильтр по цене
        if (product.price < minPrice || product.price > maxPrice) {
            return false;
        }
        
        return true;
    });
    
    window.filteredProducts = filtered;
    
    // Применяем текущую сортировку
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && sortSelect.value) {
        sortProducts(sortSelect.value);
    } else {
        renderProducts(filtered);
        updateProductsCount(filtered.length);
    }
}

// Получение выбранных значений чекбоксов
function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Сброс фильтров
function resetFilters() {
    console.log('Resetting filters');
    
    // Сброс чекбоксов
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.value === 'all') {
            cb.checked = true;
        } else {
            cb.checked = false;
        }
    });
    
    // Сброс цен
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 5000;
    document.getElementById('min-price').textContent = '0';
    document.getElementById('max-price').textContent = '5000';
    
    // Сброс сортировки
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'name';
    }
    
    applyFilters();
}

// Инициализация сортировки
function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            console.log('Sorting by:', this.value);
            sortProducts(this.value);
        });
    }
}

// Сортировка товаров
function sortProducts(sortBy) {
    if (!window.filteredProducts) return;
    
    let sortedProducts = [...window.filteredProducts];
    
    console.log('Sorting products by:', sortBy);
    
    switch (sortBy) {
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            sortedProducts.sort((a, b) => {
                const aPopular = a.popular ? 1 : 0;
                const bPopular = b.popular ? 1 : 0;
                return bPopular - aPopular;
            });
            break;
        default:
            // По умолчанию сортируем по названию
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    renderProducts(sortedProducts);
    updateProductsCount(sortedProducts.length);
}

// Обновление счетчика товаров
function updateProductsCount(count) {
    const countElement = document.getElementById('products-found');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Обработка ошибок загрузки изображений
function handleImageError(img) {
    const container = img.closest('.product-image-container');
    if (container) {
        container.innerHTML = `
            <div class="product-image-placeholder">
                <i class="fas fa-paw"></i>
                <span>Fluffy Chef</span>
            </div>
        `;
    }
}

// Загрузка дополнительных товаров
document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // В реальном приложении здесь был бы запрос к API
            this.style.display = 'none';
            showNotification('Все товары загружены', 'info');
        });
    }
});

// Утилита для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'info' ? 'var(--accent-color)' : type === 'error' ? '#ff4444' : '#00C851'};
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
    }, 3000);
}

// Добавляем стили для анимаций уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .empty-catalog {
        text-align: center;
        padding: 3rem;
        color: var(--light-text);
        grid-column: 1 / -1;
    }
    
    .empty-catalog i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: var(--secondary-color);
    }
    
    .empty-catalog h3 {
        margin-bottom: 1rem;
        color: var(--dark-color);
    }
    
    .price-range {
        margin-top: 1rem;
    }
    
    .price-slider {
        width: 100%;
        margin: 0.5rem 0;
    }
    
    .price-values {
        text-align: center;
        font-weight: bold;
        color: var(--accent-color);
        margin-top: 0.5rem;
    }
    
    .filter-group {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--secondary-color);
    }
    
    .filter-group:last-child {
        border-bottom: none;
    }
    
    .filter-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .filter-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0;
    }
    
    .filter-option:hover {
        color: var(--accent-color);
    }
    
    .filter-option input {
        margin: 0;
    }
`;
document.head.appendChild(notificationStyles);