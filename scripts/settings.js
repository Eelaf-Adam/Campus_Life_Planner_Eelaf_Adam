(function () {
  const KEY_UNIT = 'durationUnit';
  const KEY_CAP = 'weeklyCapMinutes';
  const KEY_THEME = 'theme';

  const unitRadios = document.querySelectorAll('input[name="duration-unit"]');
  const capInput = document.getElementById('cap-input');
  const capUnitLabel = document.getElementById('cap-unit');
  const capLive = document.getElementById('cap-live');
  const themeToggle = document.getElementById('theme-toggle');
  const exportBtn = document.getElementById('export-json');
  const importFile = document.getElementById('import-file');
  const importPasteBtn = document.getElementById('import-paste');
  const clearBtn = document.getElementById('clear-data');
  const resetBtn = document.getElementById('reset-defaults');

  function saveSetting(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function readSetting(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function sumStoredDurations() {
    let total = 0;
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      const arr = [].concat(tasks || [], events || []);
      for (const it of arr) {
        const d = Number(it.duration || it.minutes || 0);
        if (!Number.isNaN(d)) total += d;
      }
    } catch { }
    return total;
  }

  function updateCapLive() {
    const capMin = readSetting(KEY_CAP, 0);
    if (!capMin || capMin <= 0) {
      capLive.setAttribute("aria-live","polite");
      capLive.textContent = 'No cap set';
      return;
    }
    const used = sumStoredDurations();
    const remaining = Math.round(capMin - used);
    if (remaining >= 0) {
      capLive.setAttribute("aria-live","polite");
      capLive.textContent = `Remaining: ${formatDurationForUI(remaining)}`;
    } else {
      capLive.setAttribute("aria-live","assertive");
      capLive.textContent = `Over by ${formatDurationForUI(Math.abs(remaining))}`;
    }
  }

  function formatDurationForUI(minutes) {
    const unit = readSetting(KEY_UNIT, 'minutes');
    return unit === 'hours' ? (minutes / 60).toFixed(2) + ' h' : `${minutes} m`;
  }

  function applyTheme(name) {
    if (name === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    saveSetting(KEY_THEME, name);
  }

  function loadSettingsToUI() {
    const unit = readSetting(KEY_UNIT, 'minutes');
    for (const r of unitRadios) r.checked = (r.value === unit);

    const capMin = readSetting(KEY_CAP, 0);
    if (unit === 'hours') {
      capInput.value = capMin ? (capMin / 60) : '';
      capUnitLabel.textContent = 'hours';
      capInput.step = '0.25';
    } else {
      capInput.value = capMin ? capMin : '';
      capUnitLabel.textContent = 'minutes';
      capInput.step = '1';
    }

    const theme = readSetting(KEY_THEME, 'light');
    applyTheme(theme);

    updateCapLive();
  }

  unitRadios.forEach(r => r.addEventListener('change', (e) => {
    saveSetting(KEY_UNIT, e.target.value);
    loadSettingsToUI();
  }));

  
  capInput.addEventListener('change', () => {
    const unit = readSetting(KEY_UNIT, 'minutes');
    let val = Number(capInput.value || 0);
    if (Number.isNaN(val) || val < 0) val = 0;
    saveSetting(KEY_CAP, unit === 'hours' ? Math.round(val * 60) : Math.round(val));
    updateCapLive();
    alert('Cap saved');
  });

  themeToggle.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);   
  applyTheme(next);                      
  alert('Theme saved: ' + next);
});


  exportBtn.addEventListener('click', () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campuslife-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });


  importFile.addEventListener('change', (evt) => {
    const f = evt.target.files[0]; 
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try {
        const obj = JSON.parse(e.target.result);
        if (!confirm('Import will overwrite keys in localStorage. Continue?')) return;
        for (const k of Object.keys(obj)) localStorage.setItem(k, JSON.stringify(obj[k]));
        alert('Import complete');
        loadSettingsToUI();
        updateCapLive();
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(f); 
    importFile.value = '';
  });


  importPasteBtn.addEventListener('click', () => {
    const pasted = prompt('Paste JSON here (will overwrite keys in localStorage):');
    if (!pasted) return;
    try {
      const obj = JSON.parse(pasted);
      if (!confirm('Import will overwrite keys in localStorage. Continue?')) return;
      for (const k of Object.keys(obj)) localStorage.setItem(k, JSON.stringify(obj[k]));
      alert('Import complete');
      loadSettingsToUI();
      updateCapLive();
    } catch {
      alert('Invalid JSON');
    }
  });


  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all tasks and events from localStorage? This cannot be undone.')) return;
    const keysToRemove = ['tasks','events','taskIdCounter','eventIdCounter'];
    for (const k of keysToRemove) localStorage.removeItem(k);
    alert('Application data cleared (tasks/events).');
    updateCapLive();
  });


  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset settings to defaults?')) return;
    saveSetting(KEY_UNIT,'minutes');
    saveSetting(KEY_CAP,0);
    saveSetting(KEY_THEME,'light');
    loadSettingsToUI();
    alert('Settings reset to defaults');
  });


  const savedTheme = localStorage.getItem(KEY_THEME);
  if (savedTheme && savedTheme.includes('dark')) document.documentElement.classList.add('dark');


  document.addEventListener('DOMContentLoaded', () => {
    loadSettingsToUI();
  });
})();
