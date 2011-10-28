var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/library2');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


// LOCATION MODEL
var Location = new Schema({
    loc         : [Number, Number]
  , name          : { type: String, unique: true }
  , created_at    : Date
  , books  : [BooksInLoc]
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

// Find location by name
Atlas.prototype.findByName = function(name, callback){
  Location.findOne({ name: name }, function(err, location) {
    if(!err){
      callback(null, location);
    }
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
      loc : location['loc']
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

// Save Book in Location
Atlas.prototype.saveBookToLocation = function(name, slug, callback){
  Location.findOne({ name: name }, function(err, location){
    var myBook = {
        book_slug       : slug
      , createdAt       : new Date()
    }
    if(!err){
      location.books.push(myBook);
      location.save(function(err){
			  if(!err){
			    console.log(slug + " has been saved to this Chapter");
			    callback();
			  }
			});
    }
  });
}


// Save Chapter in Location
// To Do: Poorly executed. Change slug to Id to take advantage of mongoose's nested .id method
Atlas.prototype.saveChapterToLocation = function(name, slug, chapId, callback){
  Location.findOne({ name: name }, function(err, location){
    var bookList = location.books;
    for(i=0; i < bookList.length; i++) {
        if(bookList[i]['book_slug'] == slug) {
          bookList[i].chapters_in_loc.push({
              chapterId       : chapId
            , created_at      : new Date()
          });
        } 
      }
    location.books = bookList;
    location.save(function(err){
      if(err){
        console.log("Error! " + err);
      }
		  if(!err){
		    callback(null, location);
		  }
		});

  });
}



exports.Atlas = Atlas;