// world.js — construye la grilla de tiles del barrio a partir de map-data.json
// Tile types
const TILE = {
  ROAD: 0,
  SIDEWALK: 1,
  BUILDING: 2,
  DOOR: 3,
};

// Genera la secuencia de "bandas" (calle/manzana) a lo largo de un eje,
// devuelve el offset en tiles donde arranca cada banda + su ancho.
function buildAxis(streets, blockSizeTiles) {
  const bands = []; // {type:'street'|'block', name, start, width, index}
  let cursor = 0;
  let blockIndex = 0;
  for (let i = 0; i < streets.length; i++) {
    bands.push({ type: 'street', name: streets[i].name, start: cursor, width: streets[i].widthTiles, index: i });
    cursor += streets[i].widthTiles;
    if (i < streets.length - 1) {
      bands.push({ type: 'block', start: cursor, width: blockSizeTiles, index: blockIndex });
      cursor += blockSizeTiles;
      blockIndex++;
    }
  }
  return { bands, totalTiles: cursor };
}

function buildWorld(mapData) {
  const tileSize = mapData.tileSize;
  const colAxis = buildAxis(mapData.verticalStreets, mapData.blockSizeTiles);
  const rowAxis = buildAxis(mapData.horizontalStreets, mapData.blockSizeTiles);

  const cols = colAxis.totalTiles;
  const rows = rowAxis.totalTiles;

  // grilla por defecto: ROAD en todos lados, después "pintamos" las manzanas encima
  const grid = new Array(rows);
  for (let y = 0; y < rows; y++) grid[y] = new Array(cols).fill(TILE.ROAD);

  const colBlocks = colAxis.bands.filter(b => b.type === 'block'); // index = col de manzana
  const rowBlocks = rowAxis.bands.filter(b => b.type === 'block'); // index = row de manzana

  // Pintar cada manzana: anillo de vereda (1 tile) + interior BUILDING sólido
  for (const cb of colBlocks) {
    for (const rb of rowBlocks) {
      for (let x = cb.start; x < cb.start + cb.width; x++) {
        for (let y = rb.start; y < rb.start + rb.width; y++) {
          const onEdge = (x === cb.start || x === cb.start + cb.width - 1 ||
                           y === rb.start || y === rb.start + rb.width - 1);
          grid[y][x] = onEdge ? TILE.SIDEWALK : TILE.BUILDING;
        }
      }
    }
  }

  // Helper: centro en px de una manzana (col,row) de manzana
  function blockCenterPx(col, row) {
    const cb = colBlocks[col], rb = rowBlocks[row];
    return {
      x: (cb.start + cb.width / 2) * tileSize,
      y: (rb.start + rb.width / 2) * tileSize,
    };
  }

  // Helper: posición de puerta sobre un lado de la manzana (col,row)
  function doorTile(col, row, side) {
    const cb = colBlocks[col], rb = rowBlocks[row];
    let tx, ty;
    if (side === 'north') { tx = cb.start + Math.floor(cb.width / 2); ty = rb.start; }
    else if (side === 'south') { tx = cb.start + Math.floor(cb.width / 2); ty = rb.start + rb.width - 1; }
    else if (side === 'west') { tx = cb.start; ty = rb.start + Math.floor(rb.width / 2); }
    else { tx = cb.start + cb.width - 1; ty = rb.start + Math.floor(rb.width / 2); } // east
    return { tx, ty };
  }

  // Carve doors for POIs
  const poiWorld = [];
  for (const poi of mapData.pois) {
    const { tx, ty } = doorTile(poi.col, poi.row, poi.side);
    grid[ty][tx] = TILE.DOOR;
    poiWorld.push({
      ...poi,
      x: (tx + 0.5) * tileSize,
      y: (ty + 0.5) * tileSize,
    });
  }

  // Parked cars: colocarlos en la banda de calle adyacente al lado indicado de la manzana
  const parkedCarsWorld = [];
  for (const pc of mapData.parkedCars) {
    const { tx, ty } = doorTile(pc.col, pc.row, pc.side);
    // empujar el auto un par de tiles hacia la calle (fuera de la vereda)
    let cx = tx, cy = ty;
    if (pc.side === 'north') cy -= 2;
    else if (pc.side === 'south') cy += 2;
    else if (pc.side === 'west') cx -= 2;
    else cx += 2;
    parkedCarsWorld.push({
      id: pc.id,
      x: (cx + 0.5) * tileSize,
      y: (cy + 0.5) * tileSize,
      color: pc.color,
      missionCar: !!pc.missionCar,
      angle: (pc.side === 'north' || pc.side === 'south') ? 0 : Math.PI / 2,
    });
  }

  // Bus stops -> puntos decorativos / cobertura
  const busStopsWorld = (mapData.busStops || []).map(bs => {
    const p = blockCenterPx(bs.col, bs.row);
    return { x: p.x, y: p.y, street: bs.street };
  });

  // Puntos de sidewalk para spawnear/pasear peatones
  const sidewalkTiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === TILE.SIDEWALK) sidewalkTiles.push({ x, y });
    }
  }

  const spawn = poiWorld.find(p => p.isPlayerSpawn) || { x: (cols / 2) * tileSize, y: (rows / 2) * tileSize };

  // Carteles de calle: cada calle es una banda que atraviesa todo el mapa en su eje.
  // Guardamos su nombre, eje, la línea central en px, y el rango [desde,hasta] en px
  // que cubre (para saber dónde dibujar el cartel repetido).
  const streetLabels = [];
  for (const b of colAxis.bands) {
    if (b.type !== 'street') continue;
    streetLabels.push({
      name: mapData.verticalStreets[b.index].name,
      axis: 'vertical',
      centerPx: (b.start + b.width / 2) * tileSize,
      from: 0, to: rows * tileSize,
    });
  }
  for (const b of rowAxis.bands) {
    if (b.type !== 'street') continue;
    streetLabels.push({
      name: mapData.horizontalStreets[b.index].name,
      axis: 'horizontal',
      centerPx: (b.start + b.width / 2) * tileSize,
      from: 0, to: cols * tileSize,
    });
  }

  return {
    tileSize, cols, rows, grid,
    pois: poiWorld,
    parkedCars: parkedCarsWorld,
    busStops: busStopsWorld,
    sidewalkTiles,
    streetLabels,
    spawn: { x: spawn.x, y: spawn.y },
    pixelWidth: cols * tileSize,
    pixelHeight: rows * tileSize,
  };
}
