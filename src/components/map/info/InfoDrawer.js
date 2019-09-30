import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import {blackList, formatNum, getSorting, isNumeric, separateThousands, stableSort} from '../../../globals';
import Drawer from '@material-ui/core/Drawer';
import {LanguageContext} from './../../../App';
import {max, mean, median, min, sum} from 'simple-statistics'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  paper: {
    zIndex: 9999,
    maxWidth: '75vw',
    overflowY: 'auto',
    opacity: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  paperCDTM: {
    width: 'calc(100vw - 432px)',
  },
  paperCDTMuser: {
    width: 'calc(100vw - 452px)',
  },
  paperSmall: {
    width: '33vw'
  },
  anchorTop: {
    right: 0,
    left: 'auto',
    height: '33vh'
  },
  featureTable: {
    marginLeft: theme.spacing.unit * 2,
    width: '60%',
    minWidth: 400,
    overflowX: 'auto',
  },
  statisticTable: {
    marginLeft: theme.spacing.unit,
    minWidth: 400,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overFlowX: 'hidden'
  },
  statTypo: {
    fontWeight: 800
  },
  tableCell: {
    fontSize: '0.75rem',
    padding: '4px 4px 4px 4px'
  },
  tableCellHead: {
    fontSize: '0.75rem'
  },
  tableCellHead2: {
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: '0.75rem',
  },
  tableCellHead3: {
    fontSize: '0.75rem',
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper
  },

  tableRow: {
    height: 32
  }
});

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {

    const {order, orderBy, rows, classes, fieldAliases, lan} = this.props;

    return (
        <TableHead classes={{root: classes.featureTableHeader}}>
          <TableRow>
            {rows.map(
                (row, index) => (
                    <TableCell
                        key={index}
                        align={index === 0 ? 'left' : 'right'}
                        padding={index !== rows.length - 1 ? 'none' : 'dense'}
                        sortDirection={order || false}
                        classes={{root: classes.tableCellHead3}}
                    >
                      {index !== 0 ?
                          <Tooltip
                              title="Sort"
                              placement='bottom-end'
                              enterDelay={300}
                          >
                            <TableSortLabel
                                active={orderBy === row}
                                direction={order}
                                hideSortIcon={true}
                                onClick={this.createSortHandler(row)}
                            >
                              {fieldAliases.some(alias => alias.field === row) ? fieldAliases.find(alias => alias.field === row)[lan] : row}
                            </TableSortLabel>
                          </Tooltip>
                          : <TableSortLabel style={{fontWeight: 800, textTransform: 'uppercase'}}>
                            {row}
                          </TableSortLabel>
                      }
                    </TableCell>
                ),
                this,
            )}
          </TableRow>
        </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number,
  rows: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired
};

class InfoDrawer extends Component {

  state = {
    order: 'asc',
    orderBy: ''
  };

  handleRequestSort = (event, property) => {

    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({order, orderBy});
  };

  createStatisticTable = (featureInfo, txt, statistics = ['sum', 'min', 'max', 'mean', 'median'], field = 'all', lan) => {

    const {classes, fieldAliases} = this.props;
    let stats = [];

    let statKeys = field === 'all' ? Object.keys(featureInfo[0]).filter(key => !blackList.stats.includes(key)) : [field];

    statKeys.map(key => {
      let allValues = featureInfo.map(feature => {
        return isNumeric(feature[key]) ? parseFloat(formatNum(feature[key], 4)) : null;
      });
      stats.push({
        field: fieldAliases.some(alias => alias.field === key) ? fieldAliases.find(alias => alias.field === key)[lan] : key,
        sum: sum(allValues),
        min: min(allValues),
        max: max(allValues),
        mean: mean(allValues),
        median: median(allValues)
      })
    });

    return (
        <Paper className={classes.statisticTable} elevation={0}>
          <Table padding={'dense'}>
            <TableHead>
              <TableRow>
                {[`${txt.mapInfo.stats}\n${this.props.statisticYear}`, ...statistics].map((item, index) => {
                      if (index === 0) {
                        return <TableCell style={{fontWeight: 800, textTransform: 'uppercase'}} padding='none'
                                          key={item}>{item}</TableCell>
                      } else {
                        return <TableCell classes={{root: classes.tableCell}} align="right"
                                          key={item}>{txt.charts[item]}</TableCell>
                      }
                    }
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map(stat => {
                return (
                    <TableRow key={stat.field} hover classes={{root: classes.tableRow}}>
                      <TableCell classes={{root: classes.tableCellHead}} padding='none' component="th"
                                 scope="row">{stat.field}</TableCell>
                      {statistics.includes('sum') && <TableCell classes={{root: classes.tableCell}}
                                                                align="right">{!stat.field.includes(' km2') ? isNumeric(stat.sum) ? separateThousands(formatNum(stat.sum, 0)) : '' : ''}</TableCell>}
                      {statistics.includes('min') && <TableCell classes={{root: classes.tableCell}}
                                                                align="right">{isNumeric(stat.min) ? separateThousands(formatNum(stat.min, 0)) : ''}</TableCell>}
                      {statistics.includes('max') && <TableCell classes={{root: classes.tableCell}}
                                                                align="right">{isNumeric(stat.max) ? separateThousands(formatNum(stat.max, 0)) : ''}</TableCell>}
                      {statistics.includes('mean') && <TableCell classes={{root: classes.tableCell}}
                                                                 align="right">{isNumeric(stat.mean) ? separateThousands(formatNum(stat.mean, 0)) : ''}</TableCell>}
                      {statistics.includes('median') && <TableCell classes={{root: classes.tableCell}}
                                                                   align="right">{isNumeric(stat.median) ? separateThousands(formatNum(stat.median, 0)) : ''}</TableCell>}
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Button style={{maxWidth: 75, margin: '8px 8px 8px 0px'}} onClick={() => {
            this.props.toggleInfoDrawer()
          }} color="primary">{txt.button.close}</Button>
        </Paper>
    )
  };

  createFeatureTable = (featureInfo, txt, field = 'all', lan) => {
    const {classes, fieldAliases} = this.props;
    const {order, orderBy} = this.state;

    let statHeaders = Object.keys(featureInfo[0]).filter(key => blackList.stats.includes(key) && ![this.props.timeField, 'LAYERTITLE', 'municipalityCode', 'regionCode', 'regionNUTS', 'areaCode', 'areaNUTS'].includes(key));

    let statKeys = field === 'all' ? Object.keys(featureInfo[0]).filter(key => !blackList.stats.includes(key)) : [field];

    let rows = stableSort(featureInfo, getSorting(order, orderBy)).map((n, index) => {
      return (
          <TableRow hover key={index}>
            <TableCell classes={{root: classes.tableCellHead2}} padding='none' component="th"
                       scope="row">{statHeaders.map((header, i) => {
              return <span key={header}>{n[header]}{i !== statHeaders.length - 1 && ', '}</span>
            })}</TableCell>
            {statKeys.map((key, keyIndex) =>
                <TableCell classes={{root: classes.tableCell}} align="right" key={`InfoDrawer_feat_${keyIndex}`}>
                  {isNumeric(n[key]) ? separateThousands(parseFloat(formatNum(n[key]))) : n[key]}
                </TableCell>
            )}
          </TableRow>
      );
    });

    return (
        <Paper className={classes.featureTable} elevation={0}>
          <Table className={classes.table} padding={'dense'}>
            <EnhancedTableHead
                // numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                // onSelectAllClick={this.handleSelectAllClick}
                onRequestSort={this.handleRequestSort}
                // rowCount={data.length}
                rows={[txt.mapInfo.selected, ...statKeys]}
                classes={classes}
                fieldAliases={fieldAliases}
                lan={lan}
            />
            <TableBody>{rows}</TableBody>
          </Table>
        </Paper>
    )
  };

  populate = (featureInfo, txt) => {
    let layers = [];
    let content = [];
    const {classes} = this.props;

    featureInfo && featureInfo.map((feature, index) => {


      content.push(
          <div key={`InfoDrawer_${index}`} className={classes.infodiv}>
            {index !== featureInfo.length - 1 && index !== 0 && !layers.includes(feature.LAYERTITLE) &&
            <Divider></Divider>}
            {layers === [] || !layers.includes(feature.LAYERTITLE) && <Typography
                variant='overline'><strong>{feature.LAYERTITLE}</strong>{this.props.timeField && this.props.time && index === 0 && `(${this.props.timeField}: ${this.props.time})`}
            </Typography>}
            <Divider style={{width: '100vw', position: 'absolute'}}/>

          </div>
      );
      !layers.includes(feature.LAYERTITLE) && layers.push(feature.LAYERTITLE);
    });
    return content;
  };

  render() {

    const {classes} = this.props;

    let paperStyle = null;
    if (!this.props.field || this.props.field === 'all') {
      if (this.props.chartVisibility) {
        if (this.props.user) {
          paperStyle = [classes.paper, classes.paperCDTMuser].join(' ');
        } else {
          paperStyle = [classes.paper, classes.paperCDTM].join(' ');
        }
      } else if (this.props.timeVisibility) {
        paperStyle = [classes.paper, classes.paperCDTM].join(' ');
      }
    } else {
      paperStyle = [classes.paper, classes.paperSmall].join(' ');
    }


    return (
        <LanguageContext.Consumer>{({txt, lan}) => {
          return (
              <div>
                <Drawer
                    classes={{
                      paper: paperStyle || classes.paper,
                      docked: paperStyle || classes.paper,
                      paperAnchorDockedTop: classes.anchorTop,
                      paperAnchorTop: classes.anchorTop
                    }}
                    variant='persistent'
                    anchor='top'
                    open={this.props.open}>
                  {this.createStatisticTable(this.props.featureInfo, txt, this.props.statistics, this.props.field, lan)}
                  {this.createFeatureTable(this.props.featureInfo, txt, this.props.field, lan)}
                </Drawer>
              </div>
          )
        }}</LanguageContext.Consumer>
    );
  }
}

export default withStyles(styles)(InfoDrawer);