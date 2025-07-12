class Activities {
    constructor() {
        this.container = document.querySelector('.activities-container');
        this.selectedActivities = new Set();
        
        this.initializeActivities();
    }
    
    initializeActivities() {
        this.container.innerHTML = '';
        
        CONFIG.activities.forEach(activity => {
            const card = this.createActivityCard(activity);
            this.container.appendChild(card);
        });
        
        this.initializeEventListeners();
    }
    
    createActivityCard(activity) {
        const card = createElement('label', 'activity-card');
        
        card.innerHTML = `
            <input type="checkbox" class="activity-checkbox" value="${activity.id}">
            <div class="activity-content">
                <div class="activity-header">
                    <div class="activity-name">${activity.name}</div>
                    ${activity.minAge ? `<div class="activity-age">Возраст: ${activity.minAge}+</div>` : ''}
                </div>
            </div>
        `;
        
        return card;
    }
    
    initializeEventListeners() {
        const checkboxes = this.container.querySelectorAll('.activity-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleActivityChange(e);
            });
        });
    }
    
    handleActivityChange(e) {
        const card = e.target.closest('.activity-card');
        const activityId = e.target.value;
        const activity = CONFIG.activities.find(a => a.id === activityId);
        
        if (e.target.checked) {
            // Проверка возрастных ограничений
            if (activity.minAge && window.tourType.getChildren() > 0) {
                if (!confirm(`Это активность имеет возрастное ограничение ${activity.minAge}+. Вы уверены, что хотите её добавить?`)) {
                    e.preventDefault();
                    e.target.checked = false;
                    return;
                }
            }
            this.selectedActivities.add(activityId);
            card.classList.add('selected');
        } else {
            this.selectedActivities.delete(activityId);
            card.classList.remove('selected');
        }
        
        EventBus.dispatch('tourUpdate', {});
    }

    hasSelectedActivities() {
        return this.selectedActivities.size > 0;
    }

    hasActivity(activityId) {
        return this.selectedActivities.has(activityId);
    }

    getSelectedActivities() {
        return Array.from(this.selectedActivities)
            .map(id => CONFIG.activities.find(a => a.id === id))
            .filter(Boolean);
    }
}

// Initialize activities component
const activities = new Activities();
window.activities = activities;