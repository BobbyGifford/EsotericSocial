const express = require("express");
const multer = require("multer");

const router = express.Router();
const MIME_TYPE_MAP = {
  "images/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};
const PostModel = require("../models/post");

const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    fn(null, "backend/images");
  },
  filename: (req, file, fn) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    fn(null, name + "-" + Date.now() + "." + ext);
  }
});

router.post(
  "",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new PostModel({
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename
    });
    post.save().then(result => {
      console.log(result);
      res.status(201).json({
        message: "Post added successfully",
        post: {
          id: result._id,
          title: result._title,
          content: result.content,
          category: result.category,
          imagePath: result.imagePath
        }
      });
    });
  }
);

router.put(
  "/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;

    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }

    const post = new PostModel({
      _id: req.body.id,
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      imagePath: imagePath
    });
    console.log(post);

    PostModel.updateOne({ _id: req.params.id }, post)
      .then(result => {
        console.log(result);
        res.status(200).json({ message: "Update successfull" });
      })
      .catch(err => {
        console.log(err);
      });
  }
);

router.get("", (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const category = req.query.category;

  let postQuery;
  let fetchedPosts;

  if (category === "all") {
    postQuery = PostModel.find();
  } else {
    postQuery = PostModel.find({ category: category });
  }

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return PostModel.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Got Posts",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
});

router.get("/:id", (req, res, next) => {
  PostModel.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
});

router.delete("/:id", (req, res, next) => {
  PostModel.deleteOne({ _id: req.params.id })
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
    });
  res.status(200).json({ message: "Post deleted" });
});

module.exports = router;
