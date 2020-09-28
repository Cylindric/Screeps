"use strict";

var taskCharge = require('task.charge')
var taskRepair = require('task.repair')
var taskCollect = require('task.collect')
var taskDeliver = require('task.deliver')
var taskHarvest = require('task.harvest')

var actions = {

    harvest: function() {},

    charge: function(creep) {
        taskCharge.do(creep)
    },

    repair: function(creep) {
        taskRepair.do(creep)
    },

    collect: function(creep) {
        taskCollect.do(creep)
    },

    deliver: function(creep) {
        taskDeliver.do(creep)
    },

    harvest: function(creep) {
        taskHarvest.do(creep)
    },

}

module.exports = actions // jshint ignore:line
