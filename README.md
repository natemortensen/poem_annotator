# jQuery.annotate

jQuery.annotate is a jQuery plugin that makes annotating selections of text a breeze.

## Examples

- [Poem Annotator](https://poemannotator.herokuapp.com).

## Requirements

- jQuery > 1.9
- [rangy](https://code.google.com/p/rangy/)
- [rangy cssClassApplier module](https://code.google.com/p/rangy/wiki/CSSClassApplierModule)

## Usage

Place the jquery.annotate.js in your javascript directory.
Place the jquery.annotate.css in your stylesheets directory.

Initialize jQuery.annotate on the area to be annotated

```javascript
options = {
  ignore_warnings: false,
  dialog: {
    class: "",
    tag_name: "div",
    offset_amount: 10,
    position: "top",
    build_on_select: true,
    template: dialog_html_string,
    beforeCreate: beforeCreateDialog,
    create: createDialog,
    afterCreate: afterCreateDialog,
    beforeCancel: beforeCancelDialog,
    afterCancel: afterCancelDialog
  },
  annotation: {
    class: "",
    offset_amount: 10,
    position: "top",
    tag_name: "div",
    template: annotation_html_string,
    container: $("body"),
    create: createAnnotation,
    update: updateAnnotation,
    beforeRender: beforeRenderAnnotation,
    render: renderAnnotation,
    afterRender: afterRenderAnnotation,
    delete: deleteAnnotation,
    trigger_type: "click",
    onTrigger: displayAnnotation,
    offTrigger: hideAnnotation,
    existing_data: getAnnotations,
    include_time: false,
    render_from_marks: true
  },
  article: {
    update: updateArticle
  },
  mark: {
    trigger_type: "click",
    onTrigger: highlightMark,
    offTrigger: unhighlightMark
  }
};

$(article).annotate(options);
```

**Note: This element is assumed to include only the article and all changes to this area will be saved.**

**Build:** Mark text and render the dialog to allow user to enter annotation contents:

```javascript
$(article).annotate('build');
```

**Cancel:** Remove the dialog and temporary marks from the DOM

```javascript
$(article).annotate('cancel');
```

**Select:** Select marks and/or annotations by annotate_id. tag_name is optional

```javascript
tag_name = 'mark'
$(article).annotate('select', annotate_id, tag_name);
```

**Associated:** When a mark is passed, select associated annotation and vice versa

```javascript
$(article).annotate('associated', $mark);
```

**Remove:** Remove annotation and associated mark from DOM by either passing a mark/annotation jQuery object or the annotate_id. Calls annotation.delete() to permanently destroy record

```javascript
$mark = $('mark:first')
$(article).annotate('remove', $mark);

annotate_id = $mark.data('annotate-id')
$(article).annotate('remove', annotate_id);
```

**Removeall:** Remove all marks and associated annotations from DOM and call annotation.delete()

```javascript
$(article).annotate('removeall');
```

**Destroy:** Unbind all events, hide marks, and remove annotations from the DOM (however, they will remain in the database)

```javascript
$(article).annotate('destroy');
```

**Position:** Position an annotation or dialog in relation to its associated mark.

```javascript
$(article).annotate(‘position’, $el, settings);
```

**Revert:** Re-render an annotation (to cancel editing) by either passing a mark/annotation jQuery object or the annotate_id

```javascript
$mark = $('mark:first');
$(article).annotate('revert', $mark);

annotate_id = $mark.data('annotate-id');
$(article).annotate('revert', annotate_id);
```