var gulp         = require('gulp'),
    jshint       = require('gulp-jshint'),
    connect      = require('gulp-connect'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    minify       = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin     = require('gulp-imagemin'),
    sass         = require('gulp-sass'),
    rename       = require('gulp-rename');


gulp.task('server', function() {

  connect.server({
    port: 3000
  });

});

gulp.task('ci', function() {

  return gulp.src([
    'js/scripts/*',
  ])
  .pipe(jshint())
  .pipe(jshint.reporter('default', { verbose: true }))
  .pipe(jshint.reporter('fail'));

});

gulp.task('styles', function() {

  return gulp.src('css/sass/main.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'ios 6', 'android 4'))
    .pipe(concat('main.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minify())
    .pipe(gulp.dest('css/'));

});

gulp.task('scripts', function() {

  return gulp.src('js/scripts/wanna.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('js/'));

});

gulp.task('image', function() {

  return gulp.src('img/src/*')
    .pipe(imagemin({
      optimizationLevel: 5
    }))
    .pipe(gulp.dest('img/'));

});

gulp.task('default', ['server'], function() {

  gulp.watch('css/sass/*.scss', ['styles']);

  gulp.watch('js/scripts/*.js', ['scripts', 'ci']);

});
