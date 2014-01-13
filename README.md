# jQuery.annotate

jQuery.annotate is a jQuery plugin that makes annotating selections of text a breeze.

## Examples

- [Poem Annotator](https://poemannotator.herokuapp.com)

## Requirements

- [jQuery](http://www.jquery.com/) > 1.9
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
    "class": "",
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
    "class": "",
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
    "delete": deleteAnnotation,
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

### Methods

**Build:** Mark text and render the dialog to allow user to enter annotation contents:

```javascript
$(article).annotate('build');
```

**Cancel:** Remove the dialog and temporary marks from the DOM

```javascript
$(article).annotate('cancel');
```

**Select:** Select marks and/or annotations by annotate_id. *tag_name* is optional

```javascript
tag_name = 'mark'
$(article).annotate('select', annotate_id, tag_name);
```

**Associated:** When a mark is passed, select associated annotation and vice versa

```javascript
$annotation = $(article).annotate('associated', $mark);
$marks = $(article).annotate('associated', $annotation);
```

**Remove:** Remove annotation and associated mark from DOM by either passing a mark/annotation jQuery object or the annotate_id. Calls annotation.delete() to permanently destroy record

```javascript
$mark = $('mark:first')
$(article).annotate('remove', $mark);

annotate_id = $mark.data('annotate-id');
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

**Position:** Position an annotation or dialog in relation to its associated mark. *settings* are optional.

```javascript
$annotation = $('.annotate-annotation:first');
settings = {
  offset_amount: 10,
  direction: 'bottom'
};

$(article).annotate('position', $annotation, settings);
```

**Revert:** Re-render an annotation (to cancel editing) by either passing a mark/annotation jQuery object or the annotate_id

```javascript
$mark = $('mark:first');
$(article).annotate('revert', $mark);

annotate_id = $mark.data('annotate-id');
$(article).annotate('revert', annotate_id);
```

## Options

### Global

#### ignore_warnings

Type: `Boolean`  
Default: `false`

Determines whether warnings will be displayed in the console 

### Dialog Object

#### Attributes

##### class

Type: `String`  
Default: `''`

Classes for the dialog element (in addition to *.annotate-dialog*), separated by spaces

##### tag_name

Type: `String`  
Default: `'div'`

Specifies which type of tag the dialog template will be wrapped in

##### offset_amount

Type: `Integer`  
Default: `10`

Amount of pixels between text and dialog, or pixels between document edge and dialog depending on the *position* attribute

##### position

Type: `String` 
Options: `'top', 'bottom', 'left', 'right', null`  
Default: `'top'`

float popup left/right, or hover above/below selected text

##### build_on_select

Type: `Boolean`  
Default: `true`

Specifies whether .annnotate('build') is triggered when using the mouse to select text exclusively within the annotatable element

##### template

Type: `String`

innerHTML template for annotation dialog, should contain a *\<form\>* element

#### Callbacks

##### beforeCreate

Arguments: `none`  

Called before dialog is rendered. Also acts as validation. If *false* is returned, then *annotation.create()* will not be called

##### create

Arguments: `none`

Render dialog into DOM, overrides default functionality. Element should have a class of *.annotate-dialog* and contain a *\<form\>* element

##### afterCreate

Arguments: `$dialog`

Called after dialog is rendered

##### beforeCancel

Arguments: `$dialog`

Called before `.annotate('cancel')`

##### afterCancel

Arguments: `none`

Called after `.annotate('cancel')`

#### Annotation Object

#### Attributes

##### class

Type: `String`  
Default: `''`

Classes for the annotation element (in addition to *.annotate-annotation*), separated by spaces

##### tag_name

Type: `String`  
Default: `'div'`

Specifies which type of tag the annotation template will be wrapped in

##### offset_amount

Type: `Integer`  
Default: `10`

Amount of pixels between text and annotation, or pixels between document edge and annotation depending on the *position* attribute

##### position

Type: `String` 
Options: `'top', 'bottom', 'left', 'right', null`  
Default: `'top'`

float popup left/right, or hover above/below selected text

##### template

Type: `String`

innerHTML template for annotation, should contain a *\<form\>* element

##### container

Type: `jQuery object`  
Default: `$('body')`

Where to insert rendered annotations when *annotation.position* is `null`. Orphaned annotations will always be placed here

##### trigger_type

Type: `String`
Options: `'hover', 'click', null`  
Default: `hover`

Specifies which type of event triggers the onTrigger and offTrigger callbacks for annotation elements

##### include_time 

Type: `Boolean`
Default: `false`

Determines whether Date.toString() will be included as part of the annotation JSON object

##### render_from_marks 

Type: `Boolean`
Default: `true`

Determines whether annotations are also rendered from marks in the article as a fallback on initialization

##### existing_data

Type: `Array`
Default: `[]`
Example:
```javascript
[
  {
    annotate_id: "yIqrHKpUTTP7A3Qk",
    annotate_context: "In the morning",
    content: "First annotation",
    annotate_editable: 1,
    user: "js_dev"
  }, {
    annotate_id: "JPsQMk2buw8xuyPA",
    annotate_context: "I want to photograph",
    content: "Second annotation",
    annotate_editable: 1,
    user: "js_dev"
  }
]
```

Array of annotation data in JSON format

#### Callbacks

##### create

Arguments: `{ annotation: { annotate_id: "aX5D3as45xrj44" } }`

Send AJAX request to post annotation to database. Must return JSON object with status == “success” or 200 if successful. Example: 

```javascript
{
  annotation: {
    annotate_id: "aX5D3as45xrj44",
    annotate_context: "Part of the article.",
    content: "This is an annotation.",
    user: "js_dev"
  },
  status: "success"
}
```

##### update

Arguments: `{ annotation: { annotate_id: "aX5D3as45xrj44" } }`

Send AJAX request to update annotation record in database. Must return JSON object with *status* equal to `"success"` or `200` if successful.  
Example: 

```javascript
{
  annotation: {
    annotate_id: "aX5D3as45xrj44",
    annotate_context: "Part of the article.",
    content: "This is an annotation.",
    user: "js_dev"
  },
  status: "success"
}
```

##### beforeRender

Arguments: `{ annotation: { annotate_id: "aX5D3as45xrj44" } }`

Called before `annotation.render()`

##### render

Arguments: `{ annotation: { annotate_id: "aX5D3as45xrj44" } }`

Render annotation template, or error message (depending on status), overrides default functionality. *Must return a jQuery object containing the annotation DOM element, otherwise the process will halt.*

##### afterRender

Arguments: `$annotation`

Called after `annotation.render()`

##### delete

Arguments: `[first_annotate_id, second_annotate_id]`

Send AJAX request to remove annotation(s) from database. Called from `.annotate(‘remove’)` and `.annotate(‘removeall’)`

##### onTrigger

Arguments: `$marks, $annotation`

Called when user enters an annotation, depending on the trigger

##### offTrigger

Arguments: `$marks, $annotation`

Called when user exits an annotation, depending on the trigger

### Article Object

#### Callbacks

##### update

Arguments: `article_html` (String)

Send AJAX request to update article in database after the element is removed from DOM.

### Mark Object

#### Attributes

##### trigger_type

Type: `String`
Options: `'hover', 'click', null`  
Default: `hover`

Specifies which type of event triggers the onTrigger and offTrigger callbacks for mark elements

#### Callbacks

##### onTrigger

Arguments: `$marks, $annotation`

Called when user enters a mark, depending on the trigger

##### offTrigger

Arguments: `$marks, $annotation`

Called when user exits a mark, depending on the trigger