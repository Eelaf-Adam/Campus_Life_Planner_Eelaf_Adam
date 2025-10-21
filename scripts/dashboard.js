// Read and parse JSON from localStorage 
(function () {
  const KEY_CAP = 'weeklyCapMinutes'; 
  let trendChart = null;

  // Read JSON array from localStorage 
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  // Convert any vlaue to a number 
  function toNumber(v) {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? n : 0;
  }

  // Extract duration in minutes from a task/event object
  function getDurationMinutes(item) {
    if (!item) return 0;
    if (item.duration != null) return Math.round(toNumber(item.duration));
    if (item.minutes != null) return Math.round(toNumber(item.minutes));
    if (item.minutesEstimated != null) return Math.round(toNumber(item.minutesEstimated));
    return 0;
  }

  // Collect all tags from items and count their occurrences
  function collectTags(items) {
    const map = new Map();
    items.forEach(it => {
      const t = it.tags || it.tag || it.category || '';
      if (!t) return;
      if (Array.isArray(t)) {
        t.forEach(x => {
          const k = String(x || '').trim();
          if (!k) return;
          map.set(k, (map.get(k) || 0) + 1);
        });
      } else {
        const key = String(t).trim();
        if (!key) return;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }

  // Find the top tag from a map of tag counts
  function topTagFromMaps(map) {
    let top = null, max = 0;
    for (const [k, v] of map.entries()) {
      if (v > max) { max = v; top = k; }
    }
    return top || '—';
  }

  // Generate an array of the last N dates 
  function getLastNDates(n = 7) {
    const arr = [];
    const now = new Date(); now.setHours(0,0,0,0);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      arr.push(d);
    }
    return arr;
  }

  // Format a date as YYYY-MM-DD
  function dateKey(d) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  // Sum durations for items grouped by date
  function sumDurationsByDate(items) {
    const map = {};
    items.forEach(it => {
      const date = it.date || '';
      if (!date) return;
      const key = String(date).slice(0,10);
      const mins = getDurationMinutes(it);
      map[key] = (map[key] || 0) + mins;
    });
    return map;
  }

  // Ensure there is a live element in the DOM for displaying weekly cap status
  function ensureCapLiveElement() {
    let el = document.getElementById('dashboard-cap-live');
    if (!el) {
      const container = document.getElementById('dashboard') || document.querySelector('main .content') || document.body;
      el = document.createElement('div');
      el.id = 'dashboard-cap-live';
      el.className = 'cap-status';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('role', 'status');
      el.style.marginTop = '0.75rem';
      if (container) container.appendChild(el);
    }
    return el;
  }

  // Convert total minutes into human-readable hours and minutes string
  function formatDuration(minutes) {
    if (minutes == null) return '0 m';
    minutes = Math.round(minutes);
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m === 0 ? `${h} h` : `${h} h ${m} m`;
    }
    return `${minutes} m`;
  }

  // Update stats, top tag, weekly cap status, and trend charts
  function updateStatsAndChart() {
    const tasks = Array.isArray(readJSON('tasks')) ? readJSON('tasks') : [];
    const events = Array.isArray(readJSON('events')) ? readJSON('events') : [];

    const totalTasks = tasks.length;
    const totalEvents = events.length;
    const combined = tasks.concat(events);
    const totalDuration = combined.reduce((s, it) => s + getDurationMinutes(it), 0);

    const elTasks = document.getElementById('total-tasks');
    const elEvents = document.getElementById('total-events');
    const elDuration = document.getElementById('total-duration');
    const elTopTag = document.getElementById('top-tag');

    if (elTasks) elTasks.textContent = totalTasks;
    if (elEvents) elEvents.textContent = totalEvents;
    if (elDuration) elDuration.textContent = formatDuration(totalDuration);

    // compute top tag across tasks and events
    const combinedMap = new Map();
    collectTags(tasks).forEach((v,k) => combinedMap.set(k, (combinedMap.get(k)||0) + v));
    collectTags(events).forEach((v,k) => combinedMap.set(k, (combinedMap.get(k)||0) + v));
    const top = topTagFromMaps(combinedMap);
    if (elTopTag) elTopTag.textContent = top;

    // Weekly cap logic & ARIA announcment 
    const capLiveEl = ensureCapLiveElement();
    let capMin = 0;
    try { capMin = Number(JSON.parse(localStorage.getItem(KEY_CAP) || '0')) || 0; } catch { capMin = 0; }

    if (!capMin || capMin <= 0) {
      capLiveEl.textContent = 'No weekly cap set';
      capLiveEl.setAttribute('aria-live', 'polite');
      capLiveEl.setAttribute('role','status');
    } else {
      const remaining = Math.round(capMin - totalDuration);
      if (remaining >= 0) {
        capLiveEl.textContent = `Remaining: ${formatDuration(remaining)}`;
        capLiveEl.setAttribute('aria-live', 'polite');
        capLiveEl.setAttribute('role','status');
      } else {
        capLiveEl.textContent = `Over by ${formatDuration(Math.abs(remaining))}`;
        capLiveEl.setAttribute('aria-live', 'assertive');
        capLiveEl.setAttribute('role','alert');
      }
    }

    // Prepare last 7-day trend data
    const last7 = getLastNDates(7);
    const labels = last7.map(d => d.toLocaleDateString(undefined, { weekday: 'short' }));
    const keys = last7.map(d => dateKey(d));
    const byDate = sumDurationsByDate(combined);
    const data = keys.map(k => Math.round(byDate[k] || 0));

    const canvas = document.getElementById('trend-chart');
    if (canvas && typeof Chart !== 'undefined') {
      // Update or create Chart.js bar chart
      if (trendChart) {
        trendChart.data.labels = labels;
        trendChart.data.datasets[0].data = data;
        trendChart.update();
      } else {
        const ctx = canvas.getContext('2d');
        trendChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Minutes per day',
              data,
              backgroundColor: 'rgba(37,99,235,0.7)',
              borderColor: 'rgba(37,99,235,1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Minutes' } } },
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
          }
        });
      }
    } else if (canvas) {
      // Fallback message if chart.js is not included
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px sans-serif';
        ctx.fillText('Include Chart.js to render trend chart.', 8, 20);
      }
    }
  }

  // Initialize dashboard on page load
  document.addEventListener('DOMContentLoaded', () => {
    updateStatsAndChart();
    // Listens to storage changes to update stats dynamically
    window.addEventListener('storage', (e) => {
      if (e.key === 'tasks' || e.key === 'events' || e.key === KEY_CAP || e.key === null) updateStatsAndChart();
    });
    // Refresh stats every 30 seconds 
    setInterval(updateStatsAndChart, 30000);
    // Expose for quick manual refresh
    window.dashboardUtils = { updateStatsAndChart };
  });

  // Apply dark mode based on saved theme 
  (function() {
    const theme = localStorage.getItem('theme');
    if(theme && theme.includes('dark')){
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
  
})();
