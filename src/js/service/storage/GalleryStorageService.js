(function () {
  var ns = $.namespace('pskl.service.storage');

  var URL_MAX_LENGTH = 30;
  var MAX_GIF_COLORS = 256;
  var MAGIC_PINK = '#FF00FF';
  var WHITE = '#FFFFFF';


  ns.GalleryStorageService = function (piskelController) {
    this.piskelController = piskelController;
  };

  ns.GalleryStorageService.prototype.init = function () {};

  ns.GalleryStorageService.prototype.save = function (piskel) {
    var descriptor = piskel.getDescriptor();
    var deferred = Q.defer();

    var serialized = pskl.utils.serialization.Serializer.serialize(piskel);

    var data = {
      framesheet : serialized,
      fps : this.piskelController.getFPS(),
      name : descriptor.name,
      description : descriptor.description,
      frames : this.piskelController.getFrameCount(),
      events: piskel.getEvents(),
      legend: piskel.legend,
      first_frame_as_png : pskl.app.getFirstFrameAsPng(),
      framesheet_as_png : pskl.app.getFramesheetAsPng()
    };

    if (serialized.length > Constants.APPENGINE_SAVE_LIMIT) {
      deferred.reject('This sprite is too big to be saved on the gallery. Try saving it as a .piskel file.');
    }

    if (descriptor.isPublic) {
      data.public = true;
    }

    var successCallback = function (response) {
      deferred.resolve();
    };

    var errorCallback = function (response) {
      deferred.reject(this.getErrorMessage_(response));
    };


    // TODO: dont inline this function
    //uploads the actual file to s3 using one-time URL
    var uploadFileToS3 = function (result) {
      piskel.mapId = result.MapId;
      console.log('Response received from API: ', result);
      // TODO: make this link to the new map
      console.log('Map created at '+result.MapId)


      this.renderAsImageDataAnimatedGIF(1, 1, function(imageData) {
        pskl.utils.BlobUtils.dataToBlob(imageData, 'image/gif', function(blob) {
          $.ajax({
              type: 'PUT',
              url: result.url,
              processData: false,
              data: blob,
              success: successCallback,
              error: function ajaxError(jqXHR, textStatus, errorThrown) {
                  console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                  console.error('Response: ', jqXHR.responseText);
                  console.error('An error occured when uploading your map file:\n' + jqXHR.responseText);
              }
          });

        })
      });

    }.bind(this);

    // TODO: first frame as preview thumb
    // var data = {
    //   framesheet : serialized,
    //   fps : this.piskelController.getFPS(),
    //   name : descriptor.name,
    //   description : descriptor.description,
    //   frames : this.piskelController.getFrameCount(),
    //   first_frame_as_png : pskl.app.getFirstFrameAsPng(),
    //   framesheet_as_png : pskl.app.getFramesheetAsPng()
    // };

    $.ajax({
      type: 'POST',
      url: _config.api.invokeUrl + '/maps',
      headers: {
          Authorization: pskl.app.authToken
      },
      data: JSON.stringify({
        Title: descriptor.name,
        Description: descriptor.description,
        Events: data.events,
        Legend: data.legend || {},
        isPublic: true
      }),
      contentType: 'application/json',
      success: uploadFileToS3,
      error: errorCallback
    });

    return deferred.promise;
  };

  // TODO: move this to a shared utils
  ns.GalleryStorageService.prototype.getTransparentColor = function(currentColors) {
    var transparentColor = pskl.utils.ColorUtils.getUnusedColor(currentColors);

    if (!transparentColor) {
      console.error('Unable to find unused color to use as transparent color in the current sprite');
      transparentColor = MAGIC_PINK;
    }

    return transparentColor;
  };

  // TODO: move this to a shared utils
  ns.GalleryStorageService.prototype.renderAsImageDataAnimatedGIF = function(zoom, fps, cb) {
    var currentColors = pskl.app.currentColorsService.getCurrentColors();

    var layers = this.piskelController.getLayers();
    var isTransparent = layers.some(function (l) {return l.isTransparent();});
    var preserveColors = !isTransparent && currentColors.length < MAX_GIF_COLORS;

    var transparentColor;
    var transparent;
    // transparency only supported if preserveColors is true, see Issue #357
    if (preserveColors) {
      transparentColor = this.getTransparentColor(currentColors);
      transparent = parseInt(transparentColor.substring(1), 16);
    } else {
      transparentColor = WHITE;
      transparent = null;
    }

    var width = this.piskelController.getWidth();
    var height = this.piskelController.getHeight();

    var gif = new window.GIF({
      workers: 5,
      quality: 1,
      width: width * zoom,
      height: height * zoom,
      preserveColors : preserveColors,
      // TODO: default dont repeat?
      repeat: 0,
      transparent : transparent
    });

    // Create a background canvas that will be filled with the transparent color before each render.
    var background = pskl.utils.CanvasUtils.createCanvas(width, height);
    var context = background.getContext('2d');
    context.fillStyle = transparentColor;

    for (var i = 0 ; i < this.piskelController.getFrameCount() ; i++) {
      var render = this.piskelController.renderFrameAt(i, true);
      context.clearRect(0, 0, width, height);
      context.fillRect(0, 0, width, height);
      context.drawImage(render, 0, 0, width, height);

      var canvas = pskl.utils.ImageResizer.scale(background, zoom);
      gif.addFrame(canvas.getContext('2d'), {
        delay: 1000 / fps
      });
    }

    $.publish(Events.SHOW_PROGRESS, [{'name': 'Building animated GIF ...'}]);
    gif.on('progress', function(percentage) {
      $.publish(Events.UPDATE_PROGRESS, [{'progress': (percentage * 100).toFixed(1)}]);
    }.bind(this));

    gif.on('finished', function(blob) {
      $.publish(Events.HIDE_PROGRESS);
      pskl.utils.FileUtils.readFile(blob, cb);
    }.bind(this));

    gif.render();
  };

  ns.GalleryStorageService.prototype.getErrorMessage_ = function (response) {
    var errorMessage = '';
    if (response.status === 401) {
      errorMessage = 'Session expired, please log in again.';
    } else if (response.status === 403) {
      errorMessage = 'Unauthorized action, this sprite belongs to another account.';
    } else if (response.status === 500) {
      errorMessage = 'Unexpected server error, please contact us on Github (johnstoecker/ironmaps) or Twitter (@piskelapp)';
    } else {
      errorMessage = 'Unknown error';
    }
    return errorMessage;
  };
})();
