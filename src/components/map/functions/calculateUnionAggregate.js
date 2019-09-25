import union from '@turf/union'
import combine from '@turf/combine'
import GeoJSON from "ol/format/GeoJSON";
import {EPSG3067} from "../projection/projections";
import * as _ from 'lodash';

/* Function to calculate aggregated  of the features */
const calculateAggregatedProperties = (features, statisticalField) => {
  let statField = statisticalField.replace("_km2", "");

  let allProperties = _.reduce(_.map(features, f => f.getProperties()), (result, value) => {
    _.forOwn(value, (propVal, propKey) => {
      if (propKey !== 'geometry') {
        (result[propKey] || (result[propKey] = []));
        if (!_.includes(result[propKey], propVal)) {
          result[propKey].push(propVal)
        }
      }
    });
    return result;
  }, {});

  let properties = _.reduce(allProperties, (res, propVals, propKey) => {
    if (propVals.length) {
      if (propKey === 'landArea' || propKey === statField) {
        const numVals = _.filter(propVals, v => !isNaN(v));
        res[propKey] = numVals.length ? _.reduce(numVals, (r, v) => r + parseFloat(v), 0.0) : propVals[0];
      } else {
        res[propKey] = _.join(propVals, ", ");
      }
    }
    return res;
  }, {});

  if (properties[statField] && properties['landArea']) {
    properties[statField + "_km2"] = properties[statField] / properties['landArea'];
  } else if (properties[statField] === null) {
    properties[statField + "_km2"] = null;
  }

  //TODO: Include the original properties
  // properties.orig = allProperties;

  return properties;
};


/* Function to calculate union of the features */
const calculateUnionAggregate = (features, statisticalField) => {
  let format = new GeoJSON();
  if (features.length < 2) {
    return features[0];
  }

  let unionFeatureTurf = null;
  let featureCollection = format.writeFeaturesObject(features, {'featureProjection': EPSG3067.getCode()});
  if (featureCollection.features.length > 2) {
    let last = featureCollection.features.pop();
    unionFeatureTurf = union(last, combine(featureCollection).features[0]);
  } else {
    unionFeatureTurf = union(featureCollection.features[0], featureCollection.features[1]);
  }

  let unionFeature = format.readFeature(unionFeatureTurf);
  unionFeature.setProperties(calculateAggregatedProperties(features, statisticalField));
  unionFeature.getGeometry().transform('EPSG:4326', EPSG3067.getCode());

  return unionFeature;
};

export default calculateUnionAggregate;