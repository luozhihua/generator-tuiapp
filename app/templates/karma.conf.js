// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2014-12-02 using
// generator-karma 0.8.3

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['<%= appconf.testframework || "mocha" %>'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/mocha/mocha.js',
      'bower_components/chai/chai.js',
      'test.conf.js',
      //bower:js

      //endbower
      '../<%= appconf.JS_SRC_DIR %>/**/*.js',
      '../<%= appconf.TEST_DIR %>/mock/**/*.js',
      '../<%= appconf.TEST_DIR %>/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
        'karma.conf.js'
    ],

    // web server port
    port: 8180,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    reporters: ['dots', 'progress', 'junit', 'coverage'],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: './junit-report/test-results.xml'
    },

    preprocessors: {
      'src/*.js': 'coverage'
    },

    //Code Coverage options. report type available:
    //- html (default)
    //- lcov (lcov and html)
    //- lcovonly
    //- text (standard output)
    //- text-summary (standard output)
    //- cobertura (xml format supported by Jenkins)
    coverageReporter: {
      // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
      type: 'lcov',
      dir: './coverage/'
    },

    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: 'LOG_DEBUG',

    // Which plugins to enable
    plugins: ['karma-*'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
