let vectorInfo = (map, event, lyrs = null, selectedFeatures = null) => {

    let featureInfo = [];
    let layers = null;

    /* replace with instanceofs */
    if (lyrs) {
        layers = lyrs.filter(
            layer =>
                layer.constructor.name === 'VectorTileLayer' ||
                layer.type === 'VECTOR' ||
                layer.get('type') === 'VECTOR_LAYER' ||
                layer.type === "VECTOR_TILE" ||
                layer.get('type') === 'VECTOR_TILE'
        );
    }

    return new Promise((resolve, reject) => {

         if (layers.length === 0) {
            resolve({ featureInfo: [] });
        } else {

            layers.forEach((layer, layerIndex) => {

                let name = layer.get('name') || layer.get('title') || 'Unnamed layer';

                featureInfo.push({
                    layer: name,
                    features: []
                })

                let features;
                if (!selectedFeatures) {
                    if (Array.isArray(event) && event.length === 2) {
                        features = map.getFeaturesAtPixel(event, {
                            layerFilter: queriedLayer => queriedLayer === layer
                        });
                    } else if (!event) {
                        features = layer.getSource().getFeatures();
                    } else {
                        features = map.getFeaturesAtPixel(event.pixel, {
                            layerFilter: queriedLayer => queriedLayer === layer
                        });
                    }
                } else if (selectedFeatures) {
                    features = selectedFeatures.filter(feature => {
                        if (event) {
                            if (event.type === 'select') {
                                let selectLayer = event.target.getLayer(feature);
                                return selectLayer === layer;
                            } else if (event.type === 'boxend' || event === 'time' || event === 'variableChange') {
                                return true
                            }
                        } else {
                            return true
                        }
                    });
                }

                if (features) {
                    features.forEach((feature, featureIndex) => {
                        featureInfo[layerIndex].features.push({
                            feature: featureIndex,
                            properties: feature.getProperties()
                        });
                        if (featureIndex === features.length - 1) {
                            resolve({ featureInfo: featureInfo });
                        }

                    })
                } else {
                    resolve({ featureInfo: [] });
                }
            })
        }
    })
}

export default vectorInfo;