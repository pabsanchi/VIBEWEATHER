class WeatherAlert {
  constructor(type, message, severity = 'warning') {
    this.type = type;
    this.message = message;
    this.severity = severity;
  }
}

module.exports = WeatherAlert;
