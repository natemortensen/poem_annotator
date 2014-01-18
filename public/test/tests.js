window.selectText = function($annotatable_element, type) {
		var nodes = $annotatable_element.contents().filter(function() {
        return this.nodeType == 3;
    });
    var range = rangy.createRange();
    range.selectNode(nodes[1]);

    iframe = $(type)[0]
    var sel = rangy.getSelection(iframe);
    sel.setSingleRange(range);
};

selectAllMatched = function($annotatable_element, annotate_id) {
	return $annotatable_element.find("mark[data-annotate-id=" + annotate_id + "]")
		.add("*[data-annotate-id=" + annotate_id + "]");
};

$(document).ready(function() {

	runTests = function($annotatable_element, type) {
		module("jQuery#annotate(" + type + ")");
	  var settings = $annotatable_element.data();
	  
	  $annotatable_element.annotate({
	  	dialog: {
	  		template: "html_template"
	  	},
	  	annotation: {
	  		existing_data: [{annotate_id: 'existing_data'}]
	  	}
		});

		var annotate_ids = ['EOO2p3Kooyv3RlpM', 'xgbsbLCMOESTP3us', 'existing_data'];
		var $first_annotation = $('.annotate-annotation[data-annotate-id=' + annotate_ids[0] + ']:first')

	  test("init", function() {
	    ok(typeof(settings.annotation) == 'object', "annotation settings are present");
	    ok(typeof(settings.mark) == 'object', "mark settings are present");
	    ok(typeof(settings.article) == 'object', "article settings are present");
	    ok(typeof(settings.dialog) == 'object', "dialog settings are present");
	    equal(settings.dialog.template, 'html_template', "default settings are overwritable")
	    console.log($('.annotate-annotation').length)
	    ok($('.annotate-annotation').length == 3, "orphaned annotations are placed in specified container")
	  });

	  test("methods", function() {
	  	equal($annotatable_element.annotate('select', annotate_ids[0], 'mark').get(0).tagName.toLowerCase(), 'mark', ".annotate('select') returns the mark");
	  	equal($annotatable_element.annotate('select', annotate_ids[0], settings.annotation.tag_name).get(0).tagName.toLowerCase(), settings.annotation.tag_name, ".annotate('select') returns the annotation when a mark");
	  	equal($annotatable_element.annotate('associated', $annotatable_element.find('mark:first')).get(0).tagName.toLowerCase(), settings.annotation.tag_name, ".annotate('associated') returns an annotation when a mark is passed");
	  	equal($annotatable_element.annotate('associated', $first_annotation).get(0).tagName.toLowerCase(), 'mark', ".annotate('associated') returns a mark when an annotation is passed");

	  	$first_annotation.html('');
	  	equal($first_annotation.html(), '', "annotation element is wiped clean");
	  	equal($annotatable_element.annotate('revert', annotate_ids[0])[0], $annotatable_element[0], ".annotate('revert') returns $annotatable_element");
	  	ok($first_annotation.html() != '', ".annotate('revert') restores annotation element's content");

	  	equal($annotatable_element.annotate('remove', annotate_ids[0])[0], $annotatable_element[0], ".annotate('remove') returns $annotatable_element");
			ok(selectAllMatched($annotatable_element, annotate_ids[1]).length > 0, ".annotate('remove') only removes one annotation and its associated marks");
			equal($annotatable_element.annotate('removeall')[0], $annotatable_element[0], ".annotate('removeall') returns $annotatable_element");
			ok(selectAllMatched($annotatable_element, annotate_ids[1]).length == 0, ".annotate('removeall') removes all annotations and marks");

			selectText($annotatable_element, type);
	  	equal($annotatable_element.annotate('build')[0], $annotatable_element[0], ".annotate('build') returns $annotatable_element");
	  	ok($('.annotate-dialog').length == 1, ".annotate('build') creates a dialog element");
	  	ok($annotatable_element.find('mark.temp').length > 0, ".annotate('build') marks the article temporarily");
	  	equal($annotatable_element.annotate('cancel')[0], $annotatable_element[0], ".annotate('build') returns $annotatable_element");
	  	ok($('.annotate-dialog').length == 0, ".annotate('cancel') destroys any associated dialogs");
	  	ok($annotatable_element.find('mark.temp').length == 0, ".annotate('cancel') removes any temporary marks");
	  	$annotatable_element.annotate('destroy');
	  });
	};

	$('iframe')[0].onload = function() {
		var $normal_article = $('#article');
		var $iframe_article = $('iframe:first').contents().find('#article');
		runTests($normal_article, 'normal');
		setTimeout(function() {
			runTests($iframe_article, 'iframe');
		}, 125);
	};
});