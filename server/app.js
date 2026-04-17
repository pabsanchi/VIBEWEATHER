const express = require('express');
const GetWeatherForecast = require('../src/use-cases/GetWeatherForecast');
const GenerateWeatherAlerts = require('../src/use-cases/GenerateWeatherAlerts');
const OpenMeteoAdapter = require('../src/adapters/OpenMeteoAdapter');
const cities = require('../src/config/cities');
const logger = require('../src/utils/logger');
const { normalizeCity, validateCoordinates } = require('../src/utils/validation');

const app = express();
const PORT = process.env.PORT || 3000;

const cityCoordinates = cities;

// Initialize dependencies
const weatherRepository = new OpenMeteoAdapter();
const alertGenerator = new GenerateWeatherAlerts();
const getWeatherForecast = new GetWeatherForecast(weatherRepository, alertGenerator);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city ? String(req.query.city).trim().toLowerCase() : null;
    const latQuery = req.query.lat;
    const lonQuery = req.query.lon;

    let location;
    if (city) {
      const normalizedCity = normalizeCity(city);
      if (!cityCoordinates[normalizedCity]) {
        logger.warn(`Unsupported city requested: ${city}`);
        return res.status(400).json({ error: 'Ciudad no soportada.' });
      }
      location = cityCoordinates[normalizedCity];
    } else if (latQuery !== undefined || lonQuery !== undefined) {
      const lat = Number(latQuery);
      const lon = Number(lonQuery);
      const validationMessage = validateCoordinates(lat, lon);

      if (validationMessage) {
        logger.warn(`Invalid coordinates requested: ${latQuery}, ${lonQuery}`);
        return res.status(400).json({ error: validationMessage });
      }

      location = { lat, lon };
    } else {
      location = { lat: 40.7128, lon: -74.0060 };
    }

    const weather = await getWeatherForecast.execute(location);
    res.json(weather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching weather' });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
