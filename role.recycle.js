var roleRecycle = {

  /** @param {Creep} creep **/
  run: function(creep) {

    creep.memory.target_id = (creep.memory.target_id === undefined) ? null : creep.memory.target_id;

    if (creep.memory.target_id === null) {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return ((structure.structureType == STRUCTURE_SPAWN));
        }
      })
      creep.memory.target_id = target.id
    } else {
      target = Game.getObjectById(creep.memory.target_id)
    }


    var result = target.recycleCreep(creep);
    switch (result) {
      case OK:
        creep.say('☠️')
        break;
      case ERR_INVALID_TARGET:
        console.log(creep.name + ": invalid target")
        creep.memory.target_id = null
        break;
      case ERR_NOT_IN_RANGE:
        creep.moveTo(target, {
          visualizePathStyle: {
            stroke: '#ff0000',
            opacity: 1
          }
        });
        break;
    }
  }
}

module.exports = roleRecycle
