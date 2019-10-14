import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';

const CartoLight = new TileLayer({
    source: new XYZ({
        url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attributions: [
            '© <a href="https://carto.com/attributions">CARTO</a> ' +
            '© <a href="https://www.osm.org/copyright">OpenStreetMap contributors</a>'
        ],
        crossOrigin: 'anonymous'
    }),
    title: 'Light (CARTO)',
    name: 'CartoLight',
    type: 'base',
    theme: 'light',
    visible: false
});

export default CartoLight;