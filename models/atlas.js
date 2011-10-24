var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/totallynewdb');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


// LOCATION MODEL
var Location = new Schema({
    loc         : [Number, Number]
  , name          : String
  , created_at    : Date
  , books_in_loc  : [BooksInLoc]
});

var BooksInLoc = new Schema({
    bookId      : Number
  , chapters_in_loc  : [ChaptersInLoc] 
  , created_at  : Date
});

var ChaptersInLoc = new Schema({
    chapterId   : Number
  , created_at  : Date
});

mongoose.model('Location', Location);
var Location = mongoose.model('Location');

var Atlas = function(){};

//Find all locations
Atlas.prototype.findAll = function(callback) {
  Location.find({}, function (err, locations) {
    callback( null, locations );
  });  
};

//Find location by ID
Atlas.prototype.findById = function(id, callback) {
  Location.findById(id, function (err, location) {
    if (!err) {
	  callback(null, location);
	}
  });
};

//Create a new location
Atlas.prototype.save = function(params, callback) {
  var location = new Location({lat: params['lat'], lng: params['lng'], name: params['name'], created_at: new Date()});
  location.save(function (err) {
    callback();
  });
};

//Delete a location
Atlas.prototype.deleteLocation = function(id, callback){
  Location.findById(id, function (err, location) {
    if (!err) {
	  	location.remove(callback);
		}
  });
};

//Add bookId to location
Atlas.prototype.addBookToLocation = function(locationId, book_in_loc, callback) {
  this.findById(locationId, function(error, location) {
    if(error){
	    callback(error);
	  }
	  else {
	    location.books_in_location.push(book_in_loc);
  	  location.save(function (err) {
  	    if(!err){
  		    callback();
  	    }	
	  });
    }
  });
};

//Add Chapter to book_in_loc
Atlas.prototype.addChapterToBookInLoc = function(locationId, bookId, chapter_in_loc, callback) {
  this.findById(locationId, function(error, location) {
		if(error){
			callback(error);
		} else{
			var book = location.books_in_loc.id(bookId);
			book.chapters_in_loc.push(chapter_in_loc);
			book.save(function(err){
			  if(!err){
			    callback();
			  }
			});
		}
	});
};

exports.Atlas = Atlas;