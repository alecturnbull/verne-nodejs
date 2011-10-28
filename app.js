
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
  app.use(express.session({ secret: 'gasworks park' }));
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



/////////////////////////////
// DB
////////////////////////////
var Librarian = require('./models/Librarian').Librarian;
var Librarian = new Librarian();
var Atlas = require('./models/Atlas').Atlas;
var Atlas = new Atlas();

// Placemaker
var PlaceMaker = require('./placemaker').PlaceMaker;
var PlaceMaker = new PlaceMaker();



///////////////////////////////
// Route Middleware 
///////////////////////////////
var authCheck = function(req, res, next){
  if(req.session && req.session.auth == true) {
    next();
  } else {
    res.redirect('/login');
  }
}

///////////////////////////////
// Routes 
///////////////////////////////

///////////////////////////////
// Authentication 
///////////////////////////////

app.get('/login', function(req, res){
  if (req.session && req.session.auth == true){
    var welcome = "Welcome, you're logged in"
  } else {
    var welcome = "Please log in"
  }
  res.render('login', {
    locals: {
        title: "Login"
      , welcome: welcome
    }
  });
});

app.post('/login', function(req, res){
  var user = req.param('user');
  var pwd = req.param('pwd');
  if( user == "admin" && pwd == "admin" ){
    req.session.auth = true;
    res.redirect('/');
  } 
  else {
    res.render('login', {
      locals: {
        title: 'Login Failed, Try Again'
      }
    });
  }
});

app.get('/logout', function(req, res){
  if(req.session){
    req.session.destroy();
  }
  res.redirect('/login');
});



///////////////////////////////
// Index 
///////////////////////////////

app.get('/', function(req, res){
  Librarian.findAll(function(err, books){
    res.render('index', {
	        locals: {
	          title: 'The Library',
	          books: books
	        }
	});
  });
});



///////////////////////////////
// Locations 
///////////////////////////////

app.get('/locations', function(req, res){
  Atlas.findAll(function(err, locations){
    res.render('location_list', {
      locals: {
        title: 'Locations',
        locations: locations
      }
    });
  });
});



///////////////////////////////
// Books 
///////////////////////////////

//new book
app.get('/books/new', function(req, res){
  res.render('book_new', {
             locals: {
               title: 'New Book'
             }
  });
});

//create book
app.post('/books/new', function(req, res){
  Librarian.save({
		title: req.param('title'),
    author: req.param('author')
  }, function(error, docs) {
	res.redirect('/');
  });
});

//show book
app.get('/books/:slug', function(req, res){
	Librarian.findBySlug(req.param('slug'), function(err, book){
		res.render('book_show', {
			locals: {
				  id		: book._id.toHexString()
				, title	: book.title
				, author: book.author
				, slug  : book.book_slug
				, book: book
			}
		});
	});
});

//edit book
app.get('/books/:slug/edit', function(req, res){
	Librarian.findBySlug(req.param('slug'), function(err, book){
		res.render('book_edit', {
			locals: {
				  title: book.title
				, author: book.author
				, slug: book.book_slug
				, book: book
			}
		});
	});
});

//update book
app.post('/books/:slug/edit', function(req, res){
	Librarian.updateBySlug(req.param('slug'), req.body, function(err, book){
		res.redirect('/');
	});
});

//delete book
app.post('/books/:slug/delete', function(req, res){
	Librarian.deleteBookBySlug(req.param('slug'), function(err, docs){
		res.redirect('/');
	});
});



///////////////////////////////
// Chapters 
///////////////////////////////

//add chapter
app.post('/books/addChapter', function(req, res){
	Librarian.addChapterToBookBySlug(req.body.slug, {
		chapNumber	: req.body.chapNumber,
		content			: req.body.content,
		created_at	: new Date()
	}, function(err, docs) {
		res.redirect('/books/' + req.body.slug);
	});
});

//delete chapter
app.post('/books/:slug/deleteChapter/:chapId', authCheck, function(req, res){
	Librarian.deleteChapterFromBookBySlug(req.param('slug'), req.param('chapId'), function(err, docs){
		res.redirect('/books/' + req.param('slug'));
	})
});


// Discover Locations Via Placemaker
app.post('/books/:slug/findLocations/:chapId', function(req, res){
  PlaceMaker.findPlaces(req.param('slug'), req.param('chapId'), function(err){
    res.redirect('/books/' + req.param('slug'));
  });
});

// Clear Locations in Chapter
app.post('/books/:slug/clearLocations/:chapId', function(req, res){
  Librarian.clearLocationsInChapter(req.param('slug'), req.param('chapId'), function(err){
    res.redirect('/books/' + req.param('slug'));
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
