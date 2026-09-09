const MAP_DATA_EMBEDDED = {
  "tileSize": 32,
  "blockSizeTiles": 16,
  "edgeFringeTiles": 10,
  "verticalStreets": [
    {
      "name": "Jujuy",
      "widthTiles": 2
    },
    {
      "name": "José Antonio de Sucre",
      "widthTiles": 2
    },
    {
      "name": "Tucumán",
      "widthTiles": 2
    },
    {
      "name": "Gral. Paz",
      "widthTiles": 4
    },
    {
      "name": "Rivera Indarte",
      "widthTiles": 2
    },
    {
      "name": "Av. Juan B. Justo",
      "widthTiles": 4
    }
  ],
  "horizontalStreets": [
    {
      "name": "Emilio Castelar",
      "widthTiles": 2
    },
    {
      "name": "Miguel de Cervantes",
      "widthTiles": 2
    },
    {
      "name": "Dr. Manuel Lucero",
      "widthTiles": 2
    },
    {
      "name": "Juan A. Sarachaga",
      "widthTiles": 2
    },
    {
      "name": "Jaime Balmes",
      "widthTiles": 2
    },
    {
      "name": "José Baigorri",
      "widthTiles": 2
    },
    {
      "name": "Antonio del Viso",
      "widthTiles": 2
    }
  ],
  "_comment_grid": "6 calles verticales -> 5 columnas de manzana (col 0..4). 7 calles horizontales -> 6 filas de manzana (row 0..5). Antonio del Viso es el límite sur real (se sacó 'Padre F.', que en realidad cae al este de Juan B. Justo y fuera del área mapeada).",
  "_comment_diagonales": "Isabel la Católica, José Baigorri y Antonio del Viso son diagonales en la realidad (no calles perpendiculares rectas). El motor actual no soporta calles diagonales -- se mantienen como bandas horizontales rectas, una simplificación deliberada. Isabel la Católica ni siquiera está modelada como calle propia todavía.",
  "eastZone": {
    "_comment": "'Codito' real en Gral. Paz (índice 3 en verticalStreets): el lado OESTE de Gral. Paz queda desfasado hacia el sur respecto del lado ESTE (donde está la Casa). rowOffsetTiles es aproximado.",
    "splitAtVerticalStreetIndex": 3,
    "rowOffsetTiles": 8
  },
  "pois": [
    {
      "id": "casa",
      "name": "Casa",
      "type": "spawn",
      "col": 3,
      "row": 2,
      "side": "north",
      "isPlayerSpawn": true
    },
    {
      "id": "la_rueda",
      "name": "La Rueda",
      "type": "restaurant",
      "col": 4,
      "row": 0,
      "side": "east",
      "offset": -4
    },
    {
      "id": "autopartes",
      "name": "Autopartes Los Hermanos P&G",
      "type": "shop",
      "col": 4,
      "row": 0,
      "side": "east",
      "offset": 4
    },
    {
      "id": "makario",
      "name": "Makario",
      "type": "bar",
      "col": 1,
      "row": 1,
      "side": "west"
    },
    {
      "id": "file",
      "name": "FILÉ – Lomos & Wraps",
      "type": "restaurant",
      "col": 1,
      "row": 4,
      "side": "east"
    },
    {
      "id": "miski_mikuy",
      "name": "Miski Mikuy - Sabor a Perú",
      "type": "restaurant",
      "col": 2,
      "row": 5,
      "side": "south"
    }
  ],
  "_comment_pois": "Autopartes y La Rueda están en la misma manzana (Juan B. Justo entre Castelar y Cervantes), separadas con 'offset' (en tiles) a lo largo del mismo lado para no pisarse.",
  "busStops": [
    {
      "col": 3,
      "row": 1,
      "street": "Gral. Paz"
    },
    {
      "col": 3,
      "row": 4,
      "street": "Gral. Paz"
    },
    {
      "col": 4,
      "row": 2,
      "street": "Av. Juan B. Justo"
    },
    {
      "col": 4,
      "row": 5,
      "street": "Av. Juan B. Justo"
    }
  ],
  "parkedCars": [
    {
      "id": "car_autopartes",
      "col": 4,
      "row": 0,
      "side": "east",
      "offset": 4,
      "color": "#c94b4b",
      "missionCar": true
    },
    {
      "id": "car_1",
      "col": 0,
      "row": 2,
      "side": "west",
      "color": "#4b7dc9"
    },
    {
      "id": "car_2",
      "col": 2,
      "row": 3,
      "side": "south",
      "color": "#4bc98a"
    },
    {
      "id": "car_3",
      "col": 2,
      "row": 4,
      "side": "east",
      "color": "#c9a54b"
    },
    {
      "id": "car_4",
      "col": 3,
      "row": 5,
      "side": "north",
      "color": "#8a4bc9"
    }
  ],
  "pedestrianSpawnCount": 18
};
