const COURIER_IDLE = 'idle';
const COURIER_PICKUP = 'pickup';
const COURIER_DELIVER = 'delivering';

var actions = require('actions')

var roleCourier = {

    spawn: function(qty) {
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'courier');
        var need_new = creeps.length < qty;
        var new_name = null;

        if (need_new === false) {
            return;
        }

        if (need_new) {
            var containers = Game.spawns.CylSpawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER);
                }
            });
            if (containers.length === 0) {
                // Only spawn couriers if we have containers
                need_new = false;
            }
        }

        if (need_new) {
            new_name = Game.spawns.CylSpawn.createCreep([CARRY, CARRY, MOVE], undefined, {
                role: 'courier'
            });
        }

        return new_name
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        // Ensure sensible defaults
        creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
        creep.memory.state = (creep.memory.state === undefined) ? COURIER_IDLE : creep.memory.state;

        // If we aren't doing anything, and need charging, might as well charge up.
        switch (creep.memory.state) {
            case COURIER_IDLE:
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.memory.state = COURIER_PICKUP
                } else {
                    creep.memory.state = COURIER_DELIVER
                }
                break;
            case COURIER_DELIVER:
                if (creep.carry.energy === 0) {
                    creep.memory.state = COURIER_PICKUP
                }
                break;
            case COURIER_PICKUP:
                if (creep.carry.energy === creep.carryCapacity) {
                    creep.memory.state = COURIER_DELIVER;
                }
                break;
            default:
                creep.memory.state = COURIER_IDLE
                break;
        }

        // Now that we've determined what to do, do it...

        switch (creep.memory.state) {
            case COURIER_DELIVER:
                actions.deliver(creep)
                break;

            case COURIER_PICKUP:
                actions.collect(creep)
                break;
        }
    }
}

module.exports = roleCourier
