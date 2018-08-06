(function () {
  var ns = $.namespace('pskl.controller.dialogs');

  // var SHORTCUT_EDITING_CLASSNAME = 'cheatsheet-shortcut-editing';

  ns.MapLabelDialogController = function () {};

  pskl.utils.inherit(ns.MapLabelDialogController, ns.AbstractDialogController);

  ns.MapLabelDialogController.prototype.init = function () {
    console.log('init')
    var mapEvent = pskl.app.piskelController.getCurrentFrame().mapEvent;
    this.superclass.init.call(this);

    this.mapLabelDialogEl = document.getElementById('mapLabelDialogContainer');

    // $("#map-text-editable-container").text(mapEvent.text);
    // if (mapEvent.location) {
    //   $("#map-text-location-data").text(mapEvent.location[0]+","+mapEvent.location[1])
    //   $("#map-text-location-remove").show()
    // } else {
    //   $("#map-text-location-data").text("[none, click on the map to set a location]")
    //   $("#map-text-location-remove").hide()
    // }
    // this.eventTrapInput = document.getElementById('cheatsheetEventTrap');

    this.addEventListener('.map-label-text-dialog-save', 'click', this.onSaveMapLabelClick_);
    this.addEventListener('#map-label-text-location-remove', 'click', this.onRemoveLocationClick_);

    // this.sessionId = pskl.utils.Uuid.generate();



    // this.addEventListener(this.mapLabelDialogEl, 'click', this.onMapLabelDialogClick_);
    // this.addEventListener(this.eventTrapInput, 'keydown', this.onEventTrapKeydown_);

    // this.onShortcutsChanged_ = this.onShortcutsChanged_.bind(this);
    // $.subscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_);

    // this.initMarkup_();
    // document.querySelector('.cheatsheet-helptext').setAttribute('title', this.getHelptextTitle_());
  };

  ns.MapLabelDialogController.prototype.destroy = function () {
    // this.eventTrapInput.blur();

    // $.unsubscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_);
    this.mapLabelDialogEl = null;

    this.superclass.destroy.call(this);
  };

  ns.MapLabelDialogController.prototype.onSaveMapLabelClick_ = function () {
    text = $("#map-text-editable-container").val()
    $('#map-event-text-mini-title').text(text)
    pskl.app.piskelController.getCurrentFrame().setMapEventLabel(text)
    this.closeDialog();
  };

  ns.MapLabelDialogController.prototype.onRemoveLocationClick_ = function () {
    $("#map-text-location-data").text("[none, click on the map to set a location]")
    $("#map-text-location-remove").hide()
    pskl.app.piskelController.getCurrentFrame().setMapEventLocation(null)
  };


  ns.MapLabelDialogController.prototype.onMapLabelDialogClick_ = function (evt) {
  };

})();
