document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const eventModal = document.getElementById('event-modal');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventSearchInput = document.getElementById('event-search');
    
    // Column elements
    const todayEvents = document.getElementById('today-events');
    const upcomingEvents = document.getElementById('upcoming-events');
    const completedEvents = document.getElementById('completed-events');
    
    // Counts
    const todayCount = document.querySelector('#events-today .count');
    const upcomingCount = document.querySelector('#events-upcoming .count');
    const completedCount = document.querySelector('#events-completed .count');
    
    // Initialize
    renderEvents();
    updateCounts();
    
    // Utility functions
    window.openModal = function(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    window.closeModal = function(id) {
        document.getElementById(id).classList.add('hidden');
        document.body.style.overflow = 'auto';
        clearModalFields();
        appState.clearEditing();
        document.getElementById('add-event-btn').textContent = 'Add Event';
    }
    
    // Generate unique ID
    function generateId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Validation functions
    function validateEventInput() {
        const title = document.getElementById('event-name').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const tag = document.getElementById('event-category').value.trim() || 'General';
        
        let errors = [];
        
        // Title validation
        if (!title) {
            errors.push('Event name is required');
        } else if (!patterns.title.test(title)) {
            errors.push('Title cannot have leading/trailing spaces');
        } else if (hasDuplicateWords(title)) {
            errors.push('Title contains duplicate words');
        }
        
        // Date validation
        if (!date) {
            errors.push('Event date is required');
        } else if (!patterns.date.test(date)) {
            errors.push('Date must be in YYYY-MM-DD format');
        }
        
        // Time validation
        if (!time) {
            errors.push('Event time is required');
        } else if (!patterns.time.test(time)) {
            errors.push('Time must be in HH:MM format');
        }
        
        // Tag validation
        if (tag && !patterns.tag.test(tag)) {
            errors.push('Category can only contain letters, spaces, and hyphens');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // Create event card
    function createEventCard(event) {
        const card = document.createElement('div');
        card.classList.add('event-card');
        card.setAttribute('data-id', event.id);
        
        const eventDate = new Date(`${event.date}T${event.time}`);
        const timeRemaining = calculateTimeRemaining(event.date, event.time);
        
        card.innerHTML = `
            <div class="event-header">
                <h4>${event.title}</h4>
                <span class="event-status">${getEventStatus(eventDate)}</span>
            </div>
            <div class="event-meta">
                <div class="event-data">
                    <div class="time-remaining">${timeRemaining}</div>
                    <div class="event-date">${formatDateTime(eventDate)}</div>
                </div>
                <div class="event-data">
                    <span class="event-category">${event.tag}</span>
                </div>
            </div>
            <div class="event-actions">
                <button onclick="editEvent('${event.id}')" class="edit-btn">Edit</button>
                <button onclick="deleteEvent('${event.id}')" class="delete-btn">Delete</button>
            </div>
        `;
        
        return card;
    }
    
    function calculateTimeRemaining(date, time) {
        const eventDate = new Date(`${date}T${time}`);
        const now = new Date();
        const diff = eventDate - now;
        
        if (diff < 0) return 'Event has passed';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m remaining`;
    }
    
    function formatDateTime(date) {
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    
    function getEventStatus(eventDate) {
        const now = new Date();
        if (eventDate < now) return 'Completed';
        if (eventDate.toDateString() === now.toDateString()) return 'Today';
        return 'Upcoming';
    }
    
    // Render all events
    function renderEvents() {
        // Clear columns
        [todayEvents, upcomingEvents, completedEvents].forEach(column => {
            column.innerHTML = '';
        });
        
        const eventsByStatus = appState.getEventsByStatus();
        
        // Render today's events
        eventsByStatus.today.forEach(event => {
            const card = createEventCard(event);
            todayEvents.appendChild(card);
        });
        
        // Render upcoming events
        eventsByStatus.upcoming.forEach(event => {
            const card = createEventCard(event);
            upcomingEvents.appendChild(card);
        });
        
        // Render completed events
        eventsByStatus.completed.forEach(event => {
            const card = createEventCard(event);
            completedEvents.appendChild(card);
        });
        
        updateCounts();
    }
    
    function updateCounts() {
        const eventsByStatus = appState.getEventsByStatus();
        todayCount.textContent = eventsByStatus.today.length;
        upcomingCount.textContent = eventsByStatus.upcoming.length;
        completedCount.textContent = eventsByStatus.completed.length;
    }
    
    function clearModalFields() {
        document.getElementById('event-name').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-time').value = '';
        document.getElementById('event-category').value = '';
    }
    
    function populateModal(event) {
        document.getElementById('event-name').value = event.title;
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-time').value = event.time;
        document.getElementById('event-category').value = event.tag;
    }
    
    // Event Listeners
    addEventBtn.addEventListener('click', () => {
        const validation = validateEventInput();
        
        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }
        
        const title = document.getElementById('event-name').value.trim();
        const description = document.getElementById('event-description').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const tag = document.getElementById('event-category').value.trim() || 'General';
        
        if (appState.isEditing && appState.currentEditingId) {
            // Update existing event
            const existingEvent = appState.events.find(e => e.id === appState.currentEditingId);
            if (existingEvent) {
                const updatedEvent = {
                    ...existingEvent,
                    title,
                    description,
                    date,
                    time,
                    tag,
                    updatedAt: new Date().toISOString()
                };
                appState.updateEvent(updatedEvent);
            }
        } else {
            // Add new event
            const event = {
                id: generateId(),
                type: 'event',
                title,
                description,
                date,
                time,
                tag,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            appState.addEvent(event);
        }
        
        renderEvents();
        closeModal('event-modal');
    });
    
    // Search functionality with regex
    eventSearchInput.addEventListener('input', () => {
        const searchPattern = eventSearchInput.value;
        
        if (searchPattern === '') {
            renderEvents();
            clearSearchHighlights();
            return;
        }
        
        searchEvents(searchPattern);
    });
    
    // Global functions for event actions
    window.editEvent = function(id) {
        const event = appState.events.find(e => e.id === id);
        if (!event) {
            alert('Event not found!');
            return;
        }
        
        populateModal(event);
        appState.setEditing(id, true);
        document.getElementById('add-event-btn').textContent = 'Update Event';
        openModal('event-modal');
    };
    
    window.deleteEvent = function(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            appState.deleteEvent(id);
            renderEvents();
        }
    };
    
    // Auto-refresh every minute to update today/upcoming/completed status
    setInterval(() => {
        renderEvents();
    }, 60000);
});