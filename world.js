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

// Desplaza una copia de un eje ya construido (mismas calles/manzanas, todo corrido "offsetTiles" hacia abajo).
function shiftAxis(axis, offsetTiles) {
  return {
    bands: axis.bands.map(b => ({ ...b, start: b.start + offsetTiles })),
    totalTiles: axis.totalTiles + offsetTiles,
  };
}

// Pinta una manzana (vereda + interior) en la grilla. `rb` puede extenderse fuera de los
// límites de la grilla (arriba o abajo) -- se clampea automáticamente al pintar, así que
// sirve tanto para manzanas reales como para el "fleco" decorativo del norte/sur (una
// manzana más, cortada a la mitad por el borde del mundo).
function paintBlock(grid, rows, cb, rb) {
  const yFrom = Math.max(0, rb.start);
  const yTo = Math.min(rows, rb.start + rb.width);
  for (let x = cb.start; x < cb.start + cb.width; x++) {
    for (let y = yFrom; y < yTo; y++) {
      const onEdge = (x === cb.start || x === cb.start + cb.width - 1 ||
                       y === rb.start || y === rb.start + rb.width - 1);
      grid[y][x] = onEdge ? TILE.SIDEWALK : TILE.BUILDING;
    }
  }
}

// Pinta una calle diagonal como ROAD sobre un segmento de línea (x1,y1)-(x2,y2), en
// coordenadas de tile, con cierto ancho. Le agrega un borde de 1 tile de SIDEWALK a los
// costados (sin pisar ROAD existente). No respeta la grilla ortogonal -- se come manzanas
// a su paso, que es justamente el comportamiento real de una diagonal.
function paintDiagonalStreet(grid, cols, rows, x1, y1, x2, y2, widthTiles) {
  const halfW = widthTiles / 2;
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - halfW - 1));
  const maxX = Math.min(cols - 1, Math.ceil(Math.max(x1, x2) + halfW + 1));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - halfW - 1));
  const maxY = Math.min(rows - 1, Math.ceil(Math.max(y1, y2) + halfW + 1));
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy || 1;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx, cy = y1 + t * dy;
      const dist = Math.hypot(px - cx, py - cy);
      if (dist <= halfW) grid[y][x] = TILE.ROAD;
      else if (dist <= halfW + 1 && grid[y][x] !== TILE.ROAD) grid[y][x] = TILE.SIDEWALK;
    }
  }
}

function buildWorld(mapData) {
  const tileSize = mapData.tileSize;
  const colAxis = buildAxis(mapData.verticalStreets, mapData.blockSizeTiles);

  // "Fleco" visual: dejamos ver una manzana más (cortada por el borde del mundo) al norte
  // y al sur del área jugable, para que no corte en seco contra un borde vacío.
  const FRINGE = mapData.edgeFringeTiles || 0;
  const rowAxisWestRaw = buildAxis(mapData.horizontalStreets, mapData.blockSizeTiles);
  const rowAxisWest = shiftAxis(rowAxisWestRaw, FRINGE);

  // "codito": a partir de cierta calle vertical (ej. Gral. Paz), TODAS las calles horizontales
  // se desfasan hacia el sur en bloque. El lado OESTE de esa calle es el que queda desfasado;
  // el lado ESTE (donde está la Casa) usa el eje base.
  const eastZone = mapData.eastZone || { splitAtVerticalStreetIndex: -1, rowOffsetTiles: 0 };
  const rowOffset = eastZone.rowOffsetTiles || 0;
  const rowAxisEast = shiftAxis(rowAxisWest, rowOffset);

  const cols = colAxis.totalTiles;
  const rows = Math.max(rowAxisWest.totalTiles, rowAxisEast.totalTiles) + FRINGE;

  // grilla por defecto: ROAD en todos lados, después "pintamos" las manzanas encima
  const grid = new Array(rows);
  for (let y = 0; y < rows; y++) grid[y] = new Array(cols).fill(TILE.ROAD);

  const colBlocks = colAxis.bands.filter(b => b.type === 'block'); // index = col de manzana

  function rowAxisForCol(colBlockIndex) {
    return (colBlockIndex < eastZone.splitAtVerticalStreetIndex) ? rowAxisEast : rowAxisWest;
  }
  function rowBlocksForCol(colBlockIndex) {
    return rowAxisForCol(colBlockIndex).bands.filter(b => b.type === 'block');
  }

  // Pintar cada manzana real
  for (let j = 0; j < colBlocks.length; j++) {
    const cb = colBlocks[j];
    for (const rb of rowBlocksForCol(j)) paintBlock(grid, rows, cb, rb);
  }

  // Pintar el fleco norte/sur: una manzana más (misma geometría que las reales, vereda +
  // interior), ubicada justo antes de la primera calle y justo después de la última, cortada
  // por el borde del mundo -- por eso se ve "parcial" en vez de un relleno genérico.
  if (FRINGE > 0) {
    for (let j = 0; j < colBlocks.length; j++) {
      const cb = colBlocks[j];
      const axis = rowAxisForCol(j);
      const streets = axis.bands.filter(b => b.type === 'street');
      const firstStreet = streets[0], lastStreet = streets[streets.length - 1];
      const northFringeBlock = { start: firstStreet.start - mapData.blockSizeTiles, width: mapData.blockSizeTiles };
      const southFringeBlock = { start: lastStreet.start + lastStreet.width, width: mapData.blockSizeTiles };
      paintBlock(grid, rows, cb, northFringeBlock);
      paintBlock(grid, rows, cb, southFringeBlock);
    }
  }

  // Diagonales: se pintan por encima de todo lo anterior (calles ortogonales incluidas),
  // en coordenadas de tile absolutas.
  for (const d of (mapData.diagonalStreets || [])) {
    paintDiagonalStreet(grid, cols, rows, d.x1, d.y1, d.x2, d.y2, d.widthTiles);
  }

  // Helper: centro en px de una manzana (col,row) de manzana
  function blockCenterPx(col, row) {
    const cb = colBlocks[col];
    const rb = rowBlocksForCol(col)[row];
    return {
      x: (cb.start + cb.width / 2) * tileSize,
      y: (rb.start + rb.width / 2) * tileSize,
    };
  }

  // Helper: posición de puerta sobre una manzana (col,row).
  // side: 'north'|'south'|'east'|'west' -> mitad de ese lado (+ `offset` en tiles para separar
  //       dos locales del mismo lado). 'corner-ne'|'corner-nw'|'corner-se'|'corner-sw' -> la
  //       esquina exacta de la manzana (para POIs que están literalmente en una esquina).
  function doorTile(col, row, side, offset = 0) {
    const cb = colBlocks[col];
    const rb = rowBlocksForCol(col)[row];
    let tx, ty;
    if (side.startsWith('corner-')) {
      const dir = side.slice(7);
      tx = dir.includes('e') ? cb.start + cb.width - 1 : cb.start;
      ty = dir.includes('n') ? rb.start : rb.start + rb.width - 1;
      return { tx, ty };
    }
    if (side === 'north') { tx = cb.start + Math.floor(cb.width / 2) + offset; ty = rb.start; }
    else if (side === 'south') { tx = cb.start + Math.floor(cb.width / 2) + offset; ty = rb.start + rb.width - 1; }
    else if (side === 'west') { tx = cb.start; ty = rb.start + Math.floor(rb.width / 2) + offset; }
    else { tx = cb.start + cb.width - 1; ty = rb.start + Math.floor(rb.width / 2) + offset; } // east
    tx = Math.max(cb.start + 1, Math.min(cb.start + cb.width - 2, tx));
    ty = Math.max(rb.start + 1, Math.min(rb.start + rb.width - 2, ty));
    return { tx, ty };
  }

  // Carve doors for POIs
  const poiWorld = [];
  for (const poi of mapData.pois) {
    const { tx, ty } = doorTile(poi.col, poi.row, poi.side, poi.offset || 0);
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
    const { tx, ty } = doorTile(pc.col, pc.row, pc.side, pc.offset || 0);
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

  // Carteles de calle. Las verticales son una sola banda recta. Las horizontales tienen
  // "codito": dos tramos (oeste/este) con distinta altura. Las diagonales se etiquetan aparte.
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
  const splitStreetBand = colAxis.bands.find(b => b.type === 'street' && b.index === eastZone.splitAtVerticalStreetIndex);
  const splitXPx = splitStreetBand ? splitStreetBand.start * tileSize : cols * tileSize;
  for (const b of rowAxisWest.bands) {
    if (b.type !== 'street') continue;
    const baseBand = b;
    const shiftedBand = rowAxisEast.bands.find(eb => eb.type === 'street' && eb.index === b.index);
    const name = mapData.horizontalStreets[b.index].name;
    streetLabels.push({
      name, axis: 'horizontal',
      centerPx: (shiftedBand.start + shiftedBand.width / 2) * tileSize,
      from: 0, to: splitXPx,
    });
    if (rowOffset !== 0) {
      streetLabels.push({
        name, axis: 'horizontal',
        centerPx: (baseBand.start + baseBand.width / 2) * tileSize,
        from: splitXPx, to: cols * tileSize,
      });
    }
  }
  for (const d of (mapData.diagonalStreets || [])) {
    streetLabels.push({
      name: d.name, axis: 'diagonal',
      x1: d.x1 * tileSize, y1: d.y1 * tileSize, x2: d.x2 * tileSize, y2: d.y2 * tileSize,
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
