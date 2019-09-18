import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Chip from "@material-ui/core/Chip";
import Button from '@material-ui/core/Button';

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
  }
});

class SavedAreaCatalog extends Component {

  render() {

    const {classes, savedAreas, areaName, txt} = this.props;

    return (
        <div>
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
