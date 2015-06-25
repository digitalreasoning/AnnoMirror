jasmine.getFixtures().fixturesPath = 'test/fixtures';

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
    it('create integer based single line annotation', function() {
        $el.annoMirror('addAnnotation', 0, 19);
        expect($('.anno-line-widget').length).toEqual(1);
        expect($('.anno-line-widget .annotation').length).toEqual(1);
    });
    it('create integer based multi line annotation', function() {
        $el.annoMirror('addAnnotation', 0, 60);
        expect($('.anno-line-widget').length).toEqual(3);
        expect($('.anno-line-widget .annotation').length).toEqual(3);
    });
});
