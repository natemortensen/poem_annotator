# jQuery.annotate

jQuery.annotate is a jQuery plugin that makes annotating selections of text a breeze.

## Useful links

- For an example, please [click here](https://poemannotator.herokuapp.com).

## Requirements

- jQuery > 1.9
- rangy
- rangy cssClassApplier module

## Usage

Place the jquery.annotate.js in your javascript directory.
Place the jquery.annotate.css in your stylesheets directory.

Initialize jQuery.annotate on the area to be annotated

```javascript
$(article).annotate(options);
```

**Note: This element is assumed to include only the article and all changes to this area will be saved.**

Build: Mark text and render the dialog to allow user to enter annotation contents:

```javascript
$(article).annotate('build');
```

Cancel: Remove the dialog and temporary marks from the DOM

```javascript
$(article).annotate('cancel');
```

Select: Select marks and/or annotations by annotate_id. tag_name is optional

```javascript
$(article).annotate('select', annotate_id, tag_name);
```

Associated: When a mark is passed, select associated annotation and vice versa

```javascript
$(article).annotate('associated', $mark);
```

Remove: Remove annotation and associated mark from DOM by either passing a mark/annotation jQuery object or the annotate_id. Calls annotation.delete() to permanently destroy record

```javascript
$(article).annotate('remove', $mark);
```

Removeall: Remove all marks and associated annotations from DOM and call annotation.delete()

```javascript
$(article).annotate('removeall');
```

Destroy: Unbind all events, hide marks, and remove annotations from the DOM (however, they will remain in the database)

```javascript
$(article).annotate('destroy');
```

Position: Position an annotation or dialog in relation to its associated mark.

```javascript
$(article).annotate('destroy');
```