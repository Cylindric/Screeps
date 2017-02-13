var roleHarvester = require('role.harvester')
var roleUpgrader = require('role.upgrader')
var roleBuilder = require('role.builder')
var roleClaimer = require('role.claimer')
var roleRecycle = require('role.recycle')
var roleRepairer = require('role.repairer')
var roleCourier = require('role.courier')

module.exports.loop = function() {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            // console.log('Clearing non-existing creep memory:', name);
        }
    }

    var desired_harvesters = 2;
    var desired_upgraders = 1;
    var desired_builders = 3;
    var desired_claimers = 0;
    var desired_repairers = 4;
    var desired_couriers = 4;

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var couriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'courier');

    var msg = '';
    msg += (desired_harvesters > 0) ? 'Harvesters: ' + harvesters.length + ' ' : '';
    msg += (desired_upgraders > 0) ? 'Upgraders: ' + upgraders.length + ' ' : '';
    msg += (desired_builders > 0) ? 'Builders: ' + builders.length + ' ' : '';
    msg += (desired_repairers > 0) ? 'Repairers: ' + repairers.length + ' ' : '';
    msg += (desired_claimers > 0) ? 'Claimers: ' + claimers.length + ' ' : '';
    msg += (desired_couriers > 0) ? 'Couriers: ' + couriers.length + ' ' : '';
    console.log(msg);


    var need_harvester = harvesters.length < desired_harvesters;
    var need_upgrader = upgraders.length < desired_upgraders;
    var need_builder = builders.length < desired_builders;
    var need_claimer = claimers.length < desired_claimers;
    var need_repairer = repairers.length < desired_repairers;
    var need_courier = couriers.length < desired_couriers;

    // Don't need couriers if we don't have containers
    if (need_courier) {
        var containers = Game.spawns.CylSpawn.room.find(FIND_MY_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_CONTAINER
            }
        });
        if (containers.length === 0) {
            need_courier = false;
        }
    }



    var newName;
    if (need_harvester) {
        if (harvesters.length < desired_harvesters) {
            roleHarvester.build()
        }
        if (harvesters.length < desired_harvesters) {
            newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE], undefined, {
                role: 'harvester'
            });
        }
        // console.log('Spawning new harvester: ' + newName);

    } else if (need_courier) {
        if (couriers.length === 0 && builders.length !== 0) {
            builders[0].memory.role = 'courier'
        } else {
            // If we have any builders, repurpose them
            roleCourier.build()
        }
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
        // console.log('Spawning new upgrader: ' + newName);

    } else if (need_builder) {
        if (builders.length >= 1) {
            roleBuilder.build()

        } else {
            newName = Game.spawns.CylSpawn.createCreep([WORK, CARRY, MOVE], undefined, {
                role: 'builder'
            });
        }
        // console.log('Spawning new builder: ' + newName);

    } else if (need_claimer) {
        newName = Game.spawns.CylSpawn.createCreep([CLAIM, CLAIM, CLAIM, MOVE, MOVE], undefined, {
            role: 'claimer'
        });
        // console.log('Spawning new claimer: ' + newName);

    } else if (need_repairer) {
        roleRepairer.build()
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
