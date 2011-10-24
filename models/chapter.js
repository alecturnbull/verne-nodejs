var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/books');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Chapter = new Schema({
    book_slug  : String
  , chapNumber : Number
  , content    : String
  , created_at : Date
	, locations	 : [ChapterLocations]
});

var ChapterLocations = new Schema({
		loc 		    : [Number, Number]
	, name        : String
	, text				: String
	, created_at	: Date	
});


mongoose.model('Chapter', Chapter);
var Chapter = mongoose.model('Chapter');




var Chapter = function(){};


Chapter.prototype.save = function(params, callback) {
  var chapter = new Chapter({book_slug: params['book_slug'], chapNumber: params['chapNumber'], content: params['content'], created_at: new Date()});
  chapter.save(function (err) {
    if(err) { console.log("Book not added \n" + err ); callback(err); }
    else {
      callback();
    }
  });
};

Chapter.prototype.findAll = function(callback) {
  Chapter.find({}, function (err, chapters) {
    if(err) { console.log("Error \n" + err); callback(err); }
    else {
      callback( null, chapters );
    }
  });  
};

Chapter.prototype.findById = function(id, callback) {
  Chapter.findById(id, function (err, chapter) {
    if(err) { console.log("Error \n" + err); callback(err); }
	  else { 
	    callback(null, chapter) };
	  }
  });
};

Chapter.prototype.updateById = function(id, body, callback) {
  Chapter.findById(id, function (err, chapter) {
    if(err) { console.log("Error \n" + err); callback(err); }
    else {
	    chapter.bookId = body.bookId;
  	  chapter.chapNumber = body.chapNumber;
  	  chapter.content = body.content;
  	  chapter.locations = body.locations;
  	  chapter.save(function (err) {
  	    if (err) { console.log("Error \n" + err) }
  	    callback();
	  });
	}
  });
};

Chapter.prototype.deleteChapter = function(id, callback){
  Chapter.findById(id, function (err, chapter) {
    if(err) { console.log("Error \n" + err); callback(err); }
    else {
	    chapter.remove(callback);
	  }
  });
};

Chapter.prototype.addLocationToChapter = function(chapterId, location, callback) {
  this.findById(chapterId, function(err, chapter) {
    if(err) { console.log("Error \n" + err); callback(); }
    else {
	    chapter.locations.push(location);
  	  chapter.save(function (err) {
  	    if(err) { console.log("Error \n" + err); callback(err); }
  		  else {
  		    callback();
  	    }	
	    });
    }
  });
};

//Delete a location
Chapter.prototype.deleteLocationFromChapter = function(chapterId, locationId, callback){
	Chapter.findById(chapterId, function(err, chapter) {
    if(err) { console.log("Error \n" + err); callback(); }
    else {
			chapter.locations.id(locationId).remove();
			chapter.save(function(err){
				if(err) { console.log("Error \n" + err); callback(err); }
  		  else {
  		    callback();
  	    }
			});
		}
	});
};


exports.Chapter = Chapter;
