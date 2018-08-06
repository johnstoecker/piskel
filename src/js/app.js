/**
 * @require Constants
 * @require Events
 */
(function () {
  var ns = $.namespace('pskl');
  /**
   * Main application controller
   */
  ns.app = {

    init : function () {
      this.initLogin_();

      // Run preferences migration scripts for version v0.12.0
      pskl.UserSettings.migrate_to_v0_12();

      /**
       * When started from APP Engine, appEngineToken_ (Boolean) should be set on window.pskl
       */
      this.isAppEngineVersion = !!pskl.appEngineToken_;

      // This id is used to keep track of sessions in the BackupService.
      this.sessionId = pskl.utils.Uuid.generate();

      this.shortcutService = new pskl.service.keyboard.ShortcutService();
      this.shortcutService.init();

      var size = pskl.UserSettings.get(pskl.UserSettings.DEFAULT_SIZE);
      var fps = Constants.DEFAULT.FPS;
      var descriptor = new pskl.model.piskel.Descriptor('New Map', '');
      var piskel = new pskl.model.Piskel(size.width, size.height, fps, descriptor);

      var layer = new pskl.model.Layer('Layer 1');
      var frame = new pskl.model.Frame(size.width, size.height);

      layer.addFrame(frame);
      piskel.addLayer(layer);

      this.corePiskelController = new pskl.controller.piskel.PiskelController(piskel);
      this.corePiskelController.init();

      this.piskelController = new pskl.controller.piskel.PublicPiskelController(this.corePiskelController);
      this.piskelController.init();

      this.paletteImportService = new pskl.service.palette.PaletteImportService();
      this.paletteImportService.init();

      this.paletteService = new pskl.service.palette.PaletteService();
      this.paletteService.addDynamicPalette(new pskl.service.palette.CurrentColorsPalette());

      this.selectedColorsService = new pskl.service.SelectedColorsService();
      this.selectedColorsService.init();

      this.mouseStateService = new pskl.service.MouseStateService();
      this.mouseStateService.init();

      this.paletteController = new pskl.controller.PaletteController();
      this.paletteController.init();

      this.currentColorsService = new pskl.service.CurrentColorsService(this.piskelController);
      this.currentColorsService.init();

      this.palettesListController = new pskl.controller.PalettesListController(this.currentColorsService);
      this.palettesListController.init();

      this.legendController = new pskl.controller.LegendController(this.currentColorsService);
      this.legendController.init();

      this.cursorCoordinatesController = new pskl.controller.CursorCoordinatesController(this.piskelController);
      this.cursorCoordinatesController.init();

      this.drawingController = new pskl.controller.DrawingController(
        this.piskelController,
        document.querySelector('#drawing-canvas-container'));
      this.drawingController.init();

      this.previewController = new pskl.controller.preview.PreviewController(
        this.piskelController,
        document.querySelector('#animated-preview-canvas-container'));
      this.previewController.init();

      this.minimapController = new pskl.controller.MinimapController(
        this.piskelController,
        this.previewController,
        this.drawingController,
        document.querySelector('.minimap-container'));
      this.minimapController.init();

      this.framesListController = new pskl.controller.FramesListController(
        this.piskelController,
        document.querySelector('#preview-list-wrapper'));
      this.framesListController.init();

      this.layersListController = new pskl.controller.LayersListController(this.piskelController);
      this.layersListController.init();

      this.settingsController = new pskl.controller.settings.SettingsController(this.piskelController);
      this.settingsController.init();

      this.dialogsController = new pskl.controller.dialogs.DialogsController(this.piskelController);
      this.dialogsController.init();

      this.toolController = new pskl.controller.ToolController();
      this.toolController.init();

      this.selectionManager = new pskl.selection.SelectionManager(this.piskelController);
      this.selectionManager.init();

      this.historyService = new pskl.service.HistoryService(this.piskelController);
      this.historyService.init();

      this.notificationController = new pskl.controller.NotificationController();
      this.notificationController.init();

      this.transformationsController = new pskl.controller.TransformationsController();
      this.transformationsController.init();

      this.progressBarController = new pskl.controller.ProgressBarController();
      this.progressBarController.init();

      this.canvasBackgroundController = new pskl.controller.CanvasBackgroundController();
      this.canvasBackgroundController.init();

      this.indexedDbStorageService = new pskl.service.storage.IndexedDbStorageService(this.piskelController);
      this.indexedDbStorageService.init();

      this.localStorageService = new pskl.service.storage.LocalStorageService(this.piskelController);
      this.localStorageService.init();

      this.fileDownloadStorageService = new pskl.service.storage.FileDownloadStorageService(this.piskelController);
      this.fileDownloadStorageService.init();

      this.desktopStorageService = new pskl.service.storage.DesktopStorageService(this.piskelController);
      this.desktopStorageService.init();

      this.galleryStorageService = new pskl.service.storage.GalleryStorageService(this.piskelController);
      this.galleryStorageService.init();

      this.storageService = new pskl.service.storage.StorageService(this.piskelController);
      this.storageService.init();

      this.importService = new pskl.service.ImportService(this.piskelController);
      this.importService.init();

      this.imageUploadService = new pskl.service.ImageUploadService();
      this.imageUploadService.init();

      this.savedStatusService = new pskl.service.SavedStatusService(
        this.piskelController,
        this.historyService);
      this.savedStatusService.init();

      this.backupService = new pskl.service.BackupService(this.piskelController);
      this.backupService.init();

      this.beforeUnloadService = new pskl.service.BeforeUnloadService(this.piskelController);
      this.beforeUnloadService.init();

      this.headerController = new pskl.controller.HeaderController(
        this.piskelController,
        this.savedStatusService);
      this.headerController.init();

      this.penSizeService = new pskl.service.pensize.PenSizeService();
      this.penSizeService.init();

      this.penSizeController = new pskl.controller.PenSizeController();
      this.penSizeController.init();

      this.fileDropperService = new pskl.service.FileDropperService(this.piskelController);
      this.fileDropperService.init();

      this.userWarningController = new pskl.controller.UserWarningController(this.piskelController);
      this.userWarningController.init();

      this.performanceReportService = new pskl.service.performance.PerformanceReportService(
        this.piskelController,
        this.currentColorsService);
      this.performanceReportService.init();

      this.clipboardService = new pskl.service.ClipboardService(this.piskelController);
      this.clipboardService.init();

      this.drawingLoop = new pskl.rendering.DrawingLoop();
      this.drawingLoop.addCallback(this.render, this);
      this.drawingLoop.start();

      this.initTooltips_();

      var mapId = this.getPiskelInitData_();
      if (mapId) {
        this.loadMap_(mapId);
      }

      if (pskl.devtools) {
        pskl.devtools.init();
      }

      if (pskl.utils.Environment.detectNodeWebkit() && pskl.utils.UserAgent.isMac) {
        var gui = require('nw.gui');
        var mb = new gui.Menu({type : 'menubar'});
        mb.createMacBuiltin('Piskel');
        gui.Window.get().menu = mb;
      }

      if (!pskl.utils.Environment.isIntegrationTest() && pskl.utils.UserAgent.isUnsupported()) {
        $.publish(Events.DIALOG_SHOW, {
          dialogId : 'unsupported-browser'
        });
      }

      if (pskl.utils.Environment.isDebug()) {
        pskl.app.shortcutService.registerShortcut(pskl.service.keyboard.Shortcuts.DEBUG.RELOAD_STYLES,
          window.reloadStyles);
      }
    },

    loadMapImage_ : function (mapData) {
      var requestUrl = "https://s3-us-west-2.amazonaws.com/map-content-images/" + mapData.imageURL

      var image = new Image();
      image.onload = function () {
        pskl.app.importService.newPiskelFromImage(
          image,
          {
            importType:'single',
            frameSizeX: 32,
            frameSizeY: 32,
            frameOffsetX: 0,
            frameOffsetY: 0,
            smoothing: false,
            name: mapData.Title
          },
          function(piskel) {
            var descriptor =  new pskl.model.piskel.Descriptor(mapData.Title, mapData.Description, mapData.IsPublic);
            piskel.setDescriptor(descriptor);
            piskel.setLegend(mapData.Legend);
            piskel.setEvents(mapData.Events);
            piskel.mapId = mapData.MapId;
            pskl.app.piskelController.setPiskel(piskel);
            $.publish(Events.PISKEL_SAVED);
          }
        );

      }.bind(this);
      image.src = requestUrl;
    },

    loadMap_ : function (mapId) {
      var callback = this.loadMapImage_
      $.ajax({
          method: 'GET',
          url: "https://k0r6hekc1k.execute-api.us-west-2.amazonaws.com/prod/maps/" + mapId,
          // TODO: edit private maps
          // headers: {
          //     Authorization: authToken
          // },
          success: callback,
          error: function ajaxError(jqXHR, textStatus, errorThrown) {
              console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
              console.error('Response: ', jqXHR.responseText);
              alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
          }
      });
    },

    loadPiskel_ : function (piskelData) {
      var serializedPiskel = piskelData.piskel;
      pskl.utils.serialization.Deserializer.deserialize(serializedPiskel, function (piskel) {
        pskl.app.piskelController.setPiskel(piskel);
        $.publish(Events.PISKEL_SAVED);
        if (piskelData.descriptor) {
          // Backward compatibility for v2 or older
          piskel.setDescriptor(piskelData.descriptor);
        }
      });
    },

    initLogin_ : function () {
      var IronMaps = window.IronMaps || {};
      IronMaps.map = IronMaps.map || {};

      var authToken;
      IronMaps.authToken.then(function setAuthToken(token) {
          if (token) {
              this.authToken = token;
          } else {
              console.log("you arent logged in, thats probably fine, eh")
              // not logged in
              // window.location.href = '/signin.html';
          }
      }).catch(function handleTokenError(error) {
          alert(error);
          window.location.href = '/signin.html';
      });
    },

    getParameterByName_ : function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },

    getPiskelInitData_ : function () {
      var mapId = this.getParameterByName_("id", window.location.search)
      console.log(mapId)
      return mapId;
    },

    isLoggedIn : function () {
      return this.authToken && true;
      // var piskelData = this.getPiskelInitData_();
      // return piskelData && piskelData.isLoggedIn;
    },

    initTooltips_ : function () {
      $('body').tooltip({
        selector: '[rel=tooltip]'
      });
    },

    render : function (delta) {
      this.drawingController.render(delta);
      this.previewController.render(delta);
      this.framesListController.render(delta);
    },

    getFirstFrameAsPng : function () {
      var frame = pskl.utils.LayerUtils.mergeFrameAt(this.piskelController.getLayers(), 0);
      var canvas;
      if (frame instanceof pskl.model.frame.RenderedFrame) {
        canvas = pskl.utils.CanvasUtils.createFromImage(frame.getRenderedFrame());
      } else {
        canvas = pskl.utils.FrameUtils.toImage(frame);
      }
      return canvas.toDataURL('image/png');
    },

    getFramesheetAsPng : function () {
      var renderer = new pskl.rendering.PiskelRenderer(this.piskelController);
      var framesheetCanvas = renderer.renderAsCanvas();
      return framesheetCanvas.toDataURL('image/png');
    }
  };
})();
