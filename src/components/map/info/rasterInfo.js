let rasterInfo = (layers, projection, coordinates, resolution, format) => {

    return new Promise((resolve, reject) => {

        let featureInfo = [];
        layers = layers.filter(layer => ['TileLayer', 'ImageLayer'].includes(layer.constructor.name));

        if (layers.length === 0) {
            resolve({ featureInfo: [] });
        } else {
            layers.forEach((layer, index) => {

                let name = layer.get('name') || layer.get('title');

                let source = layer.getSource();
                let queryLayers = source.getParams().LAYERS || source.getParams().layers || source.getParams().Layers;

                if (queryLayers) {
                    queryLayers.forEach((queryLayer, layerIndex) => {

                        featureInfo.push({
                            layer: queryLayers.length === 1 ? name || queryLayer : name ? `${name} - ${queryLayer}` : queryLayer,
                            features: []
                        })

                        let options = { 'INFO_FORMAT': format, 'QUERY_LAYERS': queryLayer, 'FEATURE_COUNT': 50 };
                        let url = source.getGetFeatureInfoUrl(coordinates, resolution, projection, options);

                        fetch(url).then(response => response.json()
                        ).then(json => {
                            if (json.features.length > 0) {
                                let features = json.features;
                                features.forEach((feature, featureIndex) => {
                                    let properties = feature.properties;
                                    featureInfo[layerIndex].features.push({
                                        feature: featureIndex,
                                        properties: properties
                                    });
                                    if (index === layers.length - 1 && layerIndex === queryLayers.length - 1 && featureIndex === features.length - 1) {
                                        resolve({ featureInfo: featureInfo })
                                    }
                                })
                            }
                        }).catch(error => {
                            console.log(error);
                            if (index === layers.length - 1 && layerIndex === queryLayers.length - 1) {
                                resolve({ featureInfo: featureInfo })
                            }
                        });
                    })
                } else {
                    if (index === layers.length - 1) {
                        resolve({ featureInfo: featureInfo });
                    }
                }

            })
        }
    })
}

export default rasterInfo;