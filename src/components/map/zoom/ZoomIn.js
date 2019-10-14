import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

const styles = {
  button: {
    display: 'flex',
    right: '0.5rem',
    top: '12rem',
    position: 'fixed',
    zIndex: 1500
  }
}

function ZoomIn(props) {
  const { classes } = props;
  return (
    <IconButton className={classes.button} onClick={() => props.handleClick()}>
      <AddIcon />
    </IconButton>
  );
}

ZoomIn.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ZoomIn);
