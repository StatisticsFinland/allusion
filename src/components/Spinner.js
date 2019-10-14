import React, { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    progress: {
        position: 'fixed',
        top: '1rem',
        right: '1rem',
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
            <CircularProgress thickness={5} className={this.props.container ? classes.progress2 : classes.progress} />
        )
    }
}

export default withStyles(styles)(Spinner);