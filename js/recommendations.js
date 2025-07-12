class Recommendations {
    constructor() {
        this.container = document.querySelector('.recommendations-section');
        this.contentContainer = this.container ? this.container.querySelector('.recommendations-content') : null;
        
        if (this.container && this.contentContainer) {
            EventBus.subscribe('tourUpdate', () => {
                this.updateRecommendations();
            });
        }
    }
    
    updateRecommendations() {
        if (!this.container || !this.contentContainer) return;

        const recommendations = this.generateRecommendations();
        
        if (recommendations.length > 0) {
            this.container.style.display = 'block';
            this.showRecommendations(recommendations);
        } else {
            this.container.style.display = 'none';
        }
    }
    
    generateRecommendations() {
        const recommendations = [];
        const selectedExcursions = excursions ? excursions.getSelectedExcursions() : [];
        const days = tourType.getDays();
        
        // Проверяем проживание
        if (accommodation && accommodation.getSelectedOption() === 'none' && days > 2) {
            recommendations.push({
                type: 'accommodation',
                title: 'Добавьте проживание',
                description: 'Рекомендуем добавить проживание для многодневного тура'
            });
        }
        
        // Проверяем питание
        if (meals && meals.getSelectedOption() === 'none') {
            recommendations.push({
                type: 'meals',
                title: 'Добавьте питание',
                description: 'Рекомендуем как минимум включить завтраки'
            });
        }
        
        // Рекомендации по экскурсиям
        if (excursions && selectedExcursions.length < days) {
            recommendations.push({
                type: 'excursions',
                title: 'Добавьте экскурсии',
                description: 'У вас есть свободные дни без экскурсий'
            });
        }

        return recommendations;
    }
    
    showRecommendations(recommendations) {
        this.contentContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-info">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-description">${rec.description}</div>
                </div>
                <button class="recommendation-action" data-type="${rec.type}">
                    Добавить
                </button>
            </div>
        `).join('');

        // Добавляем обработчики для кнопок
        this.contentContainer.querySelectorAll('.recommendation-action').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleRecommendationAction(e.target.dataset.type);
            });
        });
    }
    
    handleRecommendationAction(type) {
        const section = document.querySelector(`[data-section="${type}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize recommendations component
const recommendations = new Recommendations();
window.recommendations = recommendations;