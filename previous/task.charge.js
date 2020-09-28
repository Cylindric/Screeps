"use strict";
var map = require('map')

var taskCharge = {

    do: function(creep) {

        if (creep.spawning) {
            return;
        }

        var energy

        if (creep.memory.vis) console.log(creep.name + ' looking for energy supply...')
        creep.memory.restingPos = (creep.memory.restingPos === undefined) ? null : creep.memory.restingPos;

        // If the spawn is currently reserved, that limits what we can take energy from
        if (map.isSpawnReserved(creep.room)) {
            energy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_TOWER) && structure.energy > 0);
                }
            })

            if (energy === null) {
                // no alternative energy sources, just move out of the way of the spawn
                if (creep.memory.restingPos === null) {
                    var newX = creep.pos.x + Math.floor((Math.random() * 15) + 5);
                    var newY = creep.pos.y + Math.floor((Math.random() * 15) + 5);
                    //console.log("X: " + newX + " Y: " + newY)
                    creep.memory.restingPos = new RoomPosition(newX, newY, creep.room.name)
                }

                if (creep.pos.getRangeTo(creep.memory.restingPos) > 5) {
                    console.log("Moving to resting pos to wait " + creep.memory.restingPos)
                    var result = creep.moveTo(creep.memory.restingPos, {
                        visualizePathStyle: {
                            stroke: '#ffaa00'
                        }
                    })
                    if (result === ERR_INVALID_TARGET) {
                        creep.memory.restingPos = null;
                    }
                    return;
                }

            }

        } else {
            energy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0) ||
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy > 0);
                }
            })
            if (energy === null) {
                // no buildings found, try the spawn
                energy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_SPAWN) && structure.energy > 0);
                    }
                })
            }
        }

        if (energy === null) {
            // no buildings found
            return
        }


        if (creep.memory.vis && energy !== null) {
            creep.room.visual.line(creep.pos, energy.pos, {
                color: 'yellow'
            })
        }

        var result = creep.withdraw(energy, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                if (creep.memory.vis) creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)
                break;

            case ERR_NOT_OWNER:
                console.log(creep.name + ': target is owned by this player (' + energy.pos + ')')
                break;

            case ERR_BUSY:
                console.log(creep.name + ': target is busy (' + energy.pos + ')')
                break;

            case ERR_NOT_ENOUGH_RESOURCES:
                if (creep.memory.vis) console.log(creep.name + ' supply is empty')
                break;

            case ERR_INVALID_TARGET:
                console.log(creep.name + ': target is not valid for charging')
                break;

            case ERR_FULL:
                console.log(creep.name + ': creep is full')
                break;

            case ERR_NOT_IN_RANGE:
                if (creep.memory.vis) console.log(creep.name + ' moving to supply...')
                map.walkOnTile(creep)
                creep.moveTo(energy, {
                    visualizePathStyle: {
                        stroke: '#ffff00'
                    }
                });
                break;

            case ERR_INVALID_ARGS:
                console.log(creep.name + ' cannot withdaw - invalid arguments')
                break;

            default:
                console.log(creep.name + ' error charging: ' + result)
                break;
        }

    }

}

module.exports = taskCharge // jshint ignore:line
