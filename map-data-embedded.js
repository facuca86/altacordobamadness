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
      "name": "Av. Juan B. Justo",
      "widthTiles": 4
    }
  ],
  "horizontalStreets": [
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
  "_comment_grid": "5 calles verticales -> 4 columnas de manzanas (col 0..3). 6 calles horizontales -> 5 filas de manzanas (row 0..4). col 3 = manzanas pegadas a Gral. Paz.",
  "pois": [
    {
      "id": "casa",
      "name": "Casa",
      "type": "spawn",
      "col": 3,
      "row": 0,
      "side": "south",
      "isPlayerSpawn": true
    },
    {
      "id": "la_rueda",
      "name": "La Rueda",
      "type": "restaurant",
      "col": 3,
      "row": 0,
      "side": "north"
    },
    {
      "id": "autopartes",
      "name": "Autopartes Los Hermanos P&G",
      "type": "shop",
      "col": 3,
      "row": 1,
      "side": "north"
    },
    {
      "id": "makario",
      "name": "Makario",
      "type": "bar",
      "col": 0,
      "row": 2,
      "side": "east"
    },
    {
      "id": "file",
      "name": "FILÉ – Lomos & Wraps",
      "type": "restaurant",
      "col": 1,
      "row": 3,
      "side": "south"
    },
    {
      "id": "miski_mikuy",
      "name": "Miski Mikuy - Sabor a Perú",
      "type": "restaurant",
      "col": 2,
      "row": 4,
      "side": "south"
    }
  ],
  "_comment_busstops": "col máximo válido es 3 (5 calles verticales -> 4 columnas de manzana, índice 0..3); las paradas 'sobre Av. Juan B. Justo' usan la columna 3, que es la manzana pegada a esa avenida por el lado este.",
  "busStops": [
    {
      "col": 3,
      "row": 1,
      "street": "Gral. Paz"
    },
    {
      "col": 3,
      "row": 3,
      "street": "Gral. Paz"
    },
    {
      "col": 3,
      "row": 2,
      "street": "Av. Juan B. Justo"
    },
    {
      "col": 3,
      "row": 4,
      "street": "Av. Juan B. Justo"
    }
  ],
  "parkedCars": [
    {
      "id": "car_autopartes",
      "col": 3,
      "row": 1,
      "side": "north",
      "color": "#c94b4b",
      "missionCar": true
    },
    {
      "id": "car_1",
      "col": 0,
      "row": 0,
      "side": "west",
      "color": "#4b7dc9"
    },
    {
      "id": "car_2",
      "col": 1,
      "row": 2,
      "side": "south",
      "color": "#4bc98a"
    },
    {
      "id": "car_3",
      "col": 2,
      "row": 3,
      "side": "east",
      "color": "#c9a54b"
    },
    {
      "id": "car_4",
      "col": 3,
      "row": 3,
      "side": "north",
      "color": "#8a4bc9"
    }
  ],
  "pedestrianSpawnCount": 18
};
