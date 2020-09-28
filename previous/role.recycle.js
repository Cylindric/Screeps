var roleRecycle = {

    /** @param {Creep} creep **/
    run: function(creep) {

        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_SPAWN));
            }
        })
        creep.memory.target_id = target.id

        var result = target.recycleCreep(creep);
        switch (result) {
            case OK:
                creep.say('☠️')
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid target")
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
