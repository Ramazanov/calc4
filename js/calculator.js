class Calculator {
    constructor() {
        this.priceElement = document.querySelector('.price');
        this.calculateButton = document.getElementById('calculate-button');
        this.lastCalculatedPrice = 0;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.calculateButton.addEventListener('click', () => {
            this.calculateTotalPrice();
        });
    }
    
    calculateTotalPrice() {
        const days = window.tourType.getDays();
        const adults = window.tourType.getAdults();
        const children = window.tourType.getChildren();
        const totalPeople = adults + children;
        const tourType = window.tourType.getTourType();

        // Фиксированная плата за каждого человека
        const basePersonPrice = 1000 * totalPeople;

        // Проживание
        const accommodationBasePrice = window.accommodation.getBasePrice();
        const accommodationAdults = accommodationBasePrice * (days - 1) * adults;
        const accommodationChildren = accommodationBasePrice * (days - 1) * children * (1 - CONFIG.childDiscounts.accommodation);
        const accommodationTotal = accommodationAdults + accommodationChildren;

        // Питание
        const mealsBasePrice = window.meals.getBasePrice();
        const mealsMultiplier = window.meals.isLuxury() ? 2 : 1;
        const mealsAdults = mealsBasePrice * days * adults * mealsMultiplier;
        const mealsChildren = mealsBasePrice * days * children * (1 - CONFIG.childDiscounts.meals) * mealsMultiplier;
        const mealsTotal = mealsAdults + mealsChildren;

        // Экскурсии
        const excursionsAdults = window.excursions.getSelectedExcursions().reduce((sum, exc) => sum + exc.price * adults, 0);
        const excursionsChildren = window.excursions.getSelectedExcursions().reduce((sum, exc) => 
            sum + exc.price * children * (1 - CONFIG.childDiscounts.excursions), 0);
        const excursionsTotal = excursionsAdults + excursionsChildren;

        // Активности
        const activitiesAdults = window.activities.getSelectedActivities().reduce((sum, act) => sum + act.price * adults, 0);
        const activitiesChildren = window.activities.getSelectedActivities().reduce((sum, act) => 
            sum + act.price * children * (1 - CONFIG.childDiscounts.activities), 0);
        const activitiesTotal = activitiesAdults + activitiesChildren;

        // Корпоративные мероприятия
        let corporateTotal = 0;
        if (tourType === 'corporate') {
            corporateTotal = window.corporateEvents.getSelectedEvents().reduce((sum, event) => 
                sum + event.price * (adults + children), 0);
        }

        // Базовая общая стоимость
        let totalPrice = basePersonPrice + accommodationTotal + mealsTotal + excursionsTotal + activitiesTotal + corporateTotal;

        // Применяем наценку в зависимости от количества человек
        if (totalPeople <= 3) {
            const multiplier = CONFIG.priceMultipliers[totalPeople] || 1;
            totalPrice *= multiplier;
        }

        // Корпоративная скидка (применяется после наценки)
        if (tourType === 'corporate') {
            const discount = CONFIG.corporateDiscounts
                .filter(d => d.minPeople <= totalPeople)
                .sort((a, b) => b.minPeople - a.minPeople)[0];
            
            if (discount) {
                totalPrice *= (1 - discount.discount);
            }
        }

        // Округляем до тысяч в большую сторону
        totalPrice = roundToThousands(totalPrice);
        const pricePerPerson = roundToThousands(totalPrice / totalPeople);
        
        this.lastCalculatedPrice = totalPrice;
        
        // Вывод цены
        this.priceElement.innerHTML = `
            <div class="total-price">Общая стоимость: ${formatPrice(totalPrice)}</div>
            <div class="price-per-person">Стоимость на человека: ${formatPrice(pricePerPerson)}</div>
        `;
        this.priceElement.classList.add('visible');

        // Показываем форму заказа
        document.querySelector('[data-section="order"]').style.removeProperty('display');
        window.orderForm.initializeForm();

        // Debug
        console.log('Расчет стоимости:', {
            totalPeople,
            multiplier: CONFIG.priceMultipliers[totalPeople] || 1,
            basePersonPrice,
            accommodation: { base: accommodationBasePrice, adults: accommodationAdults, children: accommodationChildren, total: accommodationTotal },
            meals: { base: mealsBasePrice, adults: mealsAdults, children: mealsChildren, total: mealsTotal },
            excursions: { adults: excursionsAdults, children: excursionsChildren, total: excursionsTotal },
            activities: { adults: activitiesAdults, children: activitiesChildren, total: activitiesTotal },
            corporate: corporateTotal,
            total: totalPrice,
            perPerson: pricePerPerson
        });
    }

    getLastCalculatedPrice() {
        return this.lastCalculatedPrice;
    }
}

// Initialize calculator
const calculator = new Calculator();
window.calculator = calculator;