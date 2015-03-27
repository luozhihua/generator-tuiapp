# TUI Web App 生成器

一个基于 [Yeoman](http://yeoman.io) 的前端应用自动生成器，用来快速初始化一个集成了Grunt构建工具和Bower包管理工具的现代Web应用。

======

## 特性

* 自动补充CSS前缀，如：-webkit, -moz
* 内置预览服务器（支持页面即时自动刷新）
* 自动编译CoffeeScript和Sass/Less
* 自动检查Javascript语法，规范和错误
* 使用grunt-wiredep自动将应用所使用的bower组件注入到HTML页面（#第三方依赖项）
* 自动对图片进行最佳优化（使用OptiPNG, pngquant, jpegtran和gifsicle包分别对png/jpg/jpeg/gif优化）
* 集成Mocha单元测试框架（使用PhantomJS运行测试用例）
* 提供支持Sass语法的Bootstrap （可选项）
* 提供用于浏览器功能检测的Modernizr (可选项)
* 提供Angular/Underscore/Async/Animate.css/等前端框架或类库
* 支持自动部署到`Test2`和`Test3`等环境
* 支持自动在Gitlab服务器创建仓库

如果想要了解更多关于`generator-tuiapp`能为你做什么，可以查看其中使用的package.json: /app/templates/_package.json


## 快速开始

- 安装NodeJS
- 安装 Grunt-cli 和 Bower
```
    npm install -g grunt-cli
    npm install -g bower
```
- 安装本生成器(打开命令行终端，输入此命令并按回车执行)：

```
    npm install -g git+https://github.com/luozhihua/generator-tuiapp.git
```

- 为你的新应用创建一个文件夹, 并在此文件夹打开命令行终端，如：

  - Windows 7+: 在你的工作目录内创建文件夹‘app-demo’并打开，然后按住SHIFT键并右击，在右键菜单中选择“在此处打开命令行窗口”
  - Linux/Mac:

```
    cd ~/workspace
    mkdir app-demo && cd app-demo
```
- 在命令行终端执行命令: `yo tuiapp`
- 然后根据终端的提示, 输入或选择必要的配置数据, 等待安装完成即可

至此，生成器已经为您在app-demo文件夹内生成了一个新的应用，接下来您只需要在此基础上继续完善即可, 在您开始动手为新应用写代码前，先为app-demo启动一个监视和预览服务器：

1. 在app的根目录打开命令行终端
2. 执行命令：`grunt serve`

执行`grunt serve`后会自动在后台启动一个web服务器并监视app-demo目录内的文件，一旦有修改，服务器会自动更新浏览器的页面，不再需要频繁的手动刷新浏览器，接下来就可以向公司申请为你配置两台显示器了，一台显示器用来写代码，另一台用来即时预览效果，简直棒极了，再也不用在浏览器和编辑器之间切换到手软.

当你完成了应用的开发，那么现在你需要构建一份简洁的代码用来发布，构建代码的命令非常简单, 在app-demo目录打开命令行终端并执行命令：`grunt`，grunt会自动对你代码的语法和规范做JSHINT检测，并执行你的测试用例进行单元测试，一旦发现语法错误、不符合规范的代码以及单元测试失败，构建过程将会终止，你必须根据检测结果修正错误后才能编译通过，执行`grunt`后，会在app-demo目录下生成一个dist的目录，此目录下的代码就是用来发布到生产或测试环境的代码

为什么前端代码开发完成后还需要构建另外的代码呢？因为，为了更好的可维护性和可读性，一般建议开发时把代码分割成很小的模块，而发布时，为了提高页面加载和执行效率，需要对页面、脚本、样式和图片进行合并和压缩，或者对CoffeeScript/Sass/Less等语言编译成原生的JS和CSS, 这些都交给grunt build命令来处理就行，它会比你手工处理这些任务做的更快、更好、更规范、更稳定。

- 启动预览服务器: `grunt serve` [\*](#grunt-serve-note). 若要从其他计算机或手机上预览您正在开发的应用，请加上选项：`--allow-remote``--allow-remote`
- 构建代码命令: `grunt`

当你构建好用于发布的代码后，你需要将代码发布到公用的开发环境（如test2）、测试环境（如test3）或者预发布环境（如yufa）等，此时，你会习惯性的想到打开SFTP客户端，然后连接服务器，并定位到对应的目录，然后从你本地找到你要发布的代码文件，最后复制+粘贴； 这过程有多繁琐啊，如果我此刻告诉你能用一种你从未曾尝试过却简单得令人窒息的方式来发布你的代码呢？别说你早以习惯于以前的发布流程了，那么来看看现在怎么发布吧：

- 发布到test2环境：`grunt test2` 或者 `grunt dev`
- 发布到test3环境：`grunt test3`
- 发布到预发环境：`grunt yufa`

就如此简单，你敢相信吗？你再也不用记住各种IP地址，登录账户和密码就能轻松的发布代码了，再也不用每次上线都满大街找需要上线的文件了，记住需要发布哪些应用即可。


#### 安装第三方依赖包

*(HTML/CSS/JS/Images/etc)*

我们采用 [grunt-wiredep](https://github.com/stephenplusplus/grunt-wiredep) 管理第三方的依赖包. 使用**Bower**安装第三方组件，然后使用**Grunt**将安装的Bower Package自动注入到测试页面，如：

```sh
$ bower install --save jquery
$ grunt wiredep
```

如果您喜欢自己亲手添加依赖，那么执行`bower install --save depPackage`, depPackage将会安装到plugin-demo的根目录, 然后您在index.html或者其他页面创建一个`script`或`style`标签，用来引用刚安装的依赖组件。

*提示*: 项目添加到Git仓库后将会排除node_module和bower_components目录，所以当您第一次签出项目代码后，需要在您签出的源码目录内运行命令：`bower install && npm install` 来安装工具和环境。


#### Grunt Serve 说明

注意: `grunt server` 已经废弃，不赞成继续使用，请使用此命令：`grunt serve`.


## Options

* `--skip-install`

  当生成器完成文件生成和扫描后，跳过自动执行的命令：`bower install` 和 `npm install`

* `--test-framework=<framework>`

  默认使用 `mocha` 单元测试框架，您可以设置为您熟悉的单元测试框架，比如：`jasmine`.

* `--coffee`

  启用 [CoffeeScript](http://coffeescript.org/) 支持.


## 贡献您的代码

如果您提交代码为此项目增加了非常棒的特性、解决了一些BUG、或者能改进代码可维护性，我们将会很乐意接受并合并您的代码，欢迎各位为我们的项目贡献高质量的代码。

## 协议

[BSD license](http://opensource.org/licenses/bsd-license.php)
