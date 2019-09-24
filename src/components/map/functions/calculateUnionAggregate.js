import union from '@turf/union'
import combine from '@turf/combine'
import GeoJSON from "ol/format/GeoJSON";
import {EPSG3067} from "../projection/projections";
import * as _ from 'lodash';


/* Function to calculate union of the features */
const calculateUnionAggregate = features => {
  let format = new GeoJSON();

  if (features.length < 2) {
    return features[0];
  }

  let featureCollection = format.writeFeaturesObject(features, {'featureProjection': EPSG3067.getCode()});

  let properties = _.reduce(_.map(featureCollection.features, 'properties'), (result, value) => {
    _.forOwn(value, (val, key) => {
      (result[key] || (result[key] = []));
      if (!_.includes(result[key], val)) {
        result[key].push(val)
      }
    });
    return result;
  }, {});


  let result = null;
  if (featureCollection.features.length > 2) {

    let last = featureCollection.features.pop();
    let multiPoly = combine(featureCollection).features[0];
    result = union(last, multiPoly);
  } else {
    result = union(featureCollection.features[0], featureCollection.features[1]);
  }
  result.properties = properties;

  let feature = format.readFeature(result);
  feature.getGeometry().transform('EPSG:4326', EPSG3067.getCode());
  return feature;
};

export default calculateUnionAggregate;