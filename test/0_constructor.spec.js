jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('AnnoMirror.fromTextArea', function() {
    var node;
    beforeEach(function() {
        loadFixtures('textarea.html');
        node = $('textarea').get(0);
    });

    it('exists', function() {
        expect(window.AnnoMirror).toBeDefined();
    });
    it('creates a CodeMirror HTML instance', function() {
        var doc = AnnoMirror.fromTextArea(node);
        expect($('div.CodeMirror')).toExist();
    });
    it('returns a proper Doc instance', function() {
        var doc = AnnoMirror.fromTextArea(node);
        expect(typeof doc.addAnnotation).toEqual('function');
        expect(typeof doc.editAnnotation).toEqual('function');
        expect(typeof doc.removeAnnotation).toEqual('function');
    });
    it('can add random options', function() {
        var doc = AnnoMirror.fromTextArea(node, {
            thisIsNotATrueOption: true
        });
        expect(doc._settings).toEqual(jasmine.objectContaining({
            thisIsNotATrueOption: true
        }));
    });
    it('can alter the CodeMirror defaults', function() {
        var doc = AnnoMirror.fromTextArea(node, {
            codeMirror: {
                lineNumbers: false
            }
        });
        expect($('.CodeMirror-gutter-wrapper').length).toBe(0);
    });
});

describe('Doc.editor', function() {
    var node, doc;
    beforeEach(function() {
        loadFixtures('textarea.html');
        node = $('textarea').get(0);
        doc = AnnoMirror.fromTextArea(node);
    });

    it('exists', function() {
        expect(typeof doc.editor).toEqual('function');
    });
    it('returns a CodeMirror editor instance', function() {
        expect(doc.editor()).toBeDefined();
        expect(typeof doc.editor().unlinkDoc).toBe('function');
    });
});

describe('Doc.destroy', function() {
    var node, doc;
    beforeEach(function() {
        loadFixtures('textarea.html');
        node = $('textarea').get(0);
        doc = AnnoMirror.fromTextArea(node);
    });

    it('exists', function() {
        expect(typeof doc.destroy).toEqual('function');
    });
    it('removes the AnnoMirror instance', function() {
        doc.destroy();
        expect($('.CodeMirror').length).toBe(0);
    });
});
