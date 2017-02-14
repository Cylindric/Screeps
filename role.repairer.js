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
        creep.memory.target_id = (creep.memory.target_id === undefined) ? null : creep.memory.target_id;
        creep.memory.energy_id = (creep.memory.energy_id === undefined) ? null : creep.memory.energy_id;

        /* Valid transitions
        IDLE -> IDLE
        IDLE -> CHARGING
        IDLE -> REPAIRING
        REPAIRIN -> IDLE
        */

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

        // console.log(creep.name + ": " + creep.memory.state + " (" + creep.carry.energy + "/" + creep.carryCapacity + ")")

        // Now that we've determined what to do, do it...

        var target = null;
        if (creep.memory.target_id !== null) {
            target = Game.getObjectById(creep.memory.target_id)
            if (creep.memory.vis && target !== null) {
                creep.room.visual.line(creep.pos, target.pos, {
                    color: 'red'
                })
            }
        }
        var energy = null;
        if (creep.memory.energy_id !== null) {
            energy = Game.getObjectById(creep.memory.energy_id)
            if (creep.memory.vis && energy !== null) {
                creep.room.visual.line(creep.pos, energy.pos, {
                    color: 'yellow'
                })
            }
        }

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
