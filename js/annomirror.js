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

    var Annotation = function(options) {
        this.id = options.id || -1;
        this.start = options.start;
        this.end = options.end;
        this.text = options.text || '';
        this.title = options.title || this.id;
        this.color = options.color || '#333';
        this.data = options.data || { };
        this.$els = options.$els || [];
        if (this.id == -1)           throw "Annotation.constructor requires an id parameter."
        if (this.start == undefined) throw "Annotation.constructor requires a start parameter.";
        if (this.end == undefined)   throw "Annotation.constructor requires a end parameter.";
    };
    Annotation.prototype.update = function(options) { 
        this.title = options.title || this.title; 
        this.color = options.color || this.color;
        this.data  = options.data  || this.data;
    };

    var Plugin = function(element, options) {
        this.$el = $(element);
        this._settings = $.extend({ }, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this._annotations = [];
        this._annoId = 1;
        this.init();
    }
    $.extend(Plugin.prototype, {
        init: function() {
            this._editor = CM.fromTextArea(this.$el.get(0), this._settings.codeMirror);
            this._gutterWidth = $(this._editor.getGutterElement()).outerWidth();
            this._charWidth = this._editor.defaultCharWidth();
        },
        // Public methods
        // ----------------------------------------
        addAnnotation: function(start, end, options) {
            if (typeof options !== 'object') options = { };
            if (start == undefined || length == undefined)
                throw 'Start and end offsets must be provided for \'addAnnotation\'.';
            if (typeof start == 'number') start = this._editor.posFromIndex(start);
            if (typeof end   == 'number') end   = this._editor.posFromIndex(end);
            var anno = new Annotation({
                id: options.id || this._annoId++,
                start: this._editor.indexFromPos(start),
                end: this._editor.indexFromPos(end),
                title: options.title,
                color: options.color,
                text: this._editor.getRange(start, end),
                data: options.data
            });
            var $els = [];
            // Single line annotation scenario
            if (start.line == end.line) {
                var widget = this._getOrCreateLineWidget(start.line, start.ch, end.ch);
                var $anno = this._displayAnnotation(anno, widget, start.ch, end.ch);
                if ($anno) $els.push($anno);
            // Multi-line annotation scenario
            } else {
                for (var i = start.line; i <= end.line; i++) {
                    var lineHandle = this._editor.getLineHandle(i);
                    if (lineHandle.text == '') continue;
                    var $anno;
                    if (i == start.line) {
                        var widget = this._getOrCreateLineWidget(i, start.ch, lineHandle.text.length);
                        $anno = this._displayAnnotation(anno, widget, start.ch, lineHandle.text.length, false, true);
                    } else if (i != start.line && i != end.line) {
                        var widget = this._getOrCreateLineWidget(i, 0, lineHandle.text.length);
                        $anno = this._displayAnnotation(anno, widget, 0, lineHandle.text.length, true, true);
                    } else {
                        var widget = this._getOrCreateLineWidget(i, 0, end.ch);
                        $anno = this._displayAnnotation(anno, widget, 0, end.ch, true, false);
                    }
                    if ($anno) $els.push($anno);
                }
            }
            anno.$els = $els;
            $.each($els, function() { this.data('annotation', anno); });
            this._annotations.push(anno);
            return anno;
        },
        editAnnotation: function(anno, options) {
            if (!anno) throw "An annotation instance must be provided to 'editAnnotation'.";
            // Update the annotation properties.
            anno.update(options);
            // Update the annotation elements
            $.each(anno.$els, function() {
                $('.text', this).text(anno.title);
                $('.indicator', this).css('backgroundColor', anno.color);
                $('.arrow', this).css('borderColor', anno.color);
            });
        },
        removeAnnotation: function(annoOrId) {
            if (!annoOrId) throw "An annotation instance or id must be provided to 'removeAnnotation'.";
            var idx;
            if (typeof annoOrId == 'number') {
                for (var i = 0; i < this._annotations.length; i++)
                    if (this._annotations[i].id === annoOrId) {
                        idx = i; break;
                    }
            } else
                idx = this._annotations.indexOf(annoOrId);
            if (idx == undefined || idx == -1)
                return false;
            var anno = this._annotations.splice(idx, 1)[0];
            $.each(anno.$els, function() { this.remove(); });
            return anno;
        },
        editor: function() { return this._editor; },
        destroy: function() { 
            this._editor.toTextArea();
            this.$el.data('plugin_' + pluginName, null);
        },
        // Private methods
        // ----------------------------------------
        _displayAnnotation: function(anno, widget, fromCh, toCh, leftArrow, rightArrow) {
            var pxPos = this._getAnnoPixelPos(widget.line.lineNo(), fromCh, toCh);
            var $anno = $([
                '<div class="annotation">',
                    '<span class="text">', anno.title, '</span>',
                    '<div class="indicator" style="background-color: ', anno.color, '"></div>',
                '</div>'
            ].join('')).css({ left: pxPos.left, width: pxPos.width });
            $(widget.node).append($anno);
            $anno.data('widget', widget);
            // Center the text if needed.
            var textWidth = $('.text', $anno).outerWidth();
            var indWidth = $anno.outerWidth();
            if (textWidth > indWidth) {
                $('.indicator', $anno).width(indWidth); 
                $anno.width(textWidth);
                $anno.css('left', '-=' + (textWidth / 2 - indWidth / 2));
            }
            // Add the multi-line arrows as needed.
            if (leftArrow === true) 
                $anno.append('<div class="arrow left" style="border-color: ' + anno.color + '"></div>');
            if (rightArrow === true) 
                $anno.append('<div class="arrow right" style="border-color: ' + anno.color + '"></div>');
            return $anno;
        },
        _getAnnoPixelPos: function(lineNo, fromCh, toCh) {
            var pos = {
                left:  this._editor.cursorCoords({ line: lineNo, ch: fromCh }).left - this._gutterWidth - this._charWidth,
                right: this._editor.cursorCoords({ line: lineNo, ch: toCh   }).left - this._gutterWidth - this._charWidth
            };
            pos.width = pos.right - pos.left;
            return pos;
        },
        _getOrCreateLineWidget: function(line, fromCh, toCh) {
            var widget = false;
            var lineHandle = this._editor.getLineHandle(line);
            var widgets = lineHandle.widgets || [];
            for (var i = 0; i < widgets.length; i++) {
                var aWidget = widgets[i];
                var didIntersect = false;
                var nodes = $('.annotation', aWidget.node);
                for (var j = 0; j < nodes.length; j++) {
                    var $label = $(nodes[j]);
                    var newPos = this._getAnnoPos(lineHandle.lineNo(), fromCh, toCh);
                    var labelPos = $label.position();
                    labelPos.width = $label.outerWidth();
                    labelPos.right = labelPos.left + labelPos.width;
                    // Checks if the "from" and "to" fall within another label.
                    var fromIntersect = labelPos.left <= newPos.left && newPos.left <= labelPos.right;
                    var toIntersect   = labelPos.left <= newPos.right && newPos.right <= labelPos.right;
                    // Checks if the new labeltation "wraps" other labels.
                    var subsetIntersect = (newPos.left <= labelPos.left && labelPos.right <= newPos.right) ||
                                        (newPos.left <= labelPos.left && labelPos.right <= newPos.right)
                    // If the "to" or "from" of the new label lies inside
                    // another label then we don't want to use this lineWidget.
                    if (fromIntersect || toIntersect || subsetIntersect) {
                        didIntersect = true; break;
                    }
                }
                if (!didIntersect) { widget = aWidget; break; }
            }
            if (!widget)
                return this._editor.addLineWidget(line, $('<div class="anno-line-widget">&nbsp;</div>').get(0), {
                    above: true,
                    insertAt: 0
                });
            return widget;
        },
        _getAnnoPos: function(line, fromCh, toCh) {
            var pos = {
                left: this._editor.cursorCoords({ line: line, ch: fromCh }).left - this._gutterWidth,
                width: this._editor.cursorCoords({ line: line, ch: toCh }).left - 
                       this._editor.cursorCoords({ line: line, ch: fromCh }).left
            };
            pos.right = pos.left + pos.width;
            return pos;
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
