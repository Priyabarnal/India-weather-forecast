export const defaultConfig = {
  app_title: "Real-Time Weather India",
  footer_text: "Live weather updates every 5 minutes"
};

export let config = { ...defaultConfig };

export const appState = {
  isDarkMode: true,
  currentLocation: null,
  locationName: '',
  weatherData: null,
  updateInterval: null,
  nextUpdateTime: null,
  nextUpdateInterval: null
};

export function setConfig(nextConfig) {
  config = nextConfig;
}
