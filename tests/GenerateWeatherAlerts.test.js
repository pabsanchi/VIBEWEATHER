const GenerateWeatherAlerts = require('../src/use-cases/GenerateWeatherAlerts');

describe('GenerateWeatherAlerts', () => {
  it('should generate a heat alert when temperature is high', () => {
    const generator = new GenerateWeatherAlerts();
    const alerts = generator.generate({
      current: { temperature: {celsius: 36, fahrenheit: 96.8}, windspeed: {kmh: 10, ms: 2.78}, condition: 'Clear' },
      forecast: []
    });

    expect(alerts).toEqual([
      expect.objectContaining({ type: 'heat', severity: 'high' })
    ]);
  });

  it('should generate a freeze alert when temperature is at or below 0', () => {
    const generator = new GenerateWeatherAlerts();
    const alerts = generator.generate({
      current: { temperature: {celsius: 0, fahrenheit: 32}, windspeed: {kmh: 5, ms: 1.39}, condition: 'Clear' },
      forecast: []
    });

    expect(alerts).toEqual([
      expect.objectContaining({ type: 'freeze', severity: 'high' })
    ]);
  });

  it('should generate multiple alerts when conditions match', () => {
    const generator = new GenerateWeatherAlerts();
    const alerts = generator.generate({
      current: { temperature: {celsius: 37, fahrenheit: 98.6}, windspeed: {kmh: 55, ms: 15.28}, condition: 'Rain' },
      forecast: [
        { precipitation: 6, condition: 'Rain' },
        { precipitation: 0, condition: 'Clear' }
      ]
    });

    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'heat' }),
        expect.objectContaining({ type: 'wind' }),
        expect.objectContaining({ type: 'rain' })
      ])
    );
  });
});
