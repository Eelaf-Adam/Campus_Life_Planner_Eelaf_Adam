// Sample data structure for tasks/events
const tasks = [
    // Example task objects
    { title: "Task 1", duration: 120, tags: ["study"], date: "2025-10-12" },
    { title: "Task 2", duration: 60, tags: ["exercise"], date: "2025-10-13" },
    { title: "Task 3", duration: 90, tags: ["study"], date: "2025-10-14" },
    // Add more tasks as needed
];

// Function to calculate total tasks/events
function totalTasks() {
    return tasks.length;
}

// Function to calculate sum of durations
function sumOfDurations() {
    return tasks.reduce((total, task) => total + task.duration, 0);
}

// Function to find the top tag/category
function topTag() {
    const tagCounts = {};
    tasks.forEach(task => {
        task.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    return Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b);
}

// Function to get last 7-day trend
function last7DaysTrend() {
    const today = new Date();
    const trend = Array(7).fill(0);
    tasks.forEach(task => {
        const taskDate = new Date(task.date);
        const diffDays = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
            trend[diffDays]++;
        }
    });
    return trend;
}

// Function to update dashboard display
function updateDashboard() {
    const totalTasksCount = totalTasks();
    const totalDuration = sumOfDurations();
    const mostFrequentTag = topTag();
    const trendData = last7DaysTrend();

    // Update the dashboard elements (assuming you have HTML elements with these IDs)
    document.getElementById('total-tasks').innerText = `Total Tasks: ${totalTasksCount}`;
    document.getElementById('total-duration').innerText = `Total Duration: ${totalDuration} minutes`;
    document.getElementById('top-tag').innerText = `Top Tag: ${mostFrequentTag}`;
    
    // Update chart with trendData (you can use a chart library like Chart.js)
    updateChart(trendData);
}

// Function to update chart (placeholder for actual chart implementation)
function updateChart(data) {
    // Implement chart update logic here
    console.log("Updating chart with data:", data);
}

// Call updateDashboard on page load
document.addEventListener('DOMContentLoaded', updateDashboard);