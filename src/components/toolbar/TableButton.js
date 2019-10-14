import React from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import TableChart from '@material-ui/icons/TableChart';

export default function ChartButton(props) {
    return (
        <Tooltip id="chartButtonTooltip" title={props.txt} placement="bottom-start">
            <div>
                <Button size='small' onClick={() => props.handleClick()} disabled={!props.tableEnabled}>
                    <TableChart />
                </Button>
            </div>
        </Tooltip>
    );
}