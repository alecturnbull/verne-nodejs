
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

///////////////////////////////
// Config 
///////////////////////////////

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// DB
var Librarian = require('./models/Librarian').Librarian;
var Librarian = new Librarian();
var Atlas = require('./models/Atlas').Atlas;
var Atlas = new Atlas();

// Placemaker
var PlaceMaker = require('./placemaker').PlaceMaker;
var PlaceMaker = new PlaceMaker();

///////////////////////////////
// Routes 
///////////////////////////////


//index
app.get('/', function(req, res){
  Librarian.findAll(function(err, books){
    res.render('index', {
	        locals: {
	          title: 'The Library',
	          books: books
	        }
	});
  })
});

//new
app.get('/books/new', function(req, res){
  res.render('book_new', {
             locals: {
               title: 'New Book'
             }
  });
});

//create
app.post('/books/new', function(req, res){
  Librarian.save({
		title: req.param('title'),
    author: req.param('author')
  }, function(error, docs) {
	res.redirect('/');
  });
});

//show book
app.get('/books/:id', function(req, res){
	Librarian.findById(req.param('id'), function(err, book){
		res.render('book_show', {
			locals: {
				id		: book._id.toHexString(),
				title	: book.title,
				author: book.author,
				book: book
			}
		});
	});
});

//edit book
app.get('/books/:id/edit', function(req, res){
	Librarian.findById(req.param('id'), function(err, book){
		res.render('book_edit', {
			locals: {
				title: book.title,
				author: book.author,
				book: book
			}
		});
	});
});

//update book
app.post('/books/:id/edit', function(req, res){
	Librarian.updateById(req.param('id'), req.body, function(err, book){
		res.redirect('/');
	});
});

//delete book
app.post('/books/:id/delete', function(req, res){
	Librarian.deleteBook(req.param('id'), function(err, docs){
		res.redirect('/');
	});
});


//add chapter
app.post('/books/addChapter', function(req, res){
	Librarian.addChapterToBook(req.body._id, {
		chapNumber	: req.body.chapNumber,
		content			: req.body.content,
		created_at	: new Date()
	}, function(err, docs) {
		res.redirect('/books/' + req.body._id);
	});
});

//delete chapter
app.post('/books/:id/deleteChapter/:chapId', function(req, res){
	Librarian.deleteChapterFromBook(req.param('id'), req.param('chapId'), function(err, docs){
		res.redirect('/books/' + req.param('id'));
	})
});


//find Locations
app.post('/books/:id/findLocations/:chapId', function(req, res){
  PlaceMaker.findPlaces(req.param('id'), req.param('chapId'), function(err){
    res.redirect('/books/' + req.param('id'));
  });
});


///////////////////////////////
// Server Start  
///////////////////////////////

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
