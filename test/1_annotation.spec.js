jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('AnnoMirror.addAnnotation', function() {
    var $el;
    beforeEach(function() {
        loadFixtures('textarea.html');
        $el = $('textarea');
        $el.annoMirror();
    });

    it('exists', function() {
        expect(typeof $el.data('plugin_annoMirror').addAnnotation).toEqual('function');
    });
    it('throws an error if start and end aren\'t provided', function() {
        var error;
        try { $el.annoMirror('addAnnotation'); }
        catch(err) { error = err; }
        expect(error.substring(0, 38)).toEqual("Start and end offsets must be provided");
    });
    it('returns an Annotation instance', function() {
        var anno = $el.annoMirror('addAnnotation', 0, 19);
        expect(typeof anno.update).toEqual('function');
    });
    it('Annotation instance has the proper fields set', function() {
        var anno = $el.annoMirror('addAnnotation', 0, 19);
        expect(anno.id).toEqual(1);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(19);
        expect(anno.text).toEqual('CHAPTER I. Down the');
    });
    it('can create an int-based single line annotation', function() {
        var anno = $el.annoMirror('addAnnotation', 0, 19);
        expect($('.anno-line-widget').length).toEqual(1);
        expect($('.anno-line-widget .annotation').length).toEqual(1);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(19);
    });
    it('can create an int-based multi-line annotation', function() {
        var anno = $el.annoMirror('addAnnotation', 0, 60);
        expect($('.anno-line-widget').length).toEqual(2);
        expect($('.anno-line-widget .annotation').length).toEqual(2);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(60);
    });
    it('can create a pos-based single line annotation', function() {
        var anno = $el.annoMirror('addAnnotation', { line: 0, ch: 0 }, { line: 0, ch: 19 });
        expect($('.anno-line-widget').length).toEqual(1);
        expect($('.anno-line-widget .annotation').length).toEqual(1);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(19);
    });
    it('can create a pos-based multi-line annotation', function() {
        var anno = $el.annoMirror('addAnnotation', { line: 2, ch: 5 }, { line: 3, ch: 10 });
        expect($('.anno-line-widget').length).toEqual(2);
        expect($('.anno-line-widget .annotation').length).toEqual(2);
        expect(anno.start).toEqual(38);
        expect(anno.end).toEqual(113);
    });
    it('has the default title and color', function() {
        var anno = $el.annoMirror('addAnnotation', { line: 2, ch: 5 }, { line: 3, ch: 10 });
        expect($('.text', anno.$els[0]).text()).toEqual(anno.id.toString());
        expect($('.indicator', anno.$els[0]).css('backgroundColor')).toEqual('rgb(51, 51, 51)');
    });
    it('can change the title and color', function() {
        var anno = $el.annoMirror('addAnnotation', { line: 2, ch: 5 }, { line: 3, ch: 10 }, {
            title: 'TEST',
            color: '#F00'
        });
        expect($('.text', anno.$els[0]).text()).toEqual('TEST');
        expect($('.indicator', anno.$els[0]).css('backgroundColor')).toEqual('rgb(255, 0, 0)');
    });
    it('can set metadata key pairs', function() {
        var anno = $el.annoMirror('addAnnotation', 0, 19, {
            data: {
                test: true,
                abc: 'data'
            }
        });
        expect(anno.data).toEqual(jasmine.objectContaining({
            test: true,
            abc: 'data'
        }));
    });

    describe('annotation overlapping logic', function() {
        it('allows non-overlapping annotations to align vertically', function() {
            var anno1 = $el.annoMirror('addAnnotation', 47, 70);
            var anno2 = $el.annoMirror('addAnnotation', 71, 88);
            expect($('.anno-line-widget').length).toEqual(1);
            expect(anno1.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno2.$els[0].data().widget.insertAt).toEqual(0);
        });
        it('left side overlap creates a new line', function() {
            var anno1 = $el.annoMirror('addAnnotation', 43, 59);
            var anno2 = $el.annoMirror('addAnnotation', 56, 70);
            expect($('.anno-line-widget').length).toEqual(2);
            expect(anno1.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno2.$els[0].data().widget.insertAt).toEqual(1);
        });
        it('right side overlap creates a new line', function() {
            var anno1 = $el.annoMirror('addAnnotation', 56, 70);
            var anno2 = $el.annoMirror('addAnnotation', 43, 59);
            expect($('.anno-line-widget').length).toEqual(2);
            expect(anno1.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno2.$els[0].data().widget.insertAt).toEqual(1);
        });
        it('subset annotation creates a new line', function() {
            var anno1 = $el.annoMirror('addAnnotation', 56, 81);
            var anno2 = $el.annoMirror('addAnnotation', 65, 73);
            expect($('.anno-line-widget').length).toEqual(2);
            expect(anno1.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno2.$els[0].data().widget.insertAt).toEqual(1);
        });
        it('superset annotation creates a new line', function() {
            var anno1 = $el.annoMirror('addAnnotation', 43, 59);
            var anno2 = $el.annoMirror('addAnnotation', 60, 73);
            var anno3 = $el.annoMirror('addAnnotation', 39, 81);
            expect($('.anno-line-widget').length).toEqual(2);
            expect(anno1.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno2.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno3.$els[0].data().widget.insertAt).toEqual(1);
        });
        it('newer annotations prefer lower lines', function() {
            var anno1 = $el.annoMirror('addAnnotation', 39, 59);
            var anno2 = $el.annoMirror('addAnnotation', 33, 64);
            var anno3 = $el.annoMirror('addAnnotation', 65, 73);
            expect($('.anno-line-widget').length).toEqual(2);
            expect(anno1.$els[0].data().widget.insertAt).toEqual(0);
            expect(anno2.$els[0].data().widget.insertAt).toEqual(1);
            expect(anno3.$els[0].data().widget.insertAt).toEqual(0);
        });
    });
});

describe('AnnoMirror.removeAnnotation', function() {
    var $el, anno;
    beforeEach(function() {
        loadFixtures('textarea.html');
        $el = $('textarea');
        $el.annoMirror();
        anno = $el.annoMirror('addAnnotation', 0, 19);
    });

    it('exists', function() {
        expect(typeof $el.data('plugin_annoMirror').removeAnnotation).toEqual('function');
    });
    it('throws error if no annotation is specified', function() {
        var error;
        try { $el.annoMirror('removeAnnotation'); }
        catch (err) { error = err; }
        expect(error.substring(0, 22)).toEqual('An annotation instance');
    });
    it('accepts an annotation instance', function() {
        $el.annoMirror('removeAnnotation', anno);
        expect($('.annotation').length).toEqual(0);
        expect($el.data('plugin_annoMirror')._annotations.length).toEqual(0);
    });
    it('accepts an annotation id', function() {
        $el.annoMirror('removeAnnotation', anno.id);
        expect($('.annotation').length).toEqual(0);
        expect($el.data('plugin_annoMirror')._annotations.length).toEqual(0);
    });
});

describe('AnnoMirror.editAnnotation', function() {
    var $el, singleAnno, multiAnno;
    beforeEach(function() {
        loadFixtures('textarea.html');
        $el = $('textarea');
        $el.annoMirror();
        singleAnno = $el.annoMirror('addAnnotation', 0, 19);
        multiAnno = $el.annoMirror('addAnnotation', { line: 2, ch: 10 }, { line: 3, ch: 10 });
    });

    it('exists', function() {
        expect(typeof $el.data('plugin_annoMirror').editAnnotation).toEqual('function');
    });
    it('throws an error if no annotation is provided', function() {
        var error;
        try { $el.annoMirror('editAnnotation'); }
        catch (err) { error = err; }
        expect(error.substring(0, 30)).toEqual('An annotation instance must be');
    });
    it('can alter a single-line annotation\'s title and color', function() {
        $el.annoMirror('editAnnotation', singleAnno, {
            title: 'test', color: '#F00'
        });
        expect(singleAnno.title).toEqual('test');
        expect(singleAnno.color).toEqual('#F00');
        expect($('.text', singleAnno.$els[0]).text()).toEqual('test');
        expect($('.indicator', singleAnno.$els[0]).css('backgroundColor')).toEqual('rgb(255, 0, 0)');
    });
    it('can alter a multi-line annotation\'s title and color', function() {
        $el.annoMirror('editAnnotation', multiAnno, {
            title: 'test', color: '#F00'
        });
        expect(multiAnno.title).toEqual('test');
        expect(multiAnno.color).toEqual('#F00');
        expect($('.text', multiAnno.$els[1]).text()).toEqual('test');
        expect($('.indicator', multiAnno.$els[1]).css('backgroundColor')).toEqual('rgb(255, 0, 0)');
        expect($('.arrow', multiAnno.$els[1]).css('borderTopColor')).toEqual('rgb(255, 0, 0)');
    });
    it('can alter an annotation\'s data', function() {
        $el.annoMirror('editAnnotation', singleAnno, {
            data: { computer: 'blue' }
        });
        expect(singleAnno.data).toEqual(jasmine.objectContaining({ computer: 'blue' }));
    });
});

describe('Annotation anatomy', function() {
    var $el, editor, singleAnno, multiAnno;
    beforeEach(function() {
        loadFixtures('textarea.html');
        $el = $('textarea');
        $el.annoMirror();
        editor = $el.annoMirror('editor');
        singleAnno = $el.annoMirror('addAnnotation', { line: 0, ch: 0 }, { line: 0, ch: 19 });
        multiAnno = $el.annoMirror('addAnnotation', { line: 2, ch: 10 }, { line: 3, ch: 10 });
    });

    describe('single-line annotation', function() {
        it('exists', function() {
            expect(singleAnno.id).toEqual(1);
        });
        it('matches CodeMirror\'s selection', function() {
            var range = editor.getRange(editor.posFromIndex(0), editor.posFromIndex(19));
            expect(range).toEqual(singleAnno.text);
        });
        it('contains the right amount of jquery elements', function() {
            expect(singleAnno.$els.length).toEqual(1);
        });
        it('contains the proper text', function() {
            expect($('.text', singleAnno.$els[0]).text()).toEqual(singleAnno.id.toString());
        });
        it('contains the correctly sized annotation bar', function() {
            expect($('.indicator', singleAnno.$els[0]).width())
                  .toEqual(Math.floor(editor.defaultCharWidth() * singleAnno.text.length));
        });
    });
    describe('multi-line annotation', function() {
        it('exists', function() {
            expect(multiAnno.id).toEqual(2);
        });
        it('matches CodeMirror\'s selection', function() {
            range = editor.getRange({ line: 2, ch: 10 }, { line: 3, ch: 10 });
            expect(range).toEqual(multiAnno.text);
        });
        it('contains the right amount of jquery elements', function() {
            expect(multiAnno.$els.length).toEqual(2);
        });
        it('contains the proper text', function() {
            expect($('.text', multiAnno.$els[0]).text()).toEqual(multiAnno.id.toString());
        });
        it('contains the correctly sized annotation bar', function() {
            var totalWidth = 0;
            $.each(multiAnno.$els, function() { totalWidth += this.width(); });
            // Remove newlines from text
            expect(totalWidth)
                  .toEqual(Math.floor(editor.defaultCharWidth() * 
                                      multiAnno.text.replace("\n", '').length));
        });
        it('contains the arrows for line wrapping', function() {
            expect($('.right.arrow', multiAnno.$els[0]).length).toEqual(1);
            expect($('.left.arrow',  multiAnno.$els[1]).length).toEqual(1);
        });
    });
});
