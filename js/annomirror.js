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
            lineNumbers: true,
            readOnly: true
        }
    };
    var Plugin = function(element, options) {
        this.$el = $(element);
        this._settings = $.extend({ }, defaults, options);
        this._editor = null;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    $.extend(Plugin.prototype, {
        init: function() {
            this._editor = CM.fromTextArea(this.$el.get(0), this._settings.codeMirror);
        },
        editor: function() { return this._editor; },
        destroy: function() { 
            this._editor.toTextArea();
            this.$el.data('plugin_' + pluginName, null);
        }
    });

    $.fn[pluginName] = function(methodOrOptions) {
        var els = this.each(function() {
            if (!$.data(this, "plugin_" + pluginName))
                $.data(this, "plugin_" + pluginName, new Plugin(this, methodOrOptions));
        });
        if (els.length == 1 && typeof methodOrOptions === 'string') {
            if (typeof Plugin.prototype[methodOrOptions] == 'function') {
                var data = $.data(els[0], 'plugin_' + pluginName);
                return data[methodOrOptions].apply(data, Array.prototype.slice.call(arguments, 1));
            } else
                throw "No method '" + methodOrOptions + "' available on annoMirror plugin.";
        } else if (els.length > 1 && isCallingMethod)
            throw "AnnoMirror does not support calling methods on multiple instances at once. Refine your selector to include a single element.";
        return els;
    };
}));
