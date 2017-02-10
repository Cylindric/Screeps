var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }


    // Every tile we walk on, we want a road on!
    // No, we really don't...
    if (false) {
      var onRoad = false;
      creep.pos.look().forEach(function(lookObject) {
        if (lookObject.type == LOOK_STRUCTURES) {
          if (lookObject.structure.structureType === STRUCTURE_ROAD) {
            onRoad = true;
          }
        }
      });
      if (onRoad === false) {
        creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
      }
    }

    creep.pos.look().forEach(function(lookObject) {
      if (lookObject.type == LOOK_CREEPS && lookObject[LOOK_CREEPS].getActiveBodyparts(ATTACK) === 0) {
        creep.moveTo(lookObject.creep);
      }
    });

    // console.log(creep.pos.look());

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: {
            stroke: '#ffffff'
          }
        });
      }
    } else {
      var sources = creep.room.find(FIND_SOURCES);
      var target_id = sources.length - 1;

      if (creep.harvest(sources[target_id]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[target_id], {
          visualizePathStyle: {
            stroke: '#ffaa00'
          }
        });
      } else {
        creep.say(_.sum(creep.carry) + '/' + creep.carryCapacity);
      }
    }
  }
};

module.exports = roleUpgrader;
