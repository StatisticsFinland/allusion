import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';

const styles = {
  button: {
    display: 'flex',
    top: '14.5rem',
    right: '0.5rem',
    position: 'fixed',
    zIndex: 1500
  }
}

function ZoomOut(props) {
  const { classes } = props;
  return (
    <IconButton className={classes.button} onClick={() => props.handleClick()}>
      <RemoveIcon />
    </IconButton>
  );
}

ZoomOut.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ZoomOut);