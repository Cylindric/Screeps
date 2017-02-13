const COURIER_IDLE = 'idle';
const COURIER_PICKUP = 'pickup';
const COURIER_DELIVER = 'delivering';

var actions = require('actions')

var roleCourier = {

    build: function() {
        newName = Game.spawns.CylSpawn.createCreep([CARRY, CARRY, MOVE], undefined, {
            role: 'courier'
        });
        return newName
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        // Ensure sensible defaults
        creep.memory.vis = false;
        creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
        creep.memory.state = (creep.memory.state === undefined) ? COURIER_IDLE : creep.memory.state;
        creep.memory.pickup_id = (creep.memory.pickup_id === undefined) ? null : creep.memory.pickup_id;
        creep.memory.dropoff_id = (creep.memory.dropoff_id === undefined) ? null : creep.memory.dropoff_id;

        /* Valid transitions
        IDLE -> IDLE
        IDLE -> PICKUP
        IDLE -> DELIVER
        PICKUP -> DELIVER
        */

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

        // console.log(creep.name + ": " + creep.memory.state + " (" + creep.carry.energy + "/" + creep.carryCapacity + ")")

        // Now that we've determined what to do, do it...

        switch (creep.memory.state) {
            case COURIER_DELIVER:
                actions.dropoff(creep)
                break;

            case COURIER_PICKUP:
                actions.collect(creep)
                break;
        }
    }
}

module.exports = roleCourier
