/*
 * Grunt 配置文件
 *
 * -------------------------------------------------------
 * 本文件由<%= pkg.name %> (<%= pkg.description %>) 自动生成.
 * 生成器版本: v<%= pkg.version %>
 * 生成器地址：<%= pkg.repository %>
 * 作者: <%= pkg.author %>
 * 生成时间: <%= (new Date).toISOString().split('T')[0] %>
 * -------------------------------------------------------
 *
 * - 部署权限请在.sshconf文件内配置，此文件不会提交到GIT仓库，仅适用于您当前使用的计算机；
 * - 部署环境地址和端口在文件`.tuiconf`内，此文件是前端公用的配置文件，会提交到GIT仓库中
 *
 */

'use strict';

var findup = require('findup-sync');
var fs     = require('fs-extra');
var os     = require('os');
var path   = require('path');

/**
 * 启用REST接口支持
 * @param  {String} dir
 * @param  {Object} options [description]
 * @return {[type]}         [description]
 */
var restSupported = ['POST', 'PUT', 'DELETE'];
function enableRest(dir, options) {

  /**
   * 让预览服务器支持REST接口的 POST / PUT / DELETE 方法
   * @param  {Object}   req  HTTP request Object.
   * @param  {Object}   res  HTTP responce object.
   * @param  {Function} next
   * @return {Object}        Express 中间件
   */
  return function(req, res, next) {
    if (restSupported.indexOf(req.method.toUpperCase()) !== -1) {

      var filepath = path.join(options.base[0], dir, req.url.split('?')[0]);

      if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
        res.end(fs.readFileSync(filepath));
      }
    }
    return next();
  };
}

function readDeployConf() {
  var file = '.tuiconf';
  var fileabs = findup(file);

  if (fileabs) {
    //return JSON.parse(fs.readFileSync(fileabs));
    return fs.readJsonSync(fileabs).deploy;
  } else {
    return {
      test2: {},
      test3: {},
      yufa: {}
    };
  }
}

// # 通配符说明
// 出于性能原因，我们只匹配下一级目录, 因此，建议您的js/css/img/html/data等目录下的结构尽量保持扁平：
// 'test/spec/{,*/}*.js'
// 如果您需要匹配所有子目录和子文件，请使用如下写法：
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // 统计任务执行的时间
  require('time-grunt')(grunt);

  // 自动加载Grunt任务
  require('load-grunt-tasks')(grunt);

  // 配置项目内的资源路径
  var pkg = require('./package.json');
  var appconf = fs.readJsonSync('.appconf');

  var tuircPath = findup('.tuirc');
  var tuirc = tuircPath ? fs.readJsonSync(tuircPath) : {user:{}};
  var deploy = readDeployConf();

  var config = {
    version  : pkg.version,
    appname  : pkg.name,

    bower    : appconf.BOWER_DIR,
    doc      : appconf.DOC_DIR,
    dist     : appconf.DIST_DIR,
    test     : appconf.TEST_DIR,
    build    : appconf.BUILD_DIR,
    tmp      : appconf.TMP_DIR,

    src      : appconf.SRC_DIR,
    js       : appconf.JS_DIR,
    css      : appconf.CSS_DIR,
    img      : appconf.IMG_DIR,
    data     : appconf.DATA_DIR,
    templ    : appconf.TEMPL_DIR,
    html     : appconf.HTML_DIR,

    jsSrc    : appconf.JS_SRC_DIR,
    cssSrc   : appconf.CSS_SRC_DIR,
    imgSrc   : appconf.IMG_SRC_DIR,
    dataSrc  : appconf.DATA_SRC_DIR,
    templSrc : appconf.TEMPL_SRC_DIR,
    htmlSrc  : appconf.HTML_SRC_DIR,

    jsDist   : appconf.JS_DIST_DIR,
    cssDist  : appconf.CSS_DIST_DIR,
    imgDist  : appconf.IMG_DIST_DIR,
    dataDist : appconf.DATA_DIST_DIR,
    templDist: appconf.TEMPL_DIST_DIR,
    htmlDist : appconf.HTML_DIST_DIR
  };

  var date       = new Date();

  // 为所有任务定义配置项
  grunt.initConfig({

    // 项目配置
    config: config,
    author: tuirc.user || {},
    pkg: pkg,

    // 任务调试器
    debug: {
      options: {
        open: true
      }
    },

    // 监视项目内的文件，若有更改则自动执行编译或刷新浏览器
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      }, <% if (appconf.coffeescript) { %>
      coffee: {
        files: ['<%%= config.jsSrc %>/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['<%%= config.test %>/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['coffee:test', 'test:watch']
      },<% } else { %>
      js: {
        files: ['<%%= config.jsSrc %>/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: '<%%= connect.options.livereload %>'
        }
      },
      jstest: {
        files: ['<%%= config.test %>/spec/{,*/}*.js'],
        tasks: ['test:watch']
      },<% } %>
      gruntfile: {
        files: ['Gruntfile.js']
      },<% if (appconf.sass) { %>
      sass: {
        files: ['<%%= config.cssSrc %>/{,*/}*.{scss,sass}'],
        tasks: ['sass:server', 'autoprefixer']
      },<% } %>
      styles: {
        files: ['<%%= config.cssSrc %>/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          '<%%= config.src %>/{,*/}*.html',
          '.tmp/<%%= config.cssSrc %>/{,*/}*.css',<% if (appconf.coffeescript) { %>
          '.tmp/<%%= config.jsSrc %>/{,*/}*.js',<% } %>
          '<%%= config.imgSrc %>/{,*/}*'
        ]
      }
    },

    // Grunt 内置服务器，主要用于开发时预览效果
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,

        // 将 hostname 改为 “0.0.0.0”以允许本机以外的机器访问，
        // 也可以在运行yo命令时指定选项：yo generator --allow-remote
        hostname: 'localhost',
        middleware: function(connect, options, middlewares) {
          return [
            enableRest(config.src, options);
          ]
        }
      },
      livereload: {
        options: {
          middleware: function(connect, options, middlewares) {
            return [
              enableRest(config.src, options);
              connect.static(config.tmp),
              connect.static(config.tmp+'/concat'),
              connect().use('/'+ config.bower, connect.static('./'+ config.bower)),
              connect.static(config.src)
            ];
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 9001,
          middleware: function(connect, options, middlewares) {
            return [
              enableRest(config.src, options);
              connect.static(config.tmp),
              connect.static(config.test),
              connect().use('/'+ config.bower, connect.static('./'+ config.bower)),
              connect.static(config.src)
            ];
          }
        }
      },
      dist: {
        options: {
          //base: '<%%= config.dist %>',
          livereload: false,
          middleware: function(connect, options, middlewares) {
            return [
              enableRest(config.src, options);
              connect.static(config.dist)
            ];
          }
        }
      }
    },

    // 清空构建目录和缓存目录
    clean: {
      nw: {
        files: [{
          dot: true,
          src: [
            '<%%= config.build %>/*'
          ]
        }]
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= config.dist %>/*',
            '!<%%= config.dist %>/.git*'
          ]
        }]
      },
      server: '<%%= config.tmp %>'
    },

    // 检测代码错误和检查编码风格，以确保代码质量
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%%= config.jsSrc %>/{,*/}*.js',
        '!<%%= config.jsSrc %>/vendor/*',
        '<%%= config.test %>/spec/{,*/}*.js'
      ]
    },<% if (appconf.testframework === 'mocha') { %>

    // 使用Mocha测试框架执行单元测试
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/index.html']
        }
      }
    },<% } else if (appconf.testframework === 'jasmine') { %>

    // 使用Jasmine测试框架执行单元测试
    jasmine: {
      all: {
        options: {
          specs: '<%%= config.test %>/spec/{,*/}*.js'
        }
      }
    },<% } %><% if (appconf.karma) { %>

    // Test settings
    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        runnerPort: 9909,
        customLaunchers: {
          IE10: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE10'
          },
          IE9: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE9'
          },
          IE8: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE8'
          },
          IE7: {
            base: 'IE',
            'x-ua-compatible': 'IE=EmulateIE7'
          }
        }
      },
      unit: {
        autoWatch: true,
        singleRun: false,
        browsers: ['PhantomJS']
      },
      chrome: {
        autoWatch: true,
        singleRun: false,
        browsers: ['Chrome']
      },
      firefox: {
        autoWatch: true,
        singleRun: false,
        browsers: ['Firefox']
      },
      opera: {
        autoWatch: true,
        singleRun: false,
        browsers: ['Opera']
      },
      safari: {
        autoWatch: true,
        singleRun: false,
        browsers: ['Safari']
      },
      ie7: {
        autoWatch: true,
        singleRun: false,
        browsers: ['IE7']
      },
      ie8: {
        autoWatch: true,
        singleRun: false,
        browsers: ['IE8']
      },
      ie9: {
        autoWatch: true,
        singleRun: false,
        browsers: ['IE9']
      },
      ie10: {
        autoWatch: true,
        singleRun: false,
        browsers: ['IE10']
      },
      continuous: {
        singleRun: true,
        browsers: ['Chrome', 'Firefox', 'safari', 'IE', 'IE7']
      },
      dev: {
        background: true,
        reporters: 'dots'
      }
    },<% } %><% if (appconf.coffeescript || options.coffee) { %>

    // 编译CoffeeScript为原生JavaScript
    coffee: {
      options: {
        sourceMap: true/*,
        sourceMapDir: ''*/
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.jsSrc %>',
          src: '{,*/}*.{coffee,litcoffee,coffee.md}',
          dest: '.tmp/<%%= config.js %>',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: '<%%= config.test %>/spec',
          src: '{,*/}*.{coffee,litcoffee,coffee.md}',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },<% } %><% if (appconf.livescript) { %>

    // 编译LiveScript为原生JavaScript
    livescript: {
      dist: {
        files: {
          'path/to/result.js': 'path/to/source.ls', // 1:1 compile
          'path/to/another.js': ['path/to/sources/*.ls', 'path/to/more/*.ls'] // compile and concat into single file
        }
      }
    },<% } %><% if (appconf.sass||appconf.scss) { %>

    // 编译Sass/Scss为原生的CSS样式
    sass: {
      options: {<% if (appconf.libsass) { %>
        sourceMap: true,
        includePaths: ['<%%= config.bower %>']
        <% } else { %>
        loadPath: '<%%= config.bower %>'
      <% } %>},
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.cssSrc %>',
          src: ['*.{scss,sass}'],
          dest: '.tmp/<%%= config.css %>',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '<%%= config.cssSrc %>',
          src: ['*.{scss,sass}'],
          dest: '.tmp/<%%= config.css %>',
          ext: '.css'
        }]
      }
    },<% } %>

    // 自动为各种浏览器生成CSS3样式的厂商前缀，如：-webkit-*, -moz-* 等等
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/<%%= config.css %>/',
          src: '{,*/}*.css',
          dest: '.tmp/<%%= config.css %>/'
        }]
      }
    },

    // 自动管理HTML页面对Bower包文件的引用, 使用命令`bower install package_xxx#0.8.2`安装xxx后，
    // wiredep 会自动把 package_xxx 的JS和CSS引入html页面的指定位置, 指定位置的方法：
    // <!-- bower:css -->
    // >> css文件会在这里插入 <<
    // <!-- endbower:css -->
    //
    // <!-- bower:js -->
    // >> js文件会在这里插入 <<
    // <!-- endbower:js -->
    //
    // wiredep同样支持scss文件:
    // // bower:scss
    // // endbower:scss
    <%
        var wiredepExcludes = [];
        if (appconf.sass) {
          if (appconf.bootstrap) {
            wiredepExcludes.push('<%%= config.bower %>/bootstrap-sass-official/assets/javascripts/bootstrap.js');
          }
          if (appconf.fontawesome) {
            wiredepExcludes.push('<%%= config.bower %>/fontawesome/css/font-awesome.css');
          }
        } else {
          if (appconf.bootstrap) {
            wiredepExcludes.push('<%%= config.bower %>/bootstrap/dist/js/bootstrap.js');
          }
        }
        if (appconf.less && appconf.fontawesome) {
          wiredepExcludes.push('<%%= config.bower %>/fontawesome/css/font-awesome.css');
        }
    %>
    wiredep: {
      app: {
        ignorePath: /^<%= config.src %>\/|\.\.\//,
        cwd: './',
        src: ['<%%= config.src %>/index.html'],
        exclude: ['<%= (wiredepExcludes.join("', '"))%>']
      }<% if (appconf.sass) { %>,
      sass: {
        src: ['<%%= config.cssSrc %>/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}<%%= config.bower %>\//
      }<% } %><% if (appconf.karma) { %>,
      jstest: {
        cwd: './',
        fileTypes: {
          js: {
            block: /(([ \t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        },
        src: ['<%%= config.test %>/karma.conf.js'],
        exclude: ['<%= (wiredepExcludes.join("', '"))%>']
      }<% } %>
    },

    // 使用版本号重命名文件名以防止浏览器缓存
    // 注意：当前开发模式未实现前后端彻底分离，不能使用此任务
    //
    // rev: {
    //   dist: {
    //     files: {
    //       src: [
    //         '<%%= config.jsDist %>/{,*/}*.js',
    //         '<%%= config.cssDist %>/{,*/}*.css',
    //         '<%%= config.imgDist %>/{,*/}*.*',
    //         '<%%= config.cssDist %>/fonts/{,*/}*.*',
    //         '<%%= config.dist %>/*.{ico,png}'
    //       ]
    //     }
    //   }
    // },

    // 读取HTML的usemin块来启用智能构建, 以便于自动合并，缩小和修改文件。在内存中创建配置，使更多的任务可以对其进行操作
    useminPrepare: {
      options: {
        dest: '<%%= config.dist %>'
      },
      html: '<%%= config.src %>/index.html'
    },

    // 重写rev和useminPrepare的配置
    usemin: {
      options: {
        assetsDirs: [
          '<%%= config.dist %>',
          '<%%= config.imgDist %>',
          '<%%= config.cssDist %>'
        ]
      },
      html: ['<%%= config.dist %>/{,*/}*.html'],
      css: ['<%%= config.cssDist %>/{,*/}*.css']
    },

    // 以下几个以“-min”结尾的任务都是用于压缩和减小静态资源的字节数
    // Depends on "grunt-contrib-imagemin#^0.8.0",
    //
    // imagemin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '<%%= config.imgSrc %>',
    //       src: '{,*/}*.{gif,jpeg,jpg,png}',
    //       dest: '<%%= config.imgDist %>'
    //     }]
    //   }
    // },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= config.imgSrc %>',
          src: '{,*/}*.svg',
          dest: '<%%= config.imgDist %>'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%%= config.dist %>'
        }]
      }
    },<% if (appconf.angularjs) { %>


    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: ['*.js', '!oldieshim.js'],
          dest: '.tmp/concat/scripts'
        }]
      }
    },<% } %>

    // By default, your `index.html`'s <!-- Usemin block --> will take care
    // of minification. These next options are pre-configured if you do not
    // wish to use the Usemin blocks.
    cssmin: {
      options: {
        sourceMap: true,
        sourceMapName: function(filename) { return filename.replace(/\.css$/, '.map'); },
        banner: '<%%= uglify.options.banner %>'
      },
      dist: {
        files: {
          '<%%= config.cssDist %>/<%%=config.appname%>.css': [
            '.tmp/<%%= config.css %>/{,*/}*.css',
            //'<%%= config.src %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    uglify: {
      options: {
        //report: 'gzip',
        mangle   : true, // Specify mangle: false to prevent changes to your variable and function names.
        sourceMap: true,
        sourceMapName: function(dest) { return (dest.replace('-min.js', '.map')); },
        beautify : false,
        banner   : '/** \n' +
                ' * -------------------------------------------------------------\n' +
                ' * Copyright (c) 2014 时代光华, All rights reserved. \n' +
                ' * http://www.21tb.com/ \n' +
                ' *  \n' +
                ' * @app: <%%= pkg.name %> \n' +
                ' * @version: <%%= pkg.version%> \n' +
                ' * @description: <%%= pkg.description%> \n' +
                ' * @createTime: <%= appconf.createTime%> \n' +
                ' * @repository: https://gitlab.21tb.com/tui/<%%= pkg.name%>.git\n' +
                ' * @doc: https://gitlab.21tb.com/tui/<%%= pkg.name%>.git\n' +
                ' * @author: <%%= pkg.author%> \n' +
                ' \n' +
                ' \n' +
                ' * - LAST BUILD:\n\n' +
                ' * @buildByUser: <%%= author.username || author.name || "-" %> \n' +
                ' * @email: <%%= author.email||"-"%> \n' +
                ' * @buildTime: <%%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> \n' +
                ' * @buildEnv: '+ os.type() +'/'+ os.platform() +' \n' +
                ' * ------------------------------------------------------------- \n' +
                ' */ \n\n'
      },

      coffee: {
        options: {
          sourceMapIncludeSources: true,
          sourceMapIn: '<%%= config.tmp %>/js/<%%=config.appname%>.js.map',
        }
      }
      /*,
      app: {
        files: {
          '<%%= config.jsDist %>/<%= config.appname%>-min.js': [
            '<%%= config.jsDist %>/r.config.js',
            '<%%= config.jsDist %>/<%= config.appname%>.js'
          ]
        }
      }*/
    },
    concat: {
      //dist: {}
    },

    // 将构建文件复制到dist目录用来部署和发布
    copy: {
      dist: {
        files: [{
          src: '<%%= config.tmp %>/concat/js/libs-config-min.js',
          dest: '<%%= config.jsDist %>/libs-config.js'
        }, {
          src: '<%%= config.tmp %>/concat/js/libs-min.js',
          dest: '<%%= config.jsDist %>/libs.js'
        }, {
          src: '<%%= config.tmp %>/concat/js/<%%= config.appname %>-min.js',
          dest: '<%%= config.jsDist %>/<%%= config.appname %>.js'
        }, {
          expand: true,
          dot: true,
          cwd: '<%%= config.src %>',
          dest: '<%%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            '<%%= config.img %>/**/*',
            'package.json',
            '<%%= config.templ %>/{,*/}*.*',<% if (appconf.nodewebkit) { %>
            'node_modules/**/*.*',<% } %>
            //'<%%= config.html %>/{,*/}*.html',
            '{,*/}*.html',
            '<%%= config.css %>/fonts/{,*/}*.*'
          ]
        }, {
          src: 'node_modules/apache-server-configs/dist/.htaccess',
          dest: '<%%= config.dist %>/.htaccess'
        }<% if (appconf.bootstrap) { %>, {
          expand: true,
          dot: true,
          cwd: '<% if (appconf.sass) {
              %>.<%
            } else {
              %><%%= config.bower %>/bootstrap/dist<%
            } %>',
          src: '<% if (appconf.sass) {
              %><%%= config.bower %>/bootstrap-sass-official/assets/fonts/bootstrap/*<%
            } else {
              %>fonts/*<%
            } %>',
          dest: '<%%= config.dist %>'
        }<% } %><% if (appconf.fontawesome) { %>, {
          expand: true,
          dot: true,
          cwd: '<% if (appconf.sass || appconf.less) {
              %>.<%
            } else {
              %><%%= config.bower %>/fontawesome/<%
            } %>',
          src: '<% if (appconf.sass || appconf.less) {
              %><%%= config.bower %>/fontawesome/fonts/*<%
            } else {
              %>fonts/*<%
            } %>',
          dest: '<%%= config.dist %>'
        }<% } %>]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%%= config.cssSrc %>',
        dest: '.tmp/<%%= config.css %>',
        src: '{,*/}*.css'
      }
    },

    replace: {
      sourceMap: {
        options: {
          patterns: [

            {
              match: /(\.\.\/.+\/)([\w\d\-_]+)(\-min\.js)/,
              replacement: '$2.js'
            }/*,
            //"../../.tmp/concat/js/libs-config-min.js"
            {
              match: '../../.tmp/concat/js/libs-min.js',
              replacement: 'lib.js'
            }, {
              match: '../../.tmp/concat/js/libs-config-min.js',
              replacement: 'libs-config.js'
            }, {
              match: '../../.tmp/concat/js/<%%= config.appname %>-min.js',
              replacement: '<%%= config.appname %>.js'
            }, {
              match: '../../script/<%%=config.appname %>.coffee',
              replacement: 'src/<%%=config.appname %>.coffee'
            }*/
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['<%%=config.jsDist%>/*.map'], dest: '<%%=config.jsDist%>'}
        ]
      }
    }, <% if (appconf.modernizr) { %>

    // 生成一个自定义的Modernizr版本, 此版本中仅包含在您的应用程序中所引用的检测方法
    modernizr: {
      dist: {
        devFile: '<%%= config.bower %>/modernizr/modernizr.js',
        outputFile: '<%%= config.jsDist %>/modernizr.js',
        files: {
          src: [
            //'<%%= config.jsDist %>/{,*/}*.js',
            //'<%%= config.cssDist %>/{,*/}*.css',
            //'!<%%= config.jsDist %>/vendor/*'
          ]
        },
        uglify: true
      }
    },<% } %><% if (appconf.requirejs) { %>

    bower: {
      all: {
        rjsConfig: '<%%= config.jsSrc %>/requirejs.config.js',
        options: {
          'exclude-dev': true,
          baseUrl: '<%= appconf.appname %>/<%= appconf.JS_DIR %>/',
          exclude: [
            'modernizr'<% if (appconf.bootstrap && appconf.sass) { %>,
            'sass-bootstrap'<% } %>
          ]
        }
      }
    },
    <% } %>

    // 并行的运行某些任务，以加快构建过程
    concurrent: {
      server: [<% if (appconf.sass) { %>
        'sass:server',<% } if (appconf.coffeescript) {  %>
        'coffee:dist',<% } %>
        'copy:styles'
      ],
      test: [<% if (appconf.coffeescript) { %>
        'coffee',<% } %>
        'copy:styles'
      ],
      dist: [<% if (appconf.coffeescript) { %>
        'coffee',<% } if (appconf.sass) { %>
        'sass',<% } %>
        'copy:styles',
        //'imagemin',
        'svgmin'
      ]
    },

    // 根据代码注释自动生成API文档
    dox: {
      options: {
        title: 'Ignore Nothing for my awesome documentation'
      },
      files: {
        // ignore: ['test'],
        src: ['<%%= config.js %>/', '<%%= config.test %>/'],
        dest: '<%%= config.doc %>/dox'
      }
    },

    // Documention with jsDoc
    // "grunt-jsdoc": "^0.6.0",
    //
    // jsdoc : {
    //     dist : {
    //         src: ['<%%= config.js %>/*.js', '<%%= config.test %>/*.js'],
    //         options: {
    //             destination: '<%%= config.doc %>/jsdoc'
    //         }
    //     }
    // },

    // 打包
    zip: {
        // 生成一个部署用的zip包
        deploy : {
            cwd: '<%%= config.dist %>',
            src: [
                '<%%= config.dist %>/**/*.*'
            ],
            dest: '<%%= config.tmp %>/deploy.zip'
        },

        // 生成一个当前版本的发布包，保存到release目录；
        release : {
            cwd: '<%%= config.dist %>',
            src: [
                '<%%= config.dist %>/**/*.*'
            ],
            dest: '<%%= config.release %>/<%%= config.appname %>-v<%%= config.version %>.zip'
        }
    },

    // SSH 配置
    // shconfig: grunt.file.readJSON('.sshconf'),
    sshconf: (function() {
      var sshconf;
      var confFile = findup('.tui/ssh.conf');

      if (confFile) {
        sshconf = fs.readJsonSync(confFile) || {};
      } else {
        sshconf = {};
      }
      return sshconf;
    }()),

    // 自动部署到对应的环境 (需要配置环境的登录账户和权限，见/tui-workspace/.sshconf)
    'sftp-deploy': {
        test2: {
            auth: {
                host: deploy.test2.host,
                port: deploy.test2.port,
                authKey: 'test2'
            },
            src: '<%%= config.tmp %>/deploy.zip',
            dest: deploy.test2.dir,
            //exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
            'server_sep': deploy.test2.sep
        },
        test3: {
            auth: {
                host: deploy.test3.host,
                port: deploy.test3.port,
                authKey: 'test3'
            },
            src: '<%%= config.tmp %>/deploy.zip',
            dest: deploy.test3.dir,
            //exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
            'server_sep': deploy.test3.sep
        },
        yufa: {
            auth: {
                host: deploy.yufa.host,
                port: deploy.yufa.port,
                authKey: 'yufa'
            },
            src: '<%%= config.tmp %>/deploy.zip',
            dest: deploy.yufa.dir,
            //exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
            'server_sep': deploy.yufa.sep
        }
    },

    // 执行远程命令（部署时sftp-deploy任务会先上传一个zip包到对应的环境，在这里远程对zip包解压以完成代码替换）
    sshexec: {
      test2: {
        command: ['cd '+ deploy.test2.dir + config.appname +' && unzip -uo deploy.zip'],
        options: {
          config: 'test2'
        }
      },
      'test2_del': {
        command: ['cd '+ deploy.test2.dir + config.appname +' && rm -fv deploy.zip'],
        options: {
          config: 'test2'
        }
      },
      test3: {
        command: ['cd '+ deploy.test3.dir + config.appname +' && unzip -uo deploy.zip'],
        options: {
          config: 'test3'
        }
      },
      'test3_del': {
        command: ['cd '+ deploy.test3.dir + config.appname +' && rm -fv deploy.zip'],
        options: {
          config: 'test3'
        }
      },
      yufa: {
        command: ['cd '+ deploy.yufa.dir + config.appname +' && unzip -uo deploy.zip'],
        options: {
          config: 'yufa'
        }
      },
      'yufa_del': {
        command: ['cd '+ deploy.yufa.dir + config.appname +' && rm -fv deploy.zip'],
        options: {
          config: 'yufa'
        }
      }
    }, <% if (appconf.mockjs) { %>

    "mockjs_detach": {
      options: {
        begin: '<!-- mockjs -->', // default to: <!-- mockjs -->
        end: '<!-- endmockjs -->' // default to: <!-- endmockjs -->
      },
      app: {
        expand: true,
        cwd: '<%%= config.dist %>',
        src: '{,*/}*.html',
        dest: '<%%= config.dist %>'
      },
    },<% } %>

    // 对任务构建的状态或结果显示桌面提示
    'notify_hooks': {
        options: {
            enabled: true,
            title: 'TUI <%= config.appname %> Grunt',
            'max_jshint_notifications': 5 // 最多显示5条jshint提示
        }
    },

    notify: {
        watch: {
          options: {
            title: '已经重新编译',  // 可选
            message: '应用“<%= appconf.appname %>”文件已经重新编译.' // 必须
          }
        },
        server: {
          options: {
            message: '应用<%= config.appname %>的预览服务器已经启动: http://127.0.0.1:<%%= connect.options.port %>'
          }
        },
        deployToTest2: {
            options: {
                message: '应用<%= config.appname %>成功部署到 Test2。.'
            }
        },
        deployToTest3: {
            options: {
                message: '应用<%= config.appname %>成功部署到 Test3。.'
            }
        },
        deployToYufa: {
            options: {
                message: '应用<%= config.appname %>成功部署到 yufa。.'
            }
        }
    }<% if (appconf.nodewebkit) { %>,

    nodewebkit: {
      options: {
        version   : pkg.nwDependencies,
        'force_download' : false,
        'build_dir'   : '<%%=config.build%>',
        //credits     : './<%=config.app%>/credits.html',
        //platforms : ['win','osx', 'linux64', 'linux32'],
        mac         : true,
        linux32     : false,
        win         : true,
        linux64     : true,
        winExeUrl   : ''/*,
        winIco: './icons/favicon.ico',
        macIcns: './icons/favicon.icns'*/
      },
      app: './<%%=config.dist%>/**/*'
    }<% } %>

  });

  //为预览服务器设置一个随即端口，以防止多应用并行开发时引起端口冲突；
  grunt.registerTask('setServerPort', function() {
    var eport = require('eport');
    var times = 0;
    var async = this.async();

    function done() {
      if (times === 2) {
        async();
      }
    }

    // 预览服务器端口（浏览器访问端口）;
    eport(function(err, port) {
      grunt.config.set('connect.options.port', port);
      times += 1;
      done();
    });

    // 即时刷新服务端口;
    eport(function(err, port) {
      grunt.config.set('connect.options.livereload', port);
      times += 1;
      done();
    });
  });

  // 注册预览服务器任务
  grunt.registerTask('serve', '启动服务器并预览您的应用, 加上此选项以允许远程访问您的APP：--allow-remote', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'setServerPort',
      'clean:server',
      'wiredep',<% if (appconf.requirejs) { %>
      'bower',<% } %>
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  // 注册预览服务器任务(上一个任务"serve"的别名)
  grunt.registerTask('server', function (target) {
    grunt.log.warn('任务`server`已经被废弃，请使用`grunt serve`命令启动服务器.');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  // 注册单元测试任务
  grunt.registerTask('test', function (target) {
    if (target !== 'watch') {
      grunt.task.run([
        'clean:server',
        'concurrent:test',
        'autoprefixer'
      ]);
    }

    grunt.task.run([
      'connect:test',<% if (appconf.testframework === 'mocha') { %>
      'mocha'<% } else if (appconf.testframework === 'jasmine') { %>
      'jasmine'<% } %>
    ]);
  });

  // 注册构建任务
  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',<% if (appconf.requirejs) { %>
    'bower',<% } %>
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',<% if (appconf.angularjs) { %>
    'ngAnnotate',<% } %>
    'cssmin',
    'uglify',
    'copy:dist',
    'replace',<% if (appconf.modernizr___) { %>
    'modernizr',<% } %>
    //'rev',
    'usemin', <% if (appconf.mockjs) { %>
    'mockjs_detach', <% } %>
    'htmlmin',
    'replace'
  ]);

  <% if (appconf.nodewebkit) { %>
  grunt.registerTask('nw', function (target) {
    grunt.log.ok('"grunt nodewebkit" 的别名');
    grunt.task.run([target ? ('nodewebkit:' + target) : 'nodewebkit']);
  });

  grunt.registerTask('nwbuild', function (target) {
    grunt.log.ok('打包桌面应用');
    var nwTask = (target ? ('nodewebkit:' + target) : 'nodewebkit');
    grunt.task.run(['clean:nw', 'build', nwTask]);
  });

  grunt.registerTask('buildnw', ['nwbuild']);
  <% } %>

  grunt.registerTask('s', function (target) {
    grunt.log.ok('"grunt serve" 的别名');
    grunt.task.run([target ? ('serve:' + target) : 'serve']);
  });

  grunt.registerTask('t', function (target) {
    grunt.log.ok('"grunt test" 的别名');
    grunt.task.run([target ? ('test:' + target) : 'test']);
  });

  grunt.registerTask('dist', function (target) {
    grunt.log.ok('"grunt build" 的别名');
    grunt.task.run([target ? ('build:' + target) : 'build']);
  });
  grunt.registerTask('b', function (target) {
    grunt.log.ok('"grunt build" 的别名');
    grunt.task.run([target ? ('build:' + target) : 'build']);
  });

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
