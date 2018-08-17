var request = require("request");
var cheerio = require("cheerio");
// Requiring comment and article models
var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

module.exports = function (app) {

  app.get('/', function (req, res) {
    res.redirect('/articles');
  });

  app.get("/scrape", function (req, res) {
    request("https://geekologie.com/", function (error, response, html) {
      var $ = cheerio.load(html);
      // grab every a tag link within an article heading
      $("article.post-summary h2 a").each(function (i, element) {
        var title = $(this).text();
        var link = $(this).attr("href");

        if (title && link) {
          // save an object
          var result = {
            title: title,
            link: link
          };

          // Article model to create a new entry
          Article.create(result).then(function (doc) {
            console.log(doc);
          }).catch(function (err) {
            console.log(err);
          });
        }
      });
    });
    // trying to reload after a scrape
    res.redirect("/");
  });

  // get the articles we scraped from the mongoDB
  app.get("/articles", function (req, res) {
    Article.find({}, function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          res.render("index", {
            result: doc
          });
        }
        // sort articles by the most recent
      })
      .sort({
        '_id': -1
      });
  });

  // grab article by Id
  app.get("/articles/:id", function (req, res) {
    Article.findOne({
        "_id": req.params.id
      })
      .populate("comment")
      .exec(function (error, doc) {
        if (error) {
          console.log(error);
        } else {
          res.render("comments", {
            result: doc
          });
        }
      });
  });

  // Create a new comment
  app.post("/articles/:id", function (req, res) {
    Comment.create(req.body, function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        Article.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $push: {
              "comment": doc._id
            }
          }, {
            safe: true,
            upsert: true,
            new: true
          })
          .exec(function (err, doc) {
            if (err) {
              console.log(err);
            } else {
              res.redirect('back');
            }
          });
      }
    });
  });

  app.delete("/articles/:id/:commentid", function (req, res) {
    Comment.findByIdAndRemove(req.params.commentid, function (error, doc) {
      if (error) {
        console.log(error);
      } else {
        console.log(doc);
        Article.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $pull: {
              "comment": doc._id
            }
          })
          .exec(function (err, doc) {
            if (err) {
              console.log(err);
            }
          });
      }
    });
  });

};