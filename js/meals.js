class Meals {
    constructor() {
        this.container = document.querySelector('.meals-options');
        this.selectedMealPackage = 'breakfast-only'; // Default to "Только завтраки"
        
        this.initializeMealsOptions();
    }
    
    initializeMealsOptions() {
        this.container.innerHTML = '';
        
        // Добавляем радиокнопки для каждого пакета питания
        CONFIG.mealsOptions.forEach(option => {
            const card = this.createMealCard(option);
            this.container.appendChild(card);
        });
        
        // Устанавливаем выбранный по умолчанию вариант
        const defaultRadio = this.container.querySelector('.meal-radio[value="breakfast-only"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
            defaultRadio.closest('.meals-card').classList.add('selected');
        }
        
        this.initializeEventListeners();
    }
    
    createMealCard(option) {
        const card = createElement('label', 'meals-card');
        
        card.innerHTML = `
            <input type="radio" name="meals-package" class="meal-radio" value="${option.id}">
            <span class="meals-title">${option.title}</span>
        `;
        
        return card;
    }
    
    initializeEventListeners() {
        const radios = this.container.querySelectorAll('.meal-radio');
        
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleMealPackageChange(e);
            });
        });
    }
    
    handleMealPackageChange(e) {
        const cards = this.container.querySelectorAll('.meals-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        const selectedCard = e.target.closest('.meals-card');
        selectedCard.classList.add('selected');
        this.selectedMealPackage = e.target.value;
        
        EventBus.dispatch('tourUpdate', {});
    }
    
    getBasePrice() {
        const packageOption = CONFIG.mealsOptions.find(m => m.id === this.selectedMealPackage);
        return packageOption ? packageOption.price : 0;
    }

    getSelectedMeals() {
        const packageOption = CONFIG.mealsOptions.find(m => m.id === this.selectedMealPackage);
        return packageOption ? packageOption.meals : [];
    }
}

// Initialize meals component
const meals = new Meals();
window.meals = meals;