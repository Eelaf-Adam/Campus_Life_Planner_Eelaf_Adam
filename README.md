# CampusLife Planner

A comprehensive web application for students to manage their academic tasks and campus events efficiently.

## Features

### Dashboard
- Overview of active tasks and events
- Visual statistics and trends
- Weekly duration tracking with cap/target monitoring
- Last 7-day activity chart
- Quick access to task and event creation

### Task Management
- Create, edit, and delete tasks
- Set task duration and deadlines
- Categorize tasks with tags
- Filter and search functionality
- Kanban board visualization

### Event Management
- Schedule and manage campus events
- Set event duration and location
- Event categorization
- Search and filter capabilities
- Calendar view integration

### Settings & Preferences
- Duration unit preference (minutes/hours)
- Weekly cap/target duration setting
- Theme customization (light/dark mode)
- Data management (import/export JSON)
- System reset and defaults

## Technologies Used
- HTML5
- CSS3 (Flexbox & Grid)
- JavaScript (ES6+)
- Local Storage for data persistence
- Lucide Icons
- Chart.js for statistics

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CampusLife.git
```

2. Open the project in your preferred code editor

3. Launch the application:
- Open `index.html` in a modern web browser
- Or use a local development server

## Project Structure
```
CampusLife/
├── assets/
│   └── Logo2.png
├── styles/
│   ├── main.css
│   ├── dashboard.css
│   ├── tasks.css
│   ├── events.css
│   └── settings.css
├── scripts/
│   ├── state.js
│   ├── dashboard.js
│   ├── tasks.js
│   ├── events.js
│   ├── settings.js
│   ├── search.js
│   └── validators.js
└── *.html
```

## Features Implementation

### Data Storage
- Uses localStorage for persistent data storage
- JSON format for data structure
- Import/export functionality for data backup

### Validation
- Input validation for all forms
- Duration and date format validation
- Duplicate entry prevention

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast theme support

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Author
- **Name**: Eelaf Adam
- **Email**: e.adam@alustudent.com
- **GitHub**: [Eelaf-Adam](https://github.com/Eelaf-Adam)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- African Leadership University
- Frontend Web Development Course
- Lucide Icons Team