import uuidv4 from "./functions/uuid";
import GeoJSON from "ol/format/GeoJSON";
import {EPSG3067} from "./projection/projections";
import union from "@turf/union";
import combine from "@turf/combine";
import * as _ from "lodash";
import {featureUnionFieldAliases} from "../../globals"

class FeatureUnion {
  constructor(id, name, selection = []) {
    this.id = id;
    this.name = name;
    this.selection = selection;
    this.activated = false;
  }

  activate() {
    this.activated = true;
  }

  deactivate() {
    this.activated = false;
  }

  setActive(state) {
    if (state) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  asObject(namePrefix = "") {
    return {name: namePrefix + this.name, selection: this.selection};
  }

  /* Function to calculate aggregated  of the features */
  calculateAggregatedProperties(features, statisticalField) {
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

    let properties = {'customAreaName': this.name};

    let fieldAliases = [...featureUnionFieldAliases, {
      field: statField,
      composedFrom: [statField],
      type: 'num'
    }];

    fieldAliases
        .filter(fieldAlias => allProperties[fieldAlias.composedFrom[0]])
        .forEach(fieldAlias => {
          let value;
          if (fieldAlias.type === 'num') {
            const numVals = _.filter(allProperties[fieldAlias.composedFrom[0]], v => !isNaN(v));
            value = numVals.length ? _.reduce(numVals, (r, v) => r + parseFloat(v), 0.0) :
                allProperties[fieldAlias.composedFrom[0]][0];
          } else {
            if (fieldAlias.composedFrom.length === 2) {
              let values = [];
              for (const i of Array(allProperties[fieldAlias.composedFrom[0]].length).keys()) {
                values.push(
                    `${allProperties[fieldAlias.composedFrom[0]][i]} (${allProperties[fieldAlias.composedFrom[1]][i]})`);
              }
              value = _.join(values, ", ");
            } else {
              value = _.join(allProperties[fieldAlias.composedFrom[0]], ", ");
            }
          }
          properties[fieldAlias.field] = value;
        });

    if (properties[statField] && properties['landArea']) {
      properties[statField + "_km2"] = properties[statField] / properties['landArea'];
    } else if (properties[statField] === null) {
      properties[statField + "_km2"] = null;
    }

    properties.originalProperties = allProperties;

    return properties;
  };

  /* Function to calculate union of the features */
  getUnionFromFeatures(features, statisticalField) {
    let format = new GeoJSON();
    if (features.length < 2) {
      if (features.length === 1) {
        features[0].set('customAreaName', this.name);
        features[0].set('originalProperties', features[0].getProperties());
      }
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
    Object.keys(unionFeature.getProperties())
        .filter(field => field !== 'geometry')
        .forEach(field => unionFeature.unset(field, true));
    unionFeature.setProperties(this.calculateAggregatedProperties(features, statisticalField));
    unionFeature.getGeometry().transform('EPSG:4326', EPSG3067.getCode());

    return unionFeature;
  };

}

class ModifiableFeatureUnion extends FeatureUnion {
  constructor(name, selection) {
    super(uuidv4(), name, selection);
    this.beingModified = false;
  }

  startModifying() {
    this.beingModified = true;
    this.activate();
  }

  saveModifications(name, selection) {
    this.beingModified = false;
    this.name = name;
    this.selection = selection;
  }
}


export {FeatureUnion, ModifiableFeatureUnion};