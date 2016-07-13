#!/usr/bin/env nodejs

"use strict";

const gulp = require('gulp'),
  pump = require('pump'),
  gmodules = {
    sass: require('gulp-sass'),
    ts: require('gulp-typescript'),
    maps: require('gulp-sourcemaps'),
    rename: require('gulp-rename')
  },
  folders = {
    src: {
      css: 'app/src/scss/',
      js: 'app/src/ts/'
    },
    built: {
      css: 'app/built/css/',
      js: 'app/built/js/'
    }
  },
  tsProject = gmodules.ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

gulp.task('build:sass', (err) => {
  pump([
    gulp.src(folders.src.css + 'main.scss'),
    gmodules.maps.init(),
    gmodules.sass({
      sourcemap: true,
      outputStyle: 'expanded'
    }).on('error', gmodules.sass.logError),
    gmodules.rename({ basename: 'app' }),
    gmodules.maps.write('./', { sourceRoot: './' }),
    gulp.dest(folders.built.css)
  ], err);
})

gulp.task('build:ts', () => {
  let tsResult = tsProject.src(folders.src.js + 'app.ts')
    .pipe(gmodules.ts(tsProject));

  return tsResult.js.pipe(gulp.dest(folders.built.js));
});

gulp.task('production', ['build:sass', 'build:ts'], (err) => {
  let autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify');

  pump([
    gulp.src(folders.built.css + 'app.css'),
    autoprefixer({ browsers: ['last 2 versions'] }),
    // normal version
    gulp.dest(folders.built.css),
    // minified version
    gmodules.rename({ suffix: '.min' }),
    cssnano(),
    gulp.dest(folders.built.css)
  ], err);

  pump([
    gulp.src(folders.built.js + 'app.ts'),
    gmodules.rename({ suffix: '.min' }),
    uglify(),
    gulp.dest(folders.built.js)
  ], err)

  return;
});

gulp.task('default', ['build:sass', 'build:ts', 'watch']);

gulp.task('watch', () => {
  gulp.watch([folders.src.css + '**/*.scss', folders.src.css + 'main.scss'], ['build:sass']);
  gulp.watch([folders.src.js + '**/*.ts', folders.src.js + 'App.ts'], ['build:ts']);
})
