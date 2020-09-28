var actions = require('actions')
var map = require('map')

var roleUpgrader = {

    convert: function(creep) {
        console.log(creep.name + " has been converted from a " + creep.memory.role + " to an upgrader")
        creep.memory = undefined
        creep.memory.role = 'upgrader'
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.room.visual.circle(creep.pos, {
            stroke: '#ffff00',
            fill: '',
            opacity: 0.5,
            radius: 0.25
        })

        if (creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                map.walkOnTile(creep)
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle: {
                        stroke: '#ffffff'
                    }
                });
            }
        } else {
            actions.charge(creep)
        }
    }
};

module.exports = roleUpgrader;
