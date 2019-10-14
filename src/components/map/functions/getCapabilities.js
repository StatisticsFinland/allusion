/* XML to JSON data parser */
import fastXmlParser from 'fast-xml-parser';
import { makeCopy } from '../../../globals';

const getCapabilities = (url, layer) => {

    return new Promise((resolve, reject) => {
        fetch(url).then(response => response.text()
        ).then(xml => {
            let result = fastXmlParser.parse(xml);
            let availableLayers = result[Object.keys(result)[0]].FeatureTypeList.FeatureType;
            let layerKeys = Object.keys(availableLayers[0]);
            let namekey = layerKeys.find(key => ['name', 'Name', 'NAME'].includes(key));

            /* let bboxkey = layerKeys.find(key => ['WGS84', 'BoundingBox', 'box', 'Box', 'BOX', 'Bounding', 'BOUNDING', 'bounding'].some(searchKey => key.includes(searchKey)));
            let rawExtent = availableLayers[0][bboxkey];
            let extentKeys = Object.keys(rawExtent);
            let lowerKey = extentKeys.find(key => ['lower','LOWER','Lower'].some(searchKey => key.includes(searchKey)));
            let upperKey = extentKeys.find(key => ['upper','UPPER','Upper'].some(searchKey => key.includes(searchKey)));
            let xymin = rawExtent[lowerKey].split(' ').map(coord => parseFloat(coord));
            let xymax = rawExtent[upperKey].split(' ').map(coord => parseFloat(coord));
            layer.extent = [...xymin, ...xymax]; */

            layer = makeCopy(layer);
            layer.name = availableLayers[0][namekey];

            resolve({
                availableLayers: availableLayers,
                layer: layer
            })
        }).catch(error => {
            console.log('Error:', error)
            reject({ alert: true });
        });
    })
}


export default getCapabilities;