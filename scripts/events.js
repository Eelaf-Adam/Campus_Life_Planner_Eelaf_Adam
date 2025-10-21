// --- Mock Data and External Dependencies (Simplified for event logic) ---
// You will still need to define these for the code to run in your browser environment.
const appState = {
    // Load existing events or start with a sample event for testing
    events: JSON.parse(localStorage.getItem('events') || '[]'),
    isEditing: false,
    currentEditingId: null,

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

    /**
     * CORE LOGIC: Filters all events into Today, Upcoming, and Completed arrays.
     */
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

// Mock search functions (kept for structure)
function searchEvents(pattern) { console.log(`Searching for: ${pattern}`); }
function clearSearchHighlights() {}


// --- UTILITY FUNCTIONS (The main area of focus for event sorting) ---

/**
 * Calculates time remaining and formats it (e.g., '7103h 18m remaining').
 */
function calculateTimeRemaining(date, time) {
    const eventDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diff = eventDate - now;

    if (diff < 0) return 'Event has passed'; // Completed events

    let totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds -= days * 3600 * 24;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Format to match the screenshot style (or similar time duration)
    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`); // Show hours if non-zero or if days are present
    parts.push(`${minutes}m`); // Always show minutes for precision

    return `${parts.join(' ')} remaining`;
}

/**
 * Formats the date to look like the screenshot (e.g., 'Aug 12, 12:09 PM').
 */
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true // Ensure AM/PM format
    });
}

/**
 * FIX: The crucial function to determine the event's column status.
 * This correctly compares dates while ignoring time for "Today".
 */
function getEventStatus(eventDate) {
    const now = new Date();

    // 1. Check for Completed
    if (eventDate < now) return 'Completed';

    // 2. Check for Today (Compare only Year, Month, Day)
    const eventDay = eventDate.toDateString();
    const today = now.toDateString();

    if (eventDay === today) return 'Today';

    // 3. Otherwise, it's Upcoming
    return 'Upcoming';
}


// --- Main DOM Content Loaded Logic ---
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
    // Updated selector to be more robust
    const todayCount = document.querySelector('#events-today .count') || document.querySelector('.event-column:nth-child(1) .count');
    const upcomingCount = document.querySelector('#events-upcoming .count') || document.querySelector('.event-column:nth-child(2) .count');
    const completedCount = document.querySelector('#events-completed .count') || document.querySelector('.event-column:nth-child(3) .count');

    // Initialize
    renderEvents();
    updateCounts();

    // Utility functions
    window.openModal = function(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function validateTaskInput() {
        const title = document.getElementById('event-name').value.trim();

        let errors = [];

        // Check if external validation functions exist
        if (typeof validateField === 'function') {
            // Use external validation file
            const titleValidation = validateField('title', title);

            if (!titleValidation.valid) errors.push(titleValidation.message);

            // Check for duplicate words if function exists
            if (typeof hasDuplicateWords === 'function' && hasDuplicateWords(title)) {
                errors.push('Title contains duplicate words');
            }
        } else {
            // Basic validation if external file not loaded
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

    // Generate unique ID
    function generateId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create event card
    function createEventCard(event) {
        const card = document.createElement('div');
        card.classList.add('event-card');
        card.setAttribute('data-id', event.id);

        const eventDate = new Date(`${event.date}T${event.time}`);
        const timeRemainingText = calculateTimeRemaining(event.date, event.time);
        const status = getEventStatus(eventDate);
        const formattedDate = formatDateTime(eventDate);

        // NOTE: You might need to add CSS classes like .status-upcoming, .status-today etc.
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

    // Render all events
    function renderEvents() {
        // Clear columns
        [todayEvents, upcomingEvents, completedEvents].forEach(column => {
            if (column) column.innerHTML = ''; // Null check
        });

        const eventsByStatus = appState.getEventsByStatus();

        // Render today's events
        eventsByStatus.today.forEach(event => {
            const card = createEventCard(event);
            if (todayEvents) todayEvents.appendChild(card);
        });

        // Render upcoming events
        eventsByStatus.upcoming.forEach(event => {
            const card = createEventCard(event);
            if (upcomingEvents) upcomingEvents.appendChild(card);
        });

        // Render completed events
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

    // Event Listeners for Add/Update
    addEventBtn.addEventListener('click', () => {
        const validation = validateTaskInput();

        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }
        // Since you removed regex, assuming basic validation is handled or unnecessary here
        const title = document.getElementById('event-name').value.trim();
        const description = document.getElementById('event-description').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const tag = document.getElementById('event-category').value.trim() || 'General';

        // Basic check for required fields
        if (!title || !date || !time) {
             alert('Event name, date, and time are required.');
             return;
        }

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

    // Search functionality
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

    // Auto-refresh every minute to update event status
    setInterval(() => {
        renderEvents();
    }, 60000);
});
