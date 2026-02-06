import { appState } from './state.js';
import { fetchWeatherData } from './weather.js';
import { hideLoading, showError, showLoading } from './ui.js';

let searchTimeout;

export function attachSearchHandlers() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => handleSearch(e.target.value), 500);
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimeout);
      handleSearch(e.target.value);
    }
  });
}

export async function handleSearch(query) {
  if (!query || query.length < 2) return;

  showLoading();
  try {
    const params = new URLSearchParams({
      name: query,
      count: 1,
      language: 'en',
      format: 'json'
    });

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    const data = await response.json();

    if (data.results?.[0]) {
      const r = data.results[0];
      appState.currentLocation = { lat: r.latitude, lon: r.longitude };
      appState.locationName = `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}`;
      document.getElementById('current-location').textContent = appState.locationName;
      await fetchWeatherData(r.latitude, r.longitude);
    } else {
      showError('Location not found. Try another search or select from dropdown.');
      hideLoading();
    }
  } catch (error) {
    showError('Search failed. Try again.');
    hideLoading();
  }
}

