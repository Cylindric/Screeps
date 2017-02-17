"use strict";

var map = {

  initialise: function(room) {
    // Create the master flag for this room
    var flags = room.find(FIND_FLAGS, {
      filter: (f) => {
        return (
          f.name === "room-" + room.name);
      }
    })
    if (flags.length === 0) {
      room.createFlag(25, 25, "room-" + room.name)
    }

    var roomFlag = Game.flags["room-" + room.name]

    roomFlag.memory.vis = (roomFlag.memory.vis === undefined) ? false : roomFlag.memory.vis;
    roomFlag.memory.roadThreshold = (roomFlag.memory.roadThreshold === undefined) ? 150 : roomFlag.memory.roadThreshold;

    // Count the current amount of energy available to spawn
    roomFlag.memory.spawnEnergy = 0;
    var spawnStores = room.find(FIND_STRUCTURES, {
      filter: (s) => {
        return (
          s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN
        );
      }
    });
    for (var s in spawnStores) {
      roomFlag.memory.spawnEnergy += spawnStores[s].energy
    }

    // Initialise the map counter data
    if (roomFlag.memory.roadData === undefined) {
      roomFlag.memory.roadData = new Array(50)
      for (var i = 0; i < 50; i++) {
        roomFlag.memory.roadData[i] = new Array(50)
      }
    }

  },

  getPowerLevel: function(room) {
    return Game.flags["room-" + room.name].memory.spawnEnergy
  },

  ReserveSpawn: function(room, reserve) {
    Game.flags["room-" + room.name].memory.reserveSpawn = reserve
  },

  isSpawnReserved: function(room) {
    return Game.flags["room-" + room.name].memory.reserveSpawn
  },

  getFlag: function(room) {
    return Game.flags["room-" + room.name]
  },

  walkOnTile: function(creep) {
    // Ignore roads
    var roads = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == 'road');
    var newRoads = _.filter(creep.pos.lookFor(LOOK_CONSTRUCTION_SITES), (s) => s.structureType == 'road');

    if (roads.length > 0 || newRoads.length > 0) {
      return
    }

    if (Game.flags["room-" + creep.room.name].memory.roadData[creep.pos.x][creep.pos.y] === null) {
      Game.flags["room-" + creep.room.name].memory.roadData[creep.pos.x][creep.pos.y] = 1;
    }
    Game.flags["room-" + creep.room.name].memory.roadData[creep.pos.x][creep.pos.y] += 1;
  },

  findNewRoad: function(creep) {
    var room = creep.room;
    var roomFlag = Game.flags["room-" + room.name];
    var targets = []
    for (var x = 0; x < 50; x++) {
      for (var y = 0; y < 50; y++) {
        var count = roomFlag.memory.roadData[x][y]
        if (count !== undefined && count !== null && count > roomFlag.memory.roadThreshold) {
          targets.push(new RoomPosition(x, y, room.name))
        }
      }
    }
    var closest = creep.pos.findClosestByPath(targets);
    if (closest === null) {
      // No road prospects found
      return null
    }

    closest = new RoomPosition(closest.x, closest.y, room.name)
    room.visual.circle(closest, {
      stroke: '#ff0000',
      fill: '#ffff00',
      opacity: 1,
      radius: 0.2
    })

    var result = room.createConstructionSite(closest, STRUCTURE_ROAD)
    if (result === OK) {
      roomFlag.memory.roadData[closest.x][closest.y] = null;
      var structures = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, closest);
      var roads = _.filter(structures, (s) => s.structureType == 'road');
      roomFlag.memory.debug = roads
      return roads[0]
    }
  },

  vis: function(room) {
    var roomFlag = Game.flags["room-" + room.name];
    if (roomFlag.memory.vis === false) {
      return;
    }
    for (var x = 0; x < 50; x++) {
      for (var y = 0; y < 50; y++) {
        var count = roomFlag.memory.roadData[x][y]
        if (count !== undefined && count !== null && count > 0) {
          room.visual.text(count, x, y, {
            size: 0.35,
            opacity: count / roomFlag.memory.roadThreshold
          })
        }
      }
    }
  }
}

module.exports = map // jshint ignore:line
