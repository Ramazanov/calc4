class Meals {
    constructor() {
        this.container = document.querySelector('.meals-options');
        this.selectedMeals = new Set();
        this.luxuryEnabled = false;
        
        this.initializeMealsOptions();
    }
    
    initializeMealsOptions() {
        this.container.innerHTML = '';
        
        // Добавляем чекбоксы для каждого приема пищи
        CONFIG.mealsOptions.forEach(option => {
            const card = this.createMealCard(option);
            this.container.appendChild(card);
        });
        
        // Добавляем опцию премиального питания
        this.container.appendChild(this.createLuxuryOption());
        
        this.initializeEventListeners();
    }
    
    createMealCard(option) {
        const card = createElement('label', 'meals-card');
        
        card.innerHTML = `
            <input type="checkbox" class="meal-checkbox" value="${option.id}">
            <span class="meals-title">${option.title}</span>
        `;
        
        return card;
    }
    
    createLuxuryOption() {
        const div = createElement('div', 'luxury-meals');
        
        div.innerHTML = `
            <input type="checkbox" id="luxury-meals" class="luxury-meals-checkbox">
            <label for="luxury-meals" class="luxury-meals-label">
                <span class="checkbox-custom"></span>
                <span class="meals-title">Премиальное питание (×2 к стоимости)</span>
            </label>
        `;
        
        return div;
    }
    
    initializeEventListeners() {
        const checkboxes = this.container.querySelectorAll('.meal-checkbox');
        const luxuryCheckbox = this.container.querySelector('.luxury-meals-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleMealChange(e);
            });
        });
        
        luxuryCheckbox.addEventListener('change', (e) => {
            this.handleLuxuryChange(e);
        });
    }
    
    handleMealChange(e) {
        const card = e.target.closest('.meals-card');
        
        if (e.target.checked) {
            this.selectedMeals.add(e.target.value);
            card.classList.add('selected');
        } else {
            this.selectedMeals.delete(e.target.value);
            card.classList.remove('selected');
        }
        
        EventBus.dispatch('tourUpdate', {});
    }
    
    handleLuxuryChange(e) {
        this.luxuryEnabled = e.target.checked;
        EventBus.dispatch('tourUpdate', {});
    }
    
    getBasePrice() {
        let totalPrice = 0;
        this.selectedMeals.forEach(mealId => {
            const meal = CONFIG.mealsOptions.find(m => m.id === mealId);
            if (meal) {
                totalPrice += meal.price;
            }
        });
        return totalPrice;
    }

    isLuxury() {
        return this.luxuryEnabled;
    }

    getSelectedMeals() {
        return Array.from(this.selectedMeals)
            .map(id => CONFIG.mealsOptions.find(m => m.id === id))
            .filter(Boolean);
    }
}

// Initialize meals component
const meals = new Meals();
window.meals = meals;