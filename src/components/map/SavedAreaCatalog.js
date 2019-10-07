import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Chip from "@material-ui/core/Chip";
import Button from '@material-ui/core/Button';
import {Divider} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const styles = theme => ({
  inputPadding: {
    paddingBottom: '15px'
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
    marginLeft: theme.spacing.unit * 0.5,
    paddingTop: 0,
    paddingBottom: 0
  },
});

class SavedAreaCatalog extends Component {


  startModifyingCustomArea = area => {
    this.props.changeCustomAreaModifiedName(area.name);
    this.props.modifyCustomArea(area);
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
        <ListItemText key={`listitemtext_${area.id}`} primary={area.name}/>
        <Chip
            clickable
            key={`chip_${area.id}`}
            onClick={() => {
              this.startModifyingCustomArea(area);
            }}
            onDelete={() => this.props.handleCustomAreaDelete(area.id)}
            color="primary"
            size="small"
        />
      </>
    }

  };


  saveNewCustomArea = name => {
    this.props.saveCustomArea(name);
    this.props.changeCustomAreaName("");
  };


  render() {

    const {classes, savedAreas, savedCustomAreas, areaName, customAreaName, txt} = this.props;

    return (
        <div>
          <div style={{display: 'flex', flexDirection: 'column'}}>

            {savedCustomAreas.sort((a, b) => a.order - b.order).map(area => {
              return <div key={`div_${area.id}`} style={{display: 'flex'}}>
                <Checkbox key={`checkbox_${area.id}`}
                          color='primary'
                          style={{paddingTop: 4, paddingBottom: 4}}
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
                label={txt.igalod.newCustomArea}
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
          <Button color='primary'
                  onClick={() => this.saveNewCustomArea(customAreaName)}>{txt.button.saveNew}</Button>

          <Divider/>
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
                label={txt.igalod.newArea}
                defaultValue={areaName}
                onChange={this.props.changeName}
                classes={{root: classes.text}}>
            </TextField>
          </div>
          <Button color='primary'
                  onClick={() => this.props.saveArea(areaName)}>{txt.button.saveNew}</Button>
        </div>
    );
  };
}

export default withStyles(styles)(SavedAreaCatalog);
