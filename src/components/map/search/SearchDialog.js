import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider'
import PlaceSearch from './PlaceSearch';
import AddressSearch from './AddressSearch';

import { LanguageContext } from './../../../App';

const styles = {
    paper: {
        minWidth: '20%',
        minHeight: '25%',
    }
}

class SeachDialog extends Component {

    render() {

        const { classes } = this.props;

        return (
            <LanguageContext.Consumer>{({ txt }) => {
                return (
                    <div>
                        <Dialog
                            classes={{ paper: classes.paper }}
                            open={this.props.searchDialogVisibility}
                            aria-labelledby="searchDialogTitle"
                            disableRestoreFocus={true}
                            onClose={this.props.toggleSearch}>
                            <DialogContent>
                                <PlaceSearch
                                    handleClick={this.props.handleClick}
                                    filter={this.props.filter}
                                    txt={txt.searchDialog}
                                />
                                <Divider /><br />

                                <DialogContentText
                                    id="searchDialogDescription"
                                    style={{ userSelect: 'none' }}
                                >
                                    {txt.searchDialog.address}
                                </DialogContentText>
                                <AddressSearch
                                    handleClick={this.props.handleClick}
                                    txt={txt.searchDialog}
                                />

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => { this.props.toggleSearch() }}
                                    color="primary">
                                    {txt.button.cancel}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                )
            }}</LanguageContext.Consumer>
        );
    }

}

export default withStyles(styles)(SeachDialog)
