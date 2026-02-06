import { appState } from './state.js';

export function toggleTheme() {
  appState.isDarkMode = !appState.isDarkMode;

  const app = document.getElementById('app');
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');

  if (!app || !moonIcon || !sunIcon) return;

  if (appState.isDarkMode) {
    app.classList.remove('weather-gradient-light', 'light');
    app.classList.add('weather-gradient', 'text-white');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  } else {
    app.classList.remove('weather-gradient');
    app.classList.add('weather-gradient-light', 'light');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
}
