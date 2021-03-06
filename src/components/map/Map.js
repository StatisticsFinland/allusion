import React, {Component} from 'react';
import Hidden from '@material-ui/core/Hidden';
import * as _ from 'lodash';
import colormap from 'colormap';
/* OpenLayers */
import OLMap from 'ol/Map';
import View from 'ol/View';
import {transform} from 'ol/proj.js';
import {defaults as defaultInteractions} from 'ol/interaction.js';

import {blackList, defaults, fieldAliases, isEmpty, makeCopy, srs} from '../../globals';
import {EPSG3067} from './projection/projections';
import Basemaps from './basemaps/Basemaps';
import Layers from './layers/Layers';
import {FinMun, invisibleStyle, visibleStyle} from './layers/FinMun';
import ZoomIn from './zoom/ZoomIn';
import ZoomOut from './zoom/ZoomOut';
import getFeatureInfo from './info/getFeatureInfo';
import parseFeatureInfo from './info/parseFeatureInfo';
import calculateBreaks from './functions/calculateBreaks';
import createStyle from './functions/createStyle';
import MapPopover from './info/MapPopover';
import InfoDrawer from './info/InfoDrawer';
import {munBorderSelect, select} from './info/select';
import dragBox from './info/dragBox';
import SearchDialog from './search/SearchDialog';
import LayerDrawer from './LayerDrawer';
import Spinner from './../Spinner';

import {numericSort} from 'simple-statistics'
import chroma from 'chroma-js';
import Legend from './Legend';
import {FeatureUnion, ModifiableFeatureUnion} from './FeatureUnion';
import uuid from "./functions/uuid";
import queryString from 'query-string';
import flatten from "lodash/flatten";
import {defaultLanguage} from "../localization/languages";


let interactions = defaultInteractions({altShiftDragRotate: false, pinchRotate: false});

/* Initiate basemaps */
let BasemapSel = Basemaps.map(layer => layer["layer"]);
let LayerSel = Layers.map(layer => layer["layer"]);

let selectedFeatures;
let selectionCoordinates;
let selectionExtent;

class Map extends Component {

  state = {
    basemap: "Taustakartta",
    basemapOpacity: 0.75,
    filter: {
      layer: FinMun,
      first: 'first',
      second: 'second',
    },
    zoomFactor: 0.1,
    layerOpacity: 1,
    featureInfo: '',
    popOpen: false,
    popX: 0,
    popY: 0,
    popXmargin: 20,
    popYmargin: 10,
    loading: false,
    selection: [],
    savedAreas: [],
    savedFeatureUnions: [],
    regionFeatureUnions: [],
    majorRegionFeatureUnions: [],
    savedCustomAreas: [],
    variable: '',
    selectedLayer: null,
    relativeToArea: false,
    municipalityBordersVisible: FinMun.get('linesVisibleInitially'),
    munRegLanguage: defaultLanguage
  };

  view = new View({
    projection: EPSG3067,
    center: [400000, 7200000],
    zoom: 3.5,
    maxZoom: 12,
    minZoom: 2
  });

  /* Initiate map */
  map = new OLMap({
    layers: [...BasemapSel, FinMun, ...LayerSel],
    view: this.view,
    controls: [],
    interactions: interactions
  });

  componentWillUnmount() {
    this.map.setTarget(undefined);
    /* Unbind Map instance to App for function calls */
    this.props.onRef(undefined);
  }

  /* Takes a bit for url parameters to pass down from App
     -> do stuff with parameters here after they have arrived */
  componentDidUpdate(prevProps, prevState) {
    let urlInput = this.props.urlParameters;
    if (urlInput !== null && urlInput !== prevProps.urlParameters) {
      urlInput.zoom && this.view.setZoom(urlInput.zoom);
      urlInput.center && this.view.setCenter(urlInput.center);
      urlInput.basemap && this.changeBasemap(null, urlInput.basemap);
      urlInput.basemapOpacity && this.changeBasemapOpacity(null, urlInput.basemapOpacity);
      urlInput.layerOpacity && this.changeLayerOpacity(null, urlInput.layerOpacity);
    }
    /* If a layer has been selected while the list of layers changes, reselect the layer */
    const layersLength = this.props.layers.length;
    if (layersLength !== 0 && layersLength !== prevProps.layers.length) {
      const prevLayer = this.props.selectedLayer;
      const urlQueryLayer = urlInput.layer;
      if (prevLayer) {
        /* Verify that the previous layer still exists in the updated props.layers */
        let index = this.props.layers.map(layer => layer.uuid).indexOf(prevLayer.uuid);
        if (index !== -1) {
          this.setSelection(prevLayer.uuid);
        }
        /* Other case for selecting layer based on props is in the case of URL query */
      } else if (urlInput && urlInput.layer) {
        this.setSelection(urlInput.layer);
      }
    }
  };

  componentDidMount() {
    /* Binds Map instance to App for function calls */
    this.props.onRef(this);
    this.map.setTarget(this.mapDiv);
    this.map.addInteraction(select);
    this.map.addInteraction(munBorderSelect);
    this.map.addInteraction(dragBox);

    /* Set initial basemap and layer stuff */
    this.changeBasemap();
    this.changeBasemapOpacity();
    this.changeLayerOpacity();

    /* Map click events */
    this.map.on('singleclick', event => {
      if ((!select.getActive() && !munBorderSelect.getActive()) ||
          (select.getFeatures().getArray().length === 0 && munBorderSelect.getFeatures().getArray().length === 0)
      ) {
        selectionCoordinates = event.coordinate;
        this.getFeaturesByCoordinates(event, selectionCoordinates);
        this.pop();
      }
    });

    /* this.map.on('moveend', () => { this.pop() }); */

    /* Map selection interaction */
    select.on('select', event => {
      selectedFeatures = event.target.getFeatures().getArray();
      selectionCoordinates = null;

      getFeatureInfo(event, this.map, selectedFeatures).then(featureInfo => {
        this.pop(event, parseFeatureInfo(featureInfo, '', blackList.map));
      })
    });

    /* Map selection interaction with municipality borders*/
    munBorderSelect.on('select', event => {
      function selectDeselectMuni(code, selection) {
        let activeUnionCodes = _.flatten(
            _.flatten([this.state.savedCustomAreas.filter(f => !f.beingModified),
              this.state.regionFeatureUnions, this.state.majorRegionFeatureUnions])
                .filter(f => f.activated)
                .map(f => f.selection));

        if (!_.includes(activeUnionCodes, code)) {
          !_.includes(selection, code) ? this.drawerRef.catRef.addRemoveFromSelection([code])
              : this.drawerRef.catRef.addRemoveFromSelection([], [code]);
        }
        event.target.getFeatures().clear();
      }

      if (event.target.getFeatures().getArray().length) {
        let code = event.target.getFeatures().getArray()[0].get("firstCode");
        if (code) {
          selectDeselectMuni.call(this, code, this.state.selection);
        } else {
          let codes = this.map.getFeaturesAtPixel(this.map.getPixelFromCoordinate(event.mapBrowserEvent.coordinate), {
            layerFilter: queriedLayer => queriedLayer.getProperties().name === 'Municipalities'
          }).map(feature => feature.get("firstCode"));
          if (codes && codes.length) {
            selectDeselectMuni.call(this, codes[0], this.state.selection);
          }
        }
      }
    });

    dragBox.on('boxend', event => {
      selectionExtent = dragBox.getGeometry().getExtent();
      selectionCoordinates = null;
      this.getFeaturesByExtent(event, selectionExtent);
    });

    dragBox.on('boxstart', () => {
      selectionExtent = null;
      //   select.getFeatures().forEach(feature => feature.setStyle(createStyle(this.state.selectedLayer.style, null, false)))
      select.getFeatures().clear();
    });

    this.addCustomAreasFromQuery(window.location.search);

  }

  getFeaturesByExtent = (event, extent) => {
    selectionCoordinates = null;
    selectedFeatures = [];
    let layers = this.map.getLayers().getArray();
    let layer = layers.find(layer => layer.get('name') === 'SparQL');
    let source = layer.getSource();
    if (layer.type === "VECTOR" || layer.get('type') === 'VECTOR_LAYER') {
      selectedFeatures = select.getFeatures();
      source.forEachFeatureIntersectingExtent(extent, feature => {
        //feature.setStyle(createSelectionStyle(this.props.selectedLayer.style))
        selectedFeatures.push(feature);
        console.log(feature);
      });
      //  selectedFeatures.forEach(feature => feature.setStyle(createStyle(this.state.selectedLayer.style, null, true)))
      getFeatureInfo(event, this.map, selectedFeatures.getArray()).then(featureInfo => {
        this.pop(event, parseFeatureInfo(featureInfo, '', blackList.map));
      })
    }
  };

  getFeaturesByCoordinates = (event, coordinates) => {
    selectionExtent = null;
    selectedFeatures = null;
    getFeatureInfo(event, this.map, null, coordinates).then(featureInfo => {
      this.pop(event, parseFeatureInfo(featureInfo, '', blackList.map));
    })
  };

  /* Basemap switcher */
  changeBasemap = (event, value = this.state.basemap) => {
    this.setState({basemap: value});
    let basemaps = this.map.getLayers().getArray().filter(layer => layer.get('type') === 'base');
    basemaps.forEach(basemap => {
      if (basemap.get('name') === value) {
        basemap.setVisible(true);
        /* Change Material-UI theme colour according to basemap colour */
        basemap.get('theme') !== this.props.theme.palette.type && this.props.switchTheme();
      } else {
        basemap.setVisible(false);
      }
    })
  };

  /* Change basemap opacity */
  changeBasemapOpacity = (event, value = this.state.basemapOpacity) => {
    this.setState({basemapOpacity: value});
    let basemaps = this.map.getLayers().getArray().filter(layer => layer.get('type') === 'base');
    basemaps.forEach(basemap => basemap.setOpacity(value));
  };

  changeLayerOpacity = (event, value = this.state.layerOpacity) => {
    this.setState({layerOpacity: value});
    let layers = this.map.getLayers().getArray().filter(layer => layer.get('type') !== 'base');
    layers.forEach(layer => layer.setOpacity(value));
  };

  /* Zoom */
  zoom = to => {
    let zoom = this.view.getZoom();
    to === 'in' ? zoom += this.state.zoomFactor : zoom -= this.state.zoomFactor;
    this.view.setZoom(zoom);
  };

  updateStatsFromApp = (pop) => {
    const layer = this.getLayerByName('SparQL');
    const features = layer.getSource().getFeatures();
    getFeatureInfo(null, this.map).then(featureInfo => {
      if (selectedFeatures) {
        this.handleSelectedFeatures(features);
      } else {
        this.setState({featureInfo: parseFeatureInfo(featureInfo, '', blackList.map)}, () => {
          pop && this.props.toggleInfoDrawer(true)
        });
      }
    })
  };

  /* Map PopOver */
  pop = (event, featureInfo) => {

    if (event && !['time', 'variableChange'].includes(event)) {
      if (featureInfo.length < 2) {
        let x = event.originalEvent ? event.originalEvent.clientX !== 0 ? event.originalEvent.clientX : event.originalEvent.pageX : event.mapBrowserEvent.pixel[0];
        let y = event.originalEvent ? event.originalEvent.clientY !== 0 ? event.originalEvent.clientY : event.originalEvent.pageY : event.mapBrowserEvent.pixel[1];
        this.setState({
          popX: x + this.state.popXmargin,
          popY: y - this.state.popYmargin,
        }, () => {
          if (featureInfo !== this.state.featureInfo && !isEmpty(featureInfo)) {
            this.setState({popOpen: false}, () => {
              this.props.toggleInfoDrawer(false);
              this.setState({featureInfo}, () => {
                this.setState({popOpen: true});
              })
            })
          } else {
            this.setState({popOpen: false})
          }
        })
      } else {
        this.setState({popOpen: false});
        // this.props.layerDrawerVisibility && this.props.toggleLayerDrawer();
        if (featureInfo !== this.state.featureInfo && !isEmpty(featureInfo)) {
          this.setState({featureInfo}, () => {
            this.props.toggleInfoDrawer(true)
          })
        } else {
          this.props.toggleInfoDrawer(false)
        }
      }
    } else if (event === 'variableChange') {
      if (featureInfo !== this.state.featureInfo && !isEmpty(featureInfo)) {
        this.setState({featureInfo});
        this.props.toggleInfoDrawer(true);
      } else {
        this.setState({popOpen: false});
        this.props.toggleInfoDrawer(false);
      }
    } else {
      this.props.toggleInfoDrawer(false);
      this.setState({popOpen: false});
    }
  };

  /* Functionality for municipality / address search  */
  filterClick = (option, address = null) => {
    if (!address) {
      let target = this.state.filter.layer.getSource().getFeatures().find(item => item.get(this.state.filter.first) === option);
      this.view.fit(target.getGeometry());
      this.view.setZoom(9);
    } else {
      this.view.setCenter(transform(option, 'EPSG:4326', srs));
      this.view.setZoom(13);
    }
    this.props.toggleSearch();
  };

  setVariable = variable => {
    this.setState({variable: this.state.relativeToArea ? `${variable}_km2` : variable}, () => {
    });
  };

  /* Get Map values to App level */
  currentMapValues = () => {
    const x = this.view.getCenter()[0].toFixed(2);
    const y = this.view.getCenter()[1].toFixed(2);
    const z = this.view.getZoom().toFixed(2);
    const basemap = this.state.basemap;
    const basemapOpacity = Number(this.state.basemapOpacity).toFixed(2);
    const layerOpacity = Number(this.state.layerOpacity).toFixed(2);
    const layer = this.props.selectedLayer ? this.props.selectedLayer.uuid : null;
    return {x: x, y: y, z: z, b: basemap, bo: basemapOpacity, lo: layerOpacity, layer: layer};
  };

  prepareStyle = (layer, features, property) => {
    let selectedLayer = makeCopy(this.state.selectedLayer);
    let uniqueValues = [...new Set(features.map(feat => !isNaN(feat.get(property)) ? parseFloat(feat.get(property)) : feat.get(property)))];
    let values = numericSort(uniqueValues);
    let numClasses = values.length > 5 ? 6 : values.length !== 0 ? values.length : 1;

    let style = {
      geom: 'MultiPolygon',
      styling: 'quantitative',
      fieldSelection: property,
      fillVisibility: true,
      strokeVisibility: true,
      fieldValues: [],
      fieldUnit: '',
      fill: '',
      stroke: '',
      strokeWidth: 0.5
    };

    if (this.props.statisticCode === 'NONE') {
      style.styling = 'single';
      style.fill = 'rgba(255,255,255,0.85)';
      style.stroke = 'rgb(0,115,176)';
      style.strokeWidth = 1;
    } else if (values.every(value => !value)) {
      style.fieldValues = ['NAN'];
      style.fill = 'rgba(66,66,66,0.85)';
      style.stroke = 'rgb(255,255,255)';
    } else {

      let rawColors = chroma.scale('Blues').colors(numClasses);
      let colors = rawColors.map(col => {
        let c = chroma(col).rgba();
        return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
      });

      style.fieldValues = calculateBreaks(values, numClasses, 'ckmeans');
      style.fill = colors;
      style.stroke = 'rgba(0,115,176,0.66)';

    }

    selectedLayer.style = style;
    this.setState({selectedLayer});
    layer.setStyle(createStyle(style, null, null, this.state.relativeToArea, this.props.labels));

  };

  getLayerByName = name => {
    return this.map.getLayers().getArray().find(layer => layer.getProperties().name === name);
  };

  changeMuns = (selection, regIds = [], majorRegids = []) => {
    const regionFeatureUnions = this.state.regionFeatureUnions.map(f => {
      f.setActive(regIds.includes(f.id));
      return f;
    });

    const majorRegionFeatureUnions = this.state.majorRegionFeatureUnions.map(f => {
      f.setActive(majorRegids.includes(f.id));
      return f;
    });


    this.setState({selection, regionFeatureUnions, majorRegionFeatureUnions}, () => {
      this.props.handleSelectingMunips(selection);
    });

    if (selection.length === 0) {
      const layer = this.getLayerByName('SparQL');
      let source = layer.getSource();
      source.clear();
      selectedFeatures = null;
      this.setState({
        selectedLayer: null,
        featureInfo: ''
      }, () => {
        if (Array.isArray(select.getFeatures().getArray()) && select.getFeatures().getArray().length !== 0) {
          select.getFeatures().clear();
        }
      })
    }
  };

  changeOwnSelection = (stats) => {
    this.props.changeOwnSelection(stats);
  };

  switchLabels = () => {
    const layer = this.getLayerByName('SparQL');
    const features = layer.getSource().getFeatures();
    this.state.selectedLayer && this.prepareStyle(layer, features, this.state.variable);
  };

  addRegMuns = (regMuns) => {
    let ret = false;
    if (regMuns.length) {
      ret = true;
      const layer = this.getLayerByName('Municipalities');
      let source = layer.getSource();

      if (source.getFeatures().length < regMuns.length || this.state.munRegLanguage !== this.props.munRegLanguage) {
        let regionFeatureUnions = [];
        let majorRegionFeatureUnions = [];

        const object = _.groupBy(regMuns, mun => mun.get('second'));
        _.forOwn(object, (muns, regName) => {
          regionFeatureUnions.push(
              new FeatureUnion(muns[0].get('secondCode'), regName, muns.map(mun => mun.get('firstCode')))
          );
        });

        _.forOwn(_.groupBy(regMuns, mun => mun.get('third')), (muns, regName) => {
          majorRegionFeatureUnions.push(
              new FeatureUnion(muns[0].get('thirdCode'), regName, muns.map(mun => mun.get('firstCode')))
          );
        });

        this.setState({regionFeatureUnions, majorRegionFeatureUnions, munRegLanguage: this.props.munRegLanguage});
      }
      source.clear();
      source.addFeatures(regMuns);
    }
    return ret;
  };

  toggleMunicipalityVisibility = () => {
    const layer = this.getLayerByName('Municipalities');
    const municipalityBordersVisible = !this.state.municipalityBordersVisible;
    if (municipalityBordersVisible) {
      layer.setStyle(visibleStyle);
    } else {
      layer.setStyle(invisibleStyle);
    }
    this.setState({municipalityBordersVisible});
  };


  addFeaturesToMap = (response) => {
    const statisticalVariable = this.state.variable;
    const features = response.features;
    const layer = this.getLayerByName('SparQL');
    let source = layer.getSource();
    source.clear();

    if (this.state.selection.length) {
      this.setState({
        selectedLayer: {
          url: source.getUrl(),
          title: layer.getProperties().title
        }
      }, () => {

        let unionFeatures = this.composeUnionFeatures(features, statisticalVariable);
        if (unionFeatures.length > 0) {
          source.addFeatures(unionFeatures);
        }

        let unionFeatureCodes = [...new Set(_.flatten(unionFeatures.map(f => f.get('originalProperties').municipalityCode)))];
        let remainingFeatures = features.filter(f => !unionFeatureCodes.includes(f.get('municipalityCode')));


        if (remainingFeatures.length > 0) {
          source.addFeatures(remainingFeatures);
        }

        if (selectedFeatures) {
          this.handleSelectedFeatures(features);
        }
        this.prepareStyle(layer, [...source.getFeatures()], statisticalVariable);
      })
    }
  };

  composeUnionFeatures = (features, statisticalVariable) => {
    let unionFeatures = _.flatten(
        [this.state.regionFeatureUnions,
          this.state.majorRegionFeatureUnions,
          this.state.savedCustomAreas])
        .filter(area => area.activated && !area.beingModified)
        .map(union => {
          let unionFeatures = features.filter(feature => _.includes(union.selection, feature.get('municipalityCode')));
          return union.getUnionFromFeatures(unionFeatures, statisticalVariable);
        }).filter(f => f);

    if (!this.props.allowIntersectingFeatures) {
      return unionFeatures;
    }

    let intersectingFeatures = [];
    unionFeatures.forEach(f1 => {
      unionFeatures.forEach(f2 => {
        if (!intersectingFeatures.includes(f2) && f1 !== f2) {
          let op1 = f1.get('originalProperties');
          let op2 = f2.get('originalProperties');
          if (op1 && op2) {
            let intersection = _.intersection(op1.municipalityCode,
                op2.municipalityCode);
            intersection.length > 0 && intersectingFeatures.push(f1, f2);
          }
        }
      })
    });

    intersectingFeatures = [...new Set(intersectingFeatures)].sort((a, b) => b.get('landArea') - a.get('landArea'));
    let normalFeatures = unionFeatures.filter(f => !intersectingFeatures.includes(f));

    if (intersectingFeatures.length > 1) {
      const ramp = colormap({
        colormap: 'hsv',
        format: 'rba',
        nshades: Math.max(11, intersectingFeatures.length),
        alpha: 0.3
      });

      intersectingFeatures.forEach((f, i) => f.set('fillColor', ramp[i], true));
    }
    return _.union(intersectingFeatures, normalFeatures);
  };

  handleSelectedFeatures = features => {
    let selectionArray;
    if (Array.isArray(selectedFeatures)) {
      selectionArray = selectedFeatures;
    } else if (typeof selectedFeatures === 'object') {
      selectionArray = selectedFeatures.getArray();
    }
    let matchingFeatures = features.filter(feature => selectionArray.some(selectedFeature => {
      return selectedFeature.get('municipalityCode') === feature.get('municipalityCode') && feature.get('landArea') === selectedFeature.get('landArea')
    }));
    if (Array.isArray(matchingFeatures) && matchingFeatures.length > 0) {
      select.getFeatures().clear();
      matchingFeatures.forEach(matchingFeature => select.getFeatures().push(matchingFeature));
      getFeatureInfo('variableChange', this.map, matchingFeatures).then(featureInfo => {
        this.pop('variableChange', parseFeatureInfo(featureInfo, '', blackList.map));
      })
    }
  };

  emptyMap = () => {
    this.changeMuns([], [], []);
  };

  saveArea = name => {
    const savedAreas = this.state.savedAreas;
    const selection = [...this.state.selection];
    let areaToSave = {
      id: uuid(),
      name,
      selection
    };
    if (!savedAreas.some(area => area.name === name)) {
      this.setState({savedAreas: [...savedAreas, areaToSave]})
    }
  };

  saveCustomArea = (name, selection = [...this.state.selection]) => {
    const savedCustomAreas = [...this.state.savedCustomAreas];
    let nameCandidate = this.getUniqueName(name, savedCustomAreas);

    let areaToSave = new ModifiableFeatureUnion(nameCandidate, selection);
    this.drawerRef.catRef.emptySelections();
    savedCustomAreas.forEach(f => f.deactivate());
    this.setState({savedCustomAreas: [...savedCustomAreas, areaToSave]});
  };

  getUniqueName(name, savedCustomAreas) {
    const charsToAppend = [...Array(100).keys()].map(k => String(k));
    let nameCandidate = name;
    let i = 1;
    while (savedCustomAreas.some(area => area.name === nameCandidate)) {
      nameCandidate = name + charsToAppend[i];
      i++;
    }
    return nameCandidate;
  }

  saveMultipleCustomAreas = areas => {
    const savedCustomAreas = [...this.state.savedCustomAreas];
    const newAreas = areas.map(area => {
      let nameCandidate = this.getUniqueName(area.name, savedCustomAreas);
      return new ModifiableFeatureUnion(nameCandidate, area.selection);
    });
    if (this.drawerRef) {
      this.drawerRef.catRef.emptySelections();
    }
    this.setState({savedCustomAreas: [...savedCustomAreas, ...newAreas]});
  };

  modifyCustomArea = area => {
    let id = area.id;
    let savedCustomAreas = [...this.state.savedCustomAreas];
    area.startModifying();
    let otherAreas = savedCustomAreas.filter(area => area.id !== id);
    const selection = [...this.state.selection];

    // Deactivate other custom areas
    otherAreas.forEach(area2 => {
      if (area2.activated) {
        area2.deactivate();
      }
    });
    this.drawerRef.catRef.emptySelections();
    this.drawerRef.catRef.addRemoveFromSelection(area.selection, _.difference(selection, area.selection));
    this.setState({savedCustomAreas: [...otherAreas, area]});
  };

  saveCustomAreaModification = (area, name) => {
    let id = area.id;
    let savedCustomAreas = [...this.state.savedCustomAreas];
    let otherAreas = savedCustomAreas.filter(area => area.id !== id);
    const selection = [...this.state.selection];
    area.saveModifications(this.getUniqueName(name, otherAreas), selection);
    this.drawerRef.catRef.addRemoveCustomMunids(area.selection);
    this.setState({savedCustomAreas: [...otherAreas, area]}, () => this.changeMuns(selection));
  };

  toggleCustomAreaActivation = (area, state) => {
    let id = area.id;
    let savedCustomAreas = [...this.state.savedCustomAreas];
    let otherAreas = savedCustomAreas.filter(area => area.id !== id);
    let munisToDeselect = [];
    if (state) {
      area.activate();
      if (!this.props.allowIntersectingFeatures) {
        // Deactivate the custom areas with same municipalities
        otherAreas.forEach(area2 => {
          if (area2.activated && _.intersection(area.selection, area2.selection).length) {
            area2.deactivate();
            munisToDeselect = _.union(munisToDeselect, _.difference(area2.selection, area.selection));
          }
        });
      }
    } else {
      area.deactivate();
    }

    this.setState({savedCustomAreas: [...otherAreas, area]});
    return munisToDeselect;
  };

  addCustomAreasFromExistingUnions = (type) => {
    let existingUnions;
    if (type === 'regions') {
      existingUnions = this.state.regionFeatureUnions;
    } else if (type === 'majorRegions') {
      existingUnions = this.state.majorRegionFeatureUnions;
    } else {
      return false;
    }
    let areasToSave = existingUnions.map(union => union.asObject(defaults.featureUnionPrefix));
    areasToSave.length && this.saveMultipleCustomAreas(areasToSave);
  };

  addCustomAreasFromQuery = qs => {
    if (qs) {
      try {
        const parsedAreas = queryString.parse(qs, {arrayFormat: 'bracket'});
        let i = 0;
        let areas = [];
        for (i = 0; i < parsedAreas.n.length; i++) {
          if (parsedAreas.s[i]) {
            let sel = parsedAreas.s[i].split("-");
            areas.push({name: parsedAreas.n[i], selection: sel[0] !== "" ? sel : []});
          }
        }

        areas.length && this.saveMultipleCustomAreas(areas);
      } catch (e) {
        console.error("Could not parse area param", e);
      }
    }
  };

  deleteArea = id => {
    let savedAreas = this.state.savedAreas.filter(area => area.id !== id);
    this.setState({savedAreas})
  };

  deleteAllCustomAreas = () => {
    let customSelection = flatten([...this.state.savedCustomAreas.map(area => area.selection)]);
    let selection = _.difference([...this.state.selection], customSelection);
    this.drawerRef.catRef.addRemoveCustomMunids([], customSelection);
    this.drawerRef.catRef.addRemoveFromSelection([], customSelection);
    this.setState({savedCustomAreas: []},
        () => this.changeMuns(selection,
            this.state.regionFeatureUnions.filter(f => f.activated)
                .map(f => f.id),
            this.state.majorRegionFeatureUnions.filter(f => f.activated)
                .map(f => f.id)))
  };

  deleteCustomArea = id => {
    let area = this.state.savedCustomAreas.find(area => area.id === id);
    let savedCustomAreas = this.state.savedCustomAreas.filter(area => area.id !== id);
    let selection = _.difference([...this.state.selection], area.selection);
    this.drawerRef.catRef.addRemoveCustomMunids([], area.selection);
    this.drawerRef.catRef.addRemoveFromSelection([], area.selection);
    this.setState({savedCustomAreas},
        () => this.changeMuns(selection,
            this.state.regionFeatureUnions.filter(f => f.activated)
                .map(f => f.id),
            this.state.majorRegionFeatureUnions.filter(f => f.activated)
                .map(f => f.id)));
  };

  relateToArea = event => {
    if (this.state.selectedLayer) {
      this.setState({
        relativeToArea: !this.state.relativeToArea,
        variable: this.state.variable.includes('_km2') ? this.state.variable.split('_km2')[0] : `${this.state.variable}_km2`
      }, () => {
        const layer = this.getLayerByName('SparQL');
        const features = layer.getSource().getFeatures();
        this.prepareStyle(layer, features, this.state.variable);
      });
    }
  };

  render() {

    return (
        <div>
          <div ref={node => this.mapDiv = node} style={{height: '100vh', overflowY: 'hidden', overflowX: 'hidden'}}/>
          {this.props.loading && !this.state.selectedLayer &&
          <Spinner layerDrawerVisibility={this.props.layerDrawerVisibility}/>}
          {this.state.selectedLayer && <Legend
              statisticYear={this.props.statisticYear}
              layerDrawerVisibility={this.props.layerDrawerVisibility}
              selectedLayer={this.state.selectedLayer}
              opacity={this.state.layerOpacity}
              variable={this.state.variable}
              direction='left-to-right'
              fieldAliases={fieldAliases}
              loading={this.props.loading}
          >
          </Legend>}
          <SearchDialog
              searchDialogVisibility={this.props.searchDialogVisibility}
              toggleSearch={this.props.toggleSearch}
              handleClick={this.filterClick}
              filter={this.state.filter}
          />
          {!this.props.showPrintDialog &&
          <Hidden xsDown>
            <ZoomIn handleClick={() => this.zoom('in')}/>
            <ZoomOut handleClick={() => this.zoom('out')}/>
          </Hidden>
          }
          {this.state.featureInfo && this.state.featureInfo !== '' &&
          <MapPopover
              featureInfo={this.state.featureInfo}
              open={this.state.popOpen}
              X={this.state.popX}
              Y={this.state.popY}
              pop={this.pop}
              timeField={this.props.selectedLayer ? this.props.selectedLayer.style.timeField : null}
              time={this.props.time}
              field={this.props.selectedLayer ? this.props.selectedLayer.style.fieldSelection && this.props.selectedLayer.style.fieldSelection !== '' && this.props.selectedLayer.style.fieldSelection : 'all'}
              fieldAliases={fieldAliases}
          />
          }
          {this.state.featureInfo && this.state.featureInfo !== '' &&
          <InfoDrawer
              toggleInfoDrawer={this.props.toggleInfoDrawer}
              open={this.props.infoDrawerVisibility}
              featureInfo={this.state.featureInfo}
              timeField={this.props.selectedLayer ? this.props.selectedLayer.style.timeField : null}
              time={this.props.time}
              timeVisibility={this.props.timeVisibility}
              user={this.props.user}
              chartVisibility={this.props.chartVisibility}
              statistics={['sum', 'min', 'max', 'mean', 'median']}
              statisticYear={this.props.statisticYear}
              fieldAliases={fieldAliases}
              field={this.props.selectedLayer ? this.props.selectedLayer.style.fieldSelection && this.props.selectedLayer.style.fieldSelection !== '' && this.props.selectedLayer.style.fieldSelection : 'all'}
          />
          }
          {this.addRegMuns(this.props.munRegFeatures) &&
          <LayerDrawer
              onRef={ref => (this.drawerRef = ref)}
              addLayerToDB={this.addLayerToDB}
              editLayerInDB={this.editLayerInDB}
              deleteLayerFromDB={this.deleteLayerFromDB}
              layerDrawerVisibility={this.props.layerDrawerVisibility}
              savedAreaSelectionVisibility={this.props.savedAreaSelectionVisibility}
              map={this.map}
              basemap={this.state.basemap}
              changeBasemap={this.changeBasemap}
              basemapOpacity={this.state.basemapOpacity}
              changeBasemapOpacity={this.changeBasemapOpacity}
              toggleMunicipalityVisibility={this.toggleMunicipalityVisibility}
              municipalityBordersVisible={this.state.municipalityBordersVisible}
              layers={this.props.layers}
              filter={this.state.filter}
              setSelection={this.setSelection}
              selectedLayer={this.state.selectedLayer} // changed here from this.props.selectedLayer
              layerOpacity={this.state.layerOpacity}
              changeLayerOpacity={this.changeLayerOpacity}
              changeMuns={this.changeMuns}
              saveArea={this.saveArea}
              saveCustomArea={this.saveCustomArea}
              modifyCustomArea={this.modifyCustomArea}
              saveCustomAreaModification={this.saveCustomAreaModification}
              toggleCustomAreaActivation={this.toggleCustomAreaActivation}
              addCustomAreasFromExistingUnions={this.addCustomAreasFromExistingUnions}
              savedAreas={this.state.savedAreas}
              savedCustomAreas={this.state.savedCustomAreas}
              selection={this.state.selection}
              handleDelete={this.deleteArea}
              handleCustomAreaDelete={this.deleteCustomArea}
              handleDeleteAllCustomAreas={this.deleteAllCustomAreas}
              features={this.props.munRegFeatures.map(mun => mun.getProperties())}
              statisticsList={this.props.statisticsList}
              changeOwnSelection={this.changeOwnSelection}
              handleStatisticSelection={this.props.handleStatisticSelection}
              handleChangeStatisticYear={this.props.handleChangeStatisticYear}
              statisticYears={this.props.statisticYears}
              statisticYear={this.props.statisticYear}
              emptyMap={this.emptyMap}
              relateToArea={this.relateToArea}
              relativeToArea={this.state.relativeToArea}
          />}
        </div>
    );
  }
}

export default Map;
