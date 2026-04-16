---
name: weather-portal-skills
description: Habilidades específicas para el Portal Meteorológico - fetching de datos, renderizado DOM, gestión de logs.
---

# Weather Portal Skills

## Skill 1: Fetching y Saneamiento de Datos
- **Descripción**: Maneja peticiones a APIs externas como Open Meteo, valida y limpia datos.
- **Funciones**: async fetchWeatherData(url), sanitizeData(rawData).
- **Errores**: Maneja timeouts, respuestas inválidas.

## Skill 2: Renderizado Dinámico del DOM
- **Descripción**: Actualiza el DOM sin recargas, maneja estados de carga y errores.
- **Funciones**: renderWeatherCard(data), updateUI(state).
- **Performance**: Usa documentFragment para actualizaciones eficientes.

## Skill 3: Gestión de Logs y Errores
- **Descripción**: Centraliza logging y manejo de errores.
- **Funciones**: logError(message), handleApiError(error).
- **Integración**: Conecta con console y UI para feedback.