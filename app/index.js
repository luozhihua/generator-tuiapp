'use strict';

var fs     = require('fs-extra');
var path   = require('path');
var join   = require('path').join;
var yeoman = require('yeoman-generator');
var chalk  = require('chalk');
var findup = require('findup-sync');
var _      = require('lodash');
var _s     = require('underscore.string');

var bowerrc = fs.readJsonSync(path.resolve(__dirname, './templates/bowerrc'));
var appconf;
var appconfTemplate = path.resolve(__dirname, './templates/_appconf');
var appconfFile = path.join(process.cwd(), '.appconf');
var warningExists;
var warningNotEmpty = fs.readdirSync(process.cwd()).length;

// 尝试读取历史配置
if (fs.existsSync(appconfFile)) {
  warningExists = true;
  appconf = fs.readJsonSync(appconfFile);
} else {
  appconf = fs.readJsonSync(appconfTemplate);
}


// 路径配置
appconf.BOWER_DIR     = bowerrc.directory;

appconf.JS_SRC_DIR    = appconf.SRC_DIR + '/' + appconf.SCRIPTS_DIR;
appconf.CSS_SRC_DIR   = appconf.SRC_DIR + '/' + appconf.STYLES_DIR;

appconf.IMG_SRC_DIR   = appconf.SRC_DIR + '/' + appconf.IMG_DIR;
appconf.HTML_SRC_DIR  = appconf.SRC_DIR + '/' + appconf.HTML_DIR;
appconf.TEMPL_SRC_DIR = appconf.SRC_DIR + '/' + appconf.TEMPL_DIR;
appconf.DATA_SRC_DIR  = appconf.SRC_DIR + '/' + appconf.DATA_DIR;

appconf.JS_DIST_DIR   = appconf.DIST_DIR + '/' + appconf.JS_DIR;
appconf.CSS_DIST_DIR  = appconf.DIST_DIR + '/' + appconf.CSS_DIR;
appconf.IMG_DIST_DIR  = appconf.DIST_DIR + '/' + appconf.IMG_DIR;
appconf.HTML_DIST_DIR = appconf.DIST_DIR + '/' + appconf.HTML_DIR;
appconf.TEMPL_DIST_DIR = appconf.DIST_DIR + '/' + appconf.TEMPL_DIR;
appconf.DATA_DIST_DIR = appconf.DIST_DIR + '/' + appconf.DATA_DIR;


var tuircPath = findup('.tuirc');
var tuirc = tuircPath ? fs.readJsonSync(tuircPath) : {user:{}};

function tuiSayHello() {
    return '\n' +
      '       ██████████    ██        ██      ██\n'+
      '           ██        ██        ██      ██\n'+
      '           ██        ██        ██      ██\n'+
      '           ██        ████████████      ██\n'+
      '       ══════════════════════════════════\n'+
      '       时 代 光 华 ELN 4.0 应 用 生 成 器\n'+
      '       ══════════════════════════════════\n'+
      '       @author: Colin<mail@luozhihua.com>\n'
      ;
}

function warning(text) {

    if (!text) {
      return text;
    }

    var num = 19;
    var texts = _s.chop(text, num);
    var xxx = texts.map(function(a) {
      return a.split('\n');
    });
    xxx = _.flatten(xxx);

    xxx = xxx.map(function(a) {
      var str;
      var enchars = a.match(/[^，。？《》【】、～（）￥×！：“‘\u4e00-\u9fa5]/g);
      var ennum = enchars?enchars.length:0;

      if (a.length < num) {
        str = _s.pad(a, ((num-a.length+ennum))*2 + (a.length-ennum), '  ', 'right');
      } else {
        str = _s.pad(a, ennum*2, '  ', 'right');
      }

      return str;
    });

    return ('\n' +
      '  ╔══════════════════════════════════════════╗\n'+
      '  ║                                          ║\n'+
      '  ║                警    告                  ║\n'+
      '  ║  --------------------------------------  ║\n'+
      '  ║                                          ║\n'+
      '  ║  ' + xxx.join('  ║\n  ║  ') +      '  ║\n'+
      '  ║                                          ║\n'+
      '  ║                              Colin @ TUI ║\n'+
      '  ╚══════════════════════════════════════════╝\n'
    );
}

module.exports = yeoman.generators.Base.extend({

  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    // 如果是重新生成，则向用户发出警告；
    if (warningNotEmpty) {
      if (warningExists) {
        this.log(chalk.red(warning('此目录已存在1个应用——'+ appconf.appname.toUpperCase() +'\n \n若您继续操作会覆盖原来的部分文件，有可能会导致您自己编写的代码丢失，一旦重新生成将不能再回滚，请务必谨慎！')));
      } else {
        this.log(chalk.red(warning('检测到当前目录不为空，请您在新建的目录（或空目录）下运行本程序。\n \n程序已自动终止...')));
        process.exit();
      }
    } else if (!this.options['skip-welcome-message']) {
      // 欢迎消息
      this.log(chalk.cyan(tuiSayHello()));
      this.log(chalk.magenta(
        '即将为您创建一个开箱即用的, 集成了常用框架、类库、组件以及单元测试框架的App.\n\n'
      ));
    }

    appconf.appname = this.appname = this.appname.replace(/(_| )/g, '-');

    this.appconf = appconf;
    this.author = tuirc.user;
    this.pkg    = require('../package.json');

    this.option('appname', {
      desc: '设置应用名称',
      type: String,
      defaults: appconf.appname || 'new_tuiapp'
    });

    // for (var k in appconf) {
    //   if (k.match(/_DIR$/)) {
    //     this.option(k.toLowerCase().replace(/_/g, '-'), {
    //       desc: k.toLowerCase().replace(/_/g, ' '),
    //       type: String,
    //       defaults: appconf[k]
    //     });
    //   }
    // }

    // 设置单元测试框架
    this.option('test-framework', {
      desc: '使用的测试框架',
      type: String,
      defaults: appconf.testframework || 'mocha'
    });
    appconf.testframework = this.options['test-framework'];

    /**
     * @param {String} 使用默认配置,不要询问任何问题
     */
    this.option('noask', {
      desc: '使用默认配置,不要询问',
      type: Boolean,
      defaults: false
    });

    /**
     * 配置脚本语言
     *
     * @param {String} script 使用哪门脚本语言？--script=javascript,coffeescript,typescript,livescript
     */
    this.option('script', {
      desc: '使用哪门脚本语言？--script=javascript,coffeescript,typescript,livescript',
      type: String,
      defaults: appconf.script || ''
    });
    appconf.script = this.options.script;

    /**
     * @param {String} coffee 是否使用coffeescript
     */
    this.option('coffee', {
      desc: '使用 CoffeeScript',
      type: Boolean,
      defaults: appconf.coffeescript || (this.options.script === 'coffee' || this.options.script === 'coffeescript')
    });
    appconf.coffeescript = this.options.coffee;

    /**
     * @param {String} livescript 是否使用livescript
     */
    this.option('livescript', {
      desc: '使用 liveScript',
      type: Boolean,
      defaults: appconf.livescript || (this.options.script === 'livescript')
    });
    appconf.livescript = this.options.livescript;

    /**
     * @param {String} typescript 是否使用typescript
     */
    this.option('typescript', {
      desc: '使用 typeScript',
      type: Boolean,
      defaults: appconf.typescript || (this.options.script === 'typescript')
    });
    appconf.typescript = this.options.typescript;

    /**
     * @param {String} javascript 是否使用javascript
     */
    this.option('javascript', {
      desc: '使用原生的 JavaScript',
      type: Boolean,
      defaults: appconf.javascript || (!appconf.coffeescript && !appconf.typescript && !appconf.livescript)
    });
    appconf.javascript = this.options.javascript;

    /**
     * 配置样式语言，默认为原生CSS语法
     * @param {String} style 指定样式语言？--style=css,scss,less,stylus
     */
    this.option('style', {
      desc: '指定样式语言？--style=css,scss,less,stylus',
      type: String,
      defaults: appconf.style || ''
    });
    appconf.style = this.options.style;

    this.option('scss', {
      desc: '使用SCSS',
      type: Boolean,
      defaults: appconf.scss || (this.options.style === 'scss' || (this.options.style === 'sass'))
    });
    this.option('sass', {
      desc: '使用SASS',
      type: Boolean,
      defaults: appconf.sass || (this.options.scss)
    });
    appconf.scss = this.options.scss;
    appconf.sass = this.options.scss;

    this.option('less', {
      desc: '使用less',
      type: Boolean,
      defaults: appconf.less || (this.options.style === 'less')
    });
    appconf.less = this.options.less;

    this.option('stylus', {
      desc: '使用stylus',
      type: Boolean,
      defaults: appconf.stylus || (this.options.style === 'stylus')
    });
    appconf.stylus = this.options.stylus;

    this.option('css', {
      desc: '使用原生的 css',
      type: Boolean,
      defaults: appconf.css || (!appconf.scss && !appconf.less && !appconf.stylus)
    });
    appconf.css = this.options.css;

    this.option('mockjs', {
      desc: '使用 mockjs 产生模拟数据',
      type: Boolean,
      defaults: appconf.nockjs || false
    });
    appconf.mockjs = this.options.mockjs;

    this.option('tuicore', {
      desc: 'TUI 核心框架',
      type: Boolean,
      defaults: appconf.tuicore || true
    });
    appconf.tuicore = this.options.tuicore;

    //
    this.option('tuiplugins', {
      desc: 'TUI 依赖的第三方组件',
      type: Boolean,
      defaults: appconf.tuiplugins || true
    });
    appconf.tuiplugins = this.options.tuiplugins;

    // Bootstrap
    this.option('bootstrap', {
      desc: '使用 Bootstrap',
      type: Boolean,
      defaults: appconf.bootstrap || false
    });
    appconf.bootstrap = this.options.bootstrap;

    // AngularJS
    this.option('angularjs', {
      desc: '使用 AngularJS',
      type: Boolean,
      defaults: appconf.angularjs || false
    });
    appconf.angularjs = this.options.angularjs;

    var ngmodules = [
      'angular-route',
      'angular-loader',
      'angular-cookies',
      'angular-i18n',
      'angular-touch',
      'angular-animate',
      'angular-messages',
      'angular-mocks',
      'angular-sanitize',
      'angular-resource',
      'angular-scenario',
      'angular-aria'
    ];
    ngmodules.forEach(function(ngm) {
      this.option(ngm, {
        desc: '安装AngularJS模块：'+ ngm,
        type: Boolean,
        defaults: appconf[ngm] || false
      });
      appconf[ngm] = this.options[ngm];
    }.bind(this));

    // requirejs
    this.option('requirejs', {
      desc: '使用 RequireJS',
      type: Boolean,
      defaults: appconf.requirejs || false
    });
    appconf.requirejs = this.options.requirejs;

    // asyncjs
    this.option('async', {
      desc: '使用 async',
      type: Boolean,
      defaults: appconf.async || false
    });
    appconf.async = this.options.async;

    // underscore
    this.option('underscore', {
      desc: '使用 underscore',
      type: Boolean,
      defaults: appconf.underscore || false
    });
    appconf.underscore = this.options.underscore;

    // backbone
    this.option('backbone', {
      desc: '使用 backbone',
      type: Boolean,
      defaults: appconf.backbone || false
    });
    appconf.backbone = this.options.backbone;

    // animatecss
    this.option('animatecss', {
      desc: '使用 animatecss',
      type: Boolean,
      defaults: appconf.animatecss || false
    });
    appconf.animatecss = this.options.animatecss;

    // fontawesome
    this.option('fontawesome', {
      desc: '使用 fontawesome',
      type: Boolean,
      defaults: appconf.fontawesome || false
    });
    // fa
    this.option('fa', {
      desc: '使用 fontawesome, `--fontawesome`缩写',
      type: Boolean,
      defaults: this.options.fontawesome
    });
    appconf.fontawesome = this.options.fontawesome;
    appconf.fa = this.options.fa;

    // modernizr
    this.option('modernizr', {
      desc: '使用 modernizr',
      type: Boolean,
      defaults: appconf.modernizr || false
    });
    appconf.modernizr = this.options.modernizr;
  },

  askFor: function () {
    var done = this.async();

    // 如果从命令行指定了不询问关于配置项的问题，则直接跳过。
    if (this.options.noask) {

      // 设置默认Sass解析库
      if (this.options.sass) {
        appconf.libsass   = true;
        appconf.rubysass  = !appconf.libsass;
      }

      done();
      return;
    }

    var continueText = '忽略警告';
    var prompts = [{
      when: function() { return warningExists; },
      name: 'warning',
      type: 'string',
      message: '有未处理的警告信息，请输入“'+ continueText +'”继续: ',
      default: '输入错误将会自动退出', // 'newapp'
      validate: function(answer) {
        if (answer === continueText) {
          return true;
        } else {
          process.exit();
        }
      },
      required: true
    }, {
      name: 'appname',
      type: 'string',
      message: '请输入新应用的名称 \n(仅支持字母和数字，首字符不能为数字, 如：els、os...): ',
      default: appconf.appname || this.appname, // 'newapp'
      validate: function(answer) {
        return answer.match(/[\-_ \W]/g) ? false : true;
      },
      required: true
    }, {
      type: 'list',
      name: 'scriptLangs',
      message: '选择您擅长的脚本语言？',
      default: function() {
        return  (appconf.coffeescript ? 'coffeescript' :
                  appconf.livescript ? 'livescript' :
                    appconf.typescript ? 'typescript' : 'javascript');

      },
      choices: [{
        name: 'JavaScript',
        value: 'javascript'
      }, {
        name: 'CoffeeScript',
        value: 'coffeescript',
        checked: true
      }, {
        name: 'LiveScript',
        value: 'livescript'
      }, {
        name: 'TypeScript',
        value: 'typescript'
      }]
    }, {
      type: 'list',
      name: 'styleLangs',
      message: '选择您擅长的样式预处理器？',
      default: function() {
          return ((appconf.scss||appconf.sass) ? 'sass' :
              appconf.less ? 'less' :
                appconf.stylus ? 'stylus' : 'css');
      },
      choices: [{
        name: 'css',
        value: 'css'
      }, {
        name: 'SCSS/SASS',
        value: 'sass'
      }, {
        name: 'LESS',
        value: 'less'
      }, {
        name: 'Stylus',
        value: 'stylus'
      }]
    }, {
      type: 'checkbox',
      name: 'libs',
      message: '应用需要使用的JS和CSS框架或类库：',
      choices: [{
        name: 'jQuery',
        value: 'jQuery',
        checked: this.options.jquery
      },{
        name: 'TUI core',
        value: 'tui',
        checked: this.options.tuicore
      },{
        name: 'Bootstrap',
        value: 'bootstrap',
        checked: this.options.bootstrap
      },{
        name: 'Async',
        value: 'async',
        checked: this.options.async
      },{
        name: 'AngularJS',
        value: 'angularjs',
        checked: this.options.angularjs
      },{
        name: 'RequireJS',
        value: 'requirejs',
        checked: this.options.requirejs
      },{
        name: 'Modernizr',
        value: 'modernizr',
        checked: this.options.modernizr
      },{
        name: 'Underscore',
        value: 'underscore',
        checked: this.options.underscore
      },{
        name: 'Font-Awesome',
        value: 'fa',
        checked: this.options.fa
      },{
        name: 'Animate.css',
        value: 'animateCss',
        checked: this.options.animatecss
      },{
        name: 'MockJS (模拟数据生成器)',
        value: 'mockJS',
        checked: this.options.mockjs
      }]
    }, {
      when: function (answers) {
        return answers && answers.libs &&
          answers.libs.indexOf('angularjs') !== -1;
      },
      type: 'checkbox',
      name: 'ngcomponents',
      message: '您选择了AngularJS框架，请继续选择您需要安装的AngularJS组件：',
      choices: [
        {name: 'angular-route',    value: 'angular-route',    checked: this.options['angular-route']},
        {name: 'angular-loader',   value: 'angular-loader',   checked: this.options['angular-loader']},
        {name: 'angular-cookies',  value: 'angular-cookies',  checked: this.options['angular-cookies']},
        {name: 'angular-i18n',     value: 'angular-i18n',     checked: this.options['angular-i18n']},
        {name: 'angular-touch',    value: 'angular-touch',    checked: this.options['angular-touch']},
        {name: 'angular-animate',  value: 'angular-animate',  checked: this.options['angular-animate']},
        {name: 'angular-messages', value: 'angular-messages', checked: this.options['angular-messages']},
        {name: 'angular-mocks',    value: 'angular-mocks',    checked: this.options['angular-mocks']},
        {name: 'angular-sanitize', value: 'angular-sanitize', checked: this.options['angular-sanitize']},
        {name: 'angular-resource', value: 'angular-resource', checked: this.options['angular-resource']},
        {name: 'angular-scenario', value: 'angular-scenario', checked: this.options['angular-scenario']},
        {name: 'angular-aria',     value: 'angular-aria',     checked: this.options['angular-aria']}
      ]
    }, {
      when: function (answers) {
        return answers && answers.styleLangs &&
          answers.styleLangs.indexOf('sass') !== -1;
      },
      type: 'confirm',
      name: 'libsass',
      value: 'libsass',
      message: '是否使用node-sass解析库来解析SASS? 了解更多: ' +
        chalk.green('https://github.com/andrew/node-sass#node-sass'),
      default: false
    }];

    this.prompt(prompts, function (answers) {

      var scriptLangs = answers.scriptLangs;
      var styleLangs = answers.styleLangs;
      var libs = answers.libs;
      var ngcomponents = answers.ngcomponents;
      var appname = answers.appname.replace(/[\s\_]/g, '-');

      appconf.ngcomponents = ngcomponents;
      appconf.libs = libs;

      function useLib(lib) {
        return libs && libs.indexOf(lib) !== -1;
      }

      function useLang(lang) {
        return (scriptLangs && scriptLangs.indexOf(lang) !== -1) ||
               (styleLangs && styleLangs.indexOf(lang) !== -1);
      }

      appconf.appname   = appname || this.appname;

      // 使用的样式预处理器
      appconf.sass      = useLang('sass');
      appconf.scss      = useLang('sass');
      appconf.less      = useLang('less');
      appconf.stylus    = useLang('stylus');
      appconf.css       = (!appconf.sass && !appconf.scss && !appconf.less && !appconf.stylus);

      // 使用的脚本语言
      appconf.coffeescript = useLang('coffeescript');
      appconf.typescript   = useLang('typescript');
      appconf.livescript   = useLang('livescript');
      appconf.javascript   = (!appconf.coffeescript &&!appconf.typescript &&!appconf.livescript);

      // 使用的前端框架和类库
      appconf.requirejs   = useLib('requirejs');
      appconf.bootstrap   = useLib('bootstrap');
      appconf.jquery      = useLib('jquery');
      appconf.tui         = useLib('tui');
      appconf.angularjs   = useLib('angularjs');
      appconf.modernizr   = useLib('modernizr');
      appconf.async       = useLib('async');
      appconf.underscore  = useLib('underscore');
      appconf.fontawesome = useLib('fontawesome') || useLib('fa');
      appconf.fa          = appconf.fontawesome;
      appconf.animatecss  = useLib('animatecss');
      appconf.mockjs      = useLib('mockjs');

      // AngularJS组件
      for (var i=0,len=ngcomponents.length; i<len; i++) {
        appconf[ngcomponents[i]] = true;
      }

      // Sass解析库
      appconf.libsass   = !!answers.libsass;
      appconf.rubysass  = !answers.libsass;

      // 将配置项应用到生成器上下文
      for (var k in appconf) {
        if (k.match(/^include/)) {
          this[k] = appconf[k];
        }
      }

      done();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: appconf.appname,
      private: true,
      dependencies: {},
      devDependencies: {}
    };
    var undef;

    if (appconf.bootstrap) {
      var bs = 'bootstrap' + (appconf.sass ? '-sass-official' : '');
      bower.dependencies[bs] = '~3.2.0';
    } else {
      bower.dependencies.jquery = '~1.11.1';
    }

    if (appconf.tuicore) {
     // bower.dependencies['tui-core'] = '*';
    }

    bower.dependencies.modernizr   = appconf.modernizr   ? '*'       : undef;
    bower.dependencies.requirejs   = appconf.requirejs   ? '>=2.1.0' : undef;
    bower.dependencies.angularjs   = appconf.angular     ? '>=1.3.3' : undef;
    bower.dependencies.underscore  = appconf.underscore  ? '*'       : undef;
    bower.dependencies.async       = appconf.async       ? '*'       : undef;
    bower.dependencies.fontawesome = appconf.fontawesome ? '~4.2.0'  : undef;

    bower.dependencies['angular-route']    = appconf['angular-route']    ? '1.3.3' : undef;
    bower.dependencies['angular-loader']   = appconf['angular-loader']   ? '1.3.3' : undef;
    bower.dependencies['angular-cookies']  = appconf['angular-cookies']  ? '1.3.3' : undef;
    bower.dependencies['angular-i18n']     = appconf['angular-i18n']     ? '1.3.3' : undef;
    bower.dependencies['angular-touch']    = appconf['angular-touch']    ? '1.3.3' : undef;
    bower.dependencies['angular-animate']  = appconf['angular-animate']  ? '1.3.3' : undef;
    bower.dependencies['angular-messages'] = appconf['angular-messages'] ? '1.3.3' : undef;
    bower.dependencies['angular-mocks']    = appconf['angular-mocks']    ? '1.3.3' : undef;
    bower.dependencies['angular-sanitize'] = appconf['angular-sanitize'] ? '1.3.3' : undef;
    bower.dependencies['angular-resource'] = appconf['angular-resource'] ? '1.3.3' : undef;
    bower.dependencies['angular-scenario'] = appconf['angular-scenario'] ? '1.3.3' : undef;
    bower.dependencies['angular-aria']     = appconf['angular-aria']     ? '1.3.3' : undef;

    bower.dependencies.textillate = 'git@github.com:luozhihua/textillate.git#~0.3.3';

    // animate.css
    if (appconf.animatecss) {
      if (appconf.sass) {
        bower.dependencies['animate-sass'] = '~0.6.2';
      } else if (appconf.less) {
        bower.dependencies['animate-less'] = '~2.0.3';
      } else {
        bower.dependencies['animate.css'] = '~3.1.0';
      }
    }

    // MockJs
    if (appconf.mockjs) {
      bower.devDependencies.mockjs = '~0.1.5';
    }

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = (appconf.sass ? 's' : '') + 'css';
    this.template('main.' + css, appconf.CSS_SRC_DIR +'/'+ appconf.appname + '.' + css);
  },

  writeIndex: function () {
    this.indexFile = this.engine(
      this.readFileAsString(join(this.sourceRoot(), 'index.html')),
      this
    );

    // wire Bootstrap plugins
    if (appconf.bootstrap && !appconf.sass) {
      var bs = appconf.BOWER_DIR + '/bootstrap/js/';
      var sourceFileList = [
          bs + 'affix.js',
          bs + 'alert.js',
          bs + 'dropdown.js',
          bs + 'tooltip.js',
          bs + 'modal.js',
          bs + 'transition.js',
          bs + 'button.js',
          bs + 'popover.js',
          bs + 'carousel.js',
          bs + 'scrollspy.js',
          bs + 'collapse.js',
          bs + 'tab.js'
        ];

      this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: appconf.JS_DIR + '/libs.js',
        sourceFileList: sourceFileList,
        searchPath: '.'
      });
    }

    var jsPath = appconf.javascript ? appconf.SCRIPTS_DIR : appconf.JS_DIR;
    var list = [jsPath + '/'+ appconf.appname +'.js'];
    this.indexFile = this.appendFiles({
      html: this.indexFile,
      fileType: 'js',
      optimizedPath: appconf.JS_DIR + '/'+ appconf.appname +'.js',
      sourceFileList: list,
      searchPath: [appconf.javascript ? appconf.SCRIPTS_DIR : appconf.TEM_DIR]
    });
  },

  app: function () {
    this.mkdir(appconf.RELEASE_DIR);  // ./release
    this.mkdir(appconf.DIST_DIR);     // ./dist
    this.mkdir(appconf.TEST_DIR);     // ./test
    this.mkdir(appconf.DOC_DIR);      // ./doc
    this.mkdir(appconf.TMP_DIR);      // ./.tmp

    this.directory(appconf.SRC_DIR);  // ./app
    this.mkdir(appconf.JS_SRC_DIR);   // ./app/js
    this.mkdir(appconf.CSS_SRC_DIR);  // ./app/css
    this.mkdir(appconf.IMG_SRC_DIR);  // ./app/img
    this.mkdir(appconf.HTML_SRC_DIR); // ./app/html
    this.mkdir(appconf.TEMPL_SRC_DIR); // ./app/templ
    this.mkdir(appconf.DATA_SRC_DIR); // ./app/data
    this.write(appconf.SRC_DIR + '/index.html', this.indexFile);

    //fs.symlinkSync('../node_modules_share', 'node_modules', 'dir');

    if (appconf.coffeescript) {
      var coffeeFile = appconf.JS_SRC_DIR +'/'+ appconf.appname +'.coffee';
      this.write(
        coffeeFile,
        'console.log "嗨！我在文件 `'+ coffeeFile +'` 里面，记得来找我哦～ ;-)"'
      );
    }
    else {
      //var jsFile = appconf.JS_SRC_DIR +'/'+ appconf.appname +'.js';
      //this.write(jsFile, 'console.log(\'嗨！我在文件 `'+ jsFile +'` 里面，记得来找我哦～ ;-) \');');
      this.template('main.js', appconf.JS_SRC_DIR +'/'+ appconf.appname + '.js');
    }

    this.template('_README.md', 'README.md');
    this.write('.appconf', JSON.stringify(appconf, null, 4));
    this.copy('_tuiconf', '.tuiconf-demo');
    this.copy('npmrc', '.npmrc');
    this.copy('sshconf', '.sshconf-demo');
  },

  install: function () {

    this.on('end', function () {
      this.invoke(this.options['test-framework'], {
        options: {
          'skip-message': this.options['skip-install-message'],
          'skip-install': this.options['skip-install'],
          'coffee': this.options.coffee
        }
      });

      if (!this.options['skip-install']) {
        this.installDependencies({
          skipMessage: this.options['skip-install-message'],
          skipInstall: this.options['skip-install']
        });
      }

      this.config.save();
    });
  }
});