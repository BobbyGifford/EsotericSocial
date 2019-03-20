const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const PostModel = require('./models/post');

const app = express();

mongoose.connect("", {useNewUrlParser: true})
  .then(() => {
    console.log("Connected to db");
  }).catch(() => {
  console.log("Error connecting to db");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next()
});

app.post("/api/posts", (req, res, next) => {
  const post = new PostModel({
    title: req.body.title,
    category: req.body.category,
    content: req.body.content,
  })
  post.save().then(result => {
    console.log(result);
    res.status(201).json({
      message: 'Post added successfully',
      postId: result._id
    })
  });
});

app.get('/api/posts', (req, res) => {
  PostModel.find().then(documents => {
    res.status(200).json({
      message: "Got Posts",
      posts: documents
    })
  });
});

app.delete("/api/posts/:id", (req, res, next) => {
  PostModel.deleteOne({_id: req.params.id}).then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });
  res.status(200).json({message: "Post deleted"})
});

module.exports = app;
