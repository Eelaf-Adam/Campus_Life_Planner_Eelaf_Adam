#  🎓  CampusLife Planner - Responsive UI 

CampusLife Planner is a responsive, browser-based task and event management app designed to help students and professionals plan, track, and visualize their daily activities. It provides features like task and event categorization, time tracking, search with highlights, customizable settings, and JSON import/export for data backup. The app is fully client-side and works in modern web browsers. 

## 🔥 Live Demo
 📚 **GitHub Pages:** [Live Website](https://eelaf-adam.github.io/Campus_Life_Planner_Eelaf_Adam/)  
🎥 **Demo Video:** [Watch Project Demo](https://youtu.be/lli8SeZ2clo?si=_-4K02jG4eWsZdJZ)

## 🧠 Overview  
**CampusLife Planner** is a responsive web application designed to help users manage daily tasks, track upcoming events, and stay organized.  
It integrates regex-powered search, visual statistics, and flexible settings to deliver an intuitive, all-in-one digital planner experience.

Built using **HTML5**, **CSS3**, and **Vanilla JavaScript**, the app runs entirely in the browser and saves data locally — no sign-in required.

## ⚙️ Setup Instructions  

### 1. Clone the Repository  
```bash
git clone https://github.com/Eelaf-Adam/Campus_Life_Planner_Eelaf_Adam.git
```

### 2. Navigate into the Project Folder
```bash
cd Campus_Life_Planner_Eelaf_Adam
```
### 3. Open in Browser
You can open `index.html` directly or use the Live Server extension in VS Code for live reloading.

## 💻 Usage Instructions

Dashboard:
View your categorized tasks and events — Today, Upcoming, or Completed.

Add New Record:
Click “Add Task” or “Add Event,” fill in the details, and save.

Search:
Type in the search bar — matches will be highlighted using regex.

Settings:

Toggle Dark/Light mode

Set Weekly caps and Time units

Import or Export JSON data

Reset preferences and local data

Persistence:
All data is stored in your browser’s localStorage for automatic saving and offline access.

## 🧩 Features

| Feature                         | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| 🗓️ **Task & Event Management** | Add, edit, delete, and categorize items easily.        |
| 🔍 **Regex Search Engine**      | Search dynamically using case-insensitive patterns.    |
| 💡 **Smart Highlighting**       | Matches are visually marked with `<mark>` tags.        |
| ⚙️ **Settings Panel**           | Customize theme, time units, and data options.         |
| 📦 **Data Import/Export**       | Backup or transfer data in `.json` format.             |
| 📊 **Dashboard Analytics**      | See your totals, completion rate, and recent activity. |
| 🧭 **Responsive Design**        | Optimized for desktop, tablet, and mobile.             |
| 🔒 **Offline Storage**          | Everything runs locally — private and secure.          |


## 📂 Project Structure

```bash
CampusLife-Planner_Eelaf_Adam/
├── assets/                     # Images, icons, or media files
│
├── scripts/                    # JavaScript logic for different modules
│   ├── dashboard.js            # Dashboard logic and rendering
│   ├── events.js               # Event creation and management
│   ├── tasks.js                # Task creation and management
│   ├── search.js               # Regex-powered search and highlighting
│   ├── storage.js              # LocalStorage data persistence
│   ├── state.js                # App state handling and data synchronization
│   ├── validator.js            # Input validation for tasks/events
│   └── settings.js             # Theme, unit, and data import/export management
│
├── styles/                     # Stylesheets for all pages
│   ├── main.css                # Global styles and theme definitions
│   ├── dashboard.css           # Dashboard page layout
│   ├── tasks.css               # Task management styles
│   ├── events.css              # Event management styles
│   └── settings.css            # Settings page design
│
├── .nojekyll                   # Ensures GitHub Pages serves static files correctly
├── LICENSE                     # Open-source license (MIT)
├── README.md                   # Project documentation
│
├── index.html                  # Landing / overview page
├── dashboard.html              # Main dashboard page
├── tasks.html                  # Task management interface
├── events.html                 # Event management interface
├── settings.html               # Settings and customization page
└── seed.json                   # Sample dataset for testing import/export
```

## Regex Patterns 

| Pattern         | Matches                                    |                                       |
| --------------- | ------------------------------------------ | ------------------------------------- |
| `^Meet`         | Tasks starting with “Meet”                 |                                       |
| `study          | project`                                   | Tasks containing “study” or “project” |
| `[0-9]{2,}`     | Items with two or more digits              |                                       |
| `\b[A-Z][a-z]+` | Capitalized words (like names or subjects) |                                       |

## 🌈 Accessibility Notes

Keyboard Accessible: Every modal, button, and input field can be navigated via keyboard.

ARIA Live Regions: Feedback messages and notifications are announced by screen readers.

Color Contrast: Meets WCAG AA contrast ratio for readability.

Mobile Friendly: Fully responsive design scales to any device width

## 🌐 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎨 WireFrame 
This what I call expectaions VS reality LOL 
[CampusLife Figma Wireframe](https://www.figma.com/design/qLikfxEdpPZQCTAj4WkbES/Campus-Life?node-id=0-1&p=f&t=TQkjRrqEMz5VVLg1-0)

## 🔗 Links
About page inspo:
[CampusLife Figma Wireframe](https://kinsta.com/blog/about-us-page/)


## 🤝 Contributing

Contributions are welcome!

Fork this repository

Create a feature branch (feature/new-function)

Commit and push your changes

Open a Pull Request

## 📜 License

This project is licensed under the MIT License.
You’re free to use, modify, and distribute it for learning or personal projects.

Google Developers - Responsive Web Design
## Author
- **Name**: Eelaf Adam
- **Email**: e.adam@alustudent.com
- **GitHub**: [Eelaf-Adam](https://github.com/Eelaf-Adam)


## Acknowledgments
- African Leadership University
- Frontend Web Development Course
