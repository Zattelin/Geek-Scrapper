var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/HeadlinesDB';
mongoose.connect(MONGODB_URI);

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: false}));

// allow the handlesbars engine to be in our toolset
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Make public a static dir to serve our static files
app.use(express.static(__dirname + "/public"));
mongoose.connect("mongodb://localhost/geekdb");
var db = mongoose.connection;

// console errors
db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

// console message when mongoose connects to db
db.once("open", function () {
  console.log("Mongoose connection successful.");
});

// Require routes in our controllers
require("./controllers/articlesController.js")(app);

//Listen on PORT 3000
app.listen(PORT, function () {
  console.log("App running on port 3000");
});