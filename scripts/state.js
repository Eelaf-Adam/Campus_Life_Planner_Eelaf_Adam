// State management for Campus Life Planner
class AppState {
    constructor() {
        this.tasks = [];
        this.events = [];
        this.currentEditingId = null;
        this.isEditing = false;
        this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const allRecords = JSON.parse(localStorage.getItem('campuslife:records') || '[]');
            this.tasks = allRecords.filter(record => record.type === 'task');
            this.events = allRecords.filter(record => record.type === 'event');
            console.log('Loaded tasks:', this.tasks.length, 'Loaded events:', this.events.length);
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.tasks = [];
            this.events = [];
        }
    }

    saveToStorage() {
        try {
            const allRecords = [...this.tasks, ...this.events];
            localStorage.setItem('campuslife:records', JSON.stringify(allRecords));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveToStorage();
    }

    addEvent(event) {
        this.events.push(event);
        this.saveToStorage();
    }

    updateTask(updatedTask) {
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.saveToStorage();
        }
    }

    updateEvent(updatedEvent) {
        const index = this.events.findIndex(event => event.id === updatedEvent.id);
        if (index !== -1) {
            this.events[index] = updatedEvent;
            this.saveToStorage();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToStorage();
    }

    deleteEvent(id) {
        this.events = this.events.filter(event => event.id !== id);
        this.saveToStorage();
    }

    getTasksByStatus() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const result = {
            today: this.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime() && task.status !== 'Completed';
            }),
            upcoming: this.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() > today.getTime() && task.status !== 'Completed';
            }),
            completed: this.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return task.status === 'Completed' || taskDate.getTime() < today.getTime();
            })
        };
        
        console.log('Task status breakdown:', result);
        return result;
    }

    getEventsByStatus() {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return {
            today: this.events.filter(event => {
                const eventDate = new Date(`${event.date}T${event.time}`);
                const eventDateOnly = new Date(event.date);
                eventDateOnly.setHours(0, 0, 0, 0);
                return eventDateOnly.getTime() === today.getTime() && eventDate >= now;
            }),
            upcoming: this.events.filter(event => {
                const eventDate = new Date(`${event.date}T${event.time}`);
                const eventDateOnly = new Date(event.date);
                eventDateOnly.setHours(0, 0, 0, 0);
                return eventDateOnly.getTime() > today.getTime();
            }),
            completed: this.events.filter(event => {
                const eventDate = new Date(`${event.date}T${event.time}`);
                return eventDate < now;
            })
        };
    }

    setEditing(id, isEditing = true) {
        this.currentEditingId = id;
        this.isEditing = isEditing;
    }

    clearEditing() {
        this.currentEditingId = null;
        this.isEditing = false;
    }
}

// Global state instance
window.appState = new AppState();
