"use strict";

function findContainer(creep) {
  var c = _.filter(Game.creeps, (creep) => creep.memory.role == 'courier')

  // Don't use containers if we don't have couriers to empty them
  if (c.length === 0) {
    return null;
  }

  var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_CONTAINER);
    }
  })

  // Only deliver to nearby containers
  if (target !== null) {
    if (creep.pos.getRangeTo(target) > 5) {
      target = null
    }
  }

  return target
}

function findStructure(creep) {
  // deliver to spawns by preference
  var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity);
    }
  })

  // if no spawn was found, try another structure type
  if (target === null) {
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (
          (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity);
      }
    })
  }

  return target
}


var taskDeliver = {



  do: function(creep) {
    var dropoff = null

    // If this creep doesn't have a dropoff target yet, and is a harvester, try to find a container
    if (dropoff === null && creep.memory.role === "harvester") {
      dropoff = findContainer(creep);
    }

    // If we still don't have a dropoff target, look for any structure that we can drop energy at
    if (dropoff === null) {
      dropoff = findStructure(creep);
    }

    var result = creep.transfer(dropoff, RESOURCE_ENERGY);
    switch (result) {
      case OK:
        creep.say('⚡')
        break;
      case ERR_FULL:
        console.log(creep.name + ": dropoff full")
        break;
      case ERR_INVALID_TARGET:
        console.log(creep.name + ": invalid dropoff")
        break;
      case ERR_NOT_IN_RANGE:
        creep.moveTo(dropoff, {
          visualizePathStyle: {
            stroke: '#ffaa00'
          }
        });
        break;

    }

  }

}

module.exports = taskDeliver // jshint ignore:line
