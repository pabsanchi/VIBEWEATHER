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
        precipitation: times.map(() => 0)
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
});