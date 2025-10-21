// Compile user input into a regex
function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch (error) {
        console.error('Invalid regex pattern:', error);
        return null;
    }
}

// Highlight matches in text
function highlightMatches(text, regex) {
    if (!regex) return text;
    return text.replace(regex, match => `<mark>${match}</mark>`);
}

// Search tasks with regex
function searchTasks(searchPattern) {
    if (!searchPattern) return;
    
    const regex = compileRegex(searchPattern);
    if (!regex) return;
    
    const todayColumn = document.getElementById('today-tasks');
    const upcomingColumn = document.getElementById('upcoming-tasks');
    const completedColumn = document.getElementById('completed-tasks');
    
    // Loops through all colums and cards
    [todayColumn, upcomingColumn, completedColumn].forEach(column => {
        if (!column) return;
        
        Array.from(column.children).forEach(card => {
            const title = card.querySelector('.task-header h4')?.textContent || '';
            const tag = card.querySelector('.task-category')?.textContent || '';
            
            if (regex.test(title) || regex.test(tag)) {
                card.style.display = '';
                highlightCardMatches(card, regex);
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Search events with regex
function searchEvents(searchPattern) {
    if (!searchPattern) return;
    
    const regex = compileRegex(searchPattern);
    if (!regex) return;
    
    const todayEvents = document.getElementById('today-events');
    const upcomingEvents = document.getElementById('upcoming-events');
    const completedEvents = document.getElementById('completed-events');
    
    [todayEvents, upcomingEvents, completedEvents].forEach(column => {
        if (!column) return;
        
        Array.from(column.children).forEach(card => {
            const title = card.querySelector('.event-header h4')?.textContent || '';
            const tag = card.querySelector('.event-category')?.textContent || '';
            
            if (regex.test(title) || regex.test(tag)) {
                card.style.display = '';
                highlightCardMatches(card, regex);
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Highlight matches in a card
function highlightCardMatches(card, regex) {
    const title = card.querySelector('.task-header h4, .event-header h4');
    const tag = card.querySelector('.task-category, .event-category');
    
    [title, tag].forEach(element => {
        if (element) {
            const text = element.textContent;
            const highlighted = highlightMatches(text, regex);
            element.innerHTML = highlighted;
        }
    });
}

// Clear search highlights
function clearSearchHighlights() {
    const marks = document.querySelectorAll('mark');
    marks.forEach(mark => {
        mark.outerHTML = mark.innerHTML;
    });
}


