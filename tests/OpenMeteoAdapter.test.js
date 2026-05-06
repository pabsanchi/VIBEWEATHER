const OpenMeteoAdapter = require('../src/adapters/OpenMeteoAdapter');

describe('OpenMeteoAdapter', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('should return current weather and 24 hourly forecast from API response', async () => {
    const now = new Date('2026-04-17T10:00:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(now.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 15,
        weathercode: 0,
        windspeed: 10,
        time: times[0]
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 15),
        weathercode: times.map(() => 0),
        windspeed_10m: times.map(() => 10),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map(() => 60),
        pressure_msl: times.map(() => 1012),
        apparent_temperature: times.map(() => 15)
      },
      daily: {
        sunrise: [new Date('2026-04-17T06:00:00Z').toISOString()],
        sunset: [new Date('2026-04-17T20:00:00Z').toISOString()]
      }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse)
    });

    const adapter = new OpenMeteoAdapter();
    const result = await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });

    expect(result.current.temperature.celsius).toBe(15);
    expect(result.current.temperature.fahrenheit).toBe(59);
    expect(result.current.condition).toBe('Clear');
    expect(result.current.icon).toBe('sunny');
    expect(result.current.humidity).toBe(60);
    expect(result.current.pressure).toBe(1012);
    expect(result.current.feels_like.celsius).toBe(15);
    expect(result.current.feels_like.fahrenheit).toBe(59);
    expect(result.current.sunrise).toBe(apiResponse.daily.sunrise[0]);
    expect(result.current.sunset).toBe(apiResponse.daily.sunset[0]);
    expect(result.forecast).toHaveLength(24);
    expect(result.forecast[0].icon).toBe('sunny');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should map current metrics from Open Meteo hourly data', async () => {
    const now = new Date('2026-04-17T10:00:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(now.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 18,
        weathercode: 0,
        windspeed: 6,
        time: times[0]
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 18),
        weathercode: times.map(() => 0),
        windspeed_10m: times.map(() => 6),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map(() => 48),
        pressure_msl: times.map(() => 1018),
        apparent_temperature: times.map(() => 17)
      },
      daily: {
        sunrise: [new Date('2026-04-17T06:20:00Z').toISOString()],
        sunset: [new Date('2026-04-17T20:15:00Z').toISOString()]
      }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse)
    });

    const adapter = new OpenMeteoAdapter();
    const result = await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });

    expect(result.current.humidity).toBe(48);
    expect(result.current.pressure).toBe(1018);
    expect(result.current.feels_like.celsius).toBe(17);
    expect(result.current.feels_like.fahrenheit).toBe(62.6);
    expect(result.current.sunrise).toBe(apiResponse.daily.sunrise[0]);
    expect(result.current.sunset).toBe(apiResponse.daily.sunset[0]);
  });

  it('should fallback to nearest hourly index when current_weather time does not exactly match hourly time', async () => {
    const base = new Date('2026-04-17T10:30:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(base.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 22,
        weathercode: 0,
        windspeed: 7,
        time: new Date('2026-04-17T10:20:00Z').toISOString()
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 22),
        weathercode: times.map(() => 0),
        windspeed_10m: times.map(() => 7),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map((_, index) => (index === 0 ? 50 : 70)),
        pressure_msl: times.map(() => 1010),
        apparent_temperature: times.map(() => 21)
      },
      daily: {
        sunrise: [new Date('2026-04-17T06:10:00Z').toISOString()],
        sunset: [new Date('2026-04-17T20:10:00Z').toISOString()]
      }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse)
    });

    const adapter = new OpenMeteoAdapter();
    const result = await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });

    expect(result.current.humidity).toBe(50);
    expect(result.current.pressure).toBe(1010);
    expect(result.current.feels_like.celsius).toBe(21);
    expect(result.current.feels_like.fahrenheit).toBe(69.8);
  });

  it('should cache weather responses and reuse them for repeated requests', async () => {
    const now = new Date('2026-04-17T10:00:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(now.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 12,
        weathercode: 0,
        windspeed: 5,
        time: times[0]
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 12),
        weathercode: times.map(() => 0),
        windspeed_10m: times.map(() => 5),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map(() => 72),
        pressure_msl: times.map(() => 1016),
        apparent_temperature: times.map(() => 12)
      },
      daily: {
        sunrise: [new Date('2026-04-17T06:30:00Z').toISOString()],
        sunset: [new Date('2026-04-17T20:30:00Z').toISOString()]
      }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse)
    });

    const adapter = new OpenMeteoAdapter();
    await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });
    await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should map official Open Meteo alerts into normalized alert objects', async () => {
    const now = new Date('2026-04-17T10:00:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(now.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 15,
        weathercode: 0,
        windspeed: 10,
        time: times[0]
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 15),
        weathercode: times.map(() => 0),
        windspeed_10m: times.map(() => 10),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map(() => 60),
        pressure_msl: times.map(() => 1012),
        apparent_temperature: times.map(() => 15)
      },
      daily: {
        sunrise: [new Date('2026-04-17T06:00:00Z').toISOString()],
        sunset: [new Date('2026-04-17T20:00:00Z').toISOString()]
      },
      alerts: [
        {
          event: 'Fuerte tormenta',
          description: 'Se espera lluvia intensa y ráfagas de viento.',
          severity: 'warning',
          start: '2026-04-17T12:00:00Z',
          end: '2026-04-17T18:00:00Z',
          source: 'Servicio Meteorológico'
        }
      ]
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse)
    });

    const adapter = new OpenMeteoAdapter();
    const result = await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });

    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0]).toEqual(expect.objectContaining({
      type: 'Fuerte tormenta',
      message: 'Se espera lluvia intensa y ráfagas de viento.',
      severity: 'high',
      source: 'Servicio Meteorológico'
    }));
  });
});