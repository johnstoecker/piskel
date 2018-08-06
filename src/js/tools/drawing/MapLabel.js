/**
 * @provide pskl.tools.drawing.Circle
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.MapLabel = function() {
    ns.SimplePen.call(this);

    this.toolId = 'tool-map-label';
    this.helpText = 'Map Label';

    this.tooltipDescriptors = [
      {description : 'Add labels directly onto the map'}
    ];


    // TODO: make map event
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.MAP_LABEL;
  };

  pskl.utils.inherit(ns.MapLabel, ns.SimplePen);
  // pskl.utils.Event.addEventListener('.icon-tool-map-event', 'click', function() { console.log("hi")}, this);

  /**
   * @override
   */

   // ns.MapEvent.prototype.applyToolAt = function(col, row, frame, overlay, event) {
   //   console.log("tool applied")
     // if (frame.containsPixel(col, row)) {
     //   var sampledColor = pskl.utils.intToColor(frame.getPixel(col, row));
     //   if (pskl.app.mouseStateService.isLeftButtonPressed()) {
     //     $.publish(Events.SELECT_PRIMARY_COLOR, [sampledColor]);
     //   } else if (pskl.app.mouseStateService.isRightButtonPressed()) {
     //     $.publish(Events.SELECT_SECONDARY_COLOR, [sampledColor]);
     //   }
     // }
   // };


  ns.MapLabel.prototype.draw = function (color, col, row, frame, overlay) {
    frame.setCurrentMapLabelLocation([col, row])
  };
})();
