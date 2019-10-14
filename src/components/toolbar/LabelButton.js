import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Label from '@material-ui/icons/Label';
import LabelOff from '@material-ui/icons/LabelOff';

export default class LabelButton extends Component {

    render() {
        return (
            <div>
                <Tooltip id="infoButtonTooltip" title={this.props.txt} placement="bottom-start">
                    <Button size='small' onClick={() => this.props.handleClick()} disabled={!this.props.enabled}>
                        {this.props.labels ? <LabelOff/> : <Label/>}
                    </Button>
                </Tooltip>
            </div>
        );
    }
}