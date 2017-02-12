"use strict";

var taskRepair = require('task.repair')

var actions = {

  harvest: function() {},

  repair: function(creep) {
    taskRepair.do(creep)
  }

}

module.exports = actions // jshint ignore:line
