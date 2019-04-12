const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const fileFilter = (req, file, cb) => {
  if (MIME_TYPE_MAP[file.mimetype]) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const isValid = MIME_TYPE_MAP[file.mimetype];
//     let error = new Error("Invalid mime type");
//     if (isValid) {
//       error = null;
//     }
//     cb(error, process.env.ROOT ? process.env.ROOT + "images" : "images");
//   },
//   filename: (req, file, cb) => {
//     const name = file.originalname
//       .toLowerCase()
//       .split(" ")
//       .join("-");
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     cb(null, name + "-" + Date.now() + "." + ext);
//   }
// });

// module.exports = multer({ storage: storage }).single("image");

aws.config.update({
  secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
  region: "us-west-2"
});

const s3 = new aws.S3();

const multerS3Config = multerS3({
  s3: s3,
  bucket: "esoteric-social-pics",
  acl: "public-read",
  metadata: function(req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function(req, file, cb) {
    // console.log(file)
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    //console.log("images/" +  name + "-" + Date.now() + "." + ext)
    cb(null, "images/" + name + "-" + Date.now() + "." + ext);
  }
});

const upload = multer({
  storage: multerS3Config,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
  }
});

module.exports = upload.single("image");
