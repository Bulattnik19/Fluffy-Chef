// Режим для слабовидящих
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('accessibility-toggle');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            toggleAccessibilityMode();
        });
        
        // Добавляем aria-label в зависимости от текущего состояния
        updateAccessibilityButtonLabel();
    }
    
    // Проверяем сохраненные настройки
    const savedMode = localStorage.getItem('accessibilityMode');
    if (savedMode) {
        document.body.classList.add(savedMode);
        updateAccessibilityButtonLabel();
    }
    
    // Улучшаем навигацию с клавиатуры
    enhanceKeyboardNavigation();
});

function toggleAccessibilityMode() {
    const body = document.body;
    
    if (body.classList.contains('accessibility-high-contrast')) {
        body.classList.remove('accessibility-high-contrast');
        localStorage.removeItem('accessibilityMode');
    } else if (body.classList.contains('accessibility-high')) {
        body.classList.add('accessibility-high-contrast');
        localStorage.setItem('accessibilityMode', 'accessibility-high-contrast');
    } else {
        body.classList.add('accessibility-high');
        localStorage.setItem('accessibilityMode', 'accessibility-high');
    }
    
    updateAccessibilityButtonLabel();
}

function updateAccessibilityButtonLabel() {
    const toggleBtn = document.getElementById('accessibility-toggle');
    const body = document.body;
    
    if (!toggleBtn) return;
    
    if (body.classList.contains('accessibility-high-contrast')) {
        toggleBtn.setAttribute('aria-label', 'Высококонтрастный режим включен. Нажмите для выключения');
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else if (body.classList.contains('accessibility-high')) {
        toggleBtn.setAttribute('aria-label', 'Режим для слабовидящих включен. Нажмите для высококонтрастного режима');
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    } else {
        toggleBtn.setAttribute('aria-label', 'Режим для слабовидящих выключен. Нажмите для включения');
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function enhanceKeyboardNavigation() {
    // Добавляем навигацию с клавиатуры для модальных окон
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
    
    // Ловушка фокуса в модальных окнах
    document.addEventListener('focusin', function(e) {
        const modal = e.target.closest('.modal');
        if (modal && modal.style.display === 'block') {
            trapFocus(modal, e);
        }
    });
}

function trapFocus(modal, e) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.target === firstElement && e.shiftKey) {
        e.preventDefault();
        lastElement.focus();
    } else if (e.target === lastElement && !e.shiftKey) {
        e.preventDefault();
        firstElement.focus();
    }
}

// Утилиты для работы с модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Фокус на первый интерактивный элемент
        const firstInput = modal.querySelector('input, button, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Инициализация модальных окон
document.addEventListener('DOMContentLoaded', function() {
    // Закрытие модальных окон при клике на крестик или вне окна
    document.querySelectorAll('.modal-close, .modal').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('modal-close')) {
                const modal = this.closest('.modal') || this;
                closeModal(modal.id);
            }
        });
    });
});