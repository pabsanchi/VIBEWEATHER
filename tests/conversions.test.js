const { celsiusToFahrenheit, kmhToMs, kmhToMph } = require('../src/utils/conversions');

describe('Temperature Conversions', () => {
  describe('celsiusToFahrenheit', () => {
    it('should convert 0 Celsius to 32 Fahrenheit', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('should convert 100 Celsius to 212 Fahrenheit', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('should convert -40 Celsius to -40 Fahrenheit', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    it('should convert 15 Celsius to 59 Fahrenheit', () => {
      expect(celsiusToFahrenheit(15)).toBe(59);
    });

    it('should round to 2 decimal places', () => {
      expect(celsiusToFahrenheit(37.5)).toBe(99.5);
    });

    it('should throw error for non-numeric input', () => {
      expect(() => celsiusToFahrenheit('15')).toThrow('Invalid input: celsius must be a finite number');
    });

    it('should throw error for NaN input', () => {
      expect(() => celsiusToFahrenheit(NaN)).toThrow('Invalid input: celsius must be a finite number');
    });

    it('should throw error for Infinity input', () => {
      expect(() => celsiusToFahrenheit(Infinity)).toThrow('Invalid input: celsius must be a finite number');
    });
  });
});

describe('Wind Speed Conversions', () => {
  describe('kmhToMs', () => {
    it('should convert 0 km/h to 0 m/s', () => {
      expect(kmhToMs(0)).toBe(0);
    });

    it('should convert 3.6 km/h to 1 m/s', () => {
      expect(kmhToMs(3.6)).toBe(1);
    });

    it('should convert 10 km/h to approximately 2.78 m/s', () => {
      expect(kmhToMs(10)).toBe(2.78);
    });

    it('should convert 36 km/h to 10 m/s', () => {
      expect(kmhToMs(36)).toBe(10);
    });

    it('should round to 2 decimal places', () => {
      expect(kmhToMs(15.5)).toBe(4.31);
    });

    it('should throw error for non-numeric input', () => {
      expect(() => kmhToMs('10')).toThrow('Invalid input: kmh must be a finite number');
    });

    it('should throw error for NaN input', () => {
      expect(() => kmhToMs(NaN)).toThrow('Invalid input: kmh must be a finite number');
    });

    it('should throw error for Infinity input', () => {
      expect(() => kmhToMs(Infinity)).toThrow('Invalid input: kmh must be a finite number');
    });
  });

  describe('kmhToMph', () => {
    it('should convert 0 km/h to 0 mph', () => {
      expect(kmhToMph(0)).toBe(0);
    });

    it('should convert 1 km/h to approximately 0.62 mph', () => {
      expect(kmhToMph(1)).toBe(0.62);
    });

    it('should convert 10 km/h to approximately 6.21 mph', () => {
      expect(kmhToMph(10)).toBe(6.21);
    });

    it('should convert 100 km/h to approximately 62.14 mph', () => {
      expect(kmhToMph(100)).toBe(62.14);
    });

    it('should round to 2 decimal places', () => {
      expect(kmhToMph(45.7)).toBe(28.4);
    });

    it('should throw error for non-numeric input', () => {
      expect(() => kmhToMph('10')).toThrow('Invalid input: kmh must be a finite number');
    });

    it('should throw error for NaN input', () => {
      expect(() => kmhToMph(NaN)).toThrow('Invalid input: kmh must be a finite number');
    });

    it('should throw error for Infinity input', () => {
      expect(() => kmhToMph(Infinity)).toThrow('Invalid input: kmh must be a finite number');
    });
  });
});
