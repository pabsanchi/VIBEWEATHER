class Weather {
  constructor(
    temperature,
    condition,
    icon,
    humidity = null,
    pressure = null,
    feelsLike = null,
    sunrise = null,
    sunset = null
  ) {
    this.temperature = temperature;
    this.condition = condition;
    this.icon = icon;
    this.humidity = humidity;
    this.pressure = pressure;
    this.feelsLike = feelsLike;
    this.sunrise = sunrise;
    this.sunset = sunset;
  }
}

module.exports = Weather;