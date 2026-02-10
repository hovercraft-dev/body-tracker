const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdZ7cvfrbx6il24_B5shparhtEQjqO2faQSItEABaG2JJQQCw/formResponse';
const FIELDS = {
  weight:   'entry.841388769',
  waist:    'entry.1933747550',
  hips:     'entry.1558876293',
  exercise: 'entry.208895798',
  // date: 'entry.XXXXX' // Add your Google Form field ID for Date here to sync it
};

const form = document.getElementById('form');
const toast = document.getElementById('toast');
const historyContainer = document.getElementById('history-container');
const historyList = document.getElementById('history-list');

function resetForm() {
  form.reset();
  document.getElementById('date').valueAsDate = new Date();
}

function showToast(message) {
  toast.textContent = message || 'Logged';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function saveToHistory(entry) {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  history.unshift(entry);
  localStorage.setItem('history', JSON.stringify(history.slice(0, 5)));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  if (history.length === 0) {
    historyContainer.style.display = 'none';
    return;
  }

  historyContainer.style.display = 'block';
  historyList.innerHTML = '';

  history.forEach(item => {
    const [y, m, d] = item.date.split('-');
    const dateObj = new Date(y, m - 1, d);
    const dateStr = dateObj.toLocaleDateString();

    const itemEl = document.createElement('div');
    itemEl.className = 'history-item';

    const headerEl = document.createElement('div');
    headerEl.className = 'history-header';
    headerEl.innerHTML = `<span class="history-date">${dateStr}</span>`;

    const metricsEl = document.createElement('div');
    metricsEl.className = 'history-metrics';
    metricsEl.innerHTML = `
      <div class="history-metric">
        <span class="history-metric-label">Weight</span>
        <span>${parseFloat(item.weight).toFixed(1)} kg</span>
      </div>
      <div class="history-metric">
        <span class="history-metric-label">Waist</span>
        <span>${parseFloat(item.waist).toFixed(1)} cm</span>
      </div>
      <div class="history-metric">
        <span class="history-metric-label">Hips</span>
        <span>${parseFloat(item.hips).toFixed(1)} cm</span>
      </div>
    `;

    itemEl.appendChild(headerEl);
    itemEl.appendChild(metricsEl);

    if (item.exercise) {
      const exerciseEl = document.createElement('div');
      exerciseEl.className = 'history-exercise';
      exerciseEl.textContent = item.exercise;
      itemEl.appendChild(exerciseEl);
    }

    historyList.appendChild(itemEl);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  const originalBtnText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'Saving...';

  const entry = {
    date: document.getElementById('date').value,
    weight: document.getElementById('weight').value,
    waist: document.getElementById('waist').value,
    hips: document.getElementById('hips').value,
    exercise: document.getElementById('exercise').value
  };

  const params = new URLSearchParams();
  params.append(FIELDS.weight, entry.weight);
  params.append(FIELDS.waist, entry.waist);
  params.append(FIELDS.hips, entry.hips);
  params.append(FIELDS.exercise, entry.exercise);
  // if (FIELDS.date) params.append(FIELDS.date, entry.date);

  try {
    await fetch(FORM_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    saveToHistory(entry);
    showToast(`Logged ${entry.weight}kg`);
    resetForm();
  } catch (err) {
    alert('Failed to send. Check your connection.');
  } finally {
    btn.disabled = false;
    btn.textContent = originalBtnText;
  }
});

// Init
resetForm();
renderHistory();

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
