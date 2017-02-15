const BUILDER_IDLE = 'idle';
const BUILDER_CHARGING = 'charging';
const BUILDER_BUILDING = 'building';

var actions = require('actions')

var roleBuilder = {

    build: function() {
        newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, CARRY, CARRY, MOVE], undefined, {
            role: 'builder'
        });

        return newName
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        // Ensure sensible defaults
        creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
        creep.memory.state = (creep.memory.state === undefined) ? BUILDER_IDLE : creep.memory.state;

        // If we aren't doing anything, and need charging, might as well charge up.
        switch (creep.memory.state) {
            case BUILDER_IDLE:
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.memory.state = BUILDER_CHARGING
                } else {
                    creep.memory.state = BUILDER_BUILDING
                }
                break;
            case BUILDER_BUILDING:
                if (creep.carry.energy === 0) {
                    creep.memory.state = BUILDER_CHARGING
                }
                break;
            case BUILDER_CHARGING:
                if (creep.carry.energy === creep.carryCapacity) {
                    creep.memory.state = BUILDER_IDLE;
                }
                break;
            default:
                creep.memory.state = BUILDER_IDLE;
                break;
        }

        if (creep.memory.vis) {
            creep.room.visual.text('🚧', creep.pos.x, creep.pos.y + 0.25, {
                color: '#00ffff',
                size: 0.5
            })
            creep.room.visual.text(creep.memory.state, creep.pos.x, creep.pos.y + 1, {
                color: '#00ffff',
                size: 0.5
            })
        }

        // Now that we've determined what to do, do it...

        switch (creep.memory.state) {
            case BUILDER_BUILDING:
                target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
                if (target === null) {
                    // No building sites found
                    var spawn = Game.spawns.CylSpawn;
                    if (creep.pos.getRangeTo(spawn) < 2) {
                        return;
                    }
                    creep.moveTo(spawn, {
                        visualizePathStyle: {
                            stroke: '#ffaa00'
                        }
                    });
                    return;
                }

                var result = creep.build(target);

                switch (result) {
                    case OK:
                        var progress = Math.floor((target.progress / target.progressTotal) * 100)
                        creep.say('🚧 ' + progress + '%')
                        break;
                    case ERR_INVALID_TARGET:
                        console.log(creep.name + ": invalid target")
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target, {
                            visualizePathStyle: {
                                stroke: '#ffaa00'
                            }
                        });
                        break;

                }

                break;

            case BUILDER_CHARGING:
                actions.charge(creep)
                break;
        }
    }

}

module.exports = roleBuilder
