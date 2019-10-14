import { makeCopy, srs } from '../../../globals';
const queryString = require('query-string');

const getFeature = (url, lyr) => {

    return new Promise((resolve, reject) => {

        let layer = makeCopy(lyr);
        let format = 'application/json';
        let limit = 1000;

        let parsed = queryString.parseUrl(url);
        if (parsed.query.request) {
            let query = {
                service: parsed.query.service || parsed.query.Service || parsed.query.SERVICE,
                request: 'GetFeature',
                typeName: layer.name ? layer.name : parsed.query.typeName || parsed.query.typename || parsed.query.TypeName || parsed.query.TYPENAME || parsed.query.TypeName,
                srsName: srs,
                outputFormat: format
            }
            let queryUrl = `${parsed.url}?${queryString.stringify(query)}`

            fetch(queryUrl).then(response => response.json()).then(json => {
                let features = json.features;
                layer.style.fieldValues = [];
                layer.style.fieldSelection = '';
                layer.style.numClasses = 5;
                layer.style.geom = features[0].geometry.type;
                layer.url = queryUrl;
                let data = features.map(feature => feature.properties);
                resolve({
                    data: data,
                    layer: layer,
                    alert: features.length >= limit ? features.length : false
                })
            }).catch(error => {
                console.log('Error:', error)
                reject({ alert: true });
            });

        } else {
            reject({ alert: true });
        }
    })
}

export default getFeature;