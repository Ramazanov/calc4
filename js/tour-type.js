class TourType {
    constructor() {
 
		
	    this.adultsCount = document.getElementById('adults');
        this.childrenCount = document.getElementById('children');
		
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');

        // Set minimum start date to today
        const today = new Date().toISOString().split('T')[0];
        this.startDateInput.setAttribute('min', today);

        this.initializeEventListeners();
        this.updateEndDateMin(); // Initialize end date min attribute
        this.handleParamChange(); // Trigger initial params update
    }

    initializeEventListeners() {
        this.startDateInput.addEventListener('change', () => {
            this.updateEndDateMin();
            this.handleParamChange();
        });
        this.endDateInput.addEventListener('change', () => this.handleParamChange());
        this.adultsCount.addEventListener('change', () => this.handleParamChange());
        this.childrenCount.addEventListener('change', () => this.handleParamChange());
    }

    updateEndDateMin() {
        const startDate = this.getStartDate();
        if (startDate) {
            this.endDateInput.setAttribute('min', startDate);
        }
    }

    handleParamChange() {
        const days = this.getDays();
        const adults = this.getAdults();
        const children = this.getChildren();
        const startDate = this.getStartDate();
        const endDate = this.getEndDate();

        EventBus.dispatch('paramsUpdate', {
            days,
            adults,
            children,
            startDate,
            endDate
        });
    }

    getStartDate() {
        return this.startDateInput.value || null;
    }

    getEndDate() {
        return this.endDateInput.value || null;
    }

    getAdults() {
        return parseInt(this.adultsCount.value) || 1;
    }

    getChildren() {
        return parseInt(this.childrenCount.value) || 0;
    }

    getDays() {
        const startDate = this.getStartDate();
        const endDate = this.getEndDate();

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = end - start;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
            return Math.max(1, diffDays); // Ensure at least 1 day
        }
        return 1; // Default to 1 if dates are not set
    }

    getTotalPeople() {
        return this.getAdults() + this.getChildren();
    }
}

// Initialize tour type component
const tourType = new TourType();
window.tourType = tourType;

// CSS for mobile-first design
const style = document.createElement('style');
style.textContent = `
    .tour-form {
        max-width: 480px;
        margin: 0 auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .tour-form label {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        display: block;
    }

    .tour-form input {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        min-height: 44px;
    }

    .tour-form input[type="number"] {
        appearance: textfield;
    }

    .tour-form input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    }

    @media (min-width: 768px) {
        .tour-form {
            padding: 24px;
        }
    }
`;
document.head.appendChild(style);