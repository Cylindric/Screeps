"use strict";

var taskDeliver = {

    do: function(creep) {
        var dropoff

        if (creep.memory.dropoff_id === null) {
            dropoff = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity);
                }
            })

            if (dropoff === null) {
                // could not find any structures with available space.
                return;
            }

            creep.memory.dropoff_id = dropoff.id
        } else {
            dropoff = Game.getObjectById(creep.memory.dropoff_id)
        }


        var result = creep.transfer(dropoff, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                creep.say('⚡')
                break;
            case ERR_FULL:
                console.log(creep.name + ": dropoff full")
                creep.memory.dropoff_id = null
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid dropoff")
                creep.memory.dropoff_id = null
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
