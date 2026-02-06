import { weatherCodes } from './data/weatherCodes.js';
import { appState } from './state.js';
import { hideLoading, showError, showLoading, showWeatherContent } from './ui.js';

export async function fetchWeatherData(lat, lon) {
  showLoading();

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day',
      hourly: 'temperature_2m,weather_code,precipitation_probability,wind_speed_10m,relative_humidity_2m,visibility',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Asia/Kolkata',
      forecast_days: 7
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    appState.weatherData = data;
    mapAndDisplayWeatherData(data);
    hideLoading();
    showWeatherContent();
    scheduleNextUpdate();
  } catch (error) {
    console.error('Weather API Error:', error);
    showError('Failed to fetch weather data. Please check your connection and try a different location.');
  }
}

export function mapAndDisplayWeatherData(data) {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  const weatherInfo = weatherCodes[current.weather_code] || { condition: 'Unknown', icon: '🌡️', severity: 'unknown' };

  document.getElementById('current-weather-icon').innerHTML = `<span class="text-7xl">${weatherInfo.icon}</span>`;
  document.getElementById('current-temp').textContent = Math.round(current.temperature_2m);
  document.getElementById('current-condition').textContent = weatherInfo.condition;
  document.getElementById('current-humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('current-wind').textContent = `${Math.round(current.wind_speed_10m)}`;
  document.getElementById('current-pressure').textContent = `${Math.round(current.pressure_msl)}`;
  document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.getElementById('cloud-cover').textContent = `${current.cloud_cover}%`;
  document.getElementById('wind-speed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.getElementById('wind-dir-text').textContent = getWindDirection(current.wind_direction_10m);
  document.getElementById('wind-gusts').textContent = `${Math.round(current.wind_gusts_10m)} km/h`;

  const visibility = hourly.visibility[0] ? Math.round(hourly.visibility[0] / 1000) : '--';
  document.getElementById('current-visibility').textContent = `${visibility}`;
  document.getElementById('rain-prob').textContent = `${hourly.precipitation_probability[0] || 0}%`;
  document.getElementById('uv-index').textContent = '5 (High)';

  const now = new Date();
  document.getElementById('current-datetime').textContent = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  document.getElementById('last-update-time').textContent = now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  });

  renderHourlyForecast(hourly);
  renderDailyForecast(daily);

  const sunrise = new Date(daily.sunrise[0]);
  const sunset = new Date(daily.sunset[0]);
  document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  renderAlerts(current, hourly, daily);
  updateNextUpdateTimer();
}

export function renderHourlyForecast(hourly) {
  const container = document.getElementById('hourly-forecast');
  container.innerHTML = '';

  for (let i = 0; i < 24; i++) {
    const time = new Date(hourly.time[i]);
    const temp = Math.round(hourly.temperature_2m[i]);
    const code = hourly.weather_code[i];
    const rainProb = hourly.precipitation_probability[i] || 0;
    const info = weatherCodes[code] || { icon: '🌡️' };
    const hourLabel = i === 0 ? 'Now' : time.toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true });

    const card = document.createElement('div');
    card.className = 'flex-shrink-0 glass-card rounded-xl p-3 text-center min-w-[90px] hover:bg-white/20 transition-colors';
    card.innerHTML = `
      <p class="text-xs text-white/60 font-semibold">${hourLabel}</p>
      <span class="text-3xl block my-1">${info.icon}</span>
      <p class="text-lg font-bold">${temp}°</p>
      <p class="text-xs text-blue-300">💧 ${rainProb}%</p>
    `;
    container.appendChild(card);
  }
}

export function renderDailyForecast(daily) {
  const container = document.getElementById('daily-forecast');
  container.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const code = daily.weather_code[i];
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const rainProb = daily.precipitation_probability_max[i] || 0;
    const info = weatherCodes[code] || { icon: '🌡️' };

    const card = document.createElement('div');
    card.className = 'glass-card rounded-xl p-4 text-center hover:bg-white/20 transition-colors';
    card.innerHTML = `
      <p class="font-bold text-sm">${dayName}</p>
      <p class="text-xs text-white/60">${dateStr}</p>
      <span class="text-3xl block my-2">${info.icon}</span>
      <div class="flex justify-center gap-2 my-2">
        <span class="font-bold">${maxTemp}°</span>
        <span class="text-white/50">${minTemp}°</span>
      </div>
      <p class="text-xs text-blue-300">💧 ${rainProb}%</p>
    `;
    container.appendChild(card);
  }
}

export function renderAlerts(current, hourly, daily) {
  const container = document.getElementById('alert-container');
  container.innerHTML = '';

  const alerts = [];

  if (daily.precipitation_probability_max[0] >= 70) {
    alerts.push({
      icon: '🌧️',
      title: 'Heavy Rain Warning',
      message: `${daily.precipitation_probability_max[0]}% chance of rainfall. Carry umbrella!`,
      severity: 'warning'
    });
  }

  if (current.weather_code >= 95) {
    alerts.push({
      icon: '⛈️',
      title: 'Thunderstorm Alert',
      message: 'Severe weather conditions. Stay indoors!',
      severity: 'danger'
    });
  }

  if (current.temperature_2m > 40) {
    alerts.push({
      icon: '🔥',
      title: 'Extreme Heat',
      message: `Temperature at ${Math.round(current.temperature_2m)}°C. Stay hydrated!`,
      severity: 'danger'
    });
  }

  if (current.weather_code === 45 || current.weather_code === 48) {
    alerts.push({
      icon: '🌫️',
      title: 'Fog Alert',
      message: 'Low visibility. Drive carefully!',
      severity: 'warning'
    });
  }

  alerts.forEach(alert => {
    const div = document.createElement('div');
    div.className = `glass-card rounded-2xl p-4 border-l-4 fade-in ${
      alert.severity === 'danger' ? 'border-red-400' : 'border-yellow-400'
    }`;
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-3xl">${alert.icon}</span>
        <div>
          <h4 class="font-bold ${alert.severity === 'danger' ? 'text-red-400' : 'text-yellow-400'}">${alert.title}</h4>
          <p class="text-sm text-white/70">${alert.message}</p>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

export function getWindDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}

export function scheduleNextUpdate() {
  if (appState.updateInterval) clearInterval(appState.updateInterval);
  if (appState.nextUpdateInterval) clearInterval(appState.nextUpdateInterval);

  appState.updateInterval = setInterval(() => {
    if (appState.currentLocation) {
      fetchWeatherData(appState.currentLocation.lat, appState.currentLocation.lon);
    }
  }, 5 * 60 * 1000);

  updateNextUpdateTimer();
}

export function updateNextUpdateTimer() {
  if (appState.nextUpdateInterval) clearInterval(appState.nextUpdateInterval);

  const updateTime = () => {
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + 5 * 60 * 1000);
    const el = document.getElementById('next-update-time');
    if (el) {
      el.textContent = nextUpdate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  updateTime();
  appState.nextUpdateInterval = setInterval(updateTime, 1000);
}

