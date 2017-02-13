const HARVESTER_IDLE = 'idle';
const HARVESTER_CHARGING = 'charging';
const HARVESTER_DELIVER = 'delivering';

var roleHarvester = {

    build: function() {
        newName = Game.spawns.CylSpawn.createCreep([WORK, WORK, WORK, CARRY, MOVE], undefined, {
            role: 'harvester'
        });

        return newName
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        // Ensure sensible defaults
        creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
        creep.memory.state = (creep.memory.state === undefined) ? HARVESTER_IDLE : creep.memory.state;
        creep.memory.target_id = (creep.memory.target_id === undefined) ? null : creep.memory.target_id;
        creep.memory.energy_id = (creep.memory.energy_id === undefined) ? null : creep.memory.energy_id;

        /* Valid transitions
        IDLE -> IDLE
        IDLE -> CHARGING
        IDLE -> DELIVER
        CHARGING -> IDLE
        */

        // If we aren't doing anything, and need charging, might as well charge up.
        switch (creep.memory.state) {
            case HARVESTER_IDLE:
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.memory.state = HARVESTER_CHARGING
                } else {
                    creep.memory.state = HARVESTER_DELIVER
                }
                break;
            case HARVESTER_DELIVER:
                if (creep.carry.energy === 0) {
                    creep.memory.state = HARVESTER_CHARGING
                }
                break;
            case HARVESTER_CHARGING:
                if (creep.carry.energy === creep.carryCapacity) {
                    creep.memory.state = HARVESTER_IDLE;
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
            case HARVESTER_DELIVER:

                if (creep.memory.target_id === null) {
                    c = _.filter(Game.creeps, (creep) => creep.memory.role == 'courier')
                    if (c.length === 0) {
                        // If there are no couriers, deliver to the spawns
                        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN);
                            }
                        })
                    } else {
                        // There are couriers
                        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_CONTAINER);
                            }
                        })
                    }

                    if (target === null) {
                        // could not find any structures with available space.
                        return;
                    }

                    creep.memory.target_id = target.id
                }

                var result = creep.transfer(target, RESOURCE_ENERGY);
                switch (result) {
                    case OK:
                        creep.say('⚡')
                        break;
                    case ERR_FULL:
                        console.log(creep.name + ": target full")
                        creep.memory.target_id = null
                        break;
                    case ERR_INVALID_TARGET:
                        console.log(creep.name + ": invalid target")
                        creep.memory.target_id = null
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

            case HARVESTER_CHARGING:
                creep.memory.target_id = null;

                if (creep.memory.energy_id === null) {

                    // Find a full source first - probably not being harvested
                    energy = creep.pos.findClosestByPath(FIND_SOURCES, {
                        filter: (s) => {
                            return (s.energy === s.energyCapacity);
                        }
                    })
                    if (energy === null) {
                        // no full source found, just look for closest
                        energy = creep.pos.findClosestByPath(FIND_SOURCES)
                    }

                    creep.memory.energy_id = energy.id
                    console.log(creep.name + ": set new target " + creep.memory.energy_id)
                }

                result = creep.harvest(energy);
                switch (result) {
                    case OK:
                        creep.say('🔌 ' + _.sum(creep.carry) + '/' + creep.carryCapacity)
                        if (creep.carry >= creep.carryCapacity) {
                            creep.memory.energy_id = null
                        }
                        break;
                    case ERR_BUSY:
                        console.log(creep.name + ": source busy")
                        creep.memory.energy_id
                        break;
                    case ERR_INVALID_TARGET:
                        console.log(creep.name + ": invalid target")
                        creep.memory.energy_id = null
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(energy, {
                            visualizePathStyle: {
                                stroke: '#ffaa00'
                            }
                        });
                        break;
                }

                break;
        }
    }
}

module.exports = roleHarvester
