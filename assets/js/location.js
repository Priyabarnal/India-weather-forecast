import { indiaData } from './data/indiaData.js';

export function initStatesDropdown() {
  const select = document.getElementById('state-select');
  if (!select) return;

  Object.keys(indiaData).sort().forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    select.appendChild(option);
  });
}

export function updateDistrictsDropdown(state) {
  const select = document.getElementById('district-select');
  if (!select) return;

  select.innerHTML = '<option value="">Select District</option>';

  if (state && indiaData[state]) {
    select.disabled = false;
    indiaData[state].districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      select.appendChild(option);
    });
  } else {
    select.disabled = true;
  }
}

export function getDistrictCoords(state, district) {
  const stateData = indiaData[state];
  if (!stateData) return null;

  // Use state capital as base
  const base = stateData.capital;
  const hash = district.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);

  return {
    lat: base.lat + (hash % 50) / 2000,
    lon: base.lon + ((hash >> 8) % 50) / 2000
  };
}
