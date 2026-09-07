# Alta Córdoba Madness

Prototipo top-down 2D estilo GTA2 ambientado en el barrio Alta Córdoba (Córdoba, Argentina),
con la traza de calles y manzanas construida como **datos** (`map-data.json`), no como imagen
de fondo. El motor (`world.js`) genera el tilemap real (calles, veredas, manzanas, puertas de
POIs) a partir de esos datos; `game.js` es toda la lógica de juego y render.

## Cómo correrlo

El juego hace `fetch('map-data.json')`, así que necesita servirse por HTTP (no funciona abriendo
`index.html` directo por `file://` debido a las restricciones CORS del navegador).

```bash
cd altacordobamadness
python3 -m http.server 8000
# abrir http://localhost:8000
```

También funciona tal cual desplegado en **GitHub Pages** (Settings → Pages → branch `main` / raíz).

## Controles

- **WASD / flechas**: moverse a pie o manejar
- **E**: subir a un auto cercano
- **Q**: bajar del auto
- **F**: golpe cuerpo a cuerpo (a pie)

## Estructura

- `map-data.json` — calles (nombre, orientación, ancho), tamaño de manzana, POIs con su lado de
  acceso, paradas de colectivo y autos estacionados. Editable sin tocar el motor.
- `world.js` — convierte esos datos en una grilla de tiles (`ROAD`, `SIDEWALK`, `BUILDING`, `DOOR`),
  calcula posiciones en píxeles de POIs, autos y paradas.
- `game.js` — bucle de juego, físicas simples, colisiones, IA de peatones/policía, sistema de
  búsqueda (wanted level) y las 3 misiones.
- `index.html` — pantalla de título + canvas.

## Decisiones de diseño

- **Cámara**: top-down fija, sin rotación (a diferencia de GTA2 que rota levemente). Se prioriza
  la legibilidad de la traza real de calles. Queda como parámetro fácil de cambiar en `render()`
  si se quiere agregar rotación de cámara más adelante.
- **Manzanas**: 16x16 tiles de 32px (≈ escala reducida respecto a los 100x100m reales, para que
  el prototipo sea ágil). `blockSizeTiles` es configurable en `map-data.json`.
- **Calles**: Gral. Paz y Av. Juan B. Justo tienen 4 tiles de ancho; las internas (Jujuy, Sucre,
  Tucumán, Sarachaga, Balmes, Baigorri, del Viso, Padre F.) tienen 2.

## Mecánicas implementadas

- Movimiento a pie con colisión sólida contra manzanas/edificios.
- Manejo arcade simple (aceleración, fricción, giro dependiente de velocidad, sin drift real).
- Subir/bajar de autos estacionados; colisión de vehículos limitada a tiles de calle.
- Atropello de peatones (detecta impacto a velocidad > umbral).
- Peatones con estados: paseo (waypoints aleatorios sobre veredas), huida, "atropellado".
- Sistema de estrellas (wanted level 0–5): sube al robar auto visto por un peatón, atropellar o
  pegarle a alguien; baja con el tiempo si no hay policía cerca; llegar a 0 si te atrapan.
- Policía: spawnea y persigue en línea recta al jugador cuando hay wanted > 0.
- 3 misiones encadenadas ancladas a los POIs reales del prompt:
  1. Robar el auto frente a Autopartes Los Hermanos P&G.
  2. Escapar y refugiarse cerca de Makario.
  3. Buscar el pedido en Miski Mikuy y entregarlo en FILÉ antes de que termine el timer (90s).
- HUD con estrellas, texto de misión, timer y toasts de eventos.

## Pendiente / simplificado (a propósito, para mantener el prototipo jugable)

- Pathfinding real de policía y peatones (hoy persiguen/caminan en línea recta, no respetan
  carriles ni giros de 90° estrictos).
- Carriles con sentido de circulación real (hoy doble mano en todas las calles, tal como permite
  el prompt original para el prototipo).
- Daño visual/funcional de vehículos al chocar (hoy solo se frena la velocidad).
- Armas de fuego (solo golpe cuerpo a cuerpo).
- Minimapa.
- Sonido/efectos (sin assets de audio en este prototipo).
- Diag. Ica y "Padre F." se mantuvieron con nombre aproximado tal como llegaron incompletos en
  la referencia original; ajustar en `map-data.json` si tenés el nombre exacto.

## Créditos de nomenclatura

Nombres de calles y POIs tomados tal cual del pedido original; las posiciones relativas entre
calles y manzanas respetan el orden indicado, pero no son coordenadas geográficas reales (no se
usó ninguna API de mapas), así que la escala/proporción exacta es aproximada.
