var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function() {
  return gulp.src(['src/core.js','./src/**/*.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./public/'));
});

gulp.task('styles', function() {
  return gulp.src('./src/**/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./public/'));
});