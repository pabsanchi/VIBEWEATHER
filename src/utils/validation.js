const normalizeCity = (city) => {
  if (!city || typeof city !== 'string') return '';
  return city.trim().toLowerCase();
};

const validateCoordinates = (lat, lon) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return 'Coordenadas inválidas.';
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return 'Coordenadas fuera de rango.';
  }

  return null;
};

module.exports = {
  normalizeCity,
  validateCoordinates
};
