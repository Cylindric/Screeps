var roleBuilder = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.building && creep.carry.energy === 0) {
      // Trying to build, but not enough energy
      creep.memory.building = false
      creep.say('?? harvest')
    }

    if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
      // Full of energy now - ready to start building!
      creep.say('Clearing')
      creep.memory.building = true
      creep.say('?? build')
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        creep.memory.build_target = targets[0];

        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          // Head to build-site
          creep.moveTo(targets[0], {
            visualizePathStyle: {
              stroke: '#ffffff'
            }
          });
          creep.say('?? ' + creep.memory.build_target.structureType);
        } else {
          // At build site, start building
          creep.say('?? ' + creep.memory.build_target.progress + '/' + creep.memory.build_target.progressTotal);
        }
      }
    } else {
      var sources = creep.room.find(FIND_SOURCES)

      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {
          visualizePathStyle: {
            stroke: '#ffaa00'
          }
        })
      } else {
        creep.say(_.sum(creep.carry) + '/' + creep.carryCapacity)
      }
    }
  }
}

module.exports = roleBuilder
