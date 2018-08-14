#!/usr/bin/env nodejs

"use strict";

const gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  babel = require('gulp-babel'),
  folders = {
    src: {
      css: 'app/css/',
      js: 'app/es6/'
    },
    built: {
      css: 'assets/css/',
      js: 'assets/js/'
    }
  },
  plugins = [
    require('autoprefixer')(),
    require('postcss-nested')()
  ];

gulp.task('build:css', (err) => {
  return gulp.src(folders.src.css + 'app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(folders.built.css));
});

gulp.task('build:js', () => {
  return gulp.src(folders.src.js + '*.js')
    .pipe(gulp.dest(folders.built.js));
});

gulp.task('production', ['build:css', 'build:js'], (err) => {
});

gulp.task('default', ['build:css', 'build:js']);

gulp.task('watch', () => {
  gulp.watch([folders.src.css + '**/*.css', folders.src.css + 'app.css'], ['build:css']);
  gulp.watch([folders.src.js + '**/*.js', folders.src.js + 'app.js'], ['build:js']);
})
