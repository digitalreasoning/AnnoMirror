jasmine.getFixtures().fixturesPath = 'test/fixtures';

describe('Functional tests', function() {
    describe('Annotation anatomy', function() {
        var $el, anno;
        beforeEach(function() {
            loadFixtures('textarea.html');
            $el = $('textarea');
            $el.annoMirror();
            anno = $el.annoMirror('addAnnotation', { line: 0, ch: 0 }, { line: 0, ch: 19 });
        });

        it('exists', function() {
            expect($('.anno-line-widget').length).toEqual(1);
            expect($('.anno-line-widget .annotation').length).toEqual(1);
        });
        it('matches CodeMirror\'s selection', function() {
            var editor = $el.annoMirror('editor');
            var range = editor.getRange(editor.posFromIndex(0), editor.posFromIndex(19));
            expect(range).toEqual(anno.text);
        });
    });
});
