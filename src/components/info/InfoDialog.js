import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
// Icons
import Search from '@material-ui/icons/Search';
import Info from '@material-ui/icons/Info';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import TableChart from '@material-ui/icons/TableChart';
import Label from '@material-ui/icons/Label';
import Menu from '@material-ui/icons/Menu';
import {LanguageContext} from './../../App';

const styles = theme => ({
  paper: {
    width: 600,
    minHeight: '25%',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'no-wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 0
  },
  button: {
    marginRight: 10,
    minWidth: 56,
    minHeight: 56
  },
  button2: {
    marginRight: 10,
    minWidth: 56
  },
  button3: {
    marginRight: 18,
  },
  text: {
    textAlign: 'left',
    paddingTop: 7,
    cursor: 'pointer'
  },
  text2: {
    textAlign: 'left'
  },
  topList: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  addButton: {
    width: 200,
    justifyContent: 'flex-start',
    height: 40,
    padding: 0
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  }
});

const TabContainer = props => {
  return (
      <Typography component="div" style={{paddingTop: 20}}>
        {props.children}
      </Typography>
  );
};

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};


class infoDialog extends React.Component {

  state = {
    value: 0,
    loginDummy: false,
    level1Open: 0,
    level2Open: 0
  };

  handleChange = (event, value) => {
    this.setState({value});
  };

  handleLevel1 = value => {
    this.setState({level1Open: value})
  };

  handleLevel2 = value => {
    this.setState({level2Open: value})
  };

  toggle = () => {
    this.setState({loginDummy: !this.state.loginDummy})
  };

  createInfo = (value, txt) => {

    const {classes} = this.props;
    let contents = [];

    switch (value) {
      case 0:
        contents.push(
            <div>
              <Typography key={'child0'}>{txt.igalod.generalInfo}</Typography><br></br>
              <Typography key={'child1'}>
                <a href="https://tk-d-igalod-cont-1.azurewebsites.net/igalod/query">https://tk-d-igalod-cont-1.azurewebsites.net/igalod/query</a><br></br>
                <a href="http://193.167.189.160/igalod/fuseki/ds/query">http://193.167.189.160/igalod/fuseki/ds/query</a><br></br>
                <a href="https://pxnet2.stat.fi/PXWeb/api/v1/fi/Kuntien_avainluvut">https://pxnet2.stat.fi/PXWeb/api/v1/fi|en|sv/Kuntien_avainluvut</a>
              </Typography><br></br>
              <Typography key={'child2'}>{txt.igalod.developedBy}</Typography><br></br>
              <Typography key={'child2'}>{txt.igalod.funding}</Typography><br></br>
              <Typography key={'child2'}>{txt.igalod.feedback} <a
                  href={`mailto:${txt.igalod.feedbackEmail}`}>{txt.igalod.feedbackEmail}</a></Typography>
            </div>
        );
        break;
      case 1:
        contents.push(
            <List component='nav' key={'child3'} disablePadding>
              <ListItem disableGutters button onClick={() => this.handleLevel1(0)} className={classes.topList}>
                <Typography variant={'subtitle1'}>{txt.infoDialog.generalTools}</Typography>
                {this.state.level1Open === 0 ? <ExpandLess/> : <ExpandMore/>}
              </ListItem>
              <Collapse in={this.state.level1Open === 0} timeout="auto" unmountOnExit>
                <List component='div'>
                  <ListItem className={classes.item} disableGutters>
                    <Fab color='primary' className={classes.button}><Menu/></Fab>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <Typography className={classes.text2}>{txt.infoDialog.naviMenu}</Typography>
                      <List component='div'>
                        <ListItem className={classes.item} disableGutters>
                          <Typography className={classes.text2}>{txt.infoDialog.naviMenuStep1}</Typography><br></br>
                        </ListItem>
                        <ListItem className={classes.item} disableGutters>
                          <Typography className={classes.text2}>{txt.infoDialog.naviMenuStep2}</Typography><br></br>
                        </ListItem>
                        <ListItem className={classes.item} disableGutters>
                          <Typography className={classes.text2}>{txt.infoDialog.naviMenuStep3}</Typography><br></br>
                        </ListItem>
                        <ListItem className={classes.item} disableGutters>
                          <Typography className={classes.text2}>{txt.infoDialog.naviMenuStep4}</Typography><br></br>
                        </ListItem>
                        <ListItem className={classes.item} disableGutters>
                          <Typography className={classes.text2}>{txt.infoDialog.naviMenuStep5}</Typography><br></br>
                        </ListItem>
                      </List>
                    </div>
                  </ListItem>
                  <ListItem className={classes.item} disableGutters>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <IconButton className={classes.button3}><AddIcon/></IconButton>
                      <IconButton className={classes.button3}><RemoveIcon/></IconButton>
                    </div>
                    <Typography className={classes.text2}><br/>{txt.infoDialog.naviZoom}</Typography>
                  </ListItem>
                </List>
              </Collapse>

              <ListItem disableGutters button onClick={() => this.handleLevel1(1)} className={classes.topList}>
                <Typography variant={'subtitle1'}>
                  {this.state.level1Open === 1 ? txt.infoDialog.naviToolbar : txt.infoDialog.naviToolbarSimple}
                </Typography>
                {this.state.level1Open === 1 ? <ExpandLess/> : <ExpandMore/>}
              </ListItem>
              <Collapse in={this.state.level1Open === 1} timeout="auto" unmountOnExit>
                <List component='div'>
                  <ListItem className={classes.item} disableGutters>
                    <Button className={classes.button2} size='small'><Search/></Button>
                    {this.state.level2Open !== 3 ?
                        <ListItem button disableGutters className={classes.text} onClick={() => this.handleLevel2(3)}>
                          {txt.infoDialog.naviSearchTop}
                        </ListItem> :
                        <Collapse in timeout="auto" unmountOnExit>
                          <Typography className={classes.text}>{txt.infoDialog.naviSearch}</Typography>
                        </Collapse>
                    }
                  </ListItem>
                  <ListItem className={classes.item} disableGutters>
                    <Button className={classes.button2} size='small'>EN<br/>FI</Button>
                    {this.state.level2Open !== 4 ?
                        <ListItem button disableGutters className={classes.text} onClick={() => this.handleLevel2(4)}>
                          {txt.infoDialog.naviLangTop}
                        </ListItem> :
                        <Collapse in timeout="auto" unmountOnExit>
                          <Typography className={classes.text}>{txt.infoDialog.naviLang}</Typography>
                        </Collapse>
                    }
                  </ListItem>
                  <ListItem className={classes.item} disableGutters>
                    <Button className={classes.button2} size='small'><TableChart/></Button>
                    {this.state.level2Open !== 5 ?
                        <ListItem button disableGutters className={classes.text} onClick={() => this.handleLevel2(5)}>
                          {txt.infoDialog.naviTableTop}
                        </ListItem> :
                        <Collapse in timeout="auto" unmountOnExit>
                          <Typography className={classes.text}>{txt.infoDialog.naviTable}</Typography>
                        </Collapse>
                    }
                  </ListItem>
                  <ListItem className={classes.item} disableGutters>
                    <Button className={classes.button2} size='small'><Info/></Button>
                    {this.state.level2Open !== 6 ?
                        <ListItem button disableGutters className={classes.text} onClick={() => this.handleLevel2(6)}>
                          {txt.infoDialog.naviInfoTop}
                        </ListItem> :
                        <Collapse in timeout="auto" unmountOnExit>
                          <Typography className={classes.text}>{txt.infoDialog.naviInfo}</Typography>
                        </Collapse>
                    }
                  </ListItem>
                  <ListItem className={classes.item} disableGutters>
                    <Button className={classes.button2} size='small'><Label/></Button>
                    {this.state.level2Open !== 7 ?
                        <ListItem button disableGutters className={classes.text} onClick={() => this.handleLevel2(7)}>
                          {txt.infoDialog.naviLabelsTop}
                        </ListItem> :
                        <Collapse in timeout="auto" unmountOnExit>
                          <Typography className={classes.text}>{txt.infoDialog.naviLabels}</Typography>
                        </Collapse>
                    }
                  </ListItem>
                </List>
              </Collapse>
            </List>);
        break;
      case 2:
        contents.push(
            <List component='div'>
              <ListItem className={classes.item} disableGutters>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <IconButton className={classes.button3}><TableChart/></IconButton>
                </div>
                <Typography className={classes.text2}
                            style={{marginTop: 16}}>{txt.infoDialog.selection}</Typography><br></br>
              </ListItem>
              <ListItem className={classes.item} disableGutters>
                <Typography className={classes.text2}>{txt.infoDialog.step1}</Typography><br></br>
              </ListItem>
              <ListItem className={classes.item} disableGutters>
                <Typography className={classes.text2}>{txt.infoDialog.step2}</Typography><br></br>
              </ListItem>
              <ListItem className={classes.item} disableGutters>
                <Typography className={classes.text2}>{txt.infoDialog.step3a}</Typography><br></br>
              </ListItem>
              <ListItem className={classes.item} disableGutters>
                <Typography className={classes.text2}>{txt.infoDialog.step3b}</Typography><br></br>
              </ListItem>
              <ListItem className={classes.item} disableGutters>
                <Typography className={classes.text2}>{txt.infoDialog.step4}</Typography><br></br>
              </ListItem>
            </List>);

      default:
        break;
    }
    return <TabContainer>{contents}</TabContainer>;
  };

  render() {

    const {classes} = this.props;
    const {value} = this.state;

    return (
        <LanguageContext.Consumer>{({txt}) => {
          return (
              <div>
                <Dialog
                    classes={{paper: classes.paper}}
                    open={this.props.infoDialogVisibility}
                    onClose={this.props.toggleInfo}
                    aria-labelledby="infoDialogTitle"
                    disableRestoreFocus={true}
                >
                  <DialogTitle id="infoDialogTitle">{txt.infoDialog.title}</DialogTitle>
                  <DialogContent>
                    <div className={classes.root}>
                      <AppBar position="static" color="primary">
                        <Tabs value={value} onChange={this.handleChange}>
                          <Tab label={txt.infoDialog.generalTitle}/>
                          <Tab label={txt.infoDialog.navigationTitle}/>
                          <Tab label={txt.infoDialog.table}/>
                        </Tabs>
                      </AppBar>
                      {this.createInfo(value, txt)}
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => {
                      this.props.toggleInfo()
                    }} color="primary">{txt.button.close}</Button>
                  </DialogActions>
                </Dialog>
              </div>
          )
        }}</LanguageContext.Consumer>
    );
  }

}

export default withStyles(styles)(infoDialog)