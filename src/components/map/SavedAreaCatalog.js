import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Chip from "@material-ui/core/Chip";
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Checkbox from "@material-ui/core/Checkbox";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Share from '@material-ui/icons/Share';
import Tooltip from "@material-ui/core/Tooltip";
import queryString from 'query-string';
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";


const styles = theme => ({
  inputPadding: {
    paddingBottom: '20px'
  },
  text: {
    marginTop: 16,
    paddingBottom: '15px'
  },
  areaModificationTextFieldInput: {
    fontSize: 10
  },
  areaModificationTextFieldLabel: {
    fontSize: 10
  },
  chip: {
    margin: theme.spacing.unit,
    justifyContent: 'space-between'
  },
  first: {
    marginLeft: theme.spacing.unit * 0.1,
    overflowWrap: 'break-word',
    maxWidth: 190,
    paddingTop: 0,
    paddingBottom: 0
  }
});

class SavedAreaCatalog extends Component {

  startModifyingCustomArea = area => {
    this.props.changeCustomAreaModifiedName(area.name);
    this.props.modifyCustomArea(area);
  };

  saveNewCustomArea = name => {
    this.props.saveCustomArea(name);
    this.props.changeCustomAreaName("");
  };

  shareCustomAreas = () => {
    let names = [];
    let selections = [];
    this.props.savedCustomAreas.forEach(area => {
      names.push(area.name);
      selections.push(area.selection.toString().replace(/,/g, '-'));
    });

    const areas = queryString.stringify({
      n: names,
      s: selections
    }, {arrayFormat: 'bracket'});
    window.prompt(this.props.txt.shareDialog.copy, `${window.location.href.split('?')[0]}?${areas}`);
  };

  populateListItem = area => {
    if (area.beingModified) {
      return <>
        <TextField
            InputProps={{
              classes: {
                input: this.props.classes.areaModificationTextFieldInput
              }
            }}
            InputLabelProps={{
              classes: {
                root: this.props.classes.areaModificationTextFieldLabel
              }
            }}
            defaultValue={area.name}
            onChange={event => this.props.changeCustomAreaModifiedName(event.target.value)}
            margin="dense"
            style={{fontSize: 1}}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                this.props.saveCustomAreaModification(area, this.props.customAreaModifiedName);
                ev.preventDefault();
              }
            }}
        >
        </TextField>
        <Chip
            clickable
            key={`chip_${area.id}`}
            onDelete={() => this.props.handleCustomAreaDelete(area.id)}
            color="secondary"
            size="small"
            label={this.props.txt.igalod.saveCustomAreaModification}
            onClick={() => this.props.saveCustomAreaModification(area, this.props.customAreaModifiedName)}
        />
      </>
    } else {
      return <>
        <ListItemText key={`listitemtext_${area.id}`}
                      primary={area.name}
        />
        <Chip
            clickable
            key={`chip_${area.id}`}
            onClick={() => {
              this.startModifyingCustomArea(area);
            }}
            onDelete={() => window.confirm(this.props.txt.savedAreasDrawer.deleteConfirmation) &&
                this.props.handleCustomAreaDelete(area.id)}
            color="primary"
            size="small"
        />
      </>
    }

  };

  render() {

    const {classes, savedAreas, savedCustomAreas, areaName, customAreaName, txt, savedAreaSelectionVisibility} = this.props;

    return (
        <>
          <FormControl classes={{root: classes.inputPadding}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>

              {savedAreaSelectionVisibility && <FormLabel>{txt.savedAreasDrawer.customUnions}</FormLabel>}
              {savedCustomAreas.length > 0 &&
              <div key={`div_delete_all_custom_areas`} style={{display: 'flex'}}>
                <Chip
                    clickable
                    key={`chip_delete_all`}
                    color="secondary"
                    size="small"
                    label={txt.igalod.deleteAll}
                    variant="outlined"
                    onClick={() => window.confirm(txt.savedAreasDrawer.deleteAllConfirmation) &&
                        this.props.handleDeleteAllCustomAreas()
                    }
                />
              </div>
              }
              {savedCustomAreas.length > 10000 &&
              <div key={`div_all_custom_areas`} style={{display: 'flex'}}>
                <Checkbox key={`checkbox_all_custom_areas`}
                          color='primary'
                          style={{paddingTop: 4, paddingBottom: 4, marginLeft: -10, marginRight: -10}}
                          checked={savedCustomAreas.every(area => area.activated)}
                          disabled={savedCustomAreas.some(area => area.beingModified)}
                          onChange={() => this.props.toggleAllCustomAreas(savedCustomAreas.some(area => !area.activated))}>
                </Checkbox>
                <ListItem
                    className={classes.first}
                    key={`listitem_all_custom_areas`}
                    dense
                    button
                    disableGutters={true}
                >
                  <ListItemText key={`listitemtext_all_custom_areas`}
                                primary={txt.igalod.showAll}
                  />
                </ListItem>
              </div>
              }
              {savedCustomAreas.sort((a, b) => a.name.localeCompare(b.name)).map(area => {
                return <div key={`div_${area.id}`} style={{display: 'flex'}}>
                  <Checkbox key={`checkbox_${area.id}`}
                            color='primary'
                            style={{paddingTop: 4, paddingBottom: 4, marginLeft: -10, marginRight: -10}}
                            checked={area.activated}
                            disabled={savedCustomAreas.some(area => area.beingModified)}
                            onChange={() => this.props.toggleCustomAreaSelection(area)}>

                  </Checkbox>
                  <ListItem
                      className={classes.first}
                      key={`listitem_${area.id}`}
                      dense
                      button
                      disableGutters={true}
                      aria-haspopup="true"
                      aria-controls="placesearch"
                      aria-label="Valitse kunta"
                      onClick={() => null}
                      onDoubleClick={() => this.startModifyingCustomArea(area)}>
                    {this.populateListItem(area)}
                  </ListItem>
                </div>
              })}

              <TextField
                  inputProps={{name: 'customAreaName', id: 'customAreaName'}}
                  label={txt.savedAreasDrawer.newUnion}
                  defaultValue={customAreaName}
                  value={customAreaName}
                  onChange={event => this.props.changeCustomAreaName(event.target.value)}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      this.saveNewCustomArea(customAreaName);
                      ev.preventDefault();
                    }
                  }}
                  classes={{root: classes.text}}>
              </TextField>


            </div>
            <div key={`div_custom_area_buttons`} style={{display: 'flex'}}>
              <Button color='primary'
                      onClick={() => this.saveNewCustomArea(customAreaName)}>{txt.button.saveNew}</Button>

              <Divider orientation="vertical"/>
              <Tooltip id="infoButtonTooltip" title={txt.shareDialog.tooltip} placement={"bottom-start"}>
                <Button size='small' onClick={() => this.shareCustomAreas()}>
                  <Share/>
                </Button>
              </Tooltip>
            </div>
            <div key={`div_custom_area_buttons_bring`} style={{display: 'flex'}}>
              <Button size='small' color='primary'
                      onClick={() => this.props.addCustomAreasFromExistingUnions("majorRegions")}>{txt.savedAreasDrawer.bringMajorRegions}</Button>
              <Button size='small' color='primary'
                      onClick={() => this.props.addCustomAreasFromExistingUnions("regions")}>{txt.savedAreasDrawer.bringRegions}</Button>
            </div>

            <Divider/>
          </FormControl>

          {savedAreaSelectionVisibility &&
          <FormControl classes={{root: classes.inputPadding}}>
            <FormLabel>{txt.savedAreasDrawer.ownAreaSelections}</FormLabel>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              {savedAreas.map(area => {
                return <Chip
                    clickable
                    key={area.id}
                    label={area.name}
                    onDelete={() => this.props.handleDelete(area.id)}
                    onClick={() => this.props.activateSelection(area.selection)}
                    className={classes.chip}
                    color="secondary"
                    variant="outlined"
                />
              })}

              <TextField
                  inputProps={{name: 'areaName', id: 'areaName'}}
                  label={txt.savedAreasDrawer.newArea}
                  defaultValue={areaName}
                  onChange={this.props.changeName}
                  classes={{root: classes.text}}>
              </TextField>
            </div>
            <Button color='primary'
                    onClick={() => this.props.saveArea(areaName)}>{txt.button.saveNew}</Button>
          </FormControl>
          }
        </>
    );
  };
}

export default withStyles(styles)(SavedAreaCatalog);
