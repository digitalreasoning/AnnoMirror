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
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    $.extend(Plugin.prototype, {
        init: function() {
            this._editor = CM.fromTextArea(this.$el.get(0), this._settings.codeMirror);
            this._doc = this._editor.getDoc();
            this._gutterWidth = $(this._editor.getGutterElement()).outerWidth();
            this._charWidth = this._editor.defaultCharWidth();
        },
        // Public methods
        // ----------------------------------------
        addAnnotation: function(start, end, options) {
            if (start == undefined || length == undefined)
                throw 'Start and end offsets must be provided for \'addAnnotation\'.';
            if (typeof start == 'number') start = this._editor.posFromIndex(start);
            if (typeof end   == 'number') end   = this._editor.posFromIndex(end);
            // Single line annotation scenario
            if (start.line == end.line) {
                var widget = this._createLineWidget(start.line);
                this._createAnnotation(widget, start.ch, end.ch, { });
            // Multi-line annotation scenario
            } else {
                for (var i = start.line; i <= end.line; i++) {
                    var widget = this._createLineWidget(i);
                    if (i == start.line) {
                        this._createAnnotation(widget, start.ch, widget.line.text.length, { });
                    } else if (i != start.line && i != end.line) {
                        this._createAnnotation(widget, 0, widget.line.text.length, { });
                    } else {
                        this._createAnnotation(widget, 0, end.ch, { });
                    }
                }
            }
        },
        editor: function() { return this._editor; },
        destroy: function() { 
            this._editor.toTextArea();
            this.$el.data('plugin_' + pluginName, null);
        },
        // Private methods
        // ----------------------------------------
        _createAnnotation: function(widget, fromCh, toCh, options) {
            var pxPos = this._getAnnoPixelPos(widget.line.lineNo(), fromCh, toCh);
            var $anno = $([
                '<div class="annotation">',
                    '<span class="text">ABCD</span>',
                    '<div class="indicator" style="background-color: #333"></div>',
                '</div>'
            ].join('')).css({ left: pxPos.left, width: pxPos.width });
            $(widget.node).append($anno);
            // Center the text if needed.
            var textWidth = $('.text', $anno).outerWidth();
            var indWidth = $anno.outerWidth();
            if (textWidth > indWidth) {
                $('.indicator', $anno).width(indWidth); 
                $anno.width(textWidth);
                $anno.css('left', '-=' + (textWidth / 2 - indWidth / 2));
            }
        },
        _getAnnoPixelPos: function(lineNo, fromCh, toCh) {
            var pos = {
                left:  this._editor.cursorCoords({ line: lineNo, ch: fromCh }).left - this._gutterWidth,
                right: this._editor.cursorCoords({ line: lineNo, ch: toCh   }).left - this._gutterWidth
            };
            pos.width = pos.right - pos.left;
            return pos;
        },
        _createLineWidget: function(line) {
            return this._editor.addLineWidget(line, $('<div class="anno-line-widget">&nbsp;</div>').get(0), {
                above: true,
                insertAt: 0
            });
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
