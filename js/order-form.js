class OrderForm {
    constructor() {
        this.container = document.querySelector('.order-form');
        // Инициализируем форму после нажатия кнопки расчета
        window.addEventListener('DOMContentLoaded', () => {
            const calculateButton = document.getElementById('calculate-button');
            calculateButton.addEventListener('click', () => {
                setTimeout(() => this.initializeForm(), 100);
            });
        });
    }
    
    initializeForm() {
        if (!window.calculator || !window.calculator.lastCalculatedPrice) {
            console.warn('Calculator not initialized or price not calculated');
            return;
        }

        this.container.innerHTML = `
            <form id="tour-order-form">
                <div class="tour-summary">
                    <div class="tour-summary-title">Параметры тура</div>
                    ${this.generateTourSummary()}
                </div>

                <div class="form-group">
                    <label for="name">Как к вам обращаться</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="phone">Телефон для связи</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="dates">Предпочтительные даты поездки</label>
                    <input type="text" id="dates" name="dates" placeholder="Например: 15-20 июля">
                </div>
                
                <div class="form-group">
                    <label for="comments">Дополнительные пожелания</label>
                    <textarea id="comments" name="comments" rows="4" placeholder="Особые пожелания, вопросы или комментарии к туру"></textarea>
                </div>
                
                <button type="submit" class="form-submit-btn">Отправить заявку</button>
            </form>
        `;
        
        this.initializeEventListeners();
    }

    generateTourSummary() {
        const type = this.getTourTypeText();
        const adults = window.tourType.getAdults();
        const children = window.tourType.getChildren();
        const days = window.tourType.getDays();
        const totalPrice = window.calculator.getLastCalculatedPrice();
        const pricePerPerson = Math.ceil(totalPrice / (adults + children));

        return `
            <div class="tour-summary-item">
                <span>Тип тура:</span>
                <span>${type}</span>
            </div>
            <div class="tour-summary-item">
                <span>Количество человек:</span>
                <span>${this.getPeopleText(adults, children)}</span>
            </div>
            <div class="tour-summary-item">
                <span>Длительность:</span>
                <span>${days} ${this.getDaysText(days)}</span>
            </div>
            <div class="tour-summary-item">
                <span>Общая стоимость:</span>
                <span>${formatPrice(totalPrice)}</span>
            </div>
            <div class="tour-summary-item">
                <span>Стоимость на человека:</span>
                <span>${formatPrice(pricePerPerson)}</span>
            </div>
        `;
    }
    
    getTourTypeText() {
        return window.tourType.getTourType() === 'individual' ? 'Индивидуальный' : 'Корпоративный';
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
    
    initializeEventListeners() {
        const form = document.getElementById('tour-order-form');
        const phoneInput = document.getElementById('phone');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = '+' + value;
                if (value.length > 2) {
                    value = value.substring(0, 2) + ' (' + value.substring(2);
                }
                if (value.length > 7) {
                    value = value.substring(0, 7) + ') ' + value.substring(7);
                }
                if (value.length > 12) {
                    value = value.substring(0, 12) + '-' + value.substring(12);
                }
                if (value.length > 15) {
                    value = value.substring(0, 15) + '-' + value.substring(15);
                }
            }
            e.target.value = value;
        });
    }
    
    async handleSubmit(e) {
        const formData = new FormData(e.target);
        const submitButton = e.target.querySelector('.form-submit-btn');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
            
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                dates: formData.get('dates'),
                comments: formData.get('comments'),
                tour: this.getTourDetails()
            };
            
            // Здесь будет отправка на сервер
            console.log('Отправка заявки:', data);
            
            // Имитация задержки
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess();
            
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            this.showError();
            
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить заявку';
        }
    }
    
    getTourDetails() {
        return {
            type: window.tourType.getTourType(),
            adults: window.tourType.getAdults(),
            children: window.tourType.getChildren(),
            days: window.tourType.getDays(),
            accommodation: window.accommodation.getSelectedOption(),
            meals: window.meals.getSelectedOption(),
            isLuxuryMeals: window.meals.isLuxury(),
            excursions: window.excursions.getSelectedExcursions(),
            activities: window.activities.getSelectedActivities(),
            corporate: window.corporateEvents ? window.corporateEvents.getSelectedEvents() : [],
            totalPrice: window.calculator.getLastCalculatedPrice()
        };
    }
    
    showSuccess() {
        this.container.innerHTML = `
            <div class="success-message">
                <i data-lucide="check-circle"></i>
                <h3>Заявка успешно отправлена!</h3>
                <p>Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.</p>
                <button onclick="window.location.reload()" class="form-submit-btn">
                    Создать новый расчет
                </button>
            </div>
        `;
        lucide.createIcons();
    }
    
    showError() {
        const errorMessage = createElement('div', 'error-message');
        errorMessage.textContent = 'Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.';
        
        const form = document.getElementById('tour-order-form');
        form.insertBefore(errorMessage, form.firstChild);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
}

// Initialize order form
const orderForm = new OrderForm();
window.orderForm = orderForm;