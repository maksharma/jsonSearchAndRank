'use strict';

var debug = require('debug')('redis-search');
var _ = require('lodash');
var redis = require('./redis');
var util = require('util');

const DEFAULT_TTL = 60*5;//5 min
var redisUtil = {
  setx: function (key, data, ttl, cb) {
    var value = JSON.stringify(data);
      redis.setex(key, ttl || DEFAULT_TTL, value, function (err) {
        if (cb) {
          cb(err, data);
        }
      });
  },

  getx: function (key, cb) {
      redis.get(key, respond);

    function respond(err, data) {
      var searchResult;
      if (!err && data) {
        try {
          searchResult = JSON.parse(data);
        } catch (e) {
          err = new Error('Error parsing search data from redis: ' + data);
        }
      } else {
        err = err || new Error('No search results found in redis for key:' + key);
      }

      cb(err, searchResult);
    }
  },
};

module.exports = redisUtil;
