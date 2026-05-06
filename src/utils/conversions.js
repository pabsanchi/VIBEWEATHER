/**
 * Converts Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit (rounded to 2 decimals)
 */
function celsiusToFahrenheit(celsius) {
  if (typeof celsius !== 'number' || !Number.isFinite(celsius)) {
    throw new Error('Invalid input: celsius must be a finite number');
  }
  return Math.round(((celsius * 9/5) + 32) * 100) / 100;
}

/**
 * Converts kilometers per hour to meters per second
 * @param {number} kmh - Speed in km/h
 * @returns {number} Speed in m/s (rounded to 2 decimals)
 */
function kmhToMs(kmh) {
  if (typeof kmh !== 'number' || !Number.isFinite(kmh)) {
    throw new Error('Invalid input: kmh must be a finite number');
  }
  return Math.round((kmh / 3.6) * 100) / 100;
}

/**
 * Converts kilometers per hour to miles per hour
 * @param {number} kmh - Speed in km/h
 * @returns {number} Speed in mph (rounded to 2 decimals)
 */
function kmhToMph(kmh) {
  if (typeof kmh !== 'number' || !Number.isFinite(kmh)) {
    throw new Error('Invalid input: kmh must be a finite number');
  }
  return Math.round((kmh * 0.621371) * 100) / 100;
}

module.exports = {
  celsiusToFahrenheit,
  kmhToMs,
  kmhToMph
};
