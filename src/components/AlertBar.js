import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import { AlertContext } from '../App';

export default function AlertBar(props) {
    return (
        <AlertContext.Consumer>
            {alert => {
                return (
                    <Snackbar
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        open={props.alertVisibility}
                        autoHideDuration={5000}
                        onClose={props.alertClose}
                        snackbarcontentprops={{ 'aria-describedby': 'alert' }}
                        action={<Button color="secondary" size="small" onClick={props.alertClose}>OK</Button>}
                        message={<span id="alert">{alert}</span>}
                    />
                )
            }}
        </AlertContext.Consumer>
    );
}
