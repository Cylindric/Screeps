"use strict";
const REPAIRER_IDLE = 'idle';
const REPAIRER_CHARGING = 'charging';
const REPAIRER_REPAIRING = 'repairing';

var taskRepair = {

    do: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    structure.hits < structure.hitsMax);
            }
        })

        if (target === null) {
            // could not find any structures with available space.
            return;
        }

        var result = creep.repair(target);
        switch (result) {
            case OK:
                var progress = Math.floor((target.hits / target.hitsMax) * 100)
                creep.say('🔧 ' + progress + '%')
                if (target.hits >= target.hitsMax) {
                    creep.memory.state = REPAIRER_IDLE;
                }
                break;
            case ERR_INVALID_TARGET:
                console.log(creep.name + ": invalid repair target")
                break;
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target, {
                    visualizePathStyle: {
                        stroke: '#ffaa00'
                    }
                });
                break;
        }
    }
}

module.exports = taskRepair // jshint ignore:line
