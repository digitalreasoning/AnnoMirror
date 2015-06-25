jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('Unit tests', function() {
    describe('AnnoMirror.constructor', function() {
        var $el;
        beforeEach(function() {
            loadFixtures('textarea.html');
            $el = $('textarea');
            $el.annoMirror();
        });

        it('exists', function() {
            expect($el.annoMirror).toEqual($.fn.annoMirror);
        });
        it('creates a CodeMirror HTML instance', function() {
            expect($('div.CodeMirror')).toExist();
        });
        it('catch an error when calling a non-existant method', function() {
            // Without options
            var error;
            try { $el.annoMirror('thisDoesNotExistWOOptions'); }
            catch (err) { error = err; }
            expect(error).toMatch('thisDoesNotExistWOOptions');
            // With options
            try { $el.annoMirror('thisDoesNotExistWOptions', "blah", [], { test: 1 }); }
            catch (err) { error = err; }
            expect(error).toMatch('thisDoesNotExistWOptions');
        });
        it('can add random options', function() {
            loadFixtures('textarea.html');
            $el = $('textarea');
            $el.annoMirror({
                thisIsNotATrueOption: true
            });
            expect($.data($el.get(0), 'plugin_annoMirror')._settings).toEqual(jasmine.objectContaining({
                thisIsNotATrueOption: true
            }));
        });
        it('can alter the CodeMirror defaults', function() {
            loadFixtures('textarea.html');
            $el = $('textarea');
            $el.annoMirror({
                codeMirror: {
                    lineNumbers: false
                }
            });
            expect($('.CodeMirror-gutter-wrapper').length).toBe(0);
        });
    });

    describe('AnnoMirror.editor', function() {
        var $el;
        beforeEach(function() {
            loadFixtures('textarea.html');
            $el = $('textarea');
            $el.annoMirror();
        });

        it('exists', function() {
            expect(typeof $.data($el.get(0), 'plugin_annoMirror').editor).toEqual('function');
        });
        it('returns a CodeMirror editor instance', function() {
            expect($el.annoMirror('editor')).toBeDefined();
            expect(typeof $el.annoMirror('editor').unlinkDoc).toBe('function');
        });
    });

    describe('AnnoMirror.destroy', function() {
        var $el;
        beforeEach(function() {
            loadFixtures('textarea.html');
            $el = $('textarea');
            $el.annoMirror();
        });

        it('exists', function() {
            expect(typeof $.data($el.get(0), 'plugin_annoMirror').destroy).toEqual('function');
        });
        it('removes the AnnoMirror instance', function() {
            $el.annoMirror('destroy');
            expect($('.CodeMirror').length).toBe(0);
            expect($.data($el[0], 'plugin_annoMirror')).toEqual(null);
        });
    });

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
        it('can access metadata key pairs', function() {
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
});
