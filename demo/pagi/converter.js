$(document).ready(function() {
    var doc = AnnoMirror.fromTextArea($('textarea').get(0));
    doc.editor().setSize(null, $(window).height() - 20);
    var xmlDoc;
    $.ajax({
        url: 'alice.xml',
        dataType: 'xml',
        success: function(data, status) { xmlDoc = data; convert(); }
    });

    var nodesArr = [];
    var nodeTypesHash = { };
    var convert = function() {
        var start = Date.now(); cnt = 0;
        var nodes = xmlDoc.getElementsByTagName('node');
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var type = node.getAttribute('type').toLowerCase();
            var typeHash = nodeTypesHash[type] || { };
            var nodeHash = { edges: [], features: { } };
            var strPropNodes = node.getElementsByTagName('strProp');
            for (var j = 0; j < strPropNodes.length; j++) 
               nodeHash[strPropNodes[j].getAttribute('k')] = strPropNodes[j].getAttribute('v').toString();

            var intPropNodes = node.getElementsByTagName('intProp');
            for (var j = 0; j < intPropNodes.length; j++) 
               nodeHash[intPropNodes[j].getAttribute('k')] = parseInt(intPropNodes[j].getAttribute('v'));

            var floatPropNodes = node.getElementsByTagName('floatProp');
            for (var j = 0; j < floatPropNodes.length; j++) 
               nodeHash[floatPropNodes[j].getAttribute('k')] = parseFloat(floatPropNodes[j].getAttribute('v'));

            var boolPropNodes = node.getElementsByTagName('boolProp');
            for (var j = 0; j < boolPropNodes.length; j++) 
               nodeHash[boolPropNodes[j].getAttribute('k')] = boolPropNodes[j].getAttribute('v').toString() === 'true' ? true : false;

            var edges = node.getElementsByTagName('edge');
            for (var j = 0; j < edges.length; j++) {
                var edge = edges[j];
                nodeHash.edges.push({
                    type: edge.getAttribute('type'),
                    toType: edge.getAttribute('toType').toLowerCase(),
                    to: edge.getAttribute('to')
                });
            }
            typeHash[node.getAttribute('id')] = nodeHash;
            nodeTypesHash[type] = typeHash;
            nodesArr.push(nodeHash);
            cnt++;
        }
        // Loop over the nodes and link edges.
        for (var i = 0; i < nodesArr.length; i++) {
            var node = nodesArr[i];
            for (var j = 0; j < node.edges.length; j++) {
                var edge = node.edges[j];
                edge.ref = nodeTypesHash[edge.toType][edge.to];
            }
        }
        console.log("Mapped " + cnt + " nodes and took " + ((Date.now() - start) / 1000) + " seconds.");
        console.log(nodeTypesHash);

        var $actions = $('.actions');
        for (var type in nodeTypesHash) {
            var $btn = $('<button type="button">' + type + '</button>');
            $btn.get(0).dataset.type = type;
            $btn.data('type', type);
            $btn.css('background-color', '#'+Math.floor(Math.random()*16777215).toString(16));
            $btn.click(function() {
                removeAnnotations();
                // User has clicked a button to display a certain type of annotation. 
                var nodesHash = nodeTypesHash[this.dataset.type], startTime = Date.now(), cnt = 0;
                for (var id in nodesHash) {
                    var node = nodesHash[id];
                    var start = getNodeIdx(node, 'first');
                    var end = getNodeIdx(node, 'last');
                    if (typeof start !== 'number' || typeof end !== 'number') continue;
                    var title = id;
                    if (this.dataset.type === 't'   || 
                        this.dataset.type === 'p'   || 
                        this.dataset.type === 'ner' ||
                        this.dataset.type === 'extractor') title = node.value;
                    else if (this.dataset.type === 'aclause') title = node.type;
                    doc.addAnnotation(start, end, { 
                        title: title, 
                        color: $(this).css('background-color') 
                    });
                    cnt++;
                }
                console.log('Displayed ' + cnt + '/' + Object.keys(nodesHash).length + ' annotations in ' + ((Date.now() - startTime) / 1000) + ' seconds.');
            });
            $actions.append($btn);
        }
        doc.editor().setSize(null, $(window).height() - 30 - $('.actions').height());
        console.log('Current viewport: ', doc.editor().getViewport());
    };
    var getNodeIdx = function(node, prop) {
        var nodes = node.edges || [];
        for (var i = 0; i < nodes.length; i++) {
            var edge = nodes[i];
            if (edge.type == 'next' || edge.type == 'prev') continue;
            if (edge.type == prop || edge.type == 'tokEdge' || edge.type == 'pEdge')
                return getNodeIdx(edge.ref, prop);
        }
        // Leaf node return the start or (start + length) offset.
        if (prop == 'first') return node.start;
        if (prop == 'last') return node.start + node.length;
    };
    var removeAnnotations = function() {
        var annos = doc.getAnnotations();
        for (var i = 0; i < annos.length; i++)
            doc.removeAnnotation(annos[i].id);
    };
});
