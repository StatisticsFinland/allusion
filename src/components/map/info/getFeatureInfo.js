import vectorInfo from './vectorInfo';
import rasterInfo from './rasterInfo';

const getFeatureInfo = (event, map, features = null, coordinates = null) => {

    let layers = map.getLayers().getArray().filter(layer => layer.getVisible() && layer.getProperties().type !== 'base' && layer.getProperties().type !== 'filter');
    let format = 'application/json';
    let resolution = map.getView().getResolution();
    let promises = [];

    if (coordinates) {
        if (event === 'time' || event === 'variableChange') {
            event = map.getPixelFromCoordinate(coordinates);
        }
        promises.push(
            vectorInfo(map, event, layers)
    );

    } else if (Array.isArray(features) && features.length > 0) {
        promises.push(vectorInfo(map, event, layers, features));
    } else {
        if (layers.length === 1 && !event) {
            promises.push(vectorInfo(map, null, layers));
        }
    }
    
    return new Promise((resolve, reject) => {
        Promise.all(promises).then(results => {
            let merge = results.reduce((acc, result) => {
                result.featureInfo.length !== 0 && acc.push(...result.featureInfo);
                return acc;
            }, []);
            resolve(merge);
        }).catch(error => {
            reject({ error: error });
        })
    })
}

export default getFeatureInfo;