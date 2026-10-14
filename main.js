
// Основной JavaScript файл
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Инициализация корзины (ДОЛЖНО БЫТЬ ТОЛЬКО ОДИН РАЗ!)
    initCart();
    
    // Загрузка популярных товаров на главной
    loadPopularProducts();
    
    // Инициализация анимаций при скролле
    initScrollAnimations();
    
    // Инициализация каталога товаров, если на странице каталога
    if (document.getElementById('catalog-products')) {
        console.log('Инициализация каталога...');
        loadCatalogProducts();
        initCatalogFilters();
    }
    
    // Инициализация дополнительных функций для главной страницы
    if (document.getElementById('loading-screen')) {
        initLoadingScreen();
    }
    
    if (document.querySelector('.pet-options')) {
        initPetSelector();
    }
    
    if (document.querySelector('.promo-btn')) {
        initPromoInteractions();
    }
});

// Мобильное меню
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });
    }
}

// Функции корзины
function initCart() {
    console.log('Инициализация корзины...');
    
    // Инициализируем корзину в localStorage если её нет
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    updateCartCount();
    
    // Добавляем обработчики для кнопок "В корзину"
    initAddToCartButtons();
}

function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Удаляем старые обработчики
        button.removeEventListener('click', addToCartHandler);
        
        // Добавляем новый обработчик
        button.addEventListener('click', addToCartHandler);
    });
}

function addToCartHandler(event) {
    const productId = event.currentTarget.getAttribute('data-product-id');
    console.log('Добавляем товар ID:', productId);
    
    if (productId) {
        addToCart(productId);
    } else {
        // Если data-product-id не работает, попробуем data-product
        const altProductId = event.currentTarget.getAttribute('data-product');
        if (altProductId) {
            addToCart(altProductId);
        }
    }
}

function addToCart(productId) {
    console.log('addToCart вызван с productId:', productId);
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Анимация добавления в корзину
    showAddToCartAnimation();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    console.log('Обновлено количество товаров в корзине:', totalItems);
}

function showAddToCartAnimation() {
    // Создаем элемент для анимации
    const animation = document.createElement('div');
    animation.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--accent-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
        font-weight: bold;
    `;
    animation.textContent = 'Товар добавлен в корзину!';
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        if (document.body.contains(animation)) {
            document.body.removeChild(animation);
        }
    }, 2000);
}

// Загрузка популярных товаров на главной странице
function loadPopularProducts() {
    const productsContainer = document.getElementById('popular-products');
    
    if (!productsContainer) return;
    
    const products = getProducts().slice(0, 4); // Берем первые 4 товара
    
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card animate-fade-in">
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
    initAddToCartButtons();
}

// Загрузка всех товаров для каталога
function loadCatalogProducts(filteredProducts = null) {
    const productsContainer = document.getElementById('catalog-products');
    const productsCount = document.getElementById('products-count');
    
    if (!productsContainer) return;
    
    const allProducts = getProducts();
    const productsToShow = filteredProducts || allProducts;
    
    if (productsCount) {
        productsCount.textContent = `${productsToShow.length} товаров`;
    }
    
    productsContainer.innerHTML = productsToShow.map(product => `
        <div class="product-card animate-fade-in">
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
    initAddToCartButtons();
}

// Инициализация фильтров каталога
function initCatalogFilters() {
    const animalFilter = document.querySelectorAll('input[name="animal"]');
    const typeFilter = document.querySelectorAll('input[name="type"]');
    const priceSlider = document.getElementById('price-slider');
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const sortSelect = document.getElementById('sort-select');
    
    // Инициализация ценового фильтра
    if (priceSlider && priceMinInput && priceMaxInput) {
        const allProducts = getProducts();
        const minPrice = Math.min(...allProducts.map(p => p.price));
        const maxPrice = Math.max(...allProducts.map(p => p.price));
        
        priceSlider.min = minPrice;
        priceSlider.max = maxPrice;
        priceSlider.value = maxPrice;
        
        priceMinInput.value = minPrice;
        priceMaxInput.value = maxPrice;
        
        // Обновление при изменении слайдера
        priceSlider.addEventListener('input', function() {
            priceMaxInput.value = this.value;
            filterProducts();
        });
        
        // Обновление при ручном вводе
        priceMinInput.addEventListener('change', filterProducts);
        priceMaxInput.addEventListener('change', filterProducts);
    }
    
    // Фильтрация по животным
    animalFilter.forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });
    
    // Фильтрация по типу товара
    typeFilter.forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });
    
    // Кнопка сброса фильтров
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            animalFilter.forEach(filter => filter.checked = false);
            typeFilter.forEach(filter => filter.checked = false);
            
            if (priceSlider && priceMinInput && priceMaxInput) {
                const allProducts = getProducts();
                const minPrice = Math.min(...allProducts.map(p => p.price));
                const maxPrice = Math.max(...allProducts.map(p => p.price));
                
                priceSlider.value = maxPrice;
                priceMinInput.value = minPrice;
                priceMaxInput.value = maxPrice;
            }
            
            filterProducts();
        });
    }
    
    // Кнопка применения фильтров
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterProducts);
    }
    
    // Сортировка
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            filterProducts();
        });
    }
    
    function filterProducts() {
        const allProducts = getProducts();
        let filteredProducts = [...allProducts];
        
        // Фильтрация по животным
        const selectedAnimals = Array.from(animalFilter)
            .filter(f => f.checked)
            .map(f => f.value);
        
        if (selectedAnimals.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                selectedAnimals.includes(product.animal)
            );
        }
        
        // Фильтрация по типу товара
        const selectedTypes = Array.from(typeFilter)
            .filter(f => f.checked)
            .map(f => f.value);
        
        if (selectedTypes.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                selectedTypes.includes(product.type)
            );
        }
        
        // Фильтрация по цене
        if (priceMinInput && priceMaxInput) {
            const minPrice = parseInt(priceMinInput.value) || 0;
            const maxPrice = parseInt(priceMaxInput.value) || Infinity;
            
            filteredProducts = filteredProducts.filter(product => 
                product.price >= minPrice && product.price <= maxPrice
            );
        }
        
        // Сортировка
        if (sortSelect) {
            const sortValue = sortSelect.value;
            
            switch (sortValue) {
                case 'price-asc':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }
        }
        
        loadCatalogProducts(filteredProducts);
    }
}

// Обработка ошибок загрузки изображений
function handleImageError(img) {
    // Создаем красивый placeholder
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

// Анимации при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами с анимациями
    document.querySelectorAll('.animate-fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Функция для окна загрузки
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    if (!loadingScreen) return;
    
    // Симулируем загрузку контента
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        // Удаляем элемент из DOM после анимации
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 2000); // 2 секунды загрузки
}

// Функция для выбора питомца
function initPetSelector() {
    const petOptions = document.querySelectorAll('.pet-option');
    const petProducts = document.getElementById('pet-specific-products');
    
    if (!petOptions.length || !petProducts) return;
    
    petOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Убираем активный класс у всех опций
            petOptions.forEach(opt => opt.classList.remove('active'));
            // Добавляем активный класс выбранной опции
            this.classList.add('active');
            
            const petType = this.dataset.pet;
            loadPetProducts(petType);
        });
    });
    
    // Загружаем товары для кошек по умолчанию
    loadPetProducts('cat');
}

function loadPetProducts(petType) {
    const petProducts = document.getElementById('pet-specific-products');
    const products = getProductsByPetType(petType);
    
    if (!petProducts) return;
    
    petProducts.classList.add('loading');
    
    // Симулируем загрузку
    setTimeout(() => {
        petProducts.innerHTML = `
            <div class="products-grid">
                ${products.map(product => `
                    <div class="product-card animate-fade-in">
                        <div class="product-image-container">
                            <div class="product-image-placeholder">
                                <i class="fas ${product.icon}"></i>
                                <span>${product.name}</span>
                            </div>
                            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-price">${product.price} ₽</div>
                            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                                В корзину
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        petProducts.classList.remove('loading');
        
        // Повторно инициализируем кнопки корзины
        setTimeout(() => {
            initAddToCartButtons();
            initScrollAnimations();
        }, 100);
    }, 800);
}

function getProductsByPetType(petType) {
    const products = {
        cat: [
            {
                id: 'cat-premium',
                name: 'Премиум корм для кошек',
                description: 'С лососем и овощами',
                price: 1200,
                icon: 'fa-fish'
            },
            {
                id: 'cat-treats',
                name: 'Лакомства для кошек',
                description: 'С витаминами',
                price: 350,
                icon: 'fa-cookie',
                badge: 'Хит'
            }
        ],
        dog: [
            {
                id: 'dog-premium',
                name: 'Корм для собак',
                description: 'С говядиной и рисом',
                price: 1500,
                icon: 'fa-bone'
            },
            {
                id: 'dog-treats',
                name: 'Печенье для собак',
                description: 'Натуральное',
                price: 280,
                icon: 'fa-bone',
                badge: 'Новинка'
            }
        ],
        small: [
            {
                id: 'bird-food',
                name: 'Корм для птиц',
                description: 'Семенная смесь',
                price: 450,
                icon: 'fa-seedling'
            },
            {
                id: 'hamster-treats',
                name: 'Лакомства для грызунов',
                description: 'С орехами',
                price: 200,
                icon: 'fa-acorn'
            }
        ]
    };
    
    return products[petType] || [];
}

// Функция для интерактивных акций
function initPromoInteractions() {
    const promoButtons = document.querySelectorAll('.promo-btn');
    const modal = document.getElementById('promo-modal');
    const modalTitle = document.getElementById('promo-modal-title');
    const modalContent = document.getElementById('promo-modal-content');
    const closeButton = document.querySelector('.modal-close');
    
    if (!promoButtons.length || !modal) return;
    
    const promoContents = {
        subscribe: `
            <div class="promo-content">
                <i class="fas fa-envelope-open-text"></i>
                <h3>Подпишитесь на рассылку</h3>
                <p>Получите скидку 15% на первый заказ и будьте в курсе всех акций и новинок!</p>
                <form class="subscribe-form">
                    <input type="email" placeholder="Ваш email" required>
                    <button type="submit" class="btn btn-primary">Получить скидку</button>
                </form>
            </div>
        `,
        'learn-more': `
            <div class="promo-content">
                <i class="fas fa-gift"></i>
                <h3>Бесплатный подарок</h3>
                <p>При заказе от 2000₽ вы получаете бесплатную игрушку для вашего питомца на выбор!</p>
                <p><strong>Как получить:</strong></p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>Добавьте товары на сумму от 2000₽</li>
                    <li>Выберите игрушку в корзине</li>
                    <li>Оформите заказ</li>
                </ul>
                <button class="btn btn-primary" onclick="closeModal()">Понятно!</button>
            </div>
        `,
        'delivery-info': `
            <div class="promo-content">
                <i class="fas fa-truck"></i>
                <h3>Бесплатная доставка</h3>
                <p>Для заказов от 1500₽ по Москве в пределах МКАД доставка бесплатная!</p>
                <p><strong>Условия доставки:</strong></p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>Москва в пределах МКАД: от 1500₽</li>
                    <li>Московская область: от 2500₽</li>
                    <li>Другие регионы: индивидуально</li>
                </ul>
                <button class="btn btn-primary" onclick="closeModal()">Отлично!</button>
            </div>
        `
    };
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    promoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            const card = this.closest('.promo-card');
            const title = card.querySelector('h3').textContent;
            
            modalTitle.textContent = title;
            modalContent.innerHTML = promoContents[action];
            modal.style.display = 'block';
            
            // Добавляем обработчик для формы подписки
            const form = modalContent.querySelector('.subscribe-form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('input[type="email"]').value;
                    alert(`Спасибо за подписку! На ${email} отправлено письмо с промокодом.`);
                    closeModal();
                });
            }
        });
    });
    
    // Закрытие модального окна
    closeButton.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Добавляем пульсирующую анимацию для кнопок акций
    setTimeout(() => {
        document.querySelectorAll('.promo-btn').forEach(btn => {
            btn.classList.add('pulse');
        });
    }, 3000);
}

// Утилиты
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

// Получение всех товаров
function getProducts() {
    return [
        {
            id: 1,
            name: "Лакомство для кошек 'Мурлыка'",
            price: 299,
            image: "images/myr1.png",
            animal: "cat",
            type: "treat",
            description: "Вкусное и полезное лакомство для вашей кошки",
            badge: "Хит"
        },
        {
            id: 2,
            name: "Корм для собак 'Верный друг'",
            price: 899,
            image: "images/friend1.png",
            animal: "dog",
            type: "food",
            description: "Сбалансированный корм для взрослых собак",
            badge: "Новинка"
        },
        {
            id: 3,
            name: "Лакомство для грызунов 'Зубастик'",
            price: 199,
            image: "images/zubastik.png",
            animal: "rodent",
            type: "treat",
            description: "Полезное лакомство для стачивания зубов",
            badge: "-20%"
        },
        {
            id: 4,
            name: "Корм для птиц 'Певчий'",
            price: 349,
            image: "images/pev4i.png",
            animal: "bird",
            type: "food",
            description: "Смесь зерен для здоровья и красоты оперения"
        },
        {
            id: 5,
            name: "Корм для кошек 'Нежный'",
            price: 649,
            image: "images/kormne.png",
            animal: "cat",
            type: "food",
            description: "Полнорационный корм для кошек всех пород"
        },
        {
            id: 6,
            name: "Лакомство для собак 'Радость'",
            price: 399,
            image: "images/rad.png",
            animal: "dog",
            type: "treat",
            description: "Вкусное лакомство для дрессировки"
        },
        {
            id: 7,
            name: "Корм для хомяков 'Бегунок'",
            price: 249,
            image: "images/beg.png",
            animal: "rodent",
            type: "food",
            description: "Сбалансированное питание для хомяков"
        },
        {
            id: 8,
            name: "Лакомство для попугаев 'Говорун'",
            price: 179,
            image: "images/govoryn.png",
            animal: "bird",
            type: "treat",
            description: "Вкусное лакомство для вашего попугая"
        },
        {
            id: 9,
            name: "Корм для собак 'Верный друг'",
            price: 499,
            image: "images/chenok.png",
            animal: "dog",
            type: "food",
            description: "Сбалансированный корм для щенков"
         },
        {
            id: 10,
            name: "Лакомство для попугаев 'Какаду'",
            price: 259,
            image: "images/kakady.png",
            animal: "bird",
            type: "treat",
            description: "Сбалансированный корм для вашего попугая"
        },
        {
            id: 11,
            name: "Лакомство для кошек 'Любимый'",
            price: 399,
            image: "images/lyb.png",
            animal: "cat",
            type: "treat",
            description: "Антиаллергенное лакомство для вашей кошки"
        },
        {
            id: 12,
            name: "Лакомство для хомяков 'Кэмпбелл'",
            price: 299,
            image: "images/kemp.png",
            animal: "rodent",
            type: "food",
            description: "Вкусное лакомство для вашего хомяка"
        },
    ];
}

// Добавляем стили для анимации и placeholder
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    .product-image-container {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: var(--secondary-color);
    }
    
    .product-image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--accent-color);
        background: var(--primary-color);
    }
    
    .product-image-placeholder i {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }
    
    .product-image-placeholder span {
        font-size: 0.9rem;
        font-weight: bold;
    }
    
    .product-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--accent-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse {
        animation: pulse 2s infinite;
    }
    
    .pet-products.loading {
        opacity: 0.6;
        pointer-events: none;
    }
`;
document.head.appendChild(style);