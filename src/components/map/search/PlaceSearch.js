import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  first: {
    marginLeft: theme.spacing.unit * 2
  },
  subItem: {
    marginRight: theme.spacing.unit * 2
  },
  listItem: {
    paddingLeft: 0,
    opacity: 0.5
  }
});

class PlaceSearch extends Component {

  state = {
    open: false,
    subOpen: 0,
    selection: null
  };

  handleClickMenu = () => this.setState({ open: !this.state.open });
  handleClickSubMenu = group => this.state.subOpen === group ? this.setState({ subOpen: 0 }) : this.setState({ subOpen: group });
  handleClickItem = item => {
    this.setState({ selection: item })
    this.props.handleClick(item)
  };

  createMenu = (filter,txt) => {

    const { classes } = this.props;

    let parents = [];

    let rawFeatures = filter.layer.getSource().getFeatures();
    let features = [];
    rawFeatures.map(feature => {
      if (features.findIndex(feat => feat.first === feature.get(filter.first) && feat.second === feature.get(filter.second)) === -1) {
        features.push(
          {
            first: feature.get(filter.first),
            second: feature.get(filter.second)
          }
        )
      }
    });

    let groups = [...new Set(features.map(feature => feature.second))].sort();
    groups.forEach(group => {
      let groupItems = features.filter(feature => feature.second === group);
      groupItems.sort((a, b) => a.first < b.first ? -1 : 1)

      let children = [];

      groupItems.forEach((item, index) => {
        children.push(
          <ListItem
            className={classes.first}
            key={index}
            dense
            button
            disableGutters={true}
            aria-haspopup="true"
            aria-controls="placesearch"
            aria-label="Välja kommune"
            onClick={() => this.handleClickItem(item.first)}>
            <ListItemText primary={item.first} />
          </ListItem>
        )
      })

      parents.push(
        <div key={group}>
          <ListItem
            button
            disableGutters={true}
            aria-haspopup="true"
            aria-controls="indicatorSelector"
            aria-label={'group'}
            onClick={() => this.handleClickSubMenu(group)}>
            <ListItemText primary={group} />
            {this.state.subOpen === group ? <ExpandLess className={classes.subItem}  /> : <ExpandMore className={classes.subItem} />}
          </ListItem>
          <Collapse in={this.state.subOpen === group} timeout="auto" unmountOnExit>
            <List component="div">{children}
            </List>
          </Collapse>
        </div>
      )
    })

    return (
      <div className={classes.root}>
        <div className={classes.listRoot} >
          <ListItem button onClick={this.handleClickMenu} className={classes.listItem}>
            <ListItemText primary={txt.municipality} />
            {this.state.open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit>
            <List component="nav">{parents}
            </List>
          </Collapse>
        </div>
      </div>);
  }

  render() {

    return (
      this.createMenu(this.props.filter, this.props.txt)
    );
  }
}

export default withStyles(styles)(PlaceSearch);