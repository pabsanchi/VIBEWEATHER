class WeatherForecast {
  constructor(current, forecast = [], alerts = []) {
    this.current = current;
    this.forecast = forecast;
    this.alerts = alerts;
  }
}

module.exports = WeatherForecast;