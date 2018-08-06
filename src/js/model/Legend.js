(function () {
  var ns = $.namespace('pskl.model');
  var __idCounter = 0;
  ns.Legend = function () {
    this.entries = [];
    this.location = 'BOTTOMLEFT';
  };

  ns.Legend.setEntries = function (entries) {
    this.entries = [];
    for e in entries {
      if(e.text && e.color) {
        newEntry = {}
        newEntry.color = pskl.utils.colorToInt(e.color);
        newEntry.text = e.text;
        this.entries.push(newEntry)
      }
    }
  }

  ns.Legend.setLocation = function (location) {
    this.location = location;
  }

  // ns.Frame.prototype.setPixel = function (x, y, color) {
  //   if (this.containsPixel(x, y)) {
  //     var index = y * this.width + x;
  //     var p = this.pixels[index];
  //     color = pskl.utils.colorToInt(color);
  //
  //     if (p !== color) {
  //       this.pixels[index] = color || pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
  //       this.version++;
  //     }
  //   }
  // };
})();
