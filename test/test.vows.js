var vows = require('vows')
  , tobi = require('tobi')
  , port = 80
  , host = 'www.google.com';

/**
 * Topic macro to GET a url.
 */
var getUrl = function(url) {
  return function() {
    var browser = tobi.createBrowser(port, host);
    browser.get(url, this.callback.bind(this, null));
  }
}

/**
 * Sample test.
 */
vows.describe('Tobi Test').addBatch({
  'A request to the frontpage of google': {
    topic: getUrl('/'),
    
    'should have a status of 200': function(_, res, $){
      res.should.have.status(200);
    },
    'should have an image with alt="Google"': function(_, res, $) {
      $('img[alt="Google"]').should.exist;
    }
  }
  
}).export(module);
