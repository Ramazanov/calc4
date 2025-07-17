class TourType {
    constructor() {
        this.adultsCount = document.getElementById('adults');
        this.childrenCount = document.getElementById('children');
        this.dateRangeInput = document.getElementById('date-range');
        this.tourTypeContainer = document.querySelector('.tour-type-options');
        this.flatpickrInstance = null;
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.selectedTourType = 'individual'; // Default to individual

        this.initializeTourTypeOptions();
        this.initializeDateRangePicker();
        this.initializeEventListeners();
        this.handleParamChange(); // Trigger initial params update
    }

    initializeTourTypeOptions() {
        this.tourTypeContainer.innerHTML = '';
        
        CONFIG.tourTypes.forEach(tourType => {
            const card = this.createTourTypeCard(tourType);
            this.tourTypeContainer.appendChild(card);
        });

        // Set default selection
        const defaultRadio = this.tourTypeContainer.querySelector('.tour-type-radio[value="individual"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
            defaultRadio.closest('.tour-type-card').classList.add('selected');
        }

        this.initializeTourTypeEventListeners();
    }

    createTourTypeCard(tourType) {
        const card = createElement('label', 'tour-type-card');
        
        card.innerHTML = `
            <input type="radio" name="tour-type" class="tour-type-radio" value="${tourType.id}">
            <div class="tour-type-content">
                <div class="tour-type-header">
                    <i data-lucide="${tourType.icon}"></i>
                    <span class="tour-type-title">${tourType.title}</span>
                </div>
                <div class="tour-type-description">${tourType.description}</div>
            </div>
        `;
        
        return card;
    }

    initializeTourTypeEventListeners() {
        const radios = this.tourTypeContainer.querySelectorAll('.tour-type-radio');
        
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleTourTypeChange(e);
            });
        });
    }

    handleTourTypeChange(e) {
        const cards = this.tourTypeContainer.querySelectorAll('.tour-type-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        const selectedCard = e.target.closest('.tour-type-card');
        selectedCard.classList.add('selected');
        this.selectedTourType = e.target.value;
        
        // Reinitialize icons after DOM changes
        setTimeout(() => {
            lucide.createIcons();
        }, 0);
        
        // Dispatch tour type change event
        EventBus.dispatch('tourTypeChange', this.selectedTourType);
        this.handleParamChange();
    }

    initializeDateRangePicker() {
        this.flatpickrInstance = flatpickr(this.dateRangeInput, {
            mode: "range",
            locale: "ru",
            minDate: "today",
            dateFormat: "d.m.Y",
            showMonths: window.innerWidth > 768 ? 2 : 1,
            allowInput: false,
            clickOpens: true,
            placeholder: "Выберите даты поездки",
            onChange: (selectedDates, dateStr, instance) => {
                if (selectedDates.length === 2) {
                    this.selectedStartDate = selectedDates[0];
                    this.selectedEndDate = selectedDates[1];
                    this.handleParamChange();
                } else if (selectedDates.length === 0) {
                    this.selectedStartDate = null;
                    this.selectedEndDate = null;
                    this.handleParamChange();
                }
            },
            onReady: (selectedDates, dateStr, instance) => {
                // Настройка темной темы
                const calendar = instance.calendarContainer;
                calendar.classList.add('flatpickr-dark');
            }
        });

        // Обновление календаря при изменении размера экрана
        window.addEventListener('resize', () => {
            if (this.flatpickrInstance) {
                this.flatpickrInstance.set('showMonths', window.innerWidth > 768 ? 2 : 1);
            }
        });
    }

    initializeEventListeners() {
        this.adultsCount.addEventListener('change', () => this.handleParamChange());
        this.childrenCount.addEventListener('change', () => this.handleParamChange());
    }

    handleParamChange() {
        const days = this.getDays();
        const adults = this.getAdults();
        const children = this.getChildren();
        const startDate = this.getStartDate();
        const endDate = this.getEndDate();
        const tourType = this.getTourType();

        EventBus.dispatch('paramsUpdate', {
            days,
            adults,
            children,
            startDate,
            endDate,
            tourType
        });
    }

    getTourType() {
        return this.selectedTourType;
    }

    getStartDate() {
        return this.selectedStartDate ? this.selectedStartDate.toISOString().split('T')[0] : null;
    }

    getEndDate() {
        return this.selectedEndDate ? this.selectedEndDate.toISOString().split('T')[0] : null;
    }

    getAdults() {
        return parseInt(this.adultsCount.value) || 1;
    }

    getChildren() {
        return parseInt(this.childrenCount.value) || 0;
    }

    getDays() {
        if (this.selectedStartDate && this.selectedEndDate) {
            const diffTime = this.selectedEndDate - this.selectedStartDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return Math.max(1, diffDays);
        }
        return 1; // Default to 1 if dates are not set
    }

    getTotalPeople() {
        return this.getAdults() + this.getChildren();
    }

    getSelectedTourType() {
        return CONFIG.tourTypes.find(type => type.id === this.selectedTourType);
    }
}

// Функция для обновления числовых полей (сохраняем для совместимости с HTML)
function updateNumber(inputId, change) {
    const input = document.getElementById(inputId);
    let value = parseInt(input.value) || 0;
    value = Math.max(inputId === 'adults' ? 1 : 0, value + change);
    input.value = value;
    
    // Запускаем обновление параметров через существующий экземпляр
    if (window.tourType) {
        window.tourType.handleParamChange();
    }
}

// Initialize tour type component
const tourType = new TourType();
window.tourType = tourType;