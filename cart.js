[file name]: cart.js
// Файл для работы с корзиной на странице cart.html
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация страницы корзины...');
    
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Инициализация корзины
    initCartPage();
    
    // Инициализация модального окна оформления заказа
    initCheckoutModal();
});

// Мобильное меню (дублируем из main.js, но только для страницы корзины)
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

// Инициализация страницы корзины
function initCartPage() {
    // Проверяем и инициализируем корзину в localStorage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    updateCartCount();
    loadCartItems();
    
    // Обновляем корзину при изменении localStorage (например, из других вкладок)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartCount();
            loadCartItems();
        }
    });
}

// Загрузка товаров в корзине
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const allProducts = getProducts(); // Получаем товары из main.js
    
    if (cart.length === 0) {
        // Корзина пуста
        if (emptyCart) {
            emptyCart.style.display = 'block';
        }
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
        }
        
        cartItemsContainer.innerHTML = `
            <div class="empty-cart" id="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Ваша корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
                <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
            </div>
        `;
        
        updateCartSummary(0);
        return;
    }
    
    // Скрываем сообщение о пустой корзине
    if (emptyCart) {
        emptyCart.style.display = 'none';
    }
    
    // Включаем кнопку оформления заказа
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }
    
    // Собираем HTML с товарами в корзине
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(cartItem => {
        const product = allProducts.find(p => p.id == cartItem.id);
        
        if (product) {
            const itemTotal = product.price * cartItem.quantity;
            subtotal += itemTotal;
            
            cartHTML += `
                <div class="cart-item" data-product-id="${product.id}">
                    <div class="cart-item-image-container">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" class="cart-item-image" onerror="handleCartImageError(this)">` :
                            `<div class="cart-image-placeholder">
                                <i class="fas fa-paw"></i>
                            </div>`
                        }
                    </div>
                    <div class="cart-item-details">
                        <h3>${product.name}</h3>
                        <p class="cart-item-price">${formatPrice(product.price)} ₽</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-quantity" data-product-id="${product.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-value">${cartItem.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-product-id="${product.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" data-product-id="${product.id}" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Добавляем обработчики для кнопок управления количеством и удаления
    addCartItemEventListeners();
    
    // Обновляем итоговую сумму
    updateCartSummary(subtotal);
}

// Обработка ошибок изображений в корзине
function handleCartImageError(img) {
    const container = img.closest('.cart-item-image-container');
    if (container) {
        container.innerHTML = `
            <div class="cart-image-placeholder">
                <i class="fas fa-paw"></i>
            </div>
        `;
    }
}

// Добавление обработчиков событий для элементов корзины
function addCartItemEventListeners() {
    // Увеличение количества
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            updateCartItemQuantity(productId, 1);
        });
    });
    
    // Уменьшение количества
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            updateCartItemQuantity(productId, -1);
        });
    });
    
    // Удаление товара
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeCartItem(productId);
        });
    });
}

// Обновление количества товара в корзине
function updateCartItemQuantity(productId, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id == productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        // Если количество стало 0 или меньше, удаляем товар
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем отображение корзины
        updateCartCount();
        loadCartItems();
        
        // Показываем уведомление
        showCartNotification(change > 0 ? 'Количество увеличено' : 'Количество уменьшено');
    }
}

// Удаление товара из корзины
function removeCartItem(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const filteredCart = cart.filter(item => item.id != productId);
    
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    
    // Обновляем отображение корзины
    updateCartCount();
    loadCartItems();
    
    // Показываем уведомление
    showCartNotification('Товар удален из корзины');
}

// Обновление итоговой суммы
function updateCartSummary(subtotal) {
    const deliveryCost = subtotal >= 1500 ? 0 : 300; // Бесплатная доставка от 1500₽
    const total = subtotal + deliveryCost;
    
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) {
        subtotalElement.textContent = `${formatPrice(subtotal)} ₽`;
    }
    
    if (deliveryElement) {
        deliveryElement.textContent = deliveryCost === 0 ? 'Бесплатно' : `${formatPrice(deliveryCost)} ₽`;
        deliveryElement.style.color = deliveryCost === 0 ? '#4caf50' : '';
    }
    
    if (totalElement) {
        totalElement.textContent = `${formatPrice(total)} ₽`;
    }
}

// Обновление счетчика товаров в шапке
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Инициализация модального окна оформления заказа
function initCheckoutModal() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const cancelOrderBtn = document.getElementById('cancel-order');
    const modalCloseBtn = document.querySelector('#checkout-modal .modal-close');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (!checkoutBtn || !checkoutModal) return;
    
    // Открытие модального окна
    checkoutBtn.addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0) {
            checkoutModal.style.display = 'block';
        }
    });
    
    // Закрытие модального окна
    function closeModal() {
        checkoutModal.style.display = 'none';
    }
    
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', closeModal);
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            closeModal();
        }
    });
    
    // Обработка формы оформления заказа
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const orderData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address'),
                comment: formData.get('comment'),
                cart: JSON.parse(localStorage.getItem('cart')) || [],
                date: new Date().toISOString(),
                total: calculateOrderTotal()
            };
            
            // В реальном приложении здесь был бы AJAX запрос к серверу
            console.log('Заказ оформлен:', orderData);
            
            // Показываем подтверждение
            alert('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время для подтверждения.');
            
            // Очищаем корзину
            localStorage.setItem('cart', JSON.stringify([]));
            
            // Закрываем модальное окно
            closeModal();
            
            // Обновляем отображение корзины
            updateCartCount();
            loadCartItems();
        });
    }
}

// Расчет общей суммы заказа
function calculateOrderTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const allProducts = getProducts();
    
    let subtotal = 0;
    cart.forEach(cartItem => {
        const product = allProducts.find(p => p.id == cartItem.id);
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });
    
    const deliveryCost = subtotal >= 1500 ? 0 : 300;
    return subtotal + deliveryCost;
}

// Получение товаров (дублируем из main.js)
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

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

// Показ уведомлений
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-weight: bold;
        box-shadow: var(--shadow);
    `;
    notification.textContent = message;
    
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
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .cart-item-image-container {
        width: 100px;
        height: 100px;
        background: var(--secondary-color);
        border-radius: var(--border-radius);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .cart-image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-color);
        background: var(--primary-color);
    }
    
    .cart-image-placeholder i {
        font-size: 2rem;
    }
    
    .cart-item-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quantity-btn {
        background: var(--secondary-color);
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
    }
    
    .quantity-btn:hover {
        background: var(--accent-color);
        color: white;
    }
    
    .quantity-value {
        min-width: 30px;
        text-align: center;
        font-weight: bold;
    }
    
    .remove-btn {
        background: none;
        border: none;
        color: var(--light-text);
        cursor: pointer;
        font-size: 1.2rem;
        transition: var(--transition);
        padding: 0.5rem;
    }
    
    .remove-btn:hover {
        color: #ff4444;
        transform: scale(1.2);
    }
`;
document.head.appendChild(style);