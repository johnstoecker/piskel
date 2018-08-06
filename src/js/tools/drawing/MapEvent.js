/**
 * @provide pskl.tools.drawing.Circle
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.MapEvent = function() {
    ns.SimplePen.call(this);

    this.toolId = 'tool-map-event';
    this.helpText = 'Map Event';

    this.tooltipDescriptors = [
      {description : 'Add narration text to this frame, appears above the map. Optionally attach to a map location by clicking any pixel'}
    ];


    // TODO: make map event
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.MAP_EVENT;
  };

  pskl.utils.inherit(ns.MapEvent, ns.SimplePen);
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


  ns.MapEvent.prototype.draw = function (color, col, row, frame, overlay) {
    frame.setMapEventLocation([col, row])
    console.log('pop up map event dialog')
    console.log(' '+col+' '+row)
    console.log(frame)
  };
})();
