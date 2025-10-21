// Manage all task data 
const appState = {
    // Load existing tasks or start with empty array
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
    isEditing: false,
    currentEditingId: null,

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
    },

    updateTask(updatedTask) {
        this.tasks = this.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        this.saveTasks();
    },

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
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

// Placeholder functions for search and clearing higlights 
function searchTasks(pattern) { console.log(`Searching for: ${pattern}`); }
function clearSearchHighlights() {}

// Main DOM Content Loaded Logic. Grap key DOM elements for modal, buttons, search, and columns
document.addEventListener('DOMContentLoaded', () => {

    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskSearchInput = document.getElementById('task-search');

    const todayColumn = document.getElementById('today-tasks');
    const upcomingColumn = document.getElementById('upcoming-tasks');
    const completedColumn = document.getElementById('completed-tasks');

    const todayCount = document.querySelector('#tasks-today .count');
    const upcomingCount = document.querySelector('#tasks-upcoming .count');
    const completedCount = document.querySelector('#tasks-completed .count');

    // Open modal and freex page scrolling 
    window.openModal = function(id) {
        document.getElementById(id).classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close modal , reset fields, and clear editing state
    window.closeModal = function(id) {
        document.getElementById(id).classList.add('hidden');
        document.body.style.overflow = 'auto';
        clearModalFields();
        appState.clearEditing();
        document.getElementById('add-task-btn').textContent = 'Add Task';
    }

    // Generate unique ID for new tasks
    function generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Categorize tasks into today, upcoming, and completed
    appState.getTasksByStatus = function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day
        const todayTasks = [];
        const upcomingTasks = [];
        const completedTasks = [];

        this.tasks.forEach(task => {
            const due = new Date(task.dueDate);
            due.setHours(0, 0, 0, 0); 

            if (task.status.toLowerCase() === 'done') {
                completedTasks.push(task);
            } else if (due.getTime() === today.getTime()) {
                todayTasks.push(task);
            } else if (due.getTime() > today.getTime()) {
                upcomingTasks.push(task);
            }
        });

        return {
            today: todayTasks,
            upcoming: upcomingTasks,
            completed: completedTasks
        };
    };

    // Validation task input fields 
    function validateTaskInput() {
        const title = document.getElementById('task-name').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const tag = document.getElementById('task-category').value.trim() || 'General';
        const duration = document.getElementById('task-duration')?.value || '60';

        let errors = [];

        if (typeof validateField === 'function') {
            const titleValidation = validateField('title', title);
            const dateValidation = validateField('date', dueDate);
            const categoryValidation = validateField('category', tag);
            const durationValidation = validateField('duration', duration);

            if (!titleValidation.valid) errors.push(titleValidation.message);
            if (!dateValidation.valid) errors.push(dateValidation.message);
            if (!categoryValidation.valid) errors.push(categoryValidation.message);
            if (!durationValidation.valid) errors.push(durationValidation.message);

            if (typeof hasDuplicateWords === 'function' && hasDuplicateWords(title)) {
                errors.push('Title contains duplicate words');
            }
        } else {
            if (!title) errors.push('Task name is required');
            if (!dueDate) errors.push('Due date is required');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Create html card element for a task
    function createTaskCard(task) {
        const card = document.createElement('div');
        card.classList.add('task-card');
        card.setAttribute('data-id', task.id);

        const dueDate = new Date(task.dueDate);
        const statusClass = task.status.toLowerCase().replace(' ', '-');
        const priorityClass = task.priority.toLowerCase();

        card.innerHTML = `
            <div class="task-header">
                <h4>${task.title}</h4>
                <span class="status-badge status-${statusClass}">${task.status}</span>
            </div>
            <div class="task-meta">
                <div class="task-data">
                    <span>Due: ${dueDate.toLocaleDateString()}</span>
                    <span>Duration: ${task.duration}min</span>
                </div>
                <div class="task-data">
                    <span class="task-category">${task.tag}</span>
                    <span class="priority-badge priority-${priorityClass}">${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button onclick="editTask('${task.id}')" class="edit-btn">Edit</button>
                <button onclick="deleteTask('${task.id}')" class="delete-btn">Delete</button>
            </div>
        `;

        return card;
    }

    // Render tasks 
    function renderTasks() {
        [todayColumn, upcomingColumn, completedColumn].forEach(column => {
            if (column) column.innerHTML = '';
        });

        const tasksByStatus = appState.getTasksByStatus();

        tasksByStatus.today.forEach(task => {
            const card = createTaskCard(task);
            if (todayColumn) todayColumn.appendChild(card);
        });

        tasksByStatus.upcoming.forEach(task => {
            const card = createTaskCard(task);
            if (upcomingColumn) upcomingColumn.appendChild(card);
        });

        tasksByStatus.completed.forEach(task => {
            const card = createTaskCard(task);
            if (completedColumn) completedColumn.appendChild(card);
        });

        updateCounts();
    }

    // Update task counts
    function updateCounts() {
        const tasksByStatus = appState.getTasksByStatus();
        if (todayCount) todayCount.textContent = tasksByStatus.today.length;
        if (upcomingCount) upcomingCount.textContent = tasksByStatus.upcoming.length;
        if (completedCount) completedCount.textContent = tasksByStatus.completed.length;
    }

    // Clear modal input fields
    function clearModalFields() {
        document.getElementById('task-name').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-category').value = '';
        document.getElementById('task-status').value = 'todo';
        document.getElementById('task-priority').value = 'low';
        if (document.getElementById('task-duration')) {
            document.getElementById('task-duration').value = '60';
        }
    }

    // Populate modal fields with task data for editing
    function populateModal(task) {
        document.getElementById('task-name').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-category').value = task.tag;
        document.getElementById('task-status').value = task.status.toLowerCase();
        document.getElementById('task-priority').value = task.priority.toLowerCase();
        if (document.getElementById('task-duration')) {
            document.getElementById('task-duration').value = task.duration || '60';
        }
    }

    // Add and update task button logic
    addTaskBtn.addEventListener('click', () => {
        console.log('Add Task clicked'); // Debug

        const validation = validateTaskInput();

        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }

        const title = document.getElementById('task-name').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const tag = document.getElementById('task-category').value.trim() || 'General';
        const status = document.getElementById('task-status').value;
        const priority = document.getElementById('task-priority').value;
        const duration = document.getElementById('task-duration')?.value || '60';

        if (appState.isEditing && appState.currentEditingId) {
            // Update existing task
            const existingTask = appState.tasks.find(t => t.id === appState.currentEditingId);
            if (existingTask) {
                const updatedTask = {
                    ...existingTask,
                    title,
                    description,
                    dueDate,
                    tag,
                    status: status.charAt(0).toUpperCase() + status.slice(1),
                    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
                    duration: parseInt(duration),
                    updatedAt: new Date().toISOString()
                };
                appState.updateTask(updatedTask);
                console.log('Task updated:', updatedTask); // Debug
            }
        } else {
            // Add new task
            const task = {
                id: generateId(),
                type: 'task',
                title,
                description,
                dueDate,
                tag,
                status: status.charAt(0).toUpperCase() + status.slice(1),
                priority: priority.charAt(0).toUpperCase() + priority.slice(1),
                duration: parseInt(duration),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            appState.addTask(task);
            console.log('Task added:', task); // Debug
        }

        renderTasks();
        closeModal('task-modal');
    });

    // Search input listener
    taskSearchInput.addEventListener('input', () => {
        const searchPattern = taskSearchInput.value;

        if (searchPattern === '') {
            renderTasks();
            clearSearchHighlights();
            return;
        }

        searchTasks(searchPattern);
    });

    // Edit task by ID
    window.editTask = function(id) {
        const task = appState.tasks.find(t => t.id === id);
        if (!task) {
            alert('Task not found!');
            return;
        }

        populateModal(task);
        appState.setEditing(id, true);
        document.getElementById('add-task-btn').textContent = 'Update Task';
        openModal('task-modal');
    };

    // Delete task by ID
    window.deleteTask = function(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            appState.deleteTask(id);
            renderTasks();
        }
    };

    setInterval(() => {
        renderTasks();
    }, 60000);


    // Apply dark theme based on saved theme
  (function() {
    const theme = localStorage.getItem('theme');
    if(theme && theme.includes('dark')){
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
  
});
