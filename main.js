var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function() {

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var desired_harvesters = 4;
    var desired_upgraders = 10;
    var desired_builders = 10;

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Harvesters: ' + harvesters.length + ' Upgraders: ' + upgraders.length + ' Builders: ' + builders.length);

    var need_harvester = harvesters.length < desired_harvesters;
    var need_upgrader = upgraders.length < desired_upgraders;
    var need_builder = builders.length < desired_builders;

    if (need_harvester) {
        var newName;
        if (harvesters.length >= 1) {
            newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, WORK, CARRY, MOVE], undefined, {
                role: 'harvester'
            });
        } else {
            newName = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], undefined, {
                role: 'harvester'
            });
        }
        console.log('Spawning new harvester: ' + newName);

    } else if (need_upgrader) {
        var newName;
        if (upgraders.length >= 1) {
            var newName = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE, MOVE, MOVE], undefined, {
                role: 'upgrader'
            });
        } else {
            var newName = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], undefined, {
                role: 'upgrader'
            });
        }
        console.log('Spawning new upgrader: ' + newName);

    } else if (need_builder) {
        var newName;
        if (builders.length >= 1) {
            newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, CARRY, MOVE, MOVE], undefined, {
                role: 'builder'
            });
        } else {
            newName = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], undefined, {
                role: 'builder'
            });
        }
        console.log('Spawning new builder: ' + newName);

    }

    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y, {
                align: 'left',
                opacity: 0.8
            });
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}
