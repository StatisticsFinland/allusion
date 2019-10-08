import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import BasemapControl from './BasemapControl';
import StatisticsCatalog from './StatisticsCatalog';
import MunicipalityCatalog from './MunicipalityCatalog';

import {LanguageContext} from './../../App';
import SavedAreaCatalog from "./SavedAreaCatalog";

const styles = theme => ({
  radios: {
    paddingLeft: '12px'
  },
  inputPadding: {
    paddingBottom: '15px'
  },
  labelPadding: {
    paddingLeft: '4px'
  },
  paper: {
    width: '250px',
    overflowX: 'hidden',
    overflowY: 'auto'
  },
  root: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit,
    paddingTop: 0
  },
  root2: {
    padding: 0
  },
  rounded: {
    margin: '2px 0px 0px 0px'
  }
});

class LayerDrawer extends Component {

  state = {
    expanded: 'panel1',
    areaName: '',
    customAreaName: '',
    customAreaModifiedName: '',
    seaSelection: 'false',
    yearSelection: '2019',
    scaleSelection: '4500000'
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  /* Request new layer to be added to DB (send to Map) */
  addLayerToDB = (newLayer) => {
    this.props.addLayerToDB(newLayer);
  };

  /* Request a layer in DB to be updated */
  editLayerInDB = layer => {
    this.props.editLayerInDB(layer);
  };

  /* Request layer to be deleted from DB */
  deleteLayerFromDB = (layerUUID) => {
    this.props.deleteLayerFromDB(layerUUID);
  };

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  changeName = event => {
    this.setState({areaName: event.target.value})
  };

  changeCustomAreaName = name => this.setState({customAreaName: name});

  changeCustomAreaModifiedName = name => this.setState({customAreaModifiedName: name});

  activateSelection = selection => {
    this.catRef.activateSelection(selection);
    this.props.changeMuns(selection);
  };

  toggleCustomAreaSelection = area => {
    let selection = [...area.selection];
    if (!area.activated) {
      let munisToDeselect = this.props.toggleCustomAreaActivation(area, true);
      this.catRef.addRemoveFromSelection(selection, munisToDeselect);
    } else {
      this.props.toggleCustomAreaActivation(area, false);
      this.catRef.addRemoveFromSelection([], selection);
    }
  };

  toggleAllCustomAreas = (selectionState) => {
    //TODO: Fix this
    let selection = [...this.props.savedCustomAreas.flatMap(area => area.selection)];
    let munisToDeselect = this.props.savedCustomAreas
        .flatMap(area => this.props.toggleCustomAreaActivation(area, selectionState));
    if (selectionState) {
      this.catRef.addRemoveFromSelection(selection, munisToDeselect);
    } else {
      this.catRef.addRemoveFromSelection([], selection);
    }

  };

  /* Handle user's own selection radio button changes */
  handleRadioChange = event => {
    this.setState({[event.target.name]: event.target.value}, () => {
      /* Forward updated information about map areas to Map / App level */
      const stats = {
        year: Number(this.state.yearSelection),
        scale: Number(this.state.scaleSelection),
        seas: (this.state.seaSelection === 'true')
      };
      this.props.changeOwnSelection(stats);
    });
  };


  render() {

    const {classes} = this.props;
    const {expanded} = this.state;

    return (
        <LanguageContext.Consumer>{({txt, lan}) => {
          return (
              <div>
                <Drawer
                    classes={{paper: classes.paper}}
                    variant='persistent'
                    anchor='left'
                    open={this.props.layerDrawerVisibility}>
                  <Typography style={{padding: 12}} variant='subtitle1'><strong>ALLUsion</strong></Typography>
                  <ExpansionPanel defaultExpanded expanded={expanded === 'panel1'}
                                  onChange={this.handleChange('panel1')} classes={{expanded: classes.rounded}}>
                    <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                      <Typography variant='overline'>{txt.igalod.municipalityCatalog}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{root: classes.root}}>
                      <MunicipalityCatalog
                          txt={txt}
                          onRef={ref => (this.catRef = ref)}
                          changeMuns={this.props.changeMuns}
                          filter={this.props.filter}
                          activeSelection={this.state.activeSelection}
                          features={this.props.features}
                          emptyMap={this.props.emptyMap}
                      >
                      </MunicipalityCatalog>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded expanded={expanded === 'panel2'}
                                  onChange={this.handleChange('panel2')}>
                    <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                      <Typography variant='overline'>{txt.igalod.settings}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{root: classes.root}}>
                      <div style={{display: 'flex', flexDirection: 'column'}}>

                        <FormControl classes={{root: classes.inputPadding}}>
                          <FormLabel> {txt.igalod.municipYear} </FormLabel>
                          <RadioGroup
                              aria-label='yearSelection'
                              name='yearSelection'
                              value={this.state.yearSelection}
                              onChange={this.handleRadioChange}
                          >
                            <FormControlLabel value='2019' style={{maxHeight: 32, marginTop: 8}}
                                              control={<Radio classes={{root: classes.radios}}/>} label='2019'/>
                            <FormControlLabel value='2018' style={{maxHeight: 32}}
                                              control={<Radio classes={{root: classes.radios}}/>} label='2018'/>
                          </RadioGroup>
                        </FormControl>

                        <FormControl classes={{root: classes.inputPadding}}>
                          <FormLabel> {txt.igalod.landScale} </FormLabel>
                          <RadioGroup
                              aria-label='scaleSelection'
                              name='scaleSelection'
                              value={this.state.scaleSelection}
                              onChange={this.handleRadioChange}
                          >
                            <FormControlLabel value='1000000' style={{maxHeight: 32, marginTop: 8}}
                                              control={<Radio classes={{root: classes.radios}}/>}
                                              label='1 : 1 000 000'/>
                            <FormControlLabel value='4500000' style={{maxHeight: 32}}
                                              control={<Radio classes={{root: classes.radios}}/>}
                                              label='1 : 4 500 000'/>
                          </RadioGroup>
                        </FormControl>

                        <FormControl classes={{root: classes.inputPadding}}>
                          <FormLabel> {txt.igalod.seaAreas} </FormLabel>
                          <RadioGroup
                              aria-label='seaSelection'
                              name='seaSelection'
                              value={this.state.seaSelection}
                              onChange={this.handleRadioChange}
                          >
                            <FormControlLabel value="true" style={{maxHeight: 32, marginTop: 8}}
                                              control={<Radio classes={{root: classes.radios}}/>}
                                              label={txt.igalod.yes}/>
                            <FormControlLabel value="false" style={{maxHeight: 32}}
                                              control={<Radio classes={{root: classes.radios}}/>}
                                              label={txt.igalod.no}/>
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded expanded={expanded === 'panel3'}
                                  onChange={this.handleChange('panel3')}>
                    <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                      <Typography variant='overline'> {txt.igalod.ownAreas} </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{root: classes.root}}>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <SavedAreaCatalog
                            txt={txt}
                            savedAreas={this.props.savedAreas}
                            savedCustomAreas={this.props.savedCustomAreas}
                            modifyCustomArea={this.props.modifyCustomArea}
                            saveCustomAreaModification={this.props.saveCustomAreaModification}
                            handleDelete={this.props.handleDelete}
                            handleCustomAreaDelete={this.props.handleCustomAreaDelete}
                            activateSelection={this.activateSelection}
                            toggleCustomAreaSelection={this.toggleCustomAreaSelection}
                            areaName={this.state.areaName}
                            customAreaName={this.state.customAreaName}
                            changeName={this.changeName}
                            changeCustomAreaName={this.changeCustomAreaName}
                            customAreaModifiedName={this.state.customAreaModifiedName}
                            changeCustomAreaModifiedName={this.changeCustomAreaModifiedName}
                            toggleAllCustomAreas={this.toggleAllCustomAreas}
                            saveArea={this.props.saveArea}
                            saveCustomArea={this.props.saveCustomArea}
                        />
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded expanded={expanded === 'panel4'}
                                  onChange={this.handleChange('panel4')}>
                    <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                      <Typography variant='overline'> {txt.layerDrawer.statistics} </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{root: classes.root}}>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <Typography variant='body1'>{txt.igalod.statisticsNote}</Typography><br/>
                        <Typography variant='body1' style={{color: "#666", fontSize: 12}}><a target='_blank'
                                                                                             href={`https://pxnet2.stat.fi/PXWeb/pxweb/${lan}/Kuntien_avainluvut/Kuntien_avainluvut__2019/kuntien_avainluvut_2019_aikasarja.px/`}>{txt.igalod.meta}</a></Typography>
                        <br/>
                        <StatisticsCatalog
                            statistics={this.props.statisticsList}
                            statisticYears={this.props.statisticYears}
                            statisticYear={this.props.statisticYear}
                            handleChangeStatisticYear={this.props.handleChangeStatisticYear}
                            txt={txt}
                            handleStatisticSelection={this.props.handleStatisticSelection}
                            relateToArea={this.props.relateToArea}
                            relativeToArea={this.props.relativeToArea}
                            selectedLayer={this.props.selectedLayer}
                        />
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded expanded={expanded === 'panel5'}
                                  onChange={this.handleChange('panel5')}>
                    <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                      <Typography variant='overline'>{txt.layerDrawer.basemaps}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails classes={{root: classes.root}}>
                      <BasemapControl
                          basemap={this.props.basemap}
                          basemapOpacity={this.props.basemapOpacity}
                          changeBasemap={this.props.changeBasemap}
                          changeBasemapOpacity={this.props.changeBasemapOpacity}
                          municipalityBordersVisible={this.props.municipalityBordersVisible}
                          toggleMunicipalityVisibility={this.props.toggleMunicipalityVisibility}
                          txt={txt}
                      />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                </Drawer>
              </div>
          )
        }}</LanguageContext.Consumer>
    );
  }
}

export default withStyles(styles)(LayerDrawer)
