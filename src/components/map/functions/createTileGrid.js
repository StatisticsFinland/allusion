import { getWidth, getTopLeft } from 'ol/extent.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

const createTileGrid = (projection, tileSize = 256, ids = 'default') => {

    let projectionExtent = projection.getExtent();
    let size = getWidth(projectionExtent) / tileSize;
    let resolutions = new Array(16);
    let matrixIds = {
        default: new Array(16),
        MML: new Array(16)
    }

    for (var z = 0; z < 16; z++) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds.default[z] = `${projection.getCode()}:${z}`;
        matrixIds.MML[z] = z;
    }

    const tileGrid = new WMTSTileGrid({
        tileSize: [tileSize, tileSize],
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds[ids]
    })

    return tileGrid;

};

export default createTileGrid;