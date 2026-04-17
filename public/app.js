const dashboard = document.getElementById('weather-dashboard');
const citySelect = document.getElementById('city-select');
const latInput = document.getElementById('lat-input');
const lonInput = document.getElementById('lon-input');
const locationForm = document.getElementById('location-form');
const geoButton = document.getElementById('geolocate-button');
const locationError = document.getElementById('location-error');
const refreshInfo = document.getElementById('refresh-info');

const defaultLocation = { lat: 40.7128, lon: -74.0060 };
let currentLocation = { ...defaultLocation };
let refreshTimer = null;

async function loadWeather(location = currentLocation) {
  renderLoading();
  clearError();

  try {
    const response = await fetch(buildApiUrl(location));
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error fetching weather');
    }

    currentLocation = location;
    setFormValues(location);
    renderWeather(data);
    renderRefreshInfo();
  } catch (error) {
    console.error('Error loading weather:', error);
    if (locationError) {
      showError(error.message || 'Error al cargar el clima. Intenta recargar.');
    }
    showDashboardError(error.message || 'Error al cargar el clima. Intenta recargar.');
  }
}

function buildApiUrl(location) {
  if (location.city) {
    return `/api/weather?city=${encodeURIComponent(location.city)}`;
  }

  return `/api/weather?lat=${location.lat}&lon=${location.lon}`;
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
          <p>Humedad: ${current.humidity ?? 'N/A'}%</p>
          <p>Presión: ${current.pressure ?? 'N/A'} hPa</p>
          <p>Sensación térmica: ${current.feels_like ?? 'N/A'}°C</p>
          <p>Amanecer: ${current.sunrise ? formatTime(current.sunrise) : 'N/A'}</p>
          <p>Atardecer: ${current.sunset ? formatTime(current.sunset) : 'N/A'}</p>
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

function renderRefreshInfo() {
  const nextRefresh = new Date(Date.now() + 10 * 60 * 1000);
  refreshInfo.textContent = `Última carga: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · Próximo refresco: ${nextRefresh.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

function setFormValues(location) {
  if (location.city) {
    citySelect.value = location.city;
    latInput.value = '';
    lonInput.value = '';
    return;
  }

  citySelect.value = '';
  latInput.value = location.lat.toFixed(4);
  lonInput.value = location.lon.toFixed(4);
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

function clearError() {
  locationError.textContent = '';
}

function validateLocation(location) {
  if (location.lat === '' || location.lon === '') {
    return 'Proporciona latitud y longitud o selecciona una ciudad.';
  }

  const lat = Number(location.lat);
  const lon = Number(location.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return 'Coordenadas inválidas.';
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return 'Coordenadas fuera de rango.';
  }

  return null;
}

function getLocationFromForm() {
  const city = citySelect.value;
  const lat = latInput.value;
  const lon = lonInput.value;

  if (city) {
    return { city };
  }

  return { lat, lon };
}

function showError(message) {
  locationError.textContent = message;
}

function showDashboardError(message) {
  dashboard.innerHTML = `<p class="error">${message}</p>`;
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

function showDashboardError(message) {
  dashboard.innerHTML = `<p class="error">${message}</p>`;
}

function attachEventHandlers() {
  locationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const location = getLocationFromForm();

    if (location.city) {
      await loadWeather({ city: location.city });
      return;
    }

    const validationMessage = validateLocation(location);
    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    await loadWeather({ lat: Number(location.lat), lon: Number(location.lon) });
  });

  geoButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showError('Geolocalización no soportada por el navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        await loadWeather(location);
      },
      (error) => {
        showError('No se pudo obtener la ubicación.');
        console.error('Geolocation error:', error);
      }
    );
  });
}

function startAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  refreshTimer = setInterval(() => {
    loadWeather(currentLocation);
  }, 10 * 60 * 1000);
}

function init() {
  attachEventHandlers();
  loadWeather(currentLocation);
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);