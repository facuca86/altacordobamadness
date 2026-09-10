# Alta Córdoba Madness

Prototipo top-down 2D estilo GTA2 ambientado en el barrio Alta Córdoba (Córdoba, Argentina),
con la traza de calles y manzanas construida como **datos** (`map-data.json`), no como imagen
de fondo. El motor (`world.js`) genera el tilemap real (calles, veredas, manzanas, puertas de
POIs) a partir de esos datos; `game.js` es toda la lógica de juego y render.

## Cómo correrlo

Funciona tanto abriendo `index.html` directo con doble clic (`file://`) como sirviéndolo por HTTP
o desplegado en **GitHub Pages** (Settings → Pages → branch `main` / raíz). El juego intenta
`fetch('map-data.json')` primero; si el navegador lo bloquea por CORS (típico al abrir con
`file://`), cae automáticamente a la copia embebida en `map-data-embedded.js`, así que no hace
falta levantar un servidor para probarlo. Si preferís servirlo igual:

```bash
cd altacordobamadness
python3 -m http.server 8000
# abrir http://localhost:8000
```

**Importante:** si editás `map-data.json`, actualizá también `map-data-embedded.js` (o
regeneralo con el snippet de Python de más abajo) para que ambos queden sincronizados.

```bash
python3 -c "
import json
data = json.load(open('map-data.json'))
js = 'const MAP_DATA_EMBEDDED = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';'
open('map-data-embedded.js', 'w', encoding='utf-8').write(js)
"
```

Si algo falla al iniciar (dato de mapa inválido, etc.), ahora se muestra un mensaje de error en
rojo sobre el canvas en vez de quedar la pantalla negra sin ninguna indicación.

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
- `map-data-embedded.js` — copia idéntica de `map-data.json` como objeto JS, usada como fallback
  cuando el `fetch` del JSON falla (por ejemplo al abrir el juego con doble clic sin servidor).
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
  Tucumán, Rivera Indarte, Sarachaga, Balmes, Baigorri, del Viso, Cervantes, Castelar) tienen 2.
- **"Codito" en Gral. Paz** (`eastZone` en `map-data.json`): en la realidad, las calles
  horizontales (Castelar, Cervantes, Lucero, Sarachaga, etc.) no cruzan Gral. Paz en línea
  recta — toda la trama de manzanas al este de Gral. Paz arranca desfasada hacia el sur. Esto
  se modela con dos ejes de filas (`rowAxisWest` / `rowAxisEast` en `world.js`): las columnas de
  manzana con índice ≥ `eastZone.splitAtVerticalStreetIndex` usan el eje corrido
  `eastZone.rowOffsetTiles` tiles hacia abajo. Gral. Paz, al ser una banda de calle continua de
  punta a punta, actúa como el "codo" de conexión entre ambos tramos sin necesitar tiles
  especiales. El valor de `rowOffsetTiles` es aproximado — ajustalo si tenés la medida real.
  Limitación conocida: las columnas al oeste de Gral. Paz no llegan hasta el borde sur del mapa
  (que ahora es más alto por el desfasaje del lado este), así que esa franja queda como calle
  "vacía" en el borde inferior de las columnas oeste — no afecta la jugabilidad cerca del barrio
  real, pero es visualmente un poco raro si explorás muy al sur por el lado oeste.

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
- **Calles diagonales reales** (`diagonalStreets` en `map-data.json`): Antonio del Viso e Isabel
  la Católica se pintan como segmentos de línea a cualquier ángulo directamente sobre la grilla
  de tiles (`paintDiagonalStreet()` en `world.js`, por distancia punto-segmento), comiéndose
  manzanas a su paso como en la realidad — sin necesitar un motor de colisión por polígonos.
  Antonio del Viso es una diagonal leve (límite sur real); Isabel la Católica tiene un ángulo
  más fuerte y termina fundiéndose con José Baigorri, que ahora es el límite sur de la grilla
  ortogonal.
- **Fleco norte/sur con geometría real**: en vez de un relleno genérico, se pinta una manzana
  más (misma vereda + interior que las reales) cortada por el borde del mundo — se ve angosta
  y prolija, no un vacío ancho.
- **POIs en esquina real** (`side: "corner-ne"|"corner-nw"|"corner-se"|"corner-sw"`): ubica el
  POI en el tile exacto de la esquina de la manzana, no en el medio de un lado. La Rueda usa
  este modo (esquina Castelar/Juan B. Justo).
- Traza corregida contra Google Maps real: Rivera Indarte, Miguel de Cervantes y Emilio Castelar
  (límite norte real) agregadas; Casa reubicada con la puerta hacia Manuel Lucero; Makario
  reubicado a Cervantes/Sucre; FILÉ a Tucumán cerca de Baigorri; Autopartes a Juan B. Justo
  entre Castelar y Cervantes.

## Pendiente / simplificado (a propósito, para mantener el prototipo jugable)

- Pathfinding real de policía y peatones (hoy persiguen/caminan en línea recta, no respetan
  carriles ni giros de 90° estrictos).
- Carriles con sentido de circulación real (hoy doble mano en todas las calles, tal como permite
  el prompt original para el prototipo).
- Daño visual/funcional de vehículos al chocar (hoy solo se frena la velocidad).
- Armas de fuego (solo golpe cuerpo a cuerpo).
- Minimapa.
- Sonido/efectos (sin assets de audio en este prototipo).
- **Rotación global de la grilla**: la trama ortogonal principal se ve levemente rotada en
  Google Maps real (no es exactamente N-S/E-O). El motor no aplica esa rotación todavía —
  las diagonales sí están resueltas (ver arriba), pero la grilla en sí queda "derecha".
  Se podría agregar con una única matriz de rotación al dibujar, sin tocar la lógica interna.
- Las coordenadas de `diagonalStreets` (`x1,y1,x2,y2`, en tiles) y los offsets de
  `eastZone.rowOffsetTiles` / `edgeFringeTiles` están puestos a ojo, anclados a las calles
  ortogonales reales — ajustalos si tenés medidas más precisas.

## Créditos de nomenclatura

Nombres de calles y POIs tomados tal cual del pedido original; las posiciones relativas entre
calles y manzanas respetan el orden indicado, pero no son coordenadas geográficas reales (no se
usó ninguna API de mapas), así que la escala/proporción exacta es aproximada.
