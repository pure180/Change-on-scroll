'use strict';

var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    webserver = require('gulp-webserver'),
    changed = require('gulp-changed'),
    del = require('del');

var gutil = require('gulp-util');
var plumber = require('gulp-plumber');



// Paths for the App inviroment
var root = {
  src: 'src/',
  build: 'public/',
  bower_components: './src/bower_components'
};

// Paths to the Sourcefiles
var src_paths = {
  images: root.src + 'images/**/*',
  less: root.src + 'less',
  scripts: root.src + 'scripts',
  jade: root.src + 'jade',
  fonts: root.src + 'fonts/**/*'
};

//Build Path
var build_paths = {
  fonts: root.build + 'fonts',
  css: root.build + 'css',
  js: root.build + 'js',
  img: root.build + 'img'
};

var files = {
    // JS Files
    js_scroller:        'apps/jquery.changeonscroll.js',

    less_index: 'index.less'
};

var config = {
  server: {
    port: 8000,
    open: false,
    livereload: true
  },
};


gulp.task('jade', function () {
  return gulp.src( src_paths.jade + '/Templates/**/*.jade' )
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(changed( root.build ))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(root.build))
    .pipe(notify({
      message: 'Served Jade "<%= file.relative %>"!'
    }));
});


// Compile LESS to CSS minify, autoprefix and copy to ./public/css/

var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new LessPluginCleanCSS({advanced: true});

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({browsers: ['last 2 versions']});


gulp.task('styles', function() {
  return gulp.src([
      src_paths.less + '/' + files.less_index
    ])
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(less())
    .pipe(autoprefixer({
          browsers: [
            "Android 2.3",
            "Android 4",
            "Android >= 4",
            "Chrome >= 20",
            "ChromeAndroid >= 20",
            "Firefox >= 24",
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
          ],
          cascade: true
    }))
    .pipe(gulp.dest( build_paths.css ))
    .pipe(notify({ message: 'Build <%= file.relative %>' }))
    .pipe(rename({suffix: '.min'}))
    //.pipe(changed( build_paths.css ))
    .pipe(less({
        plugins: [cleancss]
    }))
    .pipe(gulp.dest( build_paths.css ))
    .pipe(notify({ message: 'Build <%= file.relative %>' }));
});


// Get all *.js files concat and copy a minified and a normal version of them to ./build/js
gulp.task('scripts', function() {
  return gulp.src([
      src_paths.scripts + '/' + files.js_scroller
    ])
    .pipe(plumber(function (error) {
        gutil.log(error.message);
        this.emit('end');
    }))
    .pipe(jshint( src_paths.scripts + '/.jshintrc'))
    //.pipe(jshint.reporter('default', { verbose: true }))
    .pipe(concat('jQuery.changeonscroll.js'))
    .pipe(gulp.dest( build_paths.js ))
    .pipe(notify({
      message: 'Served "./build/js/<%= file.relative %>"!'
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest( build_paths.js ))
    .pipe(notify({ message:
      'Served "./build/js/<%= file.relative %>"!'
    }));
});

gulp.task('copy', function(){
  return gulp.src([
  ])
  .pipe(plumber(function (error) {
      gutil.log(error.message);
      this.emit('end');
  }))
  .pipe(gulp.dest( build_paths.js ));
});

// Optimize images and copy files from ./src/images to ./build/img
gulp.task('images', function() {
  return gulp.src( [src_paths.images + '.jpg', src_paths.images + '.png', src_paths.images + '.gif', src_paths.images + '.svg' ] )
    .pipe(changed( build_paths.img ))
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest( build_paths.img ))
    .pipe(notify({
      message: 'Images task complete'
    }));
});

gulp.task('clean', function(cb) {
    del([
      root.build + '*.html',
      build_paths.css + '/*.css',
      build_paths.js + '/*.js',
      build_paths.img + '/**/.*',
      build_paths.fonts+ '/**/.*'
    ], cb);
});


gulp.task('watch', ['webserver'], function() {

  // Watch .jade files
  // Watch .less files
  gulp.watch( src_paths.less + '/**/*.less', ['styles']);
  gulp.watch( src_paths.jade + '/**/*.jade', ['jade']);
  // Watch .js files
  gulp.watch( src_paths.scripts + '/**/*.js', ['scripts']);
  gulp.watch( src_paths.scripts + '/apps/**/*.js', ['scripts']);
  // Watch image files
  gulp.watch( src_paths.images, ['images']);

});

gulp.task('webserver', function() {
  gulp.src('public')
    .pipe(webserver({
      livereload: true,
      //directoryListing: true,
      open: false,
      //port: config.server.port
    }));
});

gulp.task('compile', ['jade', 'styles', 'scripts', 'copy', 'images'] );

gulp.task('create', ['clean', 'compile']);

// Default task
gulp.task('start', ['clean', 'compile', 'watch'] );

// Default task
gulp.task('default', ['clean', 'jade', 'styles', 'scripts', 'copy', 'images'] );
