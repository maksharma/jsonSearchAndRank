"use strict";

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var baseUrl = "http://localhost:3000"

describe('check age', function () {
  it('order by relevance - score in descending order', function (done) {
      var searchApi = '/people-like-us?age=' + 50;
      chai.request(baseUrl).get(searchApi).end(function (err, res) {
        assert.equal(res.status, 200);        
        done(err);
      });

  });
});

describe('check age and experience', function () {
  it('order by relevance - score in descending order', function (done) {
      var searchApi = '/people-like-us?age=50&monthly income=1';
      chai.request(baseUrl).get(searchApi).end(function (err, res) {
        assert.equal(res.status, 200);        
        done(err);
      });

  });
});