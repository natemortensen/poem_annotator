(($) ->

  # default html template for annotation dialog
  default_dialog = '<div class="errors"></div><form><label for="content">Content</label><input type="text" class="" value="" name="content" id="content"><input type="submit"> <button type="button" class="annotate-cancel">Cancel</button></form>'

  # convert form data to JSON
  serializeObject = (el, extras = {}) ->

    json = {}
    push_counters = {}
    patterns =
      validate  : /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
      key       : /[a-zA-Z0-9_]+|(?=\[\])/g,
      push      : /^$/,
      fixed     : /^\d+$/,
      named     : /^[a-zA-Z0-9_]+$/

    @build = (base, key, value) ->
      base[key] = value
      base

    @push_counter = (key) ->
      push_counters[key] = 0 if push_counters[key] is undefined
      push_counters[key]++

    arrayData = $(el).serializeArray()
    $.each arrayData, (i, elem) =>
      return unless patterns.validate.test(elem.name)

      keys = elem.name.match patterns.key
      merge = elem.value
      reverse_key = elem.name

      while (k = keys.pop()) isnt undefined

        if patterns.push.test k 
          re = new RegExp("\\[#{k}\\]$")
          reverse_key = reverse_key.replace re, ''
          merge = @build [], @push_counter(reverse_key), merge

        else if patterns.fixed.test k 
          merge = @build [], k, merge

        else if patterns.named.test k
          merge = @build {}, k, merge

      json = $.extend true, json, merge, extras

    return {annotation: json}

  getCurrentTime = ->
    currentdate = new Date()
    currentdate.toString()

  getTextLength = (annotate_id) ->
    $("mark[data-annotate-id=#{annotate_id}]").text().length

  window.getContainerIframe = (el) ->
    $('iframe').each ->
      return $(this) if $(this).contents().find(el).length > 0
    [null]

  inlineOffset = (mark) ->
    el = $("<i/>").css("display", "inline").insertBefore(mark)
    pos = el.offset()
    el.remove()
    pos

  generateAnnotateId = ->
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
    string_length = 16
    randomstring = ""
    i = 0

    while i < string_length
      rnum = Math.floor(Math.random() * chars.length)
      randomstring += chars.substring(rnum, rnum + 1)
      i++
    randomstring

  # get the annotation id from an element, or its parent(s)
  getAnnotateId = ($element, parentTag = '') ->
    $element.data('annotate-id') || $($element.parents(parentTag)[0]).data('annotate-id')

  getTopMarkId = (target) ->
    target = target
    parents = $(target).parents('mark.annotated')
    $mark = if parents[0]? then $(parents[parents.length-1]) else $(target)
    context_lengths = []
    checked_ids = [$mark.data('annotate-id')]
    hovered = [$mark[0]]
    top_mark_id = undefined

    context_lengths.push getTextLength($mark.data('annotate-id'))
    $mark.find('mark.annotated').each ->
      annotate_id = $(this).data('annotate-id')
      if $(this).is(':hover') && $.inArray checked_ids, annotate_id == -1
        context_lengths.push getTextLength(annotate_id)
        hovered.push(this)
        checked_ids.push(annotate_id)

    min_length = Math.min.apply(Math, context_lengths)

    $(hovered).each ->
      if min_length == getTextLength $(this).data('annotate-id')
        top_mark_id = $(this).data('annotate-id')
        false
    top_mark_id

  titleize = (str) ->
    fixed_str = str.replace(/([a-z])([A-Z])/g, '$1 $2')
    words = fixed_str.split(/[\s_]+/)
    array = []
    i = 0

    while i < words.length
      array.push words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1)
      ++i
    array.join " "

  hasAssociated = ($annotatable_element, $object) ->
    $annotatable_element.annotate('associated', $object)[0]?

  sendArticle = ($annotatable_element) ->
    settings = $annotatable_element.data()

    if typeof settings.article.update is "function"
      
      $annotatable_element.annotate('cancel')
      settings.article.update.apply($annotatable_element[0], [$annotatable_element.html()])
      $annotatable_element.find('mark').each ->
        $(this).removeClass('annotate-hidden') if hasAssociated $annotatable_element, $(this)

  selectedAnnotations = ($annotatable_element) ->
    $selected_marks = $annotatable_element.find('mark.annotate-selected').not('.annotate-hidden')
    $selected_annotations = $annotatable_element.annotate 'associated', $selected_marks
    [$selected_marks, $selected_annotations]

  camelizeObject = (obj = {}) ->
    new_obj = {}
    $.each obj, (key, value) ->
      fixed_key = key.replace /([\-\_][a-z])/g, ($1) ->
        $1.toUpperCase().replace /[\-\_]/, ""
      new_obj[fixed_key] = value
    new_obj

  decamelizeObject = (obj = {}) ->
    new_obj = {}
    $.each obj, (key, value) ->
      fixed_key = key.replace /([A-Z])/g, ($1) ->
        '_' + $1.toLowerCase()
      new_obj[fixed_key] = value
    new_obj

  flattenObject = (array) ->
    $(array[0]).add(array[1])

  setMarkAttributes = (attributes, $marks) ->
    html_attr = {}
    $.each attributes, (name, value) -> 
      html_attr["data-#{name.replace('_', '-')}"] = value unless name == 'annotate_editable'
    $marks.removeClass('annotate-selected').attr(html_attr)

  renderSteps = ($annotatable_element, data, action) ->
    settings = $annotatable_element.data()

    if action == 'new'
      $marks = $annotatable_element.find('mark.temp')
    else
      $marks = $annotatable_element.annotate('select', data.annotation.annotate_id, 'mark')
    setMarkAttributes(data.annotation, $marks)

    # Remove any previous annotations if valid
    $annotatable_element.annotate('associated', $marks).remove() if $.inArray(data.status, ['success', '200', 200]) > -1

    valid_annotation = settings.annotation.beforeRender.apply($annotatable_element, [data]) if typeof settings.annotation.beforeRender is "function"
    if valid_annotation? && valid_annotation && typeof(settings.annotation.render) is "function" && ($annotation = settings.annotation.render.apply $annotatable_element, [data]) instanceof jQuery
      settings.annotation.afterRender.apply($annotatable_element, [$annotation]) if typeof settings.annotation.afterRender is "function"

      annotation_attr = camelizeObject(data.annotation)
      $annotation.data(annotation_attr)
      $annotation.attr('data-annotatable-id', settings._annotatable_id)

      $marks.addClass('annotated').removeClass('temp')
      $annotatable_element.annotate('_bindEvents', $marks)
      $annotatable_element.annotate('cancel')
      sendArticle($annotatable_element) unless action == 'revert'
      true
    else
      false


  
  methods =

    init: (options) ->
      window.$annotatable_element = $(this)
      settings = $annotatable_element.data()

      # initialize rangy and a marker if not present
      unless settings.tempMarker?
        rangy.init()
        settings.tempMarker = rangy.createCssClassApplier("temp",
          normalize: true
          elementTagName: 'tempmark'
        )

      # default plugin settings
      $(this).data settings = $.extend(true,
        ignore_warnings: false                                          # Boolean, determines whether warnings will be displayed in the console log        
        _annotatable_id: generateAnnotateId()
        dialog:
          class: ''                                                     # String, additional classes for the dialog element, separated by spaces
          tag_name: 'div'                                               # String, valid tagName for dialog element
          offset_amount: 10                                             # Integer, amount of pixels between text and popup, or pixels between document width
          position: 'top'                                               # 'top' | 'bottom' | 'left' | 'right', float popup left/right, or hover above/below selected text
          build_on_select: true                                         # 'select' | 'click' | null, which type of event triggers the build_annotation callback
          template: default_dialog                                      # String, HTML template for annotation dialog, should contain a form
          beforeCreate: -> true                                         # Function(), called before dialog is rendered
          create: methods['_createDialog']                              # Function(), renders dialog into DOM, overrides default functionality. Element should be created with a form inside and should contain a data-annotatable-id retrievable from the annotatable element: 
          afterCreate: null                                             # Function($dialog), called after dialog is rendered
          beforeCancel: null                                            # Function($dialog), called before .annotate(‘cancel’)
          afterCancel: null                                             # Function(), called after .annotate(‘cancel’)
        annotation:
          class: ''
          offset_amount: 10                                             # Integer, amount of pixels between text and popup, or pixels between document width
          position: 'top'                                               # 'top' | 'bottom' | 'left' | 'right', float popup left/right, or hover above/below selected text
          tag_name: 'div'                                               # String, valid tagName for annotation
          template: null                                                # String, HTML template for annotation to be inserted into the DOM
          container: $('body')                                          # Element, where to insert rendered annotations if no callback is specified.        
          trigger_type: 'click'                                         # 'select' | 'click' | null, specifies which type of event triggers the onTrigger and offTrigger callbacks
          include_time: false                                           # Boolean, determines whether Date.toString() will be included as part of the annotation JSON object
          render_from_marks: true                                       # Boolean, determines whether annotations are also rendered from marks in the article as a fallback on init.
          existing_data: []                                             # [{annotation1}, {annotation2}], Array of annotation data in JSON format. Keys should be "camelCased"
          create: methods['_createAnnotation']                          # Function(annotation_data), called after annotation dialog form is submitted
          update: methods['_createAnnotation']
          beforeRender: -> true                                         # Function(annotation_data), called before annotation is rendered
          render: methods['_renderAnnotation']                          # Function(annotation_data), render annotation template, or error message, overrides default functionality. Called after save. Must return true if successful
          afterRender: null                                             # Function(annotation_data), called after annotation is rendered
          delete: null                                                  # Function([annotate_id1, annotate_id2, ...]), called after annotation(s) are removed
          onTrigger: methods['_defaultOnTrigger']                       # Function($marks, $annotation), called whenever the mouse enters the top-level mark (and optionally the matching annotation)
          offTrigger: methods['_defaultOffTrigger']                     # Function($marks, $annotation), called whenever the mouse leaves the top-level mark (and optionally the matching annotation)
        article:
          iframe: getContainerIframe($annotatable_element[0])           # jQuery object containing the article's parent iFrame element
          update: null                                                  # Function(article_html), called whenever a permanent mark is added or removed to the article
        mark:
          trigger_type: 'click'                                         # 'select' | 'click' | null, specifies which type of event triggers the onTrigger and offTrigger callbacks
          onTrigger: methods['_defaultOnTrigger']                       # Function($marks, $annotation), called the user enters the top-level mark, depending on the trigger 
          offTrigger: methods['_defaultOffTrigger']                     # Function($marks, $annotation), called the user enters the top-level mark, depending on the trigger 
      , options)
    
      # render existing annotations
      $marks = $('mark.annotated', this)
      rendered = []

      $.each settings.annotation.existing_data, (i, db_data) ->
        if $.inArray(db_data.annotate_id, rendered) == -1
          renderSteps($annotatable_element, {annotation: db_data, status: 'success'}, 'init')
          rendered.push db_data.annotate_id

      $marks.each ->
        if $.inArray($(this).data('annotateId'), rendered) == -1
          renderSteps($annotatable_element, {annotation: $(this).data(), status: 'success'}, 'init')
          rendered.push $(this).data('annotateId')

      # remove hidden class on mark if there is a matching annotation
      $annotatable_element.find('mark').addClass('annotate-hidden').removeClass('annotate-selected')
      $('mark.annotated', this).each ->
        $(this).removeClass('annotate-hidden') if hasAssociated $annotatable_element, $(this)

      # bind buttons that conform to naming conventions
      $('.annotate-removeall').click -> $annotatable_element.annotate('removeall')
      $('.annotate-destroy').click -> $annotatable_element.annotate('destroy')
      $('.annotate-build').click -> $annotatable_element.annotate('build')

      # display warnings unless explicitly ignored
      unless settings.ignore_warnings
        console.warn "It is highly recommended that you set a callback for updating the article" if settings.article.update is methods['_updateArticle']

    # default callback for rendering annotation dialog
    _createDialog: ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()

      $('body').append("<#{settings.dialog.tag_name} class='annotate-dialog#{' ' + settings.dialog.class}' data-annotatable-id='#{settings._annotatable_id}'>#{settings.dialog.template}</#{settings.dialog.tag_name}>")
      $dialog = $(".annotate-dialog[data-annotatable-id=#{settings._annotatable_id}]")
      $annotatable_element.annotate 'position', $dialog
      return $dialog

    # default callback for creating annotations in database
    _createAnnotation: (data) -> $.extend data, {status: 'success'}

    # default callback for rendering annotations
    _renderAnnotation: (data) ->
      $annotatable_element = $(this)
      settings = $(this).data()

      if $.inArray(data.status, ['success', '200', 200]) > -1
        annotation_attr = camelizeObject(data.annotation)
        delete annotation_attr.annotateEditable if annotation_attr.annotateEditable?

        
        annotate_id = annotation_attr['annotateId']
        $mark = $annotatable_element.find("mark[data-annotate-id=#{annotate_id}]:first")

        if settings.annotation.template?
          annotation_innerHtml = settings.annotation.template
        else
          data_html = ''

          if annotation_attr?
            $.each annotation_attr, (key, value) -> data_html += "<dt class='#{key}'>#{titleize(key)}</dt><dd class='annotate-fill-#{key}'></dd>"
            annotation_innerHtml = "<dl>#{data_html}</dl> <button type='button' class='annotate-remove'>Remove</button>"

        annotation_html = "<#{settings.annotation.tag_name} class='annotate-annotation#{' ' + settings.annotation.class}' data-annotate-editable='#{data.annotation.annotate_editable}' data-annotate-id='#{annotate_id}' data-annotatable-id='#{settings._annotatable_id}'>#{annotation_innerHtml}</#{settings.annotation.tag_name}>"
        
        if $annotatable_element.annotate('select', annotate_id, 'mark')[0]? && settings.annotation.position?
          $('body').append(annotation_html)
        else
          settings.annotation.container.append annotation_html

        $annotation = $(".annotate-annotation[data-annotate-id=#{annotate_id}]")

        $.each annotation_attr || $mark.data(), (key, value) ->
          $attr_field = $(".annotate-fill-#{key}", $annotation[0])
          $attr_field.prepend(value)
        $annotatable_element.annotate 'position', $annotation
        $annotation.find('.annotate-remove').remove() unless $annotation.data('annotate-editable') == 1
        $annotation
      else
        $(".annotate-dialog[data-annotatable-id=#{settings._annotatable_id}] .errors").html('There was an error.')
        false

    # default mouseenter callback for marks
    _defaultOnTrigger: ($marks, $annotation) ->
      settings = $(this).data()
      if $.inArray(settings.annotation.position, ['top', 'bottom']) > -1
        $annotation.show()
        if settings.mark.trigger_type == 'hover'
          $marks.add($annotation).mouseenter ->
            clearTimeout(settings._timer.id) if settings._timer? && settings._timer.annotation == $annotation.data('annotate-id')

    # default mouseleave callback for marks
    _defaultOffTrigger: ($marks, $annotation) ->
      settings = $(this).data()
      if $.inArray(settings.annotation.position, ['top', 'bottom']) > -1
        if settings.mark.trigger_type == 'hover'
          settings._timer =
            id: setTimeout (->
              $annotation.hide(250)
            ), 1000
            annotation: $annotation.data('annotate-id')
        else
          $annotation.hide(250)

    # bind hovers and actions
    _bindEvents: ($mark = null) ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()

      annotate_id = $mark.data('annotate-id')
      $marks = $annotatable_element.find("mark[data-annotate-id=#{$mark.data('annotate-id')}]")
      $annotations = $annotatable_element.annotate('associated', $marks)

      # bind marks based on trigger type
      if $marks[0]? && settings.mark.trigger_type?
        switch settings.mark.trigger_type
          when 'hover'
            $marks.each ->
              if $annotatable_element.annotate('associated', $(this))[0]?
                $(this).unbind('mouseenter mouseleave').hover((e) ->
                  annotate_id = getTopMarkId(e.currentTarget)
                  $selected_marks = $annotatable_element.annotate('select', annotate_id, 'mark')
                  if typeof settings.mark.onTrigger is "function" && $(e.currentTarget).data('annotate-id') == annotate_id
                    params = [$selected_marks, $annotatable_element.annotate('associated', $selected_marks)]
                    flattenObject(params).addClass('annotate-selected')
                    settings.mark.onTrigger.apply($annotatable_element[0], params)
                , (e) ->
                  annotate_id = $(e.currentTarget).data('annotate-id')
                  $marks = $annotatable_element.annotate('select', annotate_id, 'mark')
                  if typeof settings.mark.offTrigger is "function"
                    params = [$marks, $annotatable_element.annotate('associated', $marks)]
                    flattenObject(params).removeClass('annotate-selected')
                    settings.mark.offTrigger.apply $annotatable_element[0], params
                )
          when 'click'
            $marks.each ->
              if $annotatable_element.annotate('associated', $(this))[0]?
                $(this).unbind('click').click (e) ->                
                  annotate_id = getTopMarkId(e.currentTarget)
                  $selected_marks = $annotatable_element.annotate('select', annotate_id, 'mark')
                  if typeof settings.mark.onTrigger is "function" && $(e.currentTarget).data('annotate-id') == annotate_id
                    e.stopPropagation()
                    params = [$selected_marks, $annotatable_element.annotate('associated', $selected_marks)]
                    flattenObject(params).addClass('annotate-selected')
                    settings.mark.onTrigger.apply($annotatable_element[0], params)
      
      # bind annotations based on trigger type
      if $annotations[0]? && settings.annotation.trigger_type?
        switch settings.annotation.trigger_type
          when 'hover'
            $annotations.unbind('mouseenter mouseleave').hover((e) ->
              annotate_id = $(e.currentTarget).data('annotate-id')
              $marks = $annotatable_element.annotate('select', annotate_id, 'mark')

              if typeof settings.annotation.onTrigger is "function"
                params = [$marks, $annotatable_element.annotate('associated', $marks)]
                flattenObject(params).addClass('annotate-selected')
                settings.annotation.onTrigger.apply $annotatable_element[0], params
            , (e) ->
              annotate_id = $(e.currentTarget).data('annotate-id')
              $marks = $annotatable_element.annotate('select', annotate_id, 'mark')

              if typeof settings.annotation.offTrigger is "function"
                params = [$marks, $annotatable_element.annotate('associated', $marks)]
                flattenObject(params).removeClass('annotate-selected')
                settings.annotation.offTrigger.apply $annotatable_element[0], params
            )
          when 'click'
            $annotations.unbind('click').click (e) ->
              annotate_id = $(e.currentTarget).data('annotate-id')
              $marks = $annotatable_element.annotate('select', annotate_id, 'mark')
              if typeof settings.annotation.offTrigger is "function"
                selected = selectedAnnotations($annotatable_element)
                flattenObject(selected).removeClass('annotate-selected')
                settings.annotation.offTrigger.apply $annotatable_element[0], selected
              if typeof settings.annotation.onTrigger is "function"
                params = [$marks, $annotatable_element.annotate('associated', $marks)]
                flattenObject(params).addClass('annotate-selected')
                settings.annotation.onTrigger.apply $annotatable_element[0], [$marks, $annotatable_element.annotate('associated', $marks)]
      
      # bind annotation buttons according to naming conventions
      $annotations.find('.annotate-remove').unbind('click').click -> $annotatable_element.annotate('remove', $(this))
      $annotations.find('.annotate-revert').unbind('click').click -> $annotatable_element.annotate('revert', $(this))

      # bind annotation form submit to update action
      $annotations.find('form').unbind('submit').submit (e) ->
        settings = $annotatable_element.data()
        e.preventDefault()

        form_data = serializeObject(this, {annotate_id: $($(this).parents('.annotate-annotation')[0]).data('annotate-id')})
        response = settings.annotation.update(form_data)

        $marks = $annotatable_element.annotate('associated', $annotations)
        renderSteps($annotatable_element, response, 'update')

      # bind .annotate('build') to text-select event, if applicable
      $annotatable_element.unbind('mouseup').mouseup (e) ->
        if settings.mark.trigger_type == 'click' || settings.annotation.trigger_type == 'click'
          selected = selectedAnnotations($annotatable_element)
          $(selected[0]).add(selected[1]).removeClass('annotate-selected')
          settings.mark.offTrigger.apply $annotatable_element[0], selected

        if settings.dialog.build_on_select
          $annotatable_element.annotate('build') unless $(this).hasClass('annotate-dialog') || $(this).parents('.annotate-dialog').length > 0



    # remove annotation dialogs and placeholder marks
    cancel: ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()
      dialog = $(".annotate-dialog[data-annotatable-id=#{settings._annotatable_id}]")[0]

      settings.dialog.beforeCancel.apply $annotatable_element[0], $(dialog) if typeof settings.dialog.beforeCancel is "function"

      annotatable_id = $(this).data('_annotatable_id')
      $(".annotate-dialog[data-annotatable-id=#{annotatable_id}]").remove()
      $('mark.temp', this).contents().unwrap()

      settings.dialog.afterCancel.apply($annotatable_element[0]) if typeof settings.dialog.afterCancel is "function"

    # remove annotation and associated mark from DOM and call delete_annotations callback
    remove: ($elementOrId) ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()
      annotate_id = if typeof($elementOrId) == 'object' then getAnnotateId($elementOrId, settings.annotation.tag_name) else $elementOrId

      if typeof(settings.annotation.delete) is "function"
        deleted = settings.annotation.delete.apply(this, [[annotate_id]])
        if deleted[0]?
          $.inArray(deleted, annotate_id) > -1
          $annotatable_element.find("mark[data-annotate-id=#{annotate_id}]", this).contents().unwrap()
          $(".annotate-annotation[data-annotate-id=#{annotate_id}]").remove()
          sendArticle $(this)

    # remove all annotations and associated marks from DOM and call delete_annotations callback
    removeall: ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()
      if typeof settings.annotation.delete is "function"
        annotate_ids = []
        $(this).annotate('cancel')
        $(".annotate-annotation[data-annotatable-id=#{settings._annotatable_id}]").each ->
          annotate_id = $(this).data('annotate-id')
          annotate_ids.push annotate_id

        deleted = settings.annotation.delete.apply(this, [annotate_ids])
        $.each deleted, (i, id) ->
          $annotatable_element.find("mark[data-annotate-id=#{id}]").contents().unwrap()
          $(".annotate-annotation[data-annotate-id=#{id}]").remove()
        sendArticle $(this)

    # select elements by data-annotate-id attribute
    select: (annotate_id, elementType = '*') ->
      if elementType.toLowerCase() == 'mark'
        $(this).find("mark[data-annotate-id=#{annotate_id}]")
      else
        $("#{elementType}[data-annotate-id=#{annotate_id}]")

    # unbind all relevant events and remove annotations from DOM
    destroy: ->
      $annotatable_element = $(this)
      annotatable_id = $(this).data('_annotatable_id')
      tag_name = $(this).data('annotation').tag_name

      $annotatable_element.find('mark.annotated').unbind()
      $("#{tag_name}[data-annotatable-id=#{annotatable_id}]").remove()
      $annotatable_element.annotate('associated', $('mark.annotated', this)).remove()
      $annotatable_element.unbind('mouseup').removeData()

    # re-render an annotation to undo an update
    revert: ($elementOrId) ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()
      annotate_id = if typeof($elementOrId) == 'object' then getAnnotateId($elementOrId, settings.annotation.tag_name) else $elementOrId

      $annotation = $annotatable_element.annotate('select', annotate_id, settings.annotation.tag_name)
      $marks = $annotatable_element.annotate('select', annotate_id, 'mark').removeClass('annotate-selected')

      response =
        annotation: decamelizeObject($annotation.data())
        status: 'success'

      $annotation.remove()
      renderSteps($annotatable_element, response, 'revert')


    # select other elements by the same data-annotate-id attribute, with different tagNames
    associated: ($elements) ->
      annotate_ids = []
      annotations = []
      marks = []

      $elements.each ->
        annotate_id = getAnnotateId $(this)

        if $.inArray(annotate_id, annotate_ids) == -1
          annotate_ids.push(annotate_id)

          if $(this).prop("tagName") == 'MARK'
            $("*[data-annotate-id=#{annotate_id}]").not('mark').each -> annotations.push(this)
          else
            $("mark[data-annotate-id=#{annotate_id}]").each -> marks.push(this)

      returned_elements = marks.concat(annotations).filter (val) -> val?
      $(returned_elements)

    # position a popup according to positioning options
    position: ($el, params = {}) ->
      settings = $(this).data()
      popup_type = if $el.hasClass('annotate-annotation') then settings.annotation else settings.dialog

      options = $.extend(
        offset_amount: popup_type.offset_amount
        direction: popup_type.position
        annotate_id: $el.data('annotate-id')
      , params)

      $el.css {display: 'none'} if $el.hasClass('annotate-annotation') && $.inArray(options.direction, ['top', 'bottom']) > -1
      popup_placement = if options.direction == 'bottom' then 'last' else 'first'

      scope = "mark[data-annotate-id=#{options.annotate_id}]:#{popup_placement}"
      mark = if options.annotate_id? then $("mark[data-annotate-id=#{options.annotate_id}]:#{popup_placement}", this)[0] else $("mark.temp:#{popup_placement}", this)[0]
        
      console.log $el.height()
      if mark?
        mark_left = inlineOffset(mark).left
        mark_top = $(mark).offset().top

        if settings.article.iframe.length > 0
          mark_left += settings.article.iframe.offset().left
          mark_top += settings.article.iframe.offset().top

        switch options.direction
          when 'left'
            $el.css
              left: options.offset_amount
              top: mark_top
          when 'right'
            $el.css
              right: options.offset_amount
              top: mark_top
          when 'top'
            $el.css
              left: $(mark).width()/2 + mark_left
              top: mark_top - options.offset_amount - $el.height()
          when 'bottom'
            $el.css
              left: $(mark).width()/2 + mark_left
              top: $(mark).height() + mark_top + options.offset_amount
      else
        $el.css
          position: 'static'
          display: 'block'

    # render annotation dialog, bind form, render annotation and update article if successful
    build: ->
      $annotatable_element = $(this)
      settings = $annotatable_element.data()

      # get selected text
      sel = rangy.getSelection(settings.article.iframe[0])
      if sel.rangeCount > 0 && (window.selected_text = sel.toString()) != ''
        range = sel.getRangeAt(0)
        parentElement = range.commonAncestorContainer
        parentElement = parentElement.parentNode if parentElement.nodeType is 3 && parentElement.parentNode?

        # remove existing annotation dialogs
        $(this).annotate('cancel')
        
        # mark selected text and deselect
        settings.tempMarker.applyToSelection(settings.article.iframe[0])
        sel.removeAllRanges() unless settings.dialog.build_on_select

        # replace tempmark with mark.temp to avoid issues with overlapping marks generated by rangy
        $annotatable_element.find('tempmark').wrap('<mark class="temp"></mark>')
        $annotatable_element.find('mark.temp tempmark').contents().unwrap()

        # render annotation dialog and callbacks
        before_result = settings.dialog.beforeCreate.apply($annotatable_element[0])
        if typeof settings.dialog.beforeCreate is "function" && before_result != false
          $dialog = settings.dialog.create.apply($annotatable_element[0]) if typeof settings.dialog.create is "function"

          $dialog.attr('data-annotatable-id', settings._annotatable_id).find(':input:first').focus()
          $dialog.find('.annotate-cancel').click -> $annotatable_element.annotate('cancel')
          settings.dialog.afterCreate.apply $annotatable_element[0], [$dialog] if typeof settings.dialog.afterCreate is "function"
          $dialog.keyup (e) -> $annotatable_element.annotate('cancel') if e.keyCode is 27

          # bind annotation dialog form
          $('.annotate-dialog form').submit (e) ->
            e.preventDefault()
            extras =
              annotate_id: generateAnnotateId()
              annotate_context: selected_text
              annotate_time: getCurrentTime()
            delete extras.annotate_time unless settings.annotation.include_time

            form_data = serializeObject(this, extras)
            response = settings.annotation.create(form_data)
            $marks = $annotatable_element.find('mark.temp')

            renderSteps($annotatable_element, response, 'new')

        else $annotatable_element.annotate('cancel')
      else $annotatable_element.annotate('cancel')

  $.fn.annotate = (methodOrOptions) ->
    try
      # if a method is called, apply; othwerwise, instantiate jQuery.annotate on the element
      if methods[methodOrOptions]
        if $(this).data()?.ignore_warnings?
          result = methods[methodOrOptions].apply this, Array::slice.call(arguments, 1)
          return result if $.inArray(methodOrOptions, ['associated', 'select']) > -1
        else
          $.error "jQuery.annotate has not been instantiated on this element"
      else if typeof methodOrOptions is "object" or not methodOrOptions
        methods.init.apply this, arguments
      else
        $.error "Method '#{methodOrOptions}' does not exist on jQuery.annotate"
      $(this)
    catch e
      console.log e.stack
) jQuery