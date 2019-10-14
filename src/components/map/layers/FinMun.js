import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {all as loadingstrategy} from 'ol/loadingstrategy';

const url = 'https://www.webigu.fi/geoserver/igalod/ows?service=WFS&version=1.0.0&request=GetFeature',
    layer = 'igalod:kunnat',
    proj = 'EPSG:3067',
    format = 'application/json';

const source = new VectorSource({
    format: new GeoJSON(),
    url: `${url}&typename=${layer}&outputFormat=${format}&srsname=${proj}`,
    strategy: loadingstrategy
});

const FinMun = new VectorLayer({
    source: source,
    title: 'FinMun',
    name: 'FinMun',
    type: 'filter',
    style: null,
    visible: true
});

export default FinMun;