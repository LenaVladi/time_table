"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var run = require("run-sequence");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

gulp.task("style", function () {
  gulp.src("src/style/index.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("src/style"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("src/style"))
    .pipe(gulp.dest("docs/style"))
    .pipe(server.stream());
});

gulp.task("serve", ["style"], function () {
  server.init({
    server: "src/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  
  gulp.watch("src/style/**/*.{scss,sass}", ["style"]);
  gulp.watch("src/*.html").on("change", server.reload);
});

gulp.task("html", function () {
  return gulp.src("src/*.html")
    .pipe(gulp.dest("docs"))
});

gulp.task("copy", function () {
  return gulp.src([
    "src/image/**",
    "src/js/**"
  ], {
    base: "src"
  })
    .pipe(gulp.dest("docs"));
});

var del = require("del");
gulp.task("clean", function () {
  return del("docs");
});

gulp.task("html", function () {
  return gulp.src("src/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("docs"))
});

gulp.task("build", function (done) {
  run("clean", "style", "html", "copy", done);
});