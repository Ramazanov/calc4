class TourType {
    constructor() {
        this.tourTypeBtns = document.querySelectorAll('.tour-type-btn');
        this.adultsCount = document.getElementById('adults-count');
        this.childrenCount = document.getElementById('children-count');
        this.daysCount = document.getElementById('days-count');
        
        this.initializeEventListeners();
        
        // Вызываем обработку начального состояния
        const activeBtn = document.querySelector('.tour-type-btn.active');
        if (activeBtn) {
            this.handleTourTypeChange(activeBtn, false);
        }
    }
    
    initializeEventListeners() {
        this.tourTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleTourTypeChange(btn, true));
        });
        
        this.adultsCount.addEventListener('change', () => this.handleParamChange());
        this.childrenCount.addEventListener('change', () => this.handleParamChange());
        this.daysCount.addEventListener('change', () => this.handleParamChange());
    }
    
    handleTourTypeChange(selectedBtn, dispatchEvent = true) {
        this.tourTypeBtns.forEach(btn => btn.classList.remove('active'));
        selectedBtn.classList.add('active');
        
        const type = selectedBtn.dataset.type;
        const corporateSection = document.querySelector('.corporate-events-section');
        
        if (type === 'corporate') {
            corporateSection.style.display = 'block';
        } else {
            corporateSection.style.display = 'none';
        }
        
        if (dispatchEvent) {
            EventBus.dispatch('tourTypeChange', type);
        }
    }
    
    handleParamChange() {
        EventBus.dispatch('paramsUpdate', {
            days: this.getDays(),
            adults: this.getAdults(),
            children: this.getChildren()
        });
    }
    
    getAdults() {
        return parseInt(this.adultsCount.value) || 1;
    }
    
    getChildren() {
        return parseInt(this.childrenCount.value) || 0;
    }
    
    getDays() {
        return parseInt(this.daysCount.value) || 1;
    }
    
    getTotalPeople() {
        return this.getAdults() + this.getChildren();
    }
    
    getTourType() {
        const activeBtn = document.querySelector('.tour-type-btn.active');
        return activeBtn ? activeBtn.dataset.type : 'individual';
    }
}

// Initialize tour type component
const tourType = new TourType();
window.tourType = tourType;