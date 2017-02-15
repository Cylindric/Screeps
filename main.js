var roleHarvester = require('role.harvester')
var roleUpgrader = require('role.upgrader')
var roleBuilder = require('role.builder')
var roleClaimer = require('role.claimer')
var roleRecycle = require('role.recycle')
var roleRepairer = require('role.repairer')
var roleCourier = require('role.courier')

module.exports.loop = function() {
  // Default pop goals for phase-zero
  var popgoal_defaults = {
    'harvester': 1,
    'upgrader': 1,
    'builder': 1,
    'claimer': 0,
    'repairer': 0,
    'courier': 1,
  }


  // Clear memory for any creeps that are now dead
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }

  // Initialise spawns
  for (var i in Game.spawns) {
    // If this room's spawn doesn't have an population goals, set them to the default
    if (Game.spawns[i].memory.popgoal === undefined) {
      Game.spawns[i].memory.popgoal = popgoal_defaults;
      var sources = Game.spawns[i].room.find(FIND_SOURCES)
      Game.spawns[i].memory.popgoal['harvester'] = sources.length * 2
    }
  }

  //  Spawn new creeps
  for (var i in Game.spawns) {
    var spawn = Game.spawns[i]
    var popgoals = spawn.memory.popgoal

    // Some types of creep become necessary depending on structures
    if (popgoals['repairer'] === 0) {
      repairables = spawn.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_TOWER);
        }
      })
      if (repairables.length > 0) {
        popgoals['repairer'] = 1
      }
    }


    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var couriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'courier');

    var msg = '';
    msg += (popgoals['harvester'] > 0) ? 'Harvesters: ' + harvesters.length + '/' + popgoals['harvester'] + ' ' : '';
    msg += (popgoals['upgrader'] > 0) ? 'Upgraders: ' + upgraders.length + '/' + popgoals['upgrader'] + ' ' : '';
    msg += (popgoals['builder'] > 0) ? 'Builders: ' + builders.length + '/' + popgoals['builder'] + ' ' : '';
    msg += (popgoals['repairer'] > 0) ? 'Repairers: ' + repairers.length + '/' + popgoals['repairer'] + ' ' : '';
    msg += (popgoals['claimer'] > 0) ? 'Claimers: ' + claimers.length + '/' + popgoals['claimer'] + ' ' : '';
    msg += (popgoals['courier'] > 0) ? 'Couriers: ' + couriers.length + '/' + popgoals['courier'] + ' ' : '';
    console.log(msg);

    var needs = {
      'harvester': harvesters.length < popgoals['harvester'],
      'upgrader': upgraders.length < popgoals['upgrader'],
      'builder': builders.length < popgoals['builder'],
      'claimer': claimers.length < popgoals['claimer'],
      'repairer': repairers.length < popgoals['repairer'],
      'courier': repairers.length < popgoals['courier'],
    }

    var newName;
    if (needs['harvester']) {
      // Harvesters are important, so steal other roles' creeps
      var subFound = false;
      for (var c in Game.creeps) {
        var creep = Game.creeps[c];
        if (creep.memory.role !== 'harvester' && creep.memory.role !== 'courier') {
          if (creep.getActiveBodyparts(WORK) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.getActiveBodyparts(MOVE) > 0) {
            roleHarvester.convert(creep)
            subFound = true;
            break;
          }
        }
      }

      if (subFound === false) {
        roleHarvester.build()
      }

    }

    if (needs['upgrader']) {
      // Having at least one upgrader is important
      var subFound = true
      if (upgraders.length < 1) {
        subFound = false;
        for (var c in Game.creeps) {
          var creep = Game.creeps[c];
          if (creep.memory.role !== 'harvester' && creep.memory.role !== 'courier' && creep.memory.role !== 'upgrader') {
            if (creep.getActiveBodyparts(WORK) > 0 && creep.getActiveBodyparts(CARRY) > 0 && creep.getActiveBodyparts(MOVE) > 0) {
              roleUpgrader.convert(creep)
              subFound = true;
              break;
            }
          }
        }
      }
      if (subFound === false) {
        newName = spawn.createCreep([WORK, CARRY, MOVE], undefined, {
          role: 'upgrader'
        });
      }
    }

    if (needs['courier']) {
      roleCourier.spawn(popgoals['courier'])
    }

    if (needs['builder']) {
      roleBuilder.build()
    }

    if (needs['claimer']) {
      newName = spawn.createCreep([CLAIM, CLAIM, MOVE], undefined, {
        role: 'claimer'
      });
    }

    if (needs['repairer']) {
      roleRepairer.build()
    }

    if (spawn.spawning) {
      var spawningCreep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text(
        '🛠️' + spawningCreep.memory.role,
        spawn.pos.x + 1,
        spawn.pos.y, {
          align: 'left',
          opacity: 0.8
        });
    }
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
    if (creep.memory.role == 'recycle') {
      roleRecycle.run(creep);
    }
    if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
    if (creep.memory.role == 'courier') {
      roleCourier.run(creep);
    }
  }
}
