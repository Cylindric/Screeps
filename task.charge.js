"use strict";

var taskCharge = {

    do: function(creep) {

        var energy

        if (creep.memory.energy_id === null) {
            if (creep.memory.vis) console.log(creep.name + ' looking for energy supply...')

            // Find closest energy source
            energy = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0) ||
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy > 0);
                }
            })

            creep.memory.energy_id = energy.id
        } else {
            energy = Game.getObjectById(creep.memory.energy_id)
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
                if (creep.carry >= creep.carryCapacity) {
                    creep.memory.energy_id = null
                }
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ': target is not valid for charging (' + energy.pos + ')')
                creep.memory.energy_id = null
                break;
            case ERR_NOT_IN_RANGE:
                if (creep.memory.vis) console.log(creep.name + ' moving to supply...')
                creep.moveTo(energy, {
                    visualizePathStyle: {
                        stroke: '#ffaa00'
                    }
                });
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                console.log(creep.name + ' supply is empty')
                break;
            default:
                console.log(creep.name + ' error charging: ' + result)
                break;
        }

    }

}

module.exports = taskCharge // jshint ignore:line
