/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, sass tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `sass` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   *
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
    jsunit: [ 'src/**/*.spec.js' ],
    
    coffee: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ],
    coffeeunit: [ 'src/**/*.spec.coffee' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    sass: 'src/sass/main.scss'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      //note: angular is loaded in vendor_files
      'vendor/angular-mocks/angular-mocks.js',
      'node_modules/ng-describe/dist/ng-describe.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      'vendor/jquery/dist/jquery.min.js',
      'vendor/angular/angular.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/modules/route/route.js',
      'vendor/angular-resource/angular-resource.min.js',
      'vendor/angular-route/angular-route.min.js',
      'vendor/angular-sanitize/angular-sanitize.min.js',
      'vendor/angular-cookies/angular-cookies.min.js',
      'vendor/bower-angular-placeholders/angular-placeholders.min.js',
      'vendor/jQuery.mmenu/dist/js/jquery.mmenu.min.js',
      'vendor/bootstrap/dist/js/bootstrap.js',
      'vendor/pickadate/lib/picker.js',
      'vendor/pickadate/lib/picker.date.js',
      'vendor/pickadate/lib/picker.time.js'
    ],
    css: [
      'vendor/bootstrap/dist/css/bootstrap.css',
      'vendor/jQuery.mmenu/dist/css/jquery.mmenu.css',
      'vendor/pickadate/lib/themes/default.css',
      'vendor/pickadate/lib/themes/default.date.css',
      'vendor/pickadate/lib/themes/default.time.css'
    ],
    assets: [
    ]
  }
};
