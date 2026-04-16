const Weather = require('../entities/Weather');

class GetCurrentWeather {
  constructor(weatherRepository) {
    this.weatherRepository = weatherRepository;
  }

  async execute(location) {
    const data = await this.weatherRepository.getCurrent(location);
    return new Weather(data.temperature, data.condition, data.icon);
  }
}

module.exports = GetCurrentWeather;