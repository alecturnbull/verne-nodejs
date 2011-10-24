var vows = require('vows'),
    assert = require('assert'),
    should = require('should'),
    tobi = require('tobi'),
    http = require('http');
 
var HOST = 'localhost',
    PORT = 3000;
 
var suite = vows.describe('Routes');
 
var getUrl = function(url) {
  return function() {
    var browser = tobi.createBrowser(PORT, HOST);
    browser.get(url, this.callback.bind(this, null));
  }
}

var indexBatch = {
  'A request to the index page' : { 
    topic: getUrl('/'),
    
    'should respond with a 200 OK': function (e, res, $) {
      res.should.have.status(200);
    },
    'should have a link to create a new book': function(e, res, $) {
      should.exist('hello');
    }
  }
}

suite.addBatch(indexBatch);
 
suite.export(module)