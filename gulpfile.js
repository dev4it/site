/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var swPrecache = require('sw-precache');
var fs = require('fs');
var path = require('path');
var packageJson = require('./package.json');

var LOG_PREFIX = 'SD4';
var CACHE_ID = 'site-dev4it.1';
var BUILD = 'build';

var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith');

// Lint JavaScript
gulp.task('jshint', function() {
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
gulp.task('scripts', function() {
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
gulp.task('styles', ['sprite'], function() {

  var AUTOPREFIXER_BROWSERS = [
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
})

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  var assets = $.useref.assets({
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
  .pipe($.if('*.css', $.csso()))

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
gulp.task('images', function() {
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
gulp.task('sprite', function() {
  // Generate our spritesheet
  var spriteData = gulp.src('app/sprites/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: 'sprite.css',
    cssTemplate: 'handlebarsStr.css.handlebars',
    padding: 1
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    .pipe($.imagemin())
    .pipe(gulp.dest('.tmp/images'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(gulp.dest('.tmp/styles'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

// Copy web fonts to BUILD
gulp.task('fonts', function() {
  return gulp.src([
    'app/fonts/**'
  ])

  .pipe(gulp.dest(BUILD + '/fonts'))
    .pipe($.size({
      title: 'fonts'
    }));
});

// Copy all files at the root level (app)
gulp.task('copy', function() {
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
gulp.task('clean', del.bind(null, ['.tmp', BUILD + '/*', '!' + BUILD + '/.git'], {
  dot: true
}));

// Watch files for changes & reload
gulp.task('serve', ['styles'], function() {
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
gulp.task('serve:prd', ['default'], function() {
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
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    'styles',
    // Google Font used instead 
    //['jshint', 'html', 'scripts', 'images', 'fonts', 'copy'],
    ['jshint', 'html', 'scripts', 'images', 'copy'],
    cb);
});

// Build and serve the output from the BUILD
gulp.task('serve:prd-sw', ['default-sw'], function() {
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
gulp.task('default-sw', ['default'], function(cb) {
  runSequence(
    'sw',
    cb);
});

// Run PageSpeed Insights
gulp.task('pagespeed', function(cb) {
  // Update the below URL to the public URL of your site
  pagespeed.output('example.com', {
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
gulp.task('sw', function(callback) {
  var rootDir = BUILD;

  swPrecache({
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: packageJson.name || CACHE_ID,
    // URLs that don't directly map to single static files can be defined here.
    // If any of the files a URL depends on changes, then the URL's cache entry
    // is invalidated and it will be refetched.
    // Generally, URLs that depend on multiple files (such as layout templates)
    // should list all the files; a change in any will invalidate the cache.
    // In this case, './' is the top-level relative URL, and its response
    // depends on the contents of the file 'BUILD/index.html'.
    dynamicUrlToDependencies: {
      './': [path.join(rootDir, 'index.html')]
    },
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      //rootDir + '/fonts/**/*.woff',
      rootDir + '/images/**/*.u.{png,svg,ico,jpg,jpeg,gif}',
      rootDir + '/js/**/*.js',
      rootDir + '/css/**/*.css',
      rootDir + '/**/*.{html,json,txt,webapp}'
    ],
    // Translates a static file path to the relative URL that it's served from.
    stripPrefix: path.join(rootDir, path.sep)
  }, function(error, serviceWorkerFileContents) {
    if (error) {
      return callback(error);
    }
    fs.writeFile(path.join('.tmp', 'service-worker.js'),
      serviceWorkerFileContents,
      function(error) {
        if (error) {
          return callback(error);
        }
        callback();
      });

    gulp.src('.tmp/service-worker.js')
      .pipe($.uglify())
      .pipe(gulp.dest(BUILD));
  });
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }