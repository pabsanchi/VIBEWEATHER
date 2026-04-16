class OpenMeteoAdapter {
  async getCurrent(location) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return {
      temperature: data.current_weather.temperature,
      condition: data.current_weather.weathercode, // Map to condition
      icon: this.mapToIcon(data.current_weather.weathercode)
    };
  }

  mapToIcon(code) {
    // Simple mapping
    if (code === 0) return 'sunny';
    if (code < 3) return 'cloudy';
    return 'rainy';
  }
}

module.exports = OpenMeteoAdapter;