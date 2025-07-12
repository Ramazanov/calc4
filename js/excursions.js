class Excursions {
    constructor() {
        this.container = document.querySelector('.excursions-container');
        this.warningElement = document.getElementById('excursions-warning');
        this.counterElement = document.getElementById('selected-excursions');
        this.selectedExcursions = new Set();
        
        this.initializeExcursions();
        
        EventBus.subscribe('paramsUpdate', (params) => {
            this.validateExcursionsCount(params.days);
        });
    }
    
    initializeExcursions() {
        const counter = this.counterElement.parentElement;
        const warning = this.warningElement;
        
        this.container.innerHTML = '';
        this.container.appendChild(counter);
        this.container.appendChild(warning);
        
        CONFIG.excursions.forEach(excursion => {
            const card = this.createExcursionCard(excursion);
            this.container.appendChild(card);
        });
        
        this.initializeEventListeners();
    }
    
createExcursionCard(excursion) {
        const card = createElement('label', 'excursion-card');
        
        // Выбираем 3-4 основные характеристики экскурсии
        const mainFeatures = [
            excursion.duration,
            ...excursion.features.slice(0, 3)
        ];
        
        card.innerHTML = `
            <input type="checkbox" class="excursion-checkbox" value="${excursion.id}">
            <div class="excursion-content">
                <div class="excursion-header">
                    <div class="excursion-name">${excursion.name}</div>
                    <span class="difficulty-tag ${excursion.difficulty}">
                        <i data-lucide="activity"></i>
                        ${excursion.difficulty.charAt(0).toUpperCase() + excursion.difficulty.slice(1)} сложность
                    </span>
                </div>
                
                <div class="excursion-description">
                    ${excursion.description}
                </div>
                
                <div class="excursion-features">
                    ${mainFeatures.map(feature => 
                        `<span class="feature-tag">
                            ${feature}
                        </span>`
                    ).join('')}
                </div>
            </div>
        `;

        // Initialize icons
        lucide.createIcons({
            attrs: {
                class: "excursion-icon",
                width: "16",
                height: "16"
            }
        }, card);
        
        return card;
    }
    
    initializeEventListeners() {
        const checkboxes = this.container.querySelectorAll('.excursion-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleExcursionChange(e);
            });
        });
    }
    
    handleExcursionChange(e) {
        const card = e.target.closest('.excursion-card');
        const days = window.tourType.getDays();
        
        if (e.target.checked) {
            if (this.selectedExcursions.size >= days) {
                e.preventDefault();
                e.target.checked = false;
                this.warningElement.classList.add('visible');
                setTimeout(() => {
                    this.warningElement.classList.remove('visible');
                }, 3000);
                return;
            }
            this.selectedExcursions.add(e.target.value);
            card.classList.add('selected');
        } else {
            this.selectedExcursions.delete(e.target.value);
            card.classList.remove('selected');
        }
        
        this.counterElement.textContent = this.selectedExcursions.size;
        this.warningElement.classList.remove('visible');
        
        EventBus.dispatch('tourUpdate', {});
    }
    
    validateExcursionsCount(days) {
        if (this.selectedExcursions.size > days) {
            const checkboxes = this.container.querySelectorAll('.excursion-checkbox:checked');
            const toUncheck = this.selectedExcursions.size - days;
            
            for (let i = checkboxes.length - 1; i >= checkboxes.length - toUncheck; i--) {
                checkboxes[i].checked = false;
                const card = checkboxes[i].closest('.excursion-card');
                card.classList.remove('selected');
                this.selectedExcursions.delete(checkboxes[i].value);
            }
            
            this.counterElement.textContent = this.selectedExcursions.size;
        }
    }

    getSelectedExcursions() {
        return Array.from(this.selectedExcursions)
            .map(id => CONFIG.excursions.find(e => e.id === id))
            .filter(Boolean);
    }
}

// Initialize excursions component and make it globally available
const excursions = new Excursions();
window.excursions = excursions;