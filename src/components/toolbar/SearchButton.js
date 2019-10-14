import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Search from '@material-ui/icons/Search';

export default class SearchButton extends Component {

    render() {
        return (
            <div>
                <Tooltip id="searchButtonTooltip" title={this.props.txt} placement="bottom-start">
                    <Button size='small' onClick={() => this.props.handleClick()}>
                        <Search />
                    </Button>
                </Tooltip>
            </div>
        );
    }
}