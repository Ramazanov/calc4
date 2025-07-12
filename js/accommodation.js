class Accommodation {
    constructor() {
        this.container = document.querySelector('.accommodation-options');
        this.selectedOption = 'none';
        
        this.initializeAccommodationOptions();
        
        // Подписываемся на изменение количества дней
        EventBus.subscribe('paramsUpdate', (params) => {
            if (params && params.days) {
                this.handleDaysChange(params.days);
            }
        });
    }
    
    initializeAccommodationOptions() {
        this.container.innerHTML = '';
        
        CONFIG.accommodationOptions.forEach(option => {
            const card = this.createAccommodationCard(option);
            this.container.appendChild(card);
        });
        
        const firstRadio = this.container.querySelector('.accommodation-radio');
        if (firstRadio) {
            firstRadio.checked = true;
            firstRadio.closest('.accommodation-card').classList.add('selected');
        }
        
        this.initializeEventListeners();
        
        // Проверяем начальное количество дней
        const initialDays = window.tourType.getDays();
        this.handleDaysChange(initialDays);
    }
    
    createAccommodationCard(option) {
        const card = createElement('label', 'accommodation-card');
        
        card.innerHTML = `
            <input type="radio" name="accommodation" class="accommodation-radio" value="${option.id}">
            <div class="accommodation-header">
                <span class="accommodation-title">${option.title}</span>
            </div>
            <div class="accommodation-description">${option.description}</div>
        `;
        
        return card;
    }
    
    initializeEventListeners() {
        const radios = this.container.querySelectorAll('.accommodation-radio');
        
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleAccommodationChange(e);
            });
        });
    }
    
    handleAccommodationChange(e) {
        const cards = this.container.querySelectorAll('.accommodation-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        const selectedCard = e.target.closest('.accommodation-card');
        selectedCard.classList.add('selected');
        this.selectedOption = e.target.value;
        
        EventBus.dispatch('tourUpdate', {});
    }
    
    handleDaysChange(days) {
        const cards = this.container.querySelectorAll('.accommodation-card');
        const radios = this.container.querySelectorAll('.accommodation-radio');
        
        if (days <= 1) {
            // Если 1 день, оставляем доступным только "Проживание не включено"
            radios.forEach((radio, index) => {
                const card = cards[index];
                if (radio.value !== 'none') {
                    radio.disabled = true;
                    card.classList.add('disabled');
                    
                    // Если был выбран другой вариант, переключаем на "Проживание не включено"
                    if (radio.checked) {
                        const noneRadio = Array.from(radios).find(r => r.value === 'none');
                        if (noneRadio) {
                            noneRadio.checked = true;
                            noneRadio.closest('.accommodation-card').classList.add('selected');
                        }
                        card.classList.remove('selected');
                        this.selectedOption = 'none';
                    }
                }
            });
        } else {
            // Если больше 1 дня, разблокируем все варианты
            radios.forEach((radio, index) => {
                radio.disabled = false;
                cards[index].classList.remove('disabled');
            });
        }
    }
    
    getBasePrice() {
        const option = CONFIG.accommodationOptions.find(opt => opt.id === this.selectedOption);
        return option ? option.price : 0;
    }

    getSelectedOption() {
        return this.selectedOption;
    }

    getSelectedAccommodation() {
        return CONFIG.accommodationOptions.find(opt => opt.id === this.selectedOption);
    }
}

// Initialize accommodation component
const accommodation = new Accommodation();
window.accommodation = accommodation;