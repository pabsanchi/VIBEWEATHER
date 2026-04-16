# Copilot Instructions

## Estilo de Código
- Usa ES6+ features: arrow functions, destructuring, async/await, template literals.
- Código modular: separa funciones en módulos (import/export).
- Nombrado de variables: camelCase para variables y funciones, PascalCase para clases y constructores, UPPER_CASE para constantes.
- Indentación: 2 espacios, no tabs.
- Líneas largas: máximo 80 caracteres.

## Manejo de Errores
- Usa try/catch en todas las funciones async.
- Log errores con console.error para debugging.
- Maneja estados de error en UI: muestra mensajes amigables al usuario.
- Valida inputs antes de procesar.

## Arquitectura
- Sigue Clean Architecture: entidades, casos de uso, adaptadores.
- Separa lógica de negocio de presentación.

## Performance
- Optimiza fetches: usa cache si es posible.
- Maneja estados de carga con spinners o placeholders.