$ ->
  module("jQuery#annotate")
  $annotatable_element = $("#article")
  settings = $annotatable_element.data()
  $annotatable_element.annotate()
  test "init", ->
    ok settings.length is 6, "settings has 6 keys"