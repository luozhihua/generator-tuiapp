/*!
 * ELN Webapp <%=  appconf.appname%> JS 主文件
 *
 * -------------------------------------------------------
 * 本文件由<%= pkg.name %> (<%= pkg.description %>) 自动生成.
 * 生成器版本: v<%= pkg.version %>
 * 生成器地址：<%= pkg.repository %>
 * 生成器作者: <%= pkg.author %>
 * 生成时间: <%= (new Date).toISOString().split('T')[0] %>
 * -------------------------------------------------------
 */
/*global _*/


/**
 * @module tui/<%=  appconf.appname %>
 * @author <%= (author.username||author.name||'unknow') %> <%= (author.email ? '<'+author.email+'>' : '') %>
 * @copyright TUI team.
 */

(function(global) {
    'use strict';

    // 从这里开始写您自己的JS代码

    /**
     * TUI 应用DEMO类: <%=  appconf.appname %>
     *
     * @class
     * @constructor
     * @public
     * @
     */
    function <%=  appconf.appname %>() {}

    <%=  appconf.appname %>.prototype = {

        /**
         * 初始化方法
         * @method
         * @public
         * @return {Object} 返回this对象以允许链式调用
         */
        init: function() {
            var hiMsg = '嗨！我在文件 `<%=  appconf.JS_SRC_DIR%>/<%=  appconf.appname%>.js` 里面，记得来找我哦～ ;-)';

            require(['underscore'], function(_) {
                alert(_.flatten([1,[2,[3,[4]]]]));
            });

            require(['module-1'], function(m) {
                m.log();
            });


            this.sayHi(hiMsg);
            this.jumbotronTitleAnimation().jumbotronDescriptionAnimation();

        },

        camel: function(uncamel, big) {

            if (_.isString(uncamel)) {
                uncamel = uncamel.toLowerCase().split(/[\-_ ]/g);
            }

            if (_.isArray(uncamel)) {
                return _.flatten(uncamel).map(function(word, i) {
                    if (big || i>0) {
                        return word.replace(/^\w/, word.substring(0,1).toUpperCase());
                    } else {
                        return word;
                    }
                }).join('');
            }

            return uncamel;
        },

        /**
         * 向控制台打印消息
         *
         * @method
         * @public
         * @param  {String} msg     消息内容
         * @return {Object}         返回this对象以允许链式调用
         */
        sayHi: function(msg) {
          if (global.console && typeof global.console.log === 'function') {
            global.console.log(msg);
          }

          return this;
        },

        /**
         * 设置横幅标题动画效果
         * @method
         * @public
         * @param  {Object} options 动画效果配置项
         * @return {Object}         返回this对象以允许链式调用
         */
        jumbotronTitleAnimation: function(options) {

            var conf = $.extend({}, options);
            $('.jumbotron h1').textillate({
              loop: true,
              in: {
                effect: conf.inEffect || 'fadeInRightBig',
                sync: false,
                shuffle: false,
                reverse: false,
                callback: function () {}
              },
              out: {
                effect: conf.outEffect ||'fadeOutLeftBig',
                sync: false,
                shuffle: true,
                reverse: false,
                callback: function () {}
              }
            });

            return this;
        },

        /**
         * 设置横幅中描述文字的动画效果
         * @method
         * @public
         * @param  {Object} options 动画效果配置项
         * @return {Object}         返回this对象以允许链式调用
         */
        jumbotronDescriptionAnimation: function(options) {
            var conf = $.extend({}, options);
            $('.jumbotron .lead').textillate({
              loop: true,
              in: {
                effect: conf.inEffect ||'bounceIn',
                sync: false,
                shuffle: false,
                reverse: false,
                callback: function () {}
              },
              out: {
                effect: conf.outEffect ||'bounceOut',
                sync: false,
                shuffle: false,
                reverse: false,
                callback: function () {}
              }
            });
        }
    };

    new <%= appconf.appname%>().init();

}(this));