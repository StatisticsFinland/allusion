import queryString from 'query-string';
import fastXmlParser from 'fast-xml-parser';
import { srs } from './../../../globals'

const getTileUrl = (layer, projection = null) => {

    return new Promise(resolve => {

        if (layer) {
            let parsed = queryString.parse(layer.url);
            let typename = parsed.typeName || parsed.TypeName || parsed.typename || parsed.TYPENAME;
            let srsName = parsed.srsName || parsed.SrsName || parsed.srsname || parsed.SRSNAME || (projection ? projection.getCode() : srs);
            let version = '1.0.0';
            let rootURL = layer.url.split('geoserver')[0] + 'geoserver';
            let baseURL = `${rootURL}/gwc/service/tms/${version}`;

            fetch(baseURL).then(response => response.text()).then(
                text => {
                    let parsedXML = fastXmlParser.parse(text, { ignoreAttributes: false, parseAttributeValue: true, attributeNamePrefix: '' });
                    let typenames = [...new Set(parsedXML.TileMapService.TileMaps.TileMap.map(tiles => tiles.href).filter(hrefs => hrefs.includes('pbf') && hrefs.includes(srsName.split(':')[1])))];

                    typenames = typenames.map(tn =>
                        tn.substring(tn.lastIndexOf("/") + 1, tn.lastIndexOf("@")).replace('%3A', ':').split('@')[0]
                    )

                    let parsedTypenames = [... new Set(typenames.map(tn => tn.split(':')[1]))];
                    let parsedTypename = '';

                    if (typename.includes(':')) {
                        parsedTypename = typename.split(':')[1]
                    }

                    let searchKeys = [typename, parsedTypename];
                    let searchable = [...new Set([...typenames, ...parsedTypenames])]
                    let match = searchKeys.some(s => searchable.includes(s))

                    if (match) {
                        let url = `${baseURL}/${typename}@${srsName}@pbf/{z}/{x}/{-y}.pbf`;
                        resolve({ url: url })
                    } else {
                        resolve({ url: null })
                    }
                }).catch(error => {
                    console.log(error);
                    resolve({ url: null })
                })

        } else {
            resolve({ url: null })
        }
    })
}

export default getTileUrl;