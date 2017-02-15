const HARVESTER_IDLE = 'idle';
const HARVESTER_CHARGING = 'charging';
const HARVESTER_DELIVER = 'delivering';

var actions = require('actions')

var roleHarvester = {

  build: function() {
    newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE], undefined, {
      role: 'harvester'
    });

    return newName
  },

  convert: function(creep) {
    console.log(creep.name + " has been converted from a " + creep.memory.role + " to a harvester")
    creep.memory = undefined
    creep.memory.role = 'harvester'
  },

  /** @param {Creep} creep **/
  run: function(creep) {

    // Ensure sensible defaults
    creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
    creep.memory.state = (creep.memory.state === undefined) ? HARVESTER_IDLE : creep.memory.state;

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

    // Now that we've determined what to do, do it...

    switch (creep.memory.state) {
      case HARVESTER_DELIVER:
        actions.deliver(creep);
        creep.memory.energy_id = null // clear the previous pickup location to help balance load
        break;

      case HARVESTER_CHARGING:
        actions.harvest(creep);
        break;
    }
  }
}

module.exports = roleHarvester
