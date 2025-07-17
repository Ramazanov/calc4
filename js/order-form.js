class OrderForm {
    constructor() {
        this.container = document.querySelector('.order-form');
        // Инициализируем форму после нажатия кнопки расчета
        window.addEventListener('DOMContentLoaded', () => {
            const calculateButton = document.getElementById('calculate-button');
            if (calculateButton) {
                calculateButton.addEventListener('click', () => {
                    setTimeout(() => this.initializeForm(), 100);
                });
            }
        });
    }
    
    initializeForm() {
        if (!window.calculator || !window.calculator.lastCalculatedPrice) {
            console.warn('Calculator not initialized or price not calculated');
            return;
        }

        this.container.innerHTML = `
            <div class="tour-booking-info">
                <div class="tour-summary">
                    <div class="tour-summary-title">Параметры тура</div>
                    ${this.generateTourSummary()}
                </div>

                <div class="tour-details">
                    <div class="tour-details-title">Что включено в тур</div>
                    ${this.generateTourDetails()}
                </div>

                <div class="booking-actions">
                    <button type="button" class="whatsapp-booking-btn" onclick="orderForm.openWhatsApp()">
                        <i data-lucide="message-circle"></i>
                        Забронировать в WhatsApp
                    </button>
                    <p class="booking-note">
                        Нажмите кнопку выше, чтобы отправить заявку на бронирование через WhatsApp
                    </p>
                </div>
            </div>
        `;
        
        // Инициализируем иконки Lucide если доступны
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    generateTourSummary() {
        const adults = window.tourType ? window.tourType.getAdults() : 1;
        const children = window.tourType ? window.tourType.getChildren() : 0;
        const days = window.tourType ? window.tourType.getDays() : 1;
        const totalPrice = window.calculator.getLastCalculatedPrice();
        const pricePerPerson = Math.ceil(totalPrice / (adults + children));

        return `
            <div class="tour-summary-item">
                <span>Тип тура:</span>
                <span>Индивидуальный</span>
            </div>
            <div class="tour-summary-item">
                <span>Количество человек:</span>
                <span>${this.getPeopleText(adults, children)}</span>
            </div>
            <div class="tour-summary-item">
                <span>Длительность:</span>
                <span>${days} ${this.getDaysText(days)}</span>
            </div>
            <div class="tour-summary-item total-price">
                <span>Общая стоимость:</span>
                <span>${formatPrice(totalPrice)}</span>
            </div>
            <div class="tour-summary-item">
                <span>Стоимость на человека:</span>
                <span>${formatPrice(pricePerPerson)}</span>
            </div>
        `;
    }

    generateTourDetails() {
        let details = '';
        
        // Проживание
        if (window.accommodation && window.accommodation.getSelectedAccommodation()) {
            const accommodation = window.accommodation.getSelectedAccommodation();
            details += `
                <div class="tour-detail-item">
                    <i data-lucide="bed"></i>
                    <span>Проживание: ${accommodation.title}</span>
                </div>
            `;
        }

        // Питание
        if (window.meals) {
            const selectedMeals = CONFIG.mealsOptions.find(m => m.id === window.meals.selectedMealPackage);
            if (selectedMeals) {
                details += `
                    <div class="tour-detail-item">
                        <i data-lucide="utensils"></i>
                        <span>Питание: ${selectedMeals.title}</span>
                    </div>
                `;
            }
        }

        // Экскурсии
        if (window.excursions && window.excursions.getSelectedExcursions().length > 0) {
            const excursions = window.excursions.getSelectedExcursions();
            details += `
                <div class="tour-detail-item">
                    <i data-lucide="map"></i>
                    <span>Экскурсии: ${excursions.map(exc => exc.name).join(', ')}</span>
                </div>
            `;
        }

        // Активности
        if (window.activities && window.activities.getSelectedActivities().length > 0) {
            const activities = window.activities.getSelectedActivities();
            details += `
                <div class="tour-detail-item">
                    <i data-lucide="activity"></i>
                    <span>Активности: ${activities.map(act => act.name).join(', ')}</span>
                </div>
            `;
        }

        return details || `
            <div class="tour-detail-item">
                <i data-lucide="info"></i>
                <span>Базовый тур без дополнительных услуг</span>
            </div>
        `;
    }
    
    getPeopleText(adults, children) {
        let text = `${adults} ${this.getPeopleCountText(adults, 'взрослый', 'взрослых', 'взрослых')}`;
        if (children > 0) {
            text += `, ${children} ${this.getPeopleCountText(children, 'ребенок', 'ребенка', 'детей')}`;
        }
        return text;
    }
    
    getPeopleCountText(count, one, few, many) {
        if (count % 10 === 1 && count % 100 !== 11) {
            return one;
        }
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
            return few;
        }
        return many;
    }
    
    getDaysText(days) {
        if (days % 10 === 1 && days % 100 !== 11) {
            return 'день';
        }
        if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20)) {
            return 'дня';
        }
        return 'дней';
    }

    openWhatsApp() {
        const tourInfo = this.getTourDetails();
        const message = this.formatWhatsAppMessage(tourInfo);
        
        // Номер WhatsApp (замените на ваш номер)
        const whatsappNumber = "79650847777"; // Укажите ваш номер в международном формате без +
        
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Открываем WhatsApp в новом окне
        window.open(whatsappUrl, '_blank');
    }

    formatWhatsAppMessage(tourInfo) {
        let message = "🏖️ *Заявка на бронирование тура*\n\n";
        
        message += `📋 *Параметры тура:*\n`;
        message += `• Тип: Индивидуальный\n`;
        message += `• Количество человек: ${this.getPeopleText(tourInfo.adults, tourInfo.children)}\n`;
        message += `• Длительность: ${tourInfo.days} ${this.getDaysText(tourInfo.days)}\n`;
        
        if (tourInfo.startDate && tourInfo.endDate) {
            message += `• Даты: ${tourInfo.startDate} - ${tourInfo.endDate}\n`;
        }
        
        message += `\n💰 *Стоимость:*\n`;
        message += `• Общая стоимость: ${formatPrice(tourInfo.totalPrice)}\n`;
        message += `• На человека: ${formatPrice(Math.ceil(tourInfo.totalPrice / (tourInfo.adults + tourInfo.children)))}\n`;
        
        // Добавляем информацию о включенных услугах
        if (tourInfo.accommodation) {
            message += `\n🏨 *Проживание:* ${tourInfo.accommodation.title}\n`;
        }
        
        if (tourInfo.meals) {
            message += `🍽️ *Питание:* ${tourInfo.meals.title}\n`;
        }
        
        if (tourInfo.excursions && tourInfo.excursions.length > 0) {
            message += `🗺️ *Экскурсии:* ${tourInfo.excursions.map(exc => exc.name).join(', ')}\n`;
        }
        
        if (tourInfo.activities && tourInfo.activities.length > 0) {
            message += `🎯 *Активности:* ${tourInfo.activities.map(act => act.name).join(', ')}\n`;
        }
        
        message += `\n📞 Прошу связаться со мной для уточнения деталей и оформления бронирования.`;
        
        return message;
    }
    
    getTourDetails() {
        return {
            type: 'individual',
            adults: window.tourType ? window.tourType.getAdults() : 1,
            children: window.tourType ? window.tourType.getChildren() : 0,
            days: window.tourType ? window.tourType.getDays() : 1,
            startDate: window.tourType ? window.tourType.getStartDate() : null,
            endDate: window.tourType ? window.tourType.getEndDate() : null,
            accommodation: window.accommodation ? window.accommodation.getSelectedAccommodation() : null,
            meals: window.meals ? CONFIG.mealsOptions.find(m => m.id === window.meals.selectedMealPackage) : null,
            excursions: window.excursions ? window.excursions.getSelectedExcursions() : [],
            activities: window.activities ? window.activities.getSelectedActivities() : [],
            totalPrice: window.calculator.getLastCalculatedPrice()
        };
    }
}

// Initialize order form
const orderForm = new OrderForm();
window.orderForm = orderForm;