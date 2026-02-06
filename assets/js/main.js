import { appState } from './state.js';
import { initElementSdk } from './sdk/elementSdk.js';
import { initStatesDropdown, getDistrictCoords, updateDistrictsDropdown } from './location.js';
import { indiaData } from './data/indiaData.js';
import { attachSearchHandlers } from './search.js';
import { toggleTheme } from './theme.js';
import { fetchWeatherData } from './weather.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initElementSdk();
  initStatesDropdown();

  // STATE DROPDOWN
  document.getElementById('state-select').addEventListener('change', (e) => {
    updateDistrictsDropdown(e.target.value);

    const state = e.target.value;
    if (!state) return;

    const coords = indiaData[state]?.capital;
    if (!coords) return;

    appState.currentLocation = coords;
    appState.locationName = state;
    document.getElementById('current-location').textContent = state;
    fetchWeatherData(coords.lat, coords.lon);
  });

  // DISTRICT DROPDOWN
  document.getElementById('district-select').addEventListener('change', (e) => {
    const state = document.getElementById('state-select').value;
    const district = e.target.value;

    if (state && district) {
      const coords = getDistrictCoords(state, district);
      if (coords) {
        appState.currentLocation = coords;
        appState.locationName = `${district}, ${state}`;
        document.getElementById('current-location').textContent = appState.locationName;
        fetchWeatherData(coords.lat, coords.lon);
      }
    }
  });

  // THEME TOGGLE
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // SEARCH INPUT
  attachSearchHandlers();

  // RETRY BUTTON
  document.getElementById('retry-btn').addEventListener('click', () => {
    if (appState.currentLocation) {
      fetchWeatherData(appState.currentLocation.lat, appState.currentLocation.lon);
    }
  });

  // POPULAR CITIES
  document.querySelectorAll('.city-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lon = parseFloat(btn.dataset.lon);
      appState.currentLocation = { lat, lon };
      appState.locationName = btn.dataset.city;
      document.getElementById('current-location').textContent = btn.dataset.city;
      fetchWeatherData(lat, lon);
    });
  });
});

