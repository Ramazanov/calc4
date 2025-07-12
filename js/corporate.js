class CorporateEvents {
    constructor() {
        this.container = document.querySelector('.corporate-events-container');
        this.section = document.querySelector('.corporate-events-section');
        this.selectedEvents = new Set();
        
        this.initializeEvents();
        
        // Subscribe to tour type changes
        EventBus.subscribe('tourTypeChange', (type) => {
            this.section.style.display = type === 'corporate' ? 'block' : 'none';
            if (type !== 'corporate') {
                this.selectedEvents.clear();
                this.container.querySelectorAll('.corporate-event-card').forEach(card => {
                    card.classList.remove('selected');
                    card.querySelector('input[type="checkbox"]').checked = false;
                });
            }
        });
    }
    
    initializeEvents() {
        this.container.innerHTML = '';
        
        CONFIG.corporateEvents.forEach(event => {
            const card = this.createEventCard(event);
            this.container.appendChild(card);
        });
        
        this.initializeEventListeners();
    }
    
    createEventCard(event) {
        const card = createElement('label', 'corporate-event-card');
        
        const features = event.features.map(feature => 
            `<span class="corporate-event-feature">${feature}</span>`
        ).join('');
        
        card.innerHTML = `
            <input type="checkbox" class="corporate-event-checkbox" value="${event.id}" data-price="${event.price}">
            <div class="corporate-event-header">
                <span class="corporate-event-title">${event.title}</span>
                <span class="corporate-event-price">${formatPrice(event.price)}/чел</span>
            </div>
            <div class="corporate-event-description">${event.description}</div>
            <div class="corporate-event-features">${features}</div>
            ${event.minPeople ? 
                `<div class="corporate-event-min-people">Минимум ${event.minPeople} человек</div>` : 
                ''}
        `;
        
        return card;
    }
    
    initializeEventListeners() {
        const checkboxes = this.container.querySelectorAll('.corporate-event-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleEventChange(e);
            });
        });
    }
    
handleEventChange(e) {
        const card = e.target.closest('.corporate-event-card');
        const eventId = e.target.value;
        const event = CONFIG.corporateEvents.find(ev => ev.id === eventId);
        const totalPeople = window.tourType.getAdults() + window.tourType.getChildren();
        
        if (e.target.checked) {
            if (event.minPeople && totalPeople < event.minPeople) {
                e.preventDefault();
                e.target.checked = false;
                alert(`Для этого мероприятия необходимо минимум ${event.minPeople} человек`);
                return;
            }
            this.selectedEvents.add(eventId);
            card.classList.add('selected');
        } else {
            this.selectedEvents.delete(eventId);
            card.classList.remove('selected');
        }
        
        EventBus.dispatch('priceUpdate', {});
    }
    
    getPrice() {
        let total = 0;
        const adults = window.tourType.getAdults();
        const children = window.tourType.getChildren();
        
        this.selectedEvents.forEach(eventId => {
            const event = CONFIG.corporateEvents.find(e => e.id === eventId);
            if (event) {
                // Для корпоративных мероприятий одинаковая цена для взрослых и детей
                total += event.price * (adults + children);
            }
        });
        
        return total;
    }

    getSelectedEvents() {
        return Array.from(this.selectedEvents).map(eventId => 
            CONFIG.corporateEvents.find(e => e.id === eventId)
        ).filter(Boolean);
    }

    hasEvents() {
        return this.selectedEvents.size > 0;
    }
}

// Initialize corporate events component
const corporateEvents = new CorporateEvents();
window.corporateEvents = corporateEvents;