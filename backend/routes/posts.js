const express = require('express');

const router = express.Router();
const PostModel = require('../models/post');

router.post("", (req, res, next) => {
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

router.put("/:id", (req, res, next) => {
  const post = new PostModel({
    _id: req.body.id,
    title: req.body.title,
    category: req.body.category,
    content: req.body.content
  })
  PostModel.updateOne({_id: req.params.id}, post).then((result) => {
    console.log(result);
    res.status(200).json({message: 'Update successfull'})
  })
    .catch((err) => {
      console.log(err);
    })
});

router.get('', (req, res) => {
  PostModel.find().then(documents => {
    res.status(200).json({
      message: "Got Posts",
      posts: documents
    })
  });
});

router.get("/:id", (req, res, next) => {
  PostModel.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post)
    } else {
      res.status(404).json({message: "Post not found"})
    }
  })
})

router.delete("/:id", (req, res, next) => {
  PostModel.deleteOne({_id: req.params.id}).then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });
  res.status(200).json({message: "Post deleted"})
});

module.exports = router;
