jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('AnnoMirror.constructor', function() {
    var $el;
    beforeEach(function() {
        loadFixtures('textarea.html');
        $el = $('textarea');
        $el.annoMirror();
    });

    it('is a jquery plugin', function() {
        expect($el.annoMirror).toEqual($.fn.annoMirror);
    });
    it('creates a CodeMirror HTML instance', function() {
        expect($('div.CodeMirror')).toExist();
    });
    it('catch an error when calling a non-existant method', function() {
        // Without options
        try { $el.annoMirror('thisDoesNotExistWOOptions'); }
        catch (err) { expect(err).toMatch('thisDoesNotExistWOOptions'); }
        // With options
        try { $el.annoMirror('thisDoesNotExistWOptions', "blah", [], { test: 1 }); }
        catch (err) { expect(err).toMatch('thisDoesNotExistWOptions'); }
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

    it('removes the AnnoMirror instance', function() {
        $el.annoMirror('destroy');
        expect($('.CodeMirror').length).toBe(0);
        expect($.data($el[0], 'plugin_annoMirror')).toEqual(null);
    });
});