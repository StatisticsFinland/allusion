/* Controller for fetching municipality / region related information*/

/* URL for feching regions and municipalities (MML) */
import WKT from "ol/format/WKT";
import {EPSG3067} from "../components/map/projection/projections";

const baseUrl = 'https://statfin-rdf-dev.azurewebsites.net/igalod/query';
const geomUrl = 'http://193.167.189.160/igalod/fuseki/ds/query';

const generateReguest = (uri, query) => {
  const request = new Request(uri, {
    method: 'POST',
    body: new URLSearchParams(encodeURI(`query=${query}`)),
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  });

  return fetch(request);
};


const RegionController = {
  getRegionsAndMunicipalities(sparqlQuery) {
    return generateReguest(baseUrl, sparqlQuery);
  },
  getGeometriesForMunicipalities(sparqlQuery) {
    return generateReguest(geomUrl, sparqlQuery);
  },
  parseRegionsAndMunicipalities(jsons) {
    const format = new WKT();
    let munRegFeatures = [];

    let geoms = {};
    jsons[1].results.bindings.forEach(item => geoms[item.code.value] = item.wkt.value);

    let muns = jsons[0].results.bindings.map(item => {
      return {
        'firstCode': item.municipalityCode.value,
        'first': item.municipalityName.value,
        'secondCode': item.regionCode.value,
        'second': item.regionName.value,
        "secondNUTS": item.regionNUTS.value.split('.')[3],
        "third": item.areaName.value,
        "thirdCode": item.areaCode.value,
        "thirdNUTS": item.areaNUTS.value.split('.')[3],
        "wkt": geoms[item.municipalityCode.value]
      };
    });

    let keys = ['firstCode', 'first', 'secondCode', 'second', "secondNUTS", "third", "thirdCode", "thirdNUTS"];

    muns.forEach(mun => {
      const feature = format.readFeature(mun.wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: EPSG3067
      });
      keys.forEach(key => {
        feature.set(key, mun[key]);
      });
      munRegFeatures.push(feature);
    });

    return munRegFeatures;
  }
};


export default RegionController;
