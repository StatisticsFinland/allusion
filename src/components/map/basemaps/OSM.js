import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';

const OSM = new TileLayer({
    source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attributions: [
            '© <a href="https://www.osm.org/copyright">OpenStreetMap contributors</a>'
        ],
        crossOrigin: 'anonymous'
    }),
    title: 'OpenStreetMap',
    name: 'OSM',
    type: 'base',
    theme: 'light',
    visible: false
});

export default OSM;
