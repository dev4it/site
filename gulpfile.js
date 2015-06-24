// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  output as pagespeed
}
from 'psi';
import pkg from './package.json';

import sprite from 'gulp.spritesmith';
import merge from 'merge-stream';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const LOG_PREFIX = 'SD4';
const CACHE_ID = 'site-dev4it.1';
const BUILD = 'build';

// Lint JavaScript
gulp.task('jshint', () => {
  return gulp.src([
    'app/scripts/**/*.js'
  ])

  .pipe(reload({
    stream: true,
    once: true
  }))

  .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Concatenate and minify JavaScript
gulp.task('scripts', () => {
  return gulp.src([
    'app/**/scripts/**/*.js',
    'app/**/*angular*/angular*.js',
    '!app/**/*angular*/*min*.js*'
  ])

  .pipe($.uglify({
    preserveComments: 'some'
  }))

  .pipe(gulp.dest(BUILD))
    .pipe($.size({
      title: 'scripts'
    }));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', ['sprite'], () => {

  const AUTOPREFIXER_BROWSERS = [
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src([
    'app/**/styles/**/*.scss',
    'app/**/normalize.css/**/*.css'
  ])

  .pipe($.changed('.tmp/styles', {
    extension: '.css'
  }))

  .pipe($.sourcemaps.init())

  .pipe($.sass({
    precision: 10
  }).on('error', $.sass.logError))

  .pipe($.autoprefixer({
    browsers: AUTOPREFIXER_BROWSERS
  }))

  .pipe(gulp.dest('.tmp'))
    .pipe($.sourcemaps.write())

  .pipe(gulp.dest(BUILD))
    .pipe($.size({
      title: 'styles'
    }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  const assets = $.useref.assets({
    searchPath: '{.tmp,app}'
  });

  return gulp.src([
    'app/**/index.html',
    'app/**/pages/*.html'
  ])

  .pipe(assets)

  // Concatenate and minify JavaScript
  .pipe($.if('*.js', $.uglify()))

  // Remove Any Unused CSS
  .pipe($.if('*.css', $.uncss({
    html: [
      'app/**/index.html',
      'app/**/pages/*.html'
    ],
    ignore: [
      /.toggled/,
      /.active/
    ]
  })))

  // Concatenate and minify styles
  .pipe($.if('*.css', $.minifyCss()))

  .pipe(assets.restore())
    .pipe($.useref())

  // Minify any HTML
  .pipe($.if('*.html', $.minifyHtml({
    empty: true,
    quotes: true,
    loose: true
  })))

  // Output files
  .pipe(gulp.dest(BUILD))
    .pipe($.size({
      title: 'html'
    }));
});

// Optimize images
gulp.task('images', () => {
  return gulp.src([
    'app/images/**/*',
    '.tmp/images/**/*',
    '!app/sprites/**/*'
  ])

  .pipe($.imagemin({
    progressive: true,
    interlaced: true
  }))

  .pipe(gulp.dest(BUILD + '/images'))
    .pipe($.size({
      title: 'images'
    }));
});

// Generate our spritesheet 
gulp.task('sprite', () => {
  // Generate our spritesheet
  const spriteData = gulp.src('app/sprites/*.png').pipe(sprite({
    imgName: 'sprite.png',
    imgPath: '/images/sprite.png',
    cssName: 'sprite.css',
    cssTemplate: 'handlebarsStr.css.handlebars',
    padding: 1
  }));

  // Pipe image stream through image optimizer and onto disk
  const imgStream = spriteData.img
    .pipe($.imagemin())
    .pipe(gulp.dest('.tmp/images'));

  // Pipe CSS stream through CSS optimizer and onto disk
  const cssStream = spriteData.css
    .pipe(gulp.dest('.tmp/styles'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

// Copy web fonts to BUILD
gulp.task('fonts', () => {
  return gulp.src([
    'app/fonts/**'
  ])

  .pipe(gulp.dest(BUILD + '/fonts'))
    .pipe($.size({
      title: 'fonts'
    }));
});

// Copy all files at the root level (app)
gulp.task('copy', () => {
  return gulp.src([
    'app/*.*', '!app/*.html'
    //, 'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  })

  .pipe(gulp.dest(BUILD))
    .pipe($.size({
      title: 'copy'
    }));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', BUILD + '/*', '!' + BUILD + '/.git'], {
  dot: true
}));

// Watch files for changes & reload
gulp.task('serve', ['styles'], () => {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: LOG_PREFIX,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/**/styles/**/**/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the BUILD
gulp.task('serve:prd', ['default'], () => {
  browserSync({
    notify: false,
    logPrefix: LOG_PREFIX,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: BUILD,
    baseDir: BUILD
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], cb => {
  runSequence(
    'styles',
    // Google Font used instead 
    //['jshint', 'html', 'scripts', 'images', 'fonts', 'copy'],
    ['jshint', 'html', 'scripts', 'images', 'copy'],
    cb);
});

// Build and serve the output from the BUILD
gulp.task('serve:prd-sw', ['default-sw'], () => {
  browserSync({
    notify: false,
    logPrefix: LOG_PREFIX,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: BUILD,
    baseDir: BUILD
  });
});

// Build production files, the default task
gulp.task('default-sw', ['default'], cb => {
  runSequence(
    'sw',
    cb);
});

// Run PageSpeed Insights
gulp.task('pagespeed', cb => {
  // Update the below URL to the public URL of your site
  pagespeed('example.com', {
    strategy: 'mobile',
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the BUILD directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task('sw', cb => {
  swPrecache({
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || CACHE_ID,
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      //BUILD + '/fonts/**/*.woff',
      BUILD + '/images/**/*.u.{png,svg,ico,jpg,jpeg,gif}',
      BUILD + '/js/**/*.js',
      BUILD + '/css/**/*.css',
      BUILD + '/**/*.{html,json,txt,webapp}'
    ],
    // Translates a static file path to the relative URL that it's served from.
    stripPrefix: path.join(BUILD, path.sep)
  }, (err, swFileContents) => {
    if (err) {
      cb(err);
      return;
    }

    const filepath = path.join('.tmp', 'service-worker.js');

    fs.writeFile(filepath, swFileContents, err => {
      if (err) {
        cb(err);
        return;
      }

      cb();
    });

    gulp.src('.tmp/service-worker.js')
      .pipe($.uglify())
      .pipe(gulp.dest(BUILD));
  });
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }