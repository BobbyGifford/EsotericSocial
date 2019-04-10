const express = require("express");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const postController = require("../controllers/post");
const router = express.Router();
const MIME_TYPE_MAP = {
  "images/PNG": "png",
  "images/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

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
  postController.createPost
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  postController.updatePost
);

router.get("", postController.getPosts);

router.get("/:id", postController.getPostById);

router.delete("/:id", checkAuth, postController.deletePost);

module.exports = router;
