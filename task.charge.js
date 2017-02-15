"use strict";

var taskCharge = {

    do: function(creep) {

        if (creep.spawning) {
            return;
        }

        var energy

        if (creep.memory.vis) console.log(creep.name + ' looking for energy supply...')

        // Find closest energy source
        energy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0) ||
                    (structure.structureType == STRUCTURE_EXTENSION ||
                        /*structure.structureType == STRUCTURE_SPAWN ||*/
                        structure.structureType == STRUCTURE_TOWER) && structure.energy > 0);
            }
        })

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
                creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)
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
                creep.moveTo(energy, {
                    visualizePathStyle: {
                        stroke: '#ffaa00'
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
