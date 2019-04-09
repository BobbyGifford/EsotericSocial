const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();
const MIME_TYPE_MAP = {
  "images/PNG": "png",
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
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new PostModel({
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId
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
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;

    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }

    // const post = new PostModel({
    //   _id: req.body.id,
    //   title: req.body.title,
    //   category: req.body.category,
    //   content: req.body.content,
    //   imagePath: imagePath
    // });

    const updateInfo = {
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      imagePath: imagePath
    };

    PostModel.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      updateInfo
    )
      .then(result => {
        if (result.nModified > 0) {
          res.status(200).json({ message: "Update successfull" });
        } else {
          res.status(401).json({ message: "Not authorized" });
        }
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
    postQuery = PostModel.find().sort("-date");
  } else {
    postQuery = PostModel.find({ category: category }).sort("-date");
  }

  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      if (category === "all") {
        return PostModel.countDocuments();
      } else {
        return PostModel.find({ category: category }).countDocuments();
      }
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

router.delete("/:id", checkAuth, (req, res, next) => {
  PostModel.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deleted successfull" });
      } else {
        res.status(401).json({ message: "Not authorized" });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
