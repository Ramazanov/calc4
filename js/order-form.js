class OrderForm {
    constructor() {
        this.container = document.querySelector('.order-form');
        // Инициализируем форму после нажатия кнопки расчета
        window.addEventListener('DOMContentLoaded', function() {
            var calculateButton = document.getElementById('calculate-button');
            if (calculateButton) {
                calculateButton.addEventListener('click', function() {
                    setTimeout(function() {
                        if (window.orderForm) {
                            window.orderForm.initializeForm();
                        }
                    }, 100);
                });
            }
        });
    }
    
    initializeForm() {
        if (!window.calculator || !window.calculator.lastCalculatedPrice) {
            console.warn('Calculator not initialized or price not calculated');
            return;
        }

        this.container.innerHTML = '<div class="tour-booking-info"><div class="tour-summary"><div class="tour-summary-title">Параметры тура</div>' + this.generateTourSummary() + '</div><div class="tour-details"><div class="tour-details-title">Что включено в тур</div>' + this.generateTourDetails() + '</div><div class="booking-actions"><button type="button" class="whatsapp-booking-btn" onclick="orderForm.openWhatsApp()"><i data-lucide="message-circle"></i>Забронировать в WhatsApp</button><p class="booking-note">Нажмите кнопку выше, чтобы отправить заявку на бронирование через WhatsApp</p></div></div>';
        
        // Инициализируем иконки Lucide если доступны
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    generateTourSummary() {
        var adults = 1;
        var children = 0;
        var days = 1;
        var tourType = null;
        var totalPrice = 0;
        var pricePerPerson = 0;

        if (window.tourType) {
            adults = window.tourType.getAdults();
            children = window.tourType.getChildren();
            days = window.tourType.getDays();
            tourType = window.tourType.getSelectedTourType();
        }

        if (window.calculator) {
            totalPrice = window.calculator.getLastCalculatedPrice();
            pricePerPerson = Math.ceil(totalPrice / (adults + children));
        }

        var tourTypeTitle = 'Индивидуальный';
        if (tourType) {
            tourTypeTitle = tourType.title;
        }

        return '<div class="tour-summary-item"><span>Тип тура:</span><span>' + tourTypeTitle + '</span></div><div class="tour-summary-item"><span>Количество человек:</span><span>' + this.getPeopleText(adults, children) + '</span></div><div class="tour-summary-item"><span>Длительность:</span><span>' + days + ' ' + this.getDaysText(days) + '</span></div><div class="tour-summary-item total-price"><span>Общая стоимость:</span><span>' + formatPrice(totalPrice) + '</span></div><div class="tour-summary-item"><span>Стоимость на человека:</span><span>' + formatPrice(pricePerPerson) + '</span></div>';
    }

    generateTourDetails() {
        var details = '';
        
        // Проживание
        if (window.accommodation && window.accommodation.getSelectedAccommodation()) {
            var accommodation = window.accommodation.getSelectedAccommodation();
            details += '<div class="tour-detail-item"><i data-lucide="bed"></i><span>Проживание: ' + accommodation.title + '</span></div>';
        }

        // Питание
        if (window.meals) {
            var selectedMeals = CONFIG.mealsOptions.find(function(m) {
                return m.id === window.meals.selectedMealPackage;
            });
            if (selectedMeals) {
                details += '<div class="tour-detail-item"><i data-lucide="utensils"></i><span>Питание: ' + selectedMeals.title + '</span></div>';
            }
        }

        // Экскурсии
        if (window.excursions && window.excursions.getSelectedExcursions().length > 0) {
            var excursions = window.excursions.getSelectedExcursions();
            details += '<div class="tour-detail-item"><i data-lucide="map"></i><span>Экскурсии: ' + excursions.map(function(exc) { return exc.name; }).join(', ') + '</span></div>';
        }

        // Активности
        if (window.activities && window.activities.getSelectedActivities().length > 0) {
            var activities = window.activities.getSelectedActivities();
            details += '<div class="tour-detail-item"><i data-lucide="zap"></i><span>Активности: ' + activities.map(function(act) { return act.name; }).join(', ') + '</span></div>';
        }

        if (details === '') {
            details = '<div class="tour-detail-item"><i data-lucide="info"></i><span>Базовый тур без дополнительных услуг</span></div>';
        }

        return details;
    }
    
    getPeopleText(adults, children) {
        var text = adults + ' ' + this.getPeopleCountText(adults, 'взрослый', 'взрослых', 'взрослых');
        if (children > 0) {
            text += ', ' + children + ' ' + this.getPeopleCountText(children, 'ребенок', 'ребенка', 'детей');
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
        var tourInfo = this.getTourDetails();
        var message = this.formatWhatsAppMessage(tourInfo);
        
        // Номер WhatsApp (замените на ваш номер)
        var whatsappNumber = "79650847777"; // Укажите ваш номер в международном формате без +
        
        var whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
        
        // Открываем WhatsApp в новом окне
        window.open(whatsappUrl, '_blank');
    }

    formatWhatsAppMessage(tourInfo) {
        var message = "🏖️ *Заявка на бронирование тура*\n\n";
        
        message += "📋 *Параметры тура:*\n";
        
        var tourTypeTitle = 'Индивидуальный';
        if (tourInfo.tourType) {
            tourTypeTitle = tourInfo.tourType.title;
        }
        
        message += "• Тип: " + tourTypeTitle + "\n";
        message += "• Количество человек: " + this.getPeopleText(tourInfo.adults, tourInfo.children) + "\n";
        message += "• Длительность: " + tourInfo.days + " " + this.getDaysText(tourInfo.days) + "\n";
        
        if (tourInfo.startDate && tourInfo.endDate) {
            message += "• Даты: " + tourInfo.startDate + " - " + tourInfo.endDate + "\n";
        }
        
        message += "\n💰 *Стоимость:*\n";
        message += "• Общая стоимость: " + formatPrice(tourInfo.totalPrice) + "\n";
        message += "• На человека: " + formatPrice(Math.ceil(tourInfo.totalPrice / (tourInfo.adults + tourInfo.children))) + "\n";
        
        // Добавляем информацию о включенных услугах
        if (tourInfo.accommodation) {
            message += "\n🏨 *Проживание:* " + tourInfo.accommodation.title + "\n";
        }
        
        if (tourInfo.meals) {
            message += "🍽️ *Питание:* " + tourInfo.meals.title + "\n";
        }
        
        if (tourInfo.excursions && tourInfo.excursions.length > 0) {
            message += "🗺️ *Экскурсии:* " + tourInfo.excursions.map(function(exc) { return exc.name; }).join(', ') + "\n";
        }
        
        if (tourInfo.activities && tourInfo.activities.length > 0) {
            message += "🎯 *Активности:* " + tourInfo.activities.map(function(act) { return act.name; }).join(', ') + "\n";
        }
        
        message += "\n📞 Прошу связаться со мной для уточнения деталей и оформления бронирования.";
        
        return message;
    }
    
    getTourDetails() {
        var tourType = window.tourType || null;
        var accommodation = window.accommodation || null;
        var meals = window.meals || null;
        var excursions = window.excursions || null;
        var activities = window.activities || null;
        var calculator = window.calculator || null;

        var result = {
            type: 'individual',
            tourType: null,
            adults: 1,
            children: 0,
            days: 1,
            startDate: null,
            endDate: null,
            accommodation: null,
            meals: null,
            excursions: [],
            activities: [],
            totalPrice: 0
        };

        if (tourType) {
            result.type = tourType.getTourType();
            result.tourType = tourType.getSelectedTourType();
            result.adults = tourType.getAdults();
            result.children = tourType.getChildren();
            result.days = tourType.getDays();
            result.startDate = tourType.getStartDate();
            result.endDate = tourType.getEndDate();
        }

        if (accommodation) {
            result.accommodation = accommodation.getSelectedAccommodation();
        }

        if (meals) {
            result.meals = CONFIG.mealsOptions.find(function(m) { 
                return m.id === meals.selectedMealPackage; 
            });
        }

        if (excursions) {
            result.excursions = excursions.getSelectedExcursions();
        }

        if (activities) {
            result.activities = activities.getSelectedActivities();
        }

        if (calculator) {
            result.totalPrice = calculator.getLastCalculatedPrice();
        }

        return result;
    }
}

// Initialize order form
var orderForm = new OrderForm();
window.orderForm = orderForm;