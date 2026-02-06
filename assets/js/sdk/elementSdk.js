import { defaultConfig, config, setConfig } from '../state.js';

export async function initElementSdk() {
  if (!window.elementSdk) return;

  await window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (newConfig) => {
      setConfig({ ...defaultConfig, ...newConfig });
      applyConfig();
    },
    mapToCapabilities: () => ({
      recolorables: [],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    }),
    mapToEditPanelValues: (cfg) => new Map([
      ["app_title", cfg.app_title || defaultConfig.app_title],
      ["footer_text", cfg.footer_text || defaultConfig.footer_text]
    ])
  });

  setConfig({ ...defaultConfig, ...window.elementSdk.config });
  applyConfig();
}

export function applyConfig() {
  document.getElementById('app-title').textContent = config.app_title || defaultConfig.app_title;
  document.getElementById('footer-text').textContent = config.footer_text || defaultConfig.footer_text;
}
