// Manage all event data 
const appState = {
    // Load existing events from localStorage 
    events: JSON.parse(localStorage.getItem('events') || '[]'),
    isEditing: false,
    currentEditingId: null,

    // Save current events array to localStorage
    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    },

    addEvent(event) {
        console.log("aDDING")
        this.events.push(event);
        this.saveEvents();
    },

    updateEvent(updatedEvent) {
        this.events = this.events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
        this.saveEvents();
    },

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
    },


    // Filters all events into Today, upcoming, and completed 
    getEventsByStatus() {
        const events = {
            today: [],
            upcoming: [],
            completed: []
        };

        this.events.forEach(event => {
            const status = getEventStatus(new Date(`${event.date}T${event.time}`));
            if (status === 'Today') {
                events.today.push(event);
            } else if (status === 'Upcoming') {
                events.upcoming.push(event);
            } else {
                events.completed.push(event);
            }
        });

        // Sort Upcoming and Today events chronologically
        const sortByDate = (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
        events.upcoming.sort(sortByDate);
        events.today.sort(sortByDate);

        return events;
    },

    setEditing(id, isEditing) {
        this.currentEditingId = id;
        this.isEditing = isEditing;
    },

    clearEditing() {
        this.currentEditingId = null;
        this.isEditing = false;
    }
};

// Mock search functions 
function searchEvents(pattern) { console.log(`Searching for: ${pattern}`); }
function clearSearchHighlights() {}


// Calculates remaining time untill an event 
function calculateTimeRemaining(date, time) {
    const eventDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = eventDate - now;

    if (diff < 0) return 'Event has passed'; 

    let totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds -= days * 3600 * 24;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`); 
    parts.push(`${minutes}m`); 

    return `${parts.join(' ')} remaining`;
}


// Formats event date and time for display
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
    });
}


// Determine event status into today, upcoming, or completed 
function getEventStatus(eventDate) {
    const now = new Date();

    if (eventDate < now) return 'Completed';

    const eventDay = eventDate.toDateString();
    const today = now.toDateString();

    if (eventDay === today) return 'Today';

    return 'Upcoming';
}


// Main DOM content loaded logic
document.addEventListener('DOMContentLoaded', () => {

    const eventModal = document.getElementById('event-modal');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventSearchInput = document.getElementById('event-search');

    const todayEvents = document.getElementById('today-events');
    const upcomingEvents = document.getElementById('upcoming-events');
    const completedEvents = document.getElementById('completed-events');

    const todayCount = document.querySelector('#events-today .count') || document.querySelector('.event-column:nth-child(1) .count');
    const upcomingCount = document.querySelector('#events-upcoming .count') || document.querySelector('.event-column:nth-child(2) .count');
    const completedCount = document.querySelector('#events-completed .count') || document.querySelector('.event-column:nth-child(3) .count');

    // Initialize rendering and counts
    renderEvents();
    updateCounts();

    // Modal helper function
    window.openModal = function(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function validateTaskInput() {
        const title = document.getElementById('event-name').value.trim();

        let errors = [];

        if (typeof validateField === 'function') {
            const titleValidation = validateField('title', title);

            if (!titleValidation.valid) errors.push(titleValidation.message);

            if (typeof hasDuplicateWords === 'function' && hasDuplicateWords(title)) {
                errors.push('Title contains duplicate words');
            }
        } else {
            if (!title) errors.push('Task name is required');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    window.closeModal = function(id) {
        document.getElementById(id).classList.add('hidden');
        document.body.style.overflow = 'auto';
        clearModalFields();
        appState.clearEditing();
        document.getElementById('add-event-btn').textContent = 'Add Event';
    }

    function generateId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Event card creation
    function createEventCard(event) {
        const card = document.createElement('div');
        card.classList.add('event-card');
        card.setAttribute('data-id', event.id);

        const eventDate = new Date(`${event.date}T${event.time}`);
        const timeRemainingText = calculateTimeRemaining(event.date, event.time);
        const status = getEventStatus(eventDate);
        const formattedDate = formatDateTime(eventDate);

        card.innerHTML = `
            <div class="event-header">
                <h4>${event.title}</h4>
                <span class="event-status status-${status.toLowerCase()}">${status}</span>
            </div>
            <div class="event-meta">
                <div class="event-data">
                    <div class="time-remaining">${timeRemainingText}</div>
                    <div class="event-date">${formattedDate}</div>
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

    // Rendering events
    function renderEvents() {
        [todayEvents, upcomingEvents, completedEvents].forEach(column => {
            if (column) column.innerHTML = ''; 
        });

        const eventsByStatus = appState.getEventsByStatus();

        eventsByStatus.today.forEach(event => {
            const card = createEventCard(event);
            if (todayEvents) todayEvents.appendChild(card);
        });

        eventsByStatus.upcoming.forEach(event => {
            const card = createEventCard(event);
            if (upcomingEvents) upcomingEvents.appendChild(card);
        });

        eventsByStatus.completed.forEach(event => {
            const card = createEventCard(event);
            if (completedEvents) completedEvents.appendChild(card);
        });

        updateCounts();
    }

    function updateCounts() {
        const eventsByStatus = appState.getEventsByStatus();
        if (todayCount) todayCount.textContent = eventsByStatus.today.length;
        if (upcomingCount) upcomingCount.textContent = eventsByStatus.upcoming.length;
        if (completedCount) completedCount.textContent = eventsByStatus.completed.length;
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

    addEventBtn.addEventListener('click', () => {
        const validation = validateTaskInput();

        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }
        const title = document.getElementById('event-name').value.trim();
        const description = document.getElementById('event-description').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const tag = document.getElementById('event-category').value.trim() || 'General';

        if (!title || !date || !time) {
             alert('Event name, date, and time are required.');
             return;
        }

        if (appState.isEditing && appState.currentEditingId) {
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

    eventSearchInput.addEventListener('input', () => {
        const searchPattern = eventSearchInput.value;

        if (searchPattern === '') {
            renderEvents();
            clearSearchHighlights();
            return;
        }

        searchEvents(searchPattern);
    });

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

    setInterval(() => {
        renderEvents();
    }, 60000);


    // Dark theme
  (function() {
    const theme = localStorage.getItem('theme');
    if(theme && theme.includes('dark')){
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();

});
