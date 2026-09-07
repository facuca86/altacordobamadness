// game.js — Alta Córdoba Madness
// Cámara top-down FIJA (sin rotación): decisión de diseño para el prototipo,
// prioriza legibilidad de calles/manzanas reales sobre el efecto "cámara rotando"
// de GTA2. Queda documentado como parametrizable en README.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

const keys = {};
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

let world = null;
let mapData = null;

const state = {
  player: { x: 0, y: 0, angle: 0, radius: 10, speed: 0, inVehicle: null, health: 100, punchCooldown: 0 },
  vehicles: [],
  pedestrians: [],
  policeCars: [],
  wanted: 0,
  wantedNoSightTimer: 0,
  camera: { x: 0, y: 0 },
  mission: { id: 'm1', text: '', timer: null, active: true },
  toast: { text: '', t: 0 },
  time: 0,
};

function toast(text, dur = 3.5) { state.toast.text = text; state.toast.t = dur; }

// ---------- Colisión con tiles ----------
function tileTypeAt(px, py) {
  const tx = Math.floor(px / world.tileSize);
  const ty = Math.floor(py / world.tileSize);
  if (tx < 0 || ty < 0 || tx >= world.cols || ty >= world.rows) return TILE.BUILDING;
  return world.grid[ty][tx];
}
function isSolidForFoot(t) { return t === TILE.BUILDING; }
function isRoad(t) { return t === TILE.ROAD; }

// Resuelve colisión circular contra tiles sólidos (para peatón/jugador a pie)
function resolveCircleCollision(entity, nextX, nextY, radius) {
  const t = tileTypeAt(nextX, nextY);
  if (!isSolidForFoot(t)) { entity.x = nextX; entity.y = nextY; return; }
  // intentar deslizar en cada eje por separado
  const tX = tileTypeAt(nextX, entity.y);
  const tY = tileTypeAt(entity.x, nextY);
  if (!isSolidForFoot(tX)) entity.x = nextX;
  if (!isSolidForFoot(tY)) entity.y = nextY;
}

// Vehículos: deben permanecer sobre ROAD (o DOOR, considerado transitable como calle de acceso)
function vehicleCanBeAt(px, py) {
  const t = tileTypeAt(px, py);
  return t === TILE.ROAD || t === TILE.DOOR;
}

// ---------- Setup ----------
async function init() {
  const res = await fetch('map-data.json');
  mapData = await res.json();
  world = buildWorld(mapData);

  state.player.x = world.spawn.x;
  state.player.y = world.spawn.y;

  state.vehicles = world.parkedCars.map(c => ({
    ...c, driver: null, speed: 0, stolen: false,
  }));

  for (let i = 0; i < mapData.pedestrianSpawnCount; i++) spawnPedestrian();

  state.mission = {
    id: 'm1',
    text: `Misión 1: Robá el auto estacionado frente a "Autopartes Los Hermanos P&G".`,
    timer: null,
    active: true,
  };

  requestAnimationFrame(loop);
}

function spawnPedestrian() {
  const t = world.sidewalkTiles[Math.floor(Math.random() * world.sidewalkTiles.length)];
  state.pedestrians.push({
    x: (t.x + 0.5) * world.tileSize,
    y: (t.y + 0.5) * world.tileSize,
    target: null, state: 'wander', timer: 0, speed: 35 + Math.random() * 20,
    color: ['#e0c097', '#c98a5c', '#6b4b3a', '#d9d9d9'][Math.floor(Math.random() * 4)],
  });
}

function pickWanderTarget(p) {
  const t = world.sidewalkTiles[Math.floor(Math.random() * world.sidewalkTiles.length)];
  p.target = { x: (t.x + 0.5) * world.tileSize, y: (t.y + 0.5) * world.tileSize };
}

// ---------- Misiones ----------
function distTo(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function completeMission1() {
  toast('¡Misión cumplida! Un vecino te vio y llamó a la policía…', 4);
  state.wanted = 2;
  spawnPoliceCar(); spawnPoliceCar();
  state.mission = {
    id: 'm2',
    text: `Misión 2: Escapate de la policía y refugiate cerca de "Makario".`,
    timer: null, active: true,
  };
}

function completeMission2() {
  toast('¡Te escondiste a tiempo en Makario! Los patrulleros perdieron el rastro.', 4);
  state.wanted = 0;
  state.policeCars = [];
  state.mission = {
    id: 'm3_pickup',
    text: `Misión 3: Andá a "Miski Mikuy - Sabor a Perú" a buscar el pedido.`,
    timer: null, active: true,
  };
}

function startMission3Delivery() {
  toast('Pedido en mano. ¡Llevalo a FILÉ antes de que se enfríe!', 3);
  state.mission = {
    id: 'm3_deliver',
    text: `Misión 3: Entregá el pedido en "FILÉ – Lomos & Wraps" antes de que termine el timer.`,
    timer: 90, active: true,
  };
}

function completeMission3() {
  toast('¡Entrega completa! Alta Córdoba Madness — demo cumplida.', 5);
  state.mission = { id: 'done', text: 'Todas las misiones completadas. Dá una vuelta libre por el barrio.', timer: null, active: false };
}

function failMission3() {
  toast('El pedido se enfrió… volvé a Miski Mikuy para reintentar.', 4);
  state.mission = {
    id: 'm3_pickup',
    text: `Misión 3: Andá a "Miski Mikuy - Sabor a Perú" a buscar el pedido de nuevo.`,
    timer: null, active: true,
  };
}

function checkMissionTriggers(dt) {
  const m = state.mission;
  if (m.id === 'm2') {
    const makario = world.pois.find(p => p.id === 'makario');
    if (distTo(state.player, makario) < 70) completeMission2();
  } else if (m.id === 'm3_pickup') {
    const miski = world.pois.find(p => p.id === 'miski_mikuy');
    if (distTo(state.player, miski) < 60) startMission3Delivery();
  } else if (m.id === 'm3_deliver') {
    m.timer -= dt;
    const file = world.pois.find(p => p.id === 'file');
    if (distTo(state.player, file) < 60) { completeMission3(); return; }
    if (m.timer <= 0) failMission3();
  }
}

// ---------- Wanted / policía ----------
function spawnPoliceCar() {
  // aparece en un borde de calle lejano al jugador
  const roadTiles = [];
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(Math.random() * world.cols);
    const y = Math.floor(Math.random() * world.rows);
    if (world.grid[y][x] === TILE.ROAD) roadTiles.push({ x, y });
  }
  if (roadTiles.length === 0) return;
  const t = roadTiles[0];
  state.policeCars.push({
    x: (t.x + 0.5) * world.tileSize, y: (t.y + 0.5) * world.tileSize,
    angle: 0, speed: 0,
  });
}

function raiseWanted(amount, reason) {
  state.wanted = Math.min(5, state.wanted + amount);
  if (state.policeCars.length === 0) { spawnPoliceCar(); }
  toast(reason, 2.5);
}

// ---------- Update ----------
function updatePlayer(dt) {
  const p = state.player;
  if (p.inVehicle) {
    const v = p.inVehicle;
    const accel = (keys['w'] || keys['arrowup']) ? 1 : (keys['s'] || keys['arrowdown']) ? -1 : 0;
    const turn = (keys['a'] || keys['arrowleft']) ? -1 : (keys['d'] || keys['arrowright']) ? 1 : 0;
    const maxSpeed = 260, accelRate = 220, friction = 140, turnRate = 2.4;

    v.speed += accel * accelRate * dt;
    v.speed -= Math.sign(v.speed) * friction * dt * (accel === 0 ? 1 : 0.15);
    if (Math.abs(v.speed) < 4 && accel === 0) v.speed = 0;
    v.speed = Math.max(-maxSpeed * 0.5, Math.min(maxSpeed, v.speed));

    const turnFactor = Math.min(1, Math.abs(v.speed) / 80);
    v.angle += turn * turnRate * dt * turnFactor * (v.speed < 0 ? -1 : 1);

    const nx = v.x + Math.cos(v.angle) * v.speed * dt;
    const ny = v.y + Math.sin(v.angle) * v.speed * dt;

    if (vehicleCanBeAt(nx, v.y)) v.x = nx; else v.speed *= 0.2;
    if (vehicleCanBeAt(v.x, ny)) v.y = ny; else v.speed *= 0.2;

    // atropello de peatones
    if (Math.abs(v.speed) > 90) {
      for (const ped of state.pedestrians) {
        if (ped.state === 'hit') continue;
        if (distTo(v, ped) < 22) {
          ped.state = 'hit'; ped.timer = 1.5;
          raiseWanted(2, '¡Atropellaste a alguien! La policía va en camino.');
        }
      }
    }

    p.x = v.x; p.y = v.y; p.angle = v.angle;
  } else {
    const dx = ((keys['d'] || keys['arrowright']) ? 1 : 0) - ((keys['a'] || keys['arrowleft']) ? 1 : 0);
    const dy = ((keys['s'] || keys['arrowdown']) ? 1 : 0) - ((keys['w'] || keys['arrowup']) ? 1 : 0);
    const len = Math.hypot(dx, dy) || 1;
    const speed = 150;
    if (dx || dy) p.angle = Math.atan2(dy, dx);
    const nx = p.x + (dx / len) * speed * dt;
    const ny = p.y + (dy / len) * speed * dt;
    resolveCircleCollision(p, nx, ny, p.radius);

    // subir a auto
    if (keys['e']) {
      keys['e'] = false;
      const near = state.vehicles.find(v => !v.driver && distTo(p, v) < 40);
      if (near) {
        near.driver = 'player';
        if (near.missionCar) near.stolen = true;
        p.inVehicle = near;
        const witnessNear = state.pedestrians.some(ped => distTo(ped, near) < 150 && ped.state === 'wander');
        if (near.stolen) {
          if (witnessNear) raiseWanted(1, '¡Alguien vio que robaste el auto!');
          if (state.mission.id === 'm1') completeMission1();
        }
      }
    }
    // ataque cuerpo a cuerpo simple
    p.punchCooldown -= dt;
    if (keys['f'] && p.punchCooldown <= 0) {
      p.punchCooldown = 0.6;
      const target = state.pedestrians.find(ped => distTo(p, ped) < 30 && ped.state === 'wander');
      if (target) { target.state = 'flee'; target.timer = 4; raiseWanted(1, 'Le pegaste a un vecino. +1 estrella.'); }
    }
  }

  // bajar del auto
  if (p.inVehicle && keys['e'] === false && keys['q']) {
    keys['q'] = false;
    p.inVehicle.driver = null;
    p.x += Math.cos(p.angle + 1.6) * 30;
    p.y += Math.sin(p.angle + 1.6) * 30;
    p.inVehicle = null;
  }
}

function updatePedestrians(dt) {
  for (const ped of state.pedestrians) {
    if (ped.state === 'hit') {
      ped.timer -= dt;
      if (ped.timer <= 0) ped.state = 'flee';
      continue;
    }
    if (ped.state === 'flee') {
      const dx = ped.x - state.player.x, dy = ped.y - state.player.y;
      const d = Math.hypot(dx, dy) || 1;
      const nx = ped.x + (dx / d) * ped.speed * 1.8 * dt;
      const ny = ped.y + (dy / d) * ped.speed * 1.8 * dt;
      resolveCircleCollision(ped, nx, ny, 8);
      ped.timer -= dt;
      if (ped.timer <= 0) ped.state = 'wander';
      continue;
    }
    // wander normal
    if (!ped.target || distTo(ped, ped.target) < 8) pickWanderTarget(ped);
    const dx = ped.target.x - ped.x, dy = ped.target.y - ped.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = ped.x + (dx / d) * ped.speed * dt;
    const ny = ped.y + (dy / d) * ped.speed * dt;
    resolveCircleCollision(ped, nx, ny, 8);
  }
}

function updatePolice(dt) {
  let sawPlayer = false;
  for (const car of state.policeCars) {
    const dx = state.player.x - car.x, dy = state.player.y - car.y;
    const d = Math.hypot(dx, dy) || 1;
    car.angle = Math.atan2(dy, dx);
    const speed = 200;
    // steering simplificado: persigue en línea recta, respeta sólidos de manzana como el jugador a pie
    const nx = car.x + (dx / d) * speed * dt;
    const ny = car.y + (dy / d) * speed * dt;
    if (!isSolidForFoot(tileTypeAt(nx, car.y))) car.x = nx;
    if (!isSolidForFoot(tileTypeAt(car.x, ny))) car.y = ny;
    if (d < 400) sawPlayer = true;
    if (d < 28 && state.wanted > 0) {
      state.wanted = 0;
      state.policeCars = [];
      toast('¡Te agarró la policía! Perdiste las estrellas.', 3);
      break;
    }
  }
  if (state.wanted > 0) {
    if (sawPlayer) state.wantedNoSightTimer = 0;
    else {
      state.wantedNoSightTimer += dt;
      if (state.wantedNoSightTimer > 8) {
        state.wantedNoSightTimer = 0;
        state.wanted = Math.max(0, state.wanted - 1);
        if (state.wanted === 0) state.policeCars = [];
      }
    }
  }
}

function update(dt) {
  state.time += dt;
  updatePlayer(dt);
  updatePedestrians(dt);
  updatePolice(dt);
  checkMissionTriggers(dt);
  if (state.toast.t > 0) state.toast.t -= dt;
}

// ---------- Render ----------
function worldToScreen(x, y) { return { x: x - state.camera.x + canvas.width / 2, y: y - state.camera.y + canvas.height / 2 }; }

function render() {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  state.camera.x = state.player.x;
  state.camera.y = state.player.y;

  const ts = world.tileSize;
  const startCol = Math.max(0, Math.floor((state.camera.x - canvas.width / 2) / ts) - 1);
  const endCol = Math.min(world.cols, Math.ceil((state.camera.x + canvas.width / 2) / ts) + 1);
  const startRow = Math.max(0, Math.floor((state.camera.y - canvas.height / 2) / ts) - 1);
  const endRow = Math.min(world.rows, Math.ceil((state.camera.y + canvas.height / 2) / ts) + 1);

  for (let y = startRow; y < endRow; y++) {
    for (let x = startCol; x < endCol; x++) {
      const t = world.grid[y][x];
      const s = worldToScreen(x * ts, y * ts);
      if (t === TILE.ROAD) ctx.fillStyle = '#3a3a3a';
      else if (t === TILE.SIDEWALK) ctx.fillStyle = '#8a8a82';
      else if (t === TILE.DOOR) ctx.fillStyle = '#c9a24b';
      else ctx.fillStyle = '#5c4a3a';
      ctx.fillRect(s.x, s.y, ts + 1, ts + 1);
    }
  }

  // líneas de carril simples sobre las calles anchas
  ctx.strokeStyle = 'rgba(255,255,0,0.25)';
  ctx.setLineDash([10, 10]);
  ctx.lineWidth = 2;

  // POI labels
  ctx.font = '13px sans-serif';
  for (const poi of world.pois) {
    const s = worldToScreen(poi.x, poi.y);
    if (s.x < -50 || s.x > canvas.width + 50 || s.y < -50 || s.y > canvas.height + 50) continue;
    ctx.fillStyle = '#ffe08a';
    ctx.fillText(poi.name, s.x - 40, s.y - 14);
  }

  // parked / driven cars
  for (const v of state.vehicles) {
    const s = worldToScreen(v.x, v.y);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(v.angle);
    ctx.fillStyle = v.driver === 'player' ? '#e94b4b' : v.color;
    ctx.fillRect(-18, -10, 36, 20);
    ctx.restore();
  }

  // police
  for (const car of state.policeCars) {
    const s = worldToScreen(car.x, car.y);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(car.angle);
    ctx.fillStyle = Math.floor(state.time * 4) % 2 === 0 ? '#3a6fd9' : '#1a1a1a';
    ctx.fillRect(-18, -10, 36, 20);
    ctx.restore();
  }

  // pedestrians
  for (const p of state.pedestrians) {
    const s = worldToScreen(p.x, p.y);
    ctx.fillStyle = p.state === 'flee' || p.state === 'hit' ? '#ff5555' : p.color;
    ctx.beginPath(); ctx.arc(s.x, s.y, 7, 0, Math.PI * 2); ctx.fill();
  }

  // player (si no está en auto)
  if (!state.player.inVehicle) {
    const s = worldToScreen(state.player.x, state.player.y);
    ctx.fillStyle = '#4be0a0';
    ctx.beginPath(); ctx.arc(s.x, s.y, state.player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#0a3a2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + Math.cos(state.player.angle) * 16, s.y + Math.sin(state.player.angle) * 16);
    ctx.stroke();
  }

  renderHUD();
}

function renderHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(10, 10, 340, 70);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('ALTA CÓRDOBA MADNESS', 20, 30);
  ctx.font = '13px sans-serif';
  let stars = '';
  for (let i = 0; i < 5; i++) stars += i < state.wanted ? '★' : '☆';
  ctx.fillStyle = state.wanted > 0 ? '#ffd24b' : '#888';
  ctx.fillText('Búsqueda: ' + stars, 20, 50);
  ctx.fillStyle = '#cfefff';
  ctx.fillText(state.mission.text, 20, 68, 320);
  if (state.mission.timer != null) {
    ctx.fillStyle = state.mission.timer < 15 ? '#ff6b6b' : '#fff';
    ctx.fillText('Tiempo: ' + Math.max(0, state.mission.timer).toFixed(1) + 's', 260, 30);
  }

  if (state.toast.t > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const w = Math.min(600, canvas.width - 40);
    ctx.fillRect(canvas.width / 2 - w / 2, canvas.height - 80, w, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(state.toast.text, canvas.width / 2 - w / 2 + 12, canvas.height - 55);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, canvas.height - 46, 480, 36);
  ctx.fillStyle = '#ccc';
  ctx.font = '12px sans-serif';
  ctx.fillText('WASD/Flechas: moverse · E: subir al auto · Q: bajar · F: golpe', 20, canvas.height - 24);
}

// ---------- Loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

init();
