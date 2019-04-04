const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");
const app = express();

mongoose
  .connect(keys.mongoURI, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => {
    console.log("Connected to db");
  })
  .catch(() => {
    console.log("Error connecting to db");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
