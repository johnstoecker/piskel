(function () {
  var ns = $.namespace('pskl.controller.dialogs');

  // UI states, one for showing list of labels,
  // one for picking a color for a label
  var MODES = {
    LABELS_MODE: 'labels-mode',
    COLORS_MODE: 'colors-mode'
  }

  ns.CreateLegendController = function (piskelController) {
    this.paletteService = pskl.app.paletteService;
    this.paletteImportService = pskl.app.paletteImportService;
  };

  pskl.utils.inherit(ns.CreateLegendController, ns.AbstractDialogController);

  ns.CreateLegendController.prototype.init = function (paletteId) {
    this.superclass.init.call(this);

    this.legend = pskl.app.corePiskelController.piskel.legend
    if (!this.legend) {
      this.legend = {
        location: 'BOTTOMLEFT',
        entries: [
          { label: "Gondor", color: "#FF0000", uuid: "asdskk"},
          { label: "Rohan", color: "#00FF00", uuid: "lasdlkgjs"}
        ]
      }
    }
    this.currentLabelUUID =null

    this.drawLegendLabels_();

    var anchorWidgetContainer = document.querySelector('.legend-anchor-container');
    this.anchorWidget = new pskl.widgets.AnchorWidget(anchorWidgetContainer);
    this.anchorWidget.setOrigin(this.legend.location);

    this.nameInput = document.querySelector('input[name="legend-name"]');

    var buttonsContainer = document.querySelector('.create-legend-actions');
    var deleteButton = document.querySelector('.create-legend-delete');
    var backColorButton = document.querySelector('.create-legend-color-cancel');
    var colorChooseButton = document.querySelector('.create-legend-color-choose');
    var addLegendButton = document.querySelector('.add-legend-label');

    this.addEventListener(this.nameInput, 'input', this.onNameInputChange_);

    this.addEventListener(buttonsContainer, 'click', this.onButtonClick_);
    this.addEventListener(backColorButton, 'click', this.setCurrentModeLabels_);
    this.addEventListener(colorChooseButton, 'click', this.chooseLegendColor_);
    this.addEventListener(addLegendButton, 'click', this.addBlankLegendLabel_);

    var colorsListContainer = document.querySelector('.colors-container');
    this.colorsListWidget = new pskl.widgets.ColorsList(colorsListContainer);

    var palette;
    var isCurrentColorsPalette = paletteId == Constants.CURRENT_COLORS_PALETTE_ID;
    this.setTitle('Create Legend');

    var uuid = pskl.utils.Uuid.generate();

    if (isCurrentColorsPalette) {
      palette = new pskl.model.Palette(uuid, 'Current colors clone', this.getCurrentColors_());
    } else {
      palette = new pskl.model.Palette(uuid, 'XXX Palette', []);
    }

    this.setCurrentModeLabels_();
    this.setPalette_(palette);
  };

  ns.CreateLegendController.prototype.addBlankLegendLabel_ = function() {
    var legendsListContainer = document.querySelector('.create-legends-list');
    var newEntry = {}
    var newEntryDiv = document.createElement('div');
    var uuid = pskl.utils.Uuid.generate();
    var divId = 'entry-' + uuid;

    // newEntryDiv.innerHTML = '<div class="create-legend-section form-section"><li class="create-palette-new-color">+</li><input type="text" class="textfield create-legend-name-input" name="legend-name" placeholder="Kingdom of Gondor"/><button type="button" name="create-legend-remove-label" data-action="remove" class="button create-legend-remove-label">Remove</button></div>';

    var tpl = pskl.utils.Template.get('create-legend-new-color-template');
    newEntryDiv.innerHTML = tpl
    newEntryDiv.setAttribute('id', divId);
    var removeButton = newEntryDiv.querySelector('.create-legend-remove-label');
    this.addEventListener(removeButton, 'click', this.removeLegendLabel_);

    var setColorButton = newEntryDiv.querySelector('.create-palette-new-color');
    this.addEventListener(setColorButton, 'click', this.setLegendColor_);

    legendsListContainer.appendChild(newEntryDiv)
  }

  ns.CreateLegendController.prototype.drawLegendLabels_ = function() {
    var legendsListContainer = document.querySelector('.create-legends-list');

    var tpl = pskl.utils.Template.get('create-legend-color-template');

    for (var i in this.legend.entries) {

      var entry = this.legend.entries[i]
      var uuid = entry.uuid;
      var divId = 'entry-' + uuid;
      var newEntryDiv = document.createElement('div');
      newEntryDiv.innerHTML = pskl.utils.Template.replace(tpl, {
        'color' : entry.color,
        'label' : entry.label
      });
      newEntryDiv.setAttribute('id', divId)

      var removeButton = newEntryDiv.querySelector('.create-legend-remove-label');
      this.addEventListener(removeButton, 'click', this.removeLegendLabel_);

      var setColorButton = newEntryDiv.querySelector('.create-palette-color');
      this.addEventListener(setColorButton, 'click', this.setLegendColor_);
      // TODO: remove color button
      // newEntryDiv.addEventListener('click', this.)

      legendsListContainer.appendChild(newEntryDiv)

    }
  }

  ns.CreateLegendController.prototype.setLegendColor_ = function(event) {
    // lol this is no good...[emoji with monkey covering eyes]..
    var uuid = event.currentTarget.parentNode.parentNode.id.substr(6)
    this.currentLabelUUID = uuid;
    console.log('setting legend color')
    this.setCurrentModeColors_();
  }

  ns.CreateLegendController.prototype.chooseLegendColor_ = function() {
    var color = document.querySelector('.create-palette-color.selected').style.background;
    for (var i in this.legend.entries) {
      if (this.legend.entries[i].uuid == this.currentLabelUUID) {
        this.legend.entries[i].color = color
      }
    }
    var paletteDiv = document.querySelector("#entry-"+this.currentLabelUUID).querySelector(".create-palette-color, .create-palette-new-color")
    paletteDiv.innerHTML = ""
    paletteDiv.classList.add("create-palette-color");
    paletteDiv.classList.remove("create-palette-new-color");
    paletteDiv.style.backgroundColor = color;

    this.setCurrentModeLabels_();
  }

  ns.CreateLegendController.prototype.removeLegendLabel_ = function(event) {
    // lol this is no good...[emoji with monkey covering eyes]..
    var divId = event.currentTarget.parentNode.parentNode.id
    var uuid = divId.substr(6)
    console.log(divId)
    document.querySelector('#'+divId).remove()
    var indexToRemove = null
    for (var i in this.legend.entries) {
      if (this.legend.entries[i].uuid == uuid) {
        indexToRemove = i
        return;
      }
    }
    this.legend.entries = this.legend.entries.splice(indexToRemove, 1)
    console.log('remove label clicked');
  }

  ns.CreateLegendController.prototype.setCurrentModeLabels_ = function () {
    this.setCurrentMode_(MODES.LABELS_MODE);
  }

  ns.CreateLegendController.prototype.setCurrentModeColors_ = function () {
    this.setCurrentMode_(MODES.COLORS_MODE);
  }

  ns.CreateLegendController.prototype.setCurrentMode_ = function (mode) {
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

  ns.CreateLegendController.prototype.getCurrentColors_ = function () {
    var palette = this.paletteService.getPaletteById(Constants.CURRENT_COLORS_PALETTE_ID);
    return palette.getColors();
  };

  ns.CreateLegendController.prototype.setPalette_ = function (palette) {
    this.palette = palette;
    // this.nameInput.value = pskl.utils.unescapeHtml(palette.name);
    this.colorsListWidget.setColors(palette.getColors());
  };

  ns.CreateLegendController.prototype.destroy = function () {
    this.colorsListWidget.destroy();
    this.superclass.destroy.call(this);

    this.nameInput = null;
    this.hiddenFileInput = null;
  };

  ns.CreateLegendController.prototype.onButtonClick_ = function (evt) {
    var target = evt.target;
    if (target.dataset.action === 'submit') {
      this.saveLegend_();
    } else if (target.dataset.action === 'cancel') {
      this.closeDialog();
    } else if (target.dataset.action === 'delete') {
      this.deletePalette_();
    }
  };

  ns.CreateLegendController.prototype.saveLegend_ = function () {
    for (var i in this.legend.entries) {
      entry = this.legend.entries[i]
      var entryDiv = document.querySelector("#entry-"+entry.uuid);
      // just use the DOM to store our model, dont create unnecessary listeners....
      var text = entryDiv.querySelector(".create-legend-name-input").value
      this.legend.entries[i].label = text;
    }
    pskl.app.corePiskelController.piskel.setLegend(this.legend)
    this.closeDialog();
  };

  ns.CreateLegendController.prototype.deleteLegend_ = function () {
    if (window.confirm('Are you sure you want to delete the legend?')) {
      pskl.app.corePiskelController.piskel.setLegend(null)
      this.closeDialog();
    }
  };

  ns.CreateLegendController.prototype.displayErrorMessage_ = function (message) {
    message = 'Could not import palette : ' + message;
    $.publish(Events.SHOW_NOTIFICATION, [{
      'content' : message
    }]);
    window.setTimeout($.publish.bind($, Events.HIDE_NOTIFICATION), 2000);
  };

  ns.CreateLegendController.prototype.onNameInputChange_ = function (evt) {
    this.palette.name = pskl.utils.escapeHtml(this.nameInput.value);
  };
})();
