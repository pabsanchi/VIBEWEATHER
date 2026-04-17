const request = require('supertest');
const app = require('../server/app');

describe('/api/weather', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('should return a valid weather payload from the API route', async () => {
    const now = new Date('2026-04-17T10:00:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(now.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 16,
        weathercode: 1,
        windspeed: 12,
        time: times[0]
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 16),
        weathercode: times.map(() => 1),
        windspeed_10m: times.map(() => 12),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map(() => 65),
        pressure_msl: times.map(() => 1013),
        apparent_temperature: times.map(() => 16)
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

    const response = await request(app).get('/api/weather');

    expect(response.status).toBe(200);
    expect(response.body.current).toBeDefined();
    expect(response.body.forecast).toHaveLength(24);
    expect(response.body.current.condition).toBe('Partly Cloudy');
  });

  it('should return 400 for invalid coordinates', async () => {
    const response = await request(app).get('/api/weather?lat=100&lon=200');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Coordenadas fuera de rango.');
  });

  it('should accept a supported city query', async () => {
    const now = new Date('2026-04-17T10:00:00Z');
    const times = Array.from({ length: 26 }, (_, index) => new Date(now.getTime() + index * 3600000).toISOString());
    const apiResponse = {
      current_weather: {
        temperature: 20,
        weathercode: 0,
        windspeed: 8,
        time: times[0]
      },
      hourly: {
        time: times,
        temperature_2m: times.map(() => 20),
        weathercode: times.map(() => 0),
        windspeed_10m: times.map(() => 8),
        precipitation: times.map(() => 0),
        relativehumidity_2m: times.map(() => 55),
        pressure_msl: times.map(() => 1015),
        apparent_temperature: times.map(() => 20)
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

    const response = await request(app).get('/api/weather?city=madrid');

    expect(response.status).toBe(200);
    expect(response.body.current.temperature).toBe(20);
    expect(response.body.current.humidity).toBe(55);
    expect(response.body.current.pressure).toBe(1015);
    expect(response.body.current.sunrise).toBe(apiResponse.daily.sunrise[0]);
  });
});