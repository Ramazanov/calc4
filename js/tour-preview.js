class TourPreview {
    constructor() {
        this.container = document.querySelector('.tour-preview');
        
        EventBus.subscribe('tourUpdate', () => {
            this.updatePreview();
        });
    }
    
    updatePreview() {
        const days = window.tourType.getDays();
        const hasAccommodation = window.accommodation.getSelectedOption() !== 'none';
        const selectedMeals = window.meals.getSelectedMeals();
        const isLuxuryMeals = window.meals.isLuxury();
        const selectedExcursions = window.excursions.getSelectedExcursions();
        const selectedActivities = window.activities.getSelectedActivities();
        const tourType = window.tourType.getTourType();
        const corporateEvents = tourType === 'corporate' ? window.corporateEvents.getSelectedEvents() : [];

        let preview = '';
        let availableExcursions = [...selectedExcursions];
        
        for (let i = 1; i <= days; i++) {
            const dayActivities = [];
            
            // Первый и последний день
            if (i === 1) {
                dayActivities.push('Встреча группы, трансфер в отель');
                if (hasAccommodation) {
                    dayActivities.push('Размещение в отеле');
                }
            } else if (i === days) {
                if (hasAccommodation) {
                    dayActivities.push('Выселение из отеля');
                }
                dayActivities.push('Трансфер в аэропорт, отъезд');
            } else {
                // Проживание
                if (hasAccommodation) {
                    const option = CONFIG.accommodationOptions.find(opt => opt.id === window.accommodation.getSelectedOption());
                    dayActivities.push(`Проживание: ${option.title}`);
                }
            }
            
            // Питание
            if (selectedMeals.length > 0) {
                const mealsText = selectedMeals
                    .map(meal => meal.title)
                    .join(', ');
                dayActivities.push(`Питание: ${mealsText}${isLuxuryMeals ? ' (премиум класс)' : ''}`);
            }
            
            // Экскурсии
            if (availableExcursions.length > 0 && i !== 1 && i !== days) {
                const excursion = availableExcursions.shift();
                dayActivities.push(`Экскурсия: ${excursion.name} (${excursion.duration})`);
                
                // Добавляем связанные активности
                selectedActivities.forEach(activity => {
                    if (activity.recommendedFor && activity.recommendedFor.includes(excursion.id)) {
                        dayActivities.push(`Активность: ${activity.name}`);
                    }
                });
            }

            // Корпоративные мероприятия
            if (corporateEvents.length > 0 && i !== 1 && i !== days && !dayActivities.some(act => act.startsWith('Экскурсия'))) {
                const event = corporateEvents[0];
                dayActivities.push(`Корпоративное мероприятие: ${event.title}`);
                corporateEvents.shift();
            }
            
            preview += `
                <div class="day-item">
                    <div class="day-title">День ${i}</div>
                    <div class="day-activities">
                        ${dayActivities.map(activity => `• ${activity}`).join('<br>')}
                    </div>
                </div>
            `;
        }
        
        this.container.innerHTML = preview;
    }
}

// Initialize tour preview
const tourPreview = new TourPreview();
window.tourPreview = tourPreview;