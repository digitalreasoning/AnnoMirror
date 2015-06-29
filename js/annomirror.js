;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['codemirror'], factory); // AMD
    } else {
        window.AnnoMirror = factory(CodeMirror); // Browser
    }
}(function(CM) {
    "use strict";
    var copyObj = function(obj, target, overwrite) {
        if (!target) target = { };
        for (var prop in obj)
            if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
                target[prop] = obj[prop];
        return target;
    };
    var Annotation = function(options) {
        this.id = options.id || -1;
        this.start = options.start;
        this.end = options.end;
        this.text = options.text || '';
        this.title = options.title || this.id;
        this.color = options.color || '#333';
        this.data = options.data || { };
        this.nodes = options.nodes || [];
        if (this.id == -1)           throw "Annotation.constructor requires an id parameter."
        if (this.start == undefined) throw "Annotation.constructor requires a start parameter.";
        if (this.end == undefined)   throw "Annotation.constructor requires an end parameter.";
    };
    Annotation.prototype.update = function(options) { 
        this.title = options.title || this.title; 
        this.color = options.color || this.color;
        this.data  = options.data  || this.data;
    };
    Annotation.prototype.toHash = function() {
        return {
            id: this.id,
            start: this.start,
            end: this.end,
            color: this.color,
            title: this.title,
            text: this.text,
            data: copyObj({ }, this.data)
        };
    };

    var defaults = {
        codeMirror: {
            lineNumbers: true,
            readOnly: true
        }
    };
    var Doc = function(node, options) {
        this.node = node;
        this._settings = copyObj(defaults, options, false);
        this._defaults = defaults;
        this._annotations = [];
        this._annoId = 1;
        this._init();
    };
    // Public methods
    // ----------------------------------------
    Doc.prototype.addAnnotation = function(start, end, options) {
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
        var nodes = [];
        // Single line annotation scenario
        if (start.line == end.line) {
            var widget = this._getOrCreateLineWidget(start.line, start.ch, end.ch);
            var annoNode = this._displayAnnotation(anno, widget, start.ch, end.ch);
            if (annoNode) nodes.push(annoNode);
        // Multi-line annotation scenario
        } else {
            for (var i = start.line; i <= end.line; i++) {
                var lineHandle = this._editor.getLineHandle(i);
                if (lineHandle.text == '') continue;
                var annoNode;
                if (i == start.line) {
                    var widget = this._getOrCreateLineWidget(i, start.ch, lineHandle.text.length);
                    annoNode = this._displayAnnotation(anno, widget, start.ch, lineHandle.text.length, false, true);
                } else if (i != start.line && i != end.line) {
                    var widget = this._getOrCreateLineWidget(i, 0, lineHandle.text.length);
                    annoNode = this._displayAnnotation(anno, widget, 0, lineHandle.text.length, true, true);
                } else {
                    var widget = this._getOrCreateLineWidget(i, 0, end.ch);
                    annoNode = this._displayAnnotation(anno, widget, 0, end.ch, true, false);
                }
                if (annoNode) nodes.push(annoNode);
            }
        }
        anno.nodes = nodes;
        this._eventsOnAnno(anno);
        for (var i = 0; i < nodes.length; i++) 
            nodes[i].dataset['anno-id'] = anno;
        this._annotations.push(anno);
        return anno;
    };
    Doc.prototype.getAnnotations = function() {
        var annos = [];
        for (var i = 0; i < this._annotations; i++) 
            annos.push(this._annotations[i].toHash());
        return annos;
    };
    Doc.prototype.editAnnotation = function(anno, options) {
        if (!anno) throw "An annotation instance must be provided to 'editAnnotation'.";
        // Update the annotation properties.
        anno.update(options);
        // Update the annotation elements
        for (var i = 0; i < anno.nodes.length; i++) {
            var node = anno.nodes[i];
            node.getElementsByClassName("text")[0].innerHTML = anno.title;
            node.getElementsByClassName("indicator")[0].style['background-color'] = anno.color;
            node.getElementsByClassName("arrow")[0].style['border-color'] = anno.color;
        }
    };
    Doc.prototype.removeAnnotation = function(annoOrId) {
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
        for (var i = 0; i < anno.nodes.length; i++)
            anno.nodes[i].parentNode.removeChild(anno.nodes[i]);
        return anno;
    };
    Doc.prototype.editor = function() { return this._editor; };
    Doc.prototype.destroy = function() { 
        this._editor.toTextArea();
    };
    // Private methods
    // ----------------------------------------
    Doc.prototype._init = function() {
        this._editor = CM.fromTextArea(this.node, this._settings.codeMirror);
        this._gutterWidth = this._editor.getGutterElement().offsetWidth;
        this._charWidth = this._editor.defaultCharWidth();
    };
    Doc.prototype._displayAnnotation = function(anno, widget, fromCh, toCh, leftArrow, rightArrow) {
        var pxPos = this._getAnnoPos(widget.line.lineNo(), fromCh, toCh);
        var annoNode = document.createElement('div');
        annoNode.className = 'annotation';
        annoNode.style.left = pxPos.left + 'px';
        annoNode.style.width = pxPos.width + 'px';
        annoNode.innerHTML = [
            '<span class="text">', anno.title, '</span>',
            '<div class="indicator" style="background-color: ', anno.color, '"></div>'
        ].join('');
        widget.node.appendChild(annoNode);
        annoNode.dataset.widget = widget;
        annoNode.dataset.fromCh = fromCh;
        annoNode.dataset.toCh = toCh;
        // Center the text if needed.
        var textWidth = annoNode.getElementsByClassName('text')[0].offsetWidth;
        var indWidth = annoNode.offsetWidth;
        if (textWidth > indWidth) {
            annoNode.getElementsByClassName('indicator')[0].style.width = indWidth;
            annoNode.style.width = textWidth;
            annoNode.style.left -= textWidth / 2 - indWidth / 2;
        }
        // Add the multi-line arrows as needed.
        if (leftArrow || rightArrow) {
            var arrowDiv = document.createElement('div');
            arrowDiv.className = 'arrow';
            arrowDiv.style['border-color'] = anno.color;
            if (leftArrow)  arrowDiv.className += ' left';
            if (rightArrow) arrowDiv.className += ' right';
            annoNode.getElementsByClassName('indicator')[0].appendChild(arrowDiv);
        }
        return annoNode;
    };
    Doc.prototype._getOrCreateLineWidget = function(line, fromCh, toCh) {
        var widget = false;
        var lineHandle = this._editor.getLineHandle(line);
        var widgets = lineHandle.widgets || [];
        for (var i = widgets.length - 1; i >= 0; i--) {
            var aWidget = widgets[i];
            var didIntersect = false;
            var nodes = aWidget.node.getElementsByClassName('annotation');
            for (var j = 0; j < nodes.length; j++) {
                var labelNode = nodes[j];
                var newPos = this._getAnnoPos(lineHandle.lineNo(), fromCh, toCh);
                // Checks if the "from" and "to" fall within another label.
                var exactMatch = labelNode.dataset.fromCh === fromCh && 
                                 labelNode.dataset.toCh === toCh;
                var fromIntersect = parseInt(labelNode.offsetLeft) < parseInt(newPos.left) && 
                                    parseInt(newPos.left) < parseInt(labelNode.offsetRight);
                var toIntersect   = parseInt(labelNode.offsetLeft) < parseInt(newPos.right) && 
                                    parseInt(newPos.right) < parseInt(labelNode.offsetRight);
                // Checks if the new labeltation "wraps" other labels.
                var subsetIntersect = (parseInt(newPos.left) < parseInt(labelNode.offsetLeft) && 
                                        parseInt(labelNode.offsetRight) < parseInt(newPos.right)) ||
                                        (parseInt(newPos.left) < parseInt(labelNode.offsetLeft) && 
                                        parseInt(labelNode.offsetRight) < parseInt(newPos.right))
                // If the "to" or "from" of the new label lies inside
                // another label then we don't want to use this lineWidget.
                if (exactMatch || fromIntersect || toIntersect || subsetIntersect) {
                    didIntersect = true; break;
                }
            }
            if (!didIntersect) { widget = aWidget; break; }
        }
        if (!widget) {
            var lineNode = document.createElement('div');
            lineNode.className = 'anno-line-widget';
            return this._editor.addLineWidget(line, lineNode, {
                above: true,
                insertAt: 0
            });
        }
        return widget;
    };
    Doc.prototype._getAnnoPos = function(line, fromCh, toCh) {
        var gutterCharWidth = this._gutterWidth + this._charWidth;
        var pos = {
            left:  this._editor.cursorCoords({ line: line, ch: fromCh }).left - gutterCharWidth,
            right: this._editor.cursorCoords({ line: line, ch: toCh   }).left - gutterCharWidth
        };
        pos.width = pos.right - pos.left;
        return pos;
    };
    Doc.prototype._eventsOnAnno = function(anno) {
        for (var i = 0; i < anno.nodes.length; i++) {
            anno.nodes[i].addEventListener('mouseover', function() {
                mark = this._editor.markText(this._editor.posFromIndex(anno.start), 
                                             this._editor.posFromIndex(anno.end),
                                             { className: 'anno-mark-text' }); 
            });
            anno.nodes[i].addEventListener('mouseout', function() {
                if (mark) mark.clear();
            });
        }
    };
    return {
        fromTextArea: function(node, options) {
            return new Doc(node, options);
        }
    };
}));
