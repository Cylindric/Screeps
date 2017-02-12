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
    creep.memory.vis = (creep.memory.vis === undefined) ? true : creep.memory.vis;
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
        // if (creep.memory.target_id === null) {
        //   target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //       return (
        //         structure.hits < structure.hitsMax);
        //     }
        //   })
        //
        //   if (target === null) {
        //     // could not find any structures with available space.
        //     return;
        //   }
        //
        //   creep.memory.target_id = target.id
        //   console.log(creep.name + ": set new target " + creep.memory.target_id)
        // }
        //
        // var result = creep.repair(target);
        // switch (result) {
        //   case OK:
        //     var progress = Math.floor((target.hits / target.hitsMax) * 100)
        //     creep.say('🔧 ' + progress + '%')
        //     if (target.hits >= target.hitsMax) {
        //       creep.memory.state = REPAIRER_IDLE;
        //     }
        //     break;
        //   case ERR_INVALID_TARGET:
        //     console.log(creep.name + ": invalid target")
        //     creep.memory.target_id = null
        //     break;
        //   case ERR_NOT_IN_RANGE:
        //     creep.moveTo(target, {
        //       visualizePathStyle: {
        //         stroke: '#ffaa00'
        //       }
        //     });
        //     break;
        //
        // }
        //
        break;

      case REPAIRER_CHARGING:
        creep.memory.target_id = null;

        if (creep.memory.energy_id === null) {
          // Find closest energy source
          sources = creep.room.find(FIND_SOURCES)
          i = (Math.floor(Math.random() * sources.length))
          energy = sources[i]
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

module.exports = roleRepairer
