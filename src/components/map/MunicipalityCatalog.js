import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Checkbox from '@material-ui/core/Checkbox';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import * as _ from 'lodash';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  first: {
    marginLeft: theme.spacing.unit * 2,
    paddingTop: 0,
    paddingBottom: 0
  },
  firstAll: {
    marginLeft: theme.spacing.unit * 1,
    paddingTop: 0,
    paddingBottom: 0
  },
  parent: {
    paddingTop: theme.spacing.unit / 2,
    paddingBottom: theme.spacing.unit / 2,
    width: 185
  },
  grandParent: {
    paddingTop: theme.spacing.unit / 2,
    paddingBottom: theme.spacing.unit / 2,
    width: 188
  },
  subItem: {
    marginRight: theme.spacing.unit * 2
  },
  listItem: {
    paddingLeft: 0,
    opacity: 0.5
  },
  listItemTextNotActive: {
    fontSize: 15,
    color: 'black'
  },
  listItemTextActive: {
    fontSize: 15,
    color: theme.palette.primary.main
  },
  chip: {
    width: 170,
    justifyContent: 'space-between'
  }
});

class MunicipalityCatalog extends Component {

  state = {
    open: false,
    subOpen: 0,
    topOpen: 0,
    activeRegions: [],
    munids: [],
    regids: [],
    majorRegids: [],
    customMunids: [],
    nuts: false
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  emptySelections = () => {
    this.setState({
      munids: [],
      regids: [],
      majorRegids: [],
      customMunids: [],
      activeRegions: []
    }, () => this.props.emptyMap());
  };

  handleClickSubMenu = group => this.state.subOpen === group ? this.setState({subOpen: 0}) : this.setState({subOpen: group});
  handleClickTopMenu = group => this.state.topOpen === group ? this.setState({topOpen: 0}) : this.setState({topOpen: group});
  hitTheNUTS = () => {
    this.setState({nuts: !this.state.nuts})
  };

  activateSelection = munids => {
    const features = this.props.features;
    let munFeatures = features.filter(feature => munids.includes(feature.firstCode));
    let activeRegions = [...new Set(munFeatures.map(feat => feat.secondCode))];
    this.setState({munids, activeRegions});
  };

  addRemoveFromSelection = (munsToAdd, munsToRemove = []) => {
    let munids = _.difference(_.union(this.state.munids, munsToAdd), munsToRemove);
    this.activateSelection(munids);
    this.setState({munids},
        () => this.props.changeMuns(munids, this.state.regids, this.state.majorRegids));
  };

  addRemoveCustomMunids = (munsToAdd, munsToRemove = []) => {
    let customMunids = _.difference(_.union(this.state.customMunids, munsToAdd), munsToRemove);
    const features = this.props.features;
    let customMunFeatures = features.filter(feature => customMunids.includes(feature.firstCode));
    let regids = _.difference(this.state.regids, [...new Set(customMunFeatures.map(f => f.secondCode))]);
    let majorRegids = _.difference(this.state.majorRegids, [...new Set(customMunFeatures.map(f => f.thirdCode))]);
    this.setState({customMunids, regids, majorRegids});
  };

  addRemoveMunid = (features, munid) => {
    let munids = this.state.munids;
    let region = features.find(feature => feature.firstCode === munid).secondCode;
    let regMuns = features.filter(feature => feature.secondCode === region);
    if (munids.includes(munid)) {
      munids = munids.filter(id => id !== munid);
    } else {
      munids.push(munid);
    }
    this.activateSelection(munids);
    this.setState({munids},
        () => this.props.changeMuns(munids, this.state.regids, this.state.majorRegids));

  };

  addRemoveRegid = (features, region) => {
    /* filtteröi kunnat maakunnassa */
    let regMuns = features.filter(feature => feature.second === region);
    /* hae maakunnan koodi */
    let regid = regMuns[0].secondCode;
    let majorRegid = regMuns[0].thirdCode;
    let regMunids = regMuns.map(mun => mun.firstCode);
    let munids = this.state.munids;
    let regids = this.state.regids;
    let majorRegids = this.state.majorRegids;

    if (regids.includes(regid)) {
      regids = regids.filter(id => id !== regid);
      munids = munids.filter(mun => !regMunids.includes(mun));
    } else {
      regids.push(regid);
      majorRegids = majorRegids.filter(id => id !== majorRegid);
      regMunids.forEach(munid => !munids.includes(munid) && munids.push(munid));
    }
    this.activateSelection(munids);
    this.setState({regids, munids, majorRegids},
        () => this.props.changeMuns(munids, regids, majorRegids));
  };

  addRemoveMajorRegid = (features, majorRegid) => {
    let majorRegMuns = features.filter(feature => feature.thirdCode === majorRegid);
    let majorRegMunids = majorRegMuns.map(mun => mun.firstCode);
    let regidsInMajorReg = [...new Set(majorRegMuns.map(mun => mun.secondCode))];

    let regids = this.state.regids;
    let majorRegids = this.state.majorRegids;
    let munids = this.state.munids;
    if (majorRegids.includes(majorRegid)) {
      majorRegids = majorRegids.filter(id => id !== majorRegid);
      munids = munids.filter(mun => !majorRegMunids.includes(mun));
    } else {
      majorRegids.push(majorRegid);
      regids = regids.filter(id => !regidsInMajorReg.includes(id));
      majorRegMunids.forEach(munid => !munids.includes(munid) && munids.push(munid));
    }
    this.activateSelection(munids);
    this.setState({regids, munids, majorRegids},
        () => this.props.changeMuns(munids, regids, majorRegids));

  };

  addRemoveAllFromRegion = (regMuns) => {
    let regid = regMuns[0].secondCode;
    let regMunids = regMuns.map(mun => mun.firstCode);
    let munids = this.state.munids;
    let regids = this.state.regids;
    if (!regids.includes(regid) && regMunids.every(id => munids.includes(id))) {
      munids = munids.filter(mun => !regMunids.includes(mun));
    } else {
      regids = regids.filter(id => id !== regid);
      regMunids.forEach(munid => !munids.includes(munid) && munids.push(munid));
    }
    this.activateSelection(munids);
    this.setState({munids, regids},
        () => this.props.changeMuns(munids, regids, this.state.majorRegids));
  };

  isChildDisabled = (munid, regid, majorRegid) =>
      this.state.regids.includes(regid) || this.state.majorRegids.includes(majorRegid)
      || this.state.customMunids.includes(munid);

  isAllChildrenDisabled = (munids, regid, majorRegid) =>
      this.state.regids.includes(regid) || this.state.majorRegids.includes(majorRegid)
      || munids.every(id => this.state.customMunids.includes(id));

  isParentDisabled = (munids, majorRegid) =>
      this.state.majorRegids.includes(majorRegid) || munids.some(id => this.state.customMunids.includes(id));

  isGrandParentDisabled = (munids) =>
      munids.some(id => this.state.customMunids.includes(id));

  createMenu = (features, txt) => {

    const {classes} = this.props;

    let grandParents = [];
    let grandGroups = [...new Set(features.map(feature => feature.third))].sort();

    grandGroups.forEach((grandGroup, grandIndex) => {


      let parents = [];
      let featuresInGrandGroup = features.filter(feature => feature.third === grandGroup);
      let groups = [...new Set(featuresInGrandGroup.map(feature => feature.second))].sort();
      let grandGroupNUTS = features.find(feature => feature.third === grandGroup).thirdNUTS;
      let grandGroupId = features.find(feature => feature.third === grandGroup).thirdCode;

      groups.forEach((group, parentIndex) => {

        let groupFeatures = features.filter(feature => feature.second === group);
        let childIds = groupFeatures.map(f => f.firstCode);
        let groupId = groupFeatures[0].secondCode;
        let groupNUTS = groupFeatures[0].secondNUTS;
        groupFeatures.sort((a, b) => a.first < b.first ? -1 : 1);

        let children = [];

        // Select all children

        children.push(
            <div key={`div_all`} style={{display: 'flex'}}>
              <Checkbox key={`checkbox_all`}
                        color='primary'
                        style={{paddingLeft: 3, paddingTop: 4, paddingBottom: 4}}
                        disabled={this.isAllChildrenDisabled(childIds, groupId, grandGroupId)}
                        checked={
                          !this.state.regids.includes(groupId) &&
                          groupFeatures.every(f => this.state.munids.includes(f.firstCode))
                        }
                        onChange={() => this.addRemoveAllFromRegion(groupFeatures)}/>
              <ListItem
                  className={classes.firstAll}
                  key={"all"}
                  dense
                  button
                  disableGutters={true}
                  onClick={() => !this.isAllChildrenDisabled(groupFeatures.map(f => f.firstCode), groupId, grandGroupId) && this.addRemoveAllFromRegion(groupFeatures)}>
                <ListItemText key={`listitemtext_all`} primary={txt.igalod.selectAllMunis}/>
              </ListItem>
            </div>
        );

        groupFeatures.forEach((item, index) => {
          children.push(
              <div key={`div_${index}`} style={{display: 'flex'}}>
                <Checkbox key={`checkbox_${index}`} color='primary' style={{paddingTop: 4, paddingBottom: 4}}
                          checked={this.state.munids.includes(item.firstCode)}
                          disabled={this.isChildDisabled(item.firstCode, groupId, grandGroupId)}
                          onChange={() => this.addRemoveMunid(features, item.firstCode)}/>
                <ListItem
                    className={classes.first}
                    key={index}
                    dense
                    button
                    disableGutters={true}
                    aria-haspopup="true"
                    aria-controls="placesearch"
                    aria-label="Valitse kunta"
                    onClick={() => !this.isChildDisabled(item.firstCode, groupId, grandGroupId) && this.addRemoveMunid(features, item.firstCode)}>
                  <ListItemText key={`listitemtext_${index}`} primary={item.first}/>
                </ListItem>
              </div>
          )
        });

        parents.push(
            <div key={group}>
              {parentIndex === 0 &&
              <Typography variant='body2' style={{color: '#666', fontSize: 12}}>{txt.igalod.parent}</Typography>}
              <div style={{display: 'flex'}}>
                <Checkbox color='primary' style={{paddingLeft: 0, paddingTop: 8, paddingBottom: 8}}
                          checked={this.state.regids.includes(groupId)}
                          disabled={this.isParentDisabled(childIds, grandGroupId)}
                          onChange={() => this.addRemoveRegid(features, group)}/>
                <ListItem
                    classes={{root: classes.parent}}
                    button
                    disableGutters={true}
                    aria-haspopup="true"
                    dense
                    aria-controls="indicatorSelector"
                    aria-label={'group'}
                    onClick={() => this.handleClickSubMenu(group)}>
                  <ListItemText primary={this.state.nuts ? `${group} (${groupNUTS})` : group}
                                classes={{primary: this.state.activeRegions.includes(groupFeatures.find(feat => feat.second === group).secondCode) ? classes.listItemTextActive : classes.listItemTextNotActive}}
                  />
                  {this.state.subOpen === group ? <ExpandLess className={classes.subItem}/> :
                      <ExpandMore className={classes.subItem}/>}
                </ListItem>
              </div>
              <Collapse in={this.state.subOpen === group} timeout="auto" unmountOnExit>
                <List component="div">{children}
                </List>
              </Collapse>
            </div>
        )
      });

      grandParents.push(
          <div key={grandGroup}>
            {grandIndex === 0 &&
            <Typography variant='body2' style={{color: '#666', fontSize: 12}}>{txt.igalod.grand}</Typography>}
            <div style={{display: 'flex'}}>
              <Checkbox key={`checkbox_grand_parent`}
                        color='primary'
                        style={{paddingLeft: 0, marginLeft: -2, paddingTop: 4, paddingBottom: 4}}
                        checked={this.state.majorRegids.includes(grandGroupId)}
                        disabled={this.isGrandParentDisabled(featuresInGrandGroup.map(f => f.firstCode))}
                        onChange={() => this.addRemoveMajorRegid(features, grandGroupId)}/>
              <ListItem
                  classes={{root: classes.grandParent}}
                  button
                  disableGutters={true}
                  aria-haspopup="true"
                  dense
                  aria-controls="indicatorSelector"
                  aria-label={'group'}
                  onClick={() => this.handleClickTopMenu(grandGroup)}>
                <ListItemText primary={this.state.nuts ? `${grandGroup} (${grandGroupNUTS})` : grandGroup}
                />
                {this.state.topOpen === grandGroup ? <ExpandLess className={classes.subItem}/> :
                    <ExpandMore className={classes.subItem}/>}
              </ListItem>
            </div>
            <Collapse in={this.state.topOpen === grandGroup} timeout="auto" unmountOnExit>
              <List component="div">{parents}
              </List>
            </Collapse>
          </div>
      )

    });

    return (
        <div className={classes.root}>
          <div className={classes.listRoot}>
            <Collapse in={true} timeout="auto" unmountOnExit>
              {this.state.customMunids.length === 0 && this.state.activeRegions.length !== 0 &&
              <Chip
                  clickable
                  label={txt.igalod.emptySelections}
                  onClick={() => this.emptySelections()}
                  className={classes.chip}
                  color="secondary"
                  variant="outlined"
              />}
              <List component="nav">{grandParents}
              </List>
            </Collapse>
            <Button onClick={() => this.hitTheNUTS()} style={{width: 200}}
                    color='primary'>{this.state.nuts ? txt.igalod.hideNUTS : txt.igalod.showNUTS}</Button>
          </div>
        </div>);
  };

  render() {

    return (
        this.createMenu(this.props.features, this.props.txt)
    );
  }
}

export default withStyles(styles)(MunicipalityCatalog);
