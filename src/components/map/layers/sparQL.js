import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';

let sparQLayer =
    new VectorLayer({
        name: 'SparQL',
        title: 'SparQL',
        visibility: true,
        source: new VectorSource({
        })
    });

export default sparQLayer;