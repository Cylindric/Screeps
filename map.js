"use strict";

var map = {

    initialise: function(room) {
        // Create the master flag for this room
        var flags = room.find(FIND_FLAGS, {
            filter: (f) => {
                return (
                    f.name === "room-" + room.name);
            }
        })
        if (flags.length === 0) {
            room.createFlag(25, 25, "room-" + room.name)
        }

        var roomFlag = Game.flags["room-" + room.name]

        roomFlag.memory.vis = (roomFlag.memory.vis === undefined) ? false : roomFlag.memory.vis;

        // Initialise the map counter data
        //roomFlag.memory.roadData = undefined
        if (roomFlag.memory.roadData === undefined) {
            roomFlag.memory.roadData = new Array(50)
            for (var i = 0; i < 50; i++) {
                roomFlag.memory.roadData[i] = new Array(50)
            }
        }

    },

    getFlag: function(room) {
        return Game.flags["room-" + room.name]
    },

    walkOnTile: function(creep) {
        // Ignore roads
        var structures = creep.pos.lookFor(LOOK_STRUCTURES);
        var roads = _.filter(structures, (s) => s.structureType == 'road');
        if (roads.length > 0) {
            return
        }

        if (Game.flags["room-" + creep.room.name].memory.roadData[creep.pos.x][creep.pos.y] === null) {
            Game.flags["room-" + creep.room.name].memory.roadData[creep.pos.x][creep.pos.y] = 1;
        }
        Game.flags["room-" + creep.room.name].memory.roadData[creep.pos.x][creep.pos.y] += 1;
    },

    vis: function(room) {
        var roomFlag = Game.flags["room-" + room.name];
        if (roomFlag.memory.vis === false) {
            return;
        }
        for (var x = 0; x < 50; x++) {
            for (var y = 0; y < 50; y++) {
                var count = roomFlag.memory.roadData[x][y]
                if (count !== undefined && count !== null) {
                    room.visual.text(count, x, y, {
                        size: 0.5
                    })
                }
            }
        }
    }
}

module.exports = map // jshint ignore:line
