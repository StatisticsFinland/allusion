import React, { Component } from "react";
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    paper: {
        marginRight: theme.spacing.unit * 2,
    },
    tooltip: {
        zIndex: 9999
    }
});

class MenuListComposition extends Component {

    state = {
        open: false
    };

    handleClick = language => {
        this.props.changeLanguage(language);
        this.handleToggle();
    }

    handleToggle = () => {
      const isOpen = !this.state.open;
      this.setState({ open: isOpen });
    };

    handleClose = event => {
        if (this.anchorEl.contains(event.target)) { return; }
        this.setState({ open: false });
    };

    handleChange = () => {
        let index = this.props.languages.indexOf(this.props.language);
        this.props.changeLanguage(this.props.languages[index !== this.props.languages.length -1 ? index + 1 : 0]);
    }

    render() {
        const { classes } = this.props;
        const { open } = this.state;

        return (
            <div className={classes.root}>
                <Tooltip id="languageButtonTooltip" title={this.props.txt} placement="bottom-start">
                    <Button
                        buttonRef={node => {
                            this.anchorEl = node;
                        }}
                        aria-owns={open ? 'languageChange' : null}
                        aria-haspopup="true"
                        onClick={this.props.matches ? this.handleToggle : this.handleChange}
                    >
                        {this.props.languages.find(language => language !== this.props.language) /* Customized for IGALOD */} 
                    </Button>
                </Tooltip>
                <Popper open={open} anchorEl={this.anchorEl} transition disablePortal className={classes.tooltip}>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="languageChange"
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={this.handleClose}>
                                    <MenuList>
                                        {this.props.languages.map((language, index) =>
                                            (<MenuItem key={index} onClick={() => this.handleClick(language)}>{language}</MenuItem>)
                                        )}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div >
        );
    }
}

export default withStyles(styles)(MenuListComposition);
