"use strict";

var taskHarvest = {

    do: function(creep) {
        var energy = null;

        if (creep.memory.energy_id === null) {

            // Find a full source first - probably not being harvested
            energy = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (s) => {
                    return (s.energy === s.energyCapacity);
                }
            })

            if (energy === null) {
                // no full source found, just look for closest
                energy = creep.pos.findClosestByPath(FIND_SOURCES)
            }

            creep.memory.energy_id = energy.id
            console.log(creep.name + ": set new target " + creep.memory.energy_id)
        } else {
            energy = Game.getObjectById(creep.memory.energy_id)
        }

        var result = creep.harvest(energy);
        switch (result) {
            case OK:
                creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)
                if (creep.carry >= creep.carryCapacity) {
                    creep.memory.energy_id = null
                }
                break;
            case ERR_BUSY:
                console.log(creep.name + ": source busy")
                creep.memory.energy_id
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid target")
                creep.memory.energy_id = null
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(energy, {
                    visualizePathStyle: {
                        stroke: '#ffaa00'
                    }
                });
                break;
        }

    }

}

module.exports = taskHarvest // jshint ignore:line
