'use strict';

var fs     = require('fs-extra');
var path   = require('path');
var _      = require('lodash');
var _s     = require('underscore.string');
var gitlabConection = require('gitlab');

var groupId;
var userId;

module.exports = exports = {

  init: function(options) {
    groupId = options.groupId;
    userId = options.userId;
  },

  connect: function(privateToken) {
    gitlabConection({
      url: 'http://gitlab.21tb.com',
      token: privateToken
    });
  },

  isDeveloperOfTeam: function(userId, groupId) {
    console.log(userId, groupId);
  },

  createProject: function(projectName) {
    console.log(projectName);
  }
};


