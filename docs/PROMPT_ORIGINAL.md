# PROMPT: Desarrollo de "Alta Córdoba Madness"

## Rol y objetivo
Sos un desarrollador de videojuegos senior especializado en juegos top-down 2D estilo **GTA 2** (Rockstar, 1999): cámara cenital, vehículos que se manejan por calles reales (no por un scroll libre sin restricciones), colisiones con edificios/manzanas, peatones, caos, misiones cortas y sistema de "busqueda/wanted level".

Tu tarea es construir el juego **Alta Córdoba Madness**, ambientado en el barrio Alta Córdoba (Córdoba, Argentina), replicando la **traza real de calles y manzanas** de la zona indicada más abajo. NO uses una grilla genérica ni una imagen de fondo estática con sprites encima: el mapa debe construirse como **datos** (tilemap o vector de manzanas + calles con ancho, orientación y nombre), de forma que la lógica de colisión, IA de tránsito y pathfinding respeten la forma real de las cuadras.

## Referencia geográfica (a partir de captura de Google Maps del barrio)
Reconstruí la traza con estas calles y su orientación relativa real:

**Calles con orientación Norte-Sur (verticales en el plano):**
- Jujuy
- José Antonio de Sucre
- Tucumán
- Gral. Paz (arteria principal, más ancha, cruza toda la zona)
- Av. Juan B. Justo (avenida ancha, límite este del barrio, con recorrido de colectivos)

**Calles con orientación Este-Oeste (horizontales en el plano):**
- Dr. Manuel Lucero
- Juan A. Sarachaga
- Jaime Balmes
- José Baigorri
- Antonio del Viso
- Padre F. (nombre parcial visible, ajustar/inventar continuidad coherente si hace falta)

**Manzanas:** cuadras rectangulares estándar de barrio tradicional cordobés, aprox. 100x100 m de lado en escala de juego, con calles de doble o simple mano. Gral. Paz y Av. Juan B. Justo deben tener mayor ancho de calzada que las internas (Jujuy, Sucre, Tucumán, Sarachaga, Balmes, Baigorri).

**Puntos de interés (POIs) a ubicar sobre el mapa, cada uno como edificio/local interactuable:**
- "Casa" — punto de spawn del jugador, ubicado sobre Gral. Paz cerca de Dr. Manuel Lucero.
- "La Rueda" (restaurante) — esquina cerca de Gral. Paz y zona norte.
- "Autopartes Los Hermanos P&G" — sobre Gral. Paz, cerca de Diag. Ica.
- "Makario" (bar) — sobre Jujuy.
- "FILÉ – Lomos & Wraps" (restaurante) — cerca de Jaime Balmes y José Baigorri.
- "Miski Mikuy - Sabor a Perú" (restaurante) — esquina sur, cerca de Antonio del Viso.
- Paradas de colectivo dispersas sobre Gral. Paz y Av. Juan B. Justo (usar como cobertura/obstáculo o punto de eventos aleatorios con peatones).

Estos POIs deben ser el punto de partida de misiones, no simple decorado (ej.: "robá el auto estacionado frente a Autopartes Los Hermanos", "escapá de la policía y refugiate cerca de Makario", "entregá el paquete en FILÉ antes de que termine el timer").

## Requisitos técnicos del mapa
1. Modelar el mapa como **grilla de tiles** (ej. 32x32 o 64x64 px) donde cada tile es: calle, vereda, manzana/edificio, esquina.
2. Las calles deben tener **carriles definidos** con dirección de circulación (podés simplificar a doble mano en todas para el prototipo, pero dejarlo parametrizable).
3. Los edificios de cada manzana deben tener **colisión sólida real** (no se puede atravesar caminando ni en auto), con al menos 1-2 puertas/entradas relevantes en los POIs listados.
4. Las esquinas deben permitir **giros de 90°** fluidos para los vehículos (ni el jugador ni la IA deben "flotar" fuera de calle).
5. Generar el layout completo del barrio como **JSON o array de datos** (lista de calles con nombre, orientación, ancho, coordenadas de inicio/fin; lista de manzanas como polígonos/rectángulos; lista de POIs con nombre, tipo y coordenadas), separado de la lógica de renderizado, para que se pueda ajustar sin tocar el código del motor.

## Mecánicas estilo GTA 2
- Cámara top-down con leve rotación o fija (elegir una, documentar la decisión).
- Vehículos robables: el jugador puede bajarse y subirse a autos estacionados en las calles/manzanas.
- Físicas de manejo simples tipo arcade (derrape, choques con daño visual/funcional).
- Peatones con IA básica caminando por veredas, reaccionando al jugador (huyen, llaman a la policía si hay violencia).
- Sistema de "estrellas"/nivel de búsqueda policial que escala con el caos generado.
- Misiones cortas dadas desde cabinas telefónicas o los POIs marcados (recolectar, perseguir, entregar, destruir).
- Sonido/feedback de choques y disparos simple (placeholder si no hay assets de audio).

## Restricciones explícitas (muy importante)
- NO usar la captura de mapa como imagen de fondo estática con el juego "pegado" encima.
- NO generar una cuadrícula pareja/genérica ignorando los nombres y la forma real de las calles listadas arriba.
- El mapa final debe ser **reconocible** como esa porción de Alta Córdoba: mismas calles, mismo orden relativo, mismas intersecciones aproximadas, mismos POIs ubicados en su posición relativa correcta.
- Priorizar que el prototipo sea jugable (moverse, robar un auto, chocar, generar búsqueda policial) antes que el pulido gráfico.

## Entregable esperado
1. Código fuente organizado (motor + datos de mapa separados).
2. Archivo de datos del mapa (JSON) con calles, manzanas y POIs como se especificó.
3. Un build o instrucciones claras para correr el prototipo localmente.
4. Breve documento explicando qué mecánicas de GTA 2 se implementaron y cuáles quedan pendientes.

Nombre del juego a mostrar en pantalla de título: **ALTA CÓRDOBA MADNESS**.

