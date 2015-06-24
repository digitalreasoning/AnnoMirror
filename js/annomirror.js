// Boilerplate from: https://github.com/umdjs/umd/blob/master/jqueryPlugin.js
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'codemirror'], factory);
    } else {
        // Browser globals
        factory(jQuery, CodeMirror);
    }
}(function($, CM) {
    "use strict";
    var pluginName = "annoMirror";
    var defaults = {
        codeMirror: {
            lineNumbers: true
        }
    };
    var Plugin = function(element, options) {
        this.$element = $(element);
        this.settings = $.extend({ }, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.editor = null;
        this.init();
    }
    $.extend(Plugin.prototype, {
        init: function() {
            this.editor = CM.fromTextArea(this.$element.get(0), this.settings.codeMirror);
        },
        yourOtherFunction: function() {
            // some logic
        }
    });

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };;
}));
