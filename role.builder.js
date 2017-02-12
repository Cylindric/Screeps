const BUILDER_IDLE = 'idle';
const BUILDER_CHARGING = 'charging';
const BUILDER_BUILDING = 'building';

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
    creep.memory.vis = false
    creep.memory.vis = (creep.memory.vis === undefined) ? false : creep.memory.vis;
    creep.memory.state = (creep.memory.state === undefined) ? BUILDER_IDLE : creep.memory.state;
    creep.memory.target_id = (creep.memory.target_id === undefined) ? null : creep.memory.target_id;
    creep.memory.energy_id = (creep.memory.energy_id === undefined) ? null : creep.memory.energy_id;

    /* Valid transitions
    IDLE -> IDLE
    IDLE -> CHARGING
    IDLE -> BUILDING
    CHARGING -> IDLE
    */

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
    }

    //console.log(creep.name + ": " + creep.memory.state + " (" + creep.carry.energy + "/" + creep.carryCapacity + ")")
    creep.room.visual.circle(creep.pos, {
      stroke: '#00ffff',
      fill: '',
      opacity: 0.5,
      radius: 0.25
    })


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
      case BUILDER_BUILDING:
        if (creep.memory.target_id === null) {
          target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
          creep.memory.target_id = target.id
          console.log(creep.name + ": set new target " + creep.memory.target_id)
        }

        var result = creep.build(target);
        switch (result) {
          case OK:
            var progress = Math.floor((target.progress / target.progressTotal) * 100)
            creep.say('🚧 ' + progress + '%')
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

      case BUILDER_CHARGING:

        if (creep.memory.energy_id === null) {
          // Find closest energy source
          energy = creep.pos.findClosestByPath(FIND_SOURCES)
          if (energy === null) {
            // No energy sources found?
            return;
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

module.exports = roleBuilder
