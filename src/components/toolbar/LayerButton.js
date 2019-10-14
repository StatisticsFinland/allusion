import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/icons/Menu';
import Hidden from '@material-ui/core/Hidden';

import { LanguageContext } from './../../App';

const styles = {
    button: {
        position: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1200
    },
    button2: {
        position: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: '1rem',
        left: '16.5rem',
        zIndex: 1200
    },
}

class LayerButton extends Component {

    render() {

        const { classes } = this.props;

        return (
            <LanguageContext.Consumer>{({ txt }) => {
                return (
                    <Hidden xsDown={this.props.alertVisibility}>
                        <Tooltip id="layerButtonTooltip" title={txt.toolbar.layer} placement="bottom-start">
                            <Fab color='primary' onClick={() => this.props.handleClick()} className={this.props.layerDrawerVisibility ? classes.button2 : classes.button}>
                                <Menu />
                            </Fab>
                        </Tooltip>
                    </Hidden>
                )
            }}</LanguageContext.Consumer>
        );

    }
}

export default withStyles(styles)(LayerButton);