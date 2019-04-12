const PostModel = require("../models/post");

exports.createPost = (req, res, next) => {
  // const url = req.protocol + "://" + req.get("host");
  console.log(req.file.key);

  const url = process.env.AWS_IMAGE_URL;
  const post = new PostModel({
    title: req.body.title,
    category: req.body.category,
    content: req.body.content,
    // imagePath: url + "/images/" + req.file.filename,
    imagePath: url + "/" + req.file.key,
    creator: req.userData.userId
  });
  post
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...result,
          id: result._id
        }
      });
    })
    .catch(error => {
      res.status(500).json({ message: "Post creation failed" });
    });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;

  if (req.file) {
    // const url = req.protocol + "://" + req.get("host");
    const url = process.env.AWS_IMAGE_URL;
    // imagePath = url + "/images/" + req.file.filename;
    imagePath = url + "/" + req.file.key;
  }
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
      if (result.n > 0) {
        res.status(200).json({ message: "Update successfull" });
      } else {
        res.status(401).json({ message: "Not authorized" });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Could not update post" });
    });
};

exports.getPosts = (req, res) => {
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
    })
    .catch(error => {
      res.status(500).json({ message: "Fetching posts failed." });
    });
};

exports.getPostById = (req, res, next) => {
  PostModel.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Fetching post failed." });
    });
};

exports.deletePost = (req, res, next) => {
  PostModel.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({ message: "Deleted successfull" });
      } else {
        res.status(401).json({ message: "Not authorized" });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Deleting post failed." });
    });
};
