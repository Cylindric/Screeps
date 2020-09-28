"use strict";

var map = require('map')

var taskCollect = {

    do: function(creep) {
        var space = creep.carryCapacity - _.sum(creep.carry)

        // Find fullest energy source
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (
                    (s.structureType == STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] >= space);
            }
        });
        containers = containers.sort(function(a, b) {
            return (a.store[RESOURCE_ENERGY], b.store[RESOURCE_ENERGY])
        });
        var pickup = containers[0]
        if (pickup === null) {
            // console.log(creep.name + ' could not find pickup with at least ' + space + ' energy.')
            return;
        }

        var result = creep.withdraw(pickup, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                if (creep.memory.vis) creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid pickup " + pickup)
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                console.log(creep.name + ": pickup empty")
                break;
            case ERR_NOT_IN_RANGE:
                map.walkOnTile(creep)
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
