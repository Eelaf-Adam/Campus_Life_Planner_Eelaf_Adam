document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskSearchInput = document.getElementById('task-search');

    // Columns
    const todayColumn = document.getElementById('today-tasks');
    const upcomingColumn = document.getElementById('upcoming-tasks');
    const completedColumn = document.getElementById('completed-tasks');

    // Counts
    const todayCount = document.querySelector('#tasks-today .count');
    const upcomingCount = document.querySelector('#tasks-upcoming .count');
    const completedCount = document.querySelector('#tasks-completed .count');

    // Initialize
    renderTasks();
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
        document.getElementById('add-task-btn').textContent = 'Add Task';
    }

    // Generate unique ID
    function generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Added getTasksByStatus function to categorize tasks by dueDate and status
    appState.getTasksByStatus = function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day
        const todayTasks = [];
        const upcomingTasks = [];
        const completedTasks = [];

        this.tasks.forEach(task => {
            const due = new Date(task.dueDate);
            due.setHours(0, 0, 0, 0); // normalize for comparison

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

    // Validation functions
    function validateTaskInput() {
        const title = document.getElementById('task-name').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const tag = document.getElementById('task-category').value.trim() || 'General';
        const duration = document.getElementById('task-duration')?.value || '60';

        let errors = [];

        // Title validation
        if (!title) {
            errors.push('Task name is required');
        } else if (!patterns.title.test(title)) {
            errors.push('Title cannot have leading/trailing spaces');
        } else if (hasDuplicateWords(title)) {
            errors.push('Title contains duplicate words');
        }

        // Date validation
        if (!dueDate) {
            errors.push('Due date is required');
        } else if (!patterns.date.test(dueDate)) {
            errors.push('Date must be in YYYY-MM-DD format');
        }

        // Tag validation
        if (tag && !patterns.tag.test(tag)) {
            errors.push('Category can only contain letters, spaces, and hyphens');
        }

        // Duration validation
        if (duration && !patterns.duration.test(duration)) {
            errors.push('Duration must be a valid number');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Create task card
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

    // Render all tasks
    function renderTasks() {
        // Clear columns
        [todayColumn, upcomingColumn, completedColumn].forEach(column => {
            column.innerHTML = '';
        });

        const tasksByStatus = appState.getTasksByStatus();

        // Render today's tasks
        tasksByStatus.today.forEach(task => {
            const card = createTaskCard(task);
            todayColumn.appendChild(card);
        });

        // Render upcoming tasks
        tasksByStatus.upcoming.forEach(task => {
            const card = createTaskCard(task);
            upcomingColumn.appendChild(card);
        });

        // Render completed tasks
        tasksByStatus.completed.forEach(task => {
            const card = createTaskCard(task);
            completedColumn.appendChild(card);
        });

        updateCounts();
    }

    function updateCounts() {
        const tasksByStatus = appState.getTasksByStatus();
        todayCount.textContent = tasksByStatus.today.length;
        upcomingCount.textContent = tasksByStatus.upcoming.length;
        completedCount.textContent = tasksByStatus.completed.length;
    }

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

    // Event Listeners
    addTaskBtn.addEventListener('click', () => {
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
        }

        renderTasks();
        closeModal('task-modal');
    });

    // Search functionality with regex
    taskSearchInput.addEventListener('input', () => {
        const searchPattern = taskSearchInput.value;

        if (searchPattern === '') {
            renderTasks();
            clearSearchHighlights();
            return;
        }

        searchTasks(searchPattern);
    });

    // Global functions for task actions
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

    window.deleteTask = function(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            appState.deleteTask(id);
            renderTasks();
        }
    };

    // Auto-refresh every minute to update today/upcoming/completed status
    setInterval(() => {
        renderTasks();
    }, 60000);
});
