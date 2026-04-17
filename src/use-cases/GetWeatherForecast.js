const WeatherForecast = require('../entities/WeatherForecast');

class GetWeatherForecast {
  constructor(weatherRepository, alertGenerator = { generate: () => [] }) {
    this.weatherRepository = weatherRepository;
    this.alertGenerator = alertGenerator;
  }

  async execute(location) {
    const data = await this.weatherRepository.getWeather(location);
    const generatedAlerts = typeof this.alertGenerator.generate === 'function'
      ? this.alertGenerator.generate(data)
      : [];
    const combinedAlerts = [
      ...(Array.isArray(data.alerts) ? data.alerts : []),
      ...generatedAlerts
    ];

    return new WeatherForecast(data.current, data.forecast, combinedAlerts);
  }
}

module.exports = GetWeatherForecast;