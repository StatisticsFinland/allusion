import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/lab/Slider';

import Basemaps from './basemaps/Basemaps';

const styles = theme => ({
  root: {
    marginBottom: theme.spacing.unit * 2
  },
  track: {
    backgroundColor: theme.palette.slider
  },
  thumb: {
    backgroundColor: theme.palette.slider
  }
})

class BasemapControl extends Component {

  render() {

    const { classes } = this.props;

    return (
      <div>
        <FormControl component="fieldset" required classes={{ root: classes.root }}>
          <RadioGroup
            value={this.props.basemap}
            onChange={this.props.changeBasemap}>
            {Basemaps.map(item => <FormControlLabel key={item.name} value={item.name} control={<Radio />} label={item.title} />)}
          </RadioGroup>
        </FormControl>
        <Slider
          classes={{ track: classes.track, thumb: classes.thumb }}
          value={this.props.basemapOpacity}
          onChange={this.props.changeBasemapOpacity}
          min={0}
          max={1}
        />
      </div>
    );
  }
}

export default withStyles(styles)(BasemapControl)