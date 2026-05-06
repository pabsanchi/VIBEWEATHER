const GetWeatherForecast = require('../src/use-cases/GetWeatherForecast');

describe('GetWeatherForecast', () => {
  it('should return a forecast bundle with current and hourly data', async () => {
    const mockRepo = {
      getWeather: jest.fn().mockResolvedValue({
        current: { temperature: {celsius: 18, fahrenheit: 64.4}, condition: 'Clear', icon: 'sunny', windspeed: {kmh: 8, ms: 2.22}, time: '2026-04-17T10:00:00Z' },
        forecast: Array(24).fill({ temperature: {celsius: 18, fahrenheit: 64.4}, condition: 'Clear', icon: 'sunny', windspeed: {kmh: 8, ms: 2.22}, precipitation: 0, time: '2026-04-17T11:00:00Z' })
      })
    };
    const alertGenerator = { generate: jest.fn(() => []) };

    const useCase = new GetWeatherForecast(mockRepo, alertGenerator);
    const result = await useCase.execute({ lat: 0, lon: 0 });

    expect(result.current.temperature.celsius).toBe(18);
    expect(result.forecast).toHaveLength(24);
    expect(result.alerts).toEqual([]);
    expect(mockRepo.getWeather).toHaveBeenCalledWith({ lat: 0, lon: 0 });
    expect(alertGenerator.generate).toHaveBeenCalledWith({
      current: expect.any(Object),
      forecast: expect.any(Array)
    });
  });
});