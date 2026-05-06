const dashboard = document.getElementById('weather-dashboard');
const citySelect = document.getElementById('city-select');
const cityChips = document.querySelectorAll('.city-chip');
const latInput = document.getElementById('lat-input');
const lonInput = document.getElementById('lon-input');
const locationForm = document.getElementById('location-form');
const geoButton = document.getElementById('geolocate-button');
const locationError = document.getElementById('location-error');
const refreshInfo = document.getElementById('refresh-info');
const themeToggleButton = document.getElementById('theme-toggle-button');
const body = document.body;

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
      <div class="weather-card-header">
        <div class="weather-current">
          <span class="weather-icon">${iconEmoji(current.icon)}</span>
          <div>
            <p class="weather-location">Clima actual</p>
            <h2>${current.temperature.celsius}°C / ${current.temperature.fahrenheit}°F</h2>
            <p class="weather-condition">${current.condition}</p>
            <div class="weather-meta">
              <span>Última actualización: ${formatTime(current.time)}</span>
              <span>${current.sunrise ? `Amanecer ${formatTime(current.sunrise)}` : 'Amanecer N/A'}</span>
              <span>${current.sunset ? `Atardecer ${formatTime(current.sunset)}` : 'Atardecer N/A'}</span>
            </div>
          </div>
        </div>
        <div class="weather-status-pill">${current.icon === 'rainy' ? 'Chubascos posibles' : 'Condiciones estables'}</div>
      </div>

      <div class="stats-grid">
        ${renderMetricCard('Sensación térmica', `${current.feels_like ? current.feels_like.celsius + '°C / ' + current.feels_like.fahrenheit + '°F' : 'N/A'}`)}\n        ${renderMetricCard('Viento', `${current.windspeed.kmh} km/h / ${current.windspeed.ms} m/s`)}\n        ${renderMetricCard('Humedad', `${current.humidity ?? 'N/A'}%`)}\n        ${renderMetricCard('Presión', `${current.pressure ?? 'N/A'} hPa`)}\n        ${renderMetricCard('Precipitación', `${current.precipitation ?? '0'} mm`)}\n        ${renderMetricCard('Cobertura', current.condition)}\n      </div>\n    </section>\n\n    ${renderTemperatureGraph(forecast)}\n    ${renderAlerts(alerts)}\n    ${renderForecastSection(forecast)}\n  `;\n}

function renderMetricCard(label, value) {
  return `
    <article class="metric-card">
      <strong>${label}</strong>
      <span>${value}</span>
    </article>
  `;
}

function renderForecastSection(forecast) {
  return `
    <section class="forecast-section">
      <div class="section-header">
        <div>
          <h3>Previsión 24 horas</h3>
          <p class="section-subtitle">Actualizada automáticamente cada 10 minutos.</p>
        </div>
      </div>
      <div class="forecast-grid">${forecast.map(renderHourCard).join('')}</div>
    </section>
  `;
}

function renderRefreshInfo() {
  const nextRefresh = new Date(Date.now() + 10 * 60 * 1000);
  refreshInfo.textContent = `Última carga: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · Próximo refresco: ${nextRefresh.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

function applyThemeFromStorage() {
  const savedTheme = localStorage.getItem('theme');
  const useDark = savedTheme !== 'light';

  if (useDark) {
    body.classList.add('dark-theme');
    if (themeToggleButton) {
      themeToggleButton.textContent = 'Modo claro';
    }
  } else {
    body.classList.remove('dark-theme');
    if (themeToggleButton) {
      themeToggleButton.textContent = 'Modo oscuro';
    }
  }
}

function toggleTheme() {
  const isDark = body.classList.toggle('dark-theme');
  if (themeToggleButton) {
    themeToggleButton.textContent = isDark ? 'Modo claro' : 'Modo oscuro';
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function renderTemperatureGraph(forecast) {
  const sample = forecast.slice(0, 12);
  if (!sample.length) {
    return '';
  }

  const temps = sample.map((hour) => hour.temperature.celsius);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const width = 460;
  const height = 140;
  const padding = 14;
  const range = maxTemp - minTemp || 1;

  const points = sample.map((hour, index) => {
    const x = padding + (index / (sample.length - 1)) * (width - padding * 2);
    const y = height - padding - ((hour.temperature.celsius - minTemp) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return `
    <section class="sparkline-panel">
      <div class="sparkline-header">
        <div>
          <h4>Gráfica de temperatura</h4>
          <p>Próximas 12 horas</p>
        </div>
        <span class="sparkline-highlight">Máx ${maxTemp}° / Mín ${minTemp}°</span>
      </div>
      <svg viewBox="0 0 ${width} ${height}" class="sparkline-svg" aria-hidden="true">
        <defs>
          <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="100%" stop-color="#fb7185" />
          </linearGradient>
        </defs>
        <polyline points="${points}" fill="none" stroke="url(#sparklineGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </section>
  `;
}

function setActiveCityChip(city) {
  cityChips.forEach((chip) => {
    chip.classList.toggle('active-chip', chip.dataset.city === city);
  });
}

function setFormValues(location) {
  if (location.city) {
    citySelect.value = location.city;
    setActiveCityChip(location.city);
    latInput.value = '';
    lonInput.value = '';
    return;
  }

  citySelect.value = '';
  setActiveCityChip('');
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
      <span>${hour.temperature.celsius}°C / ${hour.temperature.fahrenheit}°F</span>
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

  cityChips.forEach((chip) => {
    chip.addEventListener('click', async () => {
      const city = chip.dataset.city;
      if (!city) return;
      await loadWeather({ city });
    });
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

  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
  }
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
  applyThemeFromStorage();
  attachEventHandlers();
  loadWeather(currentLocation);
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);