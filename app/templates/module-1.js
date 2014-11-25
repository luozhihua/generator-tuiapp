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
/*global define*/


/**
 * @module tui/<%=  appconf.appname %>
 * @author <%= (author.username||author.name||'unknow') %> <%= (author.email ? '<'+author.email+'>' : '') %>
 * @copyright TUI team.
 */

define([
    'jquery',
    'underscore',
    'async'
], function($, _, async) {

    'use strict';

    var methods = _.flatten(['a', ['b']]);

    $.each(methods, function(i, nm) {
        $.fn[nm] = function() {
            console.log(nm);
        };
    });

    return {
        log: function() {
            $.each(methods, function(i, nm) {
                $()[nm]();
            });
        }
    };

});