// ###############################################################################
// Web Technology at VU University Amsterdam
// Assignment 3
//
// The assignment description is available on Canvas. 
// Please read it carefully before you proceed.
//
// This is a template for you to quickly get started with Assignment 3.
// Read through the code and try to understand it.
//
// Have you read the zyBook chapter on Node.js?
// Have you looked at the documentation of sqlite?
// https://www.sqlitetutorial.net/sqlite-nodejs/
//
// Once you are familiar with Node.js and the assignment, start implementing
// an API according to your design by adding routes.


// ###############################################################################
//
// Database setup:
// First: Our code will open a sqlite database file for you, and create one if it not exists already.
// We are going to use the variable "db' to communicate to the database:
// If you want to start with a clean sheet, delete the file 'phones.db'.
// It will be automatically re-created and filled with one example item.

const sqlite = require('sqlite3').verbose();
let db = my_database('./phones.db');

// ###############################################################################
// The database should be OK by now. Let's setup the Web server so we can start
// defining routes.
//
// First, create an express application `app`:

var express = require("express");
var app = express();

// We need some middleware to parse JSON data in the body of our HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.json());



// ###############################################################################
// Routes
// 
// TODO: Add your routes here and remove the example routes once you know how
//       everything works.

// add new phone
app.post("/add", function(req, res) {
   
    db.run(`INSERT INTO phones (brand, model, os, image, screensize)
                VALUES (?, ?, ?, ?, ?)`,
                [req.body['brand'], req.body['model'], req.body['os'], req.body['image'],  req.body['screensize']], (function(err,rows) {
	   if (err) {
		res.status(400).send(err);
	} 
	else {
	   res.status(201).json(rows);
	}
	}));
});




// get all phones (done)
app.get("/getall", function(req, res) {
    db.all("SELECT id, brand, model, os, image, screensize FROM phones", function(err, rows) {
		if (err) {
			res.status(400).send(err);
		 } 
		 else {
    	return res.status(200).json(rows);
		 }
    });
});

// get phone by id (done)
app.get("/get/:id", function(req, res) {
    db.all("SELECT id, brand, model, os, image, screensize FROM phones WHERE id="+ req.params.id , function(err, rows){
		if (err) {
			res.status(400).send(err);
		 } 
		 else {
    	return res.status(200).json(rows);
		 }
    });
});

// update phone by id
app.put("/update/:id", function(req, res) {
    db.run(`UPDATE phones
	SET brand=?, model=?, os=?, image=?,
	screensize=? WHERE id=?`,  
	[req.body['brand'], req.body['model'], req.body['os'], req.body['image'], req.body['screensize'], [req.params.id]], function(err, rows) {
		if (err) {
			res.status(400).send(err);
		 } 
		else if (rows === 0) {
			res.sendStatus(404);
		 } 
		else 
		{
    	return res.status(204).json(rows);	
		}
    });
});


// delete phone by id (almost done doesnt give empty me)
app.delete("/delete/:id", function(req, res) {
    db.run("DELETE FROM phones WHERE id=" + req.params.id, function(err, result) {
		if (err) {
			res.status(400).send(err);
		 } 
		 else if (result === 0) {
			res.sendStatus(404);
		 } 
		 else {
    	return res.sendStatus(204);
		 }
    });
});

// ###############################################################################

// This route responds to http://localhost:3000/db-example by selecting some data from the
// database and return it as JSON object.
// Please test if this works on your own device before you make any changes.
app.get('/db-example', function(req, res) {
    // Example SQL statement to select the name of all products from a specific brand
    db.all(`SELECT * FROM phones WHERE brand=?`, ['Fairphone'], function(err, rows) {
		if (err) {
			res.status(400).send(err);
		 }
		  else if (rows === 0) {
			res.sendStatus(404);
		 } 
		 else {
    	return res.status(200).json(rows);
		 }
    	// TODO: add code that checks for errors so you know what went wrong if anything went wrong
    	// TODO: set the appropriate HTTP response headers and HTTP response codes here.

    	// # Return db response as JSON
    });
});

app.post('/post-example', function(req, res) {
	// This is just to check if there is any data posted in the body of the HTTP request:
	console.log(req.body);
	return res.json(req.body);
});


// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);
console.log("Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello");

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
		db.all(`select count(*) as count from phones`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log('Inserted dummy phone entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}

