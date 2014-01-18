
(function($) {
  var camelizeObject, decamelizeObject, default_dialog, flattenObject, generateAnnotateId, getAnnotateId, getCurrentTime, getTextLength, getTopMarkId, hasAssociated, inlineOffset, methods, renderSteps, selectedAnnotations, sendArticle, serializeObject, setMarkAttributes, titleize;
  default_dialog = '<div class="errors"></div><form><label for="content">Content</label><input type="text" class="" value="" name="content" id="content"><input type="submit"> <button type="button" class="annotate-cancel">Cancel</button></form>';
  serializeObject = function(el, extras) {
    var arrayData, json, patterns, push_counters,
      _this = this;
    if (extras == null) {
      extras = {};
    }
    json = {};
    push_counters = {};
    patterns = {
      validate: /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
      key: /[a-zA-Z0-9_]+|(?=\[\])/g,
      push: /^$/,
      fixed: /^\d+$/,
      named: /^[a-zA-Z0-9_]+$/
    };
    this.build = function(base, key, value) {
      base[key] = value;
      return base;
    };
    this.push_counter = function(key) {
      if (push_counters[key] === void 0) {
        push_counters[key] = 0;
      }
      return push_counters[key]++;
    };
    arrayData = $(el).serializeArray();
    $.each(arrayData, function(i, elem) {
      var k, keys, merge, re, reverse_key;
      if (!patterns.validate.test(elem.name)) {
        return;
      }
      keys = elem.name.match(patterns.key);
      merge = elem.value;
      reverse_key = elem.name;
      while ((k = keys.pop()) !== void 0) {
        if (patterns.push.test(k)) {
          re = new RegExp("\\[" + k + "\\]$");
          reverse_key = reverse_key.replace(re, '');
          merge = _this.build([], _this.push_counter(reverse_key), merge);
        } else if (patterns.fixed.test(k)) {
          merge = _this.build([], k, merge);
        } else if (patterns.named.test(k)) {
          merge = _this.build({}, k, merge);
        }
      }
      return json = $.extend(true, json, merge, extras);
    });
    return {
      annotation: json
    };
  };
  getCurrentTime = function() {
    var currentdate;
    currentdate = new Date();
    return currentdate.toString();
  };
  getTextLength = function(annotate_id) {
    return $("mark[data-annotate-id=" + annotate_id + "]").text().length;
  };
  window.getContainerIframe = function(el) {
    var matched_iframe;
    matched_iframe = [null];
    $('iframe').each(function() {
      if ($(this).contents().find(el).length > 0) {
        matched_iframe = $(this);
        return false;
      }
    });
    return matched_iframe;
  };
  inlineOffset = function(mark) {
    var el, pos;
    el = $("<i/>").css("display", "inline").insertBefore(mark);
    pos = el.offset();
    el.remove();
    return pos;
  };
  generateAnnotateId = function() {
    var chars, i, randomstring, rnum, string_length;
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    string_length = 16;
    randomstring = "";
    i = 0;
    while (i < string_length) {
      rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
      i++;
    }
    return randomstring;
  };
  getAnnotateId = function($element, parentTag) {
    if (parentTag == null) {
      parentTag = '';
    }
    return $element.data('annotate-id') || $($element.parents(parentTag)[0]).data('annotate-id');
  };
  getTopMarkId = function(target) {
    var $mark, checked_ids, context_lengths, hovered, min_length, parents, top_mark_id;
    target = target;
    parents = $(target).parents('mark.annotated');
    $mark = parents[0] != null ? $(parents[parents.length - 1]) : $(target);
    context_lengths = [];
    checked_ids = [$mark.data('annotate-id')];
    hovered = [$mark[0]];
    top_mark_id = void 0;
    context_lengths.push(getTextLength($mark.data('annotate-id')));
    $mark.find('mark.annotated').each(function() {
      var annotate_id;
      annotate_id = $(this).data('annotate-id');
      if ($(this).is(':hover') && $.inArray(checked_ids, annotate_id === -1)) {
        context_lengths.push(getTextLength(annotate_id));
        hovered.push(this);
        return checked_ids.push(annotate_id);
      }
    });
    min_length = Math.min.apply(Math, context_lengths);
    $(hovered).each(function() {
      if (min_length === getTextLength($(this).data('annotate-id'))) {
        top_mark_id = $(this).data('annotate-id');
        return false;
      }
    });
    return top_mark_id;
  };
  titleize = function(str) {
    var array, fixed_str, i, words;
    fixed_str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    words = fixed_str.split(/[\s_]+/);
    array = [];
    i = 0;
    while (i < words.length) {
      array.push(words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1));
      ++i;
    }
    return array.join(" ");
  };
  hasAssociated = function($annotatable_element, $object) {
    return $annotatable_element.annotate('associated', $object)[0] != null;
  };
  sendArticle = function($annotatable_element) {
    var settings;
    settings = $annotatable_element.data();
    if (typeof settings.article.update === "function") {
      $annotatable_element.annotate('cancel');
      settings.article.update.apply($annotatable_element[0], [$annotatable_element.html()]);
      return $annotatable_element.find('mark').each(function() {
        if (hasAssociated($annotatable_element, $(this))) {
          return $(this).removeClass('annotate-hidden');
        }
      });
    }
  };
  selectedAnnotations = function($annotatable_element) {
    var $selected_annotations, $selected_marks;
    $selected_marks = $annotatable_element.find('mark.annotate-selected').not('.annotate-hidden');
    $selected_annotations = $annotatable_element.annotate('associated', $selected_marks);
    return [$selected_marks, $selected_annotations];
  };
  camelizeObject = function(obj) {
    var new_obj;
    if (obj == null) {
      obj = {};
    }
    new_obj = {};
    $.each(obj, function(key, value) {
      var fixed_key;
      fixed_key = key.replace(/([\-\_][a-z])/g, function($1) {
        return $1.toUpperCase().replace(/[\-\_]/, "");
      });
      return new_obj[fixed_key] = value;
    });
    return new_obj;
  };
  decamelizeObject = function(obj) {
    var new_obj;
    if (obj == null) {
      obj = {};
    }
    new_obj = {};
    $.each(obj, function(key, value) {
      var fixed_key;
      fixed_key = key.replace(/([A-Z])/g, function($1) {
        return '_' + $1.toLowerCase();
      });
      return new_obj[fixed_key] = value;
    });
    return new_obj;
  };
  flattenObject = function(array) {
    return $(array[0]).add(array[1]);
  };
  setMarkAttributes = function(attributes, $marks) {
    var html_attr;
    html_attr = {};
    $.each(attributes, function(name, value) {
      if (name !== 'annotate_editable') {
        return html_attr["data-" + (name.replace('_', '-'))] = value;
      }
    });
    return $marks.removeClass('annotate-selected').attr(html_attr);
  };
  renderSteps = function($annotatable_element, data, action) {
    var $annotation, $marks, annotation_attr, settings, valid_annotation;
    settings = $annotatable_element.data();
    if (action === 'new') {
      $marks = $annotatable_element.find('mark.temp');
    } else {
      $marks = $annotatable_element.annotate('select', data.annotation.annotate_id, 'mark');
    }
    setMarkAttributes(data.annotation, $marks);
    if ($.inArray(data.status, ['success', '200', 200]) > -1) {
      $annotatable_element.annotate('associated', $marks).remove();
    }
    if (typeof settings.annotation.beforeRender === "function") {
      valid_annotation = settings.annotation.beforeRender.apply($annotatable_element, [data]);
    }
    if ((valid_annotation != null) && valid_annotation && typeof settings.annotation.render === "function" && ($annotation = settings.annotation.render.apply($annotatable_element, [data])) instanceof jQuery) {
      if (typeof settings.annotation.afterRender === "function") {
        settings.annotation.afterRender.apply($annotatable_element, [$annotation]);
      }
      annotation_attr = camelizeObject(data.annotation);
      $annotation.data(annotation_attr);
      $annotation.attr('data-annotatable-id', settings._annotatable_id);
      $marks.addClass('annotated').removeClass('temp');
      $annotatable_element.annotate('_bindEvents', $marks);
      $annotatable_element.annotate('cancel');
      if (action !== 'revert') {
        sendArticle($annotatable_element);
      }
      return true;
    } else {
      return false;
    }
  };
  methods = {
    init: function(options) {
      var $marks, rendered, settings;
      window.$annotatable_element = $(this);
      settings = $annotatable_element.data();
      if (settings.tempMarker == null) {
        rangy.init();
        settings.tempMarker = rangy.createCssClassApplier("temp", {
          normalize: true,
          elementTagName: 'tempmark'
        });
      }
      $(this).data(settings = $.extend(true, {
        ignore_warnings: false,
        _annotatable_id: generateAnnotateId(),
        dialog: {
          "class": '',
          tag_name: 'div',
          offset_amount: 10,
          position: 'top',
          build_on_select: true,
          template: default_dialog,
          beforeCreate: function() {
            return true;
          },
          create: methods['_createDialog'],
          afterCreate: null,
          beforeCancel: null,
          afterCancel: null
        },
        annotation: {
          "class": '',
          offset_amount: 10,
          position: 'top',
          tag_name: 'div',
          template: null,
          container: $('body'),
          trigger_type: 'click',
          include_time: false,
          render_from_marks: true,
          existing_data: [],
          create: methods['_createAnnotation'],
          update: methods['_createAnnotation'],
          beforeRender: function() {
            return true;
          },
          render: methods['_renderAnnotation'],
          afterRender: null,
          "delete": methods['_deleteAnnotations'],
          onTrigger: methods['_defaultOnTrigger'],
          offTrigger: methods['_defaultOffTrigger']
        },
        article: {
          iframe: getContainerIframe($annotatable_element[0]),
          update: null
        },
        mark: {
          trigger_type: 'click',
          onTrigger: methods['_defaultOnTrigger'],
          offTrigger: methods['_defaultOffTrigger']
        }
      }, options));
      $marks = $('mark.annotated', this);
      rendered = [];
      $.each(settings.annotation.existing_data, function(i, db_data) {
        if ($.inArray(db_data.annotate_id, rendered) === -1) {
          renderSteps($annotatable_element, {
            annotation: db_data,
            status: 'success'
          }, 'init');
          return rendered.push(db_data.annotate_id);
        }
      });
      $marks.each(function() {
        if ($.inArray($(this).data('annotateId'), rendered) === -1) {
          renderSteps($annotatable_element, {
            annotation: $(this).data(),
            status: 'success'
          }, 'init');
          return rendered.push($(this).data('annotateId'));
        }
      });
      $annotatable_element.find('mark').addClass('annotate-hidden').removeClass('annotate-selected');
      $('mark.annotated', this).each(function() {
        if (hasAssociated($annotatable_element, $(this))) {
          return $(this).removeClass('annotate-hidden');
        }
      });
      $('.annotate-removeall').click(function() {
        return $annotatable_element.annotate('removeall');
      });
      $('.annotate-destroy').click(function() {
        return $annotatable_element.annotate('destroy');
      });
      $('.annotate-build').click(function() {
        return $annotatable_element.annotate('build');
      });
      if (!settings.ignore_warnings) {
        if (settings.article.update === methods['_updateArticle']) {
          return console.warn("It is highly recommended that you set a callback for updating the article");
        }
      }
    },
    _createDialog: function() {
      var $annotatable_element, $dialog, settings;
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      $('body').append("<" + settings.dialog.tag_name + " class='annotate-dialog" + (' ' + settings.dialog["class"]) + "' data-annotatable-id='" + settings._annotatable_id + "'>" + settings.dialog.template + "</" + settings.dialog.tag_name + ">");
      $dialog = $(".annotate-dialog[data-annotatable-id=" + settings._annotatable_id + "]");
      $annotatable_element.annotate('position', $dialog);
      return $dialog;
    },
    _createAnnotation: function(data) {
      return $.extend(data, {
        status: 'success'
      });
    },
    _deleteAnnotations: function(annotate_ids) {
      return annotate_ids;
    },
    _renderAnnotation: function(data) {
      var $annotatable_element, $annotation, $mark, annotate_id, annotation_attr, annotation_html, annotation_innerHtml, data_html, settings;
      $annotatable_element = $(this);
      settings = $(this).data();
      if ($.inArray(data.status, ['success', '200', 200]) > -1) {
        annotation_attr = camelizeObject(data.annotation);
        if (annotation_attr.annotateEditable != null) {
          delete annotation_attr.annotateEditable;
        }
        annotate_id = annotation_attr['annotateId'];
        $mark = $annotatable_element.find("mark[data-annotate-id=" + annotate_id + "]:first");
        if (settings.annotation.template != null) {
          annotation_innerHtml = settings.annotation.template;
        } else {
          data_html = '';
          if (annotation_attr != null) {
            $.each(annotation_attr, function(key, value) {
              return data_html += "<dt class='" + key + "'>" + (titleize(key)) + "</dt><dd class='annotate-fill-" + key + "'></dd>";
            });
            annotation_innerHtml = "<dl>" + data_html + "</dl> <button type='button' class='annotate-remove'>Remove</button>";
          }
        }
        annotation_html = "<" + settings.annotation.tag_name + " class='annotate-annotation" + (' ' + settings.annotation["class"]) + "' data-annotate-editable='" + data.annotation.annotate_editable + "' data-annotate-id='" + annotate_id + "' data-annotatable-id='" + settings._annotatable_id + "'>" + annotation_innerHtml + "</" + settings.annotation.tag_name + ">";
        if (($annotatable_element.annotate('select', annotate_id, 'mark')[0] != null) && (settings.annotation.position != null)) {
          $('body').append(annotation_html);
        } else {
          settings.annotation.container.append(annotation_html);
        }
        $annotation = $(".annotate-annotation[data-annotate-id=" + annotate_id + "]");
        $.each(annotation_attr || $mark.data(), function(key, value) {
          var $attr_field;
          $attr_field = $(".annotate-fill-" + key, $annotation[0]);
          return $attr_field.prepend(value);
        });
        $annotatable_element.annotate('position', $annotation);
        if ($annotation.data('annotate-editable') !== 1) {
          $annotation.find('.annotate-remove').remove();
        }
        return $annotation;
      } else {
        $(".annotate-dialog[data-annotatable-id=" + settings._annotatable_id + "] .errors").html('There was an error.');
        return false;
      }
    },
    _defaultOnTrigger: function($marks, $annotation) {
      var settings;
      settings = $(this).data();
      if ($.inArray(settings.annotation.position, ['top', 'bottom']) > -1) {
        $annotation.show();
        if (settings.mark.trigger_type === 'hover') {
          return $marks.add($annotation).mouseenter(function() {
            if ((settings._timer != null) && settings._timer.annotation === $annotation.data('annotate-id')) {
              return clearTimeout(settings._timer.id);
            }
          });
        }
      }
    },
    _defaultOffTrigger: function($marks, $annotation) {
      var settings;
      settings = $(this).data();
      if ($.inArray(settings.annotation.position, ['top', 'bottom']) > -1) {
        if (settings.mark.trigger_type === 'hover') {
          return settings._timer = {
            id: setTimeout((function() {
              return $annotation.hide(250);
            }), 1000),
            annotation: $annotation.data('annotate-id')
          };
        } else {
          return $annotation.hide(250);
        }
      }
    },
    _bindEvents: function($mark) {
      var $annotatable_element, $annotations, $marks, annotate_id, settings;
      if ($mark == null) {
        $mark = null;
      }
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      annotate_id = $mark.data('annotate-id');
      $marks = $annotatable_element.find("mark[data-annotate-id=" + ($mark.data('annotate-id')) + "]");
      $annotations = $annotatable_element.annotate('associated', $marks);
      if (($marks[0] != null) && (settings.mark.trigger_type != null)) {
        switch (settings.mark.trigger_type) {
          case 'hover':
            $marks.each(function() {
              if ($annotatable_element.annotate('associated', $(this))[0] != null) {
                return $(this).unbind('mouseenter mouseleave').hover(function(e) {
                  var $selected_marks, params;
                  annotate_id = getTopMarkId(e.currentTarget);
                  $selected_marks = $annotatable_element.annotate('select', annotate_id, 'mark');
                  if (typeof settings.mark.onTrigger === "function" && $(e.currentTarget).data('annotate-id') === annotate_id) {
                    params = [$selected_marks, $annotatable_element.annotate('associated', $selected_marks)];
                    flattenObject(params).addClass('annotate-selected');
                    return settings.mark.onTrigger.apply($annotatable_element[0], params);
                  }
                }, function(e) {
                  var params;
                  annotate_id = $(e.currentTarget).data('annotate-id');
                  $marks = $annotatable_element.annotate('select', annotate_id, 'mark');
                  if (typeof settings.mark.offTrigger === "function") {
                    params = [$marks, $annotatable_element.annotate('associated', $marks)];
                    flattenObject(params).removeClass('annotate-selected');
                    return settings.mark.offTrigger.apply($annotatable_element[0], params);
                  }
                });
              }
            });
            break;
          case 'click':
            $marks.each(function() {
              if ($annotatable_element.annotate('associated', $(this))[0] != null) {
                return $(this).unbind('click').click(function(e) {
                  var $selected_marks, params;
                  annotate_id = getTopMarkId(e.currentTarget);
                  $selected_marks = $annotatable_element.annotate('select', annotate_id, 'mark');
                  if (typeof settings.mark.onTrigger === "function" && $(e.currentTarget).data('annotate-id') === annotate_id) {
                    e.stopPropagation();
                    params = [$selected_marks, $annotatable_element.annotate('associated', $selected_marks)];
                    flattenObject(params).addClass('annotate-selected');
                    return settings.mark.onTrigger.apply($annotatable_element[0], params);
                  }
                });
              }
            });
        }
      }
      if (($annotations[0] != null) && (settings.annotation.trigger_type != null)) {
        switch (settings.annotation.trigger_type) {
          case 'hover':
            $annotations.unbind('mouseenter mouseleave').hover(function(e) {
              var params;
              annotate_id = $(e.currentTarget).data('annotate-id');
              $marks = $annotatable_element.annotate('select', annotate_id, 'mark');
              if (typeof settings.annotation.onTrigger === "function") {
                params = [$marks, $annotatable_element.annotate('associated', $marks)];
                flattenObject(params).addClass('annotate-selected');
                return settings.annotation.onTrigger.apply($annotatable_element[0], params);
              }
            }, function(e) {
              var params;
              annotate_id = $(e.currentTarget).data('annotate-id');
              $marks = $annotatable_element.annotate('select', annotate_id, 'mark');
              if (typeof settings.annotation.offTrigger === "function") {
                params = [$marks, $annotatable_element.annotate('associated', $marks)];
                flattenObject(params).removeClass('annotate-selected');
                return settings.annotation.offTrigger.apply($annotatable_element[0], params);
              }
            });
            break;
          case 'click':
            $annotations.unbind('click').click(function(e) {
              var params, selected;
              annotate_id = $(e.currentTarget).data('annotate-id');
              $marks = $annotatable_element.annotate('select', annotate_id, 'mark');
              if (typeof settings.annotation.offTrigger === "function") {
                selected = selectedAnnotations($annotatable_element);
                flattenObject(selected).removeClass('annotate-selected');
                settings.annotation.offTrigger.apply($annotatable_element[0], selected);
              }
              if (typeof settings.annotation.onTrigger === "function") {
                params = [$marks, $annotatable_element.annotate('associated', $marks)];
                flattenObject(params).addClass('annotate-selected');
                return settings.annotation.onTrigger.apply($annotatable_element[0], [$marks, $annotatable_element.annotate('associated', $marks)]);
              }
            });
        }
      }
      $annotations.find('.annotate-remove').unbind('click').click(function() {
        return $annotatable_element.annotate('remove', $(this));
      });
      $annotations.find('.annotate-revert').unbind('click').click(function() {
        return $annotatable_element.annotate('revert', $(this));
      });
      $annotations.find('form').unbind('submit').submit(function(e) {
        var form_data, response;
        settings = $annotatable_element.data();
        e.preventDefault();
        form_data = serializeObject(this, {
          annotate_id: $($(this).parents('.annotate-annotation')[0]).data('annotate-id')
        });
        response = settings.annotation.update(form_data);
        $marks = $annotatable_element.annotate('associated', $annotations);
        return renderSteps($annotatable_element, response, 'update');
      });
      return $annotatable_element.unbind('mouseup').mouseup(function(e) {
        var selected;
        if (settings.mark.trigger_type === 'click' || settings.annotation.trigger_type === 'click') {
          selected = selectedAnnotations($annotatable_element);
          $(selected[0]).add(selected[1]).removeClass('annotate-selected');
          settings.mark.offTrigger.apply($annotatable_element[0], selected);
        }
        if (settings.dialog.build_on_select) {
          if (!($(this).hasClass('annotate-dialog') || $(this).parents('.annotate-dialog').length > 0)) {
            return $annotatable_element.annotate('build');
          }
        }
      });
    },
    cancel: function() {
      var $annotatable_element, annotatable_id, dialog, settings;
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      dialog = $(".annotate-dialog[data-annotatable-id=" + settings._annotatable_id + "]")[0];
      if (typeof settings.dialog.beforeCancel === "function") {
        settings.dialog.beforeCancel.apply($annotatable_element[0], $(dialog));
      }
      annotatable_id = $(this).data('_annotatable_id');
      $(".annotate-dialog[data-annotatable-id=" + annotatable_id + "]").remove();
      $('mark.temp', this).contents().unwrap();
      if (typeof settings.dialog.afterCancel === "function") {
        return settings.dialog.afterCancel.apply($annotatable_element[0]);
      }
    },
    remove: function($elementOrId) {
      var $annotatable_element, annotate_id, deleted, settings;
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      annotate_id = typeof $elementOrId === 'object' ? getAnnotateId($elementOrId, settings.annotation.tag_name) : $elementOrId;
      if (typeof settings.annotation["delete"] === "function") {
        deleted = settings.annotation["delete"].apply(this, [[annotate_id]]);
        if (deleted[0] != null) {
          $.inArray(deleted, annotate_id) > -1;
          $annotatable_element.find("mark[data-annotate-id=" + annotate_id + "]", this).contents().unwrap();
          $(".annotate-annotation[data-annotate-id=" + annotate_id + "]").remove();
          return sendArticle($(this));
        }
      }
    },
    removeall: function() {
      var $annotatable_element, annotate_ids, deleted, settings;
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      if (typeof settings.annotation["delete"] === "function") {
        annotate_ids = [];
        $(this).annotate('cancel');
        $(".annotate-annotation[data-annotatable-id=" + settings._annotatable_id + "]").each(function() {
          var annotate_id;
          annotate_id = $(this).data('annotate-id');
          return annotate_ids.push(annotate_id);
        });
        deleted = settings.annotation["delete"].apply(this, [annotate_ids]);
        $.each(deleted, function(i, id) {
          $annotatable_element.find("mark[data-annotate-id=" + id + "]").contents().unwrap();
          return $(".annotate-annotation[data-annotate-id=" + id + "]").remove();
        });
        return sendArticle($(this));
      }
    },
    select: function(annotate_id, elementType) {
      if (elementType == null) {
        elementType = '*';
      }
      if (elementType.toLowerCase() === 'mark') {
        return $(this).find("mark[data-annotate-id=" + annotate_id + "]");
      } else {
        return $("" + elementType + "[data-annotate-id=" + annotate_id + "]");
      }
    },
    destroy: function() {
      var $annotatable_element, annotatable_id, tag_name;
      $annotatable_element = $(this);
      annotatable_id = $(this).data('_annotatable_id');
      tag_name = $(this).data('annotation').tag_name;
      $annotatable_element.find('mark.annotated').unbind();
      $("" + tag_name + "[data-annotatable-id=" + annotatable_id + "]").remove();
      $annotatable_element.annotate('associated', $('mark.annotated', this)).remove();
      return $annotatable_element.unbind('mouseup').removeData();
    },
    revert: function($elementOrId) {
      var $annotatable_element, $annotation, $marks, annotate_id, response, settings;
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      annotate_id = typeof $elementOrId === 'object' ? getAnnotateId($elementOrId, settings.annotation.tag_name) : $elementOrId;
      $annotation = $annotatable_element.annotate('select', annotate_id, settings.annotation.tag_name);
      $marks = $annotatable_element.annotate('select', annotate_id, 'mark').removeClass('annotate-selected');
      response = {
        annotation: decamelizeObject($annotation.data()),
        status: 'success'
      };
      $annotation.remove();
      return renderSteps($annotatable_element, response, 'revert');
    },
    associated: function($elements) {
      var annotate_ids, annotations, marks, returned_elements;
      annotate_ids = [];
      annotations = [];
      marks = [];
      $elements.each(function() {
        var annotate_id;
        annotate_id = getAnnotateId($(this));
        if ($.inArray(annotate_id, annotate_ids) === -1) {
          annotate_ids.push(annotate_id);
          if ($(this).prop("tagName") === 'MARK') {
            return $("*[data-annotate-id=" + annotate_id + "]").not('mark').each(function() {
              return annotations.push(this);
            });
          } else {
            return $annotatable_element.find("mark[data-annotate-id=" + annotate_id + "]").each(function() {
              return marks.push(this);
            });
          }
        }
      });
      returned_elements = marks.concat(annotations).filter(function(val) {
        return val != null;
      });
      return $(returned_elements);
    },
    position: function($el, params) {
      var mark, mark_left, mark_top, options, popup_placement, popup_type, scope, settings;
      if (params == null) {
        params = {};
      }
      settings = $(this).data();
      popup_type = $el.hasClass('annotate-annotation') ? settings.annotation : settings.dialog;
      options = $.extend({
        offset_amount: popup_type.offset_amount,
        direction: popup_type.position,
        annotate_id: $el.data('annotate-id')
      }, params);
      if ($el.hasClass('annotate-annotation') && $.inArray(options.direction, ['top', 'bottom']) > -1) {
        $el.css({
          display: 'none'
        });
      }
      popup_placement = options.direction === 'bottom' ? 'last' : 'first';
      scope = "mark[data-annotate-id=" + options.annotate_id + "]:" + popup_placement;
      mark = options.annotate_id != null ? $("mark[data-annotate-id=" + options.annotate_id + "]:" + popup_placement, this)[0] : $("mark.temp:" + popup_placement, this)[0];
      if (mark != null) {
        mark_left = inlineOffset(mark).left;
        mark_top = $(mark).offset().top;
        if (settings.article.iframe[0] != null) {
          mark_left += settings.article.iframe.offset().left;
          mark_top += settings.article.iframe.offset().top;
        }
        switch (options.direction) {
          case 'left':
            return $el.css({
              left: options.offset_amount,
              top: mark_top
            });
          case 'right':
            return $el.css({
              right: options.offset_amount,
              top: mark_top
            });
          case 'top':
            return $el.css({
              left: $(mark).width() / 2 + mark_left,
              top: mark_top - options.offset_amount - $el.height()
            });
          case 'bottom':
            return $el.css({
              left: $(mark).width() / 2 + mark_left,
              top: $(mark).height() + mark_top + options.offset_amount
            });
        }
      } else {
        return $el.css({
          position: 'static',
          display: 'block'
        });
      }
    },
    build: function() {
      var $annotatable_element, $dialog, before_result, parentElement, range, sel, settings;
      $annotatable_element = $(this);
      settings = $annotatable_element.data();
      sel = rangy.getSelection(settings.article.iframe[0]);
      if (sel.rangeCount > 0 && (window.selected_text = sel.toString()) !== '') {
        range = sel.getRangeAt(0);
        parentElement = range.commonAncestorContainer;
        if (parentElement.nodeType === 3 && (parentElement.parentNode != null)) {
          parentElement = parentElement.parentNode;
        }
        $(this).annotate('cancel');
        settings.tempMarker.applyToSelection(settings.article.iframe[0]);
        if (!settings.dialog.build_on_select) {
          sel.removeAllRanges();
        }
        $annotatable_element.find('tempmark').wrap('<mark class="temp"></mark>');
        $annotatable_element.find('mark.temp tempmark').contents().unwrap();
        before_result = settings.dialog.beforeCreate.apply($annotatable_element[0]);
        if (typeof settings.dialog.beforeCreate === "function" && before_result !== false) {
          if (typeof settings.dialog.create === "function") {
            $dialog = settings.dialog.create.apply($annotatable_element[0]);
          }
          $dialog.attr('data-annotatable-id', settings._annotatable_id).find(':input:first').focus();
          $dialog.find('.annotate-cancel').click(function() {
            return $annotatable_element.annotate('cancel');
          });
          if (typeof settings.dialog.afterCreate === "function") {
            settings.dialog.afterCreate.apply($annotatable_element[0], [$dialog]);
          }
          $dialog.keyup(function(e) {
            if (e.keyCode === 27) {
              return $annotatable_element.annotate('cancel');
            }
          });
          return $('.annotate-dialog form').submit(function(e) {
            var $marks, extras, form_data, response;
            e.preventDefault();
            extras = {
              annotate_id: generateAnnotateId(),
              annotate_context: selected_text,
              annotate_time: getCurrentTime()
            };
            if (!settings.annotation.include_time) {
              delete extras.annotate_time;
            }
            form_data = serializeObject(this, extras);
            response = settings.annotation.create(form_data);
            $marks = $annotatable_element.find('mark.temp');
            return renderSteps($annotatable_element, response, 'new');
          });
        } else {
          return $annotatable_element.annotate('cancel');
        }
      } else {
        return $annotatable_element.annotate('cancel');
      }
    }
  };
  return $.fn.annotate = function(methodOrOptions) {
    var result, _ref;
    try {
      if (methods[methodOrOptions]) {
        if (((_ref = $(this).data()) != null ? _ref.ignore_warnings : void 0) != null) {
          result = methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
          if ($.inArray(methodOrOptions, ['associated', 'select']) > -1) {
            return result;
          }
        } else {
          $.error("jQuery.annotate has not been instantiated on this element");
        }
      } else if (typeof methodOrOptions === "object" || !methodOrOptions) {
        methods.init.apply(this, arguments);
      } else {
        $.error("Method '" + methodOrOptions + "' does not exist on jQuery.annotate");
      }
      return $(this);
    } catch (e) {
      return console.log(e.stack);
    }
  };
})(jQuery);
