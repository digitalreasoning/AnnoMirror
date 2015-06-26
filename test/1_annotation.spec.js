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
        expect(typeof anno.annotationDummyFn).toEqual('function');
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
        expect($('.anno-line-widget').length).toEqual(3);
        expect($('.anno-line-widget .annotation').length).toEqual(3);
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
