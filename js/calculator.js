class Calculator {
    constructor() {
        this.priceElement = document.querySelector('.price');
        this.calculateButton = document.getElementById('calculate-button');
        this.lastCalculatedPrice = 0;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.calculateButton.addEventListener('click', () => {
            this.calculateTotalPrice(this.getCurrentParams());
        });
        
        EventBus.subscribe('paramsUpdate', (params) => {
            this.calculateTotalPrice(params);
        });
    }
    
    getCurrentParams() {
        if (window.tourType) {
            return {
                days: window.tourType.getDays(),
                adults: window.tourType.getAdults(),
                children: window.tourType.getChildren(),
                startDate: window.tourType.getStartDate(),
                endDate: window.tourType.getEndDate()
            };
        }
        return {
            days: 1,
            adults: 1,
            children: 0,
            startDate: null,
            endDate: null
        };
    }
    
    calculateTotalPrice(params) {
        // Проверяем, что params определен
        if (!params) {
            params = this.getCurrentParams();
        }
        
        const { days, adults, children } = params;
        const totalPeople = adults + children;

        // Фиксированная плата за каждого человека
        const basePersonPrice = 1000 * totalPeople;

        // Базовая стоимость за каждый день тура
        const selectedAccommodation = window.accommodation ? window.accommodation.getSelectedOption() : 'standard';
        let dailyBasePrice = 0;
        
        switch (selectedAccommodation) {
            case 'standard':
                dailyBasePrice = 5000;
                break;
            case 'comfort':
                dailyBasePrice = 5500;
                break;
            case 'luxury':
                dailyBasePrice = 6000;
                break;
            default:
                dailyBasePrice = 5000;
        }
        
        const baseDailyCost = dailyBasePrice * days;

        // Проживание
        const accommodationBasePrice = window.accommodation ? window.accommodation.getBasePrice() : 0;
        const accommodationAdults = accommodationBasePrice * (days - 1) * adults;
        const accommodationChildren = accommodationBasePrice * (days - 1) * children * (1 - CONFIG.childDiscounts.accommodation);
        const accommodationTotal = accommodationAdults + accommodationChildren;

        // Питание
        const mealsBasePrice = window.meals ? window.meals.getBasePrice() : 0;
        const mealsAdults = mealsBasePrice * days * adults;
        const mealsChildren = mealsBasePrice * days * children * (1 - CONFIG.childDiscounts.meals);
        const mealsTotal = mealsAdults + mealsChildren;

        // Экскурсии
        const selectedExcursions = window.excursions ? window.excursions.getSelectedExcursions() : [];
        const excursionsAdults = selectedExcursions.reduce((sum, exc) => sum + exc.price * adults, 0);
        const excursionsChildren = selectedExcursions.reduce((sum, exc) => 
            sum + exc.price * children * (1 - CONFIG.childDiscounts.excursions), 0);
        const excursionsTotal = excursionsAdults + excursionsChildren;

        // Активности
        const selectedActivities = window.activities ? window.activities.getSelectedActivities() : [];
        const activitiesAdults = selectedActivities.reduce((sum, act) => sum + act.price * adults, 0);
        const activitiesChildren = selectedActivities.reduce((sum, act) => 
            sum + act.price * children * (1 - CONFIG.childDiscounts.activities), 0);
        const activitiesTotal = activitiesAdults + activitiesChildren;

        // Базовая общая стоимость (добавляем базовую стоимость за дни)
        let totalPrice = basePersonPrice + baseDailyCost + accommodationTotal + mealsTotal + excursionsTotal + activitiesTotal;

        // Применяем наценку в зависимости от количества человек
        if (totalPeople <= 3) {
            const multiplier = CONFIG.priceMultipliers[totalPeople] || 1;
            totalPrice *= multiplier;
        }

        // Округляем до тысяч в большую сторону
        totalPrice = roundToThousands(totalPrice);
        const pricePerPerson = roundToThousands(totalPrice / totalPeople);
        
        this.lastCalculatedPrice = totalPrice;
        
        // Вывод цены
        this.priceElement.style.fontSize = '16px';
        this.priceElement.style.padding = '10px';
        this.priceElement.style.margin = '10px 0';
        this.priceElement.innerHTML = `
            <div class="total-price">Общая стоимость: ${formatPrice(totalPrice)}</div>
            <div class="price-per-person">Стоимость на человека: ${formatPrice(pricePerPerson)}</div>
        `;
        this.priceElement.classList.add('visible');

        // Показываем форму заказа
        const orderSection = document.querySelector('[data-section="order"]');
        if (orderSection) {
            orderSection.style.removeProperty('display');
        }
        if (window.orderForm) {
            window.orderForm.initializeForm();
        }

        // Debug
        console.log('Расчет стоимости:', {
            totalPeople,
            days,
            dailyBasePrice,
            baseDailyCost,
            multiplier: CONFIG.priceMultipliers[totalPeople] || 1,
            basePersonPrice,
            accommodation: { base: accommodationBasePrice, adults: accommodationAdults, children: accommodationChildren, total: accommodationTotal },
            meals: { base: mealsBasePrice, adults: mealsAdults, children: mealsChildren, total: mealsTotal },
            excursions: { adults: excursionsAdults, children: excursionsChildren, total: excursionsTotal },
            activities: { adults: activitiesAdults, children: activitiesChildren, total: activitiesTotal },
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