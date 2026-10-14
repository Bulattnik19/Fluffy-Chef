// Функциональность страницы отзывов
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.reviews-page')) {
        initReviews();
    }
});

function initReviews() {
    loadReviews();
    initReviewForm();
}

// Загрузка отзывов
function loadReviews() {
    const reviewsContainer = document.getElementById('reviews-list');
    
    if (!reviewsContainer) return;
    
    // Пример данных отзывов (в реальном приложении - запрос к API)
    const reviews = [
        {
            id: 1,
            name: "Анна Петрова",
            pet: "Кошка Муся",
            rating: 5,
            text: "Моя кошка просто обожает лакомства Fluffy Chef! Качество на высшем уровне, состав натуральный. Рекомендую всем владельцам кошек!",
            date: "2024-01-15"
        },
        {
            id: 2,
            name: "Иван Сидоров",
            pet: "Собака Барсик",
            rating: 4,
            text: "Корм отличный, собака ест с удовольствием. Цена соответствует качеству. Доставка быстрая. Буду заказывать еще!",
            date: "2024-01-10"
        },
        {
            id: 3,
            name: "Мария Козлова",
            pet: "Хомяк Пушистик",
            rating: 5,
            text: "Не ожидала такого качества за такую цену! Хомяк в восторге, постоянно просит добавки. Спасибо за заботу о наших питомцах!",
            date: "2024-01-08"
        },
        {
            id: 4,
            name: "Дмитрий Волков",
            pet: "Попугай Кеша",
            rating: 5,
            text: "Отличный корм для птиц! Перья стали ярче, птица активнее. Буду рекомендовать вашу продукцию друзьям.",
            date: "2024-01-05"
        },
        {
            id: 5,
            name: "Елена Смирнова",
            pet: "Две кошки",
            rating: 4,
            text: "Корм хороший, но хотелось бы больше разнообразия вкусов. Доставка оперативная, упаковка качественная.",
            date: "2024-01-02"
        }
    ];
    
    renderReviews(reviews);
}

// Рендер отзывов
function renderReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-list');
    
    if (!reviewsContainer) return;
    
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card animate-fade-in">
            <div class="review-header">
                <div class="reviewer-info">
                    <h3>${review.name}</h3>
                    ${review.pet ? `<div class="reviewer-pet">${review.pet}</div>` : ''}
                </div>
                <div class="review-rating">
                    ${generateStarRating(review.rating)}
                </div>
            </div>
            <div class="review-text">
                ${review.text}
            </div>
            <div class="review-date">
                ${formatDate(review.date)}
            </div>
        </div>
    `).join('');
}

// Генерация звезд рейтинга
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 === rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Форматирование даты
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Инициализация формы отзыва
function initReviewForm() {
    const addReviewBtn = document.getElementById('add-review-btn');
    const reviewModal = document.getElementById('review-modal');
    const cancelReview = document.getElementById('cancel-review');
    const reviewForm = document.getElementById('review-form');
    const stars = document.querySelectorAll('.rating-input .star');
    
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', function() {
            openModal('review-modal');
        });
    }
    
    if (cancelReview) {
        cancelReview.addEventListener('click', function() {
            closeModal('review-modal');
        });
    }
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview();
        });
    }
    
    // Обработка выбора рейтинга
    if (stars) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                setRating(rating);
            });
            
            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                highlightStars(rating);
            });
        });
        
        document.querySelector('.rating-input').addEventListener('mouseleave', function() {
            const currentRating = document.getElementById('rating').value || 0;
            highlightStars(currentRating);
        });
    }
}

// Установка рейтинга
function setRating(rating) {
    document.getElementById('rating').value = rating;
    highlightStars(rating);
}

// Подсветка звезд
function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-input .star');
    stars.forEach(star => {
        const starRating = star.getAttribute('data-rating');
        if (starRating <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Отправка отзыва
function submitReview() {
    const form = document.getElementById('review-form');
    const formData = new FormData(form);
    
    // Валидация формы
    if (!validateReviewForm(formData)) {
        return;
    }
    
    // Сбор данных отзыва
    const review = {
        id: Date.now(),
        name: formData.get('name'),
        pet: formData.get('pet'),
        rating: parseInt(formData.get('rating')),
        text: formData.get('text'),
        date: new Date().toISOString().split('T')[0]
    };
    
    // В реальном приложении здесь был бы запрос к API
    console.log('Review submitted:', review);
    
    // Показываем подтверждение
    showReviewConfirmation();
    
    // Очищаем форму
    form.reset();
    setRating(0);
    
    // Закрываем модальное окно
    closeModal('review-modal');
    
    // В реальном приложении здесь бы обновлялся список отзывов
}

// Валидация формы отзыва
function validateReviewForm(formData) {
    const name = formData.get('name');
    const rating = formData.get('rating');
    const text = formData.get('text');
    
    if (!name || name.trim().length < 2) {
        showNotification('Пожалуйста, введите ваше имя', 'error');
        return false;
    }
    
    if (!rating || rating === '0') {
        showNotification('Пожалуйста, поставьте оценку', 'error');
        return false;
    }
    
    if (!text || text.trim().length < 10) {
        showNotification('Пожалуйста, напишите отзыв (минимум 10 символов)', 'error');
        return false;
    }
    
    return true;
}

// Показ подтверждения отправки отзыва
function showReviewConfirmation() {
    showNotification('Спасибо за ваш отзыв! Он будет опубликован после проверки.', 'info');
}

// Загрузка дополнительных отзывов
document.addEventListener('DOMContentLoaded', function() {
    const loadMoreReviewsBtn = document.getElementById('load-more-reviews');
    
    if (loadMoreReviewsBtn) {
        loadMoreReviewsBtn.addEventListener('click', function() {
            // В реальном приложении здесь был бы запрос к API
            this.style.display = 'none';
            showNotification('Все отзывы загружены', 'info');
        });
    }
});