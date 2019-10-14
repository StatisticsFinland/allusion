import OSM from './OSM';
import CartoLight from './CartoLight';
import { taustakartta } from './MML';

/* Choose basemaps */
let Basemaps = [taustakartta, CartoLight, OSM];

/* This converts the above basemap array into an array of objects with keys "layer, name, title" with values from map layers */
function convert(array) {
    return array.reduce((acc, layer) => {
        acc.push({
            layer: layer,
            name: layer.getProperties().name,
            title: layer.getProperties().title
        }); return acc;
    }, [])
}

export default Basemaps = convert(Basemaps);