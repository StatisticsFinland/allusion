import React, {Component} from 'react';
import Hidden from '@material-ui/core/Hidden';
import * as _ from 'lodash';
/* OpenLayers */
import OLMap from 'ol/Map';
import View from 'ol/View';
import {transform} from 'ol/proj.js';
import {defaults as defaultInteractions} from 'ol/interaction.js';

import {blackList, fieldAliases, isEmpty, makeCopy, srs} from '../../globals';
import {EPSG3067} from './projection/projections';
import Basemaps from './basemaps/Basemaps';
import Layers from './layers/Layers';
import FinMun from './layers/FinMun';
import ZoomIn from './zoom/ZoomIn';
import ZoomOut from './zoom/ZoomOut';
import getFeatureInfo from './info/getFeatureInfo';
import parseFeatureInfo from './info/parseFeatureInfo';
import calculateBreaks from './functions/calculateBreaks';
import createStyle from './functions/createStyle';
import MapPopover from './info/MapPopover';
import InfoDrawer from './info/InfoDrawer';
import select from './info/select';
import dragBox from './info/dragBox';
import SearchDialog from './search/SearchDialog';
import LayerDrawer from './LayerDrawer';
import Spinner from './../Spinner';

import {numericSort} from 'simple-statistics'
import chroma from 'chroma-js';
import Legend from './Legend';
import calculateUnionAggregate from "./functions/calculateUnionAggregate";
import uuid from "./functions/uuid";


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
      first: 'nimi',
      second: 'nimi_2',
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
    savedCustomAreas: [],
    variable: '',
    selectedLayer: null,
    relativeToArea: false
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
    layers: [...BasemapSel, ...LayerSel, FinMun],
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
    this.map.addInteraction(dragBox);

    /* Set initial basemap and layer stuff */
    this.changeBasemap();
    this.changeBasemapOpacity();
    this.changeLayerOpacity();

    /* Map click events */
    this.map.on('singleclick', event => {
      if (!select.getActive() || select.getFeatures().getArray().length === 0) {
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
        console.log("Selected");
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
    const layer = this.map.getLayers().getArray().find(layer => layer.getProperties().name === 'SparQL');
    const features = layer.getSource().getFeatures();
    getFeatureInfo(null, this.map).then(featureInfo => {
      if (selectedFeatures) {
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
      this.view.setCenter(target.getGeometry().getCoordinates());
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
    const mapValues = {x: x, y: y, z: z, b: basemap, bo: basemapOpacity, lo: layerOpacity, layer: layer};
    return mapValues;
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
        let rgba = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]})`;
        return rgba;
      });

      style.fieldValues = calculateBreaks(values, numClasses, 'ckmeans');
      style.fill = colors,
          style.stroke = 'rgba(0,115,176,0.66)';

    }

    selectedLayer.style = style;
    this.setState({selectedLayer});
    layer.setStyle(createStyle(style, null, null, this.state.relativeToArea, this.props.labels));

  };

  changeMuns = selection => {
    this.setState({selection}, () => {
      this.props.handleSelectingMunips(selection);
    });

    if (selection.length === 0) {
      const layer = this.map.getLayers().getArray().find(layer => layer.getProperties().name === 'SparQL');
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
    const layer = this.map.getLayers().getArray().find(layer => layer.getProperties().name === 'SparQL');
    const features = layer.getSource().getFeatures();
    this.state.selectedLayer && this.prepareStyle(layer, features, this.state.variable);
  };

  addFeaturesToMap = (response) => {
    const features = response.features;
    const layer = this.map.getLayers().getArray().find(layer => layer.getProperties().name === 'SparQL');
    let source = layer.getSource();
    source.clear();

    this.setState({
      selectedLayer: {
        url: source.getUrl(),
        title: layer.getProperties().title
      }
    }, () => {


      const savedCustomAreas = this.state.savedCustomAreas;

      let featuresBelongingToCustomAreas = _.uniq(_.flatten(
          savedCustomAreas
              .filter(area => area.activated)
              .map(area => area.selection)
              .map(selection => {
                // TODO: Modify if wanted to have municipality in multiple areas
                let customAreaFeatures = features.filter(feature => _.includes(selection, feature.get('municipalityCode')));
                let customAreaFeature = calculateUnionAggregate(customAreaFeatures);
                if (customAreaFeature) {
                  source.addFeature(customAreaFeature);
                }
                return customAreaFeatures;
              })));

      let remainingFeatures = _.difference(features, featuresBelongingToCustomAreas);
      if (remainingFeatures.length > 0) {
        source.addFeatures(remainingFeatures);
      }

      if (selectedFeatures) {
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
      }
      this.prepareStyle(layer, features, this.state.variable)
    })
  };

  emptyMap = () => {
    this.changeMuns([]);
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

  saveCustomArea = name => {
    const savedCustomAreas = this.state.savedCustomAreas;
    const selection = [...this.state.selection];
    let areaToSave = {
      id: uuid(),
      "order": savedCustomAreas.length + 1,
      name,
      selection,
      activated: false
    };
    if (!savedCustomAreas.some(area => area.name === name)) {
      this.setState({savedCustomAreas: [...savedCustomAreas, areaToSave]});
    }
  };

  toggleCustomAreaActivation = (area, state) => {
    let id = area.id;
    let savedCustomAreas = this.state.savedCustomAreas;
    area.activated = state;
    let otherAreas = savedCustomAreas.filter(area => area.id !== id);
    this.setState({savedCustomAreas: [...otherAreas, area]});
  };

  deleteArea = id => {
    let savedAreas = this.state.savedAreas.filter(area => area.id !== id);
    this.setState({savedAreas})
  };

  deleteCustomArea = id => {
    let savedCustomAreas = this.state.savedCustomAreas.filter(area => area.id !== id);
    let selection = [...this.state.selection];
    this.setState({savedCustomAreas}, () => this.changeMuns(selection));
  };

  relateToArea = event => {
    if (this.state.selectedLayer) {
      this.setState({
        relativeToArea: !this.state.relativeToArea,
        variable: this.state.variable.includes('_km2') ? this.state.variable.split('_km2')[0] : `${this.state.variable}_km2`
      }, () => {
        const layer = this.map.getLayers().getArray().find(layer => layer.getProperties().name === 'SparQL');
        const features = layer.getSource().getFeatures();
        this.prepareStyle(layer, features, this.state.variable);
      });
    }
  };

  render() {

    return (
        <div>
          <div ref={node => this.mapDiv = node} style={{height: '100vh', overflowY: 'hidden', overflowX: 'hidden'}}/>
          {this.state.loading && <Spinner/>}
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
          {this.props.munRegFeatures &&
          <LayerDrawer
              addLayerToDB={this.addLayerToDB}
              editLayerInDB={this.editLayerInDB}
              deleteLayerFromDB={this.deleteLayerFromDB}
              layerDrawerVisibility={this.props.layerDrawerVisibility}
              map={this.state.map}
              basemap={this.state.basemap}
              changeBasemap={this.changeBasemap}
              basemapOpacity={this.state.basemapOpacity}
              changeBasemapOpacity={this.changeBasemapOpacity}
              layers={this.props.layers}
              filter={this.state.filter}
              setSelection={this.setSelection}
              selectedLayer={this.state.selectedLayer} // changed here from this.props.selectedLayer
              layerOpacity={this.state.layerOpacity}
              changeLayerOpacity={this.changeLayerOpacity}
              changeMuns={this.changeMuns}
              saveArea={this.saveArea}
              saveCustomArea={this.saveCustomArea}
              toggleCustomAreaActivation={this.toggleCustomAreaActivation}
              savedAreas={this.state.savedAreas}
              savedCustomAreas={this.state.savedCustomAreas}
              selection={this.state.selection}
              handleDelete={this.deleteArea}
              handleCustomAreaDelete={this.deleteCustomArea}
              features={this.props.munRegFeatures}
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
