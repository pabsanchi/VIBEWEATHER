const express = require('express');
const GetWeatherForecast = require('../src/use-cases/GetWeatherForecast');
const GenerateWeatherAlerts = require('../src/use-cases/GenerateWeatherAlerts');
const OpenMeteoAdapter = require('../src/adapters/OpenMeteoAdapter');

const app = express();
const PORT = process.env.PORT || 3000;

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
    const lat = Number(req.query.lat) || 40.7128;
    const lon = Number(req.query.lon) || -74.0060;
    const weather = await getWeatherForecast.execute({ lat, lon });
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
