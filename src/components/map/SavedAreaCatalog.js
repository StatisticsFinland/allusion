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

  render() {

    const {classes, savedAreas, savedCustomAreas, areaName, customAreaName, txt} = this.props;

    return (
        <div>
          <div style={{display: 'flex', flexDirection: 'column'}}>

            {savedCustomAreas.sort((a, b) => a - b).map(area => {
              return <div style={{display: 'flex'}}>
                <Checkbox key={`checkbox_${area.id}`}
                          color='primary'
                          style={{paddingTop: 4, paddingBottom: 4}}
                          checked={area.activated}
                          onChange={() => this.props.toggleCustomAreaSelection(area)}>

                </Checkbox>
                <ListItem
                    className={classes.first}
                    key={area.id}
                    dense
                    button
                    disableGutters={true}
                    aria-haspopup="true"
                    aria-controls="placesearch"
                    aria-label="Valitse kunta"
                    onClick={() => null}
                    onDoubleClick={() => console.log("DOUBLE CLICK!!")}>
                  <ListItemText key={`listitemtext_${area.id}`} primary={area.name}/>
                  <Chip
                      clickable
                      key={area.id}
                      onDelete={() => this.props.handleCustomAreaDelete(area.id)}
                      color="primary"
                      size="small"
                  />
                </ListItem>
              </div>
            })}

            <TextField
                inputProps={{name: 'customAreaName', id: 'customAreaName'}}
                label={txt.igalod.newCustomArea}
                defaultValue={customAreaName}
                onChange={this.props.changeCustomAreaName}
                classes={{root: classes.text}}>
            </TextField>
          </div>
          <Button color='primary'
                  onClick={() => this.props.saveCustomArea(customAreaName)}>{txt.button.saveNew}</Button>
          <Divider></Divider>
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
