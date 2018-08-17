// Require mongoose
var mongoose = require("mongoose");
// Create a schema
var Schema = mongoose.Schema;

// Create comment schema
var CommentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

var Comment = mongoose.model("Comment", CommentSchema);

// Exports the Comment model
module.exports = Comment;