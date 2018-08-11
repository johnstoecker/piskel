(function () {
  var ns = $.namespace('pskl.controller.dialogs');

  // UI states, one for showing list of labels,
  // one for picking a color for a label
  var MODES = {
    LABELS_MODE: 'labels-mode',
    COLORS_MODE: 'colors-mode'
  }

  ns.MapLabelDialogController = function (piskelController) {
    this.paletteService = pskl.app.paletteService;
    this.paletteImportService = pskl.app.paletteImportService;
  };

  pskl.utils.inherit(ns.MapLabelDialogController, ns.AbstractDialogController);

  ns.MapLabelDialogController.prototype.init = function (paletteId) {
    this.superclass.init.call(this);

    this.labels = pskl.app.corePiskelController.piskel.labels
    if (!this.labels) {
      this.labels = {
        entries: [
          { color: "#FF0000", location: [1,1], label: "The Misty Mountain", uuid: "lasdlks"}
        ]
      }
    }
    this.currentLabelUUID =null

    this.drawLabels_();
    // var anchorWidgetContainer = document.querySelector('.legend-anchor-container');
    // this.anchorWidget = new pskl.widgets.AnchorWidget(anchorWidgetContainer);
    // this.anchorWidget.setOrigin(this.legend.location);

    var buttonsContainer = document.querySelector('.create-map-label-actions');
    var backColorButton = document.querySelector('.create-map-label-color-cancel');
    var colorChooseButton = document.querySelector('.create-map-label-color-choose');
    var addLegendButton = document.querySelector('.add-map-label-label');

    this.addEventListener(buttonsContainer, 'click', this.onButtonClick_);
    this.addEventListener(backColorButton, 'click', this.setCurrentModeLabels_);
    this.addEventListener(colorChooseButton, 'click', this.chooseLabelColor_);
    this.addEventListener(addLegendButton, 'click', this.addBlankLabel_);

    var colorsListContainer = document.querySelector('.colors-container');
    this.colorsListWidget = new pskl.widgets.ColorsList(colorsListContainer);

    $.subscribe(Events.CHOOSE_LABEL_LOCATION, this.chooseLabelLocation_.bind(this));

    var palette;
    var isCurrentColorsPalette = paletteId == Constants.CURRENT_COLORS_PALETTE_ID;
    this.setTitle('Create Labels');

    var uuid = pskl.utils.Uuid.generate();

    if (isCurrentColorsPalette) {
      palette = new pskl.model.Palette(uuid, 'Current colors clone', this.getCurrentColors_());
    } else {
      palette = new pskl.model.Palette(uuid, 'XXX Palette', []);
    }

    this.setCurrentModeLabels_();
    this.setPalette_(palette);
  };

  ns.MapLabelDialogController.prototype.addBlankLabel_ = function() {
    var legendsListContainer = document.querySelector('.create-map-labels-list');
    var newEntry = {}
    var newEntryDiv = document.createElement('div');
    var uuid = pskl.utils.Uuid.generate();
    var divId = 'entry-' + uuid;
    this.labels.entries.push({
      uuid: uuid,
      location: [0,0],
      color: null,
      label: null
    })
    // newEntryDiv.innerHTML = '<div class="create-map-label-section form-section"><li class="create-palette-new-color">+</li><input type="text" class="textfield create-map-label-name-input" name="legend-name" placeholder="Kingdom of Gondor"/><button type="button" name="create-map-label-remove-label" data-action="remove" class="button create-map-label-remove-label">Remove</button></div>';

    var tpl = pskl.utils.Template.get('create-label-new-color-template');
    newEntryDiv.innerHTML = pskl.utils.Template.replace(tpl, {
      'uuid' : uuid
    });
    newEntryDiv.setAttribute('id', divId);
    var removeButton = newEntryDiv.querySelector('.create-map-label-remove-label');
    this.addEventListener(removeButton, 'click', this.removeLabel_);

    var setLocationButton = newEntryDiv.querySelector('.map-label-text-location-set');
    this.addEventListener(setLocationButton, 'click', this.setLabelLocation_);

    var setColorButton = newEntryDiv.querySelector('.create-palette-new-color');
    this.addEventListener(setColorButton, 'click', this.setLabelColor_);

    legendsListContainer.appendChild(newEntryDiv)
  }

  ns.MapLabelDialogController.prototype.drawLabels_ = function() {
    var legendsListContainer = document.querySelector('.create-map-labels-list');

    var tpl = pskl.utils.Template.get('create-label-color-template');
    console.log(this.labels)
    for (var i in this.labels.entries) {

      var entry = this.labels.entries[i]
      var uuid = entry.uuid;
      var divId = 'entry-' + uuid;
      var newEntryDiv = document.createElement('div');
      newEntryDiv.innerHTML = pskl.utils.Template.replace(tpl, {
        'color' : entry.color,
        'location' : entry.location,
        'label' : entry.label,
        'uuid' : entry.uuid
      });
      newEntryDiv.setAttribute('id', divId)
      if (this.labels.entries[i].frames && this.labels.entries[i].frames.length > 0) {
        newEntryDiv.querySelector('.create-map-label-frame-section').children[2].checked = true
        newEntryDiv.querySelector('.map-label-frame-input-start').value = this.labels.entries[i].frames[0]
        newEntryDiv.querySelector('.map-label-frame-input-end').value = this.labels.entries[i].frames[1]
      }

      var removeButton = newEntryDiv.querySelector('.create-map-label-remove-label');
      this.addEventListener(removeButton, 'click', this.removeLabel_);

      var setLocationButton = newEntryDiv.querySelector('.map-label-text-location-set');
      this.addEventListener(setLocationButton, 'click', this.setLabelLocation_);

      var setColorButton = newEntryDiv.querySelector('.create-palette-color');
      this.addEventListener(setColorButton, 'click', this.setLabelColor_);
      // TODO: remove color button
      // newEntryDiv.addEventListener('click', this.)

      legendsListContainer.appendChild(newEntryDiv)

    }
  }

  ns.MapLabelDialogController.prototype.setLabelLocation_ = function(event) {
    console.log(event);
    // lol this is no good...[emoji with monkey covering eyes]..
    var uuid = event.currentTarget.parentNode.parentNode.parentNode.id.substr(6)
    console.log(uuid)
    pskl.app.corePiskelController.piskel.currentLabelUUID = uuid;
    $("#dialog-container-wrapper").hide();
    // this.currentLabelUUID = uuid;
    // console.log('setting legend color')
    // this.setCurrentModeColors_();
  }

  ns.MapLabelDialogController.prototype.chooseLabelLocation_ = function(event, locationX, locationY) {
    console.log(this);
    // lol this is no good...[emoji with monkey covering eyes]..
    var uuid = pskl.app.corePiskelController.piskel.currentLabelUUID;
    for (var i in this.labels.entries) {
      entry = this.labels.entries[i];
      if (entry.uuid == uuid) {
        entry.location = [locationX, locationY];
      }
    }
    pskl.app.corePiskelController.piskel.currentLabelUUID = null;

    var locationDiv = document.querySelector("#entry-"+uuid).querySelector(".map-text-location-data")
    locationDiv.innerHTML = "[" + locationX + "," + locationY + "]";
    $("#dialog-container-wrapper").show();
    // this.currentLabelUUID = uuid;
    // console.log('setting legend color')
    // this.setCurrentModeColors_();
  }

  ns.MapLabelDialogController.prototype.setLabelColor_ = function(event) {
    // lol this is no good...[emoji with monkey covering eyes]..
    var uuid = event.currentTarget.parentNode.parentNode.id.substr(6)
    this.currentLabelUUID = uuid;
    console.log('setting legend color')
    this.setCurrentModeColors_();
  }

  ns.MapLabelDialogController.prototype.chooseLabelColor_ = function() {
    var color = document.querySelector('.create-palette-color.selected').style.background;
    for (var i in this.labels.entries) {
      if (this.labels.entries[i].uuid == this.currentLabelUUID) {
        this.labels.entries[i].color = color
      }
    }
    var paletteDiv = document.querySelector("#entry-"+this.currentLabelUUID).querySelector(".create-palette-color, .create-palette-new-color")
    paletteDiv.innerHTML = ""
    paletteDiv.classList.add("create-palette-color");
    paletteDiv.classList.remove("create-palette-new-color");
    paletteDiv.style.backgroundColor = color;

    this.setCurrentModeLabels_();
  }

  ns.MapLabelDialogController.prototype.removeLabel_ = function(event) {
    // lol this is no good...[emoji with monkey covering eyes]..
    var divId = event.currentTarget.parentNode.parentNode.id
    var uuid = divId.substr(6)
    console.log(divId)
    document.querySelector('#'+divId).remove()
    var indexToRemove = null
    for (var i in this.labels.entries) {
      if (this.labels.entries[i].uuid == uuid) {
        indexToRemove = i
        break;
      }
    }
    this.labels.entries.splice(indexToRemove, 1)
    console.log('remove label clicked');
  }

  ns.MapLabelDialogController.prototype.setCurrentModeLabels_ = function () {
    this.setCurrentMode_(MODES.LABELS_MODE);
  }

  ns.MapLabelDialogController.prototype.setCurrentModeColors_ = function () {
    this.setCurrentMode_(MODES.COLORS_MODE);
  }

  ns.MapLabelDialogController.prototype.setCurrentMode_ = function (mode) {
    var labelsContainer = document.querySelector('.dialog-create-legend');
    var colorsContainer = document.querySelector('.color-picker-create-legend');
    if (mode == MODES.LABELS_MODE) {
      labelsContainer.classList.remove('hidden');
      colorsContainer.classList.add('hidden');
    } else if (mode == MODES.COLORS_MODE) {
      labelsContainer.classList.add('hidden');
      colorsContainer.classList.remove('hidden');
    }
  }

  ns.MapLabelDialogController.prototype.getCurrentColors_ = function () {
    var palette = this.paletteService.getPaletteById(Constants.CURRENT_COLORS_PALETTE_ID);
    return palette.getColors();
  };

  ns.MapLabelDialogController.prototype.setPalette_ = function (palette) {
    this.palette = palette;
    this.colorsListWidget.setColors(palette.getColors());
  };

  ns.MapLabelDialogController.prototype.destroy = function () {
    this.colorsListWidget.destroy();
    this.superclass.destroy.call(this);

    this.hiddenFileInput = null;
  };

  ns.MapLabelDialogController.prototype.onButtonClick_ = function (evt) {
    var target = evt.target;
    if (target.dataset.action === 'submit') {
      this.saveLabel_();
    } else if (target.dataset.action === 'cancel') {
      this.closeDialog();
    }
  };

  ns.MapLabelDialogController.prototype.saveLabel_ = function () {
    for (var i in this.labels.entries) {
      entry = this.labels.entries[i]
      var entryDiv = document.querySelector("#entry-"+entry.uuid);
      // just use the DOM to store our model, dont create unnecessary listeners....
      var frameButtons = document.getElementsByName("frames-"+entry.uuid)
      if (frameButtons[0].checked) {
        console.log('allframes')
        this.labels.entries[i].frames = null
      } else {
        var startFrame = entryDiv.querySelector('.map-label-frame-input-start').value || 0
        var endFrame = entryDiv.querySelector('.map-label-frame-input-end').value || 0
        console.log([startFrame, endFrame])
        this.labels.entries[i].frames = [startFrame, endFrame]
      }
      var text = entryDiv.querySelector(".create-map-label-name-input").value
      this.labels.entries[i].label = text;
    }
    pskl.app.corePiskelController.piskel.setLabels(this.labels)
    this.closeDialog();
  };

  ns.MapLabelDialogController.prototype.displayErrorMessage_ = function (message) {
    message = 'Could not import palette : ' + message;
    $.publish(Events.SHOW_NOTIFICATION, [{
      'content' : message
    }]);
    window.setTimeout($.publish.bind($, Events.HIDE_NOTIFICATION), 2000);
  };
})();
