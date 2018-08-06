(function () {
  var ns = $.namespace('pskl.controller.dialogs');

  // var SHORTCUT_EDITING_CLASSNAME = 'cheatsheet-shortcut-editing';

  ns.MapTextDialogController = function () {};

  pskl.utils.inherit(ns.MapTextDialogController, ns.AbstractDialogController);

  ns.MapTextDialogController.prototype.init = function () {
    console.log('init')
    var mapEvent = pskl.app.piskelController.getCurrentFrame().mapEvent;
    this.superclass.init.call(this);

    this.mapTextDialogEl = document.getElementById('mapTextDialogContainer');
    $("#map-text-editable-container").text(mapEvent.text);
    if (mapEvent.location) {
      $("#map-text-location-data").text(mapEvent.location[0]+","+mapEvent.location[1])
      $("#map-text-location-remove").show()
    } else {
      $("#map-text-location-data").text("[none, click on the map to set a location]")
      $("#map-text-location-remove").hide()
    }
    // this.eventTrapInput = document.getElementById('cheatsheetEventTrap');

    this.addEventListener('.map-text-dialog-save', 'click', this.onSaveMapTextClick_);
    this.addEventListener('#map-text-location-remove', 'click', this.onRemoveLocationClick_);
    this.addEventListener(this.mapTextDialogEl, 'click', this.onMapTextDialogClick_);
    // this.addEventListener(this.eventTrapInput, 'keydown', this.onEventTrapKeydown_);
  };

  ns.MapTextDialogController.prototype.destroy = function () {
    // this.eventTrapInput.blur();

    // $.unsubscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_);
    this.mapTextDialogEl = null;

    this.superclass.destroy.call(this);
  };

  ns.MapTextDialogController.prototype.onSaveMapTextClick_ = function () {
    text = $("#map-text-editable-container").val()
    $('#map-event-text-mini-title').text(text)
    pskl.app.piskelController.getCurrentFrame().setMapEventText(text)
    this.closeDialog();
  };

  ns.MapTextDialogController.prototype.onRemoveLocationClick_ = function () {
    $("#map-text-location-data").text("[none, click on the map to set a location]")
    $("#map-text-location-remove").hide()
    pskl.app.piskelController.getCurrentFrame().setMapEventLocation(null)
  };


  ns.MapTextDialogController.prototype.onMapTextDialogClick_ = function (evt) {
  };
})();
