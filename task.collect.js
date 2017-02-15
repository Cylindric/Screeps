"use strict";

var taskCollect = {

    do: function(creep) {
        var space = creep.carryCapacity - _.sum(creep.carry)
        // Find closest energy source
        var pickup = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] >= space);
            }
        })

        if (pickup === null) {
            // console.log(creep.name + ' could not find pickup with at least ' + space + ' energy.')
            return;
        }

        var result = creep.withdraw(pickup, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid pickup " + pickup)
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                console.log(creep.name + ": pickup empty")
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(pickup, {
                    visualizePathStyle: {
                        stroke: '#ffaa00'
                    }
                });
                break;
        }

    }

}

module.exports = taskCollect // jshint ignore:line
