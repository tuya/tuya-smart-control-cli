import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.tuya-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// API key prefix -> data center base URL mapping
const PREFIX_TO_BASE_URL = {
  AY: 'https://openapi.tuyacn.com',
  AZ: 'https://openapi.tuyaus.com',
  EU: 'https://openapi.tuyaeu.com',
  IN: 'https://openapi.tuyain.com',
  UE: 'https://openapi-ueaz.tuyaus.com',
  WE: 'https://openapi-weaz.tuyaeu.com',
  SG: 'https://openapi-sg.iotbing.com',
};

// API key prefix -> WebSocket URI mapping
const PREFIX_TO_WS_URI = {
  AY: 'wss://wsmsgs.tuyacn.com',
  AZ: 'wss://wsmsgs.iot-wus.com',
  EU: 'wss://wsmsgs.iot-eu.com',
  IN: 'wss://wsmsgs.iot-ap.com',
  UE: 'wss://wsmsgs.iot-eus.com',
  WE: 'wss://wsmsgs.iot-weu.com',
  SG: 'wss://wsmsgs.iot-sea.com',
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function resolveBaseUrl(apiKey) {
  let key = apiKey;
  if (key.startsWith('sk-')) {
    key = key.slice(3);
  }
  const prefix = key.slice(0, 2).toUpperCase();
  if (PREFIX_TO_BASE_URL[prefix]) {
    return PREFIX_TO_BASE_URL[prefix];
  }
  return null;
}

export function resolveWsUri(apiKey) {
  let key = apiKey;
  if (key.startsWith('sk-')) {
    key = key.slice(3);
  }
  const prefix = key.slice(0, 2).toUpperCase();
  if (PREFIX_TO_WS_URI[prefix]) {
    return PREFIX_TO_WS_URI[prefix];
  }
  return null;
}

export function getRegionName(prefix) {
  const names = {
    AY: 'China',
    AZ: 'US West',
    EU: 'Central Europe',
    IN: 'India',
    UE: 'US East',
    WE: 'Western Europe',
    SG: 'Singapore',
  };
  return names[prefix.toUpperCase()] || 'Unknown';
}

export function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey() {
  // Priority: env var > config file
  const envKey = process.env.TUYA_API_KEY;
  if (envKey) return envKey;
  const config = loadConfig();
  return config.apiKey || null;
}

export function getBaseUrl() {
  const envUrl = process.env.TUYA_BASE_URL;
  if (envUrl) return envUrl;
  const config = loadConfig();
  if (config.baseUrl) return config.baseUrl;
  const apiKey = getApiKey();
  if (apiKey) return resolveBaseUrl(apiKey);
  return null;
}

export { CONFIG_DIR, CONFIG_FILE, PREFIX_TO_BASE_URL, PREFIX_TO_WS_URI };
