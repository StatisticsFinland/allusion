const vectorTileSelection = (map, layers) => {

  let selectionLayer = layers;
  // a DragBox interaction used to select features by drawing boxes

  dragBox.on('boxend', () => {
    let extent = dragBox.getGeometry().getExtent();
    selectionLayer.setExtent(extent);
    //let tiles = selectionLayer.getFeatures();
  });

  // clear selection when drawing a new box and when clicking on the map
  dragBox.on('boxstart', () => {
   // selectionLayer = layer;
  });

}

export default vectorTileSelection;