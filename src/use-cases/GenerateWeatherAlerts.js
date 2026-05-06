const WeatherAlert = require('../entities/WeatherAlert');

class GenerateWeatherAlerts {
  generate(weatherBundle) {
    const alerts = [];
    const { current, forecast = [] } = weatherBundle;

    if (!current) {
      return alerts;
    }

    if (current.temperature.celsius >= 35) {
      alerts.push(new WeatherAlert('heat', 'Alerta de calor extremo: mantente hidratado.', 'high'));
    }

    if (current.temperature.celsius <= 0) {
      alerts.push(new WeatherAlert('freeze', 'Alerta de heladas: protege las plantas y tuberías.', 'high'));
    }

    if (current.windspeed.kmh >= 50) {
      alerts.push(new WeatherAlert('wind', 'Alerta de viento fuerte: asegura objetos sueltos.', 'high'));
    }

    const hasStorm = forecast.some((hour) => hour.precipitation >= 5);
    if (hasStorm) {
      alerts.push(new WeatherAlert('rain', 'Alerta de lluvia intensa en las próximas horas.', 'moderate'));
    }

    const hasSnow = forecast.some((hour) => hour.condition === 'Snow');
    if (hasSnow) {
      alerts.push(new WeatherAlert('snow', 'Alerta de nieve: conduce con precaución.', 'moderate'));
    }

    return alerts;
  }
}

module.exports = GenerateWeatherAlerts;
