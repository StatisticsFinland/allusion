import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { categoryLimit, formatNum, separateThousands } from './../../globals';
import { LanguageContext } from '../../App';
import CircularProgress from '@material-ui/core/CircularProgress'

const styles = theme => ({
  typography: {
    minWidth: 100,
    marginBottom: theme.spacing.unit / 2
  },
  legend: {
    background: 'white',
    borderRadius: '12.5px',
    padding: '12.5px',
    position: 'fixed',
    top: '1rem',
    marginBottom: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 200
  },
  avatar: {
    marginTop: theme.spacing.unit / 2,
    width: theme.spacing.unit * 1.5,
    height: theme.spacing.unit * 1.5,
  },
  typoRoot: {
    maxWidth: 150,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  rlSlot: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginRight: theme.spacing.unit
  },
  lrSlot: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginRight: theme.spacing.unit
  },
});

class Legend extends Component {

  /* Function for formatting categorical / quantitative value */
  formatValue = (value) => {
    const styling = this.props.selectedLayer.style.styling;
    if (styling === 'categorical') {
      return value;
    } else if (styling === 'quantitative') {
      return `${separateThousands(formatNum(value.lowerBound, 1))} - ${separateThousands(formatNum(value.upperBound, 1))}`;
    }
  };

  /* Helper function for creating Legend's DOM tree */
  createLegend(layer, opacity = 1, direction, id, lan) {

    const { classes, fieldAliases } = this.props;

    if (layer && layer !== null) {
      const dir = (direction === 'left-to-right') ? 'lr' : (direction === 'right-to-left') ? 'rl' : 'lr';
      const style = layer.style;
      if (style) {

        let fieldValues, fill;
        if (style.styling === 'quantitative' && Array.isArray(style.fieldValues)) {
          fieldValues = style.fieldValues.slice().reverse();
          fill = Array.isArray(style.fill) ? style.fill.slice().reverse() : style.fill;
        }

        const layerLegend = (
          <div key={id} id={id} className={classes.legend} style={{ left: this.props.layerDrawerVisibility ? '16.5rem' : '1rem' }}>
            <Typography className={classes.typography} variant="body2"> {fieldAliases.find(alias => alias.field === this.props.variable) ? fieldAliases.find(alias => alias.field === this.props.variable)[lan] : this.props.variable} <br></br> {!['Ei tilastoa', 'No statistics', 'Ei tilastoa_km2', 'No statistics_km'].includes(this.props.selectedLayer.style.fieldSelection) && this.props.statisticYear}</Typography>
            {style.fieldUnit && style.fieldUnit !== '' && <Typography className={classes.typography} variant="body1"> ({style.fieldUnit}) </Typography>}
            <div>
              {(style.styling === 'single') && (
                <Avatar
                  classes={{ root: classes.avatar }}
                  style={{
                    "background": style.fillVisibility ? style.fill : 'none',
                    "borderColor": style.strokeVisibility ? style.stroke : 'none',
                    "borderStyle": style.strokeVisibility ? 'solid' : 'hidden',
                    "borderWidth": style.strokeVisibility ? style.strokeWidth : 'none',
                    "opacity": opacity
                  }}
                />
              )}
              {style.styling === 'quantitative' &&
                fieldValues.map((value, i) => {
                  return (
                    <div key={`${style.styling}${i}lr`} className={classes[`${dir}Slot`]}>
                      <Avatar classes={{ root: classes.avatar }} style={{ "background": `${fill[i]}`, opacity: opacity }}></Avatar>
                      <Typography variant="body1" classes={{ root: classes.typoRoot }} style={{ textAlign: dir === 'lr' ? 'left' : 'right' }}> {this.formatValue(value)} </Typography>
                    </div>
                  )
                })
              }
              {style.styling === 'categorical' &&
                style.fieldValues.map((value, i) => {
                  if (i < categoryLimit) {
                    return (
                      <div key={`${style.styling}${i}lr`} className={classes[`${dir}Slot`]}>
                        <Avatar classes={{ root: classes.avatar }} style={{ "background": `${style.fill[i]}`, opacity: opacity }}></Avatar>
                        <Typography variant="body1" classes={{ root: classes.typoRoot }} style={{ textAlign: dir === 'lr' ? 'left' : 'right' }}> {this.formatValue(value)} </Typography>
                      </div>
                    )
                  }
                })
              }
              {style.styling === 'categorical' && style.fieldValues.length >= categoryLimit - 1 && <Typography variant="body1">...</Typography>}
            </div>
          </div>
        );
        if (this.props.loading) {
          return <div key={id} id={id} className={classes.legend} style={{ left: this.props.layerDrawerVisibility ? '16.5rem' : '1rem' }}>
            <CircularProgress style={{ position: 'relative' }}></CircularProgress></div>
        } else {
          return layerLegend;
        }
      } else {
        return <div></div>
      }
    }
  };


  render() {
    return (
      <LanguageContext.Consumer>{({ lan }) => {
        return (
          this.createLegend(this.props.selectedLayer, this.props.opacity, this.props.direction, this.props.id, lan)
        )
      }}</LanguageContext.Consumer>
    )
  };
}

export default withStyles(styles)(Legend);
