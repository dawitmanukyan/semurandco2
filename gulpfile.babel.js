import gulp from 'gulp';
import autoprefixer from 'autoprefixer';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import cleanCSS from 'gulp-clean-css';
import header from 'gulp-header';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import connectphp from 'gulp-connect-php';
import browserSync from 'browser-sync';
import del from 'del';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import strip from 'gulp-strip-comments';
import named from 'vinyl-named';
import changed from 'gulp-changed';


////////////////////////////////////////////////////////////////////////////////////////////////
//
// SETTING UP
//
////////////////////////////////////////////////////////////////////////////////////////////////

// webpack Options
const webpackOptions = {
  development: {
    mode: 'development',
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader?cacheDirectory=true'
        }
      }
      ]
    }
  },
  production: {
    mode: 'production',
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader?cacheDirectory=true'
        }
      }
      ]
    }
  }
};

// Gulp Sass
const sass = gulpSass(require('sass-embedded'));

// Get info from package.json
const pkg = require('./package.json');
const pkgName = pkg.name.toLowerCase();
const pkgNameJSMain = pkgName + '.app';

// Banner to be added at the top of the files
const banner = ['/*!',
  ` * ${pkg.name} - v${pkg.version}`,
  ` * @author ${pkg.author} - https://pixelcave.com`,
  ` * Copyright (c) ${new Date().getFullYear()}`,
  ' */',
  ''].join('\n');

// Directories and paths
const dir = {
  src: 'src/',
  build: 'dist/',
  assets: 'assets/'
};

const path = {
  dir: {
    src: dir.src,
    build: dir.build
  },
  src: {
    assets: dir.src + dir.assets,
    es6: dir.src + dir.assets + '_js/',
    scss: dir.src + dir.assets + '_scss/',
    css: dir.src + dir.assets + 'css/',
    fonts: dir.src + dir.assets + 'fonts/',
    js: dir.src + dir.assets + 'js/',
    jslibraries: dir.src + dir.assets + 'js/lib/',
    jsplugins: dir.src + dir.assets + 'js/plugins/',
    jspages: dir.src + dir.assets + 'js/pages/',
    media: dir.src + dir.assets + 'media/'
  },
  build: {
    assets: dir.build + dir.assets,
    css: dir.build + dir.assets + 'css/',
    fonts: dir.build + dir.assets + 'fonts/',
    js: dir.build + dir.assets + 'js/',
    jslibraries: dir.build + dir.assets + 'js/lib/',
    jsplugins: dir.build + dir.assets + 'js/plugins/',
    jspages: dir.build + dir.assets + 'js/pages/',
    media: dir.build + dir.assets + 'media/'
  }
};

// Various file sources used in tasks
const files = {
  watch: {
    // When the following files are changed the server will reload
    server: [
      path.src.css + pkgName + '.min.css',
      path.src.js + pkgNameJSMain + '.min.js',
      path.src.jspages + '**/*.min.js',
      path.dir.src + '**/*.php',
      path.dir.src + '**/*.html'
    ],
    // SASS files to watch
    scss: path.src.scss + '**/*.scss',
    es6: {
      // JS main files to watch (ES6)
      main: path.src.es6 + 'main/**/*.js',
      // JS pages files to watch (ES6)
      pages: path.src.es6 + 'pages/**/*.js'
    }
  },
  src: {
    scss: {
      // SASS Main file
      main: path.src.scss + 'main.scss',
      // SASS Theme files
      themes: path.src.scss + pkgName + '/themes/*.scss'
    },
    css: {
      // CSS Main file
      main: path.src.css + pkgName + '.css',
      // CSS Theme files (excluding minified versions)
      themes: [
        path.src.css + 'themes/*.css',
        '!' + path.src.css + 'themes/*.min.css'
      ]
    },
    es6: {
      // JS Main entry file (ES6)
      main: path.src.es6 + 'main/app.js',
      // JS Pages files (ES6)
      pages: path.src.es6 + 'pages/**/*.js'
    },
    js: {
      // JS Main file to be created from ES6
      main: path.src.js + pkgNameJSMain + '*.min.js',
      // JS Pages files
      pages: [
        path.src.js + 'pages/**/*.min.js'
      ]
    }
  },
  build: {
    // Files to be copied over on build task
    copy: [
      path.src.css + '**/*.min.css',
      path.src.js + '*.min.js',
      path.src.jspages + '**/*.min.js',
      path.src.jsplugins + '**/*.*',
      path.src.jslibraries + '**/*.*',
      path.src.fonts + '**/*.*',
      path.src.media + '**/*.*',
      path.dir.src + '**/*.php',
      path.dir.src + '**/*.html'
    ]
  }
};

// Dependencies to be copied over from node_modules
const dependencies = {
  scss: {
    bootstrap: {
      base: path.src.scss + 'bootstrap/',
      src: 'node_modules/bootstrap/scss/**/*',
      dest: path.src.scss + 'bootstrap/'
    },
    fontawesome: {
      base: path.src.scss + 'vendor/fontawesome/',
      src: 'node_modules/@fortawesome/fontawesome-free/scss/**/*',
      dest: path.src.scss + 'vendor/fontawesome/'
    }
  },
  fonts: {
    fontawesome: {
      base: path.src.fonts + 'fontawesome/',
      src: 'node_modules/@fortawesome/fontawesome-free/webfonts/**/*',
      dest: path.src.fonts + 'fontawesome/'
    }
  },
  js: {
    libraries: {
      jquery: {
        base: path.src.jslibraries,
        src: 'node_modules/jquery/dist/jquery.min.js',
        dest: path.src.jslibraries
      },
    },
    plugins: {
      'bootstrap-datepicker': {
        base: path.src.jsplugins + 'bootstrap-datepicker/',
        src: 'node_modules/bootstrap-datepicker/dist/**/*.*',
        dest: path.src.jsplugins + 'bootstrap-datepicker/'
      },
      'bootstrap-maxlength': {
        base: path.src.jsplugins + 'bootstrap-maxlength/',
        src: 'node_modules/bootstrap-maxlength/dist/bootstrap-maxlength*.js',
        dest: path.src.jsplugins + 'bootstrap-maxlength/'
      },
      'bootstrap-notify': {
        base: path.src.jsplugins + 'bootstrap-notify/',
        src: 'node_modules/bootstrap-notify/bootstrap-notify*.js',
        dest: path.src.jsplugins + 'bootstrap-notify/'
      },
      'chart.js': {
        base: path.src.jsplugins + 'chart.js/',
        src: ['node_modules/chart.js/dist/**/*.*', '!node_modules/chart.js/dist/docs/**/*.*'],
        dest: path.src.jsplugins + 'chart.js/'
      },
      ckeditor4: {
        base: path.src.jsplugins + 'ckeditor/',
        src: ['node_modules/ckeditor4/**/*.*', '!node_modules/ckeditor4/package.json'],
        dest: path.src.jsplugins + 'ckeditor/'
      },
      'ckeditor5-classic': {
        base: path.src.jsplugins + 'ckeditor5-classic/',
        src: ['node_modules/@ckeditor/ckeditor5-build-classic/**/*.*', '!node_modules/@ckeditor/ckeditor5-build-classic/package.json', '!node_modules/@ckeditor/ckeditor5-build-classic/node_modules/**/*.*'],
        dest: path.src.jsplugins + 'ckeditor5-classic/'
      },
      'ckeditor5-inline': {
        base: path.src.jsplugins + 'ckeditor5-inline/',
        src: ['node_modules/@ckeditor/ckeditor5-build-inline/**/*.*', '!node_modules/@ckeditor/ckeditor5-build-inline/package.json', '!node_modules/@ckeditor/ckeditor5-build-inline/node_modules/**/*.*'],
        dest: path.src.jsplugins + 'ckeditor5-inline/'
      },
      cropperjs: {
        base: path.src.jsplugins + 'cropperjs/',
        src: 'node_modules/cropperjs/dist/**/*.*',
        dest: path.src.jsplugins + 'cropperjs/'
      },
      dropzone: {
        base: path.src.jsplugins + 'dropzone/',
        src: 'node_modules/dropzone/dist/**/*.*',
        dest: path.src.jsplugins + 'dropzone/'
      },
      'easy-pie-chart': {
        base: path.src.jsplugins + 'easy-pie-chart/',
        src: 'node_modules/easy-pie-chart/dist/jquery*.js',
        dest: path.src.jsplugins + 'easy-pie-chart/'
      },
      fullcalendar: {
        base: path.src.jsplugins + 'fullcalendar/',
        src: 'node_modules/fullcalendar/**/*.*',
        dest: path.src.jsplugins + 'fullcalendar/'
      },
      'jquery-appear': {
        base: path.src.jsplugins + 'jquery-appear/',
        src: 'node_modules/jquery.appear/jquery.appear.js',
        dest: path.src.jsplugins + 'jquery-appear/',
        min: true
      },
      'jquery-countdown': {
        base: path.src.jsplugins + 'jquery-countdown/',
        src: 'node_modules/jquery-countdown/dist/**/*.*',
        dest: path.src.jsplugins + 'jquery-countdown/'
      },
      jvectormap: {
        base: path.src.jsplugins + 'jvectormap/dist/',
        src: 'node_modules/jvectormap-next/jquery-jvectormap*.*',
        dest: path.src.jsplugins + 'jvectormap/dist/'
      },
      'raty-js': {
        base: path.src.jsplugins + 'raty-js/',
        src: 'node_modules/raty-js/lib/**/*.*',
        dest: path.src.jsplugins + 'raty-js/'
      },
      'jquery-validation': {
        base: path.src.jsplugins + 'jquery-validation/',
        src: 'node_modules/jquery-validation/dist/**/*.*',
        dest: path.src.jsplugins + 'jquery-validation/'
      },
      vide: {
        base: path.src.jsplugins + 'vide/',
        src: 'node_modules/vide/dist/**/*.*',
        dest: path.src.jsplugins + 'vide/'
      },
      'magnific-popup': {
        base: path.src.jsplugins + 'magnific-popup/',
        src: 'node_modules/magnific-popup/dist/**/*.*',
        dest: path.src.jsplugins + 'magnific-popup/'
      },
      'jquery.maskedinput': {
        base: path.src.jsplugins + 'jquery.maskedinput/',
        src: 'node_modules/jquery.maskedinput/src/jquery.maskedinput.js',
        dest: path.src.jsplugins + 'jquery.maskedinput/',
        min: true
      },
      select2: {
        base: path.src.jsplugins + 'select2/',
        src: 'node_modules/select2/dist/**/*.*',
        dest: path.src.jsplugins + 'select2/'
      },
      'slick-carousel': {
        base: path.src.jsplugins + 'slick-carousel/',
        src: 'node_modules/slick-carousel/slick/**/*.*',
        dest: path.src.jsplugins + 'slick-carousel/'
      },
      'jquery-sparkline': {
        base: path.src.jsplugins + 'jquery-sparkline/',
        src: 'node_modules/jquery-sparkline/jquery*.js',
        dest: path.src.jsplugins + 'jquery-sparkline/'
      },
      sweetalert2: {
        base: path.src.jsplugins + 'sweetalert2/',
        src: 'node_modules/sweetalert2/dist/**/*.*',
        dest: path.src.jsplugins + 'sweetalert2/'
      },
      highlightjs: {
        base: path.src.jsplugins + 'highlightjs/',
        src: ['node_modules/highlightjs/**/*.js', 'node_modules/highlightjs/**/*.css'],
        dest: path.src.jsplugins + 'highlightjs/'
      },
      'ion-rangeslider': {
        base: path.src.jsplugins + 'ion-rangeslider/',
        src: ['node_modules/ion-rangeslider/**/*.js', 'node_modules/ion-rangeslider/**/*.css', 'node_modules/ion-rangeslider/**/*.png'],
        dest: path.src.jsplugins + 'ion-rangeslider/'
      },
      datatables: {
        base: path.src.jsplugins + 'datatables/',
        src: 'node_modules/datatables.net/js/**/*.js',
        dest: path.src.jsplugins + 'datatables/',
        min: true
      },
      'datatables-bs5': {
        base: path.src.jsplugins + 'datatables-bs5/',
        src: ['node_modules/datatables.net-bs5/**/*.css', 'node_modules/datatables.net-bs5/**/*.js'],
        dest: path.src.jsplugins + 'datatables-bs5/'
      },
      'datatables-responsive': {
        base: path.src.jsplugins + 'datatables-responsive/',
        src: ['node_modules/datatables.net-responsive/**/*.css', 'node_modules/datatables.net-responsive/**/*.js'],
        dest: path.src.jsplugins + 'datatables-responsive/'
      },
      'datatables-responsive-bs5': {
        base: path.src.jsplugins + 'datatables-responsive-bs5/',
        src: ['node_modules/datatables.net-responsive-bs5/**/*.css', 'node_modules/datatables.net-responsive-bs5/**/*.js'],
        dest: path.src.jsplugins + 'datatables-responsive-bs5/'
      },
      'datatables-buttons': {
        base: path.src.jsplugins + 'datatables-buttons/',
        src: 'node_modules/datatables.net-buttons/js/**/*.js',
        dest: path.src.jsplugins + 'datatables-buttons/'
      },
      'datatables-buttons-bs5': {
        base: path.src.jsplugins + 'datatables-buttons-bs5/',
        src: ['node_modules/datatables.net-buttons-bs5/**/*.css', 'node_modules/datatables.net-buttons-bs5/**/*.js'],
        dest: path.src.jsplugins + 'datatables-buttons-bs5/'
      },
      'datatables-buttons-jszip': {
        base: path.src.jsplugins + 'datatables-buttons-jszip/',
        src: 'node_modules/jszip/dist/**/*.*',
        dest: path.src.jsplugins + 'datatables-buttons-jszip/'
      },
      'datatables-buttons-pdfmake': {
        base: path.src.jsplugins + 'datatables-buttons-pdfmake/',
        src: 'node_modules/pdfmake/build/**/*.*',
        dest: path.src.jsplugins + 'datatables-buttons-pdfmake/'
      },
      flatpickr: {
        base: path.src.jsplugins + 'flatpickr/',
        src: 'node_modules/flatpickr/dist/**/*.*',
        dest: path.src.jsplugins + 'flatpickr/'
      },
      simplemde: {
        base: path.src.jsplugins + 'simplemde/',
        src: 'node_modules/simplemde/dist/**/*.*',
        dest: path.src.jsplugins + 'simplemde/'
      },
    }
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////
//
// SERVER Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// PHP Server with browserSync (you must install PHP and add it to your PATH to use it)
gulp.task('serve-php', () => {
  connectphp.server({
    base: path.dir.src,
    port: '4000'
  }, () => {
    browserSync({
      injectChanges: true,
      proxy: '127.0.0.1:4000',
      notify: false
    });
  });

  gulp.watch(files.watch.server).on('change', () => {
    browserSync.reload();
  });
});

// Static Web Server with browserSync
gulp.task('serve-html', () => {
  browserSync.init({
    server: {
      baseDir: path.dir.src
    },
    injectChanges: true,
    notify: false
  });

  gulp.watch(files.watch.server).on('change', () => {
    browserSync.reload();
  });
});


////////////////////////////////////////////////////////////////////////////////////////////////
//
// Dependencies Copy Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// Delete original dependency and copy over new files (Minify or clean source map comments if is set)
function depUpdate(depName, depData) {
  del(depData.base).then(() => {
    if (depData.min) {
      return gulp.src(depData.src)
        .pipe(uglify({ output: { comments: '/^!/' } }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(depData.dest));
    } else if (depData.minclean) {
      return gulp.src(depData.src)
        .pipe(strip({ safe: true }))
        .pipe(gulp.dest(depData.dest));
    } else {
      return gulp.src(depData.src)
        .pipe(gulp.dest(depData.dest));
    }
  });
}

// Update SCSS dependencies
gulp.task('dep-scss', (done) => {
  for (const [key, value] of Object.entries(dependencies.scss)) {
    depUpdate(key, value);
  };

  done();
});

// Update Fonts dependencies
gulp.task('dep-fonts', (done) => {
  for (const [key, value] of Object.entries(dependencies.fonts)) {
    depUpdate(key, value);
  };

  done();
});

// Update JS Libraries dependencies
gulp.task('dep-js-libraries', (done) => {
  for (const [key, value] of Object.entries(dependencies.js.libraries)) {
    depUpdate(key, value);
  };

  done();
});

// Update JS Plugins dependencies
gulp.task('dep-js-plugins', (done) => {
  for (const [key, value] of Object.entries(dependencies.js.plugins)) {
    depUpdate(key, value);
  };

  done();
});


////////////////////////////////////////////////////////////////////////////////////////////////
//
// SASS to CSS Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// SASS to CSS task for main styles
gulp.task('css-scss-main', () => {
  return gulp.src(files.src.scss.main)
    .pipe(sass({ outputStyle: 'expanded', precision: 6 }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ basename: pkgName }))
    .pipe(gulp.dest(path.src.css));
});

// SASS to CSS task for theme styles
gulp.task('css-scss-themes', () => {
  return gulp.src(files.src.scss.themes)
    .pipe(sass({ outputStyle: 'expanded', precision: 6 }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(path.src.css + 'themes/'));
});

// Minify main CSS
gulp.task('css-min-main', () => {
  return gulp.src(files.src.css.main)
    .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.src.css));
});

// Minify themes CSS
gulp.task('css-min-themes', () => {
  return gulp.src(files.src.css.themes)
    .pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.src.css + 'themes/'));
});


////////////////////////////////////////////////////////////////////////////////////////////////
//
// ES6 to ES5 Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// ES6 to ES5 main JS (development friendly)
gulp.task('js-es6-main-dev', () => {
  return gulp.src(files.src.es6.main)
    .pipe(named())
    .pipe(gulpWebpack(webpackOptions.development, webpack))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ basename: pkgNameJSMain }))
    .pipe(gulp.dest(path.src.js));
});

// ES6 to ES5 main JS (production ready)
gulp.task('js-es6-main', () => {
  return gulp.src(files.src.es6.main)
    .pipe(named())
    .pipe(gulpWebpack(webpackOptions.production, webpack))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ basename: pkgNameJSMain, suffix: '.min' }))
    .pipe(gulp.dest(path.src.js));
});

// ES6 to ES5 pages JS (development friendly)
gulp.task('js-es6-pages-dev', () => {
  return gulp.src(files.src.es6.pages)
    .pipe(changed(path.src.js + 'pages/'))
    .pipe(named())
    .pipe(gulpWebpack(webpackOptions.development, webpack))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest(path.src.js + 'pages/'));
});

// ES6 to ES5 pages JS (production ready)
gulp.task('js-es6-pages', () => {
  return gulp.src(files.src.es6.pages)
    .pipe(changed(path.src.js + 'pages/', { extension: '.min.js' }))
    .pipe(named())
    .pipe(gulpWebpack(webpackOptions.production, webpack))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.src.js + 'pages/'));
});


////////////////////////////////////////////////////////////////////////////////////////////////
//
// Build Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// Clean build directory and alias
gulp.task('build-clean', () => {
  return del(path.dir.build);
});
gulp.task('clean', gulp.series('build-clean'));

// Copy folders and files to build folder
gulp.task('build-copy', () => {
  return gulp.src(files.build.copy, { base: path.dir.src })
    .pipe(gulp.dest(path.dir.build));
});


////////////////////////////////////////////////////////////////////////////////////////////////
//
// Creating Main Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// Update Dependencies
gulp.task('dep-update', gulp.series('dep-scss', 'dep-fonts', 'dep-js-libraries', 'dep-js-plugins'));

// SASS to CSS
gulp.task('css', gulp.series(
  gulp.parallel('css-scss-main', 'css-scss-themes'),
  gulp.parallel('css-min-main', 'css-min-themes')
));

// ES6 to ES5
gulp.task('js-dev', gulp.series(
  gulp.parallel('js-es6-main-dev', 'js-es6-pages-dev'),
  gulp.parallel('js-es6-main', 'js-es6-pages')
));
gulp.task('js', gulp.series(
  gulp.parallel('js-es6-main', 'js-es6-pages')
));

// Build task
gulp.task('build', gulp.series('css', 'js', 'build-clean', 'build-copy'));


////////////////////////////////////////////////////////////////////////////////////////////////
//
// Watch Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// Watch task for SASS files
gulp.task('watch-scss', () => {
  return gulp.watch(files.watch.scss, gulp.series('css'));
});

// Watch tasks for Main JS files
gulp.task('watch-es6-main-dev', () => {
  return gulp.watch(files.watch.es6.main, gulp.series('js-es6-main-dev', 'js-es6-main'));
});
gulp.task('watch-es6-main', () => {
  return gulp.watch(files.watch.es6.main, gulp.series('js-es6-main'));
});

// Watch tasks for Pages JS files
gulp.task('watch-es6-pages-dev', () => {
  return gulp.watch(files.watch.es6.pages, gulp.series('js-es6-pages-dev', 'js-es6-pages'));
});
gulp.task('watch-es6-pages', () => {
  return gulp.watch(files.watch.es6.pages, gulp.series('js-es6-pages'));
});

// Watch task for all files
gulp.task('watch-dev', gulp.parallel('watch-scss', 'watch-es6-main-dev', 'watch-es6-pages-dev'));
gulp.task('watch', gulp.parallel('watch-scss', 'watch-es6-main', 'watch-es6-pages'));


////////////////////////////////////////////////////////////////////////////////////////////////
//
// Run Related Tasks
//
////////////////////////////////////////////////////////////////////////////////////////////////

// HTML Server and Watch files (-dev also produces unminimized development friendly JS files from ES6)
gulp.task('run-html-dev', gulp.parallel('serve-html', 'watch-dev'));
gulp.task('run-html', gulp.parallel('serve-html', 'watch'));

// PHP Server and Watch files (-dev also produces unminimized development friendly JS files from ES6)
gulp.task('run-php-dev', gulp.parallel('serve-php', 'watch-dev'));
gulp.task('run-php', gulp.parallel('serve-php', 'watch'));

// Default task
gulp.task('default', gulp.series('run-html'));
