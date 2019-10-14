import React from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import SearchButton from './SearchButton';
import InfoButton from './InfoButton';
import LanguageButton from './LanguageButton';
import TableButton from './TableButton';
import LabelButton from './LabelButton';
import Hidden from '@material-ui/core/Hidden';


/*import { UserContext } from '../../App';*/
import { LanguageContext } from './../../App';

const styles = theme => ({
    paper: {
        overFlowY: 'hidden',
        overFlowX: 'hidden',
        position: 'fixed',
        alignItems: 'center',
        background: 'none',
        border: 'none',
        height: 'auto',
        maxHeight: '-webkit-fit-content',
        maxHeight: '-moz-fit-content',
        maxHeight: 'fit-content',
        top: '1rem',
        justifyContent: 'center',
        [theme.breakpoints.up('xs')]: {
            flexDirection: 'column'
        },
        [theme.breakpoints.only('xs')]: {
            flexDirection: 'row'
        },
    }
})

function Toolbar(props) {

    const { classes } = props;
    const matches = useMediaQuery('(min-width:600px)');

    return (
        <LanguageContext.Consumer>{({ txt }) => {
            return (
                <Hidden xsDown={props.layerDrawerVisibility}>
                    <Drawer variant='persistent' anchor={matches ? 'right' : 'top'} open={props.toolbarVisibility} classes={{ paper: classes.paper }}>
                        <SearchButton txt={txt.toolbar.search} handleClick={() => props.toggleSearch()} />
                        <LanguageButton txt={txt.toolbar.language}
                            languages={props.languages}
                            language={props.language}
                            changeLanguage={props.changeLanguage}
                            matches={matches}
                        >
                        </LanguageButton>
                        <TableButton txt={txt.toolbar.table} handleClick={() => props.toggleTable()} tableEnabled={props.tableEnabled} />
                        <InfoButton txt={txt.toolbar.info} handleClick={() => props.toggleInfo()} />
                        <LabelButton txt={props.labels ? txt.toolbar.hideLabels : txt.toolbar.showLabels} labels={props.labels} handleClick={() => props.toggleLabels()} enabled={props.tableEnabled} ></LabelButton>
                        <br></br>

                    </Drawer>
                </Hidden>
            )
        }}</LanguageContext.Consumer>
    );
}

export default withStyles(styles)(Toolbar)
