var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.carry.energy < creep.carryCapacity) {
      var sources = creep.room.find(FIND_SOURCES);

      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.memory.action = 'Moving to energy';
        creep.moveTo(sources[0], {
          visualizePathStyle: {
            stroke: '#ffaa00'
          }
        });
      } else {
        creep.say(_.sum(creep.carry) + '/' + creep.carryCapacity);
      }
    } else {
      creep.memory.action = 'Looking for structures.';
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
            structure.energy < structure.energyCapacity;
        }
      });

      if (targets.length > 0) {

        var target_id = 0; //targets.length - 1;

        creep.memory.action = 'Found structures.';
        if (creep.transfer(targets[target_id], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.memory.action = 'Moving to structure.';
          creep.moveTo(targets[target_id], {
            visualizePathStyle: {
              stroke: '#ffffff'
            }
          });
        }
      } else {
        var target = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_SPAWN);
          }
        });
        creep.memory.action = 'Moving to spawn.' + target;
        var m = creep.moveTo(Game.spawns.CylSpawn.pos.x + 1, Game.spawns.CylSpawn.pos.y, {
          visualizePathStyle: {
            stroke: '#ffffff'
          }
        });
      }
    }
  }
};

module.exports = roleHarvester;
