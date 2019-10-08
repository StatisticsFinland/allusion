import React, {Component} from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Map from './components/map/Map';
import {dark, light} from './Theme';
import {MuiThemeProvider} from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';

import Toolbar from './components/toolbar/Toolbar';
import LayerButton from './components/toolbar/LayerButton';
import AlertBar from './components/AlertBar';
import Logo from './components/Logo';
import InfoDialog from './components/info/InfoDialog';

import RegionController from './controllers/RegionController';
import StatisticsController from './controllers/StatisticsController';
import {statisticList as STATISTIC_LIST} from './globals';
/* SPARQL queries */
import QueryGenerator from './queries/QueryGenerator';
import executeQuery from './SparQL';
/* Localization */
import {defaultLanguage, languages} from './components/localization/languages';
import translate from './components/localization/translate';
import translations from './components/localization/translations.json'

const queryString = require('query-string');

/* Context for in-app alerts */
const AlertContext = React.createContext('alert');
/* Context for translations */
const LanguageContext = React.createContext('language');

class App extends Component {

  state = {
    showLayerDrawer: true,
    showToolbar: true,
    showAlert: false,
    showSearch: false,
    showLogo: true,
    showInfo: false,
    showLayerButton: true,
    showInfoDrawer: false,
    logged: false,
    timeValues: null,
    time: null,
    theme: light,
    alert: '',
    data: [],
    layers: [],
    selectedLayer: null,
    chartSpecs: null,
    pdfMargin: 20,
    txt: translate(languages, defaultLanguage, translations),
    layerPrintOpacity: 1,
    urlParameters: null,
    loading: false,
    munRegFeatures: [],
    statisticsList: [],
    selectedMunips: [],
    statisticYear: 2018,
    statisticCode: 'NONE',
    statDataValues: [],
    statSettings: { year: 2019, scale: 4500000, seas: false },
    drawExtent: [20, 60, 33, 70],
    labels: false
  };

  /* handle language change */
  handleLanguageChange = language => {
    if (!this.state.language || language !== this.state.language) {
      this.setState({ language });
      this.setState({ txt: translate(languages, language, translations) });
    }
  };

  /* Perform operations needed when language is changed */
  languageChangeOperations = (language) => {
    this.handleLanguageChange(language);
    this.handleGetAreas(language);
    this.handleGetStatistics(language);
  };

  /* Get statistics from Tilastokeskus via SPARQL */
  getSparQL = () => {
    this.setState({loading: true});
    const queryParams = {
      statistics: this.state.statDataValues,
      munips: this.state.selectedMunips,
      munipYear: this.state.statSettings.year,
      statYear: this.state.statisticYear,
      language: this.state.language,
      scale: this.state.statSettings.scale,
      sea: this.state.statSettings.seas,
      extent: this.state.drawExtent,
      statisticsList: this.state.statisticsList,
      statisticCode: this.state.statisticCode
    };

    executeQuery(queryParams).then(response => {
      if (response) {
        this.mapRef.addFeaturesToMap(response);
        this.setState({ loading: false }, () => {
          this.state.showInfoDrawer && this.mapRef.updateStatsFromApp(false)
        })
      }
    });
  };

  /* Get new map areas based on user's own selections */
  handleOwnSelections = (stats) => {
    this.setState({ statSettings: stats }, () => {
      this.getSparQL();
    });
  };

  /* Get statistic information (list of M** codes) from Tilastokeskus PXNET API */
  handleGetStatistics = (language) => {
    StatisticsController.getStatistics(language).then(res => {
      if (res) {
        res.json().then(json => {
          const info = json.variables.find(obj => obj.code === 'Tiedot');
          const statisticsList = STATISTIC_LIST.map(stat => {
            const index = info.values.indexOf(stat);
            if (index !== -1) {
              return { code: stat, text: info.valueTexts[index] };
            }
            if (stat === 'NONE') {
              return { code: 'NONE', text: language === 'en' ? 'No statistics' : 'Ei tilastoa' };
            }

          });
          const statisticYears = json.variables.find(vari => vari.code === 'Vuosi').values;
          this.setState({ statisticsList, statisticYears });
          this.mapRef.setVariable(statisticsList.find(stat => stat.code === this.state.statisticCode).text)
        });
      }
    });
  };

  /* Fetch fresh statistics from TK */
  handleGetTKStatistics = (lan, year, munips, code, statYear) => {
    return new Promise((resolve, reject) => {
      if (code !== 'NONE') {
        StatisticsController.getQueryStatistics(lan, 2019, munips, code, statYear).then(res => {
          if (res) {
            res.json().then(data => {
              const dataset = data.dataset;
              const labels = dataset.dimension['Alue 2019'].category.label;
              const indexes = dataset.dimension['Alue 2019'].category.index;

              const dataValues = Object.keys(indexes).map(code => {
                return {
                  municipalityCode: code,
                  value: dataset.value[indexes[code]],
                  text: labels[code]
                };
              });

              this.setState({ statDataValues: dataValues }, () => {
                resolve({ ok: 'OK' });
              });
            }).catch(err => {
              reject({ err: 'Error while parsing TK statistics JSON' });
            });
          } else {
            reject({ err: 'Error while fetching TK statistics' });
          }
        })
      } else {
        resolve({ ok: 'No statistics desired. OK' });
      }
    });
  };

  /* Fetch new statistic based on user's statistic selection */
  handleStatisticSelection = (statisticCode) => {
    this.setState({ statisticCode }, () => {
      this.handleGetTKStatistics(this.state.language, this.state.statSettings.year, this.state.selectedMunips, this.state.statisticCode, this.state.statisticYear).then(() => {
        this.mapRef.setVariable(this.state.statisticsList.find(stat => stat.code === statisticCode).text);
        this.getSparQL();
      });
    })
  };

  handleChangeStatisticYear = event => {
    this.setState({ statisticYear: parseInt(event.target.value) }, () => {
      this.handleGetTKStatistics(this.state.language, this.state.statSettings.year, this.state.selectedMunips, this.state.statisticCode, this.state.statisticYear).then(() => {
        this.getSparQL();
      });
    })
  };

  /* Fetch new statistics based on user's selected municipalities */
  handleSelectingMunips = (selectedMunips) => {
    this.setState({ selectedMunips }, () => {
      if (selectedMunips.length !== 0) {
        this.handleGetTKStatistics(this.state.language, this.state.statSettings.year, this.state.selectedMunips, this.state.statisticCode, this.state.statisticYear).then(() => {
          this.getSparQL();
        });
      }
    });
  };

  /* Material UI togglers */
  toggleDialog = dialogName => {
    const stateName = `show${dialogName}`;
    const dialogState = !this.state[stateName];
    this.setState({ [stateName]: dialogState });
  };
  toggleLayerDrawer = () => {
    const switchedLayerDrawer = !this.state.showLayerDrawer;
    this.setState({ showLayerDrawer: switchedLayerDrawer, showInfoDrawer: false });
  };
  toggleInfoDrawer = value => this.setState({ showInfoDrawer: value });
  toggleLabels = () => {
    const labels = this.state.labels;
    this.setState({ labels: !labels }, () => this.mapRef.switchLabels())
  };

  /* Toggle alert */
  alertClose = () => this.setState({ showAlert: false });

  /* Switch Themes */
  switchTheme = () => {
    const newTheme = this.state.theme === dark ? light : dark;
    this.setState({ theme: newTheme });
  };

  /* Get url query parameters. */
  getURLParameters = () => {
    let query = queryString.parse(this.props.location.search);
    let urlParameters = {};
    /* Set layer, zoom, coordinates, basemap and opacities from URL queryString */
    query.z && (urlParameters.zoom = query.z);
    query.b && (urlParameters.basemap = query.b);
    query.bo && (urlParameters.basemapOpacity = Number(query.bo));
    query.lo && (urlParameters.layerOpacity = Number(query.lo));
    query.layer && (urlParameters.layer = query.layer);
    (query.x && query.y) && (urlParameters.center = [Number(query.x), Number(query.y)]);

    this.setState({ urlParameters: urlParameters });
    /* Clean URL from search parameters */
    this.props.history.push({ search: '' });
  };

  /* Lifecycle methods */
  componentDidMount() {
    //this.getURLParameters();
    //this.handleGetLayers();
    this.languageChangeOperations(defaultLanguage);
  };

  handleGetAreas = async (language) => {

    try { /* Fetch regions and municipalities from MML endpoint for LayerDrawer */
      let promises = [
        RegionController.getRegionsAndMunicipalities(QueryGenerator.regionMunQuery(language, '2019')),
        RegionController.getGeometriesForMunicipalities(QueryGenerator.regionMunGeomQuery('2019'))
      ];

      const jsons = await Promise.all(
          promises.map(promise => promise.then(res => {
            if (res.ok) {
              return res.json();
            } else {
              console.log('Error while fetching geometries for municipalities from MML');
              return Promise.reject();
            }
          }))
      );
      const munRegFeatures = RegionController.parseRegionsAndMunicipalities(jsons);
      this.setState({munRegFeatures});
    } catch (e) {
      console.error("Failed to fetch", e);
    }
  };

  render() {

    const timeVisibility = this.state.showTime && this.state.selectedLayer && this.state.selectedLayer.style.timeField && this.state.selectedLayer.style.timeField !== null;
    const chartsEnabled = this.state.selectedLayer && ((Array.isArray(this.state.selectedLayer.charts) && this.state.selectedLayer.charts.length > 0) || (this.state.user.username && !['', null].includes(this.state.user.username)));

    return (
      <MuiThemeProvider theme={this.state.theme}>
        <LanguageContext.Provider value={{ txt: this.state.txt, lan: this.state.language }}>
          <div className='app'>
            <CssBaseline />
            <Map
              onRef={ref => (this.mapRef = ref)}
              urlParameters={this.state.urlParameters}
              theme={this.state.theme}
              switchTheme={this.switchTheme}
              searchDialogVisibility={this.state.showSearch}
              toggleSearch={() => { this.toggleDialog('Search') }}
              toggleLayerDrawer={this.toggleLayerDrawer}
              layerDrawerVisibility={this.state.showLayerDrawer}
              toggleInfoDrawer={this.toggleInfoDrawer}
              infoDrawerVisibility={this.state.showInfoDrawer}
              layers={this.state.layers}
              selectLayer={this.selectLayer}
              selectedLayer={this.state.selectedLayer}
              language={this.state.language ? this.state.language : defaultLanguage}
              munRegFeatures={this.state.munRegFeatures}
              statisticsList={this.state.statisticsList}
              statisticCode={this.state.statisticCode}
              handleStatisticSelection={this.handleStatisticSelection}
              handleChangeStatisticYear={this.handleChangeStatisticYear}
              handleSelectingMunips={this.handleSelectingMunips}
              statisticYear={this.state.statisticYear}
              statisticYears={this.state.statisticYears}
              changeOwnSelection={this.handleOwnSelections}
              loading={this.state.loading}
              labels={this.state.labels}
            />
            {this.state.showLayerButton &&
              <LayerButton
                alertVisibility={this.state.showAlert}
                handleClick={this.toggleLayerDrawer}
                layerDrawerVisibility={this.state.showLayerDrawer}
                infoDrawerVisibility={this.state.showInfoDrawer}
              />
            }
            <Toolbar
              layerDrawerVisibility={this.state.showLayerDrawer}
              infoDrawerVisibility={this.state.showInfoDrawer}
              toolbarVisibility={this.state.showToolbar}
              toggleShare={this.toggleShare}
              toggleSearch={() => { this.toggleDialog('Search') }}
              toggleInfo={() => { this.toggleDialog('Info') }}
              toggleTable={() => { this.mapRef.updateStatsFromApp(true) }}
              toggleLabels={this.toggleLabels}
              labels={this.state.labels}
              tableEnabled={this.state.selectedMunips.length > 0 || this.state.selectedLayer}
              layer={this.state.selectedLayer}
              languages={languages}
              language={this.state.language ? this.state.language : defaultLanguage}
              changeLanguage={this.languageChangeOperations}
            />
            <InfoDialog
              toggleInfo={() => { this.toggleDialog('Info') }}
              infoDialogVisibility={this.state.showInfo}
            />
            <AlertContext.Provider value={this.state.alert}>
              <AlertBar
                alertVisibility={this.state.showAlert}
                alertClose={this.alertClose}
              />
            </AlertContext.Provider>
            {this.state.showLogo &&
              <Hidden xsDown>
                <Logo layerDrawerVisibility={this.state.showLayerDrawer} position={'fixed'} />
              </Hidden>
            }
          </div>
        </LanguageContext.Provider>
      </MuiThemeProvider>
    );
  };
}

export { App, AlertContext, LanguageContext };
