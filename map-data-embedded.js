const MAP_DATA_EMBEDDED = {
  "tileSize": 32,
  "blockSizeTiles": 16,
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
    },
    {
      "name": "Padre F.",
      "widthTiles": 2
    }
  ],
  "_comment_grid": "6 calles verticales -> 5 columnas de manzana (col 0..4). 8 calles horizontales -> 7 filas de manzana (row 0..6). col 3 = manzana entre Gral. Paz y Rivera Indarte (ahí está la Casa). col 4 = entre Rivera Indarte y Juan B. Justo.",
  "eastZone": {
    "_comment": "'Codito' real: a partir de Gral. Paz (índice 3 en verticalStreets), toda la trama de calles horizontales se corre hacia el sur. Confirmado por el usuario que afecta a Castelar, Cervantes, Lucero y Sarachaga (y por diseño, a todas). rowOffsetTiles es aproximado (media manzana) — ajustar si tenés la medida real.",
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
      "side": "east"
    },
    {
      "id": "autopartes",
      "name": "Autopartes Los Hermanos P&G",
      "type": "shop",
      "col": 3,
      "row": 3,
      "side": "north"
    },
    {
      "id": "makario",
      "name": "Makario",
      "type": "bar",
      "col": 0,
      "row": 4,
      "side": "west"
    },
    {
      "id": "file",
      "name": "FILÉ – Lomos & Wraps",
      "type": "restaurant",
      "col": 1,
      "row": 5,
      "side": "south"
    },
    {
      "id": "miski_mikuy",
      "name": "Miski Mikuy - Sabor a Perú",
      "type": "restaurant",
      "col": 2,
      "row": 6,
      "side": "south"
    }
  ],
  "busStops": [
    {
      "col": 3,
      "row": 3,
      "street": "Gral. Paz"
    },
    {
      "col": 3,
      "row": 5,
      "street": "Gral. Paz"
    },
    {
      "col": 4,
      "row": 4,
      "street": "Av. Juan B. Justo"
    },
    {
      "col": 4,
      "row": 6,
      "street": "Av. Juan B. Justo"
    }
  ],
  "parkedCars": [
    {
      "id": "car_autopartes",
      "col": 3,
      "row": 3,
      "side": "north",
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
      "col": 1,
      "row": 4,
      "side": "south",
      "color": "#4bc98a"
    },
    {
      "id": "car_3",
      "col": 2,
      "row": 5,
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
