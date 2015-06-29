jasmine.getFixtures().fixturesPath = 'test/fixtures';
jasmine.getStyleFixtures().fixturesPath = './';

var loadTextareaFixture = function() {
    loadFixtures('textarea.html');
    loadStyleFixtures('bower_components/codemirror/lib/codemirror.css', 
                      'css/annomirror.css');
    return AnnoMirror.fromTextArea($('textarea').get(0));
};

describe('Doc.addAnnotation', function() {
    var doc, editor;
    beforeEach(function() { 
        doc = loadTextareaFixture(); 
        editor = doc.editor();
    });

    it('exists', function() {
        expect(typeof doc.addAnnotation).toEqual('function');
    });
    it('throws an error if start and end aren\'t provided', function() {
        var error;
        try { doc.addAnnotation(); }
        catch(err) { error = err; }
        expect(error.substring(0, 38)).toEqual("Start and end offsets must be provided");
    });
    it('returns an Annotation instance', function() {
        var anno = doc.addAnnotation(0, 19);
        expect(typeof anno.update).toEqual('function');
    });
    it('Annotation instance has the proper fields set', function() {
        var anno = doc.addAnnotation(0, 19);
        expect(anno.id).toEqual(1);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(19);
        expect(anno.text).toEqual('CHAPTER I. Down the');
    });
    it('can create an int-based single line annotation', function() {
        var anno = doc.addAnnotation(0, 19);
        expect($('.anno-line-widget').length).toEqual(1);
        expect($('.anno-line-widget .annotation').length).toEqual(1);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(19);
    });
    it('can create an int-based multi-line annotation', function() {
        var anno = doc.addAnnotation(0, 60);
        expect($('.anno-line-widget').length).toEqual(2);
        expect($('.anno-line-widget .annotation').length).toEqual(2);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(60);
    });
    it('can create a pos-based single line annotation', function() {
        var anno = doc.addAnnotation({ line: 0, ch: 0 }, { line: 0, ch: 19 });
        expect($('.anno-line-widget').length).toEqual(1);
        expect($('.anno-line-widget .annotation').length).toEqual(1);
        expect(anno.start).toEqual(0);
        expect(anno.end).toEqual(19);
    });
    it('can create a pos-based multi-line annotation', function() {
        var anno = doc.addAnnotation({ line: 2, ch: 5 }, { line: 3, ch: 10 });
        expect($('.anno-line-widget').length).toEqual(2);
        expect($('.anno-line-widget .annotation').length).toEqual(2);
        expect(anno.start).toEqual(38);
        expect(anno.end).toEqual(113);
    });
    it('has the default title and color', function() {
        var anno = doc.addAnnotation({ line: 2, ch: 5 }, { line: 3, ch: 10 });
        expect($('.text', anno.nodes[0]).text()).toEqual(anno.id.toString());
        expect($('.indicator', anno.nodes[0]).css('backgroundColor')).toEqual('rgb(51, 51, 51)');
    });
    it('can change the title and color', function() {
        var anno = doc.addAnnotation({ line: 2, ch: 5 }, { line: 3, ch: 10 }, {
            title: 'TEST',
            color: '#F00'
        });
        expect($('.text', anno.nodes[0]).text()).toEqual('TEST');
        expect($('.indicator', anno.nodes[0]).css('backgroundColor')).toEqual('rgb(255, 0, 0)');
    });
    it('can set metadata key pairs', function() {
        var anno = doc.addAnnotation(0, 19, {
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

    describe('interweave logic', function() {
        var lineHandle2;
        beforeEach(function() {
            lineHandle2 = editor.getLineHandle(2);
        });

        it('allows non-overlapping annotations to align vertically (left-side)', function() {
            var anno1 = doc.addAnnotation(58, 59);
            var anno2 = doc.addAnnotation(57, 58);
            expect(lineHandle2.widgets.length).toEqual(1);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(0);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('allows non-overlapping annotations to align vertically (right-side)', function() {
            var anno1 = doc.addAnnotation(58, 59);
            var anno2 = doc.addAnnotation(59, 60);
            expect(lineHandle2.widgets.length).toEqual(1);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(0);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('forces exact matching annotations to go on a new line', function() {
            var anno1 = doc.addAnnotation(43, 59);
            var anno2 = doc.addAnnotation(43, 59);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('left side overlap creates a new line', function() {
            var anno1 = doc.addAnnotation(43, 59);
            var anno2 = doc.addAnnotation(56, 70);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('right side overlap creates a new line', function() {
            var anno1 = doc.addAnnotation(56, 70);
            var anno2 = doc.addAnnotation(43, 59);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('subset annotation creates a new line', function() {
            var anno1 = doc.addAnnotation(56, 81);
            var anno2 = doc.addAnnotation(65, 73);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('superset annotation creates a new line', function() {
            var anno1 = doc.addAnnotation(43, 59);
            var anno2 = doc.addAnnotation(60, 73);
            var anno3 = doc.addAnnotation(39, 81);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno3.nodes[0].data.widget)).toBe(0);
        });
        it('newer annotations prefer lower lines', function() {
            var anno1 = doc.addAnnotation(39, 59);
            var anno2 = doc.addAnnotation(33, 64);
            var anno3 = doc.addAnnotation(65, 73);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
            expect(lineHandle2.widgets.indexOf(anno3.nodes[0].data.widget)).toBe(1);
        });
        it('subset multi-line annotations don\'t use the same line widget', function() {
            var anno1 = doc.addAnnotation(85, 107);
            var anno2 = doc.addAnnotation(82, 108);
            var lineHandle3 = editor.getLineHandle(3);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle3.widgets.length).toEqual(2);

            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);

            expect(lineHandle3.widgets.indexOf(anno1.nodes[1].data.widget)).toBe(1);
            expect(lineHandle3.widgets.indexOf(anno2.nodes[1].data.widget)).toBe(0);
        });
        it('text extension (in front)', function() {
            var anno1 = doc.addAnnotation(43, 45);
            var anno2 = doc.addAnnotation(45, 47, { title: 'ABCD' });
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
        it('text extension (in rear)', function() {
            var anno1 = doc.addAnnotation(43, 45, { title: 'TEST' });
            var anno2 = doc.addAnnotation(45, 47);
            expect(lineHandle2.widgets.length).toEqual(2);
            expect(lineHandle2.widgets.indexOf(anno1.nodes[0].data.widget)).toBe(1);
            expect(lineHandle2.widgets.indexOf(anno2.nodes[0].data.widget)).toBe(0);
        });
    });
});

describe('Doc.removeAnnotation', function() {
    var doc, anno;
    beforeEach(function() { 
        doc = loadTextareaFixture(); 
        anno = doc.addAnnotation(0, 19);
    });

    it('exists', function() {
        expect(typeof doc.removeAnnotation).toEqual('function');
    });
    it('throws error if no annotation is specified', function() {
        var error;
        try { doc.removeAnnotation(); }
        catch (err) { error = err; }
        expect(error.substring(0, 22)).toEqual('An annotation instance');
    });
    it('accepts an annotation instance', function() {
        doc.removeAnnotation(anno);
        expect($('.annotation').length).toEqual(0);
        expect(doc._annotations.length).toEqual(0);
    });
    it('accepts an annotation id', function() {
        doc.removeAnnotation(anno.id);
        expect($('.annotation').length).toEqual(0);
        expect(doc._annotations.length).toEqual(0);
    });
});

describe('Doc.getAnnotations', function() {
    var doc;
    beforeEach(function() {
        doc = loadTextareaFixture();
    });

    it('exists', function() {
        expect(typeof doc.getAnnotations).toEqual('function');
    });
    it('returns an empty array if there are no annotations', function() {
        expect(doc.getAnnotations()).toEqual([]);
    });
    it('returns annotations', function() {
        var anno1 = doc.addAnnotation(39, 59);
        var annos = doc.getAnnotations();
        expect(annos.length).toEqual(1);
        var anno2 = doc.addAnnotation(33, 64);
        var anno3 = doc.addAnnotation(65, 73);
        annos = doc.getAnnotations();
        expect(annos.length).toEqual(3);
    });
    it('returns the proper values for an annotation', function() {
        var anno1 = doc.addAnnotation(39, 59, {
            title: 'testing',
            color: '#345678',
            data: { test: true }
        });
        var annos = doc.getAnnotations();
        expect(annos[0]).toEqual(jasmine.objectContaining({
            id: 1, 
            start: 39,
            end: 59,
            color: '#345678',
            title: 'testing',
            text: 'was beginning to get',
            data: { test: true }
        }));
    });
    it('manipulating the array won\'t affect the real annotations', function() {
        var anno1 = doc.addAnnotation(39, 59);
        var anno2 = doc.addAnnotation(33, 64);
        var anno3 = doc.addAnnotation(65, 73);
        var annos = doc.getAnnotations();
        annos[0].title = 'i should not be able to change this';
        annos.pop();
        annos.pop();
        var newAnnos = doc.getAnnotations();
        expect(newAnnos[0].title).toEqual(newAnnos[0].id);
        expect(newAnnos.length).toEqual(3);
    });
    it('returns the proper amount after removing annotations', function() {
        var anno1 = doc.addAnnotation(39, 59);
        var annos = doc.getAnnotations();
        expect(annos.length).toEqual(1);
        var anno2 = doc.addAnnotation(33, 64);
        var anno3 = doc.addAnnotation(65, 73);
        doc.removeAnnotation(anno3);
        var annos = doc.getAnnotations();
        expect(annos.length).toEqual(2);
    });
});

describe('Doc.editAnnotation', function() {
    var doc, singleAnno, multiAnno;
    beforeEach(function() { 
        doc = loadTextareaFixture(); 
        singleAnno = doc.addAnnotation(0, 19);
        multiAnno = doc.addAnnotation({ line: 2, ch: 10 }, { line: 3, ch: 10 });
    });

    it('exists', function() {
        expect(typeof doc.editAnnotation).toEqual('function');
    });
    it('throws an error if no annotation is provided', function() {
        var error;
        try { doc.editAnnotation(); }
        catch (err) { error = err; }
        expect(error.substring(0, 30)).toEqual('An annotation instance must be');
    });
    it('can alter a single-line annotation\'s title and color', function() {
        doc.editAnnotation(singleAnno, {
            title: 'test', color: '#F00'
        });
        expect(singleAnno.title).toEqual('test');
        expect(singleAnno.color).toEqual('#F00');
        expect($('.text', singleAnno.nodes[0]).text()).toEqual('test');
        expect($('.indicator', singleAnno.nodes[0]).css('backgroundColor')).toEqual('rgb(255, 0, 0)');
    });
    it('can alter a multi-line annotation\'s title and color', function() {
        doc.editAnnotation(multiAnno, {
            title: 'test', color: '#F00'
        });
        expect(multiAnno.title).toEqual('test');
        expect(multiAnno.color).toEqual('#F00');
        expect($('.text', multiAnno.nodes[1]).text()).toEqual('test');
        expect($('.indicator', multiAnno.nodes[1]).css('backgroundColor'))
              .toEqual('rgb(255, 0, 0)');
        expect($('.arrow', multiAnno.nodes[1]).css('borderLeftColor'))
              .toEqual('rgb(255, 0, 0)');
    });
    it('can alter an annotation\'s data', function() {
        doc.editAnnotation(singleAnno, {
            data: { computer: 'blue' }
        });
        expect(singleAnno.data).toEqual(jasmine.objectContaining({ computer: 'blue' }));
    });
});

describe('Annotation anatomy', function() {
    var doc, editor, singleAnno, multiAnno;
    beforeEach(function() { 
        doc = loadTextareaFixture(); 
        editor = doc.editor();
        singleAnno = doc.addAnnotation({ line: 0, ch: 0 }, { line: 0, ch: 19 });
        multiAnno =  doc.addAnnotation({ line: 2, ch: 10 }, { line: 3, ch: 10 });
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
            expect(singleAnno.nodes.length).toEqual(1);
        });
        it('contains the proper text', function() {
            expect($('.text', singleAnno.nodes[0]).text()).toEqual(singleAnno.id.toString());
        });
        it('contains the correctly sized annotation bar', function() {
            expect($('.indicator', singleAnno.nodes[0]).width())
                  .toEqual(Math.floor(editor.defaultCharWidth() * singleAnno.text.length));
        });
        it('marks text when hovered', function() {
            var e = document.createEvent("HTMLEvents");
            e.initEvent("mouseover", true, true);
            singleAnno.nodes[0].dispatchEvent(e);
            expect(editor.getAllMarks().length).toEqual(1);
            e = document.createEvent("HTMLEvents");
            e.initEvent("mouseout", true, true);
            singleAnno.nodes[0].dispatchEvent(e);
            expect(editor.getAllMarks().length).toEqual(0);
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
            expect(multiAnno.nodes.length).toEqual(2);
        });
        it('contains the proper text', function() {
            expect($('.text', multiAnno.nodes[0]).text()).toEqual(multiAnno.id.toString());
        });
        it('contains the correctly sized annotation bar', function() {
            var totalWidth = 0;
            $.each(multiAnno.nodes, function() { totalWidth += this.offsetWidth; });
            // Remove newlines from text
            expect(totalWidth)
                  .toEqual(Math.floor(editor.defaultCharWidth() * 
                                      multiAnno.text.replace("\n", '').length));
        });
        it('contains the arrows for line wrapping', function() {
            expect($('.right.arrow', multiAnno.nodes[0]).length).toEqual(1);
            expect($('.left.arrow',  multiAnno.nodes[1]).length).toEqual(1);
        });
        it('marks text when hovered', function() {
            var e = document.createEvent("HTMLEvents");
            e.initEvent("mouseover", true, true);
            multiAnno.nodes[1].dispatchEvent(e);
            expect(editor.getAllMarks().length).toEqual(1);
            e = document.createEvent("HTMLEvents");
            e.initEvent("mouseout", true, true);
            multiAnno.nodes[1].dispatchEvent(e);
            expect(editor.getAllMarks().length).toEqual(0);
        });
    });
});
