const REPAIRER_IDLE = 'idle';
const REPAIRER_CHARGING = 'charging';
const REPAIRER_REPAIRING = 'repairing';

var actions = require('actions')

var roleRepairer = {

    build: function() {
        newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE, MOVE], undefined, {
            role: 'repairer'
        });

        return newName
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.room.visual.circle(creep.pos, {
            stroke: '#00ff00',
            fill: '',
            opacity: 0.5,
            radius: 0.25
        })

        // Ensure sensible defaults
        creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
        creep.memory.state = (creep.memory.state === undefined) ? REPAIRER_IDLE : creep.memory.state;

        // If we aren't doing anything, and need charging, might as well charge up.
        switch (creep.memory.state) {
            case REPAIRER_IDLE:
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.memory.state = REPAIRER_CHARGING
                } else {
                    creep.memory.state = REPAIRER_REPAIRING
                }
                break;
            case REPAIRER_REPAIRING:
                if (creep.carry.energy === 0) {
                    creep.memory.state = REPAIRER_CHARGING
                }
                break;
            case REPAIRER_CHARGING:
                if (creep.carry.energy === creep.carryCapacity) {
                    creep.memory.state = REPAIRER_IDLE;
                }
                break;
        }

        // Now that we've determined what to do, do it...

        switch (creep.memory.state) {
            case REPAIRER_REPAIRING:
                actions.repair(creep)
                break;

            case REPAIRER_CHARGING:
                actions.charge(creep)
                break;
        }
    }
}

module.exports = roleRepairer
