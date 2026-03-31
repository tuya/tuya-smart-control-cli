import { getApiKey, getBaseUrl } from './config.js';

class TuyaAPI {
  constructor() {
    this.apiKey = getApiKey();
    this.baseUrl = getBaseUrl();
  }

  ensureAuth() {
    if (!this.apiKey) {
      throw new Error(
        'Not authenticated. Run "tuya init" to configure your API key, ' +
        'or set the TUYA_API_KEY environment variable.'
      );
    }
    if (!this.baseUrl) {
      throw new Error(
        'Cannot determine base URL from API key. ' +
        'Set TUYA_BASE_URL or run "tuya init" to configure.'
      );
    }
  }

  async _request(method, path, { params, body } = {}) {
    this.ensureAuth();
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url += `?${qs}`;
    }
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const resp = await fetch(url, options);
    const data = await resp.json();
    if (!data.success) {
      const code = data.code || 'UNKNOWN';
      const msg = data.msg || 'Unknown error';
      throw new Error(`API Error [${code}]: ${msg}`);
    }
    return data.result;
  }

  async _get(path, params) {
    return this._request('GET', path, { params });
  }

  async _post(path, body) {
    return this._request('POST', path, { body });
  }

  // --- Home Management ---

  async getHomes() {
    return this._get('/v1.0/end-user/homes/all');
  }

  async getRooms(homeId) {
    return this._get(`/v1.0/end-user/homes/${homeId}/rooms`);
  }

  // --- Device Query ---

  async getAllDevices() {
    return this._get('/v1.0/end-user/devices/all');
  }

  async getHomeDevices(homeId) {
    return this._get(`/v1.0/end-user/homes/${homeId}/devices`);
  }

  async getRoomDevices(roomId) {
    return this._get(`/v1.0/end-user/homes/room/${roomId}/devices`);
  }

  async getDeviceDetail(deviceId) {
    return this._get(`/v1.0/end-user/devices/${deviceId}/detail`);
  }

  // --- Device Control ---

  async getDeviceModel(deviceId) {
    return this._get(`/v1.0/end-user/devices/${deviceId}/model`);
  }

  async issueProperties(deviceId, properties) {
    return this._post(
      `/v1.0/end-user/devices/${deviceId}/shadow/properties/issue`,
      { properties: JSON.stringify(properties) }
    );
  }

  // --- Device Management ---

  async renameDevice(deviceId, name) {
    return this._post(
      `/v1.0/end-user/devices/${deviceId}/attribute`,
      { name }
    );
  }

  // --- Weather ---

  async getWeather(lat, lon, codes) {
    if (!codes) {
      codes = ['w.temp', 'w.humidity', 'w.condition', 'w.hour.7'];
    }
    return this._get('/v1.0/end-user/services/weather/recent', {
      lat, lon, codes: JSON.stringify(codes),
    });
  }

  // --- Notifications ---

  async sendSms(message) {
    return this._post('/v1.0/end-user/services/sms/self-send', { message });
  }

  async sendVoice(message) {
    return this._post('/v1.0/end-user/services/voice/self-send', { message });
  }

  async sendMail(subject, content) {
    return this._post('/v1.0/end-user/services/mail/self-send', { subject, content });
  }

  async sendPush(subject, content) {
    return this._post('/v1.0/end-user/services/push/self-send', { subject, content });
  }

  // --- Statistics ---

  async getStatsConfig() {
    return this._get('/v1.0/end-user/statistics/hour/config');
  }

  async getStatsData(devId, dpCode, statisticType, startTime, endTime) {
    return this._get('/v1.0/end-user/statistics/hour/data', {
      dev_id: devId,
      dp_code: dpCode,
      statistic_type: statisticType,
      start_time: startTime,
      end_time: endTime,
    });
  }
}

export function createAPI() {
  return new TuyaAPI();
}
