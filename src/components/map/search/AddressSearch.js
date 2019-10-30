import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Search from '@material-ui/icons/Search';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
});

const API = 'http://api.digitransit.fi/geocoding/v1/autocomplete';

class AddressSearch extends Component {

  state = {
    hits: [],
    inputFieldValue: ''
  };

  button = undefined;

  handleChange = event => {
    this.setState({inputFieldValue: event.target.value});
  };

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleSubmit(event);
    }
  };

  handleSubmit = event => {
    if (this.state.inputFieldValue && this.state.inputFieldValue !== '') {
      fetch(`${API}?text=${this.state.inputFieldValue}`)
          .then(response => response.json())
          .then(data => this.setState({hits: data.features}));
      event.preventDefault();
    }
  };

  render() {

    const {classes} = this.props;

    return (

        <div className={classes.root}>

          <form autoComplete="off">
            <FormControl>
              <InputLabel htmlFor="address">{this.props.txt.typein}</InputLabel>
              <Input
                  id="address"
                  type='text'
                  value={this.state.inputFieldValue}
                  onChange={this.handleChange}
                  onKeyPress={this.handleKeyPress}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                          aria-label="Search for address"
                          onClick={this.handleSubmit}
                      >
                        <Search/>
                      </IconButton>
                    </InputAdornment>
                  }
              />
            </FormControl>
          </form>

          <List component="ul" dense={false} disablePadding={true}>
            {this.state.hits.map((element, index) =>
                <ListItem
                    key={index}
                    disableGutters={true}
                    button
                    aria-haspopup="true"
                    aria-controls="addresssearch"
                    aria-label="Search for address"
                    onClick={e => this.props.handleClick(element.geometry.coordinates, 'address')}
                >
                  <ListItemText primary={element.properties.name}/>
                </ListItem>
            )}
          </List>
        </div>

    );
  }
}

export default withStyles(styles)(AddressSearch);