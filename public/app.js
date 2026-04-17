const dashboard = document.getElementById('weather-dashboard');

async function loadWeather() {
  renderLoading();

  try {
    const response = await fetch('/api/weather');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error fetching weather');
    }

    renderWeather(data);
  } catch (error) {
    console.error('Error loading weather:', error);
    showError('Error al cargar el clima. Intenta recargar.');
  }
}

function renderLoading() {
  dashboard.innerHTML = '<p class="loading">Cargando datos meteorológicos...</p>';
}

function renderWeather(data) {
  const { current, forecast, alerts } = data;
  dashboard.innerHTML = `
    <section class="weather-card">
      <div class="weather-current">
        <span class="weather-icon">${iconEmoji(current.icon)}</span>
        <div>
          <h2>${current.temperature}°C</h2>
          <p>${current.condition}</p>
          <p>Viento: ${current.windspeed} km/h</p>
          <p>Última actualización: ${formatTime(current.time)}</p>
        </div>
      </div>
    </section>
    ${renderAlerts(alerts)}
    <section>
      <h3>Previsión 24 horas</h3>
      <div class="forecast-grid">${forecast.map(renderHourCard).join('')}</div>
    </section>
  `;
}

function renderAlerts(alerts) {
  if (!alerts || !alerts.length) {
    return '';
  }

  return `
    <section class="alerts-panel">
      <h3>Alertas Meteorológicas</h3>
      <div class="alerts-list">
        ${alerts.map((alert) => renderAlertCard(alert)).join('')}
      </div>
    </section>
  `;
}

function renderAlertCard(alert) {
  return `
    <article class="alert-card alert-${alert.severity}">
      <strong>${alert.type.toUpperCase()}</strong>
      <p>${alert.message}</p>
    </article>
  `;
}

function renderHourCard(hour) {
  return `
    <article class="forecast-card">
      <span class="forecast-time">${formatHour(hour.time)}</span>
      <span class="forecast-icon">${iconEmoji(hour.icon)}</span>
      <span>${hour.temperature}°C</span>
      <span>${hour.condition}</span>
    </article>
  `;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatHour(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function iconEmoji(icon) {
  switch (icon) {
    case 'sunny':
      return '☀️';
    case 'partly-cloudy':
      return '⛅';
    case 'cloudy':
      return '☁️';
    case 'rainy':
      return '🌧️';
    case 'snowy':
      return '❄️';
    case 'fog':
      return '🌫️';
    default:
      return '🌡️';
  }
}

function showError(message) {
  dashboard.innerHTML = `<p class="error">${message}</p>`;
}

document.addEventListener('DOMContentLoaded', loadWeather);