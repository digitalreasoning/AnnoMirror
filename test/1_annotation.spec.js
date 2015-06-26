jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('AnnoMirror.addAnnotation', function() {
    var $el;
    beforeEach(function() {
        loadFixtures('textarea.html');
        $el = $('textarea');
        $el.annoMirror();
    });

    it('exists', function() {
        expect(typeof $.data($el.get(0), 'plugin_annoMirror').addAnnotation).toEqual('function');
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

    it('exists', function() {
        expect(singleAnno.id).toEqual(1);
        expect(multiAnno.id).toEqual(2);
    });
    it('matches CodeMirror\'s selection', function() {
        var range = editor.getRange(editor.posFromIndex(0), editor.posFromIndex(19));
        expect(range).toEqual(singleAnno.text);
        range = editor.getRange({ line: 2, ch: 10 }, { line: 3, ch: 10 });
        expect(range).toEqual(multiAnno.text);
    });
    it('contains the proper jquery elements', function() {
        expect(singleAnno.$els.length).toEqual(1);
        expect(multiAnno.$els.length).toEqual(2);
    });
    xit('add more here');
});
