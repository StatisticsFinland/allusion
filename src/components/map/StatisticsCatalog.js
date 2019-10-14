import React, { Component } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';

const styles = theme => ({
  radios: {
    padding: '8px'
  },
  inputPadding: {
    paddingBottom: '15px'
  },
  labelPadding: {
    paddingLeft: '4px'
  }
});

class StatisticsCatalog extends Component {

  state = {
    statisticCode: 'NONE'
  };

  handleRadioChange = (event) => {
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.props.handleStatisticSelection(this.state.statisticCode);
    });
  };

  render() {

    const { classes, statistics, statisticYear, statisticYears, txt } = this.props;

    return (
      <FormControl classes={{ root: classes.inputPadding }}>
        <TextField
          select
          label={txt.igalod.statYear}
          inputProps={{ name: 'statyear', id: 'statyear' }}
          value={statisticYear}
          onChange={this.props.handleChangeStatisticYear}
        >
          {statisticYears && statisticYears.length !== 0 && statisticYears.map(year => {
            return <MenuItem key={year} value={year} >{year}</MenuItem>
          })}
        </TextField>
        <br></br>
        <FormControlLabel
          control={
            <Switch checked={this.props.relativeToArea} disabled={!this.props.selectedLayer || this.state.statisticCode === 'NONE'} onChange={() => this.props.relateToArea()} />
          }
          label={txt.igalod.relative}
        />
        <RadioGroup
          aria-label='statisticCode'
          name='statisticCode'
          value={this.state.statisticCode}
          onChange={this.handleRadioChange}>
          {statistics && statistics.length !== 0 && statistics.map(stat => {
            return (<FormControlLabel key={stat.code} value={stat.code} control={<Radio classes={{ root: classes.radios }} />} label={stat.text} />);
          })}
        </RadioGroup>
      </FormControl>
    );
  };
};

export default withStyles(styles)(StatisticsCatalog);
