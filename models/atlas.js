var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/library');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


// LOCATION MODEL
var Location = new Schema({
    loc         : [Number, Number]
  , name          : { type: String, unique: true }
  , created_at    : Date
  , books_in_loc  : [BooksInLoc]
});

var BooksInLoc = new Schema({
    book_slug       : String
  , chapters_in_loc : [ChaptersInLoc] 
  , created_at      : Date
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
Atlas.prototype.save = function(location, callback) {
  var location = new Location({
      lat: location['lat']
    , lng: location['lng']
    , name: location['name']
    , created_at: new Date()});
  location.save(function (err) {
    console.log(location.name + " has been saved to Locations");
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

exports.Atlas = Atlas;