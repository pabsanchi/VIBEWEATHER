// Frontend app.js
async function loadWeather() {
  try {
    const response = await fetch('/api/weather');
    const data = await response.json();
    renderWeather(data);
  } catch (error) {
    console.error('Error loading weather:', error);
    showError('Error al cargar el clima');
  }
}

function renderWeather(data) {
  const dashboard = document.getElementById('weather-dashboard');
  dashboard.innerHTML = `<p>Temperatura: ${data.temperature}°C</p>`;
}

function showError(message) {
  const dashboard = document.getElementById('weather-dashboard');
  dashboard.innerHTML = `<p class="error">${message}</p>`;
}

document.addEventListener('DOMContentLoaded', loadWeather);