var roleHarvester = require('role.harvester')
var roleUpgrader = require('role.upgrader')
var roleBuilder = require('role.builder')
var roleClaimer = require('role.claimer')

module.exports.loop = function() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  var desired_harvesters = 5;
  var desired_upgraders = 5;
  var desired_builders = 5;
  var desired_claimers = 0;

  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
  console.log('Harvesters: ' + harvesters.length + ' Upgraders: ' + upgraders.length + ' Builders: ' + builders.length + ' Claimers: ' + claimers.length);

  var need_harvester = harvesters.length < desired_harvesters;
  var need_upgrader = upgraders.length < desired_upgraders;
  var need_builder = builders.length < desired_builders;
  var need_claimer = claimers.length < desired_claimers;

  var newName;
  if (need_harvester) {
    if (harvesters.length < desired_harvesters) {
      newName = Game.spawn.CylSpawn.createCreep([WORK, WORK, WORK, CARRY, MOVE], undefined, {
        role: 'harvester'
      });
    }
    if (harvesters.length < desired_harvesters) {
      newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE], undefined, {
        role: 'harvester'
      });
    }
    console.log('Spawning new harvester: ' + newName);

  } else if (need_upgrader) {
    if (upgraders.length >= 1) {
      newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE, MOVE, MOVE], undefined, {
        role: 'upgrader'
      });
    } else {
      newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE], undefined, {
        role: 'upgrader'
      });
    }
    console.log('Spawning new upgrader: ' + newName);

  } else if (need_builder) {
    if (builders.length >= 1) {
      newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, CARRY, CARRY, MOVE], undefined, {
        role: 'builder'
      });
    } else {
      newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE], undefined, {
        role: 'builder'
      });
    }
    console.log('Spawning new builder: ' + newName);

  } else if (need_claimer) {
    newName = Game.spawns.CylSpawn.createCreep([CLAIM, CLAIM, CLAIM, MOVE, MOVE], undefined, {
      role: 'claimer'
    });
    console.log('Spawning new claimer: ' + newName);

  }

  if (Game.spawns.CylSpawn.spawning) {
    var spawningCreep = Game.creeps[Game.spawns.CylSpawn.spawning.name];
    Game.spawns.CylSpawn.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns.CylSpawn.pos.x + 1,
      Game.spawns.CylSpawn.pos.y, {
        align: 'left',
        opacity: 0.8
      });
  }

  for (var c in Game.creeps) {
    var creep = Game.creeps[c];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    if (creep.memory.role == 'claimer') {
      roleClaimer.run(creep);
    }
  }
}
