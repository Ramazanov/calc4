// Event Bus для коммуникации между компонентами
const EventBus = {
    listeners: {},
    
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        
        // Возвращаем функцию для отписки
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    },
    
    dispatch(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
};

function roundToThousands(number) {
    return Math.ceil(number / 1000) * 1000;
}

// Функция для форматирования цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(price);
}

// Функция для создания DOM элементов
function createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
}

// Функция для склонения числительных
function pluralize(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
}

// Функция для определения текущего сезона
function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

// Функция для проверки мобильного устройства
function isMobile() {
    return window.innerWidth <= 480;
}

// Функция для дебаунсинга
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Функция для валидации email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Функция для валидации телефона
function validatePhone(phone) {
    const re = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return re.test(phone);
}

// Функция для получения корпоративной скидки
function getCorporateDiscount(peopleCount) {
    const discount = CONFIG.corporateDiscounts
        .filter(d => d.minPeople <= peopleCount)
        .sort((a, b) => b.minPeople - a.minPeople)[0];
    
    return discount ? discount.discount : 0;
}

// Функция для проверки возрастных ограничений
function checkAgeRestrictions(activity, hasChildren) {
    if (!hasChildren) return true;
    return !activity.minAge || activity.minAge <= 12; // Предполагаем, что дети младше 12
}

// Функция для форматирования даты
function formatDate(date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));
}

// Функция для сохранения состояния в localStorage
function saveState(key, state) {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Функция для загрузки состояния из localStorage
function loadState(key) {
    try {
        const state = localStorage.getItem(key);
        return state ? JSON.parse(state) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}