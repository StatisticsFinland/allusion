/* OpenLayers */
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import getJson from './getJson';
import createStyle from './createStyle';
import { bbox as loadingstrategy } from 'ol/loadingstrategy';

/* Function for generating OpenLayers layer */
const createLayer = (layer, projection, time = null) => {

    return new Promise((resolve, reject) => {

        let vectorSource = new VectorSource({
            loader: function () {
                const format = new GeoJSON();
                getJson(layer.url, '', response => {
                    if (Object.keys(response).length > 0) {
                        let features = format.readFeatures(response);
                        this.addFeatures(features);
                    }
                });
            },
            strategy: loadingstrategy
        })

        const WFS = new VectorLayer({
            source: vectorSource,
            style: createStyle(layer.style, time),
            title: layer.title,
            uuid: layer.uuid,
            visible: layer.visible
        });

    })
}

export default createLayer;