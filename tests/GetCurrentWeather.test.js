const GetCurrentWeather = require('../src/use-cases/GetCurrentWeather');

describe('GetCurrentWeather', () => {
  it('should return weather data', async () => {
    const mockRepo = {
      getCurrent: jest.fn().mockResolvedValue({
        temperature: 20,
        condition: 'sunny',
        icon: 'sun'
      })
    };
    const useCase = new GetCurrentWeather(mockRepo);
    const result = await useCase.execute({ lat: 0, lon: 0 });
    expect(result.temperature).toBe(20);
  });
});