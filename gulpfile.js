const gulp = require('gulp');
const concat = require('gulp-concat');

const paths = {
  styles: {
    src: './src/**/*.css',
  },
  scripts: {
    src: ['src/core.js', './src/**/*.js'],
  },
  dest: './public/',
};

function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.dest));
}

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(paths.dest));
}

function watch() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}

gulp.task('scripts', scripts);
gulp.task('styles', styles);
gulp.task('watch', watch);
