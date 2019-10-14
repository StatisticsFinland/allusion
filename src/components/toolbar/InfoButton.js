import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Info from '@material-ui/icons/Info';

export default class InfoButton extends Component {

    render() {
        return (
            <div>
                <Tooltip id="infoButtonTooltip" title={this.props.txt} placement="bottom-start">
                    <Button size='small' onClick={() => this.props.handleClick()}>
                        <Info />
                    </Button>
                </Tooltip>
            </div>
        );
    }
}