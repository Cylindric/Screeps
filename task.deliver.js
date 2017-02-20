"use strict";

var map = require('map')

function findContainer(creep) {
    var c = _.filter(Game.creeps, (creep) => creep.memory.role == 'courier')

    // Don't use containers if we don't have couriers to empty them
    if (c.length === 0) {
        return null;
    }

    // Grab the nearest container with space
    var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity);
        }
    })
    if (!target === null && creep.memory.vis) console.log(creep.name + ": found a container at " + target.pos)
    if (target === null && creep.memory.vis) console.log(creep.name + ": no containers with space found")

    // Only deliver to nearby containers
    if (target !== null) {
        if (creep.pos.getRangeTo(target) > 5) {
            if (creep.memory.vis) console.log(creep.name + ": container too far away")
            target = null
        }
    }

    return target
}

function findStructure(creep) {
    var target = null;

    // If the spawn is reserved, it wants energy, so take it to something useful for that
    if (target === null && map.isSpawnReserved(creep.room)) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
            }
        })
        if (creep.vis && !target === null) console.log(creep.name + ": taking energy to " + target.pos)
    }

    // Try to find a tower with space to drop the energy at
    if (target === null && !map.isSpawnReserved(creep.room)) {
        var towers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return (
                    (s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity);
            }
        });
        towers = towers.sort(function(a, b) {
            return (b.energy, a.energy)
        });
        target = towers[0];
    }

    // If there are no towers, take it to the nearest spawn with space
    if (target === null) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN && structure.energy < structure.energyCapacity);
            }
        })
    }

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

        if (creep.memory.vis) {
            creep.room.visual.line(creep.pos, dropoff.pos, {
                color: '#aa0000',
                opacity: 0.5,
            })
        }


        var result = creep.transfer(dropoff, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                creep.say('⚡')
                break;
            case ERR_FULL:
                // console.log(creep.name + ": dropoff full")
                break;
            case ERR_INVALID_TARGET:
                // console.log(creep.name + ": invalid dropoff")
                break;
            case ERR_NOT_IN_RANGE:
                map.walkOnTile(creep)
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
