export function showLoading() {
  document.getElementById('loading-state')?.classList.remove('hidden');
  document.getElementById('welcome-state')?.classList.add('hidden');
  document.getElementById('weather-content')?.classList.add('hidden');
  document.getElementById('error-state')?.classList.add('hidden');
}

export function hideLoading() {
  document.getElementById('loading-state')?.classList.add('hidden');
}

export function showWeatherContent() {
  document.getElementById('weather-content')?.classList.remove('hidden');
  document.getElementById('welcome-state')?.classList.add('hidden');
  document.getElementById('error-state')?.classList.add('hidden');
}

export function showError(msg) {
  document.getElementById('loading-state')?.classList.add('hidden');
  document.getElementById('weather-content')?.classList.add('hidden');
  document.getElementById('welcome-state')?.classList.add('hidden');
  document.getElementById('error-state')?.classList.remove('hidden');
  const el = document.getElementById('error-message');
  if (el) el.textContent = msg;
}
