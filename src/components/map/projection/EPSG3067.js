import Projection from 'ol/proj/Projection';
import { register } from 'ol/proj/proj4.js';
import proj4 from 'proj4';

proj4.defs('EPSG:3067', '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs');
register(proj4);

const EPSG3067 = new Projection({
    code: 'EPSG:3067',
    extent: [-1948576, 6291456, 1948576, 8388608],
    units: 'm'
});

export default EPSG3067;