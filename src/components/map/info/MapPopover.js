import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover'
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { isNumeric, formatNum, blackList } from './../../../globals';
import { LanguageContext } from './../../../App';

const styles = theme => ({
    popover: {
        pointerEvents: 'none'
    },
    paper: {
        padding: theme.spacing.unit,
    },
    typography: {
        fontSize: 14,
        color: 'black'
    }
});

class MapPopover extends Component {

    populate = (featureInfo, field = 'all', fieldAliases = null, lan) => {
        let layers = [];
        let content = [];
        const { classes } = this.props;

        featureInfo && featureInfo.map((feature, index) => {
            content.push(
                <div key={`MapPopover_${index}`}>
                    {index !== featureInfo.length - 1 && index !== 0 && !layers.includes(feature.LAYERTITLE) && <Divider></Divider>}
                    {/*layers === [] || !layers.includes(feature.LAYERTITLE) && <Typography variant={'overline'} style={{ textTransform: 'uppercase' }}>{feature.LAYERTITLE}</Typography>*/}
                    {this.props.timeField && this.props.time && index === 0 && <Typography variant={'overline'} style={{ textTransform: 'uppercase' }}>{this.props.timeField}: {this.props.time}</Typography>}
                    {Object.keys(feature).map((key, keyIndex) => {
                        if (key !== 'LAYERTITLE' && key !== this.props.timeField ) {
                          const keyTemp = fieldAliases.find(feat => feat.field === key)

                            const keyText = keyTemp[lan] ? keyTemp[lan] : '';
                          return <Typography
                              classes={{root: classes.typography}}
                              key={`MapPopover_feat_${keyIndex}`}
                              variant={'caption'}><strong> {keyText}: </strong> {isNumeric(feature[key]) ? formatNum(feature[key]) : feature[key]}
                          </Typography>
                        }
                    })}
                    {/*field === 'all' ? Object.keys(feature).map((key, keyIndex) => {
                      if (!blackList.stats.includes(key) && key !== 'landArea') {
                        return <Typography
                            classes={{root: classes.typography}}
                            key={`MapPopover_feat_${key}`}
                            variant={'caption'}><strong> {key}: </strong> {isNumeric(feature[key]) ? formatNum(feature[key]) : feature[key]}
                        </Typography>
                      }
                    }) : <Typography classes={{root: classes.typography}} variant={'caption'}><strong>{field}:</strong> {isNumeric(feature[field]) ? formatNum(feature[field]) : feature[field]}</Typography>*/}
                    {index !== featureInfo.length - 1 && <Divider light style={{ marginTop: 4, marginBottom: 4 }}></Divider>}
                </div>
            )
            !layers.includes(feature.LAYERTITLE) && layers.push(feature.LAYERTITLE);
        })
        return content;
    }

    render() {

        const { classes } = this.props;

        return (
            <LanguageContext.Consumer>{({ lan }) => {
                return (
                    <Popover id="popover"
                        anchorReference="anchorPosition"
                        className={classes.popover}
                        disableRestoreFocus
                        onMouseLeave={this.props.pop}
                        classes={{ paper: classes.paper }}
                        open={this.props.open}
                        anchorPosition={{
                            top: this.props.Y || 0,
                            left: this.props.X || 0
                        }}
                        onClose={this.props.pop}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                    >
                        {this.populate(this.props.featureInfo, this.props.field, this.props.fieldAliases, lan )}
                    </Popover>
                )
            }}
            </LanguageContext.Consumer>
        )
    };
}

export default withStyles(styles)(MapPopover);