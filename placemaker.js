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
    


    
    var addRelevantInfoToLocations = function(myLocation, name, slug, chapterId) {
      
      var saveBookAndChapter = function(name, slug, chapterId){
        Atlas.saveBookToLocation(name, slug, function(err){
          if(!err){
            Atlas.saveChapterToLocation(name, slug, chapterId, function(err, location){
              for(i=0; i<location.books.length; i++){
                console.log(location.books[i]);
              }
            });
          }
       });
      };
      
      // first we check whether the location is in the DB
      Atlas.findByName(name, function(err, location) {
        if(location){
          console.log("Location already in system")
          var books = location.books;
          if(books){
            var bookInLocation = false;
            for(i=0; i < books.length; i++) {
              var book = books[i];
              if(book.book_slug == slug) {
                bookInLocation = true;
              }
            }
            if(bookInLocation) {
              Atlas.saveChapterToLocation(name, slug, chapterId, function(err, location){
                for(i=0; i<location.books.length; i++){
                  console.log(location.books[i]);
                }
              });
            } 
            else {
              saveBookAndChapter(name, slug, chapterId);
            }  
          } 
          else {
            console.log('no books recorded yet');
            // there are no books recorded yet
            saveBookAndChapter(name, slug, chapterId);
          }
        } 
        else {
          console.log("Location does not yet exist in system, adding...");
          // We add the location, then the book, then the chapter
          Atlas.save(myLocation, function(err){
            saveBookAndChapter(name, slug, chapterId, function(err, location){
              for(i=0; i<location.books.length; i++){
                console.log(location.books[i]);
              }
            });
		      });
        }
      });
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
  			      
  			      addRelevantInfoToLocations(myLocation, name, slug, chapterId);	      
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
                addRelevantInfoToLocations(myLocation, name, slug, chapterId);	 
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
