let parseFeatureInfo = (featureInfo, filterKey, blackList) => {

    let layerCache = [];
    let properties = [];

    if (Array.isArray(featureInfo)) {

        if (filterKey && filterKey !== '') {
            featureInfo = featureInfo.filter(
                layer => Object.keys(layer.features[0].properties).indexOf(filterKey) > -1);
        }

        featureInfo.forEach(layer => {
            let features = layer.features;
            if (Array.isArray(features) && features.length > 0) {
                features.forEach(feature => {
                    let id = feature.feature;
                    if (layerCache === [] || !layerCache.includes(id)) {
                        layerCache.push(id);
                        let featureProperties = feature.properties;
                        blackList && blackList.map(key => delete featureProperties[key]);
                        featureProperties.LAYERTITLE = layer.layer;
                        properties.push(featureProperties);
                    }
                })
            }
        })
    }

    return properties;

}

export default parseFeatureInfo;