var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/library');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// INDEX MODEL

var Reference = new Schema({
    chapter     : String
  , location    : String
  , loc_text    : String
  , created_at  : Date
});


mongoose.model('Reference', Reference);
var Reference = mongoose.model('Reference');

var Index = function(){};

//Find all References
Index.prototype.findAll = function(callback) {
  Reference.find({}, function (err, refs) {
    callback( null, refs );
  });  
};

//Find Reference by ID
Index.prototype.findById = function(id, callback) {
  Reference.findById(id, function (err, ref) {
    if (!err) {
	  callback(null, ref);
	}
  });
};

//Update Reference by ID
Index.prototype.updateById = function(id, body, callback) {
  Reference.findById(id, function (err, ref) {
    if (!err) {
	  book.title = body.title;
	  book.author = body.author;
	  book.save(function (err) {
	    callback();
	  });
	}
  });
};

//Create a new book
Librarian.prototype.save = function(params, callback) {
  var book = new Book({title: params['title'], author: params['author'], book_slug: params['author'].replace(/ /g,"_") + "—" + params['title'].replace(/ /g,"_"), created_at: new Date()});
  book.save(function (err) {
    if(err) {
      console.log("Book not added \n" + err );
      callback();
    } else {
      callback();
    }
  });
};

//Delete a book
Librarian.prototype.deleteBook = function(id, callback){
  Book.findById(id, function (err, book) {
    if (!err) {
	  	book.remove(callback);
		}
  });
};

//Add chapter to book by slug
Librarian.prototype.addChapterToBookBySlug = function(slug, chapter, callback) {
  Book.findOne({ book_slug : slug }, function (err, book) {
    if(err){
	    callback(error);
	  }
    else {
	    book.chapters.push(chapter);
  	  book.save(function (err) {
  	    if(!err){
  		    callback();
  	    }	
	  });
    }
  });
};


//Delete a chapter by slug
Librarian.prototype.deleteChapterFromBookBySlug = function(slug, chapterId, callback){
  Book.findOne({ book_slug : slug }, function (err, book) {
		if(!err) {
			book.chapters.id(chapterId).remove();
			book.save(function(err){
				callback();
			});
		}
	});
};

// Find a chapter by slug
Librarian.prototype.findChapterInBookBySlug = function(slug, chapterId, callback){
  Book.findOne({ book_slug : slug }, function (err, book) {
    if(!err) {
      var chapter = book.chapters.id(chapterId);
      callback(null, chapter);
    }
  })
};

//Add chapter to book
Librarian.prototype.addChapterToBook = function(bookId, chapter, callback) {
  this.findById(bookId, function(error, book) {
    if(error){
	  callback(error);
	}
    else {
	    book.chapters.push(chapter);
  	  book.save(function (err) {
  	    if(!err){
  		    callback();
  	    }	
	  });
    }
  });
};

//Delete a chapter
Librarian.prototype.deleteChapterFromBook = function(bookId, chapterId, callback){
	Book.findById(bookId, function(err, book) {
		if(!err) {
			book.chapters.id(chapterId).remove();
			book.save(function(err){
				callback();
			});
		}
	});
};

// Find a chapter
Librarian.prototype.findChapterInBook = function(bookId, chapterId, callback){
  Book.findById(bookId, function(err, book){
    if(!err) {
      var chapter = book.chapters.id(chapterId);
      callback(null, chapter);
    }
  })
};

// Add Locations
Librarian.prototype.addLocationToChapter = function(slug, chapterId, location, callback){
	  Book.findOne({ book_slug : slug }, function (err, book) {
		if(err){
			callback(err);
		} else{
			var chap = book.chapters.id(chapterId);
			chap.locations.push(location);
			book.save(function(err){
			  if(!err){
			    console.log(location.text + " has been saved to this Chapter")
			    callback();
			  }
			});
		}
	});
};

// Remove Locations
Librarian.prototype.clearLocationsInChapter = function(slug, chapterId, callback){
	  Book.findOne({ book_slug : slug }, function (err, book) {
		if(err){
			callback(err);
		} else{
			var chap = book.chapters.id(chapterId);
			chap.locations = [];
			book.save(function(err){
			  if(!err){
			    console.log("Locations removed from this chapter")
			    callback();
			  }
			});
		}
	});
};

exports.Librarian = Librarian;
