const express = require('express');
const GetCurrentWeather = require('../src/use-cases/GetCurrentWeather');
const OpenMeteoAdapter = require('../src/adapters/OpenMeteoAdapter');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize dependencies
const weatherRepository = new OpenMeteoAdapter();
const getCurrentWeather = new GetCurrentWeather(weatherRepository);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api/weather', async (req, res) => {
  try {
    const location = { lat: 40.7128, lon: -74.0060 }; // Default NYC
    const weather = await getCurrentWeather.execute(location);
    res.json(weather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching weather' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});