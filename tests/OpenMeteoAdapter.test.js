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
        precipitation: times.map(() => 0)
      }
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse)
    });

    const adapter = new OpenMeteoAdapter();
    const result = await adapter.getWeather({ lat: 40.7128, lon: -74.0060 });

    expect(result.current.temperature).toBe(15);
    expect(result.current.condition).toBe('Clear');
    expect(result.current.icon).toBe('sunny');
    expect(result.forecast).toHaveLength(24);
    expect(result.forecast[0].icon).toBe('sunny');
    expect(global.fetch).toHaveBeenCalled();
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
        precipitation: times.map(() => 0)
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