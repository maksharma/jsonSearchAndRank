'use strict';

module.exports = {
  host: 'localhost',
  port: 6379,
  validate_ttl: 60 * 20,
  search_ttl: 60 * 10,
  pcache_ttl: 60 * 60 * 1,
  disperse_percent : 10,
  pcache_exp: 1000 * 60 * 20, //In milliseconds
  maxAge: {
    long: 1000 * 60 * 60, //60 minutes
    short: 1000 * 60 * 15 //15 minutes
  }
};
