const logger = require('../utils/logger');

class OpenMeteoAdapter {
  constructor() {
    this.cache = new Map();
    this.cacheTtl = Number(process.env.WEATHER_CACHE_TTL) || 5 * 60 * 1000;
  }

  async getCurrent(location) {
    const weather = await this.getWeather(location);
    return {
      temperature: weather.current.temperature,
      condition: weather.current.condition,
      icon: weather.current.icon
    };
  }

  async getWeather(location) {
    const cacheKey = this.getCacheKey(location);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      logger.info(`Cache hit for location ${cacheKey}`);
      return cached.value;
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,weathercode,windspeed_10m,precipitation,relativehumidity_2m,pressure_msl,apparent_temperature&daily=sunrise,sunset&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      logger.error(`Open-Meteo API returned ${response.status}`);
      throw new Error('API Error');
    }

    const data = await response.json();
    this.validateData(data);

    const result = {
      current: this.buildCurrent(data),
      forecast: this.buildHourlyForecast(data),
      alerts: this.buildAlerts(data)
    };

    this.cache.set(cacheKey, { value: result, timestamp: Date.now() });
    logger.info(`Cache stored for location ${cacheKey}`);
    return result;
  }

  validateData(data) {
    if (!data || !data.current_weather || !data.hourly) {
      throw new Error('Invalid API response');
    }
  }

  buildCurrent(data) {
    const weatherCode = data.current_weather.weathercode;
    const hourIndex = this.findCurrentHourIndex(data.hourly.time, data.current_weather.time);
    return {
      temperature: data.current_weather.temperature,
      condition: this.mapToCondition(weatherCode),
      icon: this.mapToIcon(weatherCode),
      windspeed: data.current_weather.windspeed,
      time: data.current_weather.time,
      humidity: hourIndex >= 0 ? data.hourly.relativehumidity_2m[hourIndex] : null,
      pressure: hourIndex >= 0 ? data.hourly.pressure_msl[hourIndex] : null,
      feels_like: hourIndex >= 0 ? data.hourly.apparent_temperature[hourIndex] : null,
      sunrise: data.daily?.sunrise?.[0] || null,
      sunset: data.daily?.sunset?.[0] || null
    };
  }

  buildHourlyForecast(data) {
    const { time, temperature_2m, weathercode, windspeed_10m, precipitation, relativehumidity_2m, pressure_msl, apparent_temperature } = data.hourly;
    const currentTimestamp = new Date(data.current_weather.time).getTime();

    return time
      .map((hour, index) => ({
        time: hour,
        temperature: temperature_2m[index],
        condition: this.mapToCondition(weathercode[index]),
        icon: this.mapToIcon(weathercode[index]),
        windspeed: windspeed_10m[index],
        precipitation: precipitation[index],
        humidity: relativehumidity_2m[index],
        pressure: pressure_msl[index],
        feels_like: apparent_temperature[index]
      }))
      .filter((hourItem) => new Date(hourItem.time).getTime() >= currentTimestamp)
      .slice(0, 24);
  }

  buildAlerts(data) {
    if (!Array.isArray(data.alerts)) {
      return [];
    }

    return data.alerts.map((alert) => ({
      type: alert.event || alert.headline || 'weather',
      message: alert.description || alert.event || 'Alerta meteorológica',
      severity: this.mapAlertSeverity(alert),
      start: alert.start,
      end: alert.end,
      source: alert.source || 'Open-Meteo'
    }));
  }

  mapAlertSeverity(alert) {
    const severity = (alert.severity || '').toLowerCase();
    if (severity.includes('warning') || severity.includes('alert') || severity.includes('watch')) {
      return 'high';
    }

    const event = (alert.event || '').toLowerCase();
    if (event.includes('storm') || event.includes('heat') || event.includes('wind') || event.includes('flood') || event.includes('snow') || event.includes('freeze') || event.includes('extreme')) {
      return 'high';
    }

    return 'moderate';
  }

  findCurrentHourIndex(hours, currentTime) {
    return hours.findIndex((hour) => hour === currentTime);
  }

  getCacheKey(location) {
    return `${location.lat.toFixed(4)}:${location.lon.toFixed(4)}`;
  }

  mapToCondition(code) {
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow';
    return 'Cloudy';
  }

  mapToIcon(code) {
    if (code === 0) return 'sunny';
    if (code === 1 || code === 2 || code === 3) return 'partly-cloudy';
    if (code >= 45 && code <= 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy';
    return 'cloudy';
  }
}

module.exports = OpenMeteoAdapter;