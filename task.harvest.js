"use strict";
var map = require('map')

var taskHarvest = {

    do: function(creep) {
        var energy = null;

        if (creep.memory.energy_id === null) {

            // Find a full source first - probably not being harvested
            var sources = creep.room.find(FIND_SOURCES)
            var creepCount = 999999
            for (var s in sources) {
                // Determine how many creeps have this source as their target
                var creeps = _.filter(Game.creeps, (creep) => creep.memory.energy_id === sources[s].id);
                if (creeps.length < creepCount) {
                    energy = sources[s]
                    creepCount = creeps.length
                }
            }

            if (energy === null) {
                // no sources found
                return
            }

            creep.memory.energy_id = energy.id
        } else {
            energy = Game.getObjectById(creep.memory.energy_id)
        }

        var result = creep.harvest(energy);
        switch (result) {
            case OK:
                if (creep.memory.vis) creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)

                creep.room.visual.text(energy.energy, energy.pos.x + 0.5, energy.pos.y - 0.2, {
                    color: 'yellow',
                    size: 0.3
                })

                if (creep.carry >= creep.carryCapacity) {
                    creep.memory.energy_id = null
                }
                break;
            case ERR_BUSY:
                console.log(creep.name + ": source busy")
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid target")
                creep.memory.energy_id = null
                break;
            case ERR_NOT_IN_RANGE:
                map.walkOnTile(creep)
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
