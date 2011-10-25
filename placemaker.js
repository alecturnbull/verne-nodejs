// We need this to build our post string
var querystring = require('querystring');
var http = require('http');

// To save to DB
var Librarian = require('./models/librarian').Librarian;
var Librarian = new Librarian();
var Atlas = require('./models/atlas').Atlas;
var Atlas = new Atlas();

// Extend Object Prototype for size of Associative Array
Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var PlaceMaker = function(){};

PlaceMaker.prototype.apikey = "QH09bmrV34EalhLLfJMIScuOw2CibQ9y_3CVr8iIlP4SMTc1tHHLVFt.Yd2hYFPeyoevJk0bG5tW2F.CVP6slxWwqUlsLgw-";

PlaceMaker.prototype.findPlaces = function (slug, chapterId, callback){
	
  Librarian.findChapterInBookBySlug(slug, chapterId, function(err, chapter){
    var myContent = chapter.content;
    	  
    // Build the post string from an object
    var post_data = querystring.stringify({
        'documentContent' : myContent,
        'documentType': 'text/plain',
        'outputType': 'json',
       	'appid': this.apikey
    });

  	var post_options = {
        host: 'wherein.yahooapis.com',
        port: '80',
        path: '/v1/document',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
        }
    };

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
  			var rawLocs = '';
        res.addListener('data', function (chunk) {
  				rawLocs += chunk;
        });
  			res.addListener('end', function(){
				  var parsedLocs = JSON.parse(rawLocs).document;
				  var numberOfLocations = Object.size(parsedLocs) - 5; // 5 are: administrativeScope, geographicScope, localScopes, extents, referenceList
  				var references = parsedLocs.referenceList;
  				if(!references) {
  				  console.log("No locations found");
  				} else {
    				if (numberOfLocations == 1) {
    				  var coords = parsedLocs['placeDetails']['place']['centroid'];
    				  var name = parsedLocs['placeDetails']['place']['name'];
    				  var referenceText = references['reference']['text'];
    				  var myLocation = {
  				        loc   : [coords.latitude, coords.longitude]
  				      , name  : name
  				      , text  : referenceText
  				    }
  				    var myChapterData = {
  				        book_slug : slug
  				      , chapId    : chapterId
  				    }
  				    Librarian.addLocationToChapter(slug, chapterId, myLocation, function(err){
  			        if(err){
  			          console.log(err);
  			        }
  			      });
  			      Atlas.save(myLocation, function(err){
  			        if(err){
  			          console.log(err);
  			        }
  			      });
  			      
  			      
    				} 
    				else {
    				  var placesByNumber = {};
    				  for(i=0; i < references.length; i++){
  				      var reference = references[i]['reference']['placeReferenceId'];
  				      var originalText = references[i]['reference']['text'];
  				      placesByNumber[reference] = originalText;
  				    }
    				  for(i=0; i < numberOfLocations; i++){
    				    var coords = parsedLocs[i]['placeDetails']['place']['centroid'];
    				    var name = parsedLocs[i]['placeDetails']['place']['name'];
    				    var refId = parsedLocs[i]['placeDetails']['placeReferenceIds'];
    				    var referenceText = placesByNumber[refId];
  				    
    				    var myLocation = {
    				        loc   : [coords.latitude, coords.longitude]
    				      , name  : name
    				      , text  : referenceText
    				    }
    				    Librarian.addLocationToChapter(slug, chapterId, myLocation, function(err){
  				        if(err){
  				         console.log(err);
  				        }
  				      });
  				      Atlas.save(myLocation, function(err){
    			        if(err){
    			          console.log(err);
    			        }
    			      });
    				  }
    				}
  				}
          callback();
  			});
    });

    //post the data
    post_req.write(post_data);
    post_req.end();
  }); //end of Librarian Query
}

exports.PlaceMaker = PlaceMaker;
