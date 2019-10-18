import React, {Component} from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    progress: {
        position: 'fixed',
        top: '1rem',
        left: '16.5rem',
        zIndex: 1999
    },
    progressDrawerInvisible: {
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 1999
    },
    progress2: {
        position: 'relative'
    }
});

class Spinner extends Component {
    render() {
        const { classes } = this.props;
        return (
            <CircularProgress
                className={this.props.layerDrawerVisibility ? classes.progress : classes.progressDrawerInvisible}/>
        )
    }
}

export default withStyles(styles)(Spinner);