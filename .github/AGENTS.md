# Custom Agents for Weather Portal

## Agent: FrontendRenderer

- **Purpose**: Maneja renderizado de UI, iconos dinámicos, estados de carga.
- **Skills**: Renderizado DOM, Gestión de Errores.
- **Trigger**: Cuando se necesita actualizar la vista.

## Agent: DataFetcher

- **Purpose**: Consume APIs, sana datos meteorológicos.
- **Skills**: Fetching y Saneamiento.
- **Trigger**: Para obtener datos de Open Meteo.

## Agent: Logger

- **Purpose**: Gestiona logs y errores en todo el sistema.
- **Skills**: Gestión de Logs.
- **Trigger**: En cualquier operación que requiera logging.

## Agent: Tester

- **Purpose**: Ejecuta tests unitarios e integración.
- **Skills**: Todas, con foco en mocks.
- **Trigger**: Después de cambios en código.
