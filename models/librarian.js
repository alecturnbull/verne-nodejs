var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/library');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

// BOOK MODEL

var ChapterLocations = new Schema({
    loc         : [Number, Number]
	, name        : String
	, text				: String
	, created_at	: Date	
});

var Chapters = new Schema({
    chapNumber : Number
  , content    : String
  , created_at : Date
	, locations	 : [ChapterLocations]
});

var Book = new Schema({
    author      : String
  , title       : String
  , book_slug   : {type: String, unique: true, lowercase: true }
  , created_at  : Date
  , chapters    : [Chapters]
});


mongoose.model('Book', Book);
var Book = mongoose.model('Book');

var Librarian = function(){};

//Find all Books
Librarian.prototype.findAll = function(callback) {
  Book.find({}, function (err, books) {
    callback( null, books )
  });  
};

//Find book by slug
Librarian.prototype.findBySlug = function(slug, callback) {
  Book.find({ book_slug : slug }, function(err, book){
    if(!err) {
      callback(null, book[0]);
    }
  });
};

//Update book by slug
Librarian.prototype.updateBySlug = function(slug, body, callback) {
  Book.find({ book_slug : slug }, function (err, book) {
    if (!err) {
      var book = book[0];
	    book.title = body.title;
  	  book.author = body.author;
  	  book.slug = body.slug;
  	  book.save(function (err) {
  	    callback();
  	  });
	}
  });
};

//Delete a book by slug
Librarian.prototype.deleteBookBySlug = function(slug, callback){
  Book.find({ book_slug : slug }, function (err, book) {
    if (!err) {
      var book = book[0];
	  	book.remove(callback);
		}
  });
};

//Find book by ID
Librarian.prototype.findById = function(id, callback) {
  Book.findById(id, function (err, book) {
    if (!err) {
	  callback(null, book);
	}
  });
};

//Update book by ID
Librarian.prototype.updateById = function(id, body, callback) {
  Book.findById(id, function (err, book) {
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
  Book.find({ book_slug : slug }, function (err, book) {
    if(err){
	    callback(error);
	  }
    else {
      var book = book[0];
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
  Book.find({ book_slug : slug }, function (err, book) {
		if(!err) {
		  var book = book[0];
			book.chapters.id(chapterId).remove();
			book.save(function(err){
				callback();
			});
		}
	});
};

// Find a chapter by slug
Librarian.prototype.findChapterInBookBySlug = function(slug, chapterId, callback){
  Book.find({ book_slug : slug }, function (err, book) {
    if(!err) {
      var book = book[0];
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
	  Book.find({ book_slug : slug }, function (err, book) {
		if(err){
			callback(err);
		} else{
		  var book = book[0];
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
	  Book.find({ book_slug : slug }, function (err, book) {
		if(err){
			callback(err);
		} else{
		  var book = book[0];
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
